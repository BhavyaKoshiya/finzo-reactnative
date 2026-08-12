import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { ShieldCheck, HardDrive, UserX, Share2, X } from 'lucide-react-native';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import { useAppTheme } from '../../../hooks/useAppTheme';

export const PrivacyInfoModal = ({ visible, onClose }) => {
  const { currentTheme, isDark } = useAppTheme();

  const iconBg = isDark ? 'rgba(34, 197, 94, 0.2)' : currentTheme.successLight;
  const iconColor = isDark ? '#4ADE80' : currentTheme.success;

  const points = [
    {
      icon: ShieldCheck,
      title: 'Local Calculations',
      description: 'All financial formulas and calculation engines run entirely on your device.',
    },
    {
      icon: HardDrive,
      title: 'Device Persistence',
      description: 'Saved snapshots and preferences are stored locally on your device storage.',
    },
    {
      icon: UserX,
      title: 'No Account Required',
      description: 'Full access to financial tools without sign-in, authentication, or personal accounts.',
    },
    {
      icon: Share2,
      title: 'User-Initiated Sharing',
      description: 'PDF generation and text sharing only occur when explicitly triggered by you.',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: currentTheme.surface,
              borderColor: currentTheme.border,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={[styles.titleIconBox, { backgroundColor: iconBg }]}>
              <AppIcon icon={ShieldCheck} size={22} color={iconColor} />
            </View>
            <View style={styles.titleTextGroup}>
              <AppText variant="screenTitle" style={styles.modalTitle}>
                Privacy & Data
              </AppText>
              <AppText variant="caption" color={currentTheme.textSecondary}>
                Finzo is designed to keep your financial data on your device.
              </AppText>
            </View>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              accessibilityLabel="Close privacy information modal"
              style={styles.closeButton}
            >
              <AppIcon icon={X} size={20} color={currentTheme.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.pointsList}>
            {points.map((item, idx) => (
              <View key={idx} style={styles.pointRow}>
                <View style={[styles.pointIconBox, { backgroundColor: `${currentTheme.primary}14` }]}>
                  <AppIcon icon={item.icon} size={18} color={currentTheme.primary} />
                </View>
                <View style={styles.pointTextGroup}>
                  <AppText variant="bodyMedium" color={currentTheme.textPrimary} style={styles.pointTitle}>
                    {item.title}
                  </AppText>
                  <AppText variant="caption" color={currentTheme.textSecondary}>
                    {item.description}
                  </AppText>
                </View>
              </View>
            ))}
          </View>

          <PrimaryButton
            title="Got it"
            onPress={onClose}
            style={styles.closeBtn}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleTextGroup: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    lineHeight: 22,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  pointsList: {
    marginVertical: 8,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  pointIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  pointTextGroup: {
    flex: 1,
  },
  pointTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  closeBtn: {
    marginTop: 8,
  },
});

export default PrivacyInfoModal;
