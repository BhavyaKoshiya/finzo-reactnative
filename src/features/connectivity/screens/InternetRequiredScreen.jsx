import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { WifiOff, RefreshCw, Lock, ShieldCheck, Tv } from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppText from '../../../components/common/AppText';
import AppCard from '../../../components/cards/AppCard';
import AppIcon from '../../../components/common/AppIcon';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';
import { useAppTheme } from '../../../hooks/useAppTheme';
import connectivityService from '../../../services/connectivityService';
import { navigate } from '../../../navigation/navigationRef';
import ROUTES from '../../../navigation/routes';

export const InternetRequiredScreen = ({ onRetry }) => {
  const { currentTheme } = useAppTheme();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleTryAgain = async () => {
    setIsRetrying(true);
    try {
      if (typeof onRetry === 'function') {
        await onRetry();
      } else {
        await connectivityService.getConnectivityState();
      }
    } finally {
      setIsRetrying(false);
    }
  };

  const handleLearnMore = () => {
    navigate(ROUTES.LOCAL_DATA_PRIVACY);
  };

  return (
    <ScreenContainer scrollable style={styles.screenContainer}>
      <View style={styles.container}>
        {/* Offline Icon Header */}
        <View style={styles.iconHeaderGroup}>
          <View style={[styles.iconCircle, { backgroundColor: currentTheme.warning + '20' }]}>
            <AppIcon icon={WifiOff} size={48} color={currentTheme.warning} />
          </View>
          <AppText variant="screenTitle" style={styles.titleText}>
            Internet Connection Required
          </AppText>
        </View>

        {/* Business Model & Rationale Card */}
        <AppCard style={[styles.infoCard, { borderColor: currentTheme.border }]}>
          <View style={styles.cardHeaderRow}>
            <AppIcon icon={Tv} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
            <AppText variant="cardTitle">Why Internet is Required</AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.cardBodyText}>
            Finzo is supported by advertising to keep all financial calculators, loan tracking, and payoff tools freely accessible. An active internet connection is required to load app configuration and advertising services. Advertising networks may process standard technical advertising identifiers.
          </AppText>
        </AppCard>

        {/* Local Financial Privacy Card */}
        <AppCard style={[styles.infoCard, { borderColor: currentTheme.primary }]}>
          <View style={styles.cardHeaderRow}>
            <AppIcon icon={Lock} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
            <AppText variant="cardTitle" color={currentTheme.primary} style={{ fontWeight: '800' }}>
              Your Financial Data Stays On This Device
            </AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.cardBodyText}>
            Your loan records, balances, EMIs, payment history, calculations, private details, and notes remain strictly on your device. Finzo does not upload, synchronize, or back up your financial data to Firebase or any external servers.
          </AppText>
        </AppCard>

        {/* Actions Group */}
        <View style={styles.actionGroup}>
          <PrimaryButton
            title={isRetrying ? 'Checking Connection...' : 'Try Again'}
            icon={RefreshCw}
            onPress={handleTryAgain}
            disabled={isRetrying}
          />

          <SecondaryButton
            title="Learn More About Privacy"
            icon={ShieldCheck}
            onPress={handleLearnMore}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    justifyContent: 'center',
  },
  container: {
    paddingVertical: 32,
    gap: 16,
  },
  iconHeaderGroup: {
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleText: {
    textAlign: 'center',
  },
  infoCard: {
    padding: 18,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardBodyText: {
    lineHeight: 20,
  },
  actionGroup: {
    gap: 12,
    marginTop: 8,
  },
});

export default InternetRequiredScreen;
