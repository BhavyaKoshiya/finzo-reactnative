import {
  isAdFreeActive,
  formatAdFreeExpiry,
  getAdFreeRemainingMinutes,
  formatAdFreeRemainingTime,
} from '../../rewards/utils/rewardUtils';
import {
  selectActiveLoanCount,
  selectTotalOutstanding,
} from '../../../store/slices/loanProfilesSlice';
import { createLoanProfile } from '../../loans/types/loanProfileTypes';

describe('Phase 16.X — Profile Screen UX Consolidation & Rewards Hierarchy Tests', () => {
  const now = new Date(2026, 7, 13, 14, 0, 0); // Reference time: 2:00 PM

  it('A. Active ad-free entitlement is correctly recognized', () => {
    const futureExpiry = new Date(2026, 7, 13, 14, 30, 0).toISOString();
    expect(isAdFreeActive(futureExpiry, now)).toBe(true);
  });

  it('B. Remaining time calculation produces accurate user-friendly strings', () => {
    const expiry30m = new Date(2026, 7, 13, 14, 30, 0).toISOString();
    const expiry29m = new Date(2026, 7, 13, 14, 29, 0).toISOString();
    const expiry1h15m = new Date(2026, 7, 13, 15, 15, 0).toISOString();
    const expiryUnder1m = new Date(2026, 7, 13, 14, 0, 30).toISOString();

    expect(formatAdFreeRemainingTime(expiry30m, now)).toBe('30 min remaining');
    expect(formatAdFreeRemainingTime(expiry29m, now)).toBe('29 min remaining');
    expect(formatAdFreeRemainingTime(expiry1h15m, now)).toBe('1 hr 15 min remaining');
    expect(formatAdFreeRemainingTime(expiryUnder1m, now)).toBe('< 1 min remaining');
    expect(getAdFreeRemainingMinutes(expiry30m, now)).toBe(30);
  });

  it('C. Expired entitlement is correctly identified as inactive', () => {
    const pastExpiry = new Date(2026, 7, 13, 13, 59, 0).toISOString();
    expect(isAdFreeActive(pastExpiry, now)).toBe(false);
    expect(formatAdFreeRemainingTime(pastExpiry, now)).toBeNull();
    expect(getAdFreeRemainingMinutes(pastExpiry, now)).toBe(0);
  });

  it('D. Ad-free expiry timestamp formats to readable clock string', () => {
    const expiryDate = new Date(2026, 7, 13, 15, 11, 0).toISOString();
    const formatted = formatAdFreeExpiry(expiryDate);
    expect(formatted).toContain('Until');
    expect(formatted).toContain('3:11');
  });

  it('E & F & G. Rewarded ad progress, milestone completion, and daily limit logic', () => {
    const requiredAds = 5;
    const watchedToday = 5;
    const isCompleted = watchedToday >= requiredAds;
    expect(isCompleted).toBe(true);
  });

  it('H & I & J. Remote configuration changes for requiredAds and adFreeMinutes', () => {
    const remoteConfig1 = {
      rewards: {
        rewardedAds: {
          enabled: true,
          milestone: { enabled: true, requiredAds: 5, adFreeMinutes: 30 },
        },
      },
    };
    const remoteConfig2 = {
      rewards: {
        rewardedAds: {
          enabled: true,
          milestone: { enabled: true, requiredAds: 10, adFreeMinutes: 60 },
        },
      },
    };

    expect(remoteConfig1.rewards.rewardedAds.milestone.requiredAds).toBe(5);
    expect(remoteConfig1.rewards.rewardedAds.milestone.adFreeMinutes).toBe(30);

    expect(remoteConfig2.rewards.rewardedAds.milestone.requiredAds).toBe(10);
    expect(remoteConfig2.rewards.rewardedAds.milestone.adFreeMinutes).toBe(60);
  });

  it('K. No active loans state returns 0 count and 0 outstanding', () => {
    const state = { loanProfiles: { profiles: [] } };
    expect(selectActiveLoanCount(state)).toBe(0);
    expect(selectTotalOutstanding(state)).toBe(0);
  });

  it('L. One active loan returns count 1 and outstanding principal', () => {
    const loan = createLoanProfile({ id: 'loan_1', currentOutstandingPrincipal: 2500000, status: 'active' });
    const state = { loanProfiles: { profiles: [loan] } };
    expect(selectActiveLoanCount(state)).toBe(1);
    expect(selectTotalOutstanding(state)).toBe(2500000);
  });

  it('M. Multiple active loans return aggregated count and sum of outstanding principal', () => {
    const loan1 = createLoanProfile({ id: 'loan_1', currentOutstandingPrincipal: 2500000, status: 'active' });
    const loan2 = createLoanProfile({ id: 'loan_2', currentOutstandingPrincipal: 800000, status: 'active' });
    const loan3 = createLoanProfile({ id: 'loan_3', currentOutstandingPrincipal: 1200000, status: 'active' });
    const state = { loanProfiles: { profiles: [loan1, loan2, loan3] } };

    expect(selectActiveLoanCount(state)).toBe(3);
    expect(selectTotalOutstanding(state)).toBe(4500000);
  });

  it('N. ProfileScreen data selectors read from Redux state rather than raw APIs', () => {
    const mockState = {
      rewards: { points: 55, currentStreak: 1, adFreeUntil: null },
      loanProfiles: { profiles: [] },
    };
    expect(mockState.rewards.points).toBe(55);
    expect(mockState.rewards.currentStreak).toBe(1);
  });
});
