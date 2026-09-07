import * as Notifications from 'expo-notifications';
import type { Habit } from './store/habits';

// 前台也显示通知（否则 App 打开时提醒无感）
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** 申请通知权限，返回是否授权 */
export async function ensurePermission(): Promise<boolean> {
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

/** 按习惯 reminderTime 排每日重复提醒（SDK 版本差异用 as any 保底编译） */
export async function scheduleHabitReminder(h: Habit): Promise<void> {
  if (!h.reminderTime) return;
  const [hh, mm] = h.reminderTime.split(':').map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return;
  await Notifications.scheduleNotificationAsync({
    content: { title: `${h.icon} ${h.name}`, body: '今天还没打卡，点一下补上！' },
    trigger: { type: 'daily', hour: hh, minute: mm } as unknown as Notifications.NotificationTriggerInput,
  });
}

/** 取消全部习惯提醒（删除习惯/重排前调用） */
export async function cancelAllHabitReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
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
