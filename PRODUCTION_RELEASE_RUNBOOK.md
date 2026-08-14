# Finzo Android Production Release Runbook

This runbook guides developers through generating a production-signed Android App Bundle (`.aab`), verifying signing integrity, and completing the release workflow for the Google Play Store.

---

## 1. Release Architecture & Versioning

- **Application Name**: Finzo
- **Package / Application ID**: `com.finzo.financecalculator`
- **Current Version Name**: `1.0.0`
- **Current Version Code**: `1`
- **Target SDK**: `36` (Android 16)
- **Compile SDK**: `36` (Android 16)
- **Min SDK**: `24` (Android 7.0 Nougat)

---

## 2. Release Signing Configuration

Google Play uses **Play App Signing**. To publish, you must sign your Android App Bundle with your **Upload Key**.

### A. Generating a Production Upload Keystore (One-Time Setup)
If you do not already have an upload keystore:
```bash
keytool -genkey -v -keystore finzo-upload-key.keystore -alias finzo-upload-alias -keyalg RSA -keysize 2048 -validity 10000
```
> ⚠️ **SECURITY WARNING**: NEVER commit `finzo-upload-key.keystore` or its passwords into git or public repositories. Store it in a secure password manager.

---

### B. Configuring Environment Variables / `gradle.properties`
Set up the upload key credentials locally or in your CI/CD pipeline via environment variables or in `~/.gradle/gradle.properties`:

```properties
FINZO_UPLOAD_STORE_FILE=/path/to/finzo-upload-key.keystore
FINZO_UPLOAD_KEY_ALIAS=finzo-upload-alias
FINZO_UPLOAD_STORE_PASSWORD=your_keystore_password
FINZO_UPLOAD_KEY_PASSWORD=your_key_password
```

---

### C. `android/app/build.gradle` Production Signing Configuration
Update the `release` signing config block in [android/app/build.gradle](file:///Users/bhavyakoshiya/Documents/ReactNative/Finzo/android/app/build.gradle):

```groovy
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
    release {
        if (project.hasProperty('FINZO_UPLOAD_STORE_FILE')) {
            storeFile file(FINZO_UPLOAD_STORE_FILE)
            storePassword FINZO_UPLOAD_STORE_PASSWORD
            keyAlias FINZO_UPLOAD_KEY_ALIAS
            keyPassword FINZO_UPLOAD_KEY_PASSWORD
        } else {
            signingConfig signingConfigs.debug
        }
    }
}
```

---

## 3. Building the Release Bundle

Run the following command from the project root:

```bash
cd android && ./gradlew bundleRelease
```

### Output Location
The generated Android App Bundle is located at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## 4. Verification & Validation Steps Before Upload

1. **Verify Bundle Size**:
   ```bash
   ls -lh android/app/build/outputs/bundle/release/app-release.aab
   ```
2. **Verify Manifest & Target SDK with `bundletool` (Optional)**:
   ```bash
   bundletool dump manifest --bundle=android/app/build/outputs/bundle/release/app-release.aab
   ```
3. **Execute Pre-Release Test Suite**:
   ```bash
   npm test
   npx eslint --quiet src/
   ```

---

## 5. Google Play Console Upload & Release Checklist

1. Log in to [Google Play Console](https://play.google.com/console).
2. Select **Finzo** (`com.finzo.financecalculator`).
3. Navigate to **Testing > Internal testing** (or **Release > Production**).
4. Click **Create new release**.
5. Drag and drop `app-release.aab`.
6. Enter Release Notes:
   ```text
   • Initial release of Finzo (v1.0.0).
   • Complete loan management, payment tracking, and amortization schedules.
   • Full suite of financial calculators (EMI, SIP, FD, RD, Compound Interest, GST).
   • 100% offline-first and private financial calculations.
   ```
7. Review release details and click **Save and review release**.
8. Confirm rollout to selected testers or production track.

---

## 6. Post-Release Monitoring

- **Firebase Crashlytics**: Monitor real-time crash-free user percentage.
- **Firebase Analytics**: Monitor active daily users and screen interaction counts.
- **Google Play Android Vitals**: Monitor crash rates (must stay below 1.09%) and ANR rates (must stay below 0.47%).
