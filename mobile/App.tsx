import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';

import RegisterScreen from './screens/RegisterScreen';
import ApprovalScreen from './screens/ApprovalScreen';
import ResultScreen from './screens/ResultScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const Stack = createNativeStackNavigator();

type PendingChallenge = {
  challengeId: string;
  code: string;
  amount: string;
  payee: string;
};

export default function App() {
  const [challenge, setChallenge] = useState<PendingChallenge | null>(null);
  const [result, setResult] = useState<'approved' | 'denied' | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Foreground: notification arrives while app is open
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data as PendingChallenge;
      setChallenge(data);
      setResult(null);
    });

    // Background/killed: user taps the notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as PendingChallenge;
      setChallenge(data);
      setResult(null);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  function reset() {
    setChallenge(null);
    setResult(null);
  }

  if (result) {
    return (
      <>
        <StatusBar style="dark" />
        <ResultScreen result={result} onReset={reset} />
      </>
    );
  }

  if (challenge) {
    return (
      <>
        <StatusBar style="dark" />
        <ApprovalScreen
          challengeId={challenge.challengeId}
          code={challenge.code}
          amount={challenge.amount}
          payee={challenge.payee}
          onResult={(r) => setResult(r)}
        />
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <RegisterScreen />
    </>
  );
}
