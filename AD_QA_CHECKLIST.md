# Finzo — Ad QA Checklist (Phase 18.2)

Verify each item before marking a phase complete.

---

## 1. Placement Map Verification

- [ ] **15 placements** exist (no more, no fewer)
- [ ] Home: Native (`home_native`) between loan summary & popular calculators
- [ ] Home: Banner (`home_banner`) after explore categories
- [ ] Tabs: Banner (`tab_bottom_banner`) above bottom tab bar
- [ ] Calculators (cat 1): Native (`calculator_native`) after Loan & Repayment
- [ ] Calculators (cat 2): Banner (`calculator_banner`) after Investment & Wealth
- [ ] Calculators (cat 3): Native (`calculator_native`) after Tax & Business
- [ ] EMI Calculator: Banner (`calculator_banner`) after results section
- [ ] My Loans: Native (`home_native`) after primary loan card
- [ ] My Loans: Banner (`my_loans_banner`) after "Add Another Loan" button
- [ ] Loan Details: Native (`loan_details_native`) between payment history & overview
- [ ] Loan Details: Native (`loan_details_native`) after settings/actions
- [ ] Profile: Banner (`profile_banner`) after rewards card
- [ ] Rewards: Native (`rewards_native`) after reward catalog items
- [ ] Loan Calculators: Interstitial (`calculator_interstitial`) on back press
- [ ] EMI Calculator: Interstitial (`calculator_interstitial`) on back press

---

## 2. Calculator Banner Verification

- [ ] Banner renders correctly on EMI Calculator results
- [ ] Banner shown only once per screen
- [ ] Uses centralized `AdPlacement` component
- [ ] Respects ad-free state (hidden when ad-free)
- [ ] Respects connectivity (hidden when offline)
- [ ] Respects RTDB `placements.calculators.banner` config
- [ ] Does not block calculator interaction
- [ ] Does not overlap inputs/results/buttons
- [ ] Does not receive financial data

---

## 3. Calculator Exit Interstitial & adTime Opportunity Frequency (Phase 22)

- [ ] Shows on back button press from LoanCalculatorScreen
- [ ] Shows on back button press from EMICalculatorScreen
- [ ] Uses `useInterstitialAd` → `adService.showInterstitial()` → `interstitialFrequencyService` → `MarketingAdProvider`
- [ ] All 5 loan calculators (Home, Personal, Car, Education, Business) use shared behavior
- [ ] Respects ad-free suppression (never accumulates opportunity counter while ad-free)
- [ ] Respects offline suppression (never accumulates opportunity counter while offline)
- [ ] Respects `adTime` opportunity threshold (e.g. `adTime=3` shows on every 3rd eligible back tap)
- [ ] Respects session limit (3/session hard ceiling)
- [ ] Back navigation works when interstitial blocked → immediate `goBack()`
- [ ] Back navigation works when provider fails → immediate `goBack()`
- [ ] Double-tap / concurrency protection prevents duplicate modal/requests
- [ ] Close callback executes exactly once

---

## 4. Ad-Free / Offline Suppression

- [ ] `adFreeUntil > now` suppresses banners, natives, interstitials
- [ ] `adFreeUntil > now` does NOT suppress rewarded ads
- [ ] `isInternetReachable !== true` suppresses all ad types
- [ ] No error toasts or broken UI when suppressed
- [ ] Placements return normally when ad-free expires or connectivity returns

---

## 5. Financial Workflow Protection

All these screens return `FINANCIAL_WORKFLOW` reason (100% ad-free):

- [ ] `add_payment` / `edit_payment` / `delete_payment`
- [ ] `correct_balance`
- [ ] `add_loan` / `edit_loan`
- [ ] `loan_private_details` / `loan_notes`
- [ ] `loan_prepayment_simulator` / `loan_payoff_planner`
- [ ] `loan_goals` / `loan_goal_details`
- [ ] `pdf_export` / `pdf_generation`
- [ ] `local_data_privacy`
- [ ] RTDB config **cannot** override these protections

---

## 6. RTDB Configuration

- [ ] `ads.enabled = false` disables all placements
- [ ] Per-screen placement toggling works (`placements.home.banner = false`)
- [ ] Cooldown minutes and max-per-session are remotely configurable
- [ ] Invalid config falls back to local defaults (3 min / 3 per session)
- [ ] `config.ads = null` fails safely (no crash)

---

## 7. Financial Data Firewall

- [ ] `canShowAd()` params do not include financial fields
- [ ] Provider methods receive only `placementId` and generic options
- [ ] No loan amounts, EMIs, interest rates, balances, account numbers in ad layer

---

## 8. Production Safety

- [ ] `__DEV__ = false` → `AdProviderFactory` returns `NoAdProvider`
- [ ] Hard `__DEV__` gate cannot be bypassed by `isDev` option override
- [ ] Real advertising SDKs installed: **0**
- [ ] `SimulatedAdProvider` cannot be created in production

---

## 9. Test Suite

- [ ] `yarn test` → 0 failures
- [ ] `npx eslint --quiet src/` → 0 errors, 0 warnings
- [ ] Phase 18.2 test file: `phase182PlacementPreservation.test.js` passes

---

## 10. Startup Ad Initialization & Preloading QA (Phase 27)

- [ ] `MarketingAdProvider` initializes `react-native-marketing-plugin` during startup
- [ ] Banner descriptors preload on startup
- [ ] Native descriptors preload on startup
- [ ] Interstitial ads preload into cache on startup
- [ ] Rewarded ads preload when enabled in `adModel`
- [ ] Splash waits at most 5 seconds for ad readiness
- [ ] If ads are ready earlier (<5s), Splash dismisses immediately
- [ ] If ads take >5s, Splash dismisses at 5s and startup proceeds
- [ ] 5-second timeout does NOT cancel or abort in-flight ad requests
- [ ] Late-loaded banner and native ads render immediately upon screen mount
- [ ] Late-loaded interstitial and rewarded ads remain cached for future authorized use
- [ ] Preloading NEVER automatically displays an ad
- [ ] Preload does NOT increment `opportunityCounter`
- [ ] Preload does NOT consume the 3/session limit
- [ ] Preload does NOT bypass `adDecisionEngine` or financial workflow protections
- [ ] Offline startup continues immediately without waiting for ads
- [ ] Ad initialization failure does not block startup or crash the application
- [ ] Multiple initialization calls are idempotent and return the same promise
- [ ] App-open ads remain strictly disabled (`enableAppOpenOnResume: false`)

