// 习惯数据类型与日期/统计纯函数
// key 统一用 'YYYY-MM-DD'

export type HabitKind = 'check' | 'number' | 'scale';

export type Habit = {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  /** 每日提醒时间 'HH:mm'，不设则不提醒 */
  reminderTime?: string;
  kind: HabitKind;
  /** number 型单位，如 kg / g / h */
  unit?: string;
  /** scale 型最大值，心情用 5 */
  scaleMax?: number;
};

export type CheckMap = Record<string, boolean>; // key: 'YYYY-MM-DD'

/** 数值记录：habitId -> dateKey -> number */
export type ValueMap = Record<string, Record<string, number>>;

/** scale 格点击：当前值 +1，超过 max 则回 0（即清除，返回 undefined） */
export function nextScaleValue(current: number | undefined, max: number): number | undefined {
  const cur = current ?? 0;
  const next = cur + 1;
  return next > max ? undefined : next;
}

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function todayKey(today = new Date()): string {
  return toDateKey(today);
}

/** 指定年月的全部日期 key（month1to12: 1-12） */
export function buildMonthCells(year: number, month1to12: number): string[] {
  const days = new Date(year, month1to12, 0).getDate();
  const out: string[] = [];
  for (let d = 1; d <= days; d++) {
    const m = String(month1to12).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    out.push(`${year}-${m}-${dd}`);
  }
  return out;
}

/** 从 through（含）往回数连续打卡天数，跨月正确，最多回看 366 天 */
export function calcStreak(checks: CheckMap, through: string): number {
  let n = 0;
  const cur = new Date(through + 'T12:00:00');
  for (let i = 0; i < 366; i++) {
    const key = toDateKey(cur);
    if (!checks[key]) break;
    n++;
    cur.setDate(cur.getDate() - 1);
  }
  return n;
}

/** 整月完成率 0-100（习惯数 × 天数 分母） */
export function monthRate(
  habits: { id: string }[],
  checks: Record<string, CheckMap>,
  days: string[],
): number {
  if (!habits.length || !days.length) return 0;
  let done = 0;
  for (const h of habits) for (const d of days) if (checks[h.id]?.[d]) done++;
  return Math.round((done / (habits.length * days.length)) * 100);
}

/** 某天完成度 0-1（给热力图用） */
export function dayIntensity(
  habits: { id: string }[],
  checks: Record<string, CheckMap>,
  dateKey: string,
): number {
  if (!habits.length) return 0;
  let done = 0;
  for (const h of habits) if (checks[h.id]?.[dateKey]) done++;
  return done / habits.length;
}

/** 近 8 周每周完成率（每组 7 天，label 取周一起始 M/D） */
export function last8WeekRates(
  habits: { id: string }[],
  checks: Record<string, CheckMap>,
  today = new Date(),
): { label: string; rate: number }[] {
  const out: { label: string; rate: number }[] = [];
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  for (let w = 7; w >= 0; w--) {
    const end = new Date(base.getTime() - w * 7 * 86400000);
    const start = new Date(end.getTime() - 6 * 86400000);
    let done = 0;
    let total = 0;
    for (let t = start.getTime(); t <= end.getTime(); t += 86400000) {
      const key = toDateKey(new Date(t));
      for (const h of habits) {
        total++;
        if (checks[h.id]?.[key]) done++;
      }
    }
    out.push({ label: `${start.getMonth() + 1}/${start.getDate()}`, rate: total ? Math.round((done / total) * 100) : 0 });
  }
  return out;
}

/** 习惯颜色/图标候选（add-habit 用） */
export const HABIT_COLORS = ['#7ED321', '#FFB020', '#4A90E2', '#E94E77', '#9B59B6', '#20C2AA'];
export const HABIT_ICONS = ['🏃', '📖', '😴', '💧', '🧘', '✍️', '🥗', '🎸'];

/** 新习惯默认提醒时间 */
export const DEFAULT_REMINDER_TIME = '21:00';

/** 10 项种子习惯（对齐参考 reel 顺序） */
export function seedHabits(): Habit[] {
  const now = new Date().toISOString();
  return [
    { id: 'seed-weight', name: '体重', color: '#4A90E2', icon: '⚖️', createdAt: now, reminderTime: '21:00', kind: 'number', unit: 'kg' },
    { id: 'seed-workout', name: '锻炼', color: '#7ED321', icon: '🏋️', createdAt: now, reminderTime: '21:00', kind: 'check' },
    { id: 'seed-stretch', name: '拉伸', color: '#20C2AA', icon: '🤸', createdAt: now, reminderTime: '21:00', kind: 'check' },
    { id: 'seed-creatine', name: '肌酸', color: '#9B59B6', icon: '💊', createdAt: now, reminderTime: '21:00', kind: 'check' },
    { id: 'seed-protein', name: '蛋白', color: '#E94E77', icon: '🥩', createdAt: now, reminderTime: '21:00', kind: 'number', unit: 'g' },
    { id: 'seed-edit', name: '剪辑', color: '#FFB020', icon: '🎬', createdAt: now, reminderTime: '21:00', kind: 'check' },
    { id: 'seed-read', name: '阅读', color: '#FFB020', icon: '📖', createdAt: now, reminderTime: '21:00', kind: 'check' },
    { id: 'seed-coffee', name: '咖啡', color: '#8B5E34', icon: '☕', createdAt: now, reminderTime: '21:00', kind: 'check' },
    { id: 'seed-sleep', name: '睡眠', color: '#4A90E2', icon: '😴', createdAt: now, reminderTime: '21:00', kind: 'number', unit: 'h' },
    { id: 'seed-mood', name: '心情', color: '#FFD93D', icon: '😊', createdAt: now, reminderTime: '21:00', kind: 'scale', scaleMax: 5 },
  ];
}
