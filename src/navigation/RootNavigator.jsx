import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import ComponentShowcaseScreen from '../features/showcase/ComponentShowcaseScreen';
import { ROUTES } from './routes';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.MAIN_TABS} component={MainTabNavigator} />
      {__DEV__ && (
        <Stack.Screen
          name={ROUTES.SHOWCASE}
          component={ComponentShowcaseScreen}
          options={{
            headerShown: true,
            title: 'Design System Showcase',
          }}
        />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
