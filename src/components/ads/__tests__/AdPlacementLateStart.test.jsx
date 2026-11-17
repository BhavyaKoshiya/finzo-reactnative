/* eslint-env jest */
import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AdPlacement from '../AdPlacement';
import adService from '../../../services/adService';
import { BaseAdProvider } from '../../../services/ads/baseAdProvider';
import connectivityReducer, { setConnectivityState } from '../../../store/slices/connectivitySlice';
import rewardsReducer from '../../../store/slices/rewardsSlice';

/** Provider that only becomes usable once initialize() finishes, like the real one after consent. */
class LateProvider extends BaseAdProvider {
  constructor() {
    super();
    this.started = false;
  }

  getType() {
    return 'late';
  }

  async initialize() {
    this.started = true;
    return true;
  }

  isConfigured() {
    return this.started;
  }

  isBannerAvailable() {
    return this.started;
  }

  renderBanner() {
    return <Text>banner ad</Text>;
  }
}

describe('Ad slots on screen before ads finish starting', () => {
  afterEach(() => {
    adService.setProviderOverride(null);
  });

  test('a banner appears as soon as ads are ready, without leaving the screen', async () => {
    adService.setProviderOverride(new LateProvider());
    const store = configureStore({
      reducer: { connectivity: connectivityReducer, rewards: rewardsReducer },
    });
    store.dispatch(setConnectivityState({ status: 'online', isConnected: true, isInternetReachable: true }));

    let tree;
    await act(async () => {
      tree = ReactTestRenderer.create(
        <Provider store={store}>
          <AdPlacement screen="home" placementId="home_banner" adType="banner" />
        </Provider>
      );
    });
    // e.g. the user is still on the consent form when the app opens
    expect(tree.root.findAllByType(Text)).toHaveLength(0);

    await act(async () => {
      await adService.initialize();
    });
    expect(tree.root.findAllByType(Text).map((node) => node.props.children)).toEqual(['banner ad']);
  });
});
