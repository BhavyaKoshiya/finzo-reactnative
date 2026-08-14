/* eslint-env jest */
import firebaseAnalyticsService, {
  ANALYTICS_EVENTS,
  sanitizeAnalyticsParams,
} from '../firebaseAnalyticsService';
import firebaseCrashlyticsService, {
  sanitizeCrashlyticsAttributes,
} from '../firebaseCrashlyticsService';
import firebaseMessagingService, {
  sanitizeNotificationData,
} from '../firebaseMessagingService';
import {
  getAnalytics,
  logEvent as firebaseLogEvent,
} from '@react-native-firebase/analytics';
import {
  getCrashlytics,
  log as crashlyticsLog,
  setAttribute as crashlyticsSetAttribute,
  setAttributes as crashlyticsSetAttributes,
} from '@react-native-firebase/crashlytics';
import {
  onMessage,
  getInitialNotification,
} from '@react-native-firebase/messaging';

describe('Firebase Services QA — Analytics, Crashlytics & Messaging', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset cached instances so each test gets a fresh instance
    firebaseAnalyticsService.analyticsInstance = null;
    firebaseCrashlyticsService.crashlyticsInstance = null;
    firebaseCrashlyticsService.isInitialized = false;
    firebaseMessagingService.messagingInstance = null;
    firebaseMessagingService.cachedToken = null;
  });

  // ============================================================
  // 1. FIREBASE ANALYTICS & PARAMETER SANITIZATION
  // ============================================================
  describe('1. Firebase Analytics Service', () => {
    test('sanitizeAnalyticsParams strictly strips forbidden financial keys', () => {
      const rawParams = {
        calculator_type: 'home_loan',
        screen_name: 'EMICalculator',
        loanAmount: 5000000,
        outstandingBalance: 3200000,
        emi: 45000,
        interestRate: 8.5,
        accountNumber: '123456789012',
        pin: '1234',
        password: 'secretPassword',
        notes: 'Private borrower notes',
        rawLoan: { id: 'loan-1', amount: 5000000 },
        reduxState: { loanProfiles: [] },
      };

      const sanitized = sanitizeAnalyticsParams(rawParams);

      expect(sanitized).toEqual({
        calculator_type: 'home_loan',
        screen_name: 'EMICalculator',
      });
      expect(sanitized.loanAmount).toBeUndefined();
      expect(sanitized.outstandingBalance).toBeUndefined();
      expect(sanitized.emi).toBeUndefined();
      expect(sanitized.interestRate).toBeUndefined();
      expect(sanitized.accountNumber).toBeUndefined();
      expect(sanitized.pin).toBeUndefined();
      expect(sanitized.notes).toBeUndefined();
      expect(sanitized.rawLoan).toBeUndefined();
    });

    test('sanitizeAnalyticsParams blocks large numeric values that could represent money', () => {
      const sanitized = sanitizeAnalyticsParams({
        safe_counter: 5,
        large_unverified_number: 50000,
      });

      expect(sanitized.safe_counter).toBe(5);
      expect(sanitized.large_unverified_number).toBeUndefined();
    });

    test('logEvent logs valid sanitized product-level events to Firebase Analytics', async () => {
      const result = await firebaseAnalyticsService.logEvent(ANALYTICS_EVENTS.CALCULATOR_OPENED, {
        calculator_type: 'car_loan',
        loanAmount: 1000000, // Should be stripped
      });

      expect(result).toBe(true);
      const analyticsInstance = getAnalytics();
      expect(firebaseLogEvent).toHaveBeenCalledWith(analyticsInstance, ANALYTICS_EVENTS.CALCULATOR_OPENED, {
        calculator_type: 'car_loan',
      });
    });

    test('Safe helper tracking methods execute without throwing', async () => {
      await firebaseAnalyticsService.logScreenView('LoanDashboardScreen');
      await firebaseAnalyticsService.logCalculatorCompleted('sip');
      await firebaseAnalyticsService.logLoanCreated('personal_loan');
      await firebaseAnalyticsService.logLoanDeleted('personal_loan');
      await firebaseAnalyticsService.logPaymentRecorded('regular_emi');
      await firebaseAnalyticsService.logGoalCreated('payoff');
      await firebaseAnalyticsService.logPdfExported('statement');
      await firebaseAnalyticsService.logRewardedAdStarted('interstitial_banner');
      await firebaseAnalyticsService.logRewardedAdCompleted('interstitial_banner');
      await firebaseAnalyticsService.logAdFreeActivated(30);
      await firebaseAnalyticsService.logUpdatePromptShown('mandatory');
      await firebaseAnalyticsService.logUpdateClicked('mandatory');

      // logScreenView uses firebaseLogScreenView, the rest use firebaseLogEvent (11 calls)
      expect(firebaseLogEvent).toHaveBeenCalledTimes(11);
    });

    test('logEvent handles errors gracefully without crashing the application', async () => {
      firebaseLogEvent.mockRejectedValueOnce(new Error('Analytics network timeout'));

      const result = await firebaseAnalyticsService.logEvent(ANALYTICS_EVENTS.APP_OPEN);
      expect(result).toBe(false);
    });
  });

  // ============================================================
  // 2. FIREBASE CRASHLYTICS & ERROR SANITIZATION
  // ============================================================
  describe('2. Firebase Crashlytics Service', () => {
    test('sanitizeCrashlyticsAttributes filters out financial keys', () => {
      const rawAttributes = {
        feature_area: 'loans',
        environment: 'production',
        loanAmount: '₹50,00,000',
        outstanding: '₹30,00,000',
        emi: '₹42,000',
        password: 'mySecretPassword',
      };

      const sanitized = sanitizeCrashlyticsAttributes(rawAttributes);

      expect(sanitized).toEqual({
        feature_area: 'loans',
        environment: 'production',
      });
    });

    test('initialize sets safe baseline device attributes', async () => {
      await firebaseCrashlyticsService.initialize();

      const crashlyticsInstance = getCrashlytics();
      expect(crashlyticsSetAttributes).toHaveBeenCalledWith(
        crashlyticsInstance,
        expect.objectContaining({
          app_version: '1.0.0',
          platform: expect.any(String),
        })
      );
    });

    test('recordError safely logs non-fatal exceptions with sanitized context', async () => {
      const error = new Error('Calculation rounding exception');
      const context = {
        feature_area: 'calculators',
        screen_name: 'SIPCalculator',
        emi: 50000, // Should be stripped
      };

      const result = await firebaseCrashlyticsService.recordError(error, context);
      expect(result).toBe(true);
    });

    test('log records safe diagnostic breadcrumb', async () => {
      const result = await firebaseCrashlyticsService.log('User navigated to Calculator Search');
      expect(result).toBe(true);
      const crashlyticsInstance = getCrashlytics();
      expect(crashlyticsLog).toHaveBeenCalledWith(crashlyticsInstance, 'User navigated to Calculator Search');
    });

    test('setAttribute sanitizes key-value attribute', async () => {
      await firebaseCrashlyticsService.setAttribute('feature_area', 'settings');
      await firebaseCrashlyticsService.setAttribute('loanAmount', '5000000'); // Forbidden

      const crashlyticsInstance = getCrashlytics();
      expect(crashlyticsSetAttribute).toHaveBeenCalledWith(crashlyticsInstance, 'feature_area', 'settings');
      expect(crashlyticsSetAttribute).not.toHaveBeenCalledWith(crashlyticsInstance, 'loanAmount', expect.anything());
    });
  });

  // ============================================================
  // 3. FIREBASE CLOUD MESSAGING & NOTIFICATION PRIVACY
  // ============================================================
  describe('3. Firebase Cloud Messaging Service', () => {
    test('sanitizeNotificationData strips financial keys from push data', () => {
      const rawData = {
        notificationType: 'app_update',
        targetScreen: 'Profile',
        loanAmount: '5000000',
        emi: '42000',
        accountNumber: '123456789',
        notes: 'Confidential loan information',
      };

      const sanitized = sanitizeNotificationData(rawData);

      expect(sanitized).toEqual({
        notificationType: 'app_update',
        targetScreen: 'Profile',
      });
    });

    test('requestPermission returns authorization status', async () => {
      const result = await firebaseMessagingService.requestPermission();
      expect(result.authorized).toBe(true);
      expect(result.status).toBe(1);
    });

    test('getToken fetches device token without saving to Redux state', async () => {
      const token = await firebaseMessagingService.getToken();
      expect(token).toBe('mock-fcm-token-12345');
    });

    test('onMessage listener invokes callback with sanitized payload data', () => {
      let registeredCallback = null;
      onMessage.mockImplementation((_instance, cb) => {
        registeredCallback = cb;
        return () => {};
      });

      const clientCb = jest.fn();
      firebaseMessagingService.onMessage(clientCb);

      expect(registeredCallback).toBeDefined();

      registeredCallback({
        notification: { title: 'Finzo Update Available', body: 'New features are ready.' },
        data: {
          updateType: 'mandatory',
          loanAmount: 5000000, // Should be stripped
        },
      });

      expect(clientCb).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            updateType: 'mandatory',
          },
        })
      );
    });

    test('getInitialNotification returns sanitized remote message if present', async () => {
      getInitialNotification.mockResolvedValueOnce({
        data: { screen: 'Rewards', emi: 4000 },
      });

      const message = await firebaseMessagingService.getInitialNotification();
      expect(message).toEqual({
        data: { screen: 'Rewards' },
      });
    });
  });
});
