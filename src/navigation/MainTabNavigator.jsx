import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Calculator, WalletCards, UserRound } from 'lucide-react-native';
import HomeScreen from '../features/home/HomeScreen';
import CalculatorsScreen from '../features/calculators/CalculatorsScreen';
import MyLoansScreen from '../features/myLoans/MyLoansScreen';
import ProfileScreen from '../features/profile/ProfileScreen';
import AppIcon from '../components/common/AppIcon';
import { useAppTheme } from '../hooks/useAppTheme';
import { ROUTES } from './routes';

const Tab = createBottomTabNavigator();

const renderHomeIcon = ({ color, size }) => (
  <AppIcon icon={Home} size={size || 22} color={color} />
);

const renderCalculatorsIcon = ({ color, size }) => (
  <AppIcon icon={Calculator} size={size || 22} color={color} />
);

const renderMyLoansIcon = ({ color, size }) => (
  <AppIcon icon={WalletCards} size={size || 22} color={color} />
);

const renderProfileIcon = ({ color, size }) => (
  <AppIcon icon={UserRound} size={size || 22} color={color} />
);

export const MainTabNavigator = () => {
  const { currentTheme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const safeBottom = Math.max(insets.bottom, 0);

  return (
    <Tab.Navigator
      initialRouteName={ROUTES.HOME}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: currentTheme.primary,
        tabBarInactiveTintColor: currentTheme.textMuted,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: currentTheme.surface,
            borderTopColor: currentTheme.border,
            height: 56 + safeBottom,
            paddingBottom: safeBottom,
            paddingTop: 0,
          },
        ],
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name={ROUTES.HOME}
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: renderHomeIcon,
        }}
      />
      <Tab.Screen
        name={ROUTES.CALCULATORS}
        component={CalculatorsScreen}
        options={{
          tabBarLabel: 'Calculators',
          tabBarIcon: renderCalculatorsIcon,
        }}
      />
      <Tab.Screen
        name={ROUTES.MY_LOANS}
        component={MyLoansScreen}
        options={{
          tabBarLabel: 'My Loans',
          tabBarIcon: renderMyLoansIcon,
        }}
      />
      <Tab.Screen
        name={ROUTES.PROFILE}
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: renderProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarItem: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 0,
    padding: 0,
  },
});

export default MainTabNavigator;
