/* eslint-env jest */
import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AppStartupGate, AD_STARTUP_TIMEOUT_MS } from '../../components/containers/AppStartupGate';
import connectivityReducer from '../../store/slices/connectivitySlice';
import connectivityService from '../../services/connectivityService';
import adService from '../../services/adService';
import { MarketingAdProvider } from '../../services/ads/marketingAdProvider';
import { interstitialFrequencyService } from '../../services/ads/interstitialFrequencyService';
import adDecisionEngine, { isProtectedScreen } from '../../services/ads/adDecisionEngine';
import { AD_PLACEMENTS } from '../../services/ads/adPlacementConstants';
import { realtimeConfigService } from '../../config/realtimeConfigService';
import {
  marketingPlugin,
  bannerAdManager,
  nativeAdManager,
  interstitialAdManager,
  rewardedAdManager,
} from 'react-native-marketing-plugin';
import BootSplash from 'react-native-bootsplash';
import { Text } from 'react-native';

const createMockStore = () =>
  configureStore({
    reducer: {
      connectivity: connectivityReducer,
    },
  });

describe('Phase 27: Ad Startup Initialization & Preloading QA', () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    store = createMockStore();
    interstitialFrequencyService.resetSession();

    // Reset adService internal state
    adService.isInitialized = false;
    adService.initPromise = null;
    adService.setProviderOverride(null);

    // Mock connectivity to online by default
    jest.spyOn(connectivityService, 'getConnectivityState').mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    });
    jest.spyOn(connectivityService, 'subscribeToConnectivity').mockReturnValue(() => {});

    // Ensure BootSplash.hide resolves
    BootSplash.hide.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  // ============================================================
  // 1. STARTUP TIMING & TIMEOUT BEHAVIOR
  // ============================================================
  describe('1. Startup Timing & Splash Wait Behavior', () => {
    test('1.1. Ads initialize immediately -> startup continues immediately', async () => {
      jest.spyOn(adService, 'initialize').mockResolvedValue(true);

      let tree;
      await act(async () => {
        tree = ReactTestRenderer.create(
          <Provider store={store}>
            <AppStartupGate>
              <Text>Finzo App Home</Text>
            </AppStartupGate>
          </Provider>
        );
      });

      const textNodes = tree.root.findAllByType(Text);
      expect(textNodes.length).toBeGreaterThan(0);
      expect(textNodes[0].props.children).toBe('Finzo App Home');
      expect(BootSplash.hide).toHaveBeenCalledWith({ fade: true });
    });

    test('1.2. Ads initialize after delay -> startup waits and continues immediately on ready', async () => {
      jest.spyOn(adService, 'initialize').mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(true), 30))
      );

      let tree;
      await act(async () => {
        tree = ReactTestRenderer.create(
          <Provider store={store}>
            <AppStartupGate>
              <Text>Finzo App Home</Text>
            </AppStartupGate>
          </Provider>
        );
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const textNodes = tree.root.findAllByType(Text);
      expect(textNodes.length).toBeGreaterThan(0);
      expect(textNodes[0].props.children).toBe('Finzo App Home');
      expect(BootSplash.hide).toHaveBeenCalledWith({ fade: true });
    });

    test('1.3. Ads take longer than 5 seconds -> startup continues at 5 seconds maximum without blocking', async () => {
      jest.useFakeTimers();

      let adResolved = false;
      jest.spyOn(adService, 'initialize').mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              adResolved = true;
              resolve(true);
            }, 8000); // 8 seconds (longer than 5s limit)
          })
      );

      let tree;
      await act(async () => {
        tree = ReactTestRenderer.create(
          <Provider store={store}>
            <AppStartupGate>
              <Text>Finzo App Home</Text>
            </AppStartupGate>
          </Provider>
        );
      });

      // Initially at T=0, children should not be mounted (only gateContainer View)
      expect(tree.root.findAllByType(Text).length).toBe(0);

      // Fast-forward by 4 seconds (less than 5s timeout)
      await act(async () => {
        jest.advanceTimersByTime(4000);
      });
      expect(tree.root.findAllByType(Text).length).toBe(0);

      // Fast-forward by another 1.1 seconds (crossing 5s timeout)
      await act(async () => {
        jest.advanceTimersByTime(1100);
      });

      // Startup must continue!
      const textNodes = tree.root.findAllByType(Text);
      expect(textNodes.length).toBeGreaterThan(0);
      expect(textNodes[0].props.children).toBe('Finzo App Home');
      expect(BootSplash.hide).toHaveBeenCalledWith({ fade: true });

      // But ad load was NOT cancelled; it is still running
      expect(adResolved).toBe(false);

      // Fast-forward to 8s where ad finishes loading in background
      await act(async () => {
        jest.advanceTimersByTime(3000);
      });
      expect(adResolved).toBe(true);

      jest.useRealTimers();
    });

    test('1.4. 5-second timeout does NOT cancel underlying ad preload and late load succeeds in background', async () => {
      jest.useFakeTimers();

      let backgroundLoadCompleted = false;
      const delayedInit = new Promise((resolve) => {
        setTimeout(() => {
          backgroundLoadCompleted = true;
          resolve(true);
        }, 7000);
      });

      jest.spyOn(adService, 'initialize').mockReturnValue(delayedInit);

      let tree;
      await act(async () => {
        tree = ReactTestRenderer.create(
          <Provider store={store}>
            <AppStartupGate>
              <Text>Finzo App Home</Text>
            </AppStartupGate>
          </Provider>
        );
      });

      // Advance past 5s Splash timeout
      await act(async () => {
        jest.advanceTimersByTime(AD_STARTUP_TIMEOUT_MS + 100);
      });

      // App is rendered past Splash
      expect(tree.root.findAllByType(Text).length).toBeGreaterThan(0);
      expect(backgroundLoadCompleted).toBe(false);

      // Advance past 7s background completion
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      expect(backgroundLoadCompleted).toBe(true);

      jest.useRealTimers();
    });
  });

  // ============================================================
  // 2. AD PRELOAD LIFECYCLE & SAFETY
  // ============================================================
  describe('2. Ad Preload Lifecycle & Invariant Safety', () => {
    test('2.1. Preloading initializes MarketingAdProvider and triggers banner, native, and interstitial preloads', async () => {
      const provider = new MarketingAdProvider();
      const initResult = await provider.initialize();

      expect(initResult).toBe(true);
      expect(marketingPlugin.initialize).toHaveBeenCalledWith({
        baseUrl: 'https://binarykode-technologies.web.app/adconfigs',
        bundleId: 'com.finzo.financecalculator',
        enableAppOpenOnResume: false,
      });

      await provider.preloadAds();
      expect(bannerAdManager.preloadAll).toHaveBeenCalled();
      expect(nativeAdManager.preloadAll).toHaveBeenCalledWith('nativeNormal');
      expect(interstitialAdManager.preloadAds).toHaveBeenCalled();
      expect(rewardedAdManager.preloadAds).toHaveBeenCalled();
    });

    test('2.2. Preloading does NOT increment opportunityCounter', async () => {
      expect(interstitialFrequencyService.getCounter()).toBe(0);

      await adService.initialize();
      await adService.preloadAds();

      expect(interstitialFrequencyService.getCounter()).toBe(0);
    });

    test('2.3. Preloading does NOT consume the 3/session interstitial limit', async () => {
      expect(interstitialFrequencyService.getSessionCount()).toBe(0);

      await adService.initialize();
      await adService.preloadAds();

      expect(interstitialFrequencyService.getSessionCount()).toBe(0);
    });

    test('2.4. Preloaded ads do NOT automatically display without user interaction', async () => {
      const provider = new MarketingAdProvider();
      await provider.initialize();
      await provider.preloadAds();

      // Ensure showInterstitial and showRewardAd were NEVER called automatically
      expect(marketingPlugin.showInterstitial).not.toHaveBeenCalled();
      expect(marketingPlugin.showRewardAd).not.toHaveBeenCalled();
    });

    test('2.5. adService.showInterstitial still strictly enforces adDecisionEngine and frequency rules', async () => {
      const provider = new MarketingAdProvider();
      adService.setProviderOverride(provider);
      await adService.initialize();

      const config = {
        ...realtimeConfigService.getConfig(),
        ads: {
          enabled: true,
          interstitial: { enabled: true, adTime: 2, maxPerSession: 3 },
          placements: { calculators: { interstitial: true } },
        },
      };

      // Call 1 on eligible screen -> counter increments to 1, should NOT show yet (adTime = 2)
      const res1 = await adService.showInterstitial(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL, {
        screen: 'calculators',
        isOnline: true,
        isAdFree: false,
        adTime: 2,
        config,
      });

      expect(res1.status).toBe('FAILED');
      expect(res1.reason).toBe('THRESHOLD_NOT_MET');
      expect(interstitialFrequencyService.getCounter()).toBe(1);
      expect(marketingPlugin.showInterstitial).not.toHaveBeenCalled();

      // Call 2 on eligible screen -> counter reaches 2 (adTime = 2), triggers show!
      const res2 = await adService.showInterstitial(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL, {
        screen: 'calculators',
        isOnline: true,
        isAdFree: false,
        adTime: 2,
        config,
      });

      expect(res2.status).toBe('COMPLETED');
      expect(marketingPlugin.showInterstitial).toHaveBeenCalled();
      expect(interstitialFrequencyService.getSessionCount()).toBe(1);
      expect(interstitialFrequencyService.getCounter()).toBe(0);
    });
  });

  // ============================================================
  // 3. FAILURE TOLERANCE & OFFLINE RESILIENCE
  // ============================================================
  describe('3. Failure Tolerance & Offline Startup', () => {
    test('3.1. Ad initialization failure does not block startup or crash app', async () => {
      jest.spyOn(adService, 'initialize').mockRejectedValue(new Error('Network failure 503'));

      let tree;
      await act(async () => {
        tree = ReactTestRenderer.create(
          <Provider store={store}>
            <AppStartupGate>
              <Text>Finzo App Home</Text>
            </AppStartupGate>
          </Provider>
        );
      });

      const textNodes = tree.root.findAllByType(Text);
      expect(textNodes.length).toBeGreaterThan(0);
      expect(textNodes[0].props.children).toBe('Finzo App Home');
      expect(BootSplash.hide).toHaveBeenCalledWith({ fade: true });
    });

    test('3.2. Offline startup continues immediately without waiting for ad network', async () => {
      jest.spyOn(connectivityService, 'getConnectivityState').mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      });

      const adInitSpy = jest.spyOn(adService, 'initialize');

      let tree;
      await act(async () => {
        tree = ReactTestRenderer.create(
          <Provider store={store}>
            <AppStartupGate>
              <Text>Finzo App Home</Text>
            </AppStartupGate>
          </Provider>
        );
      });

      const textNodes = tree.root.findAllByType(Text);
      expect(textNodes.length).toBeGreaterThan(0);
      expect(textNodes[0].props.children).toBe('Finzo App Home');
      expect(adInitSpy).not.toHaveBeenCalled();
      expect(BootSplash.hide).toHaveBeenCalledWith({ fade: true });
    });
  });

  // ============================================================
  // 4. IDEMPOTENCY & DUPLICATE PROTECTION
  // ============================================================
  describe('4. Idempotency & Duplicate Protection', () => {
    test('4.1. Multiple calls to adService.initialize return the same promise and initialize provider only once', async () => {
      const provider = new MarketingAdProvider();
      const initSpy = jest.spyOn(provider, 'initialize');
      adService.setProviderOverride(provider);

      const p1 = adService.initialize();
      const p2 = adService.initialize();
      const p3 = adService.initialize();

      expect(p1).toBe(p2);
      expect(p2).toBe(p3);

      const [r1, r2, r3] = await Promise.all([p1, p2, p3]);
      expect(r1).toBe(true);
      expect(r2).toBe(true);
      expect(r3).toBe(true);
      expect(initSpy).toHaveBeenCalledTimes(1);
    });

    test('4.2. React re-render of AppStartupGate does not cause duplicate initialization', async () => {
      const initSpy = jest.spyOn(adService, 'initialize').mockResolvedValue(true);

      let tree;
      await act(async () => {
        tree = ReactTestRenderer.create(
          <Provider store={store}>
            <AppStartupGate>
              <Text>Count: 1</Text>
            </AppStartupGate>
          </Provider>
        );
      });

      await act(async () => {
        tree.update(
          <Provider store={store}>
            <AppStartupGate>
              <Text>Count: 2</Text>
            </AppStartupGate>
          </Provider>
        );
      });

      const textNodes = tree.root.findAllByType(Text);
      expect(textNodes[0].props.children).toBe('Count: 2');
      // Only 1 initial call on mount
      expect(initSpy).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // 5. APP-OPEN, ADTIME, FINANCIAL WORKFLOW & PLACEMENT FREEZE
  // ============================================================
  describe('5. Safety Invariants & Placement Freeze Verification', () => {
    test('5.1. App-open ads remain strictly disabled (enableAppOpenOnResume: false)', async () => {
      const provider = new MarketingAdProvider();
      await provider.initialize();

      expect(marketingPlugin.initialize).toHaveBeenCalledWith(
        expect.objectContaining({
          enableAppOpenOnResume: false,
        })
      );
    });

    test('5.2. Protected financial screens remain 100% ad-free and block interstitials', async () => {
      const protectedScreens = [
        'add_payment',
        'edit_payment',
        'delete_payment',
        'correct_balance',
        'add_loan',
        'edit_loan',
        'loan_private_details',
        'loan_notes',
        'loan_prepayment_simulator',
        'loan_payoff_planner',
        'loan_goals',
        'loan_goal_details',
        'pdf_export',
        'pdf_generation',
        'local_data_privacy',
      ];

      protectedScreens.forEach((screen) => {
        expect(isProtectedScreen(screen)).toBe(true);

        const decision = adDecisionEngine.canShowAd({
          adType: 'interstitial',
          screen,
          isOnline: true,
          isAdFree: false,
        });

        expect(decision.allowed).toBe(false);
        expect(decision.reason).toBe('FINANCIAL_WORKFLOW');
      });
    });

    test('5.3. All 15 frozen ad placements are preserved exactly', () => {
      expect(Object.keys(AD_PLACEMENTS)).toEqual([
        'HOME_BANNER',
        'HOME_NATIVE',
        'TAB_BOTTOM_BANNER',
        'CALCULATOR_BANNER',
        'CALCULATOR_NATIVE',
        'CALCULATOR_INTERSTITIAL',
        'MY_LOANS_BANNER',
        'LOAN_DETAILS_NATIVE',
        'LOAN_INSIGHTS_BANNER',
        'PROFILE_BANNER',
        'PROFILE_NATIVE',
        'PROFILE_REWARDED',
        'REWARDS_BANNER',
        'REWARDS_NATIVE',
        'REWARDS_REWARDED',
      ]);
    });
  });
});
