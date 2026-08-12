import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, Bell, Plus, AlertCircle, CheckCircle2, Clock } from 'lucide-react-native';
import AppCard from '../../../components/cards/AppCard';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { formatCurrency } from '../../../utils/financeFormatters';
import { getPaymentStatus } from '../utils/loanReminderUtils';
import { formatLoanDate } from '../utils/loanDateUtils';

export const UpcomingPaymentCard = ({
  loan,
  payments = [],
  onRecordPayment,
  onOpenSettings,
  style,
}) => {
  const { currentTheme } = useAppTheme();

  if (!loan) return null;

  const paymentStatus = getPaymentStatus(loan, payments);
  const { status, daysOverdue, daysRemaining, nextDueDate } = paymentStatus;

  const formattedDueDate = formatLoanDate(nextDueDate);

  let badgeColor = currentTheme.primary;
  let badgeBg = `${currentTheme.primary}18`;
  let badgeIcon = Calendar;
  let badgeLabel = `Due: ${formattedDueDate}`;

  if (status === 'overdue') {
    badgeColor = currentTheme.error;
    badgeBg = 'rgba(239, 68, 68, 0.15)';
    badgeIcon = AlertCircle;
    badgeLabel = `Overdue by ${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'}`;
  } else if (status === 'due_today') {
    badgeColor = '#F59E0B';
    badgeBg = 'rgba(245, 158, 11, 0.15)';
    badgeIcon = Clock;
    badgeLabel = 'Due Today';
  } else if (status === 'paid') {
    badgeColor = currentTheme.success;
    badgeBg = 'rgba(34, 197, 94, 0.15)';
    badgeIcon = CheckCircle2;
    badgeLabel = 'Period Satisfied';
  } else if (status === 'paid_off') {
    badgeColor = currentTheme.success;
    badgeBg = 'rgba(34, 197, 94, 0.15)';
    badgeIcon = CheckCircle2;
    badgeLabel = 'Loan Paid Off';
  } else if (daysRemaining <= 3) {
    badgeLabel = `Due in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}`;
  }

  return (
    <AppCard style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <AppIcon icon={Calendar} size={18} color={currentTheme.primary} style={{ marginRight: 6 }} />
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={{ fontWeight: '600' }}>
            Next EMI Payment
          </AppText>
        </View>

        <View style={styles.rightHeaderActions}>
          <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
            <AppIcon icon={badgeIcon} size={12} color={badgeColor} style={{ marginRight: 4 }} />
            <AppText variant="caption" color={badgeColor} style={styles.badgeText}>
              {badgeLabel}
            </AppText>
          </View>

          {onOpenSettings && (
            <TouchableOpacity
              onPress={onOpenSettings}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Loan reminder settings"
              style={styles.settingsBtn}
            >
              <AppIcon icon={Bell} size={18} color={loan.remindersEnabled ? currentTheme.primary : currentTheme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.bodyRow}>
        <View style={styles.amountContainer}>
          <AppText variant="screenTitle" color={currentTheme.textPrimary} style={{ fontWeight: '800' }}>
            {formatCurrency(loan.emiAmount)}
          </AppText>
          {nextDueDate !== '' && (
            <AppText variant="caption" color={currentTheme.textSecondary} style={{ marginTop: 2 }} numberOfLines={1} ellipsizeMode="tail">
              Due: <AppText variant="caption" style={{ fontWeight: '700' }}>{formattedDueDate}</AppText>
            </AppText>
          )}
        </View>

        {onRecordPayment && status !== 'paid_off' && status !== 'paid' && (
          <TouchableOpacity
            onPress={onRecordPayment}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Record EMI payment"
            style={[styles.recordBtn, { backgroundColor: currentTheme.primary }]}
          >
            <AppIcon icon={Plus} size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
            <AppText variant="caption" style={styles.recordBtnText}>
              Record Payment
            </AppText>
          </TouchableOpacity>
        )}
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
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
  rightHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontWeight: '700',
    fontSize: 11,
  },
  settingsBtn: {
    marginLeft: 10,
    padding: 4,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    width: '100%',
  },
  amountContainer: {
    flex: 1,
    marginRight: 8,
  },
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  recordBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});

export default UpcomingPaymentCard;
