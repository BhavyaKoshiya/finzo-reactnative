import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ban, X, Tag } from 'lucide-react-native';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { calculateRewardPrice } from '../utils/discountUtils';

export const RedeemRewardModal = ({
  visible,
  reward,
  currentPoints = 0,
  onConfirm,
  onClose,
}) => {
  const { currentTheme, isDark } = useAppTheme();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!reward) return null;

  const priceInfo = calculateRewardPrice(reward);
  const finalCost = priceInfo.finalPointsCost;
  const remainingPoints = Math.max(0, currentPoints - finalCost);

  const iconBg = isDark ? 'rgba(59, 130, 246, 0.2)' : currentTheme.primaryLight;
  const iconColor = isDark ? '#60A5FA' : currentTheme.primary;

  const discountTagBg = isDark ? 'rgba(34, 197, 94, 0.18)' : 'rgba(34, 197, 94, 0.12)';
  const discountTagColor = isDark ? '#4ADE80' : currentTheme.success;

  const handleConfirmRedeem = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await onConfirm(reward.id);
    } finally {
      setIsProcessing(false);
    }
  };

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
              <AppIcon icon={Ban} size={22} color={iconColor} />
            </View>
            <View style={styles.titleTextGroup}>
              <AppText variant="screenTitle" style={styles.modalTitle}>
                Redeem Reward?
              </AppText>
              <AppText variant="caption" color={currentTheme.textSecondary}>
                Unlock ad-free access using your Finzo points.
              </AppText>
            </View>
            <TouchableOpacity
              onPress={onClose}
              disabled={isProcessing}
              activeOpacity={0.7}
              accessibilityLabel="Close confirmation modal"
              style={styles.closeButton}
            >
              <AppIcon icon={X} size={20} color={currentTheme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Reward Summary Box */}
          <View
            style={[
              styles.summaryBox,
              { backgroundColor: currentTheme.background, borderColor: currentTheme.border },
            ]}
          >
            <View style={styles.summaryTitleRow}>
              <AppText variant="bodyMedium" style={styles.rewardTitle}>
                {reward.title}
              </AppText>
              {priceInfo.discountActive && (
                <View style={[styles.discountTag, { backgroundColor: discountTagBg }]}>
                  <AppIcon icon={Tag} size={10} color={discountTagColor} style={{ marginRight: 3 }} />
                  <AppText variant="caption" color={discountTagColor} style={styles.discountTagText}>
                    {priceInfo.discountLabel}
                  </AppText>
                </View>
              )}
            </View>
            <AppText variant="caption" color={currentTheme.textSecondary}>
              {reward.description}
            </AppText>
          </View>

          {/* Balance Calculation Table */}
          <View style={styles.calcTable}>
            <View style={styles.calcRow}>
              <AppText variant="bodySmall" color={currentTheme.textSecondary}>
                Current Balance
              </AppText>
              <AppText variant="bodySmall" color={currentTheme.textPrimary} style={styles.boldText}>
                {`${currentPoints} pts`}
              </AppText>
            </View>

            {priceInfo.discountActive ? (
              <>
                <View style={styles.calcRow}>
                  <AppText variant="bodySmall" color={currentTheme.textSecondary}>
                    Base Cost
                  </AppText>
                  <AppText variant="bodySmall" color={currentTheme.textMuted} style={styles.strikethroughText}>
                    {`-${priceInfo.basePointsCost} pts`}
                  </AppText>
                </View>
                <View style={styles.calcRow}>
                  <AppText variant="bodySmall" color={discountTagColor}>
                    Discount ({priceInfo.discountLabel})
                  </AppText>
                  <AppText variant="bodySmall" color={discountTagColor} style={styles.boldText}>
                    {`+${priceInfo.discountAmount} pts`}
                  </AppText>
                </View>
              </>
            ) : null}

            <View style={styles.calcRow}>
              <AppText variant="bodySmall" color={currentTheme.textSecondary}>
                Final Cost
              </AppText>
              <AppText variant="bodySmall" color={currentTheme.primary} style={styles.boldText}>
                {`-${finalCost} pts`}
              </AppText>
            </View>

            <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />

            <View style={styles.calcRow}>
              <AppText variant="bodyMedium" color={currentTheme.textPrimary} style={styles.boldText}>
                Remaining Balance
              </AppText>
              <AppText variant="bodyMedium" color={currentTheme.textPrimary} style={styles.boldText}>
                {`${remainingPoints} pts`}
              </AppText>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <SecondaryButton
              title="Cancel"
              onPress={onClose}
              disabled={isProcessing}
              style={styles.cancelBtn}
            />
            <PrimaryButton
              title={isProcessing ? 'Redeeming...' : `Redeem ${finalCost} Pts`}
              onPress={handleConfirmRedeem}
              disabled={isProcessing}
              accessibilityLabel={`Confirm redemption of ${reward.title} for ${finalCost} points`}
              style={styles.confirmBtn}
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
    marginBottom: 14,
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
  summaryBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  rewardTitle: {
    fontWeight: '700',
  },
  discountTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountTagText: {
    fontWeight: '800',
    fontSize: 10,
  },
  calcTable: {
    marginBottom: 18,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  divider: {
    height: 1,
    marginVertical: 6,
  },
  boldText: {
    fontWeight: '700',
  },
  strikethroughText: {
    textDecorationLine: 'line-through',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    marginRight: 8,
  },
  confirmBtn: {
    flex: 1.5,
  },
});

export default RedeemRewardModal;
