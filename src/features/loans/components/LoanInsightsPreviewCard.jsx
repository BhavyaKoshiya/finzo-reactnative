import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, ChevronRight, Award, ShieldCheck, Calculator } from 'lucide-react-native';
import AppCard from '../../../components/cards/AppCard';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { formatCurrency } from '../../../utils/financeFormatters';

export const LoanInsightsPreviewCard = ({ summary, onViewInsights, style }) => {
  const { currentTheme } = useAppTheme();

  if (!summary) return null;

  const {
    progressPercentage,
    principalReduced,
    cumulativeInterestPaid,
    formattedPayoffDate,
    isBankConfirmed,
    isPaidOff,
  } = summary;

  return (
    <AppCard style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <AppIcon icon={TrendingUp} size={18} color={currentTheme.primary} style={{ marginRight: 6 }} />
          <AppText variant="cardTitle" style={{ fontWeight: '700' }}>
            Loan Insights
          </AppText>
        </View>

        <TouchableOpacity
          onPress={onViewInsights}
          activeOpacity={0.7}
          style={styles.viewInsightsBtn}
          accessibilityRole="button"
          accessibilityLabel="View detailed loan insights"
        >
          <AppText variant="caption" color={currentTheme.primary} style={{ fontWeight: '700', marginRight: 2 }}>
            View Insights
          </AppText>
          <AppIcon icon={ChevronRight} size={14} color={currentTheme.primary} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar & Badges */}
      <View style={styles.progressRow}>
        <View style={styles.progressHeader}>
          <AppText variant="bodyMedium" style={{ fontWeight: '800' }}>
            {progressPercentage}% <AppText variant="caption" color={currentTheme.textSecondary}>Principal Paid</AppText>
          </AppText>
          <View style={styles.sourceBadge}>
            <AppIcon icon={isBankConfirmed ? ShieldCheck : Calculator} size={10} color={currentTheme.textSecondary} style={{ marginRight: 3 }} />
            <AppText variant="caption" color={currentTheme.textSecondary} style={{ fontSize: 10, fontWeight: '600' }}>
              {isBankConfirmed ? 'Bank Confirmed' : 'Finzo Estimate'}
            </AppText>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              { width: `${Math.min(100, progressPercentage)}%`, backgroundColor: currentTheme.primary },
            ]}
          />
        </View>
      </View>

      {/* Summary Grid */}
      <View style={styles.gridRow}>
        <View style={styles.gridCol}>
          <AppText variant="caption" color={currentTheme.textSecondary}>
            Principal Paid
          </AppText>
          <AppText variant="bodySmall" style={{ fontWeight: '700', color: currentTheme.textPrimary }}>
            {formatCurrency(principalReduced)}
          </AppText>
        </View>

        <View style={styles.gridCol}>
          <AppText variant="caption" color={currentTheme.textSecondary}>
            Interest Paid
          </AppText>
          <AppText variant="bodySmall" style={{ fontWeight: '700', color: currentTheme.secondary || '#F59E0B' }}>
            {formatCurrency(cumulativeInterestPaid)}
          </AppText>
        </View>

        <View style={styles.gridColRight}>
          <AppText variant="caption" color={currentTheme.textSecondary}>
            Estimated Payoff
          </AppText>
          <AppText variant="bodySmall" style={{ fontWeight: '700', color: isPaidOff ? currentTheme.success : currentTheme.primary }}>
            {formattedPayoffDate}
          </AppText>
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewInsightsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressRow: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  gridCol: {
    flex: 1,
  },
  gridColRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
});

export default LoanInsightsPreviewCard;
