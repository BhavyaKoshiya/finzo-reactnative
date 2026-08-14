# Finzo — Data Migration & Recovery Architecture (Phase 19)

This document specifies the migration pipeline, schema versioning, and corruption recovery rules for persisted local state.

---

## 1. Migration Overview

Finzo utilizes `createMigrate` from `redux-persist` to apply schema updates without resetting user data or forcing users back to an empty database.

```
AsyncStorage (raw JSON)
       ↓
redux-persist
       ↓
createMigrate(migrations)
       ↓ [If state.version < PERSIST_VERSION]
Transform State sequentially (0 → 1 → N)
       ↓
normalizePersistedState (Defensive Fallback)
       ↓
Rehydrated Redux Store
```

---

## 2. Schema Versions & Migration Manifest

The migration manifest is maintained centrally in [`src/store/migrations/index.js`](file:///Users/bhavyakoshiya/Documents/ReactNative/Finzo/src/store/migrations/index.js).

### Current Version: `PERSIST_VERSION = 1`

#### Version 0 $\rightarrow$ Version 1 Transformations:
1. **Loan Profiles**: Ensures `profiles` is an Array; filters out nullish objects; normalizes `ledgerVersion`, `status`, `isPrimary`, and numeric fields.
2. **Loan Payments**: Ensures `payments` is an Array; filters out records missing `loanId` or `id`.
3. **Loan Goals**: Ensures `goals` is an Array with valid `loanId`.
4. **Loan Notes**: Ensures `notes` is an Array with valid `loanId`.
5. **Private Details**: Ensures `detailsByLoanId` is a dictionary object (`{ [loanId]: details }`).
6. **Settings**: Ensures baseline defaults exist (`themeMode: 'system'`, `currency: 'INR'`, `locale: 'en-IN'`, `loanRemindersEnabled: true`).
7. **Rewards**: Validates `points`, `currentStreak`, and formats `adFreeUntil` as a valid ISO string.
8. **Saved Calculations**: Ensures `savedCalculations` is an Array capped at 100 items.

---

## 3. Corruption Recovery Strategy

If AsyncStorage encounters unexpected data corruption, partial writes, or missing keys:
1. **No Silent Wipe**: The system **NEVER** executes `AsyncStorage.clear()` or resets user profiles automatically upon rehydration errors.
2. **Defensive Selector Normalization**: All Redux selectors provide fallback defaults (e.g. `state.loanProfiles?.profiles || []`, `state.loanPrivateDetails?.detailsByLoanId || {}`).
3. **Pure State Normalizer**: `normalizePersistedState()` guarantees clean object structures without throwing runtime TypeError exceptions.

---

## 4. Best Practices for Future Migrations

1. Increment `PERSIST_VERSION` in `src/store/migrations/index.js`.
2. Add a pure transformer function under `migrations[newVersion] = (state) => { ... }`.
3. Never mutate existing historical snapshots in `loanPayments.payments[i].calculationSnapshot`.
4. Write unit tests in `src/services/__tests__/phase19DataIntegrityAndPersistence.test.js` validating the migration against simulated previous-version state.
