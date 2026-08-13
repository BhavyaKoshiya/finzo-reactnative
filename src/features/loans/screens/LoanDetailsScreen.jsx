import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import {
  ArrowLeft,
  Edit3,
  Calendar,
  Landmark,
  Plus,
  ReceiptText,
  ChevronRight,
  ChevronDown,
  Scale,
  Calculator,
  ShieldCheck,
} from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppHeader from '../../../components/navigation/AppHeader';
import AppText from '../../../components/common/AppText';
import AppCard from '../../../components/cards/AppCard';
import AppIcon from '../../../components/common/AppIcon';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';
import { useAppTheme } from '../../../hooks/useAppTheme';
import {
  selectLoanProfileById,
  selectAllLoanProfiles,
  deleteLoanProfile,
  archiveLoanProfile,
  updateLoanReminderSettings,
} from '../../../store/slices/loanProfilesSlice';
import { selectLoanRemindersEnabled } from '../../../store/slices/settingsSlice';
import {
  selectPaymentsForLoan,
  deletePaymentsForLoan,
} from '../../../store/slices/loanPaymentsSlice';
import { selectActiveLoanGoalsByLoanId } from '../../../store/slices/loanGoalsSlice';
import { selectLoanNotesByLoanId, deleteNotesForLoan } from '../../../store/slices/loanNotesSlice';
import {
  selectPrivateDetailsByLoanId,
  deleteLoanPrivateDetails,
} from '../../../store/slices/loanPrivateDetailsSlice';
import { adaptLoanProfileForDisplay } from '../utils/loanPresentationAdapters';
import { getPaymentStats } from '../utils/loanBalanceUtils';
import { getCurrentLoanBalance } from '../utils/paymentBalanceUtils';
import { buildLoanInsightSummary } from '../utils/loanInsightUtils';
import { getPaymentStatus } from '../utils/loanReminderUtils';
import loanReminderService from '../services/loanReminderService';

import LoanPaymentCard from '../components/LoanPaymentCard';
import UpcomingPaymentCard from '../components/UpcomingPaymentCard';
import LoanReminderSettingsModal from '../components/LoanReminderSettingsModal';
import LoanInsightsPreviewCard from '../components/LoanInsightsPreviewCard';
import QuickActionsGrid from '../components/QuickActionsGrid';
import LoanGoalPreviewCard from '../components/LoanGoalPreviewCard';
import LoanNotesPreviewCard from '../components/LoanNotesPreviewCard';
import LoanPrivateDetailsPreviewCard from '../components/LoanPrivateDetailsPreviewCard';
import ManageLoanCard from '../components/ManageLoanCard';
import ManualBalanceUpdateModal from './ManualBalanceUpdateModal';
import { ExportOptionsModal, getLoanReportAdapter, generateAndShareReport } from '../../reports';

import { formatCurrency } from '../../../utils/financeFormatters';
import { PAYMENT_TYPES } from '../constants/loanPaymentConstants';
import { ROUTES } from '../../../navigation/routes';
import AdPlacement from '../../../components/ads/AdPlacement';
import { AD_PLACEMENTS } from '../../../services/ads/adPlacementConstants';

export const LoanDetailsScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { currentTheme, isDark } = useAppTheme();
  const [balanceModalVisible, setBalanceModalVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);

  const loanId = route?.params?.loanId;
  const rawProfile = useSelector((state) => selectLoanProfileById(state, loanId));
  const payments = useSelector((state) => selectPaymentsForLoan(state, loanId));
  const allLoans = useSelector(selectAllLoanProfiles);
  const globalRemindersEnabled = useSelector(selectLoanRemindersEnabled);

  // Phase 16.12/16.13 Selectors
  const activeGoals = useSelector((state) => selectActiveLoanGoalsByLoanId(state, loanId));
  const notes = useSelector((state) => selectLoanNotesByLoanId(state, loanId));
  const privateDetails = useSelector((state) => selectPrivateDetailsByLoanId(state, loanId));

  const profile = adaptLoanProfileForDisplay(rawProfile, payments);
  const paymentStats = getPaymentStats(payments, loanId);
  const balanceState = getCurrentLoanBalance(rawProfile, payments);
  const insightSummary = buildLoanInsightSummary(rawProfile, payments);
  const paymentStatus = getPaymentStatus(rawProfile, payments);
  const recentPayments = payments.slice(0, 3);
  const activeGoal = activeGoals.length > 0 ? activeGoals[0] : null;

  if (!profile) {
    return (
      <ScreenContainer
        header={
          <AppHeader
            title="Loan Details"
            leftAction={{ icon: ArrowLeft, onPress: () => navigation.goBack() }}
          />
        }
      >
        <View style={styles.notFound}>
          <AppText variant="bodyMedium">Loan profile not found.</AppText>
        </View>
      </ScreenContainer>
    );
  }

  const isBankConfirmed = balanceState.isBankConfirmed;

  const handleDeletePress = () => {
    Alert.alert(
      `Delete "${profile.name}"?`,
      'This will permanently remove the loan profile, all recorded payment history, notes, and private details. Scheduled payment reminders will also be cancelled. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Loan',
          style: 'destructive',
          onPress: async () => {
            await loanReminderService.cancelLoanReminders(profile.id);
            dispatch(deletePaymentsForLoan(profile.id));
            dispatch(deleteNotesForLoan(profile.id));
            dispatch(deleteLoanPrivateDetails(profile.id));
            dispatch(deleteLoanProfile(profile.id));
            Alert.alert('Loan Deleted', `"${profile.name}" has been removed.`);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleArchiveToggle = () => {
    const isArchived = profile.status === 'archived';
    dispatch(archiveLoanProfile({ id: profile.id, archive: !isArchived }));

    const updatedProfile = { ...rawProfile, status: isArchived ? 'active' : 'archived' };
    const updatedLoans = allLoans.map((l) => (l.id === profile.id ? updatedProfile : l));

    loanReminderService.reconcileLoanReminders({
      loans: updatedLoans,
      payments,
      globalEnabled: globalRemindersEnabled,
    });

    Alert.alert(
      isArchived ? 'Loan Unarchived' : 'Loan Archived',
      isArchived
        ? `"${profile.name}" is now active.`
        : `"${profile.name}" has been moved to archives.`
    );
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          title={profile.name}
          subtitle={profile.lenderName || profile.loanTypeLabel}
          leftAction={{ icon: ArrowLeft, onPress: () => navigation.goBack() }}
          rightAction={{
            icon: Edit3,
            onPress: () => navigation.navigate(ROUTES.EDIT_LOAN, { loanId: profile.id }),
            accessibilityLabel: 'Edit loan profile',
          }}
        />
      }
    >
      <View style={styles.container}>
        {/* 1. HERO BALANCE CARD */}
        <AppCard style={styles.heroCard}>
          <LinearGradient
            colors={isDark ? ['#0F172A', '#1E3A8A'] : ['#1D4ED8', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.heroContent}>
            <View style={styles.heroTopRow}>
              <AppText variant="caption" color="rgba(255, 255, 255, 0.85)" style={styles.heroLabel} numberOfLines={1}>
                OUTSTANDING BALANCE
              </AppText>
              <TouchableOpacity
                onPress={() => setBalanceModalVisible(true)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Balance source status, press to correct balance"
                style={[
                  styles.balanceSourceBadge,
                  {
                    backgroundColor: isBankConfirmed
                      ? 'rgba(34, 197, 94, 0.25)'
                      : 'rgba(245, 158, 11, 0.25)',
                    borderColor: isBankConfirmed
                      ? 'rgba(134, 239, 172, 0.4)'
                      : 'rgba(253, 230, 138, 0.4)',
                  },
                ]}
              >
                <AppIcon
                  icon={isBankConfirmed ? ShieldCheck : Scale}
                  size={12}
                  color={isBankConfirmed ? '#86EFAC' : '#FDE68A'}
                  style={{ marginRight: 4 }}
                />
                <AppText
                  variant="caption"
                  color={isBankConfirmed ? '#86EFAC' : '#FDE68A'}
                  style={{ fontWeight: '700', fontSize: 11 }}
                >
                  {isBankConfirmed ? 'Bank Confirmed' : 'Finzo Estimate'}
                </AppText>
              </TouchableOpacity>
            </View>

            <AppText variant="h2" color="#FFFFFF" style={styles.heroAmount}>
              {formatCurrency(balanceState.currentBalance)}
            </AppText>

            {/* Repayment Progress */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${Math.min(100, profile.repaymentPercentage)}%` },
                  ]}
                />
              </View>
              <AppText variant="caption" color="rgba(255, 255, 255, 0.9)" style={styles.progressText}>
                {profile.progressText}
              </AppText>
            </View>

            <View style={styles.heroDivider} />

            {/* Hero Metrics Row */}
            <View style={styles.heroBottomGrid}>
              <View style={styles.heroCol}>
                <AppText variant="caption" color="rgba(255, 255, 255, 0.85)">
                  Monthly EMI
                </AppText>
                <AppText variant="titleMedium" color="#FFFFFF" style={styles.heroMetricVal}>
                  {profile.formattedEmiAmount}
                </AppText>
              </View>

              <View style={styles.heroCol}>
                <AppText variant="caption" color="rgba(255, 255, 255, 0.85)">
                  Interest Rate
                </AppText>
                <AppText variant="titleMedium" color="#FFFFFF" style={styles.heroMetricVal}>
                  {profile.formattedInterestRate}
                </AppText>
              </View>
            </View>
          </View>
        </AppCard>

        {/* 2. NEXT EMI / PAYMENT STATUS CARD */}
        <UpcomingPaymentCard
          loan={rawProfile}
          payments={payments}
          onRecordPayment={() =>
            navigation.navigate(ROUTES.ADD_PAYMENT, {
              loanId: profile.id,
              initialValues: {
                paymentType: PAYMENT_TYPES.REGULAR_EMI,
                useScheduledEmi: true,
              },
            })
          }
          onOpenSettings={() => setReminderModalVisible(true)}
        />

        {/* 3. LOAN PROGRESS & INSIGHTS */}
        <LoanInsightsPreviewCard
          summary={insightSummary}
          onViewInsights={() => navigation.navigate(ROUTES.LOAN_INSIGHTS, { loanId: profile.id })}
        />

        {/* 4. PAYOFF GOAL PREVIEW */}
        <LoanGoalPreviewCard
          goal={activeGoal}
          onViewGoals={() => navigation.navigate(ROUTES.LOAN_GOALS, { loanId: profile.id })}
        />

        {/* 5. QUICK ACTIONS GRID (2-Column Layout) */}
        <QuickActionsGrid
          onRecordPayment={() => navigation.navigate(ROUTES.ADD_PAYMENT, { loanId: profile.id })}
          onSimulatePrepayment={() =>
            navigation.navigate(ROUTES.LOAN_PREPAYMENT_SIMULATOR, { loanId: profile.id })
          }
          onPayoffGoals={() => navigation.navigate(ROUTES.LOAN_GOALS, { loanId: profile.id })}
          onLoanInsights={() => navigation.navigate(ROUTES.LOAN_INSIGHTS, { loanId: profile.id })}
        />

        {/* 6. RECENT ACTIVITY */}
        <AppCard style={styles.activityCard}>
          <View style={styles.activityHeaderRow}>
            <View style={styles.titleWithIcon}>
              <AppIcon icon={ReceiptText} size={18} color={currentTheme.primary} style={{ marginRight: 6 }} />
              <AppText variant="cardTitle" style={{ fontWeight: '700' }}>
                Recent Activity
              </AppText>
            </View>

            {payments.length > 0 && (
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.LOAN_PAYMENT_HISTORY, { loanId: profile.id })}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="View all payment history"
                style={styles.viewAllBtn}
              >
                <AppText variant="caption" color={currentTheme.primary} style={{ fontWeight: '700', marginRight: 2 }}>
                  View All ({payments.length})
                </AppText>
                <AppIcon icon={ChevronRight} size={14} color={currentTheme.primary} />
              </TouchableOpacity>
            )}
          </View>

          {recentPayments.length > 0 ? (
            recentPayments.map((p) => (
              <LoanPaymentCard
                key={p.id}
                payment={p}
                onPress={() => navigation.navigate(ROUTES.EDIT_PAYMENT, { paymentId: p.id })}
              />
            ))
          ) : (
            <View style={styles.emptyActivityBox}>
              <AppText variant="bodySmall" color={currentTheme.textMuted} style={{ textAlign: 'center', marginBottom: 10 }}>
                No payments recorded yet for this loan account.
              </AppText>
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.ADD_PAYMENT, { loanId: profile.id })}
                activeOpacity={0.8}
                style={[styles.emptyAddBtn, { borderColor: currentTheme.primary }]}
              >
                <AppIcon icon={Plus} size={14} color={currentTheme.primary} style={{ marginRight: 6 }} />
                <AppText variant="caption" color={currentTheme.primary} style={{ fontWeight: '700' }}>
                  Record First Payment
                </AppText>
              </TouchableOpacity>
            </View>
          )}
        </AppCard>

        {/* 7. LOAN OVERVIEW */}
        <AppCard style={styles.overviewCard}>
          <AppText variant="cardTitle" style={styles.cardTitle}>
            Loan Overview
          </AppText>

          <View style={styles.overviewRow}>
            <View style={styles.detailLeft}>
              <AppIcon icon={Landmark} size={18} color={currentTheme.textSecondary} />
              <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabel}>
                Lender Name
              </AppText>
            </View>
            <AppText variant="bodyMedium" style={styles.detailValue}>
              {profile.lenderName || 'N/A'}
            </AppText>
          </View>

          <View style={styles.overviewRow}>
            <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabelIndent}>
              Original Loan Amount
            </AppText>
            <AppText variant="bodyMedium" style={styles.detailValue}>
              {profile.formattedOriginalPrincipal}
            </AppText>
          </View>

          <View style={styles.overviewRow}>
            <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabelIndent}>
              Original Tenure
            </AppText>
            <AppText variant="bodyMedium" style={styles.detailValue}>
              {profile.originalTenureText}
            </AppText>
          </View>

          <View style={styles.overviewRow}>
            <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabelIndent}>
              Remaining Tenure
            </AppText>
            <AppText variant="bodyMedium" style={styles.detailValue}>
              {profile.remainingTenureText}
            </AppText>
          </View>

          <View style={styles.overviewRow}>
            <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabelIndent}>
              Loan Start Date
            </AppText>
            <AppText variant="bodyMedium" style={styles.detailValue}>
              {profile.formattedStartDate}
            </AppText>
          </View>

          <View style={styles.overviewRow}>
            <View style={styles.detailLeft}>
              <AppIcon icon={Calendar} size={18} color={currentTheme.primary} />
              <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabel}>
                Next EMI Due Date
              </AppText>
            </View>
            <AppText variant="bodyMedium" color={currentTheme.primary} style={[styles.detailValue, { fontWeight: '700' }]}>
              {profile.nextEmiInfo?.formattedDate}
            </AppText>
          </View>

          {profile.processingFee > 0 && (
            <View style={styles.overviewRow}>
              <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabelIndent}>
                Processing Fee
              </AppText>
              <AppText variant="bodyMedium" style={styles.detailValue}>
                {profile.formattedProcessingFee}
              </AppText>
            </View>
          )}
        </AppCard>

        {/* 8. NOTES CARD (1-Tap Entry) */}
        <LoanNotesPreviewCard
          notes={notes}
          onViewNotes={() => navigation.navigate(ROUTES.LOAN_NOTES, { loanId: profile.id })}
        />

        {/* 9. PRIVATE DETAILS CARD (1-Tap Entry) */}
        <LoanPrivateDetailsPreviewCard
          privateDetails={privateDetails}
          onViewPrivateDetails={() => navigation.navigate(ROUTES.LOAN_PRIVATE_DETAILS, { loanId: profile.id })}
        />

        {/* 10. HOW FINZO CALCULATES THIS */}
        <AppCard style={styles.assumptionsCard}>
          <TouchableOpacity
            onPress={() => setShowAssumptions(!showAssumptions)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="How Finzo calculates loan metrics expandable section"
            style={styles.assumptionsHeader}
          >
            <View style={styles.titleWithIcon}>
              <AppIcon icon={Calculator} size={16} color={currentTheme.primary} style={{ marginRight: 8 }} />
              <AppText variant="bodyMedium" style={{ fontWeight: '700' }}>
                How Finzo calculates this
              </AppText>
            </View>
            <AppIcon
              icon={showAssumptions ? ChevronDown : ChevronRight}
              size={16}
              color={currentTheme.textSecondary}
            />
          </TouchableOpacity>

          {showAssumptions && (
            <View style={styles.assumptionsBody}>
              <View style={styles.assumptionItem}>
                <AppText variant="caption" color={currentTheme.textSecondary}>Interest Method:</AppText>
                <AppText variant="caption" style={{ fontWeight: '600' }}>Monthly Reducing Balance</AppText>
              </View>

              <View style={styles.assumptionItem}>
                <AppText variant="caption" color={currentTheme.textSecondary}>Current Interest Rate:</AppText>
                <AppText variant="caption" style={{ fontWeight: '600' }}>{profile.formattedInterestRate} p.a.</AppText>
              </View>

              <View style={styles.assumptionItem}>
                <AppText variant="caption" color={currentTheme.textSecondary}>Balance Source:</AppText>
                <AppText variant="caption" style={{ fontWeight: '600' }}>
                  {isBankConfirmed ? 'Bank Confirmed Anchor' : 'Estimated from schedule & prepayments'}
                </AppText>
              </View>

              <View style={styles.assumptionItem}>
                <AppText variant="caption" color={currentTheme.textSecondary}>Recorded Payments:</AppText>
                <AppText variant="caption" style={{ fontWeight: '600' }}>{payments.length} events</AppText>
              </View>

              <View style={styles.assumptionItem}>
                <AppText variant="caption" color={currentTheme.textSecondary}>Ledger Version:</AppText>
                <AppText variant="caption" style={{ fontWeight: '600' }}>v{profile.ledgerVersion || 1}</AppText>
              </View>
            </View>
          )}
        </AppCard>

        {/* 11. MANAGE LOAN CARD */}
        <ManageLoanCard
          isArchived={profile.status === 'archived'}
          onExportReport={() => setExportModalVisible(true)}
          onEditProfile={() => navigation.navigate(ROUTES.EDIT_LOAN, { loanId: profile.id })}
          onArchiveToggle={handleArchiveToggle}
          onDeletePress={handleDeletePress}
        />

        <AdPlacement
          screen="loanDetails"
          placementId={AD_PLACEMENTS.LOAN_DETAILS_NATIVE}
          adType="native"
        />
      </View>

      {/* Manual Balance Update Modal */}
      <ManualBalanceUpdateModal
        visible={balanceModalVisible}
        onClose={() => setBalanceModalVisible(false)}
        loan={profile}
      />

      {/* Loan Reminder Settings Modal */}
      <LoanReminderSettingsModal
        visible={reminderModalVisible}
        loan={rawProfile}
        onClose={() => setReminderModalVisible(false)}
        onSave={(settings) => dispatch(updateLoanReminderSettings(settings))}
      />

      {/* PDF Export Options Modal */}
      <ExportOptionsModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
        loanName={profile.name}
        onExport={async (reportType) => {
          setExportModalVisible(false);
          try {
            const reportAdapter = getLoanReportAdapter(rawProfile, payments, reportType);
            await generateAndShareReport(reportAdapter);
          } catch (err) {
            Alert.alert('Report Export Failed', err.message || 'Could not generate PDF report.');
          }
        }}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  notFound: {
    padding: 24,
    alignItems: 'center',
  },
  container: {
    paddingBottom: 24,
  },
  heroCard: {
    padding: 0,
    marginBottom: 16,
    borderWidth: 0,
    overflow: 'hidden',
  },
  heroContent: {
    padding: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 6,
  },
  heroLabel: {
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
    flex: 1,
    flexShrink: 1,
    marginRight: 4,
  },
  balanceSourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    flexShrink: 0,
  },
  heroAmount: {
    fontSize: 30,
    fontWeight: '800',
    marginVertical: 4,
  },
  progressContainer: {
    marginVertical: 4,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 10,
  },
  heroBottomGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroCol: {
    flex: 1,
  },
  heroMetricVal: {
    fontWeight: '700',
    fontSize: 16,
    marginTop: 2,
  },
  activityCard: {
    padding: 16,
    marginBottom: 16,
  },
  activityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyActivityBox: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  overviewCard: {
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    marginLeft: 8,
    fontWeight: '500',
  },
  detailLabelIndent: {
    marginLeft: 26,
    fontWeight: '500',
  },
  detailValue: {
    fontWeight: '600',
  },
  assumptionsCard: {
    padding: 14,
    marginBottom: 16,
  },
  assumptionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  assumptionsBody: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  assumptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default LoanDetailsScreen;
