import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import EMICalculatorScreen from '../features/calculators/emi/EMICalculatorScreen';
import ComponentShowcaseScreen from '../features/showcase/ComponentShowcaseScreen';
import { ROUTES } from './routes';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.MAIN_TABS} component={MainTabNavigator} />
      <Stack.Screen name={ROUTES.EMI_CALCULATOR} component={EMICalculatorScreen} />
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
