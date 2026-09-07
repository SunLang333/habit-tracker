import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useHabitStore } from '../src/store/useHabitStore';
import { rescheduleAll } from '../src/reminders';

export default function RootLayout() {
  const load = useHabitStore((s) => s.load);

  useEffect(() => {
    (async () => {
      await load();
      // 启动后为有提醒时间的习惯重排每日推送（无权限则静默跳过）
      try {
        await rescheduleAll(useHabitStore.getState().habits);
      } catch {
        // Expo Go / 模拟器不支持推送时不阻塞启动
      }
    })();
  }, [load]);

  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: '习惯打卡' }} />
        <Stack.Screen name="stats" options={{ title: '统计' }} />
        <Stack.Screen name="add-habit" options={{ title: '新建习惯', presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
