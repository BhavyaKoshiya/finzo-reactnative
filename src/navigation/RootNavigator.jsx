import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import EMICalculatorScreen from '../features/calculators/emi/EMICalculatorScreen';
import {
  HomeLoanEMIScreen,
  PersonalLoanEMIScreen,
  CarLoanEMIScreen,
  EducationLoanEMIScreen,
  BusinessLoanEMIScreen,
} from '../features/calculators/loans';
import ComponentShowcaseScreen from '../features/showcase/ComponentShowcaseScreen';
import { ROUTES } from './routes';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.MAIN_TABS} component={MainTabNavigator} />
      <Stack.Screen name={ROUTES.EMI_CALCULATOR} component={EMICalculatorScreen} />
      <Stack.Screen name={ROUTES.HOME_LOAN_EMI} component={HomeLoanEMIScreen} />
      <Stack.Screen name={ROUTES.PERSONAL_LOAN_EMI} component={PersonalLoanEMIScreen} />
      <Stack.Screen name={ROUTES.CAR_LOAN_EMI} component={CarLoanEMIScreen} />
      <Stack.Screen name={ROUTES.EDUCATION_LOAN_EMI} component={EducationLoanEMIScreen} />
      <Stack.Screen name={ROUTES.BUSINESS_LOAN_EMI} component={BusinessLoanEMIScreen} />
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
