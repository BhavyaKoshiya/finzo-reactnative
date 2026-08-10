import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Calculator, Bookmark, Settings } from 'lucide-react-native';
import HomeScreen from '../features/home/HomeScreen';
import CalculatorsScreen from '../features/calculators/CalculatorsScreen';
import SavedScreen from '../features/saved/SavedScreen';
import SettingsScreen from '../features/settings/SettingsScreen';
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

const renderSavedIcon = ({ color, size }) => (
  <AppIcon icon={Bookmark} size={size || 22} color={color} />
);

const renderSettingsIcon = ({ color, size }) => (
  <AppIcon icon={Settings} size={size || 22} color={color} />
);

export const MainTabNavigator = () => {
  const { currentTheme } = useAppTheme();
  const insets = useSafeAreaInsets();

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
            height: 56 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ],
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
        name={ROUTES.SAVED}
        component={SavedScreen}
        options={{
          tabBarLabel: 'Saved',
          tabBarIcon: renderSavedIcon,
        }}
      />
      <Tab.Screen
        name={ROUTES.SETTINGS}
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: renderSettingsIcon,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    paddingTop: 6,
    borderTopWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default MainTabNavigator;
