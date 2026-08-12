# MY LOANS ARCHITECTURE — FINZO

This document details the architectural design, data domain separation, navigation flows, presentation segments, and privacy policies for the **My Loans Personal Financial Workspace** (Phase 16.1 + 16.2) in Finzo.

---

## 1. CORE PHILOSOPHY & WORKSPACE CONCEPT

The **My Loans** bottom tab serves as the user's unified **Personal Financial Workspace**. It contains two completely independent data domains:

```
                          ┌────────────────────────────────────────┐
                          │         MY LOANS WORKSPACE             │
                          │   src/features/myLoans/MyLoansScreen   │
                          └───────────────────┬────────────────────┘
                                              │
               ┌──────────────────────────────┴──────────────────────────────┐
               ▼                                                             ▼
┌─────────────────────────────┐                               ┌─────────────────────────────┐
│    LOANS SEGMENT (Domain 1) │                               │    SAVED SEGMENT (Domain 2) │
│  Real-world loan accounts   │                               │ Saved calculator snapshots  │
├─────────────────────────────┤                               ├─────────────────────────────┤
│ • loanProfilesSlice         │                               │ • savedCalculationsSlice    │
│ • Outstanding principal,    │                               │ • Calculator ID, inputs,    │
│   monthly EMI, tenure       │                               │   results, favorite state   │
│ • Local storage via AsyncStorage│                           │ • Local storage via AsyncStorage│
└─────────────────────────────┘                               └─────────────────────────────┘
```

---

## 2. NAVIGATION & BOTTOM TABS

The application maintains exactly **four bottom tabs**:

| Tab Position | Label | Route Name | Icon (`lucide-react-native`) | Component |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Home | `ROUTES.HOME` | `Home` | `HomeScreen.jsx` |
| 2 | Calculators | `ROUTES.CALCULATORS` | `Calculator` | `CalculatorsScreen.jsx` |
| 3 | My Loans | `ROUTES.MY_LOANS` | `WalletCards` | `MyLoansScreen.jsx` |
| 4 | Profile | `ROUTES.PROFILE` | `UserRound` | `ProfileScreen.jsx` |

- `ROUTES.SAVED` is maintained as a backward-compatible alias to `ROUTES.MY_LOANS`.

---

## 3. SEGMENTED PRESENTATION

### Header Segmented Switcher: `[ Loans ] [ Saved ]`

1. **`Loans` Segment (Default)**:
   - Displays real loan summary card (`Total Outstanding`, `Total Monthly EMI`, `Active Loan Count`).
   - Renders active loan profile cards (`LoanProfileCard`).
   - Provides an **always-visible `[ + Add Another Loan ]` button** navigating to `ROUTES.ADD_LOAN`.
   - After creating a loan in `AddLoanScreen`, navigation returns directly to `My Loans` -> `Loans`.
   - Tapping a loan card opens `LoanDetailsScreen`.
   - Empty state: `"Track Your Loans"` with `[ Add Your First Loan ]` CTA.

2. **`Saved` Segment**:
   - Displays saved calculator snapshots (`SavedCalculationCard`) with `All` and `Favorites` filter chips.
   - Tapping any saved calculation opens the corresponding calculator screen with inputs restored and recalculated.
   - Preserves all Phase 9 saved calculation features (save snapshot, update, delete, text share, PDF export).

---

## 4. STRICT DATA DOMAIN ISOLATION

- **Zero Slice Merging**: `loanProfilesSlice` and `savedCalculationsSlice` remain strictly isolated in Redux.
- **Aggregation Isolation**:
  - `Total Outstanding` and `Total Monthly EMI` are computed strictly from active loan profiles in `loanProfilesSlice`.
  - Saved calculation counts and favorites are computed strictly from `savedCalculationsSlice`.

---

## 5. LOCAL PRIVACY GUARANTEE

- All real loan profiles and saved calculations reside 100% locally on the device (`AsyncStorage`).
- Zero user loan details or saved calculation values are uploaded to Firebase or cloud backends.
