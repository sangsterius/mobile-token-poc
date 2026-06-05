# Mobile Token PoC

Proof of concept for an out-of-band transaction approval flow. A user initiates a payment on a web page → the mobile app receives a push notification → user approves or denies → the web page updates in real time.

Replaces SMS OTP and hardware tokens. Demonstrates the core UX loop without production-grade security.

---

## What's real vs. faked

| Real | Faked |
|---|---|
| Push notification delivery via FCM | Cryptographic device binding |
| Approval screen with transaction detail | Biometric gate |
| Number-matching code | RASP / root detection |
| Out-of-band approval loop | Account recovery |
| Web page polling for result | PSD2 dynamic linking |

---

## Components

```
backend/        Node.js + Express, in-memory state, FCM push via firebase-admin
web/            Single HTML page, vanilla JS, polls backend for approval result
mobile/         Expo / React Native Android app (coming)
context/        Research notes and architecture decisions
```

---

## Setup

### 1. Firebase

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Add an Android app — package name `com.mobiletoken.poc` — download `google-services.json`
3. Project Settings → Service Accounts → Generate new private key → save as `backend/service-account.json`
4. Enable Cloud Messaging (Build → Cloud Messaging)

`service-account.json` and `google-services.json` are gitignored — never commit them.

### 2. Backend

```bash
cd backend
npm install
node index.js
# → Backend running on http://localhost:3000
```

### 3. Web page

Open `web/index.html` directly in a browser, or serve it:

```bash
npx serve web
# → http://localhost:3001
```

### 4. Expose backend to your Android device

```bash
ngrok http 3000
```

Copy the `https://xxxx.ngrok.io` URL and update `BASE_URL` in `web/index.html` before testing on a physical device.

---

## Flow

```
1. Web page: click "Confirm Transfer"
2. Backend: creates challenge { challengeId, code: "47" }, fires FCM push
3. Android app: receives push, shows approval screen with amount + payee + code
4. User: matches code, taps Approve
5. Backend: challenge status → "approved"
6. Web page: polling detects approval, shows "✓ Transfer approved"
```

---

## API

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/device/register` | Store FCM token for a user |
| `POST` | `/challenge/create` | Create challenge, send push notification |
| `GET` | `/challenge/:id/status` | Poll for `pending` / `approved` / `denied` |
| `POST` | `/challenge/:id/approve` | Approve the challenge |
| `POST` | `/challenge/:id/deny` | Deny the challenge |

---

## Acceptance criteria

- Push notification arrives on Android within 5 seconds of web button click
- Approval screen shows amount, payee, and number-match code without scrolling on a 6" display
- Web page transitions to approved state within 3 seconds of mobile tap

---

## Not in scope

- Security of device binding (no Android Keystore / Secure Enclave)
- Malware resistance (no RASP)
- PSD2 compliance (no cryptographic signing)
- Account recovery
- iOS / APNs
