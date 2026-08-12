import React, { useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import DateInput from './DateInput';
import AppText from '../common/AppText';
import PrimaryButton from '../buttons/PrimaryButton';
import SecondaryButton from '../buttons/SecondaryButton';
import SelectField from './SelectField';
import { useAppTheme } from '../../hooks/useAppTheme';
import { formatDisplayDate } from '../../utils/dateUtils';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const DatePickerField = ({
  label,
  value,
  onDateChange,
  placeholder = 'Select date',
  helperText,
  errorText,
  required = false,
  disabled = false,
  style,
}) => {
  const { currentTheme } = useAppTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const parseValueToLocalDate = (val) => {
    if (!val) return new Date();
    if (val instanceof Date) return val;
    const parts = String(val).split('T')[0].split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d);
      }
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  // Parse initial date
  const parsedDate = parseValueToLocalDate(value);
  const initialYear = parsedDate.getFullYear();
  const initialMonth = parsedDate.getMonth();
  const initialDay = parsedDate.getDate();

  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedDay, setSelectedDay] = useState(initialDay);

  const openPicker = () => {
    const d = parseValueToLocalDate(value);
    setSelectedYear(d.getFullYear());
    setSelectedMonth(d.getMonth());
    setSelectedDay(d.getDate());
    setModalVisible(true);
  };

  const handleConfirm = () => {
    setModalVisible(false);
    const yStr = String(selectedYear);
    const mStr = String(selectedMonth + 1).padStart(2, '0');
    const dStr = String(selectedDay).padStart(2, '0');
    const isoDate = `${yStr}-${mStr}-${dStr}`;
    if (onDateChange) {
      onDateChange(isoDate);
    }
  };

  // Generate day options (1-31)
  const maxDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const dayOptions = Array.from({ length: maxDays }, (_, i) => ({
    label: String(i + 1),
    value: String(i + 1),
  }));

  const monthOptions = MONTH_NAMES.map((m, idx) => ({
    label: m,
    value: String(idx),
  }));

  const currentYr = new Date().getFullYear();
  const yearOptions = Array.from({ length: 40 }, (_, i) => {
    const yr = currentYr - 20 + i;
    return { label: String(yr), value: String(yr) };
  });

  return (
    <>
      <DateInput
        label={label}
        value={value}
        onPress={openPicker}
        placeholder={placeholder}
        helperText={helperText}
        errorText={errorText}
        required={required}
        disabled={disabled}
        style={style}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <Pressable
            style={[
              styles.card,
              { backgroundColor: currentTheme.surface, borderColor: currentTheme.border },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.header}>
              <AppText variant="cardTitle">{label || 'Select Date'}</AppText>
              <AppText variant="bodySmall" color={currentTheme.textSecondary}>
                {formatDisplayDate(new Date(selectedYear, selectedMonth, selectedDay), 'dd MMMM yyyy')}
              </AppText>
            </View>

            <View style={styles.pickersRow}>
              <View style={styles.pickerCol}>
                <SelectField
                  label="Day"
                  value={String(Math.min(selectedDay, maxDays))}
                  options={dayOptions}
                  onValueChange={(val) => setSelectedDay(parseInt(val, 10))}
                />
              </View>

              <View style={styles.pickerCol}>
                <SelectField
                  label="Month"
                  value={String(selectedMonth)}
                  options={monthOptions}
                  onValueChange={(val) => setSelectedMonth(parseInt(val, 10))}
                />
              </View>

              <View style={styles.pickerCol}>
                <SelectField
                  label="Year"
                  value={String(selectedYear)}
                  options={yearOptions}
                  onValueChange={(val) => setSelectedYear(parseInt(val, 10))}
                />
              </View>
            </View>

            <View style={styles.actionRow}>
              <SecondaryButton
                title="Cancel"
                onPress={() => setModalVisible(false)}
                style={styles.flexBtn}
              />
              <View style={styles.btnGap} />
              <PrimaryButton
                title="Confirm Date"
                onPress={handleConfirm}
                style={styles.flexBtn}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  header: {
    marginBottom: 16,
  },
  pickersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerCol: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flexBtn: {
    flex: 1,
  },
  btnGap: {
    width: 12,
  },
});

export default DatePickerField;
