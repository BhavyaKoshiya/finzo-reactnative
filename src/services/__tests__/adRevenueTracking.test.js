/**
 * Paid ad impressions are logged as Firebase `ad_impression` events so Google Ads
 * can optimize campaigns for ad revenue.
 */

import { logEvent } from '@react-native-firebase/analytics';
import firebaseAnalyticsService from '../firebaseAnalyticsService';
import { MarketingAdProvider } from '../ads/marketingAdProvider';
import { marketingPlugin } from 'react-native-marketing-plugin';

const paidImpression = {
  network: 'admanager',
  format: 'interstitial',
  adUnitId: '/21775744923/example/interstitial',
  value: 0.0042,
  currency: 'USD',
  precision: 1,
};

describe('ad revenue tracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('logs an Ad Manager impression as ad_impression with its revenue', async () => {
    await expect(firebaseAnalyticsService.logAdImpression(paidImpression)).resolves.toBe(true);

    expect(logEvent).toHaveBeenCalledWith(expect.anything(), 'ad_impression', {
      ad_platform: 'Google Ad Manager',
      ad_source: 'Google Ad Manager',
      ad_format: 'interstitial',
      ad_unit_name: '/21775744923/example/interstitial',
      value: 0.0042,
      currency: 'USD',
    });
  });

  test('skips AdMob impressions, which AdMob logs itself once linked to Firebase', async () => {
    await expect(
      firebaseAnalyticsService.logAdImpression({ ...paidImpression, network: 'admob' })
    ).resolves.toBe(false);
    expect(logEvent).not.toHaveBeenCalled();
  });

  test('skips impressions without a positive revenue value or currency', async () => {
    await firebaseAnalyticsService.logAdImpression({ ...paidImpression, value: 0 });
    await firebaseAnalyticsService.logAdImpression({ ...paidImpression, value: NaN });
    await firebaseAnalyticsService.logAdImpression({ ...paidImpression, currency: '' });
    expect(logEvent).not.toHaveBeenCalled();
  });

  test('the ad provider forwards plugin revenue events to analytics', async () => {
    const spy = jest.spyOn(firebaseAnalyticsService, 'logAdImpression').mockResolvedValue(true);
    await new MarketingAdProvider().initialize();

    const { onAdRevenue } = marketingPlugin.initialize.mock.calls[0][0];
    onAdRevenue(paidImpression);

    expect(spy).toHaveBeenCalledWith(paidImpression);
    spy.mockRestore();
  });
});
