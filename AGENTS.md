# AGENTS.md — Finzo Engineering Constitution & Directives

This document outlines the mandatory engineering standards, boundaries, state policies, and architecture for the **Finzo** codebase.

---

## 1. PROJECT IDENTITY & METADATA
- **Application Name**: Finzo
- **Android Package & Namespace**: `com.finzo.financecalculator`
- **iOS Bundle Identifier**: `com.finzo.financecalculator`
- **React Native Version**: `0.83.10` (Locked - do not upgrade or downgrade)
- **Primary Market**: India (`en-IN`)
- **Primary Currency**: INR (₹)
- **Icons Library**: `lucide-react-native`

---

## 2. PRODUCT BOUNDARIES & SCOPE
Finzo is an offline-first financial calculator and planning utility. It provides calculations and informational tools.

**Finzo DOES NOT**:
- Provide, approve, or broker loans
- Connect borrowers with lenders
- Execute investments or banking services
- Provide payment services or personalized financial advice
- Guarantee investment returns, loan approvals, or savings
- Collect financial information on a backend for the MVP

---

## 3. TECHNOLOGY STACK POLICY
- **Framework**: Standard React Native `0.83.10` (Bare / Native CLI project).
- **Prohibited**: Do NOT introduce Expo, Expo Router, MobX, Zustand, Recoil, Jotai, Redux Saga, or Redux Observable.
- **State Management**: Redux Toolkit + React Redux + `redux-persist` + `@react-native-async-storage/async-storage`.
- **Styling & UI**: React Native Reanimated, React Native SVG, `lucide-react-native`, React Native Safe Area Context.
- **Language**: Strict TypeScript (`noImplicitAny`, strict mode, explicit return types where applicable).

---

## 4. ARCHITECTURE & DIRECTORY PATTERN
Feature-oriented architecture under `src/`:
```
src/
  app/           # Main App wrappers and startup providers
  components/    # Shared reusable UI primitives
  constants/     # Global constants
  features/      # Domain feature modules (UI + local state)
  calculations/  # Pure TypeScript calculation logic (No RN/React/Redux imports!)
  hooks/         # Custom React hooks
  navigation/    # Navigation stacks and tabs
  services/      # System and device services
  store/         # Redux Toolkit store, slices, selectors, hooks
  storage/       # Storage helpers and key abstractions
  theme/         # Design tokens (colors, typography, spacing, radius, shadows)
  types/         # Domain TypeScript models and interfaces
  utils/         # Formatting, math, and date helpers
tests/           # Integration / End-to-end tests
```

---

## 5. REDUX VS LOCAL STATE LAWS
- **Redux State**: Reserved strictly for durable/shared application state (e.g., settings, theme, saved calculations, favorites, history).
- **Local React State**: Reserved for screen inputs, form state, open/closed modal flags, tab selections, animation values, and temporary validation states.
- **Rule**: Do NOT store live input fields (e.g., EMI loan amount, interest rate, tenure inputs) in Redux while typing. Only dispatch normalized calculation payloads to Redux when the user explicitly saves a calculation.

---

## 6. REDUX PERSISTENCE & UNTRUSTED STATE
- **Storage Driver**: `@react-native-async-storage/async-storage`.
- **Strategy**: Whitelist specific slices (e.g., `settings`). Do NOT persist transient UI state, loading states, or forms.
- **Safety**: Treat persisted state as untrusted external data. Reducers and selectors must tolerate missing/migrated fields without crashing.

---

## 7. FINANCIAL CALCULATION ENGINE SEPARATION
- Financial formulas must be written as **pure TypeScript functions**.
- Calculation modules must NEVER import React, React Native, Redux, AsyncStorage, or UI components.
- Formulas must be fully testable in isolation using pure Jest tests.

---

## 8. FINANCIAL PRECISION & DISPLAY ROUNDING
- Separate **Calculation Precision** from **Display Rounding**.
- Perform intermediate calculations using high-precision numbers.
- Format final outputs for display using locale-aware formatters (`Intl.NumberFormat` for `en-IN` / `INR`).

---

## 9. PRIVACY & NATIVE PERMISSIONS
- **Privacy First**: No backend, no accounts, no authentication, no user tracking, no analytics, no ads in MVP foundation.
- **Native Permissions**: Keep permissions minimal. Android `AndroidManifest.xml` and iOS `Info.plist` must not request location, camera, microphone, contacts, Bluetooth, or SMS permissions.
