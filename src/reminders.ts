import type { Habit } from './store/habits';

// 注意：expo-notifications 用动态 import 懒加载。
// 之前是静态 import + 模块顶层 setNotificationHandler，原生模块缺失时
// （部分 Expo Go 环境）import 阶段就直接炸，try/catch 根本包不住，
// 一开屏就是满屏红屏。这里改成全部包在 try/catch 里，缺模块静默跳过。
async function loadNotifications(): Promise<typeof import('expo-notifications') | null> {
  try {
    return await import('expo-notifications');
  } catch {
    return null;
  }
}

type NotificationsModule = NonNullable<Awaited<ReturnType<typeof loadNotifications>>>;

let handlerSet = false;

async function withNotifications<T>(fn: (n: NotificationsModule) => Promise<T>, fallback: T): Promise<T> {
  const n = await loadNotifications();
  if (!n) return fallback;
  try {
    if (!handlerSet) {
      // 前台也显示通知（否则 App 打开时提醒无感）
      n.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
      handlerSet = true;
    }
    return await fn(n);
  } catch {
    return fallback;
  }
}

/** 申请通知权限，返回是否授权 */
export async function ensurePermission(): Promise<boolean> {
  return withNotifications(async (n) => {
    const cur = await n.getPermissionsAsync();
    if (cur.granted) return true;
    const req = await n.requestPermissionsAsync();
    return req.granted;
  }, false);
}

/** 按习惯 reminderTime 排每日重复提醒 */
export async function scheduleHabitReminder(h: Habit): Promise<void> {
  if (!h.reminderTime) return;
  const [hh, mm] = h.reminderTime.split(':').map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return;
  await withNotifications(async (n) => {
    await n.scheduleNotificationAsync({
      content: { title: `${h.icon} ${h.name}`, body: '今天还没打卡，点一下补上！' },
      trigger: { type: 'daily', hour: hh, minute: mm } as Parameters<
        NotificationsModule['scheduleNotificationAsync']
      >[0]['trigger'],
    });
  }, undefined);
}

/** 取消全部习惯提醒（删除习惯/重排前调用） */
export async function cancelAllHabitReminders(): Promise<void> {
  await withNotifications(async (n) => {
    await n.cancelAllScheduledNotificationsAsync();
  }, undefined);
}

/** 为全部有 reminderTime 的习惯重排提醒 */
export async function rescheduleAll(habits: Habit[]): Promise<void> {
  const ok = await ensurePermission();
  if (!ok) return;
  await cancelAllHabitReminders();
  for (const h of habits) {
    await scheduleHabitReminder(h);
  }
}
