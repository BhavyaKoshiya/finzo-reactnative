import { ROUTES } from '../routes';
import { getNavigationTheme } from '../navigationTheme';
import { lightColors, darkColors } from '../../theme/colors';

describe('Navigation Architecture', () => {
  it('should define valid route constants', () => {
    expect(ROUTES.HOME).toBe('Home');
    expect(ROUTES.CALCULATORS).toBe('Calculators');
    expect(ROUTES.MY_LOANS).toBe('MyLoans');
    expect(ROUTES.SAVED).toBe('MyLoans');
    expect(ROUTES.PROFILE).toBe('Profile');
    expect(ROUTES.MAIN_TABS).toBe('MainTabs');
    expect(ROUTES.SHOWCASE).toBe('Showcase');
  });

  it('should map light theme to navigation theme', () => {
    const navTheme = getNavigationTheme(lightColors, false);
    expect(navTheme.dark).toBe(false);
    expect(navTheme.colors.primary).toBe(lightColors.primary);
    expect(navTheme.colors.background).toBe(lightColors.background);
    expect(navTheme.colors.card).toBe(lightColors.surface);
    expect(navTheme.colors.text).toBe(lightColors.textPrimary);
  });

  it('should map dark theme to navigation theme', () => {
    const navTheme = getNavigationTheme(darkColors, true);
    expect(navTheme.dark).toBe(true);
    expect(navTheme.colors.primary).toBe(darkColors.primary);
    expect(navTheme.colors.background).toBe(darkColors.background);
    expect(navTheme.colors.card).toBe(darkColors.surface);
    expect(navTheme.colors.text).toBe(darkColors.textPrimary);
  });
});
