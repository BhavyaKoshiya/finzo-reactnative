import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ArrowLeft, ShieldCheck, HardDrive, CloudOff, Server, FileText } from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppHeader from '../../../components/navigation/AppHeader';
import AppText from '../../../components/common/AppText';
import AppCard from '../../../components/cards/AppCard';
import AppIcon from '../../../components/common/AppIcon';
import SecondaryButton from '../../../components/buttons/SecondaryButton';
import { useAppTheme } from '../../../hooks/useAppTheme';
import ROUTES from '../../../navigation/routes';

export const LocalDataPrivacyScreen = ({ navigation }) => {
  const { currentTheme } = useAppTheme();

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          title="Privacy & Local Data"
          subtitle="How Finzo Protects Your Financial Information"
          leftAction={{ icon: ArrowLeft, onPress: () => navigation.goBack() }}
        />
      }
    >
      <View style={styles.container}>
        {/* Main Privacy Banner */}
        <AppCard style={[styles.bannerCard, { borderColor: currentTheme.primary }]}>
          <View style={styles.bannerHeader}>
            <AppIcon icon={ShieldCheck} size={24} color={currentTheme.primary} style={{ marginRight: 10 }} />
            <AppText variant="cardTitle" color={currentTheme.primary} style={{ fontWeight: '800' }}>
              Private by Design
            </AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={{ lineHeight: 20 }}>
            Your personal financial data, loan details, notes, and payment histories are stored strictly on this device.
            Information leaves your device only when you explicitly choose to export or share a report.
          </AppText>
        </AppCard>

        {/* Section 1: Stays on Device */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <AppIcon icon={HardDrive} size={20} color="#10B981" style={{ marginRight: 8 }} />
            <AppText variant="sectionTitle" color="#10B981">Stays on This Device</AppText>
          </View>
          <View style={styles.itemList}>
            <AppText variant="bodySmall">• Real loan profiles & loan balances</AppText>
            <AppText variant="bodySmall">• Recorded payment history & prepayments</AppText>
            <AppText variant="bodySmall">• Loan notes & private lender details</AppText>
            <AppText variant="bodySmall">• Personal payoff goals & baseline snapshots</AppText>
            <AppText variant="bodySmall">• Saved calculator calculations</AppText>
            <AppText variant="bodySmall">• Local PDF statement reports</AppText>
            <AppText variant="bodySmall">• Protected credentials in device secure storage</AppText>
          </View>
        </AppCard>

        {/* Section 2: Not Sent to Firebase */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <AppIcon icon={CloudOff} size={20} color={currentTheme.warning} style={{ marginRight: 8 }} />
            <AppText variant="sectionTitle" color={currentTheme.warning}>Never Sent to Firebase</AppText>
          </View>
          <View style={styles.itemList}>
            <AppText variant="bodySmall">• Your loan account or reference numbers</AppText>
            <AppText variant="bodySmall">• Lender names, contacts, or branch addresses</AppText>
            <AppText variant="bodySmall">• Loan balances, interest rates, or EMIs</AppText>
            <AppText variant="bodySmall">• Recorded payment amounts or bank receipts</AppText>
            <AppText variant="bodySmall">• Private notes, titles, or categories</AppText>
            <AppText variant="bodySmall">• Personal passwords or sensitive secrets</AppText>
          </View>
        </AppCard>

        {/* Section 3: What Firebase is Used For */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <AppIcon icon={Server} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
            <AppText variant="sectionTitle">What Firebase is Used For</AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={{ marginBottom: 8, lineHeight: 20 }}>
            Firebase Realtime Database is used strictly for public application configuration:
          </AppText>
          <View style={styles.itemList}>
            <AppText variant="bodySmall">• Public app configuration (`/config`)</AppText>
            <AppText variant="bodySmall">• Reward point store rules & daily check-in streaks</AppText>
            <AppText variant="bodySmall">• Non-personal app release announcements & version flags</AppText>
            <AppText variant="bodySmall">• Advertising infrastructure does NOT receive loan, payment, or private financial data</AppText>
          </View>
        </AppCard>

        {/* View Full Privacy Policy CTA */}
        <SecondaryButton
          title="Read Full Privacy Policy"
          icon={FileText}
          onPress={() => navigation.navigate(ROUTES.PRIVACY_POLICY)}
          accessibilityLabel="Read full comprehensive Privacy Policy"
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingBottom: 40,
  },
  bannerCard: {
    padding: 18,
    borderWidth: 2,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionCard: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemList: {
    gap: 6,
  },
});

export default LocalDataPrivacyScreen;
