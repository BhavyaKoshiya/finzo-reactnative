import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './RootNavigator';
import { getNavigationTheme } from './navigationTheme';
import { useAppTheme } from '../hooks/useAppTheme';

export const AppNavigator = () => {
  const { currentTheme, isDark } = useAppTheme();
  const navTheme = getNavigationTheme(currentTheme, isDark);

  return (
    <NavigationContainer theme={navTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;
