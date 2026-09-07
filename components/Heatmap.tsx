import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { dayIntensity } from '../src/store/habits';

/** GitHub 式热力图：按天完成度 0-100% 四档透明度 */
export function Heatmap({
  habits,
  checks,
  days,
  color = '#4A90E2',
}: {
  habits: { id: string }[];
  checks: Record<string, Record<string, boolean>>;
  days: string[];
  color?: string;
}) {
  const level = (v: number) => (v === 0 ? 0.08 : v < 0.4 ? 0.3 : v < 0.8 ? 0.6 : 1);
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>月热力图</Text>
      <View style={styles.grid}>
        {days.map((d) => {
          const v = dayIntensity(habits, checks, d);
          return (
            <View
              key={d}
              style={[styles.box, { backgroundColor: color, opacity: level(v) }]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: 8 },
  title: { fontWeight: '700', marginBottom: 8, fontSize: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  box: { width: 20, height: 20, borderRadius: 5 },
});
