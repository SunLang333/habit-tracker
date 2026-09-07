import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHabitStore } from './useHabitStore';

jest.mock('@react-native-async-storage/async-storage', () => {
  const mem = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: async (k: string) => mem.get(k) ?? null,
      setItem: async (k: string, v: string) => {
        mem.set(k, v);
      },
      removeItem: async (k: string) => {
        mem.delete(k);
      },
      clear: async () => {
        mem.clear();
      },
    },
  };
});

beforeEach(() => {
  useHabitStore.setState({ habits: [], checks: {}, values: {} });
});

test('toggle persists check', () => {
  const { addHabit, toggle } = useHabitStore.getState();
  const h = addHabit({ name: '阅读', color: '#FFB020', icon: '📖' });
  toggle(h.id, '2026-09-07');
  expect(useHabitStore.getState().checks[h.id]['2026-09-07']).toBe(true);
});

test('toggle twice unchecks', () => {
  const { addHabit, toggle } = useHabitStore.getState();
  const h = addHabit({ name: '运动', color: '#7ED321', icon: '🏃' });
  toggle(h.id, '2026-09-07');
  toggle(h.id, '2026-09-07');
  expect(useHabitStore.getState().checks[h.id]['2026-09-07']).toBe(false);
});

test('fillRange marks from-to inclusive', () => {
  const { addHabit, fillRange } = useHabitStore.getState();
  const h = addHabit({ name: '早睡', color: '#4A90E2', icon: '😴' });
  fillRange(h.id, '2026-09-01', '2026-09-03');
  const c = useHabitStore.getState().checks[h.id];
  expect(c['2026-09-01']).toBe(true);
  expect(c['2026-09-02']).toBe(true);
  expect(c['2026-09-03']).toBe(true);
});

test('toggleTodayAll checks all then unchecks all', () => {
  const s0 = useHabitStore.getState();
  const a = s0.addHabit({ name: 'A', color: '#fff', icon: '🏃' });
  const b = useHabitStore.getState().addHabit({ name: 'B', color: '#fff', icon: '📖' });
  void a;
  void b;
  useHabitStore.getState().toggleTodayAll('2026-09-07');
  let st = useHabitStore.getState();
  expect(Object.values(st.checks).every((m) => m['2026-09-07'] === true)).toBe(true);
  st.toggleTodayAll('2026-09-07');
  st = useHabitStore.getState();
  expect(Object.values(st.checks).every((m) => m['2026-09-07'] !== true)).toBe(true);
});

test('addHabit defaults reminderTime to 21:00', () => {
  const h = useHabitStore.getState().addHabit({ name: '冥想', color: '#9B59B6', icon: '🧘' });
  expect(h.reminderTime).toBe('21:00');
});

test('addHabit defaults kind to check', () => {
  const h = useHabitStore.getState().addHabit({ name: '新习惯', color: '#fff', icon: '🏃' });
  expect(h.kind).toBe('check');
});

test('setValue stores and clears numeric values', () => {
  const h = useHabitStore.getState().addHabit({ name: '体重', color: '#fff', icon: '⚖️' });
  useHabitStore.getState().setValue(h.id, '2026-09-07', 70.5);
  expect(useHabitStore.getState().values[h.id]['2026-09-07']).toBe(70.5);
  useHabitStore.getState().setValue(h.id, '2026-09-07', undefined);
  expect(useHabitStore.getState().values[h.id]?.['2026-09-07']).toBeUndefined();
});

test('removeHabit clears values too', () => {
  const h = useHabitStore.getState().addHabit({ name: '体重', color: '#fff', icon: '⚖️' });
  useHabitStore.getState().setValue(h.id, '2026-09-07', 70);
  useHabitStore.getState().removeHabit(h.id);
  const st = useHabitStore.getState();
  expect(st.habits.find((x) => x.id === h.id)).toBeUndefined();
  expect(st.values[h.id]).toBeUndefined();
});

test('load migrates v1 data to v2 with empty values', async () => {
  const v1 = {
    habits: [{ id: 'h1', name: '旧习惯', color: '#fff', icon: '🏃', createdAt: 'x' }],
    checks: { h1: { '2026-09-07': true } },
  };
  await AsyncStorage.setItem('@habit-tracker/v1', JSON.stringify(v1));
  await AsyncStorage.removeItem('@habit-tracker/v2');
  useHabitStore.setState({ habits: [], checks: {}, values: {}, loaded: false });
  await useHabitStore.getState().load();
  const st = useHabitStore.getState();
  expect(st.habits).toEqual([{ ...v1.habits[0], kind: 'check' }]);
  expect(st.checks).toEqual(v1.checks);
  expect(st.values).toEqual({});
  expect(st.loaded).toBe(true);
  // 迁移后 v2 已持久化
  const v2raw = await AsyncStorage.getItem('@habit-tracker/v2');
  expect(v2raw).not.toBeNull();
  await AsyncStorage.clear();
});

test('load with no data writes new 10-item seed', async () => {
  await AsyncStorage.clear();
  useHabitStore.setState({ habits: [], checks: {}, values: {}, loaded: false });
  await useHabitStore.getState().load();
  const st = useHabitStore.getState();
  expect(st.habits.length).toBe(10);
  expect(st.values).toEqual({});
});
