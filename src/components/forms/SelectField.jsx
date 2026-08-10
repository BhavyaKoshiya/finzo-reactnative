import React, { useState } from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import FormField from './FormField';
import AppText from '../common/AppText';
import AppIcon from '../common/AppIcon';
import { useAppTheme } from '../../hooks/useAppTheme';

export const SelectField = ({
  label,
  value,
  options = [],
  onSelect,
  onValueChange,
  placeholder = 'Select option',
  helperText,
  errorText,
  required = false,
  disabled = false,
  style,
}) => {
  const { currentTheme } = useAppTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectOption = (optValue) => {
    setModalVisible(false);
    if (onValueChange) onValueChange(optValue);
    if (onSelect) onSelect(optValue);
  };

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const chevron = (
    <AppIcon icon={ChevronDown} size={20} color={currentTheme.textSecondary} />
  );

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label || 'Select option'}
      >
        <FormField
          label={label}
          helperText={helperText}
          errorText={errorText}
          required={required}
          trailingContent={chevron}
          style={style}
        >
          <View style={styles.content}>
            <AppText
              variant="input"
              color={selectedOption ? currentTheme.textPrimary : currentTheme.textMuted}
              numberOfLines={1}
            >
              {displayLabel}
            </AppText>
          </View>
        </FormField>
      </TouchableOpacity>

      {/* Option Picker Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={[
              styles.modalCard,
              { backgroundColor: currentTheme.surface, borderColor: currentTheme.border },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <AppText variant="cardTitle">{label || 'Select Option'}</AppText>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item, index }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    onPress={() => handleSelectOption(item.value)}
                    activeOpacity={0.7}
                    style={[
                      styles.optionRow,
                      index < options.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: currentTheme.border,
                      },
                    ]}
                  >
                    <AppText
                      variant="bodyMedium"
                      color={isSelected ? currentTheme.primary : currentTheme.textPrimary}
                      style={isSelected && styles.selectedText}
                    >
                      {item.label}
                    </AppText>
                    {isSelected && (
                      <AppIcon icon={Check} size={18} color={currentTheme.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
    borderWidth: 1,
  },
  modalHeader: {
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  selectedText: {
    fontWeight: '700',
  },
});

export default SelectField;
