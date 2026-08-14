import React from 'react';
import { View, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import {
  ArrowLeft,
  ShieldCheck,
  HardDrive,
  Lock,
  Server,
  BarChart2,
  AlertTriangle,
  Bell,
  Tv,
  Wifi,
  FileText,
  Share2,
  Trash2,
  Users,
  Layers,
  Sliders,
  RefreshCw,
  Mail,
  ExternalLink,
  ClipboardCheck,
} from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppHeader from '../../../components/navigation/AppHeader';
import AppText from '../../../components/common/AppText';
import AppCard from '../../../components/cards/AppCard';
import AppIcon from '../../../components/common/AppIcon';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import { useAppTheme } from '../../../hooks/useAppTheme';

export const PUBLIC_PRIVACY_POLICY_URL = 'https://binarykode-technologies.web.app/pages/finzo-privacy-policy.html';

/**
 * In-App Privacy Policy Screen.
 * Authoritative alignment with the public Finzo Privacy Policy:
 * https://binarykode-technologies.web.app/pages/finzo-privacy-policy.html
 */
export const PrivacyPolicyScreen = ({ navigation }) => {
  const { currentTheme } = useAppTheme();

  const handleOpenPublicPolicy = async () => {
    try {
      const supported = await Linking.canOpenURL(PUBLIC_PRIVACY_POLICY_URL);
      if (supported) {
        await Linking.openURL(PUBLIC_PRIVACY_POLICY_URL);
      }
    } catch {
      // Graceful fallback
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          title="Privacy Policy"
          subtitle="Finzo — Personal Finance & Loan Calculator"
          leftAction={{
            icon: ArrowLeft,
            onPress: () => navigation.goBack(),
            accessibilityLabel: 'Go back',
          }}
        />
      }
    >
      <View style={styles.container}>
        {/* Effective Date & App Identity Badge */}
        <AppCard
          style={[
            styles.metaCard,
            { backgroundColor: `${currentTheme.primary}12`, borderColor: currentTheme.primary },
          ]}
        >
          <View style={styles.metaRow}>
            <AppIcon icon={ShieldCheck} size={22} color={currentTheme.primary} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <AppText variant="caption" color={currentTheme.primary} style={{ fontWeight: '800' }}>
                EFFECTIVE DATE & LAST UPDATED: AUGUST 15, 2026
              </AppText>
              <AppText variant="caption" color={currentTheme.textSecondary} style={{ marginTop: 2 }}>
                Operated by BinaryKode Technologies
              </AppText>
            </View>
          </View>
        </AppCard>

        {/* 1. Introduction */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.cardHeaderWithIcon}>
            <AppIcon icon={FileText} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
            <AppText variant="sectionTitle">1. Introduction</AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            Welcome to <AppText variant="bodySmall" style={{ fontWeight: '700' }}>Finzo</AppText>, developed and operated by <AppText variant="bodySmall" style={{ fontWeight: '700' }}>BinaryKode Technologies</AppText> (&quot;BinaryKode&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). Finzo is a personal finance and loan management / calculator mobile application created to help you calculate, organize, and plan your loans, payment schedules, and payoff goals.
          </AppText>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            This Privacy Policy explains how information is stored, processed, and handled when you use the Finzo mobile application.
          </AppText>
        </AppCard>

        {/* 2. Our Privacy Approach */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.cardHeaderWithIcon}>
            <AppIcon icon={ShieldCheck} size={20} color="#10B981" style={{ marginRight: 8 }} />
            <AppText variant="sectionTitle" color="#10B981">2. Our Privacy Approach</AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            Finzo is built with a <AppText variant="bodySmall" style={{ fontWeight: '700' }}>local-first architecture</AppText> for your personal financial records. Your loan details, calculations, and payoff plans are stored directly on your physical device rather than in a centralized personal cloud database.
          </AppText>
          <View style={[styles.calloutBox, { backgroundColor: `${currentTheme.primary}10`, borderColor: currentTheme.primary }]}>
            <AppText variant="caption" color={currentTheme.textPrimary} style={{ lineHeight: 18 }}>
              <AppText variant="caption" style={{ fontWeight: '700' }}>Transparent Disclosure: </AppText>
              We do not make misleading claims that &quot;no data is collected&quot; or that &quot;nothing leaves your device.&quot; While your financial records remain stored on your device, Finzo utilizes standard third-party services for technical analytics, crash diagnostics, notifications, and advertising support as explained throughout this policy.
            </AppText>
          </View>
        </AppCard>

        {/* 3. Financial Information Handled */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.cardHeaderWithIcon}>
            <AppIcon icon={HardDrive} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
            <AppText variant="sectionTitle">3. Financial Information Handled</AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            When you use Finzo, you may voluntarily input detailed financial information to perform calculations and organize your records, including:
          </AppText>
          <View style={styles.bulletList}>
            <AppText variant="bodySmall" color={currentTheme.textPrimary}>• Loan names & lender names</AppText>
            <AppText variant="bodySmall" color={currentTheme.textPrimary}>• Original loan amounts & balances</AppText>
            <AppText variant="bodySmall" color={currentTheme.textPrimary}>• Interest rates & loan tenures</AppText>
            <AppText variant="bodySmall" color={currentTheme.textPrimary}>• Payment amounts (EMI) & schedules</AppText>
            <AppText variant="bodySmall" color={currentTheme.textPrimary}>• Payment dates & prepayments</AppText>
            <AppText variant="bodySmall" color={currentTheme.textPrimary}>• Payoff goals & strategies</AppText>
            <AppText variant="bodySmall" color={currentTheme.textPrimary}>• Private notes & account references</AppText>
            <AppText variant="bodySmall" color={currentTheme.textPrimary}>• Other voluntary user entries</AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={[styles.paragraph, { marginTop: 10 }]}>
            This financial information is <AppText variant="bodySmall" style={{ fontWeight: '700' }}>primarily stored locally on your device</AppText>. Finzo does not intentionally synchronize, copy, or upload your personal financial records to our remote database or configuration infrastructure.
          </AppText>
        </AppCard>

        {/* 4. Device & Secure Storage */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.cardHeaderWithIcon}>
            <AppIcon icon={Lock} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
            <AppText variant="sectionTitle">4. Device & Secure Storage</AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            Finzo stores your saved calculations, loans, payment logs, and user preferences locally within sandboxed storage allocated to Finzo on your device.
          </AppText>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            Where supported, Finzo uses platform security features provided by your mobile operating system to protect sensitive information stored on the device. While industry-standard mobile security protections are utilized, no electronic storage environment can guarantee absolute security against all potential threats.
          </AppText>
        </AppCard>

        {/* 5. Application Configuration */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.cardHeaderWithIcon}>
            <AppIcon icon={Server} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
            <AppText variant="sectionTitle">5. Application Configuration</AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            Finzo may use remote application configuration services to retrieve general application settings, feature availability, advertising settings, and application update requirements.
          </AppText>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            This remote configuration contains only public application settings and <AppText variant="bodySmall" style={{ fontWeight: '700' }}>does not contain or collect users&apos; financial records</AppText>.
          </AppText>
        </AppCard>

        {/* 6. Analytics */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.cardHeaderWithIcon}>
            <AppIcon icon={BarChart2} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
            <AppText variant="sectionTitle">6. Analytics</AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            Finzo may use analytics services (such as Google Firebase Analytics) to understand how the application is used, improve features, and measure application performance. These services may process technical and usage information such as app interactions, device type, operating system version, and general usage statistics.
          </AppText>
          <AppText variant="bodySmall" color={currentTheme.textPrimary} style={[styles.paragraph, { fontWeight: '600' }]}>
            Finzo does not intentionally send your loan balances, payment records, loan amounts, interest rates, private notes, credentials, or other sensitive financial records to analytics services.
          </AppText>
        </AppCard>

        {/* 7. Crash Reporting */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.cardHeaderWithIcon}>
            <AppIcon icon={AlertTriangle} size={20} color={currentTheme.warning} style={{ marginRight: 8 }} />
            <AppText variant="sectionTitle">7. Crash Reporting</AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            Finzo may use crash-reporting services (such as Google Firebase Crashlytics) to identify crashes, errors, and technical problems. These services process diagnostic data such as device type, operating system, application version, and technical crash stack traces.
          </AppText>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            Finzo does not intentionally attach your financial records, credentials, or private notes to crash diagnostic reports.
          </AppText>
        </AppCard>

        {/* 8. Notifications */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.cardHeaderWithIcon}>
            <AppIcon icon={Bell} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
            <AppText variant="sectionTitle">8. Notifications</AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            If you choose to enable notifications, Finzo may use a notification service (such as Firebase Cloud Messaging) to deliver operational notices and informational notifications to your device. The service processes technical tokens necessary to route messages to your device.
          </AppText>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            Finzo does not intentionally include sensitive financial credentials or confidential loan details in notification payloads.
          </AppText>
        </AppCard>

        {/* 9. Advertising & Rewards */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.cardHeaderWithIcon}>
            <AppIcon icon={Tv} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
            <AppText variant="sectionTitle">9. Advertising & Rewards</AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            Finzo is supported in part by digital advertising. The application may display banner, native, interstitial, and rewarded advertisements.
          </AppText>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            Advertising providers (such as Google Mobile Ads) may process device information, mobile advertising identifiers, network details, and ad interaction data to provide, measure, and protect advertisements according to their privacy policies.
          </AppText>
          <View style={styles.bulletList}>
            <AppText variant="bodySmall" color={currentTheme.textPrimary}>• Finzo does not intentionally provide your financial records, payment history, loan balances, private notes, or credentials to advertising providers.</AppText>
            <AppText variant="bodySmall" color={currentTheme.textPrimary}>• Users may voluntarily choose to watch rewarded advertisements in exchange for temporary in-app rewards, such as temporary ad-free access periods. During an active ad-free period, standard advertisements are suppressed.</AppText>
          </View>
        </AppCard>

        {/* 10. Internet Connection */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.cardHeaderWithIcon}>
            <AppIcon icon={Wifi} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
            <AppText variant="sectionTitle">10. Internet Connection</AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            Finzo requires an active internet connection for certain application functionality, including advertising delivery, application configuration, checking for app updates, and receiving notifications.
          </AppText>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            Requiring an internet connection does not mean that your personal financial records are uploaded to external servers.
          </AppText>
        </AppCard>

        {/* 11. PDF Export & Sharing */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.cardHeaderWithIcon}>
            <AppIcon icon={Share2} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
            <AppText variant="sectionTitle">11. PDF Export & Sharing</AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            Finzo allows you to generate PDF reports containing your loan calculations and schedules. These PDF documents are generated locally on your device. Credentials and private secrets are not intentionally included in exported files.
          </AppText>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            You control whether and where to share these exported reports. If you share a PDF with another app or service (such as email, messaging apps, or cloud storage), that third party&apos;s privacy policy applies.
          </AppText>
        </AppCard>

        {/* 12. Data Sharing */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.cardHeaderWithIcon}>
            <AppIcon icon={ShieldCheck} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
            <AppText variant="sectionTitle">12. Data Sharing</AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textPrimary} style={[styles.paragraph, { fontWeight: '700' }]}>
            Finzo does not sell your personal financial records.
          </AppText>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            We do not intentionally share your loan details, balances, payments, or notes with advertising, analytics, crash-reporting, notification, or configuration services.
          </AppText>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            Third-party providers independently process technical, device, advertising, or messaging information strictly as necessary to provide their services under their own privacy policies.
          </AppText>
        </AppCard>

        {/* 13. Data Retention & Deletion */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.cardHeaderWithIcon}>
            <AppIcon icon={Trash2} size={20} color={currentTheme.error} style={{ marginRight: 8 }} />
            <AppText variant="sectionTitle" color={currentTheme.error}>13. Data Retention & Deletion</AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            Your financial records remain stored on your physical device until you decide to remove them:
          </AppText>
          <View style={styles.bulletList}>
            <AppText variant="bodySmall" color={currentTheme.textPrimary}>• <AppText variant="bodySmall" style={{ fontWeight: '700' }}>In-App Deletion:</AppText> You can delete any loan or payment record at any time using standard features inside the app.</AppText>
            <AppText variant="bodySmall" color={currentTheme.textPrimary}>• <AppText variant="bodySmall" style={{ fontWeight: '700' }}>Storage Reset / Uninstall:</AppText> Clearing application storage via your device settings or uninstalling Finzo deletes locally stored app records according to your operating system.</AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={[styles.paragraph, { marginTop: 10 }]}>
            Because Finzo does not operate an account-based cloud database for your financial records, there is no remote server copy retained once records are removed from your device.
          </AppText>
        </AppCard>

        {/* 14. Children's Privacy */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.cardHeaderWithIcon}>
            <AppIcon icon={Users} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
            <AppText variant="sectionTitle">14. Children&apos;s Privacy</AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            Finzo is designed for general audiences managing personal or business finances and is not specifically directed to children under 13. We do not knowingly collect personal information from children. If you believe a child has provided personal information to us, please contact us at bhavyakoshiya.work@gmail.com.
          </AppText>
        </AppCard>

        {/* 15. Third-Party Services */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.cardHeaderWithIcon}>
            <AppIcon icon={Layers} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
            <AppText variant="sectionTitle">15. Third-Party Services</AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            Finzo integrates third-party services to support technical operations, diagnostics, and app monetization:
          </AppText>
          <View style={styles.bulletList}>
            <AppText variant="bodySmall" color={currentTheme.textPrimary}>• <AppText variant="bodySmall" style={{ fontWeight: '700' }}>Firebase Services (Google):</AppText> Used for analytics, crash diagnostics, notifications, and certain application services.</AppText>
            <AppText variant="bodySmall" color={currentTheme.textPrimary}>• <AppText variant="bodySmall" style={{ fontWeight: '700' }}>Google Mobile Ads:</AppText> Advertising delivery and campaign performance measurement.</AppText>
          </View>
        </AppCard>

        {/* 16. Your Privacy Choices */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.cardHeaderWithIcon}>
            <AppIcon icon={Sliders} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
            <AppText variant="sectionTitle">16. Your Privacy Choices</AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            You have full control over your privacy when using Finzo:
          </AppText>
          <View style={styles.bulletList}>
            <AppText variant="bodySmall" color={currentTheme.textPrimary}>• <AppText variant="bodySmall" style={{ fontWeight: '700' }}>Manage Financial Data:</AppText> Add, edit, or delete your calculation records and loan entries directly in the app.</AppText>
            <AppText variant="bodySmall" color={currentTheme.textPrimary}>• <AppText variant="bodySmall" style={{ fontWeight: '700' }}>Notifications:</AppText> Enable or disable notification permissions at any time via your device settings.</AppText>
            <AppText variant="bodySmall" color={currentTheme.textPrimary}>• <AppText variant="bodySmall" style={{ fontWeight: '700' }}>Advertising Controls:</AppText> Manage personalized advertising choices and reset advertising identifiers through your device operating system settings.</AppText>
            <AppText variant="bodySmall" color={currentTheme.textPrimary}>• <AppText variant="bodySmall" style={{ fontWeight: '700' }}>Uninstall Application:</AppText> Completely remove all locally stored app data by uninstalling Finzo from your device.</AppText>
          </View>
        </AppCard>

        {/* 17. Changes to this Privacy Policy */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.cardHeaderWithIcon}>
            <AppIcon icon={RefreshCw} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
            <AppText variant="sectionTitle">17. Changes to this Privacy Policy</AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            We may update this Privacy Policy from time to time to reflect changes in our application, third-party services, or legal obligations. Updated versions will be published on our website and within the app with an updated &quot;Last Updated&quot; date.
          </AppText>
        </AppCard>

        {/* 18. Contact Us */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.cardHeaderWithIcon}>
            <AppIcon icon={Mail} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
            <AppText variant="sectionTitle">18. Contact Us</AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.paragraph}>
            If you have questions or concerns about this Privacy Policy or our data practices, please contact:
          </AppText>
          <View style={[styles.contactBox, { backgroundColor: `${currentTheme.primary}0D`, borderColor: currentTheme.border }]}>
            <AppText variant="bodyMedium" style={{ fontWeight: '800' }}>
              BinaryKode Technologies
            </AppText>
            <AppText variant="bodySmall" color={currentTheme.textSecondary} style={{ marginTop: 2 }}>
              324, Tulsi Arcade, Sudama Chowk, Mota Varachha, Surat, Gujarat, India - 394101
            </AppText>
            <TouchableOpacity
              onPress={() => Linking.openURL('mailto:bhavyakoshiya.work@gmail.com')}
              activeOpacity={0.7}
              style={{ marginTop: 6 }}
            >
              <AppText variant="bodySmall" color={currentTheme.primary} style={{ fontWeight: '700' }}>
                📧 bhavyakoshiya.work@gmail.com
              </AppText>
            </TouchableOpacity>
            <AppText variant="caption" color={currentTheme.textSecondary} style={{ marginTop: 4 }}>
              Application: Finzo — Personal Finance & Loan Calculator
            </AppText>
          </View>
        </AppCard>

        {/* 19. Privacy Summary (At-a-Glance) */}
        <AppCard style={[styles.summaryCard, { borderColor: `${currentTheme.primary}60` }]}>
          <View style={styles.cardHeaderWithIcon}>
            <AppIcon icon={ClipboardCheck} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
            <AppText variant="sectionTitle">19. Privacy Summary</AppText>
          </View>
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryTile, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
              <AppText variant="caption" color={currentTheme.primary} style={styles.summaryTileHeader}>
                FINANCIAL RECORDS
              </AppText>
              <AppText variant="caption" color={currentTheme.textSecondary}>
                Primarily stored locally on your device and not uploaded to server databases.
              </AppText>
            </View>

            <View style={[styles.summaryTile, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
              <AppText variant="caption" color={currentTheme.primary} style={styles.summaryTileHeader}>
                ANALYTICS
              </AppText>
              <AppText variant="caption" color={currentTheme.textSecondary}>
                Used to understand app usage & improve Finzo; financial data is strictly excluded.
              </AppText>
            </View>

            <View style={[styles.summaryTile, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
              <AppText variant="caption" color={currentTheme.primary} style={styles.summaryTileHeader}>
                CRASH REPORTING
              </AppText>
              <AppText variant="caption" color={currentTheme.textSecondary}>
                Used to diagnose crashes & bugs without attaching personal financial records.
              </AppText>
            </View>

            <View style={[styles.summaryTile, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
              <AppText variant="caption" color={currentTheme.primary} style={styles.summaryTileHeader}>
                NOTIFICATIONS
              </AppText>
              <AppText variant="caption" color={currentTheme.textSecondary}>
                Used for reminders when enabled; does not carry sensitive credentials.
              </AppText>
            </View>

            <View style={[styles.summaryTile, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
              <AppText variant="caption" color={currentTheme.primary} style={styles.summaryTileHeader}>
                ADVERTISING
              </AppText>
              <AppText variant="caption" color={currentTheme.textSecondary}>
                Used to support Finzo; networks process device data, not your financial entries.
              </AppText>
            </View>

            <View style={[styles.summaryTile, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
              <AppText variant="caption" color={currentTheme.primary} style={styles.summaryTileHeader}>
                CONFIGURATION
              </AppText>
              <AppText variant="caption" color={currentTheme.textSecondary}>
                Used for public app parameters and update notices — never user financial data.
              </AppText>
            </View>
          </View>
        </AppCard>

        {/* View Full Privacy Policy Online CTA */}
        <PrimaryButton
          title="View Full Privacy Policy Online"
          icon={ExternalLink}
          onPress={handleOpenPublicPolicy}
          accessibilityLabel="Open authoritative public privacy policy website in browser"
          style={styles.openWebBtn}
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
  metaCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionCard: {
    padding: 18,
    borderRadius: 16,
  },
  cardHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  paragraph: {
    lineHeight: 20,
    marginBottom: 8,
  },
  calloutBox: {
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    marginTop: 6,
  },
  bulletList: {
    marginTop: 4,
    gap: 6,
  },
  contactBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
  },
  summaryCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  summaryGrid: {
    gap: 10,
    marginTop: 6,
  },
  summaryTile: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  summaryTileHeader: {
    fontWeight: '800',
    marginBottom: 4,
  },
  openWebBtn: {
    marginTop: 6,
    marginBottom: 10,
  },
});

export default PrivacyPolicyScreen;
