import 'react-native-gesture-handler/jestSetup';
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '../../../store/slices/settingsSlice';
import rewardsReducer from '../../../store/slices/rewardsSlice';
import RedeemRewardModal from '../components/RedeemRewardModal';
import { getRewardById } from '../utils/rewardUtils';

describe('RedeemRewardModal', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        settings: settingsReducer,
        rewards: rewardsReducer,
      },
    });
  });

  it('should render modal with reward details and points calculation', async () => {
    const reward1h = getRewardById('ad_free_1h');
    const onConfirm = jest.fn();
    const onClose = jest.fn();

    let tree;
    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <Provider store={store}>
          <RedeemRewardModal
            visible={true}
            reward={reward1h}
            currentPoints={180}
            onConfirm={onConfirm}
            onClose={onClose}
          />
        </Provider>
      );
    });

    expect(tree).toBeDefined();
    const instance = tree.root;
    const textNodes = instance.findAll((node) => typeof node.props.children === 'string');
    const allText = textNodes.map((n) => n.props.children).join(' ');

    expect(allText).toContain('Redeem Reward?');
    expect(allText).toContain('1 Hour Ad-Free');
    expect(allText).toContain('180 pts');
    expect(allText).toContain('-100 pts');
    expect(allText).toContain('80 pts');
  });

  it('should return null if reward prop is null', async () => {
    let tree;
    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <Provider store={store}>
          <RedeemRewardModal
            visible={true}
            reward={null}
            currentPoints={100}
            onConfirm={jest.fn()}
            onClose={jest.fn()}
          />
        </Provider>
      );
    });

    expect(tree.toJSON()).toBeNull();
  });
});
