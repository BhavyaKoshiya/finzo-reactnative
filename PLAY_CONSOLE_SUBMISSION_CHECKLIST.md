# Google Play Console Submission Checklist — Finzo

This document outlines the complete submission requirements for **Finzo** (`com.finzo.financecalculator`) on the Google Play Console. Items are strictly categorized into **CODE-CONFIRMED** (verified in project source code) and **MANUALLY-CONFIRM-IN-PLAY-CONSOLE** (human operational steps in Play Console).

---

## 1. App Content & Policy Declarations

### A. Privacy Policy
- [x] **[CODE-CONFIRMED]** Public Privacy Policy is hosted at an accessible, public HTTPS URL:
  `https://binarykode-technologies.web.app/pages/finzo-privacy-policy.html`
- [x] **[CODE-CONFIRMED]** In-app Privacy Policy screen in [PrivacyPolicyScreen.jsx](file:///Users/bhavyakoshiya/Documents/ReactNative/Finzo/src/features/privacy/screens/PrivacyPolicyScreen.jsx) is 100% aligned with the public policy.
- [ ] **[MANUALLY-CONFIRM-IN-PLAY-CONSOLE]** Enter Privacy Policy URL in **App content > Privacy policy**:
  `https://binarykode-technologies.web.app/pages/finzo-privacy-policy.html`

### B. Ads Declaration
- [x] **[CODE-CONFIRMED]** App contains Google Mobile Ads and marketing ads (`react-native-google-mobile-ads`, `react-native-marketing-plugin`).
- [ ] **[MANUALLY-CONFIRM-IN-PLAY-CONSOLE]** In **App content > Ads**, select **"Yes, my app contains ads"**.

### C. App Access (Reviewer Credentials)
- [x] **[CODE-CONFIRMED]** App does **NOT** require a login, username, password, OTP, or backend account.
- [ ] **[MANUALLY-CONFIRM-IN-PLAY-CONSOLE]** In **App content > App access**, select **"All functionality is available without special access"**.

### D. Target Audience and Content
- [x] **[CODE-CONFIRMED]** Finzo is designed for adult financial calculation and personal loan planning (Target Age: **18 and older**).
- [ ] **[MANUALLY-CONFIRM-IN-PLAY-CONSOLE]** In **App content > Target audience and content**:
  - Target age group: **18 and over** (Uncheck all child age groups: 13-15, 16-17, etc.).
  - Appeal to children: Select **"No"** (App does not unintentionally appeal to children).

### E. Financial Features Declaration
- [x] **[CODE-CONFIRMED]** Finzo is a **Calculator and Informational Planning Utility**.
  - Does NOT broker loans.
  - Does NOT provide loan disbursement.
  - Does NOT connect borrowers to lenders.
  - Does NOT collect loan applications.
- [ ] **[MANUALLY-CONFIRM-IN-PLAY-CONSOLE]** In **App content > Financial features**, select **"Personal finance / Calculator utility"** and confirm that Finzo is NOT a personal loan app or lending service.

### F. Content Rating Questionnaire
- [ ] **[MANUALLY-CONFIRM-IN-PLAY-CONSOLE]** Complete the IARC Content Rating questionnaire:
  - Category: **Utility / Productivity / Finance**
  - Violence, Sexual Content, Profanity: **No**
  - Controlled Substances: **No**
  - User-to-user communication: **No**
  - Shares user physical location: **No**
  - Purchases digital goods: **No**
  - Expected Rating: **Everyone (PEGI 3 / ESRB Everyone)**.

### G. Data Safety Form
- [x] **[CODE-CONFIRMED]** Verified all SDKs and local storage behaviors (see [DATA_SAFETY_PLAY_CONSOLE.md](file:///Users/bhavyakoshiya/Documents/ReactNative/Finzo/DATA_SAFETY_PLAY_CONSOLE.md)).
- [ ] **[MANUALLY-CONFIRM-IN-PLAY-CONSOLE]** Complete the Data Safety form following the exact declarations in `DATA_SAFETY_PLAY_CONSOLE.md`.

### H. Government Apps & COVID-19 / Health Declarations
- [ ] **[MANUALLY-CONFIRM-IN-PLAY-CONSOLE]** In **App content > Government apps**, select **"No"**.
- [ ] **[MANUALLY-CONFIRM-IN-PLAY-CONSOLE]** In **App content > Health apps**, select **"My app is not a health or medical app"**.

---

## 2. Technical & Binary Verification

| Verification Item | Requirement | Status | Evidence |
| :--- | :--- | :--- | :--- |
| **Package Name** | `com.finzo.financecalculator` | **PASSED** | `android/app/build.gradle` line 83 |
| **Version Code** | `1` | **PASSED** | `android/app/build.gradle` line 86 |
| **Version Name** | `"1.0.0"` | **PASSED** | `android/app/build.gradle` line 87 |
| **Compile SDK** | `36` (Android 16) | **PASSED** | `android/build.gradle` line 5 |
| **Target SDK** | `36` (Android 16) | **PASSED** | `android/build.gradle` line 6 |
| **Min SDK** | `24` (Android 7.0) | **PASSED** | `android/build.gradle` line 4 |
| **Architecture** | React Native 0.83.10 + New Arch (Fabric/TurboModules) | **PASSED** | `gradle.properties` line 35 |
| **JS Engine** | Hermes Enabled | **PASSED** | `gradle.properties` line 39 |
| **Release Artifact** | Android App Bundle (`.aab`) | **PASSED** | `app-release.aab` generated successfully |
| **Permissions** | Minimal (`INTERNET`, `POST_NOTIFICATIONS`) | **PASSED** | `AndroidManifest.xml` lines 2-3 |
| **No Dangerous Permissions** | No Camera, Location, Contacts, SMS, Storage | **PASSED** | Clean Android Manifest |
| **Tests** | 100% Passing (708/708 tests) | **PASSED** | Jest Suite: 100 passed |
| **Linter** | 0 errors / 0 warnings | **PASSED** | ESLint Clean |

---

## 3. Store Listing & Graphical Assets Preparation

- [x] **[CODE-CONFIRMED]** Store Listing metadata prepared in [PLAY_STORE_METADATA.md](file:///Users/bhavyakoshiya/Documents/ReactNative/Finzo/PLAY_STORE_METADATA.md).
- [ ] **[MANUALLY-CONFIRM-IN-PLAY-CONSOLE]** Upload App Icon: **512 x 512 px PNG (32-bit, max 1MB)**.
- [ ] **[MANUALLY-CONFIRM-IN-PLAY-CONSOLE]** Upload Feature Graphic: **1024 x 500 px JPG or PNG (24-bit, max 15MB)**.
- [ ] **[MANUALLY-CONFIRM-IN-PLAY-CONSOLE]** Upload Phone Screenshots: **At least 4 screenshots (16:9 or 18:9 ratio, min 1080px width)**.
- [ ] **[MANUALLY-CONFIRM-IN-PLAY-CONSOLE]** Enter Contact Details:
  - Developer Email: `bhavyakoshiya.work@gmail.com`
  - Website: `https://binarykode-technologies.web.app`

---

## 4. Release Track & Rollout Strategy

1. **Internal Testing Track**:
   - Upload `android/app/build/outputs/bundle/release/app-release.aab`.
   - Add internal testers to verify installation on physical Android devices across API 24 to API 36.
2. **Production Track**:
   - Create new release in Production track.
   - Attach Release Notes.
   - Recommended staged rollout: **20% ➔ 50% ➔ 100%**.
