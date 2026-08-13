import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
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
  Layers,
  PieChart,
  FileText,
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
import { buildLoanInsightSummary } from '../utils/loanInsightUtils';
import LoanInsightsTrendChart from '../components/LoanInsightsTrendChart';
import { getLoanReportAdapter, generateAndShareReport } from '../../reports';
import { formatCurrency } from '../../../utils/financeFormatters';
import { ROUTES } from '../../../navigation/routes';

export const LoanInsightsScreen = ({ route, navigation }) => {
  const { currentTheme } = useAppTheme();
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const loanId = route?.params?.loanId;
  const loan = useSelector((state) => selectLoanProfileById(state, loanId));
  const payments = useSelector((state) => selectPaymentsForLoan(state, loanId));

  const handleExportInsightsPdf = async () => {
    if (!loan) return;
    setIsExporting(true);
    try {
      const model = getLoanReportAdapter('insights', loan, payments);
      await generateAndShareReport(model);
    } catch (err) {
      // Error logged by service
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
    originalPrincipal,
    currentBalance,
    principalReduced,
    progressPercentage,
    isBankConfirmed,
    totalPaymentsCount,
    regularEmiCount,
    customPaymentCount,
    prepaymentCount,
    totalAmountPaid,
    cumulativePrincipalPaid,
    cumulativeInterestPaid,
    estimatedRemainingInterest,
    formattedPayoffDate,
    remainingTenureText,
    originalTenureMonths,
    remainingTenureMonths,
    prepaymentImpact,
    latestPaymentInsight,
    historySeries,
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
      {/* Hero Progress Card */}
      <AppCard style={[styles.heroCard, { backgroundColor: currentTheme.primary }]}>
        <View style={styles.heroTopRow}>
          <View style={styles.badgeRow}>
            <View style={styles.heroBadge}>
              <AppIcon icon={TrendingUp} size={14} color="#FFFFFF" />
              <AppText variant="caption" color="#FFFFFF" style={{ fontWeight: '700' }}>
                Payoff Progress
              </AppText>
            </View>
            {isPaidOff && (
              <View style={styles.paidBadge}>
                <AppIcon icon={CheckCircle2} size={12} color="#FFFFFF" />
                <AppText variant="caption" color="#FFFFFF" style={{ fontWeight: '700' }}>
                  Loan Paid Off
                </AppText>
              </View>
            )}
            {isArchived && (
              <View style={styles.archivedBadge}>
                <AppText variant="caption" color="#FFFFFF" style={{ fontWeight: '700' }}>
                  Archived
                </AppText>
              </View>
            )}
          </View>

          <View style={styles.sourceChip}>
            <AppIcon icon={isBankConfirmed ? ShieldCheck : Calculator} size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
            <AppText variant="caption" color="#FFFFFF" style={{ fontWeight: '700', fontSize: 11 }}>
              {isBankConfirmed ? 'Bank Confirmed' : 'Finzo Estimate'}
            </AppText>
          </View>
        </View>

        <View style={styles.heroMainRow}>
          <AppText variant="h1" color="#FFFFFF" style={styles.heroPct}>
            {progressPercentage}%
          </AppText>
          <AppText variant="bodyMedium" color="rgba(255, 255, 255, 0.9)" style={styles.heroPctLabel}>
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
              Principal Reduced
            </AppText>
            <AppText variant="bodyMedium" color="#FFFFFF" style={{ fontWeight: '800', marginTop: 2 }}>
              {formatCurrency(principalReduced)}
            </AppText>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <AppText variant="caption" color="rgba(255, 255, 255, 0.8)">
              Remaining Principal
            </AppText>
            <AppText variant="bodyMedium" color="#FFFFFF" style={{ fontWeight: '800', marginTop: 2 }}>
              {formatCurrency(currentBalance)}
            </AppText>
          </View>
        </View>
      </AppCard>

      {/* Original vs Current Card */}
      <AppCard style={styles.card}>
        <AppText variant="cardTitle" style={styles.cardTitle}>
          Principal Comparison
        </AppText>

        <View style={styles.detailRow}>
          <AppText variant="bodyMedium" color={currentTheme.textSecondary}>Original Principal</AppText>
          <AppText variant="bodyMedium" style={styles.boldVal}>{formatCurrency(originalPrincipal)}</AppText>
        </View>

        <View style={styles.detailRow}>
          <AppText variant="bodyMedium" color={currentTheme.textSecondary}>Current Outstanding</AppText>
          <AppText variant="bodyMedium" style={[styles.boldVal, { color: currentTheme.primary }]}>
            {formatCurrency(currentBalance)}
          </AppText>
        </View>

        <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
          <AppText variant="bodyMedium" color={currentTheme.textSecondary}>Total Principal Reduced</AppText>
          <AppText variant="bodyMedium" style={[styles.boldVal, { color: currentTheme.success }]}>
            {formatCurrency(principalReduced)}
          </AppText>
        </View>
      </AppCard>

      {/* Cumulative Interest & Principal Paid Card */}
      <AppCard style={styles.card}>
        <View style={styles.cardTitleRow}>
          <AppIcon icon={PieChart} size={18} color={currentTheme.primary} style={{ marginRight: 8 }} />
          <AppText variant="cardTitle" style={{ fontWeight: '700' }}>
            Payments & Interest Paid
          </AppText>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCol}>
            <AppText variant="caption" color={currentTheme.textSecondary}>Recorded Payments</AppText>
            <AppText variant="titleMedium" color={currentTheme.primary} style={{ fontWeight: '800', marginTop: 2 }}>
              {formatCurrency(totalAmountPaid)}
            </AppText>
            <AppText variant="caption" color={currentTheme.textMuted} style={{ marginTop: 2 }}>
              {totalPaymentsCount} payment{totalPaymentsCount === 1 ? '' : 's'} logged
            </AppText>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statCol}>
            <AppText variant="caption" color={currentTheme.textSecondary}>Cumulative Interest Paid</AppText>
            <AppText variant="titleMedium" color={currentTheme.secondary || '#F59E0B'} style={{ fontWeight: '800', marginTop: 2 }}>
              {formatCurrency(cumulativeInterestPaid)}
            </AppText>
            <AppText variant="caption" color={currentTheme.textMuted} style={{ marginTop: 2 }}>
              {cumulativePrincipalPaid > 0 ? `${formatCurrency(cumulativePrincipalPaid)} principal` : 'Historical estimate'}
            </AppText>
          </View>
        </View>

        {/* Payment counts breakdown */}
        <View style={styles.countsRow}>
          <View style={styles.countBadge}>
            <AppText variant="caption" color={currentTheme.textSecondary}>Regular EMIs: <AppText variant="caption" style={{ fontWeight: '700' }}>{regularEmiCount}</AppText></AppText>
          </View>
          {customPaymentCount > 0 && (
            <View style={styles.countBadge}>
              <AppText variant="caption" color={currentTheme.textSecondary}>Custom: <AppText variant="caption" style={{ fontWeight: '700' }}>{customPaymentCount}</AppText></AppText>
            </View>
          )}
          {prepaymentCount > 0 && (
            <View style={styles.countBadge}>
              <AppText variant="caption" color={currentTheme.textSecondary}>Prepayments: <AppText variant="caption" style={{ fontWeight: '700' }}>{prepaymentCount}</AppText></AppText>
            </View>
          )}
        </View>
      </AppCard>

      {/* Estimated Payoff & Remaining Interest Card */}
      <AppCard style={styles.card}>
        <View style={styles.cardTitleRow}>
          <AppIcon icon={Calendar} size={18} color={currentTheme.primary} style={{ marginRight: 8 }} />
          <AppText variant="cardTitle" style={{ fontWeight: '700' }}>
            Payoff Projection
          </AppText>
        </View>

        <View style={styles.detailRow}>
          <AppText variant="bodyMedium" color={currentTheme.textSecondary}>Estimated Payoff Date</AppText>
          <AppText variant="bodyMedium" style={[styles.boldVal, { color: isPaidOff ? currentTheme.success : currentTheme.primary }]}>
            {formattedPayoffDate}
          </AppText>
        </View>

        <View style={styles.detailRow}>
          <AppText variant="bodyMedium" color={currentTheme.textSecondary}>Estimated Remaining Interest</AppText>
          <AppText variant="bodyMedium" style={styles.boldVal}>
            {formatCurrency(estimatedRemainingInterest)}
          </AppText>
        </View>

        <View style={styles.detailRow}>
          <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabelFlex}>
            Estimated Remaining Tenure
          </AppText>
          <AppText variant="bodyMedium" style={[styles.boldVal, styles.detailValRight]}>
            {remainingTenureText}
          </AppText>
        </View>

        {originalTenureMonths > 0 && (
          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabelFlex}>Original Loan Tenure</AppText>
            <AppText variant="bodyMedium" style={[styles.boldVal, styles.detailValRight]}>
              {originalTenureMonths} months
            </AppText>
          </View>
        )}
      </AppCard>

      {/* Prepayment Impact Card */}
      {prepaymentCount > 0 && (
        <AppCard style={[styles.card, { backgroundColor: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
          <View style={styles.cardTitleRow}>
            <AppIcon icon={Sparkles} size={18} color={currentTheme.success} style={{ marginRight: 8 }} />
            <AppText variant="cardTitle" color={currentTheme.success} style={{ fontWeight: '700' }}>
              Prepayment Impact
            </AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabelFlex}>Total Prepayments Made</AppText>
            <AppText variant="bodyMedium" style={[styles.boldVal, { color: currentTheme.success }]}>
              {formatCurrency(prepaymentImpact.totalPrepaymentsMade)} ({prepaymentCount})
            </AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabelFlex}>Additional Principal Reduced</AppText>
            <AppText variant="bodyMedium" style={styles.boldVal}>
              {formatCurrency(prepaymentImpact.additionalPrincipalReduced)}
            </AppText>
          </View>

          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabelFlex}>Estimated Interest Avoided</AppText>
            <AppText variant="bodyMedium" style={[styles.boldVal, { color: currentTheme.success }]}>
              {formatCurrency(prepaymentImpact.estimatedInterestAvoided)}
            </AppText>
          </View>
        </AppCard>
      )}

      {/* Latest Payment Insight Card */}
      {latestPaymentInsight && (
        <AppCard style={styles.card}>
          <View style={styles.cardTitleRow}>
            <AppIcon icon={ReceiptText} size={18} color={currentTheme.primary} style={{ marginRight: 8 }} />
            <AppText variant="cardTitle" style={{ fontWeight: '700' }}>
              Latest Payment Insight
            </AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabelFlex}>Payment Date</AppText>
            <AppText variant="bodyMedium" style={styles.boldVal}>{latestPaymentInsight.formattedDate}</AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabelFlex}>Amount Recorded</AppText>
            <AppText variant="bodyMedium" style={[styles.boldVal, { color: currentTheme.primary }]}>
              {formatCurrency(latestPaymentInsight.amount)}
            </AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabelFlex}>Principal Portion</AppText>
            <AppText variant="bodyMedium" style={styles.boldVal}>
              {formatCurrency(latestPaymentInsight.principal)}
            </AppText>
          </View>

          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabelFlex}>Interest Portion</AppText>
            <AppText variant="bodyMedium" style={[styles.boldVal, { color: currentTheme.secondary || '#F59E0B' }]}>
              {formatCurrency(latestPaymentInsight.interest)}
            </AppText>
          </View>
        </AppCard>
      )}

      {/* Historical Trend Chart */}
      <LoanInsightsTrendChart historySeries={historySeries} />

      {/* How Finzo calculates this Expandable Accordion */}
      <AppCard style={styles.assumptionsCard}>
        <TouchableOpacity
          onPress={() => setShowAssumptions(!showAssumptions)}
          activeOpacity={0.7}
          style={styles.assumptionsHeader}
        >
          <View style={styles.accordionHeaderTitle}>
            <AppIcon icon={Info} size={16} color={currentTheme.primary} style={{ marginRight: 8 }} />
            <AppText variant="bodyMedium" style={{ fontWeight: '700', flex: 1 }}>
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
            <AppText variant="caption" color={currentTheme.textSecondary} style={styles.assumptionParagraph}>
              • Interest calculation uses standard monthly reducing balance math based on your annual interest rate ({loan.annualInterestRate}%).
            </AppText>
            <AppText variant="caption" color={currentTheme.textSecondary} style={styles.assumptionParagraph}>
              • Historical payment snapshots preserve interest/principal values recorded at the time of each payment.
            </AppText>
            <AppText variant="caption" color={currentTheme.textSecondary} style={styles.assumptionParagraph}>
              • Future remaining interest and estimated payoff dates assume your current EMI ({formatCurrency(loan.emiAmount)}) continues unchanged.
            </AppText>
            <View style={styles.disclaimerBox}>
              <AppText variant="caption" color={currentTheme.textMuted} style={styles.disclaimerText}>
                Disclaimer: Finzo estimates are based on the information you provide. Your lender's actual calculations, dates, and charges may differ.
              </AppText>
            </View>
          </View>
        )}
      </AppCard>

      {/* Action Buttons */}
      <View style={styles.actionsGroup}>
        <PrimaryButton
          title="Record Payment"
          icon={Plus}
          onPress={() => navigation.navigate(ROUTES.ADD_PAYMENT, { loanId: loan.id })}
        />

        <SecondaryButton
          title="Simulate Prepayment"
          icon={Sparkles}
          onPress={() => navigation.navigate(ROUTES.LOAN_PREPAYMENT_SIMULATOR, { loanId: loan.id })}
        />

        <SecondaryButton
          title="View Payment History"
          icon={Layers}
          onPress={() => navigation.navigate(ROUTES.LOAN_PAYMENT_HISTORY, { loanId: loan.id })}
        />

        <SecondaryButton
          title={isExporting ? 'Preparing Report...' : 'Export Insights (PDF)'}
          icon={FileText}
          onPress={handleExportInsightsPdf}
          disabled={isExporting}
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
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  heroTopRow: {
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
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
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
  sourceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  heroMainRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 4,
  },
  heroPct: {
    fontSize: 36,
    lineHeight: 44,
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
    marginVertical: 12,
  },
  heroProgressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  heroSubGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  cardTitle: {
    marginBottom: 12,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  boldVal: {
    fontWeight: '700',
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
    height: 36,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  countsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  countBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  detailLabelFlex: {
    flex: 1,
    marginRight: 12,
  },
  detailValRight: {
    textAlign: 'right',
    flexShrink: 1,
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
  accordionHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  assumptionsBody: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
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
  actionsGroup: {
    gap: 12,
  },
});

export default LoanInsightsScreen;
