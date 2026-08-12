import 'react-native-gesture-handler/jestSetup';
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import settingsReducer, { setThemeMode } from '../../../store/slices/settingsSlice';
import ProfileScreen from '../ProfileScreen';
import { ROUTES } from '../../../navigation/routes';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-fast-shadow', () => {
  const { View } = require('react-native');
  return { ShadowedView: (props) => <View {...props} /> };
});

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('ProfileScreen', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        settings: settingsReducer,
      },
    });
  });

  it('should render ProfileScreen correctly', async () => {
    let tree;
    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <Provider store={store}>
            <NavigationContainer>
              <ProfileScreen navigation={{ navigate: jest.fn() }} />
            </NavigationContainer>
          </Provider>
        </SafeAreaProvider>
      );
    });

    expect(tree).toBeDefined();
    const jsonString = JSON.stringify(tree.toJSON());
    expect(jsonString).toContain('Profile');
    expect(jsonString).toContain('Finzo Member');
    expect(jsonString).toContain('Preferences');
    expect(jsonString).toContain('Theme Preference');
    expect(jsonString).toContain('Data & Privacy');
    expect(jsonString).toContain('About Finzo');
  });

  it('should support dispatching setThemeMode', () => {
    store.dispatch(setThemeMode('dark'));
    expect(store.getState().settings.themeMode).toBe('dark');
  });

  it('should expose ROUTES.PROFILE constant', () => {
    expect(ROUTES.PROFILE).toBe('Profile');
  });
});
