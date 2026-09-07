import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { buildMonthCells, calcStreak, monthRate, todayKey } from '../src/store/habits';
import { useHabitStore } from '../src/store/useHabitStore';
import { MonthStats } from '../components/MonthStats';
import { Heatmap } from '../components/Heatmap';
import { WeekTrend } from '../components/WeekTrend';

export default function Stats() {
  const habits = useHabitStore((s) => s.habits);
  const checks = useHabitStore((s) => s.checks);
  const now = new Date();
  const days = buildMonthCells(now.getFullYear(), now.getMonth() + 1);
  const rate = monthRate(habits, checks, days);
  const today = todayKey();
  const totalChecks = habits.reduce((n, h) => n + Object.values(checks[h.id] ?? {}).filter(Boolean).length, 0);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.body}>
      <MonthStats rate={rate} streakTotal={totalChecks} />
      <Heatmap habits={habits} checks={checks} days={days} />
      <WeekTrend habits={habits} checks={checks} />
      <Text style={styles.title}>习惯 Streak</Text>
      {habits.map((h) => (
        <View key={h.id} style={styles.row}>
          <Text style={styles.name}>
            {h.icon} {h.name}
          </Text>
          <Text style={styles.streak}>🔥 {calcStreak(checks[h.id] ?? {}, today)} 天</Text>
        </View>
      ))}
      {habits.length === 0 && <Text style={styles.empty}>还没有习惯，先去建一个吧 🌱</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FAF7F0' },
  body: { padding: 16, paddingBottom: 48 },
  title: { fontWeight: '800', fontSize: 16, marginTop: 12, marginBottom: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  name: { fontSize: 15, fontWeight: '600' },
  streak: { fontSize: 14, color: '#E94E77', fontWeight: '700' },
  empty: { color: '#999', marginTop: 8 },
});
