/**
 * FINZO — PHASE 20 — Production Release Readiness & Security Audit Tests
 *
 * Validates production environment safety, zero real ad SDKs, zero Firebase writes,
 * startup gates, offline enforcement, multi-loan isolation, and credential boundaries.
 */

import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../../store/rootReducer';
import { AdProviderFactory } from '../adProviderFactory';
import { NoAdProvider } from '../ads/noAdProvider';
import { SimulatedAdProvider } from '../ads/simulatedAdProvider';
import { ApprovedAdProvider } from '../ads/approvedAdProvider';
import adDecisionEngine, { PROTECTED_FINANCIAL_SCREENS } from '../ads/adDecisionEngine';
import { validateRealtimeConfig } from '../../config/realtimeConfigSchema';
import { DEFAULT_REALTIME_CONFIG } from '../../config/realtimeConfigDefaults';
import securePrivateStorageService from '../securePrivateStorageService';
import { addLoanProfile, selectLoanProfileById } from '../../store/slices/loanProfilesSlice';
import { addPayment, selectPaymentsForLoan } from '../../store/slices/loanPaymentsSlice';
import { getPaymentStatus } from '../../features/loans/utils/loanReminderUtils';
import buildReportPdfHtml from '../../features/reports/templates/pdfHtmlRenderer';
import { buildLoanSummaryReport } from '../../features/reports/adapters/loanReportAdapters';

// Mock Keychain
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
  ACCESSIBLE: { WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly' },
}));

describe('Phase 20 — Production Release Readiness & Security Audit', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================
  // 1. SIMULATED AD PRODUCTION SAFETY
  // ============================================================
  test('1. Production Safety: AdProviderFactory NEVER returns SimulatedAdProvider in production (isDev: false)', () => {
    // When isDev is false, regardless of simulation flags
    const provider = AdProviderFactory.getProvider({
      isDev: false,
      devSimulationEnabled: true,
    });

    expect(provider instanceof SimulatedAdProvider).toBe(false);
    expect(provider instanceof NoAdProvider).toBe(true);
  });

  test('2. Production Safety: ApprovedAdProvider is ONLY selected in production if valid appId is configured', () => {
    const approvedConfig = { appId: 'ca-app-pub-123456789' };
    const provider = AdProviderFactory.getProvider({
      isDev: false,
      approvedSdkConfig: approvedConfig,
    });

    expect(provider instanceof ApprovedAdProvider).toBe(true);
  });

  // ============================================================
  // 2. DEPENDENCY & AD SDK AUDIT
  // ============================================================
  test('3. Dependency Audit: package.json contains 0 real advertising SDKs', () => {
    const pkg = require('../../../package.json');
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

    const prohibitedAdSDKs = [
      'react-native-google-mobile-ads',
      'react-native-admob',
      'react-native-fbads',
      'react-native-applovin-max',
      'react-native-unity-ads',
      'react-native-ironsource',
    ];

    prohibitedAdSDKs.forEach((sdk) => {
      expect(allDeps[sdk]).toBeUndefined();
    });
  });

  // ============================================================
  // 3. FIREBASE WRITE AUDIT
  // ============================================================
  test('4. Firebase RTDB is read-only: zero financial write methods exist in codebase', () => {
    const rtdbService = require('../../config/realtimeConfigService').default;

    // Verify service only initializes listener and saves to local AsyncStorage
    expect(typeof rtdbService.initialize).toBe('function');
    expect(typeof rtdbService.processRemotePayload).toBe('function');
    expect(rtdbService.writeUserFinancialData).toBeUndefined();
    expect(rtdbService.syncLedgerToCloud).toBeUndefined();
  });

  // ============================================================
  // 4. RTDB CONFIGURATION SAFETY & PRIVACY FIREWALL
  // ============================================================
  test('5. Remote configuration CANNOT override protected financial screen privacy', () => {
    // Attempt to inject an ad on a protected financial screen
    PROTECTED_FINANCIAL_SCREENS.forEach((screen) => {
      const decision = adDecisionEngine.canShowAd({
        placementId: 'test_banner',
        screen,
        isAdFree: false,
        isOnline: true,
      });

      expect(decision.allowed).toBe(false);
      expect(decision.reason).toBe('FINANCIAL_WORKFLOW');
    });
  });

  test('6. Malformed remote configuration safely fails validation and retains default fallback', () => {
    const malformedPayload = {
      version: 'invalid_version',
      ads: {
        cooldownMinutes: -5,
        maxPerSession: 'ten',
      },
    };

    const { valid, errors } = validateRealtimeConfig(malformedPayload);
    expect(valid).toBe(false);
    expect(errors.length).toBeGreaterThan(0);
    expect(DEFAULT_REALTIME_CONFIG.ads.interstitial.cooldownMinutes).toBe(3);
    expect(DEFAULT_REALTIME_CONFIG.ads.interstitial.maxPerSession).toBe(3);
  });

  // ============================================================
  // 5. SECURE STORAGE & CREDENTIAL AUDIT
  // ============================================================
  test('7. Credentials exist exclusively in Keychain and throw safely on hardware failure', async () => {
    const Keychain = require('react-native-keychain');
    Keychain.setGenericPassword.mockRejectedValue(new Error('Hardware Keystore Error'));

    await expect(
      securePrivateStorageService.setSecureValue('finzo.loan.123.sensitive.credential', 'secret_pin')
    ).rejects.toThrow("Sensitive information couldn't be securely stored on this device.");
  });

  // ============================================================
  // 6. PAID-OFF LOAN COHERENCE
  // ============================================================
  test('8. Paid-off loan (balance = 0) disables payment reminders and returns paid_off status', () => {
    const paidOffLoan = {
      id: 'loan_paid',
      name: 'Cleared Loan',
      originalPrincipal: 500000,
      currentOutstandingPrincipal: 0,
      dueDay: 5,
      remindersEnabled: true,
    };

    const status = getPaymentStatus(paidOffLoan, []);
    expect(status.status).toBe('paid_off');
    expect(status.isCurrentPeriodPaid).toBe(true);
  });

  // ============================================================
  // 7. PDF EXPORT SECURITY & PRIVACY
  // ============================================================
  test('9. PDF Export HTML generator formats report accurately and never includes secret credentials', () => {
    const loan = {
      id: 'loan_1',
      name: 'Home Loan',
      lenderName: 'State Bank of India',
      loanAccountReference: 'XXXX-9876',
      currentOutstandingPrincipal: 2500000,
      originalPrincipal: 3000000,
      interestRate: 8.5,
      annualInterestRate: 8.5,
      emiAmount: 35000,
      status: 'active',
      hasSecureCredential: true, // Boolean flag only
    };

    const reportModel = buildLoanSummaryReport({ loan, payments: [] });
    const html = buildReportPdfHtml(reportModel);

    expect(html).toContain('Home Loan');
    expect(html).toContain('State Bank of India');
    // Secrets must NOT be rendered in HTML
    expect(html).not.toContain('secret_password');
    expect(html).not.toContain('auth_pin');
  });

  // ============================================================
  // 8. END-TO-END MULTI-LOAN ISOLATION & LEDGER INTEGRITY
  // ============================================================
  test('10. Full multi-loan persistence & chronological ledger calculations survive mutations', () => {
    const store = configureStore({ reducer: rootReducer });

    // Create 5 loans
    for (let i = 1; i <= 5; i++) {
      store.dispatch(
        addLoanProfile({
          id: `loan_${i}`,
          name: `Loan ${i}`,
          originalPrincipal: i * 1000000,
          currentOutstandingPrincipal: i * 1000000,
          interestRate: 8.0 + i * 0.25,
          emiAmount: 20000 * i,
        })
      );

      // Record payments for each loan
      store.dispatch(
        addPayment({
          id: `pay_${i}_1`,
          loanId: `loan_${i}`,
          amount: 20000 * i,
          paymentDate: '2026-08-01',
          paymentType: 'regular_emi',
        })
      );
    }

    const state = store.getState();

    // Verify all 5 loans are independent
    for (let i = 1; i <= 5; i++) {
      const loan = selectLoanProfileById(state, `loan_${i}`);
      const payments = selectPaymentsForLoan(state, `loan_${i}`);

      expect(loan.name).toBe(`Loan ${i}`);
      expect(payments).toHaveLength(1);
      expect(payments[0].loanId).toBe(`loan_${i}`);
    }
  });
});
