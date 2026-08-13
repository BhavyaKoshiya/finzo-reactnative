import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, Edit3, Archive, Trash2, Calendar, Landmark, Star, StarOff, Plus, ReceiptText, ChevronRight, ChevronDown, Scale, ShieldCheck, Calculator, Sparkles, TrendingUp, FileText, Compass, Target } from 'lucide-react-native';
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
  setPrimaryLoan,
  updateLoanReminderSettings,
} from '../../../store/slices/loanProfilesSlice';
import { selectLoanRemindersEnabled } from '../../../store/slices/settingsSlice';
import {
  selectPaymentsForLoan,
  deletePaymentsForLoan,
} from '../../../store/slices/loanPaymentsSlice';
import { adaptLoanProfileForDisplay } from '../utils/loanPresentationAdapters';
import { getPaymentStats } from '../utils/loanBalanceUtils';
import { getCurrentLoanBalance } from '../utils/paymentBalanceUtils';
import { buildLoanInsightSummary } from '../utils/loanInsightUtils';
import loanReminderService from '../services/loanReminderService';
import LoanPaymentCard from '../components/LoanPaymentCard';
import UpcomingPaymentCard from '../components/UpcomingPaymentCard';
import LoanReminderSettingsModal from '../components/LoanReminderSettingsModal';
import LoanInsightsPreviewCard from '../components/LoanInsightsPreviewCard';
import ManualBalanceUpdateModal from './ManualBalanceUpdateModal';
import { ExportOptionsModal, getLoanReportAdapter, generateAndShareReport } from '../../reports';
import { formatCurrency } from '../../../utils/financeFormatters';
import { PAYMENT_TYPES } from '../constants/loanPaymentConstants';
import { ROUTES } from '../../../navigation/routes';

export const LoanDetailsScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { currentTheme } = useAppTheme();
  const [balanceModalVisible, setBalanceModalVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);

  const loanId = route?.params?.loanId;
  const rawProfile = useSelector((state) => selectLoanProfileById(state, loanId));
  const payments = useSelector((state) => selectPaymentsForLoan(state, loanId));
  const allLoans = useSelector(selectAllLoanProfiles);
  const globalRemindersEnabled = useSelector(selectLoanRemindersEnabled);

  const profile = adaptLoanProfileForDisplay(rawProfile);
  const paymentStats = getPaymentStats(payments, loanId);
  const balanceState = getCurrentLoanBalance(rawProfile, payments);
  const insightSummary = buildLoanInsightSummary(rawProfile, payments);
  const recentPayments = payments.slice(0, 3);

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
      'This will permanently remove the loan profile, all recorded payment history, and cancel scheduled payment reminders. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Loan',
          style: 'destructive',
          onPress: async () => {
            await loanReminderService.cancelLoanReminders(profile.id);
            dispatch(deletePaymentsForLoan(profile.id));
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
      isArchived ? 'Loan Restored' : 'Loan Archived',
      isArchived
        ? `"${profile.name}" is now active and reminders have been restored.`
        : `"${profile.name}" has been archived and payment reminders are paused.`
    );
  };

  const handleSetPrimaryToggle = () => {
    if (profile.isPrimary) return;
    dispatch(setPrimaryLoan(profile.id));
    Alert.alert('Primary Loan Set', `${profile.name} is now your primary loan.`);
  };

  const renderHeader = () => (
    <AppHeader
      title={profile.name}
      subtitle={profile.lenderName || profile.loanTypeLabel}
      leftAction={{
        icon: ArrowLeft,
        onPress: () => navigation.goBack(),
        accessibilityLabel: 'Go back',
      }}
      rightAction={{
        icon: Edit3,
        onPress: () => navigation.navigate(ROUTES.EDIT_LOAN, { loanId: profile.id }),
        accessibilityLabel: 'Edit loan',
      }}
    />
  );

  return (
    <ScreenContainer
      scrollable
      header={renderHeader()}
      useSafeAreaTop={false}
      useSafeAreaBottom={true}
      style={styles.container}
    >
      {/* Overview Card */}
      <AppCard style={[styles.overviewCard, { backgroundColor: currentTheme.primary }]}>
        <View style={styles.overviewTopRow}>
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <AppIcon icon={profile.loanTypeIcon} size={14} color="#FFFFFF" />
              <AppText variant="caption" color="#FFFFFF" style={styles.typeText}>
                {profile.loanTypeLabel}
              </AppText>
            </View>

            {profile.isPrimary ? (
              <View style={styles.primaryPill}>
                <AppIcon icon={Star} size={11} color="#FFFFFF" />
                <AppText variant="caption" color="#FFFFFF" style={{ fontWeight: '700' }}>
                  Primary
                </AppText>
              </View>
            ) : profile.status === 'active' ? (
              <TouchableOpacity onPress={handleSetPrimaryToggle} activeOpacity={0.7} style={styles.makePrimaryBtn}>
                <AppIcon icon={StarOff} size={11} color="rgba(255,255,255,0.8)" />
                <AppText variant="caption" color="rgba(255,255,255,0.9)">
                  Set as Primary
                </AppText>
              </TouchableOpacity>
            ) : null}
          </View>

          {profile.status === 'archived' && (
            <View style={styles.archivedBadge}>
              <AppText variant="caption" color="#FFFFFF" style={{ fontWeight: '700' }}>
                Archived
              </AppText>
            </View>
          )}
        </View>

        <View style={styles.outstandingHeaderRow}>
          <AppText variant="caption" color="rgba(255, 255, 255, 0.85)">
            Outstanding Balance
          </AppText>
          <View style={styles.sourceBadgeChip}>
            <AppIcon icon={isBankConfirmed ? ShieldCheck : Calculator} size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
            <AppText variant="caption" color="#FFFFFF" style={{ fontWeight: '700', fontSize: 11 }}>
              {isBankConfirmed ? 'Bank Confirmed' : 'Finzo Estimate'}
            </AppText>
          </View>
        </View>

        <AppText variant="h2" color="#FFFFFF" style={styles.outstandingAmount}>
          {formatCurrency(balanceState.currentBalance)}
        </AppText>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                { width: `${Math.min(100, profile.repaymentPercentage)}%` },
              ]}
            />
          </View>
          <AppText variant="caption" color="rgba(255, 255, 255, 0.85)" style={styles.progressText}>
            {profile.progressText}
          </AppText>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.overviewBottomGrid}>
          <View style={styles.gridCol}>
            <AppText variant="caption" color="rgba(255, 255, 255, 0.85)">
              Monthly EMI
            </AppText>
            <AppText variant="titleMedium" color="#FFFFFF" style={styles.boldVal}>
              {profile.formattedEmiAmount}
            </AppText>
          </View>

          <View style={styles.gridCol}>
            <AppText variant="caption" color="rgba(255, 255, 255, 0.85)">
              Interest Rate
            </AppText>
            <AppText variant="titleMedium" color="#FFFFFF" style={styles.boldVal}>
              {profile.formattedInterestRate}
            </AppText>
          </View>
        </View>
      </AppCard>

      {/* Upcoming Payment Card & Reminder Status */}
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

      {/* Compact Loan Insights Preview Card */}
      <LoanInsightsPreviewCard
        summary={insightSummary}
        onViewInsights={() => navigation.navigate(ROUTES.LOAN_INSIGHTS, { loanId: profile.id })}
      />

      {/* Payment Summary Section */}
      <AppCard style={styles.paymentSummaryCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.titleWithIcon}>
            <AppIcon icon={ReceiptText} size={18} color={currentTheme.primary} style={{ marginRight: 8 }} />
            <AppText variant="cardTitle" style={{ fontWeight: '700' }}>
              Payment Summary
            </AppText>
          </View>

          <TouchableOpacity
            onPress={() => setBalanceModalVisible(true)}
            activeOpacity={0.7}
            style={styles.updateBalBtn}
            accessibilityRole="button"
            accessibilityLabel="Correct loan balance"
          >
            <AppIcon icon={Scale} size={13} color={currentTheme.primary} style={{ marginRight: 4 }} />
            <AppText variant="caption" color={currentTheme.primary} style={{ fontWeight: '700' }}>
              Correct Balance
            </AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCol}>
            <AppText variant="caption" color={currentTheme.textSecondary}>
              Total Paid
            </AppText>
            <AppText variant="titleMedium" color={currentTheme.primary} style={{ fontWeight: '800' }}>
              {formatCurrency(paymentStats.totalPaid)}
            </AppText>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statCol}>
            <AppText variant="caption" color={currentTheme.textSecondary}>
              Total Payments
            </AppText>
            <AppText variant="titleMedium" style={{ fontWeight: '700' }}>
              {paymentStats.totalPayments}
            </AppText>
          </View>
        </View>

        <View style={styles.statsSubRow}>
          <AppText variant="caption" color={currentTheme.textSecondary}>
            EMIs: <AppText variant="caption" style={{ fontWeight: '700' }}>{paymentStats.emiCount}</AppText>
          </AppText>
          <AppText variant="caption" color={currentTheme.textSecondary}>
            Prepayments: <AppText variant="caption" style={{ fontWeight: '700' }}>{paymentStats.prepaymentCount}</AppText>
          </AppText>
          {paymentStats.lastPaymentDate ? (
            <AppText variant="caption" color={currentTheme.textSecondary}>
              Last: <AppText variant="caption" style={{ fontWeight: '700' }}>{paymentStats.lastPaymentDate}</AppText>
            </AppText>
          ) : null}
        </View>
      </AppCard>

      {/* How Finzo calculates this expandable section */}
      <AppCard style={styles.assumptionsCard}>
        <TouchableOpacity
          onPress={() => setShowAssumptions(!showAssumptions)}
          activeOpacity={0.7}
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
              <AppText variant="caption" style={{ fontWeight: '600' }}>Monthly reducing balance</AppText>
            </View>
            <View style={styles.assumptionItem}>
              <AppText variant="caption" color={currentTheme.textSecondary}>Annual Interest Rate:</AppText>
              <AppText variant="caption" style={{ fontWeight: '600' }}>{profile.formattedInterestRate}</AppText>
            </View>
            <View style={styles.assumptionItem}>
              <AppText variant="caption" color={currentTheme.textSecondary}>Balance Source:</AppText>
              <AppText variant="caption" style={{ fontWeight: '600' }}>
                {isBankConfirmed ? 'Bank confirmed' : 'Finzo estimate'}
              </AppText>
            </View>
            <View style={styles.assumptionItem}>
              <AppText variant="caption" color={currentTheme.textSecondary}>Recorded Payments Included:</AppText>
              <AppText variant="caption" style={{ fontWeight: '600' }}>{paymentStats.totalPayments}</AppText>
            </View>
            {isBankConfirmed && balanceState.lastConfirmedDate && (
              <View style={styles.assumptionItem}>
                <AppText variant="caption" color={currentTheme.textSecondary}>Last Confirmation Date:</AppText>
                <AppText variant="caption" style={{ fontWeight: '600' }}>
                  {balanceState.lastConfirmedDate.split('T')[0]}
                </AppText>
              </View>
            )}
          </View>
        )}
      </AppCard>

      {/* Recent Payments Section */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeaderRow}>
          <AppText variant="sectionTitle" style={{ fontSize: 16 }}>
            Recent Payments
          </AppText>
          {payments.length > 0 && (
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.LOAN_PAYMENT_HISTORY, { loanId: profile.id })}
              activeOpacity={0.7}
              style={styles.viewAllRow}
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
          <AppCard style={styles.emptyCard}>
            <AppText variant="bodySmall" color={currentTheme.textSecondary} style={{ textAlign: 'center', marginBottom: 10 }}>
              No payments recorded yet for this loan account.
            </AppText>
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.ADD_PAYMENT, { loanId: profile.id })}
              activeOpacity={0.7}
              style={styles.emptyAddBtn}
            >
              <AppIcon icon={Plus} size={14} color={currentTheme.primary} style={{ marginRight: 6 }} />
              <AppText variant="caption" color={currentTheme.primary} style={{ fontWeight: '700' }}>
                Record First Payment
              </AppText>
            </TouchableOpacity>
          </AppCard>
        )}
      </View>

      {/* Details Breakdown Card */}
      <AppCard style={styles.detailsCard}>
        <AppText variant="cardTitle" style={styles.cardTitle}>
          Loan Account Details
        </AppText>

        <View style={styles.detailRow}>
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

        <View style={styles.detailRow}>
          <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabelIndent}>
            Original Loan Amount
          </AppText>
          <AppText variant="bodyMedium" style={styles.detailValue}>
            {profile.formattedOriginalPrincipal}
          </AppText>
        </View>

        <View style={styles.detailRow}>
          <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabelIndent}>
            Original Tenure
          </AppText>
          <AppText variant="bodyMedium" style={styles.detailValue}>
            {profile.originalTenureText}
          </AppText>
        </View>

        <View style={styles.detailRow}>
          <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabelIndent}>
            Remaining Tenure
          </AppText>
          <AppText variant="bodyMedium" style={styles.detailValue}>
            {profile.remainingTenureText}
          </AppText>
        </View>

        <View style={styles.detailRow}>
          <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabelIndent}>
            Loan Start Date
          </AppText>
          <AppText variant="bodyMedium" style={styles.detailValue}>
            {profile.formattedStartDate}
          </AppText>
        </View>

        <View style={styles.detailRow}>
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
          <View style={styles.detailRow}>
            <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabelIndent}>
              Processing Fee
            </AppText>
            <AppText variant="bodyMedium" style={styles.detailValue}>
              {profile.formattedProcessingFee}
            </AppText>
          </View>
        )}

        {profile.notes ? (
          <View style={styles.notesContainer}>
            <AppText variant="caption" color={currentTheme.textSecondary}>
              Notes / Remarks
            </AppText>
            <AppText variant="bodySmall" color={currentTheme.textPrimary} style={styles.notesText}>
              {profile.notes}
            </AppText>
          </View>
        ) : null}
      </AppCard>

      {/* Action Buttons */}
      <View style={styles.actionsGroup}>
        <PrimaryButton
          title="Record Payment"
          icon={Plus}
          onPress={() => navigation.navigate(ROUTES.ADD_PAYMENT, { loanId: profile.id })}
        />

        <SecondaryButton
          title="Simulate Prepayment"
          icon={Sparkles}
          onPress={() => navigation.navigate(ROUTES.LOAN_PREPAYMENT_SIMULATOR, { loanId: profile.id })}
        />

        <SecondaryButton
          title="Plan Payoff Scenarios"
          icon={Compass}
          onPress={() => navigation.navigate(ROUTES.LOAN_PAYOFF_PLANNER, { loanId: profile.id })}
        />

        <SecondaryButton
          title="Your Payoff Goals"
          icon={Target}
          onPress={() => navigation.navigate(ROUTES.LOAN_GOALS, { loanId: profile.id })}
        />

        <SecondaryButton
          title="View Loan Insights"
          icon={TrendingUp}
          onPress={() => navigation.navigate(ROUTES.LOAN_INSIGHTS, { loanId: profile.id })}
        />

        <SecondaryButton
          title="Export Report (PDF)"
          icon={FileText}
          onPress={() => setExportModalVisible(true)}
        />

        <SecondaryButton
          title="Edit Loan Profile"
          icon={Edit3}
          onPress={() => navigation.navigate(ROUTES.EDIT_LOAN, { loanId: profile.id })}
        />

        <SecondaryButton
          title={profile.status === 'archived' ? 'Unarchive Loan' : 'Archive Loan'}
          icon={Archive}
          onPress={handleArchiveToggle}
        />

        <SecondaryButton
          title="Delete Loan Profile"
          icon={Trash2}
          onPress={handleDeletePress}
          style={{ borderColor: currentTheme.error }}
          textStyle={{ color: currentTheme.error }}
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
          const model = getLoanReportAdapter(reportType, rawProfile, payments);
          await generateAndShareReport(model);
        }}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingBottom: 40,
  },
  notFound: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  overviewCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  overviewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  typeText: {
    fontWeight: '600',
  },
  primaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  makePrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  archivedBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  outstandingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sourceBadgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  outstandingAmount: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '800',
    marginTop: 4,
    paddingVertical: 2,
  },
  progressContainer: {
    marginTop: 14,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 6,
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 14,
  },
  overviewBottomGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridCol: {
    flex: 1,
  },
  boldVal: {
    fontWeight: '700',
    marginTop: 2,
  },
  paymentSummaryCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topCardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateBalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statCol: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  statsSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  assumptionsCard: {
    padding: 16,
    marginBottom: 16,
  },
  assumptionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  assumptionsBody: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 8,
  },
  assumptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentSection: {
    marginBottom: 16,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyCard: {
    padding: 16,
    alignItems: 'center',
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  detailsCard: {
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    marginLeft: 8,
  },
  detailLabelIndent: {
    marginLeft: 0,
  },
  detailValue: {
    fontWeight: '600',
  },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  notesText: {
    marginTop: 4,
  },
  actionsGroup: {
    gap: 12,
  },
});

export default LoanDetailsScreen;
