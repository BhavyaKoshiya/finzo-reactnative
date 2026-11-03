import { isProtectedScreen } from '../ads/adDecisionEngine';
import { ROUTES } from '../../navigation/routes';

describe('isProtectedScreen with real navigation route names', () => {
  test.each([
    ROUTES.ADD_LOAN,
    ROUTES.EDIT_LOAN,
    ROUTES.ADD_PAYMENT,
    ROUTES.EDIT_PAYMENT,
    ROUTES.ADD_RATE_REVISION,
    ROUTES.EDIT_RATE_REVISION,
    ROUTES.LOAN_PREPAYMENT_SIMULATOR,
    ROUTES.LOAN_PAYOFF_PLANNER,
    ROUTES.LOAN_GOALS,
    ROUTES.LOAN_GOAL_DETAILS,
    ROUTES.LOAN_PRIVATE_DETAILS,
    ROUTES.LOAN_NOTES,
    ROUTES.LOCAL_DATA_PRIVACY,
  ])('%s blocks interstitials', (routeName) => {
    expect(isProtectedScreen(routeName)).toBe(true);
  });

  test.each([ROUTES.HOME, ROUTES.CALCULATORS, ROUTES.EMI_CALCULATOR, ROUTES.SIP_CALCULATOR])(
    '%s allows interstitials',
    (routeName) => {
      expect(isProtectedScreen(routeName)).toBe(false);
    }
  );

  test('still accepts snake_case screen keys', () => {
    expect(isProtectedScreen('add_payment')).toBe(true);
  });
});
