---
sub_agent: scholar
timestamp: 2026-06-04T12:00:00Z
queries_run: 18
papers_reviewed: 22
papers_passed_rubric: 17
disconfirming_papers: 6
fallback_to_general_search: true
---

# Scholar Findings — Mobile Token / Out-of-Band Authentication for Banking

## Summary

The academic literature provides strong, consistent support for several key claims:

1. **SMS OTP is demonstrably insecure** for banking. Multiple peer-reviewed studies document SS7 protocol vulnerabilities, SIM-swap attacks, and chain-reaction exploitation of SMS-based MFA. ACM (Jover, 2020) and Princeton (Lee et al., 2020) provide the most authoritative treatments.

2. **App-based / out-of-band authenticators are significantly more secure than SMS OTP**, but are not immune to adversary-in-the-middle (AitM) attacks, MFA fatigue / push bombing, and mobile malware. Push authentication without number-matching or contextual friction is as bypassable as SMS in certain phishing attack scenarios.

3. **Usability evidence is mixed but overall favourable** for app-based 2FA. Reese et al. (SOUPS 2019, n=72) and De Cristofaro et al. (NDSS, n=219) both find app authenticators rated in the "A" range on usability scales. Krol et al. (UCL, 2015, n=21) is the most banking-specific study and finds hardware tokens are despised while SMS/app-based methods are tolerated.

4. **FIDO2/passkeys represent the leading-edge solution** but face significant enterprise and consumer adoption barriers — particularly around account recovery (60%+ of practitioners cite it), multi-device sync, and legacy system integration (Kepkowski et al., 2023, n=118).

5. **Critical disconfirmation**: Mobile push auth is vulnerable to MFA fatigue attacks where a simple approve/deny prompt can be bypassed by spamming the user. Number-matching and contextual friction are recommended countermeasures (CISA, 2022), but add friction and partially reintroduce the usability cost. Synced passkeys concentrate security in the passkey provider — a new single point of failure (Büttner & Gruschka, 2025).

6. **Elderly/low-digital-literacy users are excluded by design** from current 2FA implementations (Das et al., 2019, PMC), which is a banking-specific regulatory risk.

---

## Confirming Findings

### (sorted by confidence, descending)

---

```yaml
finding_id: s001
research_question: 3
claim: "SMS-based two-factor authentication is vulnerable to SS7 protocol exploits, SIM swapping, and GSM base station attacks — making it an unsuitable second factor for high-value banking accounts."
confidence: High
paper: "Jover, R.P. (2020). Security Analysis of SMS as a Second Factor of Authentication. ACM Queue / Communications of the ACM, Vol. 18, No. 4."
doi_or_url: "https://dl.acm.org/doi/10.1145/3424302.3425909"
methodology: theoretical / practitioner analysis with empirical attack demonstrations
sample_size: "Attack surface review of SS7/GSM/SIM-swap techniques; cites multiple reproducible exploits"
effect_size: "Qualitative: SIM-swap alone can compromise 17+ websites without password; SS7 interception achievable at near-zero cost on dark web"
access: full_text
notes: "Author is former AT&T Security Research Center lead, now Bloomberg CTO Security. Well cited. Explicitly recommends against SMS for banking/crypto."
disconfirming_for_hypothesis: false
preprint: false
seminal: true
industry_funded: false
```

---

```yaml
finding_id: s002
research_question: 4
claim: "All five major U.S. wireless carriers used authentication procedures for SIM swaps that could be easily subverted by attackers; 17 high-value websites including financial services could be compromised via SIM swap alone without any password."
confidence: High
paper: "Lee, K., Kaiser, B., Mayer, J., & Narayanan, A. (2020). An Empirical Study of Wireless Carrier Authentication for SIM Swaps. 16th Symposium on Usable Privacy and Security (SOUPS 2020) / ConPro 2020."
doi_or_url: "https://www.issms2fasecure.com/assets/sim_swaps-01-10-2020.pdf"
methodology: empirical / penetration testing; reverse-engineered authentication policies of 140+ websites
sample_size: "5 prepaid carriers tested; 140+ website policies analysed; 3 postpaid carriers in anecdotal Appendix A"
effect_size: "100% of 5 carriers used subvertable authentication; 17 websites = full account takeover via SIM swap alone"
access: full_text
notes: "Princeton CITP. Published Jan 2020. Directly addresses the disconfirmation criterion: SMS/phone-number authentication is nearly as fragile as claimed by hypothesis."
disconfirming_for_hypothesis: false
preprint: false
seminal: true
industry_funded: false
```

---

```yaml
finding_id: s003
research_question: 2
claim: "In a 2-week between-subjects study simulating a banking website, 72 participants rated all five common 2FA methods (SMS, TOTP, push app, hardware token, security key) as highly usable; app-based methods were perceived as particularly convenient."
confidence: High
paper: "Reese, K., Smith, T., Dutson, J., Armknecht, J., Cameron, J., & Seamons, K. (2019). A Usability Study of Five Two-Factor Authentication Methods. USENIX SOUPS 2019."
doi_or_url: "https://www.usenix.org/conference/soups2019/presentation/reese"
methodology: between-subjects longitudinal lab study; SUS scores; qualitative interview
sample_size: "n=72 (2-week daily login study); n=30 (within-subjects setup lab study)"
effect_size: "All methods received SUS scores in 'A' grade range (>=80); hardware token setup caused most difficulty; push/app methods easiest overall"
access: full_text
notes: "Banking-specific context. Key limitation: recruited through university channels (tech-literate sample). Setup difficulty for hardware tokens was notable."
disconfirming_for_hypothesis: false
preprint: false
seminal: false
industry_funded: false
```

---

```yaml
finding_id: s004
research_question: 2
claim: "In a survey of 219 MTurk users with 2FA experience, smartphone app-generated tokens scored in the 'A' range on usability metrics (SUS), comparable to SMS and higher than hardware tokens; three factors — ease-of-use, cognitive effort, and trustworthiness — capture 2FA usability."
confidence: High
paper: "De Cristofaro, E., Du, H., Freudiger, J., & Norcie, G. (2014). A Comparative Usability Study of Two-Factor Authentication. NDSS Workshop on Usable Security (USEC) 2014."
doi_or_url: "https://www.ndss-symposium.org/wp-content/uploads/2017/09/01_5-paper.pdf"
methodology: survey + pre-study interviews; factor analysis
sample_size: "n=219 MTurk users with real 2FA experience; pre-study qualitative interviews"
effect_size: "All three methods scored in 'A' usability range; hardware tokens scored lowest; factor analysis identified 3 key dimensions"
access: full_text
notes: "PARC / UCL. Seminal comparative study. Pre-dates modern push-notification 2FA but establishes baseline that app-based methods are more usable than hardware tokens. MTurk sample may over-represent tech-literate users."
disconfirming_for_hypothesis: false
preprint: false
seminal: true
industry_funded: false
```

---

```yaml
finding_id: s005
research_question: 2
claim: "UK banking customers (n=21) reported wide-ranging usability issues specifically with hardware tokens in online banking; some users switched banks due to token difficulty; SMS and smartphone app codes were better tolerated."
confidence: Medium
paper: "Krol, K., Philippou, E., De Cristofaro, E., & Sasse, M.A. (2015). 'They brought in the horrible key ring thing!' Analysing the Usability of Two-Factor Authentication in UK Online Banking. NDSS USEC 2015."
doi_or_url: "https://arxiv.org/pdf/1501.04434"
methodology: semi-structured interviews + authentication diary; 2 rounds of interviews; ~11 day diary period
sample_size: "n=21 UK online banking customers; 16 had accounts at multiple banks"
effect_size: "Qualitative: hardware tokens universally disliked; app-based tokens and SMS tolerated; multiple users changed banks due to hardware token UX"
access: full_text
notes: "Most banking-specific usability study found. Sample too small for quantitative effect sizes. Key finding: mental/physical workload of hardware tokens is the main target for improvement — directly supports mobile token hypothesis."
disconfirming_for_hypothesis: false
preprint: true
seminal: false
industry_funded: false
```

---

```yaml
finding_id: s006
research_question: 5
claim: "FIDO2 passwordless authentication (n=94 lab study) was perceived as more usable and achieved higher user acceptance than password-based authentication; it is phishing-resistant and maps to AAL2/AAL3 under NIST SP 800-63B-4."
confidence: Medium
paper: "Lyastani, S.G., Schilling, M., Neumayr, M., Backes, M., & Bugiel, S. (2020). Is FIDO2 the Kingslayer of User Authentication? A Comparative Usability Study of FIDO2 Passwordless Authentication. IEEE S&P 2020."
doi_or_url: "https://ieeexplore.ieee.org/document/9152694/"
methodology: comparative lab study; usability scales; acceptance survey
sample_size: "n=94 participants; first large-scale FIDO2 comparative study"
effect_size: "Passwordless rated more usable AND more accepted than password-based auth"
access: abstract_only
notes: "CISPA Helmholtz Center. IEEE S&P 2020 (top venue). Confirms viability of FIDO2 as successor; key gaps identified: account recovery, revocation flows, corner case awareness."
disconfirming_for_hypothesis: false
preprint: false
seminal: false
industry_funded: false
```

---

```yaml
finding_id: s007
research_question: 1
claim: "In a lab study (N=87) of FIDO2 platform vs. roaming authentication on smartphones, most participants were willing to adopt passwordless authentication, but adoption barriers remain: missing support for account delegation, multi-client usage, and device-loss recovery."
confidence: Medium
paper: "Wurrsching, L., Putz, F., Haesler, S., & Hollick, M. (2023). FIDO2 the Rescue? Platform vs. Roaming Authentication on Smartphones. CHI 2023."
doi_or_url: "https://arxiv.org/pdf/2302.07777"
methodology: within-subjects lab study; SUS; qualitative coding
sample_size: "N=87 participants"
effect_size: "Majority willing to adopt; prioritization of usability, security, and availability varies by account type"
access: full_text
notes: "TU Darmstadt. CHI 2023 (top HCI venue). Directly relevant to mobile token architecture decisions: device-loss scenario is a primary adoption barrier."
disconfirming_for_hypothesis: false
preprint: true
seminal: false
industry_funded: false
```

---

```yaml
finding_id: s008
research_question: 5
claim: "SMS-based MFA ecosystems are exploitable via 'Chain Reaction Attacks' where compromise of one low-security SMS-dependent account enables takeover of high-security platforms through account dependency chains."
confidence: Medium
paper: "Li, Y., et al. (2021). SMS Goes Nuclear: Fortifying SMS-Based MFA in Online Account Ecosystem. IEEE DSN 2021."
doi_or_url: "https://arxiv.org/abs/2104.08651"
methodology: systematic analysis + tool-based evaluation (ActFort); ecosystem dependency graph analysis
sample_size: "Hundreds of representative Alexa-ranked online services evaluated"
effect_size: "Chain Reaction Attack demonstrated empirically on representative services"
access: abstract_only
notes: "Zhejiang University / U Virginia. IEEE DSN 2021. Shows that the SMS weakness propagates through entire account ecosystems — highly relevant for banks operating in such ecosystems."
disconfirming_for_hypothesis: false
preprint: true
seminal: false
industry_funded: false
```

---

```yaml
finding_id: s009
research_question: 5
claim: "NIST SP 800-63B-4 classifies SMS OTP at the weakest authenticator level (restricted/AAL1-equivalent), while push-based app authenticators with device binding qualify at AAL2, and FIDO2 hardware-bound authenticators qualify at AAL3."
confidence: High
paper: "NIST (2024). Special Publication 800-63B-4: Digital Identity Guidelines — Authentication and Lifecycle Management."
doi_or_url: "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-63B-4.pdf"
methodology: normative regulatory standard
sample_size: "N/A"
effect_size: "Categorical: SMS = restricted authenticator (discouraged); app-based push with device-binding = AAL2; FIDO2 with hardware = AAL3"
access: full_text
notes: "Definitive U.S. federal standard. Phishing-resistant authenticators (FIDO2/passkeys) explicitly integrated into AAL2 and AAL3 in the 2024 revision."
disconfirming_for_hypothesis: false
preprint: false
seminal: true
industry_funded: false
```

---

```yaml
finding_id: s010
research_question: 1
claim: "Device-bound passkeys provide stronger security guarantees than synced passkeys; synced passkeys concentrate security in the passkey provider, creating a new single point of failure."
confidence: Medium
paper: "Buttner, A. & Gruschka, N. (2025). Device-Bound vs. Synced Credentials: A Comparative Evaluation of Passkey Authentication. ICISSP 2025."
doi_or_url: "https://arxiv.org/abs/2501.07380"
methodology: framework-based comparative evaluation (Bonneau et al. criteria)
sample_size: "N/A — framework analysis"
effect_size: "Qualitative: device-bound = stronger security isolation; synced = better availability but provider-dependent; hardware-bound passkey banking adoption <5% in 2025"
access: full_text
notes: "Preprint accepted at ICISSP 2025. Directly addresses the architecture decision: device-bound tokens in bank app are closer to passkey security model."
disconfirming_for_hypothesis: false
preprint: true
seminal: false
industry_funded: false
```

---

## Disconfirming Findings

### (sorted by confidence, descending)

---

```yaml
finding_id: s011
research_question: 4
claim: "Push notification authentication without number-matching is vulnerable to MFA fatigue attacks where an attacker with valid credentials repeatedly triggers push prompts until the user approves one — making simple approve/deny push nearly as bypassable as SMS OTP in real-world attacks."
confidence: High
paper: "CISA (2022). Phishing-Resistant MFA and Numbers Matching MFA Guidance. Alert AA22-279A. Also tracked as MITRE ATT&CK T1621: Multi-Factor Authentication Request Generation."
doi_or_url: "https://www.cisa.gov/news-events/alerts/2022/10/31/cisa-releases-guidance-phishing-resistant-and-numbers-matching-multifactor-authentication"
methodology: observational / incident analysis; MITRE ATT&CK documentation
sample_size: "Multiple documented incidents (Uber 2022, Cisco, Dropbox); 100+ AiTM campaigns documented"
effect_size: "Simple push: bypassable via fatigue; number matching: ~98% reduction in fatigue-attack success; FIDO2/phishing-resistant: near-zero MFA-based compromise rate"
access: full_text
notes: "Government authority (CISA). Number matching and contextual friction are recommended countermeasures but add back UX friction. Key disconfirmation: the trust argument for simple push auth partially collapses without anti-fatigue measures."
disconfirming_for_hypothesis: true
preprint: false
seminal: false
industry_funded: false
```

---

```yaml
finding_id: s012
research_question: 4
claim: "Adversary-in-the-Middle (AitM) phishing attacks bypass push MFA by proxying the full authentication flow and stealing the post-authentication session cookie — meaning successful push approval does not prevent account compromise in this attack class; 84% of AiTM-compromised accounts already had MFA enabled."
confidence: High
paper: "Multiple sources: IOActive Authentication Downgrade research (2024); Obsidian Security AiTM report (2023-2025); ResearchGate: Advanced Phishing Techniques: Analyzing Adversary-in-the-Middle and Browser-in-the-Browser Attacks (2025)."
doi_or_url: "https://www.researchgate.net/publication/390063495_Advanced_Phishing_Techniques_Analyzing_Adversary-in-the-Middle_and_Browser-in-the-Browser_Attacks_in_Modern_Cybersecurity"
methodology: incident analysis; breach documentation; pen-test demonstration
sample_size: "84% stat from Obsidian Security analysis of AiTM-compromised accounts; 100+ AiTM campaigns documented 2023-2025"
effect_size: "84% of AiTM-targeted accounts had MFA active = MFA did not prevent compromise"
access: abstract_only
notes: "Most critical disconfirmation for the hypothesis. Push auth — even with number-matching — cannot defend against AiTM session token theft. FIDO2 with origin binding is the only practical documented countermeasure. Directly relevant to web banking cross-device flows."
disconfirming_for_hypothesis: true
preprint: false
seminal: false
industry_funded: false
```

---

```yaml
finding_id: s013
research_question: 2
claim: "Enterprise FIDO2 deployment survey (n=118 practitioners) revealed account recovery was a critical challenge cited by >60% of respondents; other gaps include missing mobile-specific solutions, multi-platform sync, and lack of biometric-capable authenticators."
confidence: Medium
paper: "Kepkowski, M., Machulak, M., Wood, I., & Kaafar, D. (2023). Challenges with Passwordless FIDO2 in an Enterprise Setting: A Usability Study. Macquarie University preprint."
doi_or_url: "https://arxiv.org/abs/2308.08096"
methodology: structured survey; qualitative coding
sample_size: "n=118 cybersecurity professionals with FIDO2 field experience"
effect_size: "Account recovery: >60% cite as critical gap; multiple challenge themes coded at high frequency"
access: full_text
notes: "Macquarie University. Preprint (not peer-reviewed journal at time of writing). Account recovery is the #1 operational risk — directly relevant to the lost-phone fallback design requirement for mobile banking."
disconfirming_for_hypothesis: true
preprint: true
seminal: false
industry_funded: false
```

---

```yaml
finding_id: s014
research_question: 2
claim: "Older adults (age 60+) are structurally excluded from two-factor authentication systems due to non-inclusive design: hardware tokens with small form factors are easily lost; security keys have device/browser dependencies; many elderly users cannot complete 2FA setup without assistance."
confidence: Medium
paper: "Das, S., Kim, A., Jelen, B., Streiff, J., Camp, L.J., & Huber, L. (2020). Non-Inclusive Online Security: Older Adults' Experience with Two-Factor Authentication. HICSS 2021."
doi_or_url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3725888"
methodology: qualitative user study; think-aloud protocol
sample_size: "n=10 older adults (age 60+)"
effect_size: "Qualitative: older adults took considerably longer than student populations and required help; specific time deltas not published in abstract"
access: abstract_only
notes: "Indiana University. Disconfirmation: mobile token apps assume smartphone literacy. Banking customers who cannot use a smartphone app are excluded — a regulatory concern under PSD2 proportionality requirements."
disconfirming_for_hypothesis: true
preprint: true
seminal: false
industry_funded: false
```

---

```yaml
finding_id: s015
research_question: 4
claim: "Synced passkeys' security is mainly concentrated in the passkey provider (Apple/Google/Microsoft); credential syncing creates a new single point of failure — if the provider is compromised, attacker gains access to all synced passkeys."
confidence: Medium
paper: "Buttner, A. & Gruschka, N. (2025). Device-Bound vs. Synced Credentials: A Comparative Evaluation of Passkey Authentication. ICISSP 2025."
doi_or_url: "https://arxiv.org/abs/2501.07380"
methodology: framework-based comparative evaluation
sample_size: "N/A"
effect_size: "Qualitative: synced passkeys shift security dependency to provider; hardware-bound passkeys eliminate this risk but adoption <5% in banking"
access: full_text
notes: "If a bank mobile token is backed by iCloud Keychain or Google Password Manager backup, the security model degrades. Disconfirms the assumption that any app-based token = high assurance."
disconfirming_for_hypothesis: true
preprint: true
seminal: false
industry_funded: false
```

---

```yaml
finding_id: s016
research_question: 5
claim: "Authentication downgrade attacks can force users registered with FIDO2 back to weaker fallback factors (SMS/push OTP) — meaning the weakest fallback method defines the actual security floor of the entire authentication system."
confidence: Medium
paper: "IOActive (Gomez, C., 2024). Authentication Downgrade Attacks: Deep Dive into MFA Bypass. IOActive research blog."
doi_or_url: "https://www.ioactive.com/authentication-downgrade-attacks-deep-dive-into-mfa-bypass/"
methodology: penetration testing / security research demonstration
sample_size: "Demonstrated on production systems; scale testing not published"
effect_size: "Qualitative: demonstrated ability to force fallback to SMS/push OTP from FIDO2"
access: full_text
notes: "Industry/practitioner research, not peer-reviewed. Confidence capped at Medium. Critical for fallback design: if mobile token has SMS fallback, that fallback becomes the attack surface."
disconfirming_for_hypothesis: true
preprint: false
seminal: false
industry_funded: true
```

---

## Regulatory Baseline Finding

```yaml
finding_id: s017
research_question: 5
claim: "PSD2 SCA requires dynamic linking — authentication must be cryptographically bound to the specific transaction amount and payee; a simple 'approve/deny' push without transaction details is non-compliant with PSD2 Article 5 RTS."
confidence: High
paper: "European Banking Authority (2018). Regulatory Technical Standards on SCA and Secure Communication under PSD2 (Commission Delegated Regulation (EU) 2018/389)."
doi_or_url: "https://www.eba.europa.eu/regulation-and-policy/payment-services-and-electronic-money/regulatory-technical-standards-on-strong-customer-authentication-and-secure-communication-under-psd2"
methodology: normative regulatory standard
sample_size: "N/A"
effect_size: "Categorical: push notification without transaction binding = SCA non-compliant; push showing amount+payee with device-bound signature = SCA-compliant"
access: full_text
notes: "Critical architecture constraint for mobile token in banking: must display and sign transaction amount + beneficiary. Drives the specific UX pattern required."
disconfirming_for_hypothesis: false
preprint: false
seminal: true
industry_funded: false
```

---

## Gaps and Failed Queries

1. **No peer-reviewed empirical study found** specifically measuring fraud rates or attack success rates on mobile push authentication in deployed banking systems. Evidence is incident-based or framework analysis.
2. **No academic study found** on cross-device web+mobile authentication flows specifically (the exact mobile token use case). OAuth IETF cross-device security BCP exists but is not peer-reviewed research.
3. **SIM-swap attack rates specific to banking** — Lee et al. 2020 covers carriers generally; no banking-specific empirical fraud rate data in academic literature.
4. **Google Scholar site: operator failed** throughout — all queries fell back to general web search targeting arxiv.org, ACM DL, USENIX, IEEE Xplore. This is noted as a methodological limitation.
5. **Usability study of push/in-app authentication specifically for transaction authorization** (not generic login) not found. Krol et al. 2015 is the closest banking-specific study but predates mobile push auth.

---

## Recommended Follow-Up

1. Search IEEE Xplore and ACM DL directly for "transaction authentication" + "mobile" + "banking" for studies post-2020.
2. Find EBA Opinion papers on authentication for PSD3 — regulatory evolution may change SCA requirements.
3. Look for empirical fraud rate data on push vs. SMS MFA bypass in financial sector (may be in industry reports: Verizon DBIR, RSA, not academic literature).
4. Check USENIX Security 2024/2025 proceedings for updated FIDO2 banking deployment studies.

---

## Term Mapping Verification

| User term | Academic term used | Yielded hits? |
|---|---|---|
| mobile token | "out-of-band authentication", "app-based authenticator", "mobile push authentication" | Yes — ACM, NDSS, USENIX |
| SMS OTP | "SMS two-factor authentication", "SMS second factor" | Yes — ACM Queue, arXiv, IEEE |
| SIM-swap fraud | "SIM swapping", "SIM hijacking" | Yes — Princeton empirical study (Lee et al. 2020) |
| push notification attack | "MFA fatigue", "push bombing" | Yes — CISA guidance, MITRE ATT&CK |
| PSD2/SCA | "strong customer authentication" | Partial — regulatory documents; limited peer-reviewed UX studies |
| device pairing | "device binding", "credential binding" | Partial — FIDO2 literature, patents |
| mobile token trust | "authenticator usability", "2FA user acceptance" | Yes — SOUPS 2019, NDSS 2014, CHI 2023 |
| FIDO2/passkey | "FIDO2", "passkey", "WebAuthn" | Yes — IEEE S&P 2020, CHI 2023, arXiv 2025 |
