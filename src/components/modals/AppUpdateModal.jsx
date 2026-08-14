import React, { useEffect } from 'react';
import { View, StyleSheet, Modal, BackHandler, TouchableOpacity } from 'react-native';
import { DownloadCloud, Sparkles } from 'lucide-react-native';
import AppCard from '../cards/AppCard';
import AppText from '../common/AppText';
import AppIcon from '../common/AppIcon';
import PrimaryButton from '../buttons/PrimaryButton';
import SecondaryButton from '../buttons/SecondaryButton';
import { useAppTheme } from '../../hooks/useAppTheme';
import appStoreService from '../../services/appStoreService';
import appUpdateService from '../../services/appUpdateService';

/**
 * App Update Modal.
 * Renders Mandatory or Optional update dialogs based on remote version policy.
 *
 * MANDATORY UPDATE INVARIANTS:
 * - Non-dismissible: No close button, no backdrop dismissal.
 * - Hardware Back Blocking: Android hardware back cannot bypass.
 * - Navigation Blocking: The user cannot access application features until updated.
 */
export const AppUpdateModal = ({
  visible = false,
  updateInfo,
  onClose,
}) => {
  const { currentTheme } = useAppTheme();

  const isMandatory = updateInfo?.isMandatory;
  const isOptional = updateInfo?.isOptional;

  // Intercept Android hardware back button when mandatory update is active
  useEffect(() => {
    if (!visible || !isMandatory) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Return true to prevent default back action
      return true;
    });

    return () => backHandler.remove();
  }, [visible, isMandatory]);

  if (!visible || (!isMandatory && !isOptional)) {
    return null;
  }

  const handleUpdateNow = async () => {
    await appStoreService.openStore();
  };

  const handleNotNow = () => {
    appUpdateService.dismissOptionalUpdate();
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={isMandatory ? () => {} : handleNotNow}
    >
      <View style={styles.overlay}>
        <AppCard style={[styles.card, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
          {/* Header Icon */}
          <View style={[styles.iconCircle, { backgroundColor: `${currentTheme.primary}1A` }]}>
            <AppIcon
              icon={isMandatory ? DownloadCloud : Sparkles}
              size={36}
              color={currentTheme.primary}
            />
          </View>

          {/* Title & Version Info */}
          <AppText variant="h3" style={styles.title} numberOfLines={2}>
            {updateInfo?.title || (isMandatory ? 'Update Finzo' : 'Update Available')}
          </AppText>

          <AppText variant="caption" color={currentTheme.textSecondary} style={styles.versionSubtext}>
            Installed: v{updateInfo?.installedVersion} • Latest: v{updateInfo?.latestVersion}
          </AppText>

          {/* Message */}
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.message}>
            {updateInfo?.message || (
              isMandatory
                ? 'A newer version of Finzo is required to continue using the application.'
                : 'A newer version of Finzo is available with improvements and optimizations.'
            )}
          </AppText>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <PrimaryButton
              title="Update Now"
              icon={DownloadCloud}
              onPress={handleUpdateNow}
              accessibilityLabel="Update Finzo now"
              style={styles.primaryBtn}
            />

            {!isMandatory && (
              <SecondaryButton
                title="Not Now"
                onPress={handleNotNow}
                accessibilityLabel="Dismiss update notice"
                style={styles.secondaryBtn}
              />
            )}
          </View>
        </AppCard>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    padding: 24,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '800',
  },
  versionSubtext: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  message: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  actionsContainer: {
    width: '100%',
    gap: 10,
  },
  primaryBtn: {
    width: '100%',
  },
  secondaryBtn: {
    width: '100%',
  },
});

export default AppUpdateModal;
