import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { buildMonthCells } from '../src/store/habits';
import type { Habit } from '../src/store/habits';
import { useHabitStore } from '../src/store/useHabitStore';
import { CheckCell } from './CheckCell';

/** 手账式月表格：首列习惯、首行日期、周末灰底、点格切换、长按补打到今天 */
export function MonthGrid({
  year,
  month,
  todayKey,
  habits: habitsProp,
}: {
  year: number;
  month: number; // 1-12
  todayKey: string;
  habits?: Habit[]; // 可选：已排序的习惯列表；不传则直接读 store（默认顺序）
}) {
  const storeHabits = useHabitStore((s) => s.habits);
  const habits = habitsProp ?? storeHabits;
  const checks = useHabitStore((s) => s.checks);
  const toggle = useHabitStore((s) => s.toggle);
  const fillRange = useHabitStore((s) => s.fillRange);
  const days = buildMonthCells(year, month);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={styles.row}>
          <View style={[styles.cell, styles.habitCol]}>
            <Text style={styles.headText}>习惯</Text>
          </View>
          {days.map((d) => {
            const day = Number(d.slice(8));
            const wd = new Date(d + 'T12:00:00').getDay();
            const weekend = wd === 0 || wd === 6;
            const isToday = d === todayKey;
            return (
              <View key={d} style={[styles.cell, weekend && styles.weekend, isToday && styles.todayCol]}>
                <Text style={[styles.dayText, isToday && styles.todayText]}>{day}</Text>
              </View>
            );
          })}
        </View>
        {habits.map((h) => (
          <View key={h.id} style={styles.row}>
            <View style={[styles.cell, styles.habitCol]}>
              <Text numberOfLines={1} style={styles.habitText}>
                {h.icon} {h.name}
              </Text>
            </View>
            {days.map((d) => {
              const on = !!checks[h.id]?.[d];
              const future = d > todayKey;
              return (
                <CheckCell
                  key={d}
                  checked={on}
                  color={h.color}
                  onPress={() => {
                    if (!future) toggle(h.id, d);
                  }}
                  onLongPress={() => {
                    if (d <= todayKey) fillRange(h.id, d, todayKey);
                  }}
                />
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  cell: {
    width: 36,
    height: 36,
    borderWidth: 0.5,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitCol: { width: 120, alignItems: 'flex-start', paddingLeft: 8, backgroundColor: '#fff' },
  weekend: { backgroundColor: '#f2f2f2' },
  todayCol: { backgroundColor: '#FFF3D6' },
  headText: { fontWeight: '700' },
  dayText: { fontSize: 12 },
  todayText: { fontWeight: '800' },
  habitText: { fontSize: 13 },
});
