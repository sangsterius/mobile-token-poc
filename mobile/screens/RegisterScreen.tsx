import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { BASE_URL } from '../config';

export default function RegisterScreen() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  async function register() {
    if (!userId.trim()) {
      Alert.alert('Enter a user ID first');
      return;
    }

    if (!Device.isDevice) {
      Alert.alert('Push notifications require a physical device');
      return;
    }

    setLoading(true);
    try {
      const { status: existing } = await Notifications.getPermissionsAsync();
      let finalStatus = existing;
      if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Notification permission denied');
        setLoading(false);
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const fcmToken = tokenData.data;

      const res = await fetch(`${BASE_URL}/device/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId.trim(), fcmToken }),
      });

      if (!res.ok) throw new Error('Registration failed');

      setRegistered(true);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  if (registered) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>✓</Text>
        <Text style={styles.title}>Device registered</Text>
        <Text style={styles.subtitle}>
          Waiting for an approval request…{'\n'}
          Go to the web page and confirm a transfer.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mobile Token</Text>
      <Text style={styles.subtitle}>Enter a user ID to register this device</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. user-1"
        value={userId}
        onChangeText={setUserId}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity style={styles.button} onPress={register} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Register device</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: 32, backgroundColor: '#f5f5f7',
  },
  icon: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#111', marginBottom: 8 },
  subtitle: {
    fontSize: 15, color: '#6b7280', textAlign: 'center',
    marginBottom: 32, lineHeight: 22,
  },
  input: {
    width: '100%', backgroundColor: '#fff', borderRadius: 10,
    padding: 14, fontSize: 16, borderWidth: 1, borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  button: {
    width: '100%', backgroundColor: '#2563eb',
    borderRadius: 10, padding: 16, alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
