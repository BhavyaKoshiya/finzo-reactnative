import { useColorScheme } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectThemeMode,
  setThemeMode as reduxSetThemeMode,
} from '../store/slices/settingsSlice';
import { lightColors, darkColors } from '../theme/colors';

export const useAppTheme = () => {
  const systemColorScheme = useColorScheme();
  const themeMode = useAppSelector(selectThemeMode);
  const dispatch = useAppDispatch();

  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemColorScheme === 'dark');

  const currentTheme = isDark ? darkColors : lightColors;

  const setThemeMode = mode => {
    dispatch(reduxSetThemeMode(mode));
  };

  return {
    currentTheme,
    isDark,
    themeMode,
    setThemeMode,
  };
};

export default useAppTheme;
