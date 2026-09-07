import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { buildMonthCells, calcStreak, monthRate, toDateKey, todayKey } from '../src/store/habits';
import { useHabitStore } from '../src/store/useHabitStore';
import { MonthStats } from '../components/MonthStats';
import { Heatmap } from '../components/Heatmap';
import { WeekTrend } from '../components/WeekTrend';

/** 近 N 天日期 key（今天在内，升序） */
function lastNDays(n: number, today = new Date()): string[] {
  const out: string[] = [];
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  for (let i = n - 1; i >= 0; i--) out.push(toDateKey(new Date(base.getTime() - i * 86400000)));
  return out;
}

/** 睡眠柱状图（纯 View 实现，近 14 天） */
function SleepChart({ series }: { series: { key: string; value?: number }[] }) {
  const vals = series.map((s) => s.value).filter((v): v is number => v !== undefined);
  const max = Math.max(12, ...vals);
  const W = 20;
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>😴 睡眠（近 14 天，小时）</Text>
      <View style={styles.bars}>
        {series.map((s) => (
          <View key={s.key} style={[styles.barCol, { width: W }]}>
            <View style={styles.barTrack}>
              {s.value !== undefined && (
                <View style={[styles.barFill, { height: `${Math.max(6, (s.value / max) * 100)}%` }]} />
              )}
            </View>
            <Text style={styles.barVal}>{s.value !== undefined ? s.value : ''}</Text>
            <Text style={styles.barDay}>{s.key.slice(8)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** 数值近期列表（最近 7 条有值记录） */
function RecentList({
  title,
  entries,
  unit,
}: {
  title: string;
  entries: { key: string; value: number }[];
  unit?: string;
}) {
  const last7 = entries.slice(-7).reverse();
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {last7.length === 0 ? (
        <Text style={styles.empty}>暂无记录</Text>
      ) : (
        last7.map((e) => (
          <View key={e.key} style={styles.kvRow}>
            <Text style={styles.kvKey}>{e.key.slice(5)}</Text>
            <Text style={styles.kvVal}>
              {e.value}
              {unit ? ` ${unit}` : ''}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

/** 心情近 14 天圆点行 */
function MoodRow({ series, max }: { series: { key: string; value?: number }[]; max: number }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>😊 心情（近 14 天，/{max}）</Text>
      <View style={styles.moodRow}>
        {series.map((s) => (
          <View key={s.key} style={styles.moodCol}>
            <Text style={styles.moodVal}>{s.value !== undefined ? '●'.repeat(Math.min(s.value, max)) : '·'}</Text>
            <Text style={styles.barDay}>{s.key.slice(8)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function Stats() {
  const habits = useHabitStore((s) => s.habits);
  const checks = useHabitStore((s) => s.checks);
  const values = useHabitStore((s) => s.values);
  const now = new Date();
  const days = buildMonthCells(now.getFullYear(), now.getMonth() + 1);
  const rate = monthRate(habits, checks, days);
  const today = todayKey();
  const totalChecks = habits.reduce((n, h) => n + Object.values(checks[h.id] ?? {}).filter(Boolean).length, 0);

  const byName = (name: string) => habits.find((h) => h.name === name);
  const sleepH = byName('睡眠');
  const weightH = byName('体重');
  const proteinH = byName('蛋白');
  const moodH = byName('心情');

  const last14 = lastNDays(14, now);
  const sleepSeries = sleepH ? last14.map((k) => ({ key: k, value: values[sleepH.id]?.[k] })) : [];
  const moodSeries = moodH ? last14.map((k) => ({ key: k, value: values[moodH.id]?.[k] })) : [];

  const entriesOf = (id?: string) =>
    id
      ? Object.entries(values[id] ?? {})
          .map(([key, value]) => ({ key, value }))
          .sort((a, b) => (a.key < b.key ? -1 : 1))
      : [];

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.body}>
      <MonthStats rate={rate} streakTotal={totalChecks} />
      <Heatmap habits={habits} checks={checks} days={days} />
      <WeekTrend habits={habits} checks={checks} />
      {sleepH && sleepSeries.some((s) => s.value !== undefined) && <SleepChart series={sleepSeries} />}
      {sleepH && !sleepSeries.some((s) => s.value !== undefined) && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>😴 睡眠（近 14 天，小时）</Text>
          <Text style={styles.empty}>暂无记录，去月视图点数字格填写</Text>
        </View>
      )}
      {weightH && <RecentList title={`⚖️ 体重近期（${weightH.unit ?? ''}）`} entries={entriesOf(weightH.id)} unit={weightH.unit} />}
      {proteinH && <RecentList title={`🥩 蛋白近期（${proteinH.unit ?? ''}）`} entries={entriesOf(proteinH.id)} unit={proteinH.unit} />}
      {moodH && <MoodRow series={moodSeries} max={moodH.scaleMax ?? 5} />}
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
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 12 },
  cardTitle: { fontWeight: '800', fontSize: 15, marginBottom: 10 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  barCol: { alignItems: 'center' },
  barTrack: {
    height: 90,
    width: 12,
    backgroundColor: '#F0EDE4',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', backgroundColor: '#4A90E2', borderRadius: 6 },
  barVal: { fontSize: 9, fontWeight: '700', marginTop: 4, height: 12 },
  barDay: { fontSize: 9, color: '#999' },
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  kvKey: { fontSize: 14, color: '#666' },
  kvVal: { fontSize: 14, fontWeight: '700' },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodCol: { alignItems: 'center', flex: 1 },
  moodVal: { fontSize: 8, color: '#E94E77', height: 22, textAlign: 'center' },
});
