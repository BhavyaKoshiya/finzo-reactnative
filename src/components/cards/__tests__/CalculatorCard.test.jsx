import 'react-native-gesture-handler/jestSetup';
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '../../../store/slices/settingsSlice';
import CalculatorCard from '../CalculatorCard';
import AppCard from '../AppCard';

describe('CalculatorCard', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        settings: settingsReducer,
      },
    });
  });

  it('renders as standalone card with AppCard when isGrouped is false', () => {
    let tree;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <Provider store={store}>
          <CalculatorCard
            title="Home Loan EMI"
            description="Calculate EMI"
            onPress={jest.fn()}
          />
        </Provider>
      );
    });

    const appCards = tree.root.findAllByType(AppCard);
    expect(appCards.length).toBe(1);
  });

  it('renders as grouped tile without individual AppCard when isGrouped is true', () => {
    let tree;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <Provider store={store}>
          <CalculatorCard
            title="Home Loan EMI"
            description="Calculate EMI"
            onPress={jest.fn()}
            isGrouped={true}
            hasDivider={true}
          />
        </Provider>
      );
    });

    const appCards = tree.root.findAllByType(AppCard);
    expect(appCards.length).toBe(0);
  });
});
