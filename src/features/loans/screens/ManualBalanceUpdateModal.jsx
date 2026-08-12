import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { X, ShieldCheck } from 'lucide-react-native';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import MoneyInput from '../../../components/forms/MoneyInput';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';
import AppCard from '../../../components/cards/AppCard';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { correctLoanBalance } from '../../../store/slices/loanProfilesSlice';
import { formatCurrency } from '../../../utils/financeFormatters';

export const ManualBalanceUpdateModal = ({ visible, onClose, loan }) => {
  const dispatch = useDispatch();
  const { currentTheme } = useAppTheme();

  const currentBal = loan?.currentOutstandingPrincipal || 0;
  const [bankBalance, setBankBalance] = useState(currentBal);
  const [error, setError] = useState('');

  if (!loan) return null;

  const numBank = Number(bankBalance);
  const hasValidInput = !isNaN(numBank) && bankBalance !== '' && bankBalance !== null && numBank >= 0;
  const diff = hasValidInput ? numBank - currentBal : 0;

  const handleSave = () => {
    if (!hasValidInput) {
      setError('Please enter a valid non-negative bank balance.');
      return;
    }

    dispatch(
      correctLoanBalance({
        id: loan.id,
        actualBankBalance: numBank,
      })
    );

    Alert.alert(
      'Bank Balance Confirmed',
      `${loan.name} balance set to ${formatCurrency(numBank)}. All future payment estimates will use this bank-confirmed balance as starting point.`
    );
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: currentTheme.surface }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <AppIcon icon={ShieldCheck} size={20} color={currentTheme.primary} style={styles.headerIcon} />
              <AppText variant="cardTitle" style={styles.headerTitle}>
                Confirm Actual Bank Balance
              </AppText>
            </View>

            <TouchableOpacity onPress={onClose} activeOpacity={0.7} accessibilityLabel="Close modal">
              <AppIcon icon={X} size={20} color={currentTheme.textMuted} />
            </TouchableOpacity>
          </View>

          <AppText variant="caption" color={currentTheme.textSecondary} style={styles.subSubtitle}>
            Finzo's estimated balance may differ slightly from your lender receipt due to daily interest accrual or bank rounding.
          </AppText>

          <AppCard style={styles.contentBox}>
            <View style={styles.infoRow}>
              <AppText variant="caption" color={currentTheme.textSecondary}>
                Finzo Estimated Balance
              </AppText>
              <AppText variant="bodyMedium" style={styles.estimatedText}>
                {formatCurrency(currentBal)}
              </AppText>
            </View>

            <MoneyInput
              label="Your Bank Balance"
              value={bankBalance}
              onChangeValue={(val) => {
                setBankBalance(val);
                setError('');
              }}
              errorText={error}
              required
            />

            {hasValidInput && (
              <View style={styles.comparisonBox}>
                <View style={styles.compRow}>
                  <AppText variant="caption" color={currentTheme.textSecondary}>Finzo Estimate:</AppText>
                  <AppText variant="caption" style={styles.compValue}>{formatCurrency(currentBal)}</AppText>
                </View>
                <View style={styles.compRow}>
                  <AppText variant="caption" color={currentTheme.textSecondary}>Your Bank Balance:</AppText>
                  <AppText variant="caption" color={currentTheme.primary} style={styles.compValuePrimary}>{formatCurrency(numBank)}</AppText>
                </View>
                <View style={styles.diffRow}>
                  <AppText variant="caption" style={styles.diffLabel}>Difference:</AppText>
                  <AppText variant="caption" color={diff !== 0 ? currentTheme.warning : currentTheme.success} style={styles.diffValue}>
                    {diff > 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)}
                  </AppText>
                </View>
              </View>
            )}
          </AppCard>

          <View style={styles.buttonGroup}>
            <PrimaryButton title="Use Bank Balance" onPress={handleSave} style={styles.fullWidthBtn} />
            <SecondaryButton title="Cancel" onPress={onClose} style={styles.fullWidthBtn} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontWeight: '700',
  },
  subSubtitle: {
    marginBottom: 16,
  },
  contentBox: {
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  estimatedText: {
    fontWeight: '700',
  },
  comparisonBox: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  compRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  compValue: {
    fontWeight: '600',
  },
  compValuePrimary: {
    fontWeight: '700',
  },
  diffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingTop: 4,
    marginTop: 4,
  },
  diffLabel: {
    fontWeight: '600',
  },
  diffValue: {
    fontWeight: '700',
  },
  buttonGroup: {
    gap: 10,
  },
  fullWidthBtn: {
    width: '100%',
  },
});

export default ManualBalanceUpdateModal;
