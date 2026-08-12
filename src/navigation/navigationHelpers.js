import { ROUTES } from './routes';

/**
 * Safely navigate to My Loans tab workspace from any screen (stack or tab).
 * @param {Object} navigation - React Navigation object
 * @param {Object} [params] - Optional params, e.g. { initialSegment: 'loans' | 'saved' }
 */
export const navigateToMyLoans = (navigation, params = { initialSegment: 'loans' }) => {
  if (!navigation) return;
  navigation.navigate(ROUTES.MAIN_TABS, {
    screen: ROUTES.MY_LOANS,
    params,
  });
};
