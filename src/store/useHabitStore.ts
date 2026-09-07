import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { Habit, ValueMap } from './habits';
import { seedHabits, DEFAULT_REMINDER_TIME } from './habits';

const KEY_V2 = '@habit-tracker/v2';
const KEY_V1 = '@habit-tracker/v1';

// 说明：jest(node) 环境下 window.localStorage 不存在，
// 测试文件用 jest.mock 拦截 AsyncStorage（见 useHabitStore.test.ts 顶部）。
function getStorage() {
  return AsyncStorage;
}

type State = {
  habits: Habit[];
  checks: Record<string, Record<string, boolean>>;
  values: ValueMap;
  loaded: boolean;
  addHabit: (input: { name: string; color: string; icon: string; reminderTime?: string }) => Habit;
  removeHabit: (habitId: string) => void;
  toggle: (habitId: string, dateKey: string) => void;
  /** 数值记录：value=undefined 时清除该日期 */
  setValue: (habitId: string, dateKey: string, value: number | undefined) => void;
  /** 长按补打：从 fromKey 到 toKey 批量置 true（含两端） */
  fillRange: (habitId: string, fromKey: string, toKey: string) => void;
  /** 一键今日全打卡/全撤销：今日已全打则撤销，否则全打 */
  toggleTodayAll: (dateKey: string) => void;
  load: () => Promise<void>;
  save: () => Promise<void>;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const useHabitStore = create<State>((set, get) => ({
  habits: [],
  checks: {},
  values: {},
  loaded: false,
  addHabit: (input) => {
    const h: Habit = {
      id: uid(),
      createdAt: new Date().toISOString(),
      ...input,
      kind: 'check',
      // 用户显式传 reminderTime（含空字符串关闭）时尊重用户；undefined 则默认 21:00
      reminderTime: input.reminderTime === undefined ? DEFAULT_REMINDER_TIME : input.reminderTime || undefined,
    };
    set((s) => ({ habits: [...s.habits, h] }));
    void get().save();
    return h;
  },
  removeHabit: (habitId) => {
    set((s) => {
      const checks = { ...s.checks };
      delete checks[habitId];
      const values = { ...s.values };
      delete values[habitId];
      return { habits: s.habits.filter((h) => h.id !== habitId), checks, values };
    });
    void get().save();
  },
  toggle: (habitId, dateKey) => {
    set((s) => ({
      checks: {
        ...s.checks,
        [habitId]: { ...(s.checks[habitId] ?? {}), [dateKey]: !s.checks[habitId]?.[dateKey] },
      },
    }));
    void get().save();
  },
  setValue: (habitId, dateKey, value) => {
    set((s) => {
      const prev = s.values[habitId] ?? {};
      if (value === undefined) {
        const next = { ...prev };
        delete next[dateKey];
        return { values: { ...s.values, [habitId]: next } };
      }
      return { values: { ...s.values, [habitId]: { ...prev, [dateKey]: value } } };
    });
    void get().save();
  },
  fillRange: (habitId, fromKey, toKey) => {
    const [a, b] = fromKey <= toKey ? [fromKey, toKey] : [toKey, fromKey];
    const cur = new Date(a + 'T12:00:00');
    const end = new Date(b + 'T12:00:00');
    const patch: Record<string, boolean> = {};
    while (cur <= end) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, '0');
      const d = String(cur.getDate()).padStart(2, '0');
      patch[`${y}-${m}-${d}`] = true;
      cur.setDate(cur.getDate() + 1);
    }
    set((s) => ({ checks: { ...s.checks, [habitId]: { ...(s.checks[habitId] ?? {}), ...patch } } }));
    void get().save();
  },
  toggleTodayAll: (dateKey) => {
    const { habits, checks } = get();
    const allDone = habits.length > 0 && habits.every((h) => checks[h.id]?.[dateKey]);
    const next: Record<string, Record<string, boolean>> = { ...checks };
    for (const h of habits) {
      next[h.id] = { ...(next[h.id] ?? {}), [dateKey]: !allDone };
    }
    set({ checks: next });
    void get().save();
  },
  load: async () => {
    const storage = getStorage();
    // 1) 先读 v2
    const raw2 = await storage.getItem(KEY_V2);
    if (raw2) {
      try {
        const data = JSON.parse(raw2) as Pick<State, 'habits' | 'checks' | 'values'>;
        set({ habits: data.habits ?? [], checks: data.checks ?? {}, values: data.values ?? {}, loaded: true });
        return;
      } catch {
        // 损坏数据则回落到种子
      }
    } else {
      // 2) v2 无数据：尝试 v1 迁移（habits/checks 照搬，values 为空）
      const raw1 = await storage.getItem(KEY_V1);
      if (raw1) {
        try {
          const data = JSON.parse(raw1) as Pick<State, 'habits' | 'checks'>;
          type V1Habit = Omit<Habit, 'kind'> & { kind?: Habit['kind'] };
          const rawHabits = (data.habits ?? []) as V1Habit[];
          const habits: Habit[] = rawHabits.map((h) => ({ ...h, kind: h.kind ?? 'check' }));
          const checks = data.checks ?? {};
          const values: ValueMap = {};
          set({ habits, checks, values, loaded: true });
          await storage.setItem(KEY_V2, JSON.stringify({ habits, checks, values }));
          return;
        } catch {
          // 损坏则回落到种子
        }
      }
    }
    // 3) 无数据：写入新 10 项种子
    const seeds = seedHabits();
    set({ habits: seeds, checks: {}, values: {}, loaded: true });
    await storage.setItem(KEY_V2, JSON.stringify({ habits: seeds, checks: {}, values: {} }));
  },
  save: async () => {
    const { habits, checks, values } = get();
    await getStorage().setItem(KEY_V2, JSON.stringify({ habits, checks, values }));
  },
}));
