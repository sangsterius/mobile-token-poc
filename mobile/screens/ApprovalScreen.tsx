import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { BASE_URL } from '../config';

type Props = {
  challengeId: string;
  code: string;
  amount: string;
  payee: string;
  onResult: (result: 'approved' | 'denied') => void;
};

export default function ApprovalScreen({ challengeId, code, amount, payee, onResult }: Props) {
  const [loading, setLoading] = useState<'approve' | 'deny' | null>(null);

  async function respond(action: 'approve' | 'deny') {
    setLoading(action);
    try {
      const res = await fetch(`${BASE_URL}/challenge/${challengeId}/${action}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Request failed');
      onResult(action === 'approve' ? 'approved' : 'denied');
    } catch (err: any) {
      Alert.alert('Error', err.message);
      setLoading(null);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Approve transfer?</Text>

      <View style={styles.card}>
        <Row label="To" value={payee} />
        <View style={styles.divider} />
        <Row label="Amount" value={`${amount} PLN`} large />
      </View>

      <View style={styles.codeBox}>
        <Text style={styles.codeLabel}>Match this code on the web page</Text>
        <Text style={styles.code}>{code}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.approve]}
        onPress={() => respond('approve')}
        disabled={loading !== null}
      >
        {loading === 'approve'
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Approve</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.deny]}
        onPress={() => respond('deny')}
        disabled={loading !== null}
      >
        {loading === 'deny'
          ? <ActivityIndicator color="#dc2626" />
          : <Text style={[styles.buttonText, { color: '#dc2626' }]}>Deny</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

function Row({ label, value, large }: { label: string; value: string; large?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, large && styles.rowValueLarge]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 24, backgroundColor: '#f5f5f7', justifyContent: 'center',
  },
  heading: {
    fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 20,
    marginBottom: 16, shadowColor: '#000',
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 14 },
  rowLabel: { fontSize: 14, color: '#6b7280' },
  rowValue: { fontSize: 15, fontWeight: '500', color: '#111' },
  rowValueLarge: { fontSize: 22, fontWeight: '700' },
  codeBox: {
    backgroundColor: '#eff6ff', borderRadius: 14, padding: 20,
    alignItems: 'center', marginBottom: 24,
  },
  codeLabel: { fontSize: 13, color: '#3b82f6', marginBottom: 8 },
  code: { fontSize: 56, fontWeight: '800', letterSpacing: 8, color: '#2563eb' },
  button: {
    borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 10,
  },
  approve: { backgroundColor: '#2563eb' },
  deny: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#dc2626' },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
