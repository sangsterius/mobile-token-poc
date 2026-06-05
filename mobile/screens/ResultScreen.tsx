import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  result: 'approved' | 'denied';
  onReset: () => void;
};

export default function ResultScreen({ result, onReset }: Props) {
  const approved = result === 'approved';
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{approved ? '✓' : '✗'}</Text>
      <Text style={[styles.title, approved ? styles.green : styles.red]}>
        {approved ? 'Transfer approved' : 'Transfer denied'}
      </Text>
      <TouchableOpacity style={styles.button} onPress={onReset}>
        <Text style={styles.buttonText}>Back to home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: 32, backgroundColor: '#f5f5f7',
  },
  icon: { fontSize: 72, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 40 },
  green: { color: '#16a34a' },
  red: { color: '#dc2626' },
  button: {
    backgroundColor: '#2563eb', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 40,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
