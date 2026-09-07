import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { last8WeekRates } from '../src/store/habits';

/** 近 8 周完成率柱状图（纯 View，零依赖） */
export function WeekTrend({
  habits,
  checks,
}: {
  habits: { id: string }[];
  checks: Record<string, Record<string, boolean>>;
}) {
  const data = last8WeekRates(habits, checks);
  const max = Math.max(1, ...data.map((d) => d.rate));
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>近 8 周趋势</Text>
      <View style={styles.bars}>
        {data.map((d, i) => {
          const h = Math.max(6, (d.rate / 100) * 110);
          const top = d.rate === max && max > 0;
          const bar = top ? (
            <LinearGradient colors={['#4A90E2', '#9B59B6']} style={[styles.bar, { height: h }]} />
          ) : (
            <View style={[styles.bar, styles.barPlain, { height: h }]} />
          );
          return (
            <View key={i} style={styles.col}>
              <Text style={styles.rate}>{d.rate}</Text>
              {bar}
              <Text style={styles.label}>{d.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: 8 },
  title: { fontWeight: '700', marginBottom: 8, fontSize: 15 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  col: { alignItems: 'center', flex: 1 },
  rate: { fontSize: 10, color: '#666', marginBottom: 2 },
  bar: { width: '70%', borderRadius: 6, minHeight: 6 },
  barPlain: { backgroundColor: '#D9E2F3' },
  label: { fontSize: 9, color: '#888', marginTop: 4 },
});
