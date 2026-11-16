import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Check, X } from 'lucide-react-native';
import AppText from '../common/AppText';
import AppIcon from '../common/AppIcon';
import { useAppTheme } from '../../hooks/useAppTheme';
import { CURRENCIES } from '../../calculations/core/currency';
import { selectCurrency, setCurrency } from '../../store/slices/settingsSlice';

/**
 * Lets the user choose the display currency. Choosing one only changes symbols and
 * digit grouping; amounts already entered are not converted.
 */
export const CurrencyPickerModal = ({ visible, onClose }) => {
  const { currentTheme } = useAppTheme();
  const dispatch = useDispatch();
  const selected = useSelector(selectCurrency);

  const handleSelect = (code) => {
    onClose?.();
    if (code !== selected) {
      dispatch(setCurrency(code));
    }
  };

  const renderItem = ({ item }) => {
    const isSelected = item.code === selected;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleSelect(item.code)}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={`${item.name}, ${item.code}`}
        style={[styles.row, { borderBottomColor: currentTheme.border }]}
      >
        <View style={[styles.symbolBox, { backgroundColor: `${currentTheme.primary}14` }]}>
          <AppText variant="bodyMedium" color={currentTheme.primary} style={styles.symbolText}>
            {item.symbol.trim()}
          </AppText>
        </View>
        <View style={styles.rowText}>
          <AppText variant="bodyMedium">{item.name}</AppText>
          <AppText variant="caption" color={currentTheme.textSecondary}>
            {item.code}
          </AppText>
        </View>
        {isSelected && <AppIcon icon={Check} size={20} color={currentTheme.primary} />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: currentTheme.surface }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <AppText variant="screenTitle" style={styles.title}>
                Currency
              </AppText>
              <AppText variant="caption" color={currentTheme.textSecondary}>
                Changes how amounts are shown. Amounts you have entered are not converted.
              </AppText>
            </View>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              accessibilityLabel="Close currency list"
              style={styles.closeButton}
            >
              <AppIcon icon={X} size={20} color={currentTheme.textMuted} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={CURRENCIES}
            keyExtractor={(item) => item.code}
            renderItem={renderItem}
            style={styles.list}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheet: {
    maxHeight: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  headerText: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  closeButton: {
    padding: 4,
    marginLeft: 12,
  },
  list: {
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  symbolBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  symbolText: {
    fontWeight: '700',
  },
  rowText: {
    flex: 1,
  },
});

export default CurrencyPickerModal;
