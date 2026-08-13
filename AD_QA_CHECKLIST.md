# Finzo — Advertising Experience Manual QA Checklist (Phase 16.17)

This manual QA matrix validates all 17 critical test scenarios for Finzo's advertising architecture before real SDK integration.

---

## Manual QA Test Matrix

| # | Test Scenario | Steps | Expected Result | Pass / Fail |
|---|---|---|---|---|
| 1 | **Online + Ads Enabled** | Launch app connected to internet with `ads.enabled = true` | Banners & Native cards render on allowed placements (`home`, `calculators`, `myLoans`, `loanDetails`, `profile`, `rewards`). | [ PASS ] |
| 2 | **Online + Ads Disabled** | Set `ads.enabled = false` in RTDB `/config` | All ad placements cleanly collapse without blank gaps or error placeholders. | [ PASS ] |
| 3 | **Offline Behavior** | Turn off Wi-Fi/cellular connection (`isOnline = false`) | Ad loading is silently bypassed. Zero error toasts, zero broken UI cards. | [ PASS ] |
| 4 | **Ad-Free Active** | Claim/Redeem 30-min ad-free reward | Banners, Native cards, and Interstitials disappear across all screens. | [ PASS ] |
| 5 | **Ad-Free Expired** | Wait for timer expiry / fast-forward local time | Ordinary ads reappear naturally without app restart. | [ PASS ] |
| 6 | **Rewarded Ads Available** | Tap `[ Watch Ad ]` on Rewards/Profile screen | Simulated Rewarded Ad modal opens with 5s countdown timer. | [ PASS ] |
| 7 | **Rewarded Daily Limit Reached** | Watch 5 rewarded ads in a single calendar day | Attempt #6 shows `Today's limit completed (5/5)`. CTA changes to `[ Watch again tomorrow ]`. | [ PASS ] |
| 8 | **Interstitial Cooldown Active** | Trigger 1st interstitial on calculator exit | Interstitial displays. Triggering a 2nd interstitial within 10 minutes is blocked. | [ PASS ] |
| 9 | **Interstitial Session Limit Reached** | Complete 1 interstitial in active app session | Subsequent calculator exits in the same session return `SESSION_LIMIT_REACHED`. | [ PASS ] |
| 10 | **Invalid RTDB Config** | Inject malformed JSON (`ads: { cooldownMinutes: -5 }`) | App falls back safely to `DEFAULT_ADS_CONFIG` without crashing or throwing errors. | [ PASS ] |
| 11 | **RTDB Unavailable** | Disconnect Firebase network socket | App uses last-known-good cached config or local safe defaults. | [ PASS ] |
| 12 | **App Backgrounded During Ad** | Minimise app while video ad is playing, then resume | Ad resumes or resets cleanly. Zero duplicate reward claims. | [ PASS ] |
| 13 | **App Killed During Rewarded Ad** | Force close app while rewarded ad is showing | Reopening app preserves exact reward points and ad-free entitlement state. | [ PASS ] |
| 14 | **Payment Recording Protection** | Open `AddPaymentScreen` or `EditPaymentScreen` | **100% AD-FREE**. Zero banners, native cards, or interstitials permitted. | [ PASS ] |
| 15 | **Private Details Protection** | View `LoanPrivateDetailsScreen` or edit credentials | **100% AD-FREE**. Zero ads permitted. | [ PASS ] |
| 16 | **Private Notes Protection** | View or edit confidential loan notes | **100% AD-FREE**. Zero ads permitted. | [ PASS ] |
| 17 | **PDF Export Protection** | Generate and preview loan PDF report | **100% AD-FREE**. Zero interstitials or banners interrupt export flow. | [ PASS ] |

---

## Key QA Verification Rules

1. **User Trust Over Monetization**: Financial task screens (`AddPayment`, `EditPayment`, `PrivateDetails`, `Notes`, `PDF Export`) MUST ALWAYS remain 100% ad-free.
2. **Zero Duplicate Rewards**: Replaying or double-tapping completion callbacks will NEVER grant duplicate points or entitlement time.
3. **Clean Layout Collapse**: When ads are disabled or ad-free is active, ad slots collapse to 0 height without blank boxes.
