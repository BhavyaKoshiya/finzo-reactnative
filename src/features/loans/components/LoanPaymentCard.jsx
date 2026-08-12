import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AppCard from '../../../components/cards/AppCard';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { adaptLoanPaymentForDisplay } from '../utils/loanPaymentPresentationAdapters';
import { ChevronRight, ShieldCheck, Calculator } from 'lucide-react-native';

export const LoanPaymentCard = ({ payment, onPress, style }) => {
  const { currentTheme } = useAppTheme();
  const adapted = adaptLoanPaymentForDisplay(payment);

  if (!adapted) return null;

  const {
    typeLabel,
    typeIcon,
    badgeColor,
    formattedDate,
    formattedAmount,
    formattedOutstandingAfter,
    formattedPrincipal,
    formattedInterest,
    balanceSource,
    note,
    accessibilityLabel,
  } = adapted;

  const isBankConfirmed = balanceSource === 'bank_confirmed';

  return (
    <AppCard style={[styles.card, style]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <View style={styles.contentRow}>
          <View style={[styles.iconBadge, { backgroundColor: `${badgeColor}1A` }]}>
            <AppIcon icon={typeIcon} size={20} color={badgeColor} />
          </View>

          <View style={styles.mainInfo}>
            <View style={styles.titleRow}>
              <View style={styles.titleWithBadge}>
                <AppText variant="bodyMedium" style={{ fontWeight: '700' }}>
                  {typeLabel}
                </AppText>
                {isBankConfirmed && (
                  <View style={styles.confirmedChip}>
                    <AppIcon icon={ShieldCheck} size={10} color="#10B981" style={{ marginRight: 2 }} />
                    <AppText variant="caption" color="#10B981" style={styles.confirmedChipText}>
                      Bank Confirmed
                    </AppText>
                  </View>
                )}
              </View>
              <AppText variant="titleMedium" color={currentTheme.textPrimary} style={styles.amountText}>
                {formattedAmount}
              </AppText>
            </View>

            <View style={styles.subRow}>
              <AppText variant="caption" color={currentTheme.textSecondary}>
                {formattedDate}
              </AppText>
              {formattedOutstandingAfter ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {!isBankConfirmed && (
                    <AppIcon icon={Calculator} size={11} color={currentTheme.textMuted} style={{ marginRight: 3 }} />
                  )}
                  <AppText variant="caption" color={currentTheme.textSecondary}>
                    {isBankConfirmed ? 'Bal: ' : 'Est: '}{formattedOutstandingAfter}
                  </AppText>
                </View>
              ) : null}
            </View>

            {(formattedInterest || formattedPrincipal) && (
              <View style={styles.breakdownRow}>
                {formattedInterest ? (
                  <AppText variant="caption" color={currentTheme.textMuted} style={{ marginRight: 8 }}>
                    Int: {formattedInterest}
                  </AppText>
                ) : null}
                {formattedPrincipal ? (
                  <AppText variant="caption" color={currentTheme.textMuted}>
                    Prin: {formattedPrincipal}
                  </AppText>
                ) : null}
              </View>
            )}

            {note ? (
              <AppText variant="caption" color={currentTheme.textMuted} numberOfLines={1} style={styles.noteText}>
                {note}
              </AppText>
            ) : null}
          </View>

          <AppIcon icon={ChevronRight} size={18} color={currentTheme.textMuted} style={styles.chevron} />
        </View>
      </TouchableOpacity>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginBottom: 10,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mainInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  confirmedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  confirmedChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  amountText: {
    fontWeight: '800',
    fontSize: 16,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  noteText: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  chevron: {
    marginLeft: 8,
  },
});

export default LoanPaymentCard;
