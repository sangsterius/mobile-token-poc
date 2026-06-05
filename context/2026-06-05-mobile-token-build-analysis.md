---
title: "Mobile token: build analysis & technical decisions"
project: mobile-token
created: 2026-06-05
status: draft
based-on: 2026-06-04-desk-mobile-token-auth.md
tags: [architecture, technical-decisions, mobile-token, banking, PSD2, FIDO2]
---

# Mobile token: build analysis & technical decisions

## What you're building

An **in-app authenticator** embedded in a banking mobile app (or standalone companion app) that approves web banking sessions out-of-band. The user initiates an action on web, gets a push notification on their phone, reviews the transaction detail, and approves or denies — replacing SMS OTP and hardware tokens.

---

## Architecture: the core protocol

The central architectural question is **how the web session communicates with the mobile device**. Two well-established patterns:

### Option A — OAuth CIBA (Client-Initiated Backchannel Authentication)
The IETF-standardised protocol for exactly this use case. The web front-end initiates a backchannel auth request to an authorization server; the AS delivers a push to the mobile app; the app signs the approval; the web session polls or receives a callback.

**Pros:** Standard, interoperable, auditable, aligns with PSD2. Well-supported by Keycloak, ForgeRock, Ping Identity, Auth0.  
**Cons:** Requires an OAuth AS that supports CIBA (not all do); adds operational complexity.

### Option B — Proprietary push-sign flow
The bank's backend directly delivers a signed challenge to the mobile app via FCM/APNs. The app signs it with a device-bound private key and POSTs the signature back. Simpler to build, no CIBA dependency.

**Pros:** Simpler control plane, no AS vendor dependency.  
**Cons:** Non-standard, harder to audit, more bespoke to maintain.

**Recommendation:** Start with a proprietary flow but design the signing protocol to be CIBA-compatible so it can be wrapped later. CIBA is where the industry is heading (PSD3), but the vendor ecosystem for CIBA-in-banking is still thin.

---

## The cryptographic core

Every other decision flows from this:

**Device binding = a private key that never leaves the device.**

| Layer | Technology | Decision |
|---|---|---|
| Key storage | Android Keystore / iOS Secure Enclave | Non-negotiable — software key storage is insufficient for banking |
| Key type | EC P-256 or RSA-2048 | EC P-256 recommended (smaller, faster, well-supported) |
| Signature scope | Must sign: amount + IBAN/beneficiary + timestamp + session ID | Required by PSD2 dynamic linking |
| Biometric gate | Android BiometricPrompt / iOS LocalAuthentication before key use | AAL2 requirement |
| Root/jailbreak | Detect and refuse key use on compromised devices | Required before launch |

The signature payload must be constructed **in the app**, not trusted from the push payload. The push just triggers the flow; the app fetches transaction detail independently from the bank's backend before displaying and signing.

---

## Key technical decisions to make

### 1. Embedded vs. standalone app
**Embedded in main banking app** (ABANCA, DBS model) — lower friction, shared session context, single install.  
**Standalone token app** (mBank model) — isolated attack surface, survives main app compromise.

**Recommendation:** Embedded. The DBS/ABANCA case studies show this is the dominant successful pattern. Standalone adds install friction (churn risk confirmed at 63% onboarding abandonment) with marginal security gain — Android RASP compensates.

### 2. One device vs. multi-device
**One device at a time** (DBS, Wultra) — stronger security, simpler revocation, PSD2-aligned.  
**Multi-device** (passkey sync model) — better UX, but cloud-synced keys lower assurance level.

**Recommendation:** One device. New device registration auto-revokes old. Multi-device can be added via FIDO2 registration flows later.

### 3. Push delivery: FCM/APNs vs. WebSocket fallback
Primary: Firebase Cloud Messaging (Android) + Apple Push Notification Service (iOS).  
Fallback required: when push fails (no data, roaming, permissions off), the app must support **offline TOTP** (RFC 6238) as a fallback, or a polling/WebSocket channel.

**Decision required:** TOTP offline fallback is simpler to implement and is what DBS uses. WebSocket keeps the "approve" experience but requires active connectivity.

### 4. Number matching vs. transaction detail only
PSD2 requires showing amount + payee. CISA recommends additionally showing a **number-matching code** (code shown on web, must be confirmed in app) for login operations where there's no transaction to sign.

**Recommendation:** Both. Transaction detail for payment approvals (PSD2 mandatory). Number matching for session/login approvals (fatigue attack mitigation).

### 5. Account recovery mechanism
This is the hardest problem and the most under-designed in the industry. Options:
- **Mail-based** (DBS): Secure, slow (3–5 days). Best security posture.
- **Branch visit + ID verification**: Secure, operationally expensive.
- **Step-up via legacy SMS + additional factor**: Faster, but reintroduces SMS attack surface.
- **Recovery code** (like TOTP backup codes): Fast, but the user has to store it securely.

**Decision required from the bank:** There's no universally good answer. The bank's risk appetite and customer demographics drive this. A tiered model (recovery code for self-service + branch visit as ultimate fallback) is common.

### 6. Android RASP
Given 196% surge in banking Trojans (Octo2, ToxicPanda), Android RASP is non-optional for launch.

**Options:**
- **Commercial:** Wultra Mobile Security, OneSpan (most documented in banking-specific deployments)
- **Open-source:** OWASP MAS RASP — less mature for production banking
- **Build-in-house:** Root/emulator/debugger detection, overlay detection, hook detection

**Recommendation:** Use a commercial SDK. Wultra is open-source-friendly and has documented banking deployments. The cost is justified by the 196% attack volume.

### 7. Tech stack for the mobile app
If building new or extending existing:
- **React Native / Flutter** — faster cross-platform, but Secure Enclave/Keystore integration is more complex via bridges, and RASP SDKs have better native support
- **Native (Swift + Kotlin)** — deeper security API access, better RASP SDK integration, more control over cryptographic operations

**Recommendation:** Native if security is the primary constraint (it is for banking). The cryptographic and biometric APIs are better-integrated and RASP SDKs are primarily tested native. If team is Flutter-first, it's viable but requires careful vetting of the key storage bridge.

---

## What to build, in order

```
Phase 1 — Core (MVP, required for any launch)
├── Device registration flow (key generation in Secure Enclave/Keystore)
├── Biometric gate on key use
├── Push notification delivery (FCM + APNs)
├── Transaction signing (PSD2: amount + IBAN + timestamp)
├── Approval screen (transaction detail + approve/deny)
├── Root/jailbreak detection
└── Basic account recovery (at least: mail-based + support contact)

Phase 2 — Hardening (required before scale)
├── Android RASP (overlay detection, hook detection, emulator detection)
├── Number-matching for login approvals
├── Offline TOTP fallback
├── Replay protection (nonce / challenge expiry)
└── Anomaly detection integration (flag concurrent approvals, unusual geography)

Phase 3 — Future path
├── FIDO2/passkey registration (highest-risk users: corporate, high-net-worth)
├── Multi-device via explicit re-registration
├── CIBA protocol wrapper
└── PSD3 compliance readiness
```

---

## Non-negotiables before launch

1. **Transaction details in the push** — amount + payee. Not just "approve?" Bare push is PSD2 non-compliant and fatigue-attack-vulnerable.
2. **Device-bound keys** — Secure Enclave / Android Keystore. No software keys, no cloud sync.
3. **Android RASP** — banking Trojans are at scale now.
4. **Tested recovery flow** — documented and rehearsed before go-live, not figured out after the first locked-out customer calls.

---

## Open decisions for the bank

| Decision | Options | Urgency |
|---|---|---|
| Account recovery UX | Mail / branch / recovery code / tiered | Must decide before Phase 1 |
| Standalone vs. embedded app | Embedded (recommended) vs. standalone | Must decide before architecture |
| CIBA now vs. proprietary-then-CIBA | Proprietary (recommended for speed) vs. CIBA-first | Phase 1 scope |
| Offline fallback | TOTP vs. WebSocket | Phase 1 scope |
| RASP vendor | Wultra / OneSpan / custom | Phase 2 scope |
| Target native vs. cross-platform | Native (recommended) vs. Flutter | Before Phase 1 |
