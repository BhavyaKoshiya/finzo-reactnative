import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './RootNavigator';
import { getNavigationTheme } from './navigationTheme';
import { useAppTheme } from '../hooks/useAppTheme';
import { navigationRef } from './navigationRef';

export const AppNavigator = () => {
  const { currentTheme, isDark } = useAppTheme();
  const navTheme = getNavigationTheme(currentTheme, isDark);

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;
