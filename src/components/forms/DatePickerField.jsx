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

  // Parse initial date
  const parsedDate = value ? new Date(value) : new Date();
  const initialYear = isNaN(parsedDate.getFullYear()) ? new Date().getFullYear() : parsedDate.getFullYear();
  const initialMonth = isNaN(parsedDate.getMonth()) ? new Date().getMonth() : parsedDate.getMonth();
  const initialDay = isNaN(parsedDate.getDate()) ? new Date().getDate() : parsedDate.getDate();

  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedDay, setSelectedDay] = useState(initialDay);

  const openPicker = () => {
    const d = value ? new Date(value) : new Date();
    if (!isNaN(d.getTime())) {
      setSelectedYear(d.getFullYear());
      setSelectedMonth(d.getMonth());
      setSelectedDay(d.getDate());
    }
    setModalVisible(true);
  };

  const handleConfirm = () => {
    setModalVisible(false);
    const d = new Date(selectedYear, selectedMonth, selectedDay);
    const isoDate = d.toISOString().split('T')[0];
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
