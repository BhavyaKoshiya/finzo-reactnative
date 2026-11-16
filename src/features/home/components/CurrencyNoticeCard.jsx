import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Coins, X } from 'lucide-react-native';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import AppCard from '../../../components/cards/AppCard';
import CurrencyPickerModal from '../../../components/currency/CurrencyPickerModal';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { getCurrencyMeta } from '../../../calculations/core/currency';
import {
  dismissCurrencyNotice,
  selectCurrency,
  selectCurrencyNoticeDismissed,
} from '../../../store/slices/settingsSlice';
import { selectActiveLoanProfiles } from '../../../store/slices/loanProfilesSlice';

/**
 * One-time card on a fresh install showing the detected currency, so a wrong guess
 * can be fixed before the first loan is added. Gone for good once the user picks a
 * currency, closes the card or adds a loan.
 */
export const CurrencyNoticeCard = () => {
  const { currentTheme } = useAppTheme();
  const dispatch = useDispatch();
  const [pickerVisible, setPickerVisible] = useState(false);

  const currency = getCurrencyMeta(useSelector(selectCurrency));
  const dismissed = useSelector(selectCurrencyNoticeDismissed);
  const hasLoans = useSelector(selectActiveLoanProfiles).length > 0;

  if (dismissed || hasLoans) return null;

  return (
    <AppCard style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: `${currentTheme.primary}14` }]}>
          <AppIcon icon={Coins} size={20} color={currentTheme.primary} />
        </View>
        <View style={styles.textGroup}>
          <AppText variant="bodyMedium" style={styles.title}>
            Amounts shown in {currency.symbol.trim()} {currency.code}
          </AppText>
          <AppText variant="caption" color={currentTheme.textSecondary}>
            {currency.name}. You can change it anytime in Profile.
          </AppText>
        </View>
        <TouchableOpacity
          onPress={() => dispatch(dismissCurrencyNotice())}
          activeOpacity={0.7}
          accessibilityLabel="Keep this currency"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.closeButton}
        >
          <AppIcon icon={X} size={18} color={currentTheme.textMuted} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={() => setPickerVisible(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Change currency"
        style={[styles.changeButton, { borderColor: currentTheme.primary }]}
      >
        <AppText variant="bodySmall" color={currentTheme.primary} style={styles.changeText}>
          Change currency
        </AppText>
      </TouchableOpacity>
      <CurrencyPickerModal visible={pickerVisible} onClose={() => setPickerVisible(false)} />
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    marginBottom: 2,
  },
  closeButton: {
    padding: 2,
    marginLeft: 8,
  },
  changeButton: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  changeText: {
    fontWeight: '700',
  },
});

export default CurrencyNoticeCard;
