import { DefaultTheme, DarkTheme } from '@react-navigation/native';

export const getNavigationTheme = (theme, isDark) => {
  const baseTheme = isDark ? DarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    dark: isDark,
    colors: {
      ...baseTheme.colors,
      primary: theme.primary,
      background: theme.background,
      card: theme.surface,
      text: theme.textPrimary,
      border: theme.border,
      notification: theme.primary,
    },
  };
};

export default getNavigationTheme;
