import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { store, persistor } from './src/store';
import { useAppSelector } from './src/store/hooks';
import { selectSettings } from './src/store/slices/settingsSlice';
import { colors } from './src/theme';

function FoundationProofComponent() {
  const settings = useAppSelector(selectSettings);
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}>
      <View style={styles.card}>
        <Text style={styles.title}>Finzo</Text>
        <Text style={styles.subtitle}>Phase 0 Architecture Foundation</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Redux + redux-persist Active</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Default Currency:</Text>
          <Text style={styles.value}>{settings.currency}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Default Locale:</Text>
          <Text style={styles.value}>{settings.locale}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Theme Mode:</Text>
          <Text style={styles.value}>{settings.themeMode}</Text>
        </View>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
          <FoundationProofComponent />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  label: {
    fontSize: 14,
    color: colors.secondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
