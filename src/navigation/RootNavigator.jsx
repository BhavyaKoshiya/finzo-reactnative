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
import {
  SIPCalculatorScreen,
  FDCalculatorScreen,
  RDCalculatorScreen,
  CAGRCalculatorScreen,
  ROICalculatorScreen,
} from '../features/calculators/investments';
import { GSTCalculatorScreen } from '../features/calculators/business';
import {
  SimpleInterestCalculatorScreen,
  CompoundInterestCalculatorScreen,
  PercentageCalculatorScreen,
} from '../features/calculators/everyday';
import CalculatorSearchScreen from '../features/search/CalculatorSearchScreen';
import ComponentShowcaseScreen from '../features/showcase/ComponentShowcaseScreen';
import { RewardsScreen } from '../features/rewards';
import MyLoansScreen from '../features/myLoans/MyLoansScreen';
import {
  LoanDashboardScreen,
  AddLoanScreen,
  EditLoanScreen,
  LoanDetailsScreen,
  AddPaymentScreen,
  EditPaymentScreen,
  LoanPaymentHistoryScreen,
  LoanPrepaymentSimulatorScreen,
} from '../features/loans';
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

      {/* Investment Calculator Family Screens */}
      <Stack.Screen name={ROUTES.SIP_CALCULATOR} component={SIPCalculatorScreen} />
      <Stack.Screen name={ROUTES.FD_CALCULATOR} component={FDCalculatorScreen} />
      <Stack.Screen name={ROUTES.RD_CALCULATOR} component={RDCalculatorScreen} />
      <Stack.Screen name={ROUTES.CAGR_CALCULATOR} component={CAGRCalculatorScreen} />
      <Stack.Screen name={ROUTES.ROI_CALCULATOR} component={ROICalculatorScreen} />

      {/* Tax & General Financial Calculator Screens */}
      <Stack.Screen name={ROUTES.GST_CALCULATOR} component={GSTCalculatorScreen} />
      <Stack.Screen name={ROUTES.SIMPLE_INTEREST_CALCULATOR} component={SimpleInterestCalculatorScreen} />
      <Stack.Screen name={ROUTES.COMPOUND_INTEREST_CALCULATOR} component={CompoundInterestCalculatorScreen} />
      <Stack.Screen name={ROUTES.PERCENTAGE_CALCULATOR} component={PercentageCalculatorScreen} />

      {/* Global Calculator Search Screen */}
      <Stack.Screen name={ROUTES.CALCULATOR_SEARCH} component={CalculatorSearchScreen} />

      {/* Rewards System Screen */}
      <Stack.Screen name={ROUTES.REWARDS} component={RewardsScreen} />

      {/* My Loans Workspace Fallback */}
      <Stack.Screen name={ROUTES.MY_LOANS} component={MyLoansScreen} />

      {/* Real Loan Profiles & Dashboard Screens (Phase 16) */}
      <Stack.Screen name={ROUTES.LOAN_DASHBOARD} component={LoanDashboardScreen} />
      <Stack.Screen name={ROUTES.ADD_LOAN} component={AddLoanScreen} />
      <Stack.Screen name={ROUTES.EDIT_LOAN} component={EditLoanScreen} />
      <Stack.Screen name={ROUTES.LOAN_DETAILS} component={LoanDetailsScreen} />

      {/* Real Loan Payment History & Balance Tracking Screens (Phase 17) */}
      <Stack.Screen name={ROUTES.ADD_PAYMENT} component={AddPaymentScreen} />
      <Stack.Screen name={ROUTES.EDIT_PAYMENT} component={EditPaymentScreen} />
      <Stack.Screen name={ROUTES.LOAN_PAYMENT_HISTORY} component={LoanPaymentHistoryScreen} />
      <Stack.Screen name={ROUTES.LOAN_PREPAYMENT_SIMULATOR} component={LoanPrepaymentSimulatorScreen} />

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
