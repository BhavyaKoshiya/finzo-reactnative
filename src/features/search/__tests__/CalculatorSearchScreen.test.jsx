import 'react-native-gesture-handler/jestSetup';
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '../../../store/slices/settingsSlice';
import CalculatorSearchScreen from '../CalculatorSearchScreen';
import CalculatorCard from '../../../components/cards/CalculatorCard';

// Mock SafeAreaInsets
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 40, bottom: 20, left: 0, right: 0 }),
}));

// Mock AdPlacement to avoid timer leak from internal load timers
jest.mock('../../../components/ads/AdPlacement', () => {
  const { View } = require('react-native');
  return function MockAdPlacement(props) {
    return <View testID="mock-ad-placement" {...props} />;
  };
});

describe('CalculatorSearchScreen', () => {
  let store;
  const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    store = configureStore({
      reducer: {
        settings: settingsReducer,
      },
    });
  });

  it('renders grouped calculator tiles with native ads every 4 tiles', () => {
    let tree;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <Provider store={store}>
          <CalculatorSearchScreen navigation={mockNavigation} />
        </Provider>
      );
    });

    const tiles = tree.root.findAllByType(CalculatorCard);
    expect(tiles.length).toBeGreaterThan(0);

    // All tiles should be rendered as grouped tiles (isGrouped === true)
    tiles.forEach((tile) => {
      expect(tile.props.isGrouped).toBe(true);
    });

    // Native ad placements should be present between groups of tiles
    const adPlacements = tree.root.findAllByProps({ testID: 'mock-ad-placement' });
    expect(adPlacements.length).toBeGreaterThan(0);
    expect(adPlacements[0].props.adType).toBe('native');
  });
});
