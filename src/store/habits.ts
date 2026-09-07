// 习惯数据类型与日期/统计纯函数
// key 统一用 'YYYY-MM-DD'

export type Habit = {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  /** 每日提醒时间 'HH:mm'，不设则不提醒 */
  reminderTime?: string;
};

export type CheckMap = Record<string, boolean>; // key: 'YYYY-MM-DD'

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

/** 空态种子习惯 */
export function seedHabits(): Habit[] {
  const now = new Date().toISOString();
  return [
    { id: 'seed-run', name: '运动', color: '#7ED321', icon: '🏃', createdAt: now, reminderTime: '21:00' },
    { id: 'seed-read', name: '阅读', color: '#FFB020', icon: '📖', createdAt: now, reminderTime: '21:00' },
    { id: 'seed-sleep', name: '早睡', color: '#4A90E2', icon: '😴', createdAt: now, reminderTime: '21:00' },
  ];
}
