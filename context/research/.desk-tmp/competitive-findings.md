---
sub_agent: competitive
timestamp: 2026-06-04T12:00:00Z
queries_run: 20
sources_reviewed: 38
findings_passed_rubric: 18
disconfirming_findings: 6
---

## Summary

The competitive scan confirms that mobile push / in-app authentication is the dominant direction for retail banking globally, with strong regulatory tailwinds (PSD2/SCA in Europe, UAE CBUAE OTP ban by March 2026, Singapore/India equivalents). Banks across all tiers — from DBS (Singapore), ABANCA (Spain), and Nordea (Scandinavia) to mBank and PKO BP (Poland) — have either deployed or are actively deploying mobile token / push authentication as a replacement for SMS OTP and hardware tokens.

The strongest confirming evidence comes from measurable outcomes at ABANCA (42% of mobile customers using passkeys/mobile token for high-risk transaction authorisation; CES 4.7; 11M transactions protected), NTT DOCOMO (50%+ passkey auth rate; zero unrecognised payments at online shop since 2022), and the broader FIDO Alliance World Passkey Day 2025 report. DBS Bank's digital token implementation (replaces 16,000 physical tokens/month) and Wultra's Moldindconbank case study (PSD2-compliant mobile token, 1M+ customers) show that the architectural pattern — push notification approval, one-device-one-token, biometric protection — is well-established.

The most significant disconfirming evidence involves push notification MFA fatigue/bombing attacks (217% YoY increase, proven in the Scattered Spider/Caesars case), the 1,055% surge in UK SIM swaps in 2024 (Cifas report), Android banking malware that bypasses token auth via overlay/device-takeover (196% surge in Trojan banker attacks in 2024), and UX drop-off data showing 50–65% completion rates for password+SMS 2FA flows. Critically, mobile push auth does not eliminate fraud risk — it shifts it toward social engineering (users self-approve fraudulent transactions) and device compromise vectors. Authorized Push Payment (APP) fraud caused £450.7M in UK losses in 2024 despite authentication controls.

---

## Confirming Findings (sorted by confidence desc)

```yaml
finding_id: f001
research_question: 1
claim: "ABANCA reports that 42% of its 1.2M monthly mobile banking customers use passkeys (ABANCA Key) for transaction authorisation, protecting over 11 million high-risk transactions without service incidents, with a Customer Effort Score of 4.7."
confidence: High
sources:
  - url: "https://fidoalliance.org/celebrating-world-passkey-day-2025-showcase-of-real-world-passkey-deployments/"
    title: "Celebrating World Passkey Day 2025: Showcase of Real-World Passkey Deployments"
    author: "FIDO Alliance"
    year: 2025
    type: case_study
    is_vendor: false
    effect_size: "42% of 1.2M monthly mobile customers using passkeys; 11M high-risk transactions protected; CES 4.7"
notes: "ABANCA is a FIDO Alliance member; this is a self-reported case study promoted by FIDO Alliance. Independent audit not confirmed. Nonetheless it is the clearest banking-specific mobile auth metric found."
disconfirming_for_hypothesis: false
```

```yaml
finding_id: f002
research_question: 1
claim: "NTT DOCOMO reports passkeys are used for 50%+ of d ACCOUNT authentication, with zero unrecognised payments at the docomo Online Shop since September 2022, demonstrating phishing elimination for enrolled users."
confidence: High
sources:
  - url: "https://fidoalliance.org/celebrating-world-passkey-day-2025-showcase-of-real-world-passkey-deployments/"
    title: "Celebrating World Passkey Day 2025: Showcase of Real-World Passkey Deployments"
    author: "FIDO Alliance"
    year: 2025
    type: case_study
    is_vendor: false
    effect_size: ">50% auth by passkey; 0 unrecognised payments since Sep 2022"
notes: "Applies to passkey/FIDO2 specifically; partial overlap with mobile token use case. The metric covers e-commerce shop only, not all banking channels."
disconfirming_for_hypothesis: false
```

```yaml
finding_id: f003
research_question: 5
claim: "PSD2 SCA requires multi-factor authentication (possession + knowledge/inherence) with dynamic linking for electronic payment transactions; push notification approval from a banking app satisfies the possession element and, combined with biometric unlock, satisfies the SCA requirement."
confidence: High
sources:
  - url: "https://www.corbado.com/blog/psd2-sca-requirements/psd2-authentication-requirements"
    title: "What is PSD2 & how does it impact authentication requirements?"
    author: "Corbado"
    year: 2024
    type: analyst_report
    is_vendor: false
    effect_size: "N/A — regulatory requirement"
  - url: "https://www.onespan.com/blog/regulatory-updates-strong-authentication-digital-banking-and-workforce"
    title: "2025 global regulatory updates on strong authentication"
    author: "OneSpan"
    year: 2025
    type: trade_press
    is_vendor: true
    effect_size: "N/A"
notes: "Dynamic linking requirement means the authentication code must be bound to specific transaction amount and payee — pure push notification without transaction detail display is insufficient. This is a key implementation constraint."
disconfirming_for_hypothesis: false
```

```yaml
finding_id: f004
research_question: 3
claim: "SIM swap attacks increased 1,055% in the UK in 2024 (289 to nearly 3,000 cases), with 48% of all account takeovers in 2024 involving mobile phone accounts; app-based mobile tokens are device-bound and not affected by SIM swaps, unlike SMS OTP."
confidence: High
sources:
  - url: "https://www.cifas.org.uk/newsroom/huge-surge-see-sim-swaps-hit-telco-and-mobile"
    title: "1,055% surge in unauthorised SIM swaps as mobile and telecoms sector hit hard by rising fraud"
    author: "Cifas"
    year: 2025
    type: analyst_report
    is_vendor: false
    effect_size: "1,055% increase; 2,978 cases in 2024 vs 289 in 2023; 48% of account takeovers involved mobile accounts"
notes: "From Cifas Fraudscape 2025 annual report — authoritative UK industry source. Supports the case for moving away from SMS OTP to device-bound mobile token."
disconfirming_for_hypothesis: false
```

```yaml
finding_id: f005
research_question: 1
claim: "DBS Bank (Singapore) deployed a digital token replacing 16,000 physical hardware tokens per month; the token uses one-device binding, push notification approval, with fallback to manual OTP when offline."
confidence: High
sources:
  - url: "https://www.dbs.com.sg/personal/deposits/bank-with-ease/digital-token"
    title: "Set Up And Activate Your Digital Token With DBS"
    author: "DBS Bank"
    year: 2024
    type: case_study
    is_vendor: false
    effect_size: "16,000 physical tokens replaced per month"
notes: "Published on DBS official website. One-device restriction is a key security architecture choice. Fallback to manual OTP when push not received is explicitly documented."
disconfirming_for_hypothesis: false
```

```yaml
finding_id: f006
research_question: 2
claim: "DBS Bank implements a one-device-per-customer binding rule for digital tokens; when a customer changes devices, the old token is automatically deregistered, and lost-phone recovery requires a registration code mailed to the address on file (3–5 working days)."
confidence: High
sources:
  - url: "https://www.dbs.com.sg/personal/deposits/bank-with-ease/digital-token"
    title: "Set Up And Activate Your Digital Token With DBS"
    author: "DBS Bank"
    year: 2024
    type: case_study
    is_vendor: false
    effect_size: "N/A — design pattern"
notes: "The 3–5 day fallback for lost phones is a significant UX friction point and a potential support burden. Banks accepting this trade-off prioritise security over frictionless recovery."
disconfirming_for_hypothesis: false
```

```yaml
finding_id: f007
research_question: 1
claim: "mBank (Poland) launched a standalone mBank Token app as an alternative authentication channel, separate from the main banking app, available on iOS and Android, designed to replace SMS OTP and one-time code cards."
confidence: Medium
sources:
  - url: "https://prnews.pl/kolejne-zmiany-w-mbanku-znika-serwis-light-i-lista-z-haslami-jednorazowymi-pojawi-sie-aplikacja-mbank-token-444594"
    title: "Kolejne zmiany w mBanku. Pojawi sie aplikacja mBank Token"
    author: "PRNews.pl"
    year: 2023
    type: trade_press
    is_vendor: false
    effect_size: "N/A — product launch announcement"
notes: "Polish-language source. No adoption metrics found. The standalone token app approach differs from embedded in-banking-app; relevant architectural comparison point."
disconfirming_for_hypothesis: false
```

```yaml
finding_id: f008
research_question: 1
claim: "Santander Bank Polska offers three authentication methods at no charge: SMS codes, token, and mobile signature in its app; Nordea ID App enables log-on and payment confirmation with a hardware fallback (ID Device) for customers unable to use the mobile app."
confidence: Medium
sources:
  - url: "https://www.santander.pl/klient-indywidualny/bankowosc-internetowa/santander-mobile/mobilna-autoryzacja"
    title: "Mobilna autoryzacja w aplikacji Santander"
    author: "Santander Bank Polska"
    year: 2024
    type: case_study
    is_vendor: false
    effect_size: "N/A — product description"
  - url: "https://nordea.com/en/our-services/cashmanagement/supportandcontact/authentication"
    title: "Authentication | Nordea"
    author: "Nordea"
    year: 2024
    type: case_study
    is_vendor: false
    effect_size: "N/A"
notes: "Both banks show the multi-method approach: mobile token as primary, hardware/SMS as fallback. No adoption numbers."
disconfirming_for_hypothesis: false
```

```yaml
finding_id: f009
research_question: 1
claim: "Wultra delivered a PSD2-compliant mobile token app for Moldindconbank (Moldova, 1M+ customers), replacing legacy auth with a push-based approval flow, as part of EU candidate accession preparations."
confidence: Medium
sources:
  - url: "https://www.wultra.com/case-studies/wultra-delivers-mobile-token-app-for-moldindconbank"
    title: "Wultra Delivers Mobile Token App for Moldindconbank"
    author: "Wultra"
    year: 2024
    type: case_study
    is_vendor: true
    effect_size: "1M+ customers served"
notes: "[VENDOR] Source is Wultra (the solution provider). No independent verification. Useful as implementation pattern reference."
disconfirming_for_hypothesis: false
```

```yaml
finding_id: f010
research_question: 3
claim: "Yahoo! JAPAN (LY Corporation) reports passkey sign-ins are 2.6x faster than SMS OTP and have a higher success rate; 28 million active passkey users with approximately 50% of smartphone authentication using passkeys."
confidence: High
sources:
  - url: "https://fidoalliance.org/celebrating-world-passkey-day-2025-showcase-of-real-world-passkey-deployments/"
    title: "Celebrating World Passkey Day 2025: Showcase of Real-World Passkey Deployments"
    author: "FIDO Alliance"
    year: 2025
    type: case_study
    is_vendor: false
    effect_size: "2.6x faster than SMS OTP; 28M active passkey users; ~50% smartphone auth"
notes: "Financial services adjacent (not banking per se). Demonstrates passkey/FIDO2 UX superiority to SMS OTP at scale."
disconfirming_for_hypothesis: false
```

```yaml
finding_id: f011
research_question: 5
claim: "The UAE Central Bank mandated that all licensed financial institutions eliminate SMS and email OTPs by March 2026, accelerating app-based mobile push authentication adoption in UAE banking."
confidence: High
sources:
  - url: "https://www.infobip.com/blog/mobile-push-authentication-for-secure-banking"
    title: "How mobile push authentication is redefining security in banking"
    author: "Infobip"
    year: 2025
    type: trade_press
    is_vendor: true
    effect_size: "N/A — regulatory mandate"
  - url: "https://idtechwire.com/with-billions-of-accounts-supporting-passkeys-fido-anticipates-2025-breakthroughs-in-banking-payments-and-travel/"
    title: "With Billions of Accounts Supporting Passkeys, FIDO Anticipates 2025 Breakthroughs in Banking, Payments, and Travel"
    author: "ID Tech Wire"
    year: 2025
    type: trade_press
    is_vendor: false
    effect_size: "N/A"
notes: "CBUAE directive corroborated by multiple sources. Philippines and Singapore/India have similar OTP phase-out trajectories."
disconfirming_for_hypothesis: false
```

```yaml
finding_id: f012
research_question: 3
claim: "NIST 800-63B defines AAL2 as requiring two authentication factors with cryptographic techniques; synced passkeys satisfy AAL2, while device-bound passkeys satisfy AAL3; mobile push authentication with device-bound keys meets AAL2 requirements suitable for financial transactions."
confidence: High
sources:
  - url: "https://pages.nist.gov/800-63-4/sp800-63b/aal/"
    title: "Authentication Assurance Levels — NIST 800-63B"
    author: "NIST"
    year: 2024
    type: peer_reviewed
    is_vendor: false
    effect_size: "N/A — regulatory standard"
  - url: "https://www.corbado.com/blog/nist-passkeys/authenticator-assurance-levels-aal-digital-identity"
    title: "Authenticator Assurance Levels in digital identity"
    author: "Corbado"
    year: 2024
    type: analyst_report
    is_vendor: false
    effect_size: "N/A"
notes: "NIST 800-63B is the definitive standard. Mobile token implementations must be device-bound (not cloud-synced) for AAL3; AAL2 suffices for most banking use cases."
disconfirming_for_hypothesis: false
```

```yaml
finding_id: f013
research_question: 5
claim: "The PSD2 dynamic linking requirement mandates that the authentication code fail if a man-in-the-middle modifies the payee or amount; mobile push implementations must display transaction details (amount, beneficiary) within the push notification to satisfy this requirement."
confidence: High
sources:
  - url: "https://stripe.com/guides/strong-customer-authentication"
    title: "Strong Customer Authentication"
    author: "Stripe"
    year: 2024
    type: trade_press
    is_vendor: true
    effect_size: "N/A — regulatory requirement"
  - url: "https://www.corbado.com/blog/psd2-passkeys/strong-customer-authentication-psd2"
    title: "What is Strong Customer Authentication (SCA) under PSD2?"
    author: "Corbado"
    year: 2024
    type: analyst_report
    is_vendor: false
    effect_size: "N/A"
notes: "Critical implementation constraint: a plain push notification saying 'approve?' is NOT PSD2-compliant. The notification must include the specific amount and payee."
disconfirming_for_hypothesis: false
```

---

## Disconfirming Findings (sorted by confidence desc)

```yaml
finding_id: d001
research_question: 4
claim: "MFA fatigue / push-bombing attacks increased 217% year-over-year; in 2023 Microsoft reported 6,000+ daily MFA attacks on customer identities; Scattered Spider used push-bombing to breach Caesars Entertainment in September 2023, demonstrating that push notification approval is exploitable via social engineering."
confidence: High
sources:
  - url: "https://security.uchicago.edu/2024/10/01/mfa-fatigue-attacks/"
    title: "MFA Fatigue Attacks — University of Chicago Information Security"
    author: "University of Chicago"
    year: 2024
    type: blog
    is_vendor: false
    effect_size: "217% YoY increase in push-bombing; >6,000 daily attacks in 2023 (Microsoft data)"
  - url: "https://www.rippleshot.com/post/push-bombing-scams-protecting-your-cardholders-from-mfa-fatigue"
    title: "Push Bombing Scams: Protecting Your Cardholders from MFA Fatigue"
    author: "Rippleshot"
    year: 2024
    type: trade_press
    is_vendor: false
    effect_size: "N/A"
  - url: "https://www.cisa.gov/sites/default/files/publications/fact-sheet-implement-number-matching-in-mfa-applications-508c.pdf"
    title: "Implementing Number Matching in MFA Applications"
    author: "CISA"
    year: 2023
    type: peer_reviewed
    is_vendor: false
    effect_size: "98% drop in successful MFA fatigue attacks when number matching is implemented"
notes: "The mitigation (number matching, context-aware push) is well-documented and effective. CISA data on 98% drop with number matching is the key design implication."
disconfirming_for_hypothesis: true
```

```yaml
finding_id: d002
research_question: 4
claim: "Android banking Trojan attacks surged 196% in 2024 to 1.24 million attacks on mobile devices; malware families (Octo2, ToxicPanda, RatOn) perform device-takeover and overlay attacks that can intercept or fraudulently approve push notifications on the victim's device, bypassing mobile token security."
confidence: High
sources:
  - url: "https://thehackernews.com/2024/09/new-octo2-android-banking-trojan.html"
    title: "New Octo2 Android Banking Trojan Emerges with Device Takeover Capabilities"
    author: "The Hacker News"
    year: 2024
    type: trade_press
    is_vendor: false
    effect_size: "196% surge; 1.24M Android device attacks in 2024"
  - url: "https://thehackernews.com/2024/11/new-android-banking-malware-toxicpanda.html"
    title: "New Android Banking Malware 'ToxicPanda' Targets Users with Fraudulent Money Transfers"
    author: "The Hacker News"
    year: 2024
    type: trade_press
    is_vendor: false
    effect_size: "On-device fraud (ODF) via account takeover"
notes: "Device compromise negates the out-of-band security benefit of a mobile token. In-app runtime protection is a necessary complementary control. CSOB deployed Wultra in-app protection specifically to address this risk."
disconfirming_for_hypothesis: true
```

```yaml
finding_id: d003
research_question: 4
claim: "Authorized Push Payment (APP) fraud caused 450.7M GBP in losses in the UK in 2024 despite widespread mobile banking authentication; 70% of APP fraud cases originated online, indicating authentication controls do not prevent social engineering attacks where users willingly authorise fraudulent payments."
confidence: High
sources:
  - url: "https://www.ukfinance.org.uk/news-and-insight/press-release/fraud-report-2025-press-release"
    title: "Fraud continues to pose a major threat with over 1 billion GBP stolen in 2024"
    author: "UK Finance"
    year: 2025
    type: analyst_report
    is_vendor: false
    effect_size: "450.7M GBP APP fraud losses in 2024; 70% of cases originated online"
  - url: "https://www.psr.org.uk/media/uaag25pp/app-fraud-publication-jul-2024-v6.pdf"
    title: "Authorised push payments fraud performance report July 2024"
    author: "UK Payment Systems Regulator"
    year: 2024
    type: analyst_report
    is_vendor: false
    effect_size: "570M GBP stolen in H1 2024"
notes: "APP fraud is the most critical disconfirming finding: the mobile token approves a transaction that the user has been socially engineered into initiating. Authentication layer is bypassed, not attacked. Mobile token cannot solve this fraud vector."
disconfirming_for_hypothesis: true
```

```yaml
finding_id: d004
research_question: 2
claim: "91% of older adults prefer traditional single-mode authentication over MFA; banking app updates in 2026 are blocking older smartphones common among elderly users, creating digital exclusion risk where mobile-token-only authentication fails a significant customer segment."
confidence: Medium
sources:
  - url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12759956/"
    title: "Navigating Digital Security and Usability Challenges for Older Adults With Cognitive Concerns"
    author: "NIH/PMC"
    year: 2025
    type: peer_reviewed
    is_vendor: false
    effect_size: "91% of older adults preferred traditional/single-mode authentication"
  - url: "https://yournews.com/2026/04/24/6841665/the-2026-bank-app-update-blocking-older-phones-why/"
    title: "The 2026 Bank App Update Blocking Older Phones — Why Thousands Can't Log In"
    author: "YourNews"
    year: 2026
    type: trade_press
    is_vendor: false
    effect_size: "N/A"
notes: "Mobile-token-only strategy risks excluding elderly and low-income customers without compatible smartphones. Fallback mechanisms are required for accessibility."
disconfirming_for_hypothesis: true
```

```yaml
finding_id: d005
research_question: 4
claim: "42% of UK banks and 61% of crypto exchanges continued using SMS as their default second factor in 2024, suggesting adoption of app-based mobile token is slower than the fraud evidence would justify."
confidence: Medium
sources:
  - url: "https://deepstrike.io/blog/sim-swap-scam-statistics-2025"
    title: "SIM Swap Scam Statistics 2025: Losses & Prevention"
    author: "DeepStrike"
    year: 2025
    type: trade_press
    is_vendor: false
    effect_size: "42% of UK banks still default to SMS 2FA in 2024"
notes: "Source is a cybersecurity vendor blog without primary survey reference. Medium confidence. Shows market penetration of mobile token auth is still partial in advanced markets."
disconfirming_for_hypothesis: true
```

```yaml
finding_id: d006
research_question: 2
claim: "Typical authentication completion rates are 50-65% for password plus SMS 2FA; adding mandatory mobile app approval introduces additional friction with 63% global abandonment when onboarding identity steps feel slow."
confidence: Medium
sources:
  - url: "https://ironvest.com/blog/is-two-factor-authentication-hurting-your-mobile-banking-ux/"
    title: "Build better mobile banking UX with a two-factor authentication alternative"
    author: "IronVest"
    year: 2024
    type: blog
    is_vendor: true
    effect_size: "50-65% completion rate for password+SMS 2FA"
  - url: "https://insart.com/anatomy-of-trust-fintech-ux-onboarding-dropoff/"
    title: "The Anatomy of Trust in Fintech UX: Why Users Drop at Onboarding"
    author: "INSART"
    year: 2024
    type: trade_press
    is_vendor: false
    effect_size: "63% abandonment when onboarding feels slow"
notes: "[VENDOR] first source. Completion rate data is consistent across sources. Mobile token activation adds a one-time onboarding step that can increase early abandonment."
disconfirming_for_hypothesis: true
```

---

## Gaps & Failed Queries

1. ING Bank and Revolut engineering blogs: No detailed engineering blog posts on mobile authentication architecture found.
2. PKO BP mobile token adoption metrics: Polish-language sources confirm PKO BP uses app-based authorization (IKO app) but no quantitative adoption data found.
3. Starling Bank authentication architecture: No specific technical documentation found.
4. BBVA mobile authentication case study: No specific BBVA engineering blog or case study found.
5. Commerzbank / ABN AMRO / Rabobank: No specific deployment details found.
6. Erste Bank (CZ/AT): Wultra's CSOB case study (in-app protection) found, but no specific Erste mobile token deployment data.

---

## Recommended Follow-Up Queries

1. "Revolut security engineering authentication" site:medium.com OR site:engineering.revolut.com
2. "ING bank PowerAuth mobile authentication" OR "ING mobile token SCA PSD2"
3. "PKO BP IKO mobile token authentication statistics"
4. "Starling Bank 2FA mobile authentication security engineering"
5. "BBVA mobile banking authentication FIDO2 case study"
6. "social engineering mobile token bypass banking account takeover 2024" — to further investigate d003 APP fraud vector
7. "number matching banking push notification implementation UX impact" — evidence on MFA fatigue mitigation
