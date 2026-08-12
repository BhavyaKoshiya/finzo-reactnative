import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AppCard from '../../../components/cards/AppCard';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { adaptLoanProfileForDisplay } from '../utils/loanPresentationAdapters';
import { Calendar, ChevronRight, Star } from 'lucide-react-native';

export const LoanProfileCard = ({ profile, onPress, style }) => {
  const { currentTheme } = useAppTheme();
  const adapted = adaptLoanProfileForDisplay(profile);

  if (!adapted) return null;

  const {
    name,
    lenderName,
    loanTypeIcon,
    badgeColor,
    formattedCurrentOutstanding,
    formattedEmiAmount,
    formattedInterestRate,
    remainingTenureText,
    nextEmiInfo,
    isPrimary,
    accessibilityLabel,
  } = adapted;

  return (
    <AppCard style={[styles.card, style]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.iconAndTitle}>
            <View style={[styles.iconBadge, { backgroundColor: `${badgeColor}1A` }]}>
              <AppIcon icon={loanTypeIcon} size={22} color={badgeColor} />
            </View>
            <View style={styles.titleCol}>
              <View style={styles.nameBadgeRow}>
                <AppText variant="cardTitle" style={styles.loanName} numberOfLines={1}>
                  {name}
                </AppText>
                {isPrimary && (
                  <View style={[styles.primaryBadge, { backgroundColor: currentTheme.primaryLight }]}>
                    <AppIcon icon={Star} size={10} color={currentTheme.primary} />
                    <AppText variant="caption" color={currentTheme.primary} style={styles.primaryText}>
                      Primary
                    </AppText>
                  </View>
                )}
              </View>
              {lenderName ? (
                <AppText variant="bodySmall" color={currentTheme.textSecondary} numberOfLines={1}>
                  {lenderName}
                </AppText>
              ) : null}
            </View>
          </View>
          <AppIcon icon={ChevronRight} size={20} color={currentTheme.textMuted} />
        </View>

        {/* Metrics Grid */}
        <View style={[styles.metricsRow, { borderColor: currentTheme.border }]}>
          <View style={styles.metricCol}>
            <AppText variant="caption" color={currentTheme.textSecondary}>
              Outstanding
            </AppText>
            <AppText
              variant="titleMedium"
              color={currentTheme.textPrimary}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={styles.metricValue}
            >
              {formattedCurrentOutstanding}
            </AppText>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <AppText variant="caption" color={currentTheme.textSecondary}>
              Monthly EMI
            </AppText>
            <AppText
              variant="titleMedium"
              color={currentTheme.primary}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={styles.metricValue}
            >
              {formattedEmiAmount}
            </AppText>
          </View>
        </View>

        {/* Footer Sub-info */}
        <View style={styles.footerRow}>
          <View style={styles.footerTag}>
            <AppText variant="bodySmall" color={currentTheme.textSecondary} numberOfLines={1}>
              {formattedInterestRate} • {remainingTenureText} left
            </AppText>
          </View>

          {nextEmiInfo?.formattedDate && (
            <View style={styles.nextEmiTag}>
              <AppIcon icon={Calendar} size={13} color={currentTheme.textSecondary} style={{ marginRight: 4 }} />
              <AppText variant="bodySmall" color={currentTheme.textSecondary} numberOfLines={1}>
                Next: {nextEmiInfo.formattedDate}
              </AppText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  iconAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleCol: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loanName: {
    fontSize: 16,
    flexShrink: 1,
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  primaryText: {
    fontWeight: '700',
    fontSize: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  metricCol: {
    flex: 1,
  },
  metricValue: {
    marginTop: 2,
    fontWeight: '700',
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  footerTag: {
    flex: 1,
    marginRight: 8,
  },
  nextEmiTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default LoanProfileCard;
