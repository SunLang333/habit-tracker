import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { buildMonthCells, nextScaleValue } from '../src/store/habits';
import type { Habit } from '../src/store/habits';
import { useHabitStore } from '../src/store/useHabitStore';
import { CheckCell } from './CheckCell';

/** 手账式月表格：check 格照旧；number 格显示数值点开编辑器；scale 格点击循环+1 */
export function MonthGrid({
  year,
  month,
  todayKey,
  habits: habitsProp,
  onNumberPress,
}: {
  year: number;
  month: number; // 1-12
  todayKey: string;
  habits?: Habit[]; // 可选：已排序的习惯列表；不传则直接读 store（默认顺序）
  onNumberPress?: (habit: Habit, dateKey: string) => void;
}) {
  const storeHabits = useHabitStore((s) => s.habits);
  const habits = habitsProp ?? storeHabits;
  const checks = useHabitStore((s) => s.checks);
  const values = useHabitStore((s) => s.values);
  const toggle = useHabitStore((s) => s.toggle);
  const setValue = useHabitStore((s) => s.setValue);
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
              const kind = h.kind ?? 'check';
              const future = d > todayKey;
              if (kind === 'number') {
                const v = values[h.id]?.[d];
                return (
                  <Pressable
                    key={d}
                    onPress={() => {
                      if (!future) onNumberPress?.(h, d);
                    }}
                    style={[styles.cell, styles.numCell, v !== undefined && { borderColor: h.color }]}>
                    <Text style={[styles.numText, v !== undefined && { color: h.color }]}>
                      {v !== undefined ? String(v) : ''}
                    </Text>
                  </Pressable>
                );
              }
              if (kind === 'scale') {
                const max = h.scaleMax ?? 5;
                const v = values[h.id]?.[d];
                return (
                  <Pressable
                    key={d}
                    onPress={() => {
                      if (!future) setValue(h.id, d, nextScaleValue(v, max));
                    }}
                    style={[styles.cell, styles.scaleCell, v !== undefined && { borderColor: h.color }]}>
                    <Text style={styles.scaleText}>
                      {v !== undefined ? '●'.repeat(Math.min(v, max)) : ''}
                    </Text>
                  </Pressable>
                );
              }
              const on = !!checks[h.id]?.[d];
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
  numCell: { backgroundColor: '#fff' },
  numText: { fontSize: 11, fontWeight: '700', color: '#333' },
  scaleCell: { backgroundColor: '#fff' },
  scaleText: { fontSize: 8, color: '#E94E77' },
});
