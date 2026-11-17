/* eslint-env jest */
import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import adService, { INTERSTITIAL_PREPARE_AHEAD } from '../adService';
import { interstitialFrequencyService } from '../ads/interstitialFrequencyService';
import { BaseAdProvider } from '../ads/baseAdProvider';
import { AD_STATES } from '../ads/adProviderTypes';
import { AD_PLACEMENTS } from '../ads/adPlacementConstants';
import { AppStartupGate, AD_STARTUP_TIMEOUT_MS } from '../../components/containers/AppStartupGate';
import connectivityService from '../connectivityService';
import { realtimeConfigService } from '../../config/realtimeConfigService';
import connectivityReducer from '../../store/slices/connectivitySlice';
import settingsReducer from '../../store/slices/settingsSlice';
import rewardsReducer from '../../store/slices/rewardsSlice';

/** Provider whose interstitial is "loaded" only once prepareInterstitial() was called. */
class FakeProvider extends BaseAdProvider {
  constructor() {
    super();
    this.ready = false;
    this.prepareInterstitial = jest.fn(() => {
      this.ready = true;
    });
    this.showInterstitial = jest.fn(async () => {
      this.ready = false;
      return { status: AD_STATES.COMPLETED, provider: 'fake' };
    });
  }

  getType() {
    return 'fake';
  }

  isConfigured() {
    return true;
  }

  isInterstitialAvailable() {
    return true;
  }

  isInterstitialReady() {
    return this.ready;
  }
}

const opportunity = () =>
  adService.showInterstitial(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL, {
    screen: 'calculators',
    isOnline: true,
    isAdFree: false,
    adTime: 5,
  });

describe('Interstitials load shortly before they are due', () => {
  let provider;

  beforeEach(() => {
    interstitialFrequencyService.resetSession();
    provider = new FakeProvider();
    adService.setProviderOverride(provider);
  });

  afterEach(() => {
    adService.setProviderOverride(null);
  });

  test('nothing loads during the first opportunities', async () => {
    await opportunity(); // 1
    await opportunity(); // 2
    expect(provider.prepareInterstitial).not.toHaveBeenCalled();
  });

  test(`loading starts ${INTERSTITIAL_PREPARE_AHEAD} opportunities before the ad is due, and it shows when due`, async () => {
    await opportunity(); // 1
    await opportunity(); // 2
    await opportunity(); // 3 = 5 - 2: start loading
    expect(provider.prepareInterstitial).toHaveBeenCalledTimes(1);

    await opportunity(); // 4
    const due = await opportunity(); // 5: shown
    expect(due.status).toBe(AD_STATES.COMPLETED);
    expect(provider.showInterstitial).toHaveBeenCalledTimes(1);
  });

  test('a due ad that has not loaded stays due and shows at the next opportunity', async () => {
    provider.prepareInterstitial = jest.fn(); // the load never finishes in time

    for (let i = 0; i < 4; i += 1) {
      await opportunity();
    }
    const due = await opportunity(); // 5: not loaded yet
    expect(due.reason).toBe('NOT_READY');
    expect(provider.showInterstitial).not.toHaveBeenCalled();
    expect(interstitialFrequencyService.getSessionCount()).toBe(0);

    provider.ready = true; // the ad finished loading meanwhile
    const next = await opportunity(); // 6: shown right away
    expect(next.status).toBe(AD_STATES.COMPLETED);
    expect(provider.showInterstitial).toHaveBeenCalledTimes(1);
  });
});

describe('Startup app open ad only shows while the splash is up', () => {
  const makeStore = (rewardsState) =>
    configureStore({
      reducer: {
        connectivity: connectivityReducer,
        settings: settingsReducer,
        rewards: rewardsReducer,
      },
      preloadedState: rewardsState ? { rewards: rewardsState } : undefined,
    });

  const renderGate = async (store) => {
    let tree;
    await act(async () => {
      tree = ReactTestRenderer.create(
        <Provider store={store}>
          <AppStartupGate>
            <Text>Home</Text>
          </AppStartupGate>
        </Provider>
      );
    });
    return tree;
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(connectivityService, 'getConnectivityState').mockResolvedValue({ isConnected: true });
    jest.spyOn(connectivityService, 'subscribeToConnectivity').mockReturnValue(() => {});
    jest.spyOn(realtimeConfigService, 'initialize').mockResolvedValue(true);
    jest.spyOn(adService, 'initialize').mockResolvedValue(true);
    jest.spyOn(adService, 'endStartupAd');
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('the splash stays up while the startup ad is on screen', async () => {
    let finishAd;
    jest.spyOn(adService, 'waitForStartupAd').mockImplementation(
      () =>
        new Promise((resolve) => {
          finishAd = resolve;
        })
    );

    const tree = await renderGate(makeStore());
    expect(adService.waitForStartupAd).toHaveBeenCalled();
    const [timeout] = adService.waitForStartupAd.mock.calls[0];
    expect(timeout).toBeLessThanOrEqual(AD_STARTUP_TIMEOUT_MS);
    expect(tree.root.findAllByType(Text)).toHaveLength(0);

    await act(async () => {
      finishAd();
    });
    expect(tree.root.findAllByType(Text)).toHaveLength(1);
    // Nothing loaded after this point may appear over the app
    expect(adService.endStartupAd).toHaveBeenCalled();
  });

  test('users with ad-free time get no startup ad', async () => {
    jest.spyOn(adService, 'waitForStartupAd').mockResolvedValue();
    const adFreeUntil = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await renderGate(makeStore({ ...rewardsReducer(undefined, { type: '@@init' }), adFreeUntil }));

    expect(adService.endStartupAd).toHaveBeenCalled();
    expect(adService.waitForStartupAd).not.toHaveBeenCalled();
  });
});
