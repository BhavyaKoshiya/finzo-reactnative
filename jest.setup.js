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
