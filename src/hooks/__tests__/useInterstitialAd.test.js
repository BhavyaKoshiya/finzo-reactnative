import React from 'react';
import { BackHandler } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { useInterstitialAd } from '../useInterstitialAd';
import adService from '../../services/adService';
import { AD_PLACEMENTS } from '../../services/ads/adPlacementConstants';

const mockGoBack = jest.fn();
const mockCanGoBack = jest.fn(() => true);
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  const ReactMock = require('react');
  return {
    useNavigation: () => ({
      goBack: mockGoBack,
      canGoBack: mockCanGoBack,
      navigate: mockNavigate,
    }),
    useFocusEffect: (cb) => {
      ReactMock.useEffect(() => {
        const cleanup = cb();
        return () => {
          if (typeof cleanup === 'function') cleanup();
        };
      }, [cb]);
    },
  };
});

jest.mock('../../services/adService', () => ({
  __esModule: true,
  default: {
    showInterstitial: jest.fn(() => Promise.resolve({ status: 'COMPLETED' })),
  },
}));

describe('useInterstitialAd Hook Tests', () => {
  let backHandlerListeners = [];

  beforeEach(() => {
    jest.clearAllMocks();
    backHandlerListeners = [];
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((event, handler) => {
      if (event === 'hardwareBackPress') {
        backHandlerListeners.push(handler);
      }
      return {
        remove: () => {
          backHandlerListeners = backHandlerListeners.filter((h) => h !== handler);
        },
      };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function TestComponent({ options = {} }) {
    const { handleBackWithAd } = useInterstitialAd(options);
    return <>{null}</>;
  }

  test('1. Registers BackHandler on focus and removes on unmount', () => {
    let renderer;
    act(() => {
      renderer = ReactTestRenderer.create(<TestComponent />);
    });

    expect(BackHandler.addEventListener).toHaveBeenCalledWith(
      'hardwareBackPress',
      expect.any(Function)
    );
    expect(backHandlerListeners.length).toBe(1);

    act(() => {
      renderer.unmount();
    });

    expect(backHandlerListeners.length).toBe(0);
  });

  test('2. Physical back press intercepts event, shows ad, and navigates back', async () => {
    let hookResult;
    function Consumer() {
      hookResult = useInterstitialAd({ screen: 'calculators' });
      return null;
    }

    await act(async () => {
      ReactTestRenderer.create(<Consumer />);
    });

    expect(backHandlerListeners.length).toBe(1);
    const handler = backHandlerListeners[0];

    // Simulate physical back press event
    let consumed;
    await act(async () => {
      consumed = handler();
    });

    // Must return true to consume hardware event
    expect(consumed).toBe(true);
    expect(adService.showInterstitial).toHaveBeenCalledWith(
      AD_PLACEMENTS.CALCULATOR_INTERSTITIAL,
      { screen: 'calculators' }
    );
    expect(mockGoBack).toHaveBeenCalled();
  });

  test('3. Fail-safe: Always completes navigation even if showInterstitial throws', async () => {
    adService.showInterstitial.mockRejectedValueOnce(new Error('Ad failed to load'));

    let hookResult;
    function Consumer() {
      hookResult = useInterstitialAd();
      return null;
    }

    await act(async () => {
      ReactTestRenderer.create(<Consumer />);
    });

    await act(async () => {
      await hookResult.handleBackWithAd();
    });

    expect(adService.showInterstitial).toHaveBeenCalled();
    expect(mockGoBack).toHaveBeenCalled();
  });

  test('4. Double-tap guard: Rapid repeated calls only trigger showInterstitial once', async () => {
    let hookResult;
    function Consumer() {
      hookResult = useInterstitialAd();
      return null;
    }

    await act(async () => {
      ReactTestRenderer.create(<Consumer />);
    });

    await act(async () => {
      const p1 = hookResult.handleBackWithAd();
      const p2 = hookResult.handleBackWithAd();
      await Promise.all([p1, p2]);
    });

    expect(adService.showInterstitial).toHaveBeenCalledTimes(1);
  });

  test('5. Supports onCustomBack when provided', async () => {
    const onCustomBack = jest.fn();
    let hookResult;
    function Consumer() {
      hookResult = useInterstitialAd({ onCustomBack });
      return null;
    }

    await act(async () => {
      ReactTestRenderer.create(<Consumer />);
    });

    await act(async () => {
      await hookResult.handleBackWithAd();
    });

    expect(onCustomBack).toHaveBeenCalled();
    expect(mockGoBack).not.toHaveBeenCalled();
  });

  test('6. Honors enableHardwareBack = false', () => {
    act(() => {
      ReactTestRenderer.create(<TestComponent options={{ enableHardwareBack: false }} />);
    });

    expect(backHandlerListeners.length).toBe(0);
  });
});
