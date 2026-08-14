/* eslint-env jest */
jest.mock('react-native-worklets', () => ({}));
jest.mock('react-native-worklets-core', () => ({}));

jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props) => React.createElement(View, props, props.children);
});

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn().mockResolvedValue({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  }),
  addEventListener: jest.fn(() => jest.fn()),
}));

jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn().mockResolvedValue(true),
  isVisible: jest.fn().mockResolvedValue(false),
  useHideAnimation: jest.fn(),
}));

jest.mock('react-native-html-to-pdf', () => ({
  convert: jest.fn().mockResolvedValue({
    filePath: '/mock/path/to/Finzo_Report.pdf',
  }),
  generatePDF: jest.fn().mockResolvedValue({
    filePath: '/mock/path/to/Finzo_Report.pdf',
  }),
}));

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (Comp) => Comp,
    },
    useSharedValue: (initialValue) => ({ value: initialValue }),
    useAnimatedProps: (fn) => fn(),
    useAnimatedStyle: (fn) => fn(),
    withTiming: (val) => val,
    withSpring: (val) => val,
    Easing: {
      out: (fn) => fn,
      cubic: (t) => t,
      linear: (t) => t,
    },
  };
});

jest.mock('react-native-gifted-charts', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    PieChart: (props) => {
      const children = props.centerLabelComponent ? props.centerLabelComponent() : null;
      return React.createElement(View, { testID: 'mocked-pie-chart' }, children);
    },
    BarChart: () => React.createElement(View, { testID: 'mocked-bar-chart' }),
  };
});

jest.mock('react-native-device-info', () => ({
  getBundleId: jest.fn(() => 'com.finzo.financecalculator'),
  getUniqueId: jest.fn().mockResolvedValue('mock-device-unique-id'),
  getVersion: jest.fn(() => '1.0.0'),
  getBuildNumber: jest.fn(() => '1'),
}));

jest.mock('react-native-google-mobile-ads', () => ({
  __esModule: true,
  default: () => ({
    initialize: jest.fn().mockResolvedValue(true),
    setRequestConfiguration: jest.fn().mockResolvedValue(true),
  }),
  BannerAd: () => null,
  GAMBannerAd: () => null,
  BannerAdSize: {
    BANNER: 'BANNER',
    FULL_BANNER: 'FULL_BANNER',
    LARGE_BANNER: 'LARGE_BANNER',
    MEDIUM_RECTANGLE: 'MEDIUM_RECTANGLE',
  },
  InterstitialAd: {
    createForAdRequest: jest.fn(() => ({
      addAdEventListener: jest.fn((_event, cb) => {
        if (_event === 'loaded' && typeof cb === 'function') cb();
        return () => {};
      }),
      load: jest.fn(),
      show: jest.fn().mockResolvedValue(true),
    })),
  },
  GAMInterstitialAd: {
    createForAdRequest: jest.fn(() => ({
      addAdEventListener: jest.fn((_event, cb) => {
        if (_event === 'loaded' && typeof cb === 'function') cb();
        return () => {};
      }),
      load: jest.fn(),
      show: jest.fn().mockResolvedValue(true),
    })),
  },
  RewardedAd: {
    createForAdRequest: jest.fn(() => ({
      addAdEventListener: jest.fn((_event, cb) => {
        if (_event === 'loaded' && typeof cb === 'function') cb();
        return () => {};
      }),
      load: jest.fn(),
      show: jest.fn().mockResolvedValue(true),
    })),
  },
  AdEventType: {
    LOADED: 'loaded',
    ERROR: 'error',
    OPENED: 'opened',
    CLICKED: 'clicked',
    CLOSED: 'closed',
  },
  RewardedAdEventType: {
    LOADED: 'loaded',
    EARNED_REWARD: 'earned_reward',
  },
  TestIds: {
    BANNER: 'ca-app-pub-3940256099942544/6300978111',
    INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
    GAM_INTERSTITIAL: '/6499/example/interstitial',
    REWARDED: 'ca-app-pub-3940256099942544/5224354917',
  },
}));

jest.mock('react-native-marketing-plugin', () => {
  const React = require('react');
  const { View } = require('react-native');

  const mockMarketingPlugin = {
    adModel: {
      isad: true,
      isbannerenable: true,
      isnativeenable: true,
      isinterstitialenable: true,
      isrewarded: true,
      adTime: 2,
    },
    initialize: jest.fn().mockResolvedValue(true),
    showInterstitial: jest.fn().mockResolvedValue(undefined),
    showCloseInterstitial: jest.fn().mockResolvedValue(undefined),
    showRewardAd: jest.fn().mockImplementation((cb) => {
      if (typeof cb === 'function') cb();
      return Promise.resolve();
    }),
  };

  const mockBannerAdManager = {
    preloadAll: jest.fn(),
    getNextAd: jest.fn(),
    dispose: jest.fn(),
  };

  const mockNativeAdManager = {
    preloadAll: jest.fn(),
    getNextAd: jest.fn(),
    dispose: jest.fn(),
  };

  const mockInterstitialAdManager = {
    preloadAds: jest.fn().mockResolvedValue(undefined),
    showInterstitial: jest.fn().mockResolvedValue(undefined),
    dispose: jest.fn(),
  };

  const mockRewardedAdManager = {
    preloadAds: jest.fn().mockResolvedValue(undefined),
    showRewardedAd: jest.fn().mockResolvedValue(true),
    dispose: jest.fn(),
  };

  return {
    __esModule: true,
    marketingPlugin: mockMarketingPlugin,
    MarketingPlugin: {
      getInstance: () => mockMarketingPlugin,
    },
    bannerAdManager: mockBannerAdManager,
    nativeAdManager: mockNativeAdManager,
    interstitialAdManager: mockInterstitialAdManager,
    rewardedAdManager: mockRewardedAdManager,
    MyAds: {
      nativeNormal: 'nativeNormal',
      nativeSmall: 'nativeSmall',
      nativeCustomeSize: 'nativeCustomeSize',
    },
    BannerAdView: (props) => React.createElement(View, { testID: 'mock-banner-ad-view', ...props }),
    NativeAdComponent: (props) => React.createElement(View, { testID: 'mock-native-ad-component', ...props }),
  };
});

jest.mock('@react-native-firebase/analytics', () => {
  const logEventMock = jest.fn().mockResolvedValue(null);
  const logScreenViewMock = jest.fn().mockResolvedValue(null);
  const setUserIdMock = jest.fn().mockResolvedValue(null);
  const setUserPropertyMock = jest.fn().mockResolvedValue(null);
  const setAnalyticsCollectionEnabledMock = jest.fn().mockResolvedValue(null);

  const mockAnalyticsInstance = {
    logEvent: logEventMock,
    logScreenView: logScreenViewMock,
    setUserId: setUserIdMock,
    setUserProperty: setUserPropertyMock,
    setAnalyticsCollectionEnabled: setAnalyticsCollectionEnabledMock,
  };

  return {
    __esModule: true,
    // Modular API (v26+)
    getAnalytics: jest.fn(() => mockAnalyticsInstance),
    logEvent: logEventMock,
    logScreenView: logScreenViewMock,
    setAnalyticsCollectionEnabled: setAnalyticsCollectionEnabledMock,
    setUserId: setUserIdMock,
    setUserProperty: setUserPropertyMock,
    // Compat fallback
    default: jest.fn(() => mockAnalyticsInstance),
  };
});

jest.mock('@react-native-firebase/crashlytics', () => {
  const recordErrorMock = jest.fn().mockResolvedValue(null);
  const logMock = jest.fn().mockResolvedValue(null);
  const setAttributeMock = jest.fn().mockResolvedValue(null);
  const setAttributesMock = jest.fn().mockResolvedValue(null);
  const setCrashlyticsCollectionEnabledMock = jest.fn().mockResolvedValue(null);

  const mockCrashlyticsInstance = {
    recordError: recordErrorMock,
    log: logMock,
    setAttribute: setAttributeMock,
    setAttributes: setAttributesMock,
    setCrashlyticsCollectionEnabled: setCrashlyticsCollectionEnabledMock,
  };

  return {
    __esModule: true,
    // Modular API (v26+)
    getCrashlytics: jest.fn(() => mockCrashlyticsInstance),
    log: logMock,
    recordError: recordErrorMock,
    setAttribute: setAttributeMock,
    setAttributes: setAttributesMock,
    setCrashlyticsCollectionEnabled: setCrashlyticsCollectionEnabledMock,
    // Compat fallback
    default: jest.fn(() => mockCrashlyticsInstance),
  };
});

jest.mock('@react-native-firebase/messaging', () => {
  const requestPermissionMock = jest.fn().mockResolvedValue(1); // AuthorizationStatus.AUTHORIZED
  const getTokenMock = jest.fn().mockResolvedValue('mock-fcm-token-12345');
  const onTokenRefreshMock = jest.fn(() => () => {});
  const onMessageMock = jest.fn(() => () => {});
  const onNotificationOpenedAppMock = jest.fn(() => () => {});
  const getInitialNotificationMock = jest.fn().mockResolvedValue(null);
  const setBackgroundMessageHandlerMock = jest.fn().mockResolvedValue(null);

  const mockMessagingInstance = {
    requestPermission: requestPermissionMock,
    getToken: getTokenMock,
    onTokenRefresh: onTokenRefreshMock,
    onMessage: onMessageMock,
    onNotificationOpenedApp: onNotificationOpenedAppMock,
    getInitialNotification: getInitialNotificationMock,
    setBackgroundMessageHandler: setBackgroundMessageHandlerMock,
  };

  return {
    __esModule: true,
    // Modular API (v26+)
    getMessaging: jest.fn(() => mockMessagingInstance),
    requestPermission: requestPermissionMock,
    getToken: getTokenMock,
    onTokenRefresh: onTokenRefreshMock,
    onMessage: onMessageMock,
    onNotificationOpenedApp: onNotificationOpenedAppMock,
    getInitialNotification: getInitialNotificationMock,
    setBackgroundMessageHandler: setBackgroundMessageHandlerMock,
    AuthorizationStatus: {
      NOT_DETERMINED: -1,
      DENIED: 0,
      AUTHORIZED: 1,
      PROVISIONAL: 2,
    },
    // Compat fallback
    default: jest.fn(() => mockMessagingInstance),
  };
});

jest.mock('@react-native-firebase/database', () => {
  const mockRef = jest.fn(() => ({
    on: jest.fn((event, cb) => {
      if (typeof cb === 'function') {
        cb({ val: () => null });
      }
      return jest.fn();
    }),
    off: jest.fn(),
    once: jest.fn().mockResolvedValue({ val: () => null }),
  }));

  return {
    __esModule: true,
    getDatabase: jest.fn(() => ({ ref: mockRef })),
    ref: mockRef,
    default: jest.fn(() => ({ ref: mockRef })),
  };
});

