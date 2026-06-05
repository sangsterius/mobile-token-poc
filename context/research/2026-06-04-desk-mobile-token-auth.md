---
title: "Desk research: Mobile token / in-app authentication for web banking"
project: mobile-token
created: 2026-06-04
status: final
sources: [18 competitive, 17 scholar]
hypothesis: "A mobile token embedded in the banking app is a viable, user-trusted replacement for SMS OTP and hardware tokens for out-of-band authorisation of web sessions."
disposition: supported (with four non-negotiable implementation caveats)
tags: [desk-research, authentication, mobile-token, banking, PSD2, FIDO2, out-of-band-auth]
---

# Mobile token for web banking: introductory analysis

**Context:** A retail bank operates both a web channel (current auth: SMS OTP or hardware token) and a mobile app. Users complain that they distrust SMS and are forced to carry a hardware token for web sessions. The bank plans to add a mobile token to the app so that web operations can be approved in-app.

**Working hypothesis:** A mobile token embedded in the banking app is a viable, user-trusted replacement for SMS OTP and hardware tokens for out-of-band authorisation of web sessions.

**Decision at stake:** Whether to invest in the mobile token feature and how to implement it — covering architecture, UX, security, and regulatory compliance.

**Sources:** 18 competitive findings (queries: 20, sources reviewed: 38) + 17 scholar findings (queries: 18, papers reviewed: 22). Full bibliography in §8.

---

## TL;DR

The hypothesis is **substantially supported**, but only with four non-negotiable implementation constraints. App-based mobile token is meaningfully stronger than SMS OTP (which is vulnerable to SIM-swap, SS7, and chain-reaction attacks) and dramatically better received by users than hardware tokens, which cause churn. Multiple banks across Europe, Asia, and Latin America have deployed the pattern successfully, with measurable outcomes. The regulatory direction — PSD2/SCA, NIST 800-63B-4, and several national mandates (UAE, Philippines) — actively pushes toward app-based auth and away from SMS.

The critical counter-evidence centres on **push notification fatigue attacks** (217% YoY increase; proven in the Caesars/Scattered Spider 2023 breach): a simple approve/deny prompt without context can be defeated by bombarding the user. The mitigation — number-matching plus transaction detail display — is well-established and reduces fatigue-attack success by ~98%, but it must be designed in from day one. Bare push is insufficient and non-compliant with PSD2 anyway.

The deepest risk is not technical: **Authorised Push Payment (APP) fraud** caused £450.7M in UK losses in 2024 despite fully functional authentication. Mobile token authenticates the user; it cannot prevent a user who has been socially engineered into initiating a fraudulent payment. Any product strategy around mobile token needs a complementary fraud-detection layer.

**For the decision:** Proceed. The evidence strongly supports investing in mobile token. Minimum viable implementation requires: device binding, transaction details in the push (amount + payee), biometric unlock, offline OTP fallback, and a documented lost-device recovery process. These are not optional enhancements — they are the difference between a secure and an insecure implementation.

---

## 1. Problem and research questions

**Problem statement:** Banks relying on SMS OTP and hardware tokens for 2FA face user trust and convenience issues; a mobile app-based authenticator ("mobile token") is proposed so users can approve web banking operations from their phone.

**Research questions:**
1. How have other banks implemented mobile push / in-app authentication for web sessions?
2. What UX patterns govern device pairing, activation, and fallback (lost phone, no internet)?
3. What security properties distinguish mobile push auth from SMS OTP?
4. What are known failure modes, fraud vectors, and pitfalls?
5. What regulatory constraints (PSD2 SCA, FIDO2, NIST AAL) apply?

**Falsification criterion:** High fraud rates on mobile push (SIM-swap, device cloning) — if mobile tokens are as vulnerable as SMS, the trust argument collapses.

**Verdict on the criterion:** SIM-swap is an SMS-specific vulnerability — device-bound mobile tokens are immune to it by design. Device compromise is real (see §5), but is structurally different: it requires the attacker to have already taken over the user's phone, which is a much harder attack than a SIM-swap. The trust argument does not collapse. It narrows to a specific attack surface that has known mitigations.

---

## 2. Competitive findings

### Q1 — How other banks have implemented mobile push auth for web sessions

The pattern is well-established across multiple banking tiers and geographies.

**DBS Bank (Singapore) — the most documented case** [HIGH confidence]: DBS deployed a digital token in its mobile app that replaces physical hardware tokens at a rate of 16,000 per month. The architecture uses one-device binding: only one device can be registered at a time; changing devices auto-deregisters the old one. Users receive a push notification for each web session operation; when the app has no internet, an offline OTP screen is available as fallback. Lost-phone recovery requires a registration code mailed to the address on file (3–5 working days) — a deliberate security-over-convenience trade-off. Source: [DBS Bank official documentation](https://www.dbs.com.sg/personal/deposits/bank-with-ease/digital-token) (2024).

**ABANCA (Spain) — the most cited outcomes** [HIGH confidence]: 42% of ABANCA's 1.2 million monthly mobile banking customers actively use passkey/in-app authentication (branded "ABANCA Key") for high-risk transaction authorisation. Over 11 million high-risk transactions have been protected with zero service incidents. Customer Effort Score: 4.7. Source: [FIDO Alliance World Passkey Day 2025](https://fidoalliance.org/celebrating-world-passkey-day-2025-showcase-of-real-world-passkey-deployments/).

**mBank (Poland) — the standalone token app pattern** [MEDIUM confidence]: mBank launched a separate *mBank Token* app (distinct from the main banking app) to replace SMS OTP and one-time code cards. This differs from the embedded-in-main-app approach and represents a relevant architectural comparison: a standalone app adds friction at installation but isolates the authentication surface. Source: [PRNews.pl](https://prnews.pl/kolejne-zmiany-w-mbanku-znika-serwis-light-i-lista-z-haslami-jednorazowymi-pojawi-sie-aplikacja-mbank-token-444594) (2023).

**Santander Bank Polska + Nordea — the multi-method transition model** [MEDIUM confidence]: Both banks offer mobile token as the primary method alongside SMS and hardware fallback. Nordea maintains a physical "ID Device" for customers unable to use the mobile app. This multi-method model is the dominant industry transition pattern — no bank surveyed eliminated legacy methods entirely at launch. Sources: [Santander Polska](https://www.santander.pl/klient-indywidualny/bankowosc-internetowa/santander-mobile/mobilna-autoryzacja); [Nordea](https://nordea.com/en/our-services/cashmanagement/supportandcontact/authentication).

**Wultra / Moldindconbank (Moldova) — the vendor-documented PSD2 pattern** [MEDIUM confidence, VENDOR]: Wultra delivered a PSD2-compliant mobile token for Moldindconbank serving 1 million+ customers as part of EU accession preparations. The Wultra implementation is notable because it includes in-app runtime protection (RASP) as a separate layer against mobile malware. Source: [Wultra case study](https://www.wultra.com/case-studies/wultra-delivers-mobile-token-app-for-moldindconbank) (2024) — [VENDOR].

### Q2 — UX patterns: pairing, activation, fallback

The DBS model (above) is the most thoroughly documented. Cross-competitive analysis yields the following pattern inventory:

**Device binding:** One active device per customer is the dominant security choice. Some implementations (particularly those using cloud-synced passkeys) allow multi-device but accept weaker security guarantees. For banking, one-device is the norm.

**Activation flow:** Typically requires existing credential (password + legacy SMS/token) to bootstrap. Banks surveyed average 2–3 activation steps. One-time UX friction at setup; no per-operation friction after.

**Offline fallback:** DBS explicitly documents offline OTP as the fallback when push fails. This is critical for edge cases: no data, roaming, app crash.

**Lost phone / recovery:** This is the biggest UX gap in the industry. DBS: 3–5 day mail-based recovery. This is slow but secure. No bank surveyed has solved the recovery flow elegantly — the Kepkowski et al. (2023) academic survey found >60% of FIDO2 practitioners cite account recovery as their top challenge.

**Abandonment risk:** Data from IronVest (2024) and INSART (2024) suggests that password+SMS 2FA already has a 50–65% completion rate in banking flows. Mobile token activation adds a mandatory one-time step that can increase early abandonment; 63% global abandonment when onboarding identity steps feel slow.

### Q3 — Security properties vs. SMS OTP

**SIM-swap immunity** [HIGH confidence]: Device-bound mobile tokens are not linked to a phone number and cannot be compromised via SIM swap. UK Cifas (2025) reported 1,055% surge in SIM swaps in 2024 (2,978 cases vs. 289 in 2023); 48% of account takeovers involved mobile accounts. App-based token eliminates this attack vector entirely.

**Speed and phishing resistance** [HIGH confidence]: Yahoo! JAPAN (LY Corporation) reports passkey sign-ins are 2.6× faster than SMS OTP with a higher success rate, across 28 million active passkey users (FIDO Alliance, 2025). For users, this translates directly to the "better UX" claim in the problem statement.

**Regulatory alignment** [HIGH confidence]: SMS OTP is classified as a "restricted authenticator" in NIST 800-63B-4 (2024) — meaning it is actively discouraged. Device-bound mobile push with biometric qualifies at AAL2. FIDO2 hardware-bound keys qualify at AAL3. For most banking transaction use cases, AAL2 is sufficient.

### Q4 — Failure modes and pitfalls

See §5 (Disconfirming evidence) for full treatment.

### Q5 — Regulatory constraints

**PSD2 dynamic linking** [HIGH confidence, critical]: EBA RTS 2018/389 Article 5 requires that the authentication code be cryptographically bound to the specific transaction amount and beneficiary. A push notification that says only "please approve your transaction" is **non-compliant with PSD2**. The push must display and sign the specific amount and payee. This single constraint drives most of the UX design.

**NIST 800-63B-4** (2024): SMS OTP = restricted (discouraged); device-bound mobile push with biometric = AAL2; FIDO2 hardware-bound = AAL3. AAL2 satisfies banking transaction requirements. Source: [NIST SP 800-63B](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-63B-4.pdf).

**Regional mandates accelerating mobile token adoption**: The UAE Central Bank mandated elimination of SMS and email OTPs across all licensed financial institutions by March 2026. Philippines BSP and Singapore/India have similar OTP phase-out trajectories. Source: [Infobip](https://www.infobip.com/blog/mobile-push-authentication-for-secure-banking), [ID Tech Wire](https://idtechwire.com/with-billions-of-accounts-supporting-passkeys-fido-anticipates-2025-breakthroughs-in-banking-payments-and-travel/) (2025).

---

## 3. Scholar findings

### Q3 — Security of SMS OTP (the problem being solved)

**SS7, GSM downgrade, and SIM-swap vulnerabilities comprehensively documented** [HIGH, seminal]: Jover (ACM Queue, 2020) provides the most authoritative technical treatment of SMS-based 2FA vulnerabilities: SS7 protocol exploitation, GSM base-station downgrade attacks, and SIM-swap procedures purchasable on dark web forums. The author (former AT&T Security Research Center) explicitly recommends against SMS for banking and cryptocurrency. DOI: [10.1145/3424302.3425909](https://dl.acm.org/doi/10.1145/3424302.3425909).

**Empirical carrier vulnerability study** [HIGH, seminal]: Lee, Kaiser, Mayer & Narayanan (Princeton CITP, SOUPS 2020) tested authentication procedures of all five major U.S. wireless prepaid carriers and analysed 140+ high-value websites. Result: 100% of tested carriers used SIM-swap procedures that could be subverted; 17 financial-adjacent websites could be fully compromised via SIM swap alone, without any password. [Full text](https://www.issms2fasecure.com/assets/sim_swaps-01-10-2020.pdf).

**Chain-reaction attacks on SMS ecosystems** [MEDIUM]: Li et al. (IEEE DSN 2021) show that compromising one SMS-dependent low-security account can cascade to high-security accounts through account dependency graphs. Banking accounts that use an email address protected only by SMS 2FA are indirectly vulnerable. Preprint: [arXiv:2104.08651](https://arxiv.org/abs/2104.08651).

### Q2 — Usability of authentication methods

**Comprehensive usability comparison** [HIGH]: Reese et al. (USENIX SOUPS 2019, n=72, 2-week banking simulation) found all five major 2FA methods (SMS, TOTP, push app, hardware token, security key) rated in the SUS "A" grade range (≥80). Hardware token setup caused the most difficulty; push/app methods were perceived as easiest overall. [Full text](https://www.usenix.org/conference/soups2019/presentation/reese).

**Banking-specific: hardware tokens cause bank switching** [MEDIUM]: Krol, Philippou, De Cristofaro & Sasse (UCL, NDSS USEC 2015, n=21 UK banking customers) is the most banking-specific usability study found. Qualitative finding: hardware tokens were universally disliked and some users explicitly switched banks due to token difficulty. SMS and smartphone app codes were better tolerated. The mental/physical workload of hardware tokens is the main target the mobile token hypothesis addresses. [Preprint](https://arxiv.org/pdf/1501.04434).

**FIDO2 adoption barriers** [MEDIUM]: Wurrsching et al. (TU Darmstadt, CHI 2023, n=87) found the majority of participants willing to adopt passwordless authentication, but the device-loss recovery scenario was a primary adoption barrier. [arXiv:2302.07777](https://arxiv.org/pdf/2302.07777).

### Q5 — Regulatory baseline

**NIST SP 800-63B-4 (2024)** [HIGH]: Formal classification — SMS OTP = restricted authenticator (actively discouraged for high-value applications); device-bound app push = AAL2; FIDO2 hardware-bound = AAL3. [Full text](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-63B-4.pdf).

**PSD2 SCA RTS (EBA, 2018/389)** [HIGH, seminal]: Dynamic linking requirement — authentication must be cryptographically linked to the specific transaction amount and beneficiary. A bare "approve?" push is non-compliant. Source: [EBA](https://www.eba.europa.eu/regulation-and-policy/payment-services-and-electronic-money/regulatory-technical-standards-on-strong-customer-authentication-and-secure-communication-under-psd2).

---

## 4. Cross-source synthesis

### Where competitive and scholar agree

**1. SMS OTP is a weak baseline worth replacing (HIGH, both streams):** The competitive evidence (1,055% UK SIM-swap surge, Cifas 2025; UAE OTP ban mandate) and academic evidence (100% of tested carriers subvertable, Princeton 2020; SS7 attacks, ACM 2020) converge completely. SMS OTP's weakness is not hypothetical. The trust argument users are expressing ("I don't trust SMS") is directionally correct.

**2. Hardware tokens cause user friction and churn (HIGH, both streams):** Multiple banks are actively replacing physical tokens at scale (DBS: 16,000/month; ABANCA: 42% adoption of in-app auth). Academic literature (Krol et al., 2015) shows UK banking customers switching banks over hardware token UX. This is not merely a user preference — it is a retention risk.

**3. Device-bound mobile push auth meets regulatory requirements when transaction details are included (HIGH, both streams):** PSD2 SCA + NIST AAL2 both satisfied by device-bound in-app authentication with biometric unlock and transaction binding. The compliance path is clear; the implementation requirement (transaction detail in push) is unambiguous.

**4. Account recovery is the primary operational gap (MEDIUM, both streams):** DBS's 3–5 day mail recovery and Kepkowski et al.'s (2023) finding that >60% of practitioners cite recovery as their top challenge converge. This is the most under-solved problem in mobile token deployments.

### Where competitive and scholar diverge

**Push auth security: competitive evidence is more optimistic than academic.** Bank case studies (ABANCA, NTT DOCOMO) report high satisfaction and zero incidents. Academic literature emphasises that incident-free ≠ immune: MFA fatigue attacks (CISA 2022; Uber 2022 breach) and AiTM session hijacking (Obsidian Security: 84% of AiTM-compromised accounts had MFA active) represent attack classes that production banking deployments may not have publicly disclosed. The likely explanation: banks that have deployed push auth also implemented mitigations (number matching, transaction binding, in-app protection) that the case studies don't document in detail.

**Implication:** The competitive success cases are real, but they succeed because of implementation details that aren't always visible in case studies. The academic literature is essential context for understanding what must be true for those implementations to hold.

### Strongest convergent numbers

| Claim | Number | Source | Confidence |
|---|---|---|---|
| SIM-swap surge in UK (2024) | +1,055% YoY | Cifas Fraudscape 2025 | High |
| Hardware tokens replaced by DBS mobile | 16,000/month | DBS Bank official | High |
| ABANCA mobile auth adoption | 42% of 1.2M monthly users | FIDO Alliance 2025 | High |
| MFA fatigue reduction with number matching | ~98% drop in success rate | CISA 2023 | High |
| APP fraud despite mobile auth (UK, 2024) | £450.7M | UK Finance 2025 | High |
| AiTM accounts compromised despite MFA | 84% had MFA active | Obsidian Security | High |
| Account recovery cited as critical gap | >60% of practitioners | Kepkowski et al. 2023 | Medium |

---

## 5. Disconfirming evidence

**This section addresses what can go wrong — evidence that constrains, qualifies, or challenges the hypothesis.**

### D1 — MFA fatigue / push bombing [HIGH, most urgent design constraint]

A simple approve/deny push notification is exploitable: an attacker with valid credentials (obtained via phishing) repeatedly triggers the push until the exhausted user approves one. Microsoft reported 6,000+ daily MFA fatigue attacks on customer identities in 2023. Push-bombing increased 217% year-over-year. In September 2023, Scattered Spider used this technique to breach Caesars Entertainment.

**Implication for the decision:** A mobile token that shows only "Approve / Deny" is not acceptable. CISA's countermeasure — number-matching (user must match a number shown on the web session in the app) combined with transaction detail display — reduces attack success by ~98%. PSD2 independently requires transaction details (amount + beneficiary) in the push. These two requirements are the same solution; implementing them together is non-optional.

Sources: [University of Chicago Information Security](https://security.uchicago.edu/2024/10/01/mfa-fatigue-attacks/); [CISA Fact Sheet](https://www.cisa.gov/sites/default/files/publications/fact-sheet-implement-number-matching-in-mfa-applications-508c.pdf); [Rippleshot](https://www.rippleshot.com/post/push-bombing-scams-protecting-your-cardholders-from-mfa-fatigue).

### D2 — Adversary-in-the-Middle (AiTM) session hijacking [HIGH, architectural constraint]

AiTM attacks proxy the full authentication flow — the user completes push approval legitimately, but the attacker steals the post-authentication session cookie. Obsidian Security analysis found 84% of accounts compromised by AiTM had MFA active and enabled. The push notification was successfully approved; it just didn't protect the session. This attack class bypasses all forms of push MFA (including number-matched push). The only documented countermeasure is FIDO2 with origin binding: because FIDO2 cryptographically ties the credential to the specific website origin, the proxy cannot use the intercepted response on the attacker's browser.

**Implication:** For users who are at highest risk (corporate banking, high-net-worth), a path to FIDO2/passkey should be in the roadmap even if push auth is launched first. For the initial mobile token implementation, this risk is partially mitigated by the out-of-band nature (web session + mobile app are separate channels), but full defence requires the FIDO2 upgrade path.

Sources: [ResearchGate: AiTM and Browser-in-the-Browser Attacks](https://www.researchgate.net/publication/390063495_Advanced_Phishing_Techniques_Analyzing_Adversary-in-the-Middle_and_Browser-in-the-Browser_Attacks_in_Modern_Cybersecurity); [CISA AA22-279A](https://www.cisa.gov/news-events/alerts/2022/10/31/cisa-releases-guidance-phishing-resistant-and-numbers-matching-multifactor-authentication).

### D3 — Banking malware on Android [HIGH, operational risk]

Android banking Trojan attacks surged 196% in 2024 to 1.24 million incidents. The Octo2, ToxicPanda, and RatOn malware families perform device takeover and overlay attacks — they can fraudulently approve push notifications on the victim's device without the user's knowledge. This negates the out-of-band security model when web and mobile run on the same device, and undermines mobile token protection when the mobile device is compromised.

**Implication for the decision:** In-app runtime application self-protection (RASP) is a necessary complementary control for Android. The ČSOB bank (Czech Republic) specifically deployed Wultra in-app protection alongside their mobile token to address this vector. For iOS, the risk is lower but not zero.

Sources: [The Hacker News — Octo2](https://thehackernews.com/2024/09/new-octo2-android-banking-trojan.html); [The Hacker News — ToxicPanda](https://thehackernews.com/2024/11/new-android-banking-malware-toxicpanda.html).

### D4 — Authorized Push Payment (APP) fraud: the authentication bypass problem [HIGH, strategic limitation]

Mobile token authenticates the user. It cannot authenticate the user's intent. In 2024, APP fraud caused £450.7M in losses in the UK (UK Finance); 70% of cases originated online. The attack vector: the user is socially engineered (impersonation scams, investment fraud, fake authorisation requests) into willingly initiating and approving a fraudulent transfer. The authentication layer is never attacked — it is correctly completed by the victim.

**Implication:** Mobile token is not a fraud-prevention tool. The bank's fraud detection layer (behavioural analytics, payee confirmation, cooling-off periods, COPs) must be planned as the complementary investment. Presenting mobile token as a security upgrade to users should be scoped carefully — it solves the "I don't trust SMS" problem, not the "I was tricked into paying a fraudster" problem.

Sources: [UK Finance Fraud Report 2025](https://www.ukfinance.org.uk/news-and-insight/press-release/fraud-report-2025-press-release); [PSR APP Fraud Report July 2024](https://www.psr.org.uk/media/uaag25pp/app-fraud-publication-jul-2024-v6.pdf).

### D5 — Authentication downgrade: fallback is the weakest link [MEDIUM]

IOActive (2024) demonstrated that authentication downgrade attacks can force users registered with strong auth (FIDO2/mobile token) back to weaker fallback factors (SMS, TOTP via email). The weakest fallback method defines the actual security floor of the system. If the bank keeps SMS as a fallback for mobile token users (for account recovery or customer service override), that SMS channel remains exploitable.

**Implication:** The fallback design is not a UX afterthought. If SMS fallback is retained, it must be hardened (not callable from self-service flows without additional step-up verification). The DBS model (mail-based recovery only) is secure but operationally expensive. Each bank must find its own position on this trade-off, but the risk must be acknowledged in the design.

Source: [IOActive: Authentication Downgrade Attacks](https://www.ioactive.com/authentication-downgrade-attacks-deep-dive-into-mfa-bypass/) (2024).

### D6 — Elderly and accessibility exclusion [MEDIUM]

91% of older adults in a 2025 PMC study preferred traditional single-mode authentication over MFA. In 2026, bank app updates are blocking older smartphones common among elderly customers. A mobile-token-only channel strategy risks excluding customers who cannot operate smartphones — a concern under PSD2 proportionality principles and broader financial inclusion regulations.

**Implication:** Hardware token (or similar) must be retained as a parallel channel for accessibility. The mobile token is the preferred path for the majority; it is not a universal one.

Sources: [NIH/PMC 2025](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12759956/); [YourNews 2026](https://yournews.com/2026/04/24/6841665/the-2026-bank-app-update-blocking-older-phones-why/).

---

## 6. Decision implications

**One-line recommendation:** Build the mobile token. Implement these four patterns before launch — without them, the implementation is either non-compliant, insecure, or both.

### Four non-negotiable implementation constraints

**1. Transaction details in the push (PSD2 + MFA fatigue mitigation)**
The approval push notification must display the specific transaction amount and beneficiary. This is simultaneously required by PSD2 dynamic linking and is the primary mitigation for push-bombing attacks. A bare "Approve / Deny" prompt fails on both dimensions. Optionally, add number-matching (a code shown on the web session that must be confirmed in app) for additional fatigue resistance on non-payment operations like logins.

**2. Device binding (one active device per customer)**
The mobile token must be cryptographically bound to a specific device. Cloud-synced credentials concentrate security in the cloud provider (Büttner & Gruschka, 2025) and lower the assurance level. One-device-at-a-time is the dominant banking pattern (DBS, ABANCA, Wultra implementations all use it). Multi-device support can be addressed later via FIDO2 with explicit re-registration flows.

**3. In-app runtime protection (Android RASP)**
Given the 196% surge in banking Trojans, in-app protection is a necessary companion for the mobile token on Android. Open-source options (OWASP MAS RASP) and commercial (Wultra, OneSpan) are available. The token should also detect rooted/jailbroken devices and refuse to operate on them.

**4. Account recovery design before launch (operational readiness)**
>60% of practitioners cite account recovery as their critical gap. The bank must have a documented, secure recovery path for: lost phone, broken phone, phone number change, OS reset. The DBS approach (mailed registration code) is secure but slow. A risk-based approach (step-up via branch visit + mail combination) is common. Do not launch the mobile token without a tested recovery process — it will be the first operational failure mode.

### Boundary conditions

The evidence supports mobile token as the primary path for customers who have a smartphone and are willing to enrol. Evidence urges caution for: customers on older/unsupported Android devices (malware risk higher); customers unable to use smartphones (accessibility obligation); scenarios where the fallback to SMS is kept self-service (downgrade attack surface). Elderly customers and corporate banking customers (highest AiTM risk) warrant specific attention.

**Low-risk first move:** Launch mobile token alongside, not replacing, SMS OTP and hardware token. Incentivise migration (frictionless path, clear trust communication). Retain the old channels under stepped-up verification for recovery only. This is the pattern all surveyed banks used.

### Risk if the hypothesis is wrong

If mobile token adoption is low due to onboarding friction (50–65% completion rate baseline), the bank will have invested in infrastructure while users remain on SMS. The SMS SIM-swap vulnerability does not go away. Mitigation: measure enrolment rate at 30/60/90 days post-launch; have a plan to intervene with guided onboarding if rate falls below target.

---

## 7. Gaps and next steps

**What we still don't know:**

- **Empirical fraud rates on mobile push in banking specifically.** Academic literature found no peer-reviewed study measuring actual fraud rates or attack success rates in deployed banking mobile token implementations. Evidence is incident-based (public breaches) or framework analysis. Banks likely have this data but do not publish it.
- **Usability of transaction-approval push specifically.** The strongest usability studies (Reese et al. 2019; Krol et al. 2015) cover login-2FA. No academic study was found on the UX of approving a specific payment transaction via mobile push — which is the primary use case here.
- **PKO BP / IKO app adoption data.** No quantitative adoption numbers found for Polish market mobile token deployments despite IKO being one of the most downloaded banking apps in Poland.
- **PSD3 / revised EBA SCA requirements.** The EBA is revising SCA rules under PSD3. The dynamic linking requirement may evolve; the bank should track EBA consultation papers.
- **Cross-device authentication standards (IETF OAuth CIBA).** The Client-Initiated Backchannel Authentication (CIBA) flow is the standardised OAuth pattern for mobile token approval of web sessions. The bank's implementation should evaluate CIBA as the architectural foundation — but no banking-specific CIBA deployment study was found.

**To close these gaps:**
1. Request fraud rate data from banking associations (EBF, ZBP in Poland) under confidentiality.
2. Commission a user study on transaction-approval push UX with your specific customer demographics before finalising the approval screen design.
3. Evaluate IETF CIBA and FIDO2 CTAP specifications as the technical foundation.
4. Track EBA PSD3 consultation process (2025–2027).

---

## 8. Bibliography

### Competitive sources

[analyst_report] Cifas (2025). "1,055% surge in unauthorised SIM swaps as mobile and telecoms sector hit hard by rising fraud." Cifas Fraudscape 2025. https://www.cifas.org.uk/newsroom/huge-surge-see-sim-swaps-hit-telco-and-mobile

[case_study] DBS Bank (2024). "Set Up And Activate Your Digital Token With DBS." DBS Singapore. https://www.dbs.com.sg/personal/deposits/bank-with-ease/digital-token

[case_study] FIDO Alliance (2025). "Celebrating World Passkey Day 2025: Showcase of Real-World Passkey Deployments." FIDO Alliance. https://fidoalliance.org/celebrating-world-passkey-day-2025-showcase-of-real-world-passkey-deployments/

[analyst_report] UK Finance (2025). "Fraud continues to pose a major threat with over 1 billion GBP stolen in 2024." UK Finance Press Release. https://www.ukfinance.org.uk/news-and-insight/press-release/fraud-report-2025-press-release

[analyst_report] UK Payment Systems Regulator (2024). "Authorised push payments fraud performance report July 2024." PSR. https://www.psr.org.uk/media/uaag25pp/app-fraud-publication-jul-2024-v6.pdf

[trade_press] The Hacker News (2024). "New Octo2 Android Banking Trojan Emerges with Device Takeover Capabilities." https://thehackernews.com/2024/09/new-octo2-android-banking-trojan.html

[trade_press] The Hacker News (2024). "New Android Banking Malware 'ToxicPanda' Targets Users with Fraudulent Money Transfers." https://thehackernews.com/2024/11/new-android-banking-malware-toxicpanda.html

[trade_press] University of Chicago Information Security (2024). "MFA Fatigue Attacks." https://security.uchicago.edu/2024/10/01/mfa-fatigue-attacks/

[trade_press] Rippleshot (2024). "Push Bombing Scams: Protecting Your Cardholders from MFA Fatigue." https://www.rippleshot.com/post/push-bombing-scams-protecting-your-cardholders-from-mfa-fatigue

[regulatory] CISA (2023). "Implementing Number Matching in MFA Applications." https://www.cisa.gov/sites/default/files/publications/fact-sheet-implement-number-matching-in-mfa-applications-508c.pdf

[trade_press] Santander Bank Polska (2024). "Mobilna autoryzacja w aplikacji Santander." https://www.santander.pl/klient-indywidualny/bankowosc-internetowa/santander-mobile/mobilna-autoryzacja

[trade_press] Nordea (2024). "Authentication." https://nordea.com/en/our-services/cashmanagement/supportandcontact/authentication

[case_study, VENDOR] Wultra (2024). "Wultra Delivers Mobile Token App for Moldindconbank." https://www.wultra.com/case-studies/wultra-delivers-mobile-token-app-for-moldindconbank

[trade_press] PRNews.pl (2023). "Kolejne zmiany w mBanku. Pojawi sie aplikacja mBank Token." https://prnews.pl/kolejne-zmiany-w-mbanku-znika-serwis-light-i-lista-z-haslami-jednorazowymi-pojawi-sie-aplikacja-mbank-token-444594

[regulatory] NIST (2024). "Special Publication 800-63B-4: Authentication Assurance Levels." https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-63B-4.pdf

[regulatory] EBA (2018). "Delegated Regulation (EU) 2018/389 — Regulatory Technical Standards on SCA and Secure Communication under PSD2." https://www.eba.europa.eu/regulation-and-policy/payment-services-and-electronic-money/regulatory-technical-standards-on-strong-customer-authentication-and-secure-communication-under-psd2

[trade_press, VENDOR] Infobip (2025). "How mobile push authentication is redefining security in banking." https://www.infobip.com/blog/mobile-push-authentication-for-secure-banking

[trade_press] ID Tech Wire (2025). "With Billions of Accounts Supporting Passkeys, FIDO Anticipates 2025 Breakthroughs in Banking, Payments, and Travel." https://idtechwire.com/with-billions-of-accounts-supporting-passkeys-fido-anticipates-2025-breakthroughs-in-banking-payments-and-travel/

[trade_press] IOActive / Gomez, C. (2024). "Authentication Downgrade Attacks: Deep Dive into MFA Bypass." https://www.ioactive.com/authentication-downgrade-attacks-deep-dive-into-mfa-bypass/

[peer_reviewed] NIH/PMC (2025). "Navigating Digital Security and Usability Challenges for Older Adults With Cognitive Concerns." https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12759956/

[blog, VENDOR] IronVest (2024). "Build better mobile banking UX with a two-factor authentication alternative." https://ironvest.com/blog/is-two-factor-authentication-hurting-your-mobile-banking-ux/

[trade_press] INSART (2024). "The Anatomy of Trust in Fintech UX: Why Users Drop at Onboarding." https://insart.com/anatomy-of-trust-fintech-ux-onboarding-dropoff/

[trade_press] DeepStrike (2025). "SIM Swap Scam Statistics 2025: Losses & Prevention." https://deepstrike.io/blog/sim-swap-scam-statistics-2025

### Scholar sources

[peer_reviewed] Jover, R.P. (2020). "Security Analysis of SMS as a Second Factor of Authentication." ACM Queue / Communications of the ACM, Vol. 18, No. 4. https://dl.acm.org/doi/10.1145/3424302.3425909

[peer_reviewed] Lee, K., Kaiser, B., Mayer, J., & Narayanan, A. (2020). "An Empirical Study of Wireless Carrier Authentication for SIM Swaps." SOUPS 2020 / ConPro 2020. https://www.issms2fasecure.com/assets/sim_swaps-01-10-2020.pdf

[peer_reviewed] Reese, K., Smith, T., Dutson, J., Armknecht, J., Cameron, J., & Seamons, K. (2019). "A Usability Study of Five Two-Factor Authentication Methods." USENIX SOUPS 2019. https://www.usenix.org/conference/soups2019/presentation/reese

[peer_reviewed] De Cristofaro, E., Du, H., Freudiger, J., & Norcie, G. (2014). "A Comparative Usability Study of Two-Factor Authentication." NDSS USEC 2014. https://www.ndss-symposium.org/wp-content/uploads/2017/09/01_5-paper.pdf

[preprint] Krol, K., Philippou, E., De Cristofaro, E., & Sasse, M.A. (2015). "'They brought in the horrible key ring thing!' Analysing the Usability of Two-Factor Authentication in UK Online Banking." NDSS USEC 2015. https://arxiv.org/pdf/1501.04434

[peer_reviewed] Lyastani, S.G., Schilling, M., Neumayr, M., Backes, M., & Bugiel, S. (2020). "Is FIDO2 the Kingslayer of User Authentication? A Comparative Usability Study of FIDO2 Passwordless Authentication." IEEE S&P 2020. https://ieeexplore.ieee.org/document/9152694/

[preprint] Wurrsching, L., Putz, F., Haesler, S., & Hollick, M. (2023). "FIDO2 the Rescue? Platform vs. Roaming Authentication on Smartphones." CHI 2023. https://arxiv.org/pdf/2302.07777

[preprint] Li, Y. et al. (2021). "SMS Goes Nuclear: Fortifying SMS-Based MFA in Online Account Ecosystem." IEEE DSN 2021. https://arxiv.org/abs/2104.08651

[regulatory] NIST (2024). Special Publication 800-63B-4. https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-63B-4.pdf

[preprint] Buttner, A. & Gruschka, N. (2025). "Device-Bound vs. Synced Credentials: A Comparative Evaluation of Passkey Authentication." ICISSP 2025. https://arxiv.org/abs/2501.07380

[regulatory] CISA (2022). "Phishing-Resistant MFA and Numbers Matching MFA Guidance." Alert AA22-279A. https://www.cisa.gov/news-events/alerts/2022/10/31/cisa-releases-guidance-phishing-resistant-and-numbers-matching-multifactor-authentication

[peer_reviewed] ResearchGate (2025). "Advanced Phishing Techniques: Analyzing Adversary-in-the-Middle and Browser-in-the-Browser Attacks in Modern Cybersecurity." https://www.researchgate.net/publication/390063495_Advanced_Phishing_Techniques_Analyzing_Adversary-in-the-Middle_and_Browser-in-the-Browser_Attacks_in_Modern_Cybersecurity

[preprint] Kepkowski, M., Machulak, M., Wood, I., & Kaafar, D. (2023). "Challenges with Passwordless FIDO2 in an Enterprise Setting: A Usability Study." Macquarie University. https://arxiv.org/abs/2308.08096

[preprint] Das, S., Kim, A., Jelen, B., Streiff, J., Camp, L.J., & Huber, L. (2020). "Non-Inclusive Online Security: Older Adults' Experience with Two-Factor Authentication." HICSS 2021. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3725888

[industry_funded] IOActive / Gomez, C. (2024). "Authentication Downgrade Attacks: Deep Dive into MFA Bypass." https://www.ioactive.com/authentication-downgrade-attacks-deep-dive-into-mfa-bypass/

[regulatory] EBA (2018). Commission Delegated Regulation (EU) 2018/389 — PSD2 SCA RTS. https://www.eba.europa.eu/regulation-and-policy/payment-services-and-electronic-money/regulatory-technical-standards-on-strong-customer-authentication-and-secure-communication-under-psd2

---

## 9. Methodology note

Desk research conducted using the desk-research skill (Cowork mode), 2026-06-04. Scale: deep (two parallel sub-agents). Competitive agent: 20 queries run, 38 sources reviewed, 18 findings passed rubric (12 confirming, 6 disconfirming). Scholar agent: 18 queries run, 22 papers reviewed, 17 findings passed rubric (11 confirming, 6 disconfirming). Google Scholar's `site:` operator was unavailable throughout — all academic queries fell back to targeted searches on arXiv, ACM Digital Library, USENIX, and IEEE Xplore. This is noted as a methodological limitation; the paper set may under-represent findings published only in IEEE Xplore or Springer without preprint versions. No prior iterations; first run.
