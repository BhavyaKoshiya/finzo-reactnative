import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  TrendingUp,
  Plus,
  Sparkles,
  ReceiptText,
  ShieldCheck,
  Calculator,
  ChevronDown,
  ChevronRight,
  Info,
  CheckCircle2,
  Calendar,
  PieChart,
  FileText,
  Target,
  Layers,
} from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppHeader from '../../../components/navigation/AppHeader';
import AppText from '../../../components/common/AppText';
import AppCard from '../../../components/cards/AppCard';
import AppIcon from '../../../components/common/AppIcon';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { selectLoanProfileById } from '../../../store/slices/loanProfilesSlice';
import { selectPaymentsForLoan } from '../../../store/slices/loanPaymentsSlice';
import { selectActiveLoanGoalsByLoanId } from '../../../store/slices/loanGoalsSlice';
import { buildLoanInsightSummary } from '../utils/loanInsightUtils';
import LoanGoalPreviewCard from '../components/LoanGoalPreviewCard';
import { getLoanReportAdapter, generateAndShareReport } from '../../reports';
import { formatCurrency } from '../../../utils/financeFormatters';
import { ROUTES } from '../../../navigation/routes';

export const LoanInsightsScreen = ({ route, navigation }) => {
  const { currentTheme, isDark } = useAppTheme();
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const loanId = route?.params?.loanId;
  const loan = useSelector(state => selectLoanProfileById(state, loanId));
  const payments = useSelector(state => selectPaymentsForLoan(state, loanId));
  const activeGoals = useSelector(state =>
    selectActiveLoanGoalsByLoanId(state, loanId),
  );
  const primaryGoal =
    activeGoals && activeGoals.length > 0 ? activeGoals[0] : null;

  const handleExportInsightsPdf = async () => {
    if (!loan) return;
    setIsExporting(true);
    try {
      const model = getLoanReportAdapter('insights', loan, payments);
      await generateAndShareReport(model);
    } catch (err) {
      // Error logged by report service
    } finally {
      setIsExporting(false);
    }
  };

  const insights = buildLoanInsightSummary(loan, payments);

  if (!loan || !insights) {
    return (
      <ScreenContainer
        header={
          <AppHeader
            title="Loan Insights"
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

  const {
    loanName,
    currentBalance,
    principalReduced,
    progressPercentage,
    isBankConfirmed,
    totalPaymentsCount,
    regularEmiCount,
    cumulativeInterestPaid,
    estimatedRemainingInterest,
    formattedPayoffDate,
    remainingTenureText,
    latestPaymentInsight,
    isPaidOff,
    isArchived,
  } = insights;

  const renderHeader = () => (
    <AppHeader
      title="Loan Insights"
      subtitle={loanName}
      leftAction={{
        icon: ArrowLeft,
        onPress: () => navigation.goBack(),
        accessibilityLabel: 'Go back',
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
      {/* 1. LOAN PROGRESS HERO CARD */}
      <AppCard style={styles.heroCard}>
        <LinearGradient
          colors={isDark ? ['#0F172A', '#1E3A8A'] : ['#1D4ED8', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.heroContent}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroTitleGroup}>
              <AppIcon
                icon={TrendingUp}
                size={16}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <AppText
                variant="caption"
                color="rgba(255, 255, 255, 0.9)"
                style={styles.heroTitleText}
              >
                LOAN PROGRESS
              </AppText>
            </View>
            <View
              style={[
                styles.sourceChip,
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
                icon={isBankConfirmed ? ShieldCheck : Calculator}
                size={11}
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
            </View>
          </View>

          <View style={styles.heroMainRow}>
            <AppText variant="h1" color="#FFFFFF" style={styles.heroPct}>
              {progressPercentage}%
            </AppText>
            <AppText
              variant="bodyMedium"
              color="rgba(255, 255, 255, 0.9)"
              style={styles.heroPctLabel}
            >
              Principal Paid
            </AppText>
          </View>

          <View style={styles.heroProgressTrack}>
            <View
              style={[
                styles.heroProgressBar,
                { width: `${Math.min(100, progressPercentage)}%` },
              ]}
            />
          </View>

          <View style={styles.heroSubGrid}>
            <View>
              <AppText variant="caption" color="rgba(255, 255, 255, 0.8)">
                Principal Paid
              </AppText>
              <AppText
                variant="bodyMedium"
                color="#FFFFFF"
                style={{ fontWeight: '800', marginTop: 2 }}
              >
                {formatCurrency(principalReduced)}
              </AppText>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <AppText variant="caption" color="rgba(255, 255, 255, 0.8)">
                Outstanding Principal
              </AppText>
              <AppText
                variant="bodyMedium"
                color="#FFFFFF"
                style={{ fontWeight: '800', marginTop: 2 }}
              >
                {formatCurrency(currentBalance)}
              </AppText>
            </View>
          </View>
        </View>
      </AppCard>

      {/* 2. KEY METRICS GRID (2x2) */}
      <View style={styles.metricsGridContainer}>
        <View style={styles.metricsRow}>
          <AppCard style={styles.metricCard}>
            <AppText variant="caption" color={currentTheme.textSecondary}>
              Principal Paid
            </AppText>
            <AppText
              variant="titleMedium"
              color={currentTheme.success || '#16A34A'}
              style={styles.metricVal}
            >
              {formatCurrency(principalReduced)}
            </AppText>
          </AppCard>

          <AppCard style={styles.metricCard}>
            <AppText variant="caption" color={currentTheme.textSecondary}>
              Interest Paid
            </AppText>
            <AppText
              variant="titleMedium"
              color={currentTheme.warning || '#F59E0B'}
              style={styles.metricVal}
            >
              {formatCurrency(cumulativeInterestPaid)}
            </AppText>
          </AppCard>
        </View>

        <View style={styles.metricsRow}>
          <AppCard style={styles.metricCard}>
            <AppText variant="caption" color={currentTheme.textSecondary}>
              Remaining Interest
            </AppText>
            <AppText
              variant="titleMedium"
              color={currentTheme.textPrimary}
              style={styles.metricVal}
            >
              {formatCurrency(estimatedRemainingInterest)}
            </AppText>
          </AppCard>

          <AppCard style={styles.metricCard}>
            <AppText variant="caption" color={currentTheme.textSecondary}>
              Remaining Tenure
            </AppText>
            <AppText
              variant="titleMedium"
              color={currentTheme.primary}
              style={styles.metricVal}
            >
              {remainingTenureText}
            </AppText>
          </AppCard>
        </View>
      </View>

      {/* 3. PAYOFF PROJECTION */}
      <AppCard style={styles.card}>
        <View style={styles.cardTitleRow}>
          <AppIcon
            icon={Calendar}
            size={18}
            color={currentTheme.primary}
            style={{ marginRight: 8 }}
          />
          <AppText variant="cardTitle" style={{ fontWeight: '700' }}>
            Payoff Projection
          </AppText>
        </View>

        <View style={styles.projectionGrid}>
          <View style={styles.projectionCol}>
            <AppText variant="caption" color={currentTheme.textSecondary}>
              Estimated Payoff
            </AppText>
            <AppText
              variant="titleMedium"
              color={isPaidOff ? currentTheme.success : currentTheme.primary}
              style={{ fontWeight: '800', marginTop: 2 }}
            >
              {formattedPayoffDate}
            </AppText>
          </View>

          <View style={styles.projectionDivider} />

          <View style={styles.projectionCol}>
            <AppText variant="caption" color={currentTheme.textSecondary}>
              Remaining Tenure
            </AppText>
            <AppText
              variant="bodyLarge"
              style={{ fontWeight: '700', marginTop: 2 }}
            >
              {remainingTenureText}
            </AppText>
          </View>

          <View style={styles.projectionDivider} />

          <View style={styles.projectionCol}>
            <AppText variant="caption" color={currentTheme.textSecondary}>
              Remaining Interest
            </AppText>
            <AppText
              variant="bodyLarge"
              style={{ fontWeight: '700', marginTop: 2 }}
            >
              {formatCurrency(estimatedRemainingInterest)}
            </AppText>
          </View>
        </View>

        {/* Visual Timeline Bar */}
        <View style={styles.timelineContainer}>
          <View style={styles.timelineHeaderRow}>
            <AppText
              variant="caption"
              color={currentTheme.textMuted}
              style={{ fontWeight: '600' }}
            >
              Today
            </AppText>
            <AppText
              variant="caption"
              color={currentTheme.primary}
              style={{ fontWeight: '700' }}
            >
              Payoff: {formattedPayoffDate}
            </AppText>
          </View>
          <View
            style={[
              styles.timelineTrack,
              { backgroundColor: isDark ? '#334155' : '#E2E8F0' },
            ]}
          >
            <View
              style={[
                styles.timelineProgress,
                {
                  width: `${Math.min(100, Math.max(10, progressPercentage))}%`,
                  backgroundColor: currentTheme.primary,
                },
              ]}
            >
              <View style={styles.timelineDot} />
            </View>
          </View>
        </View>

        {/* Audit & Disclaimer Notes */}
        <View style={styles.projectionNoteBox}>
          {regularEmiCount === 0 && (
            <AppText
              variant="caption"
              color={currentTheme.textSecondary}
              style={{ marginBottom: 4 }}
            >
              • Your payoff projection uses your configured EMI and current loan
              details.
            </AppText>
          )}
          <AppText
            variant="caption"
            color={currentTheme.textMuted}
            style={{ fontStyle: 'italic' }}
          >
            Projection based on your current balance, EMI and interest rate.
            Actual lender calculations may differ.
          </AppText>
        </View>
      </AppCard>

      {/* 4. INTEREST OUTLOOK & BREAKDOWN */}
      <AppCard style={styles.card}>
        <View style={styles.cardTitleRow}>
          <AppIcon
            icon={PieChart}
            size={18}
            color={currentTheme.primary}
            style={{ marginRight: 8 }}
          />
          <AppText variant="cardTitle" style={{ fontWeight: '700' }}>
            Interest Outlook
          </AppText>
        </View>

        <View style={styles.detailRow}>
          <AppText variant="bodyMedium" color={currentTheme.textSecondary}>
            Interest Paid to Date
          </AppText>
          <AppText
            variant="bodyMedium"
            style={[
              styles.boldVal,
              { color: currentTheme.warning || '#F59E0B' },
            ]}
          >
            {formatCurrency(cumulativeInterestPaid)}
          </AppText>
        </View>

        <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
          <AppText variant="bodyMedium" color={currentTheme.textSecondary}>
            Estimated Remaining Interest
          </AppText>
          <AppText
            variant="bodyMedium"
            style={[styles.boldVal, { color: currentTheme.textPrimary }]}
          >
            {formatCurrency(estimatedRemainingInterest)}
          </AppText>
        </View>

        <View style={styles.explanatoryBox}>
          <AppText variant="caption" color={currentTheme.textMuted}>
            Based on your current balance, interest rate (
            {loan.annualInterestRate}%) and scheduled EMI (
            {formatCurrency(loan.emiAmount)}).
          </AppText>
        </View>
      </AppCard>

      {/* 5. PAYMENT ACTIVITY SUMMARY */}
      <AppCard style={styles.card}>
        <View style={styles.cardTitleRow}>
          <AppIcon
            icon={ReceiptText}
            size={18}
            color={currentTheme.primary}
            style={{ marginRight: 8 }}
          />
          <AppText variant="cardTitle" style={{ fontWeight: '700' }}>
            Payment Activity
          </AppText>
        </View>

        {totalPaymentsCount > 0 ? (
          <>
            <AppText
              variant="bodyMedium"
              style={{ fontWeight: '700', marginBottom: 8 }}
            >
              {totalPaymentsCount} payment{totalPaymentsCount === 1 ? '' : 's'}{' '}
              recorded
            </AppText>

            {latestPaymentInsight && (
              <View style={styles.latestPaymentBox}>
                <View style={styles.latestHeaderRow}>
                  <AppText variant="caption" color={currentTheme.textSecondary}>
                    Last Payment
                  </AppText>
                  <AppText variant="caption" color={currentTheme.textMuted}>
                    {latestPaymentInsight.formattedDate}
                  </AppText>
                </View>
                <AppText
                  variant="titleMedium"
                  color={currentTheme.primary}
                  style={{ fontWeight: '800', marginVertical: 2 }}
                >
                  {formatCurrency(latestPaymentInsight.amount)}
                </AppText>
                <AppText variant="caption" color={currentTheme.textSecondary}>
                  Principal: {formatCurrency(latestPaymentInsight.principal)} |
                  Interest: {formatCurrency(latestPaymentInsight.interest)}
                </AppText>
              </View>
            )}

            <TouchableOpacity
              onPress={() =>
                navigation.navigate(ROUTES.LOAN_PAYMENT_HISTORY, {
                  loanId: loan.id,
                })
              }
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="View Payment History"
              style={styles.historyBtnLink}
            >
              <AppText
                variant="bodyMedium"
                color={currentTheme.primary}
                style={{ fontWeight: '700' }}
              >
                View Payment History →
              </AppText>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.emptyPaymentContainer}>
            <AppText
              variant="bodyMedium"
              style={{ fontWeight: '700', marginBottom: 4 }}
            >
              No payments recorded yet.
            </AppText>
            <AppText
              variant="caption"
              color={currentTheme.textMuted}
              style={{ marginBottom: 12, textAlign: 'center' }}
            >
              Your payoff projection uses your configured EMI and current loan
              details.
            </AppText>
            <SecondaryButton
              title="Record First Payment"
              icon={Plus}
              onPress={() =>
                navigation.navigate(ROUTES.ADD_PAYMENT, { loanId: loan.id })
              }
              style={{ paddingHorizontal: 16 }}
            />
          </View>
        )}
      </AppCard>

      {/* 6. HOW FINZO CALCULATES INSIGHTS (ACCORDION) */}
      <AppCard style={styles.assumptionsCard}>
        <TouchableOpacity
          onPress={() => setShowAssumptions(!showAssumptions)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Toggle how Finzo calculates these insights explanation"
          style={styles.assumptionsHeader}
        >
          <View style={styles.accordionHeaderTitle}>
            <AppIcon
              icon={Info}
              size={16}
              color={currentTheme.primary}
              style={{ marginRight: 8 }}
            />
            <AppText
              variant="bodyMedium"
              style={{ fontWeight: '700', flex: 1 }}
            >
              How Finzo calculates these insights
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
            <AppText
              variant="caption"
              color={currentTheme.textSecondary}
              style={styles.assumptionParagraph}
            >
              • Balance source:{' '}
              {isBankConfirmed
                ? 'Bank Confirmed balance'
                : 'Finzo estimated balance'}{' '}
              (principal reduced: {formatCurrency(principalReduced)}).
            </AppText>
            <AppText
              variant="caption"
              color={currentTheme.textSecondary}
              style={styles.assumptionParagraph}
            >
              • Interest calculation: Uses standard monthly reducing balance
              math based on your annual rate ({loan.annualInterestRate}%).
            </AppText>
            <AppText
              variant="caption"
              color={currentTheme.textSecondary}
              style={styles.assumptionParagraph}
            >
              • Payoff projection: Assumes your current monthly EMI (
              {formatCurrency(loan.emiAmount)}) continues on schedule without
              interruption.
            </AppText>
            <AppText
              variant="caption"
              color={currentTheme.textSecondary}
              style={styles.assumptionParagraph}
            >
              • Historical payment snapshots: Preserves principal and interest
              breakdown values recorded at the time of each transaction.
            </AppText>
            <View style={styles.disclaimerBox}>
              <AppText
                variant="caption"
                color={currentTheme.textMuted}
                style={styles.disclaimerText}
              >
                Disclaimer: Finzo estimates are for informational planning
                purposes. Actual lender statements and calculations may vary.
              </AppText>
            </View>
          </View>
        )}
      </AppCard>

      {/* 7. PAYOFF GOAL PREVIEW CARD */}
      <LoanGoalPreviewCard
        goal={primaryGoal}
        onViewGoals={() =>
          navigation.navigate(ROUTES.LOAN_GOALS, { loanId: loan.id })
        }
      />

      {/* 8. ACTIONS SECTION */}
      <View style={styles.actionsSection}>
        <AppText variant="cardTitle" style={styles.actionsSectionTitle}>
          What would you like to do?
        </AppText>

        <View style={styles.actionsGrid}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(ROUTES.LOAN_PREPAYMENT_SIMULATOR, {
                loanId: loan.id,
              })
            }
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Simulate Prepayment"
            style={[
              styles.actionTile,
              {
                backgroundColor: currentTheme.surface,
                borderColor: currentTheme.border,
              },
            ]}
          >
            <AppIcon
              icon={Sparkles}
              size={20}
              color={currentTheme.primary}
              style={{ marginBottom: 6 }}
            />
            <AppText variant="bodyMedium" style={{ fontWeight: '700' }}>
              Simulate Prepayment
            </AppText>
            <AppText
              variant="caption"
              color={currentTheme.textMuted}
              style={{ marginTop: 2 }}
            >
              Calculate savings
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate(ROUTES.LOAN_GOALS, { loanId: loan.id })
            }
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="View Payoff Goals"
            style={[
              styles.actionTile,
              {
                backgroundColor: currentTheme.surface,
                borderColor: currentTheme.border,
              },
            ]}
          >
            <AppIcon
              icon={Target}
              size={20}
              color={currentTheme.primary}
              style={{ marginBottom: 6 }}
            />
            <AppText variant="bodyMedium" style={{ fontWeight: '700' }}>
              Payoff Goals
            </AppText>
            <AppText
              variant="caption"
              color={currentTheme.textMuted}
              style={{ marginTop: 2 }}
            >
              Track payoff target
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate(ROUTES.ADD_PAYMENT, { loanId: loan.id })
            }
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Record Payment"
            style={[
              styles.actionTile,
              {
                backgroundColor: currentTheme.surface,
                borderColor: currentTheme.border,
              },
            ]}
          >
            <AppIcon
              icon={Plus}
              size={20}
              color={currentTheme.primary}
              style={{ marginBottom: 6 }}
            />
            <AppText variant="bodyMedium" style={{ fontWeight: '700' }}>
              Record Payment
            </AppText>
            <AppText
              variant="caption"
              color={currentTheme.textMuted}
              style={{ marginTop: 2 }}
            >
              Log EMI / Prepayment
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate(ROUTES.LOAN_PAYMENT_HISTORY, {
                loanId: loan.id,
              })
            }
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="View Payment History"
            style={[
              styles.actionTile,
              {
                backgroundColor: currentTheme.surface,
                borderColor: currentTheme.border,
              },
            ]}
          >
            <AppIcon
              icon={Layers}
              size={20}
              color={currentTheme.primary}
              style={{ marginBottom: 6 }}
            />
            <AppText variant="bodyMedium" style={{ fontWeight: '700' }}>
              Payment History →
            </AppText>
            <AppText
              variant="caption"
              color={currentTheme.textMuted}
              style={{ marginTop: 2 }}
            >
              Full payment ledger
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* 9. PDF EXPORT */}
      <View style={styles.exportSection}>
        <SecondaryButton
          title={isExporting ? 'Preparing Report...' : 'Export Insights (PDF)'}
          icon={FileText}
          onPress={handleExportInsightsPdf}
          disabled={isExporting}
          accessibilityLabel="Export Insights PDF"
        />
      </View>
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
    marginBottom: 8,
  },
  heroTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroTitleText: {
    fontWeight: '700',
    letterSpacing: 0.5,
    fontSize: 11,
  },
  sourceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  heroMainRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 4,
  },
  heroPct: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    marginRight: 8,
  },
  heroPctLabel: {
    fontWeight: '700',
  },
  heroProgressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 10,
  },
  heroProgressBar: {
    height: '100%',
    backgroundColor: '#86EFAC',
    borderRadius: 4,
  },
  heroSubGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  metricsGridContainer: {
    marginBottom: 16,
    gap: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    padding: 12,
  },
  metricVal: {
    fontWeight: '800',
    marginTop: 4,
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectionGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  projectionCol: {
    flex: 1,
  },
  projectionDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginHorizontal: 8,
  },
  timelineContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  timelineTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  timelineProgress: {
    height: '100%',
    borderRadius: 4,
    position: 'relative',
    justifyContent: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    right: 0,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  projectionNoteBox: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  boldVal: {
    fontWeight: '700',
  },
  explanatoryBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
  },
  latestPaymentBox: {
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 10,
    marginBottom: 10,
  },
  latestHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyBtnLink: {
    paddingVertical: 6,
  },
  emptyPaymentContainer: {
    alignItems: 'center',
    paddingVertical: 12,
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
  accordionHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  assumptionsBody: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    gap: 8,
  },
  assumptionParagraph: {
    lineHeight: 18,
  },
  disclaimerBox: {
    marginTop: 6,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
  },
  disclaimerText: {
    lineHeight: 16,
    fontStyle: 'italic',
  },
  actionsSection: {
    marginBottom: 16,
  },
  actionsSectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionTile: {
    width: '48.5%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  exportSection: {
    marginTop: 4,
  },
});

export default LoanInsightsScreen;
