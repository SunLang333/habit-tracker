import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MonthGrid } from '../components/MonthGrid';
import { buildMonthCells, calcStreak, todayKey } from '../src/store/habits';
import { useHabitStore } from '../src/store/useHabitStore';

export default function Index() {
  const insets = useSafeAreaInsets();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const habits = useHabitStore((s) => s.habits);
  const checks = useHabitStore((s) => s.checks);
  const toggleTodayAll = useHabitStore((s) => s.toggleTodayAll);
  const today = todayKey();

  // 排序：今日未完成在上、同组按 streak 倒序
  const sorted = useMemo(
    () =>
      [...habits].sort((a, b) => {
        const ad = checks[a.id]?.[today] ? 1 : 0;
        const bd = checks[b.id]?.[today] ? 1 : 0;
        if (ad !== bd) return ad - bd;
        return calcStreak(checks[b.id] ?? {}, today) - calcStreak(checks[a.id] ?? {}, today);
      }),
    [habits, checks, today],
  );
  const days = buildMonthCells(year, month);
  const allDoneToday = habits.length > 0 && habits.every((h) => checks[h.id]?.[today]);

  const shift = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  };

  return (
    <ScrollView style={[styles.page, { paddingTop: insets.top }]} contentContainerStyle={styles.body}>
      <View style={styles.nav}>
        <Pressable onPress={() => shift(-1)} style={styles.navBtn}>
          <Text style={styles.navTxt}>‹</Text>
        </Pressable>
        <Text style={styles.title}>
          {year} 年 {month} 月 · {days.length} 天
        </Text>
        <Pressable onPress={() => shift(1)} style={styles.navBtn}>
          <Text style={styles.navTxt}>›</Text>
        </Pressable>
      </View>

      {habits.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>还没有习惯 🌱</Text>
          <Text style={styles.emptySub}>点右下 + 建第一个吧（参考：运动 / 阅读 / 早睡）</Text>
        </View>
      ) : (
        <>
          <Pressable onPress={() => toggleTodayAll(today)} style={styles.allBtn}>
            <Text style={styles.allTxt}>{allDoneToday ? '撤销今日全打卡' : '一键今日全打卡 ✓'}</Text>
          </Pressable>
          <MonthGrid year={year} month={month} todayKey={today} habits={sorted} />
          <Text style={styles.hint}>点格打卡 · 长按某格补打到今天 · 未来日期不可点</Text>
        </>
      )}

      <View style={styles.links}>
        <Link href="/stats" style={styles.link}>
          查看统计 →
        </Link>
      </View>

      <Link href="/add-habit" style={styles.fab}>
        +
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FAF7F0' },
  body: { padding: 16, paddingBottom: 96 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 20 },
  navTxt: { fontSize: 22, fontWeight: '700' },
  title: { fontSize: 17, fontWeight: '800' },
  allBtn: { backgroundColor: '#1c1c1e', borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 12 },
  allTxt: { color: '#fff', fontWeight: '700' },
  hint: { color: '#999', fontSize: 12, marginTop: 8 },
  links: { marginTop: 16 },
  link: { color: '#4A90E2', fontWeight: '700', fontSize: 15 },
  empty: { backgroundColor: '#fff', borderRadius: 16, padding: 28, alignItems: 'center', marginTop: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptySub: { color: '#888', fontSize: 13, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90E2',
    color: '#fff',
    fontSize: 30,
    textAlign: 'center',
    lineHeight: 54,
    fontWeight: '700',
    overflow: 'hidden',
  },
});
