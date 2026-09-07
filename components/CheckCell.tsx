import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export function CheckCell({
  checked,
  color,
  onPress,
  onLongPress,
}: {
  checked: boolean;
  color: string;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.cell, checked && { backgroundColor: color, borderColor: color }]}>
      <Text style={[styles.mark, checked && styles.markOn]}>{checked ? '✓' : ''}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: 36,
    height: 36,
    borderWidth: 0.5,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: { fontSize: 16, fontWeight: '700', color: '#fff' },
  markOn: { color: '#fff' },
});
