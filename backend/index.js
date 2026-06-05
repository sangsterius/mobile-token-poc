const express = require('express');
const admin = require('firebase-admin');
const crypto = require('crypto');
const path = require('path');

// --- Firebase init ---
// Drop your service account JSON file next to this file as: service-account.json
const serviceAccount = require('./service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(express.json());

// Allow the web page to call the backend (CORS for local dev)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// --- In-memory state ---
const devices = new Map();    // userId -> fcmToken
const challenges = new Map(); // challengeId -> { code, status }

// --- Device registration ---
app.post('/device/register', (req, res) => {
  const { userId, fcmToken } = req.body;
  if (!userId || !fcmToken) return res.status(400).json({ error: 'userId and fcmToken required' });
  devices.set(userId, fcmToken);
  console.log(`[register] userId=${userId} token=${fcmToken.slice(0, 20)}...`);
  res.json({ ok: true });
});

// --- Create challenge ---
// For the PoC, we target the first registered device.
// In a real app, userId would come from the authenticated web session.
app.post('/challenge/create', (req, res) => {
  const { amount, payee } = req.body;
  if (!amount || !payee) return res.status(400).json({ error: 'amount and payee required' });

  if (devices.size === 0) return res.status(400).json({ error: 'No registered device' });

  const challengeId = crypto.randomUUID();
  const code = String(Math.floor(Math.random() * 90) + 10); // 2-digit, 10–99
  const fcmToken = [...devices.values()][0]; // first registered device

  challenges.set(challengeId, { code, status: 'pending', amount, payee });
  console.log(`[challenge] id=${challengeId} code=${code}`);

  // Send push notification via FCM
  admin.messaging().send({
    token: fcmToken,
    notification: {
      title: 'Approve transfer',
      body: `${amount} PLN → ${payee}`,
    },
    data: {
      challengeId,
      code,
      amount,
      payee,
    },
    android: {
      priority: 'high',
    },
  }).then(() => {
    console.log(`[fcm] push sent for ${challengeId}`);
  }).catch((err) => {
    console.error(`[fcm] send failed:`, err.message);
  });

  res.json({ challengeId, code });
});

// --- Poll status ---
app.get('/challenge/:id/status', (req, res) => {
  const c = challenges.get(req.params.id);
  if (!c) return res.status(404).json({ error: 'not found' });
  res.json({ status: c.status });
});

// --- Approve ---
app.post('/challenge/:id/approve', (req, res) => {
  const c = challenges.get(req.params.id);
  if (!c) return res.status(404).json({ error: 'not found' });
  c.status = 'approved';
  console.log(`[approve] id=${req.params.id}`);
  res.json({ ok: true });
});

// --- Deny ---
app.post('/challenge/:id/deny', (req, res) => {
  const c = challenges.get(req.params.id);
  if (!c) return res.status(404).json({ error: 'not found' });
  c.status = 'denied';
  console.log(`[deny] id=${req.params.id}`);
  res.json({ ok: true });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
