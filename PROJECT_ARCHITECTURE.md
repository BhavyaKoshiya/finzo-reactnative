# PROJECT_ARCHITECTURE.md — Finzo System Architecture

This document details the architectural blueprint and technical decisions for **Finzo**.

---

## 1. REACT NATIVE CORE ARCHITECTURE
Finzo is built using **React Native 0.83.10** on the New Architecture (Fabric / TurboModules enabled by default).
- Platform-agnostic JavaScript/TypeScript business logic.
- Standard React Native Android (`build.gradle`, Kotlin entry points) and iOS (`Podfile`, Xcode target) configurations.
- Minimal native native-bridge dependencies for maximum portability and fast cold start.

---

## 2. FEATURE-ORIENTED ARCHITECTURE
All source code resides inside `src/`, structured by technical domain:

- `src/features/`: Encapsulates UI screens, local state hooks, and feature-specific components.
- `src/calculations/`: Pure JavaScript/TypeScript functions implementing financial formulas (EMI, SIP, FD, RD, GST, CAGR). Completely decoupled from React and Redux.
- `src/store/`: Central Redux store using Redux Toolkit slices, typed selectors, and `redux-persist`.
- `src/theme/`: Centralized design system tokens (colors, typography, spacing, radius, shadows).
- `src/components/`: Reusable primitive UI widgets (Buttons, Inputs, Cards, Badges, Headers).

---

## 3. REDUX ARCHITECTURE & PERSISTENCE

### Store Structure
State management is handled strictly by **Redux Toolkit**:
- `configureStore`: Assembles root reducers with middleware configured to ignore `redux-persist` action checks.
- `rootReducer`: Combines slices (`settings`, future `history`, `favorites`, `savedCalculations`).
- `hooks`: Pre-typed `useAppDispatch` and `useAppSelector` wrappers.

### Persistence Pipeline
```
Redux Store
    ↓
redux-persist (Whitelist Strategy)
    ↓
@react-native-async-storage/async-storage
```
Only durable preferences and saved items are persisted. Transient state (active inputs, loading flags, current tab, errors) is intentionally kept out of persistence.

### Untrusted Data Protocol
Persisted state stored on local disk is treated as external, untrusted input. Reducers must enforce fallback defaults for missing or invalid attributes from previous app versions.

---

## 4. LOCAL REACT STATE VS REDUX STATE

| Category | Local State (`useState` / `useReducer`) | Redux Store |
|---|---|---|
| **Temporary Inputs** | Loan Amount, Tenure slider, Rate % | ❌ Never |
| **Form Validation Errors** | Field invalid warnings, helper text | ❌ Never |
| **Durable Data** | ❌ Never | Saved EMI Records, User Favorites |
| **Global Settings** | ❌ Never | Active Currency (INR), Theme Mode |

---

## 5. SEPARATION OF CALCULATION ENGINES
Financial logic lives in `src/calculations/` as pure functions:
- Inputs: Plain numbers or configuration objects.
- Outputs: Normalized result objects (e.g., monthly EMI, total interest, total payable).
- Deterministic and 100% unit-tested with zero side effects.

---

## 6. SHARED VS PLATFORM-SPECIFIC CODE
- **Default Policy**: Write cross-platform JavaScript (`.js` / `.jsx`) code.
- **Platform Files**: Use `.android.js` or `.ios.js` only when native behavior (e.g., status bar handling, haptic feedback) genuinely differs.
