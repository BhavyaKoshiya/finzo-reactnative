import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Lock, ChevronRight, ShieldCheck } from 'lucide-react-native';
import AppCard from '../../../components/cards/AppCard';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { maskAccountReference } from '../utils/accountNumberMaskingUtils';

export const LoanPrivateDetailsPreviewCard = ({
  privateDetails = null,
  onViewPrivateDetails,
  style,
}) => {
  const { currentTheme } = useAppTheme();

  const hasDetails = Boolean(
    privateDetails &&
      (privateDetails.lenderName ||
        privateDetails.loanAccountReference ||
        privateDetails.branchName ||
        privateDetails.loanOfficerName)
  );

  return (
    <AppCard style={[styles.card, style]}>
      <TouchableOpacity
        onPress={onViewPrivateDetails}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="View private loan details"
        style={styles.contentRow}
      >
        <View style={[styles.iconBox, { backgroundColor: `${currentTheme.primary}18` }]}>
          <AppIcon icon={Lock} size={20} color={currentTheme.primary} />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <AppText variant="bodyMedium" style={{ fontWeight: '700', marginRight: 6 }}>
              Private Loan Details
            </AppText>
            <View style={[styles.badge, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
              <AppIcon icon={ShieldCheck} size={10} color={currentTheme.success} style={{ marginRight: 2 }} />
              <AppText variant="caption" color={currentTheme.success} style={{ fontSize: 10, fontWeight: '700' }}>
                Device Local
              </AppText>
            </View>
          </View>
          {hasDetails ? (
            <AppText variant="caption" color={currentTheme.textSecondary} numberOfLines={1}>
              {privateDetails.lenderName ? `${privateDetails.lenderName} • ` : ''}
              {privateDetails.loanAccountReference
                ? maskAccountReference(privateDetails.loanAccountReference)
                : 'Account information stored'}
            </AppText>
          ) : (
            <AppText variant="caption" color={currentTheme.textMuted}>
              Lender, account numbers, branch & officer details
            </AppText>
          )}
        </View>

        <View style={styles.actionRight}>
          <AppText variant="caption" color={currentTheme.primary} style={{ fontWeight: '700', marginRight: 4 }}>
            View Details
          </AppText>
          <AppIcon icon={ChevronRight} size={16} color={currentTheme.primary} />
        </View>
      </TouchableOpacity>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginBottom: 16,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  actionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default LoanPrivateDetailsPreviewCard;
