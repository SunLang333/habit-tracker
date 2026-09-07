import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/** 月完成率渐变卡片 + 纯 View 环形进度 */
export function MonthStats({ rate, streakTotal }: { rate: number; streakTotal: number }) {
  return (
    <LinearGradient colors={['#4A90E2', '#9B59B6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>本月完成率</Text>
          <Text style={styles.rate}>{rate}%</Text>
          <Text style={styles.sub}>全习惯打卡 {streakTotal} 天累计</Text>
        </View>
        <Ring rate={rate} />
      </View>
    </LinearGradient>
  );
}

function Ring({ rate }: { rate: number }) {
  // 纯 View 环形：外圈白底 + 内圈按比例遮罩（简化：用文字 + 进度条式圆环近似）
  const size = 76;
  return (
    <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={styles.ringInner}>
        <Text style={styles.ringText}>{rate}%</Text>
      </View>
      {/* 进度弧：用 border 段近似，rate>=75 整圈高亮 */}
      <View
        style={[
          styles.ringArc,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: rate >= 75 ? '#7ED321' : rate >= 40 ? '#FFB020' : '#E94E77',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, marginVertical: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { color: '#fff', opacity: 0.85, fontSize: 13 },
  rate: { color: '#fff', fontSize: 36, fontWeight: '800' },
  sub: { color: '#fff', opacity: 0.8, fontSize: 12, marginTop: 4 },
  ring: { backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  ringInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: { fontWeight: '800', fontSize: 15 },
  ringArc: { position: 'absolute', borderWidth: 4 },
});
