import 'react-native-gesture-handler/jestSetup';
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import settingsReducer from '../../../store/slices/settingsSlice';
import rewardsReducer from '../../../store/slices/rewardsSlice';
import RewardsScreen from '../RewardsScreen';

describe('RewardsScreen', () => {
  let store;
  const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };

  const initialMetrics = {
    frame: { x: 0, y: 0, width: 390, height: 844 },
    insets: { top: 47, left: 0, right: 0, bottom: 34 },
  };

  beforeEach(() => {
    store = configureStore({
      reducer: {
        settings: settingsReducer,
        rewards: rewardsReducer,
      },
    });
  });

  it('should render RewardsScreen correctly with header, stats, check-in card, and store', async () => {
    let tree;
    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <Provider store={store}>
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <RewardsScreen navigation={mockNavigation} />
          </SafeAreaProvider>
        </Provider>
      );
    });

    expect(tree).toBeDefined();
    const instance = tree.root;
    const textNodes = instance.findAll((node) => typeof node.props.children === 'string');
    const allText = textNodes.map((n) => n.props.children).join(' ');

    expect(allText).toContain('Rewards & Points');
    expect(allText).toContain('Daily Check-In');
    expect(allText).toContain('Start Your Streak');
    expect(allText).toContain('Claim 5 Points');
    expect(allText).toContain('Redeem Rewards');
    expect(allText).toContain('1 Hour Ad-Free');
  });
});
