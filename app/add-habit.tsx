import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { HABIT_COLORS, HABIT_ICONS, DEFAULT_REMINDER_TIME } from '../src/store/habits';
import { useHabitStore } from '../src/store/useHabitStore';
import { scheduleHabitReminder } from '../src/reminders';

const TIMES = ['07:00', '08:00', '12:00', '18:00', '21:00', '22:00'];

export default function AddHabit() {
  const [name, setName] = useState('');
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [icon, setIcon] = useState(HABIT_ICONS[0]);
  const [time, setTime] = useState<string>(DEFAULT_REMINDER_TIME);
  const addHabit = useHabitStore((s) => s.addHabit);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const h = addHabit({ name: trimmed, color, icon, reminderTime: time });
    try {
      await scheduleHabitReminder(h);
    } catch {
      // Expo Go 不支持推送时静默跳过
    }
    router.back();
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.body}>
      <Text style={styles.label}>习惯名称</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="例如：早睡"
        style={styles.input}
        maxLength={12}
      />
      <Text style={styles.label}>颜色</Text>
      <View style={styles.swatches}>
        {HABIT_COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setColor(c)}
            style={[styles.swatch, { backgroundColor: c }, color === c && styles.swatchOn]}
          />
        ))}
      </View>
      <Text style={styles.label}>图标</Text>
      <View style={styles.swatches}>
        {HABIT_ICONS.map((i) => (
          <Pressable key={i} onPress={() => setIcon(i)} style={[styles.icon, icon === i && styles.iconOn]}>
            <Text style={styles.iconTxt}>{i}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>每日提醒（默认 {DEFAULT_REMINDER_TIME}）</Text>
      <View style={styles.swatches}>
        {TIMES.map((t) => (
          <Pressable key={t} onPress={() => setTime(t)} style={[styles.time, time === t && styles.timeOn]}>
            <Text style={[styles.timeTxt, time === t && styles.timeTxtOn]}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={save} style={[styles.save, !name.trim() && styles.saveOff]}>
        <Text style={styles.saveTxt}>保存</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FAF7F0' },
  body: { padding: 20, paddingBottom: 48 },
  label: { fontWeight: '700', marginTop: 16, marginBottom: 8, fontSize: 15 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 16 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 40, height: 40, borderRadius: 20 },
  swatchOn: { borderWidth: 3, borderColor: '#1c1c1e' },
  icon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  iconOn: { borderWidth: 2, borderColor: '#4A90E2' },
  iconTxt: { fontSize: 24 },
  time: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: '#fff' },
  timeOn: { backgroundColor: '#1c1c1e' },
  timeTxt: { fontWeight: '600' },
  timeTxtOn: { color: '#fff' },
  save: { backgroundColor: '#4A90E2', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 28 },
  saveOff: { opacity: 0.4 },
  saveTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
