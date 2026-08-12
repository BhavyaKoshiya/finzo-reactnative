import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, Switch, Linking } from 'react-native';
import notifee from '@notifee/react-native';
import { Bell, X, Check, Calendar, Clock } from 'lucide-react-native';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import { useAppTheme } from '../../../hooks/useAppTheme';
import loanReminderService from '../services/loanReminderService';

const DUE_DAY_OPTIONS = [1, 5, 10, 15, 20, 25, 30, 31];
const DAYS_BEFORE_OPTIONS = [
  { label: '1 day before', value: 1 },
  { label: '3 days before', value: 3 },
  { label: '5 days before', value: 5 },
  { label: '7 days before', value: 7 },
];
const TIME_OPTIONS = [
  { label: '8:00 AM', value: '08:00' },
  { label: '9:00 AM', value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '6:00 PM', value: '18:00' },
  { label: '8:00 PM', value: '20:00' },
];

export const LoanReminderSettingsModal = ({
  visible,
  loan,
  onClose,
  onSave,
}) => {
  const { currentTheme } = useAppTheme();

  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [dueDay, setDueDay] = useState(5);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(3);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (loan) {
      setRemindersEnabled(loan.remindersEnabled !== undefined ? Boolean(loan.remindersEnabled) : true);
      setDueDay(loan.dueDay || 5);
      setReminderDaysBefore(loan.reminderDaysBefore || 3);
      setReminderTime(loan.reminderTime || '09:00');
    }
  }, [loan, visible]);

  const handleToggleReminders = async (val) => {
    if (val) {
      const perm = await loanReminderService.requestPermissions();
      if (!perm.authorized) {
        setPermissionDenied(true);
        setRemindersEnabled(false);
        return;
      }
      setPermissionDenied(false);
      setRemindersEnabled(true);
    } else {
      setRemindersEnabled(false);
    }
  };

  const handleOpenSettings = () => {
    try {
      if (typeof notifee?.openNotificationSettings === 'function') {
        notifee.openNotificationSettings();
      } else {
        Linking.openSettings();
      }
    } catch {
      Linking.openSettings();
    }
  };

  if (!loan) return null;

  const handleSave = () => {
    onSave({
      id: loan.id,
      remindersEnabled,
      dueDay,
      reminderDaysBefore,
      reminderTime,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: currentTheme.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleGroup}>
              <AppIcon icon={Bell} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
              <AppText variant="sectionTitle">Reminder Settings</AppText>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close settings">
              <AppIcon icon={X} size={20} color={currentTheme.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Permission Denied Warning */}
            {permissionDenied && (
              <View style={[styles.warningBanner, { backgroundColor: `${currentTheme.error || '#EF4444'}15`, borderColor: currentTheme.error || '#EF4444' }]}>
                <AppText variant="bodySmall" style={{ fontWeight: '700', color: currentTheme.error || '#EF4444', marginBottom: 4 }}>
                  Notifications are Disabled
                </AppText>
                <AppText variant="caption" color={currentTheme.textSecondary} style={{ marginBottom: 8 }}>
                  Device notification permissions are required to deliver loan reminders.
                </AppText>
                <TouchableOpacity onPress={handleOpenSettings} style={[styles.openSettingsBtn, { backgroundColor: currentTheme.primary }]}>
                  <AppText variant="caption" style={{ color: '#FFFFFF', fontWeight: '700' }}>
                    Open Device Settings
                  </AppText>
                </TouchableOpacity>
              </View>
            )}

            {/* Toggle Row */}
            <View style={[styles.toggleRow, { borderColor: currentTheme.border }]}>
              <View style={{ flex: 1 }}>
                <AppText variant="bodyMedium" style={{ fontWeight: '600' }}>
                  Payment Reminders
                </AppText>
                <AppText variant="caption" color={currentTheme.textSecondary}>
                  Receive local alerts for upcoming EMIs
                </AppText>
              </View>
              <Switch
                value={remindersEnabled}
                onValueChange={handleToggleReminders}
                trackColor={{ false: currentTheme.border, true: `${currentTheme.primary}80` }}
                thumbColor={remindersEnabled ? currentTheme.primary : currentTheme.surfaceVariant}
              />
            </View>

            {/* Section: Due Day */}
            <View style={styles.sectionGroup}>
              <View style={styles.sectionLabelRow}>
                <AppIcon icon={Calendar} size={16} color={currentTheme.textSecondary} style={{ marginRight: 6 }} />
                <AppText variant="bodySmall" style={{ fontWeight: '700' }}>
                  Monthly Due Day
                </AppText>
              </View>
              <View style={styles.chipGrid}>
                {DUE_DAY_OPTIONS.map((day) => {
                  const isSelected = dueDay === day;
                  return (
                    <TouchableOpacity
                      key={day}
                      onPress={() => setDueDay(day)}
                      activeOpacity={0.7}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? currentTheme.primary : currentTheme.surfaceVariant,
                          borderColor: isSelected ? currentTheme.primary : currentTheme.border,
                        },
                      ]}
                    >
                      <AppText
                        variant="caption"
                        color={isSelected ? '#FFFFFF' : currentTheme.textPrimary}
                        style={{ fontWeight: isSelected ? '700' : '500' }}
                      >
                        {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section: Reminder Lead Time */}
            {remindersEnabled && (
              <>
                <View style={styles.sectionGroup}>
                  <View style={styles.sectionLabelRow}>
                    <AppIcon icon={Bell} size={16} color={currentTheme.textSecondary} style={{ marginRight: 6 }} />
                    <AppText variant="bodySmall" style={{ fontWeight: '700' }}>
                      Remind Me
                    </AppText>
                  </View>
                  <View style={styles.chipRow}>
                    {DAYS_BEFORE_OPTIONS.map((opt) => {
                      const isSelected = reminderDaysBefore === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          onPress={() => setReminderDaysBefore(opt.value)}
                          activeOpacity={0.7}
                          style={[
                            styles.chipFlex,
                            {
                              backgroundColor: isSelected ? currentTheme.primary : currentTheme.surfaceVariant,
                              borderColor: isSelected ? currentTheme.primary : currentTheme.border,
                            },
                          ]}
                        >
                          <AppText
                            variant="caption"
                            color={isSelected ? '#FFFFFF' : currentTheme.textPrimary}
                            style={{ fontWeight: isSelected ? '700' : '500' }}
                          >
                            {opt.label}
                          </AppText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Section: Reminder Time */}
                <View style={styles.sectionGroup}>
                  <View style={styles.sectionLabelRow}>
                    <AppIcon icon={Clock} size={16} color={currentTheme.textSecondary} style={{ marginRight: 6 }} />
                    <AppText variant="bodySmall" style={{ fontWeight: '700' }}>
                      Reminder Time
                    </AppText>
                  </View>
                  <View style={styles.chipRow}>
                    {TIME_OPTIONS.map((opt) => {
                      const isSelected = reminderTime === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          onPress={() => setReminderTime(opt.value)}
                          activeOpacity={0.7}
                          style={[
                            styles.chipFlex,
                            {
                              backgroundColor: isSelected ? currentTheme.primary : currentTheme.surfaceVariant,
                              borderColor: isSelected ? currentTheme.primary : currentTheme.border,
                            },
                          ]}
                        >
                          <AppText
                            variant="caption"
                            color={isSelected ? '#FFFFFF' : currentTheme.textPrimary}
                            style={{ fontWeight: isSelected ? '700' : '500' }}
                          >
                            {opt.label}
                          </AppText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <PrimaryButton
              title="Save Settings"
              icon={Check}
              onPress={handleSave}
              accessibilityLabel="Save loan reminder settings"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  sectionGroup: {
    marginBottom: 16,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    width: '22%',
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
  },
  chipFlex: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
  },
  footer: {
    paddingTop: 8,
  },
  warningBanner: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  openSettingsBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
});

export default LoanReminderSettingsModal;
