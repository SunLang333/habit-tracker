import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

/** 数值编辑器：数字键盘输入，保存 / 清除 / 取消 */
export function ValueEditor({
  visible,
  title,
  unit,
  initialValue,
  onSave,
  onClear,
  onCancel,
}: {
  visible: boolean;
  title: string;
  unit?: string;
  initialValue?: number;
  onSave: (value: number) => void;
  onClear: () => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(initialValue !== undefined ? String(initialValue) : '');

  useEffect(() => {
    if (visible) setText(initialValue !== undefined ? String(initialValue) : '');
  }, [visible, initialValue]);

  const commit = () => {
    const v = Number(text);
    if (!Number.isFinite(v)) return;
    onSave(v);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.mask}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {title}
            {unit ? `（${unit}）` : ''}
          </Text>
          <TextInput
            value={text}
            onChangeText={setText}
            keyboardType="decimal-pad"
            placeholder="输入数值"
            style={styles.input}
            autoFocus
            onSubmitEditing={commit}
          />
          <View style={styles.row}>
            <Pressable onPress={onCancel} style={[styles.btn, styles.cancelBtn]}>
              <Text style={styles.cancelTxt}>取消</Text>
            </Pressable>
            <Pressable onPress={onClear} style={[styles.btn, styles.clearBtn]}>
              <Text style={styles.clearTxt}>清除</Text>
            </Pressable>
            <Pressable onPress={commit} style={[styles.btn, styles.saveBtn]}>
              <Text style={styles.saveTxt}>保存</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mask: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  card: { width: 300, backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  title: { fontSize: 17, fontWeight: '800', marginBottom: 12 },
  input: {
    backgroundColor: '#F5F3EC',
    borderRadius: 12,
    padding: 14,
    fontSize: 22,
    textAlign: 'center',
    fontWeight: '700',
  },
  row: { flexDirection: 'row', marginTop: 16, gap: 8 },
  btn: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#eee' },
  clearBtn: { backgroundColor: '#FFF0F0' },
  saveBtn: { backgroundColor: '#4A90E2' },
  cancelTxt: { fontWeight: '700', color: '#555' },
  clearTxt: { fontWeight: '700', color: '#E94E77' },
  saveTxt: { fontWeight: '700', color: '#fff' },
});
