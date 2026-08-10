# Finzo — EMI, SIP & Finance Calculator

Finzo is an offline-first financial calculator and financial planning utility built with React Native for Android and iOS.

---

## Prerequisites

- **Node.js**: `>=20` (Tested on `v24.3.0`)
- **npm**: `>=10` (Tested on `11.4.2`)
- **JDK**: OpenJDK 17 / Zulu 17
- **Xcode**: 16+ (macOS only, for iOS builds)
- **CocoaPods**: `>=1.15.0`
- **Android Studio & Android SDK**: API Level 36 (Compile/Target), Minimum API Level 24

---

## Project Setup & Installation

1. **Clone repository & install dependencies**:
   ```bash
   git clone https://github.com/BhavyaKoshiya/finzo-reactnative.git
   cd Finzo
   npm install
   ```

2. **iOS CocoaPods Setup**:
   ```bash
   cd ios
   pod install
   cd ..
   ```

---

## Running the Application

### 1. Start Metro Bundler
```bash
npm start
```

### 2. Run Android App
```bash
npm run android
```
*(Ensure an Android emulator is running or a physical device is connected via ADB).*

### 3. Run iOS App
```bash
npm run ios
```
*(Requires macOS and Xcode).*

---

## Quality Assurance & Verification Commands

- **Run Jest Test Suite**:
  ```bash
  npm test
  ```

- **Run TypeScript Compiler Check**:
  ```bash
  npx tsc --noEmit
  ```

- **Run ESLint Code Audit**:
  ```bash
  npm run lint
  ```

- **Format Codebase with Prettier**:
  ```bash
  npx prettier --write "."
  ```

---

## App Package Information

- **Android Package & Namespace**: `com.finzo.financecalculator`
- **iOS Bundle Identifier**: `com.finzo.financecalculator`
- **React Native Version**: `0.83.10`
