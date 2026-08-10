import 'react-native-gesture-handler/jestSetup';
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

jest.mock('@d11/react-native-fast-image', () => {
  const { View } = require('react-native');
  const FastImageMock = (props: any) => <View {...props} />;
  FastImageMock.resizeMode = { cover: 'cover', contain: 'contain' };
  return FastImageMock;
});

jest.mock('react-native-fast-shadow', () => {
  const { View } = require('react-native');
  return { ShadowedView: (props: any) => <View {...props} /> };
});

jest.mock('@gorhom/bottom-sheet', () => {
  const ReactMock = require('react');
  const { View } = require('react-native');
  const BottomSheet = ReactMock.forwardRef((props: any, _ref: any) => <View {...props} />);
  return {
    __esModule: true,
    default: BottomSheet,
    BottomSheetView: (props: any) => <View {...props} />,
    BottomSheetBackdrop: (props: any) => <View {...props} />,
  };
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
