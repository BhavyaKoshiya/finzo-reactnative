import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  TextInput,
} from 'react-native';
import { Bookmark, Check, Plus } from 'lucide-react-native';
import AppText from '../common/AppText';
import AppIcon from '../common/AppIcon';
import PrimaryButton from '../buttons/PrimaryButton';
import SecondaryButton from '../buttons/SecondaryButton';
import { useAppTheme } from '../../hooks/useAppTheme';

export const SaveModal = ({
  visible,
  defaultTitle = '',
  isEditing = false,
  existingTitle = '',
  onClose,
  onSave,
}) => {
  const { currentTheme } = useAppTheme();
  const [title, setTitle] = useState(defaultTitle);
  const [saveMode, setSaveMode] = useState(isEditing ? 'update' : 'new'); // 'update' | 'new'

  useEffect(() => {
    if (visible) {
      setTitle(isEditing && existingTitle ? existingTitle : defaultTitle);
      setSaveMode(isEditing ? 'update' : 'new');
    }
  }, [visible, defaultTitle, isEditing, existingTitle]);

  const handleConfirmSave = () => {
    const finalTitle = title.trim().length > 0 ? title.trim() : defaultTitle;
    onSave({
      title: finalTitle,
      saveMode,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[
            styles.modalCard,
            { backgroundColor: currentTheme.surface, borderColor: currentTheme.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <View style={[styles.iconWrapper, { backgroundColor: `${currentTheme.primary}15` }]}>
              <AppIcon icon={Bookmark} size={22} color={currentTheme.primary} />
            </View>
            <AppText variant="cardTitle">
              {isEditing ? 'Save Calculation' : 'Save Calculation'}
            </AppText>
          </View>

          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.subtitle}>
            Enter a title to save this calculation snapshot to your Saved tab.
          </AppText>

          <View style={styles.inputContainer}>
            <AppText variant="resultLabel" style={styles.inputLabel}>
              Calculation Title
            </AppText>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. My Home Loan"
              placeholderTextColor={currentTheme.textMuted}
              maxLength={60}
              autoFocus
              style={[
                styles.textInput,
                {
                  color: currentTheme.textPrimary,
                  borderColor: currentTheme.border,
                  backgroundColor: currentTheme.background,
                },
              ]}
            />
          </View>

          {isEditing && (
            <View style={styles.modeOptionGroup}>
              <AppText variant="caption" color={currentTheme.textSecondary} style={styles.inputLabel}>
                Save Mode
              </AppText>
              <View style={styles.modeButtonsRow}>
                <TouchableOpacity
                  onPress={() => setSaveMode('update')}
                  activeOpacity={0.7}
                  style={[
                    styles.modeButton,
                    {
                      backgroundColor: saveMode === 'update' ? currentTheme.primary : currentTheme.background,
                      borderColor: saveMode === 'update' ? currentTheme.primary : currentTheme.border,
                    },
                  ]}
                >
                  <AppIcon
                    icon={Check}
                    size={16}
                    color={saveMode === 'update' ? '#FFFFFF' : currentTheme.textSecondary}
                  />
                  <AppText
                    variant="caption"
                    color={saveMode === 'update' ? '#FFFFFF' : currentTheme.textPrimary}
                    style={styles.modeButtonText}
                  >
                    Update Existing
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSaveMode('new')}
                  activeOpacity={0.7}
                  style={[
                    styles.modeButton,
                    {
                      backgroundColor: saveMode === 'new' ? currentTheme.primary : currentTheme.background,
                      borderColor: saveMode === 'new' ? currentTheme.primary : currentTheme.border,
                    },
                  ]}
                >
                  <AppIcon
                    icon={Plus}
                    size={16}
                    color={saveMode === 'new' ? '#FFFFFF' : currentTheme.textSecondary}
                  />
                  <AppText
                    variant="caption"
                    color={saveMode === 'new' ? '#FFFFFF' : currentTheme.textPrimary}
                    style={styles.modeButtonText}
                  >
                    Save as New
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.actionsRow}>
            <SecondaryButton
              title="Cancel"
              onPress={onClose}
              style={styles.cancelBtn}
            />
            <PrimaryButton
              title={saveMode === 'update' ? 'Update' : 'Save'}
              onPress={handleConfirmSave}
              style={styles.saveBtn}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subtitle: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 6,
  },
  textInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '500',
  },
  modeOptionGroup: {
    marginBottom: 16,
  },
  modeButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  modeButtonText: {
    marginLeft: 6,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    marginRight: 8,
  },
  saveBtn: {
    flex: 1.5,
  },
});

export default SaveModal;
