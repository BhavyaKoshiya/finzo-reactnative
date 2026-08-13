import React from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import AppText from '../../../components/common/AppText';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';
import AppCard from '../../../components/cards/AppCard';
import AppIcon from '../../../components/common/AppIcon';
import { AlertTriangle, ArrowRight, X } from 'lucide-react-native';
import { useAppTheme } from '../../../hooks/useAppTheme';

export const ReviewChangesModal = ({
  visible,
  onClose,
  onConfirm,
  changeSummary = [],
  isSaving = false,
}) => {
  const { currentTheme } = useAppTheme();

  if (!visible) return null;

  const materialChanges = changeSummary.filter((c) => c.isMaterial);
  const otherChanges = changeSummary.filter((c) => !c.isMaterial);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: currentTheme.surface }]}>
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: currentTheme.border }]}>
            <View style={styles.headerTitleGroup}>
              <AppIcon icon={AlertTriangle} size={22} color="#D97706" style={styles.warningIcon} />
              <AppText variant="cardTitle" style={{ fontWeight: '700' }}>
                Review Material Changes
              </AppText>
            </View>
            <TouchableOpacity
              onPress={onClose}
              disabled={isSaving}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Close change review"
            >
              <AppIcon icon={X} size={20} color={currentTheme.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
            {/* Notice Alert */}
            <View style={[styles.noticeBox, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
              <AppText variant="bodySmall" color="#92400E" style={styles.noticeText}>
                Previous payment records will remain unchanged. These updated values will be used for future projections, payoff estimates, and insights.
              </AppText>
            </View>

            {/* Material Changes List */}
            {materialChanges.length > 0 && (
              <View style={styles.section}>
                <AppText variant="sectionTitle" style={styles.sectionHeader}>
                  Financial & Term Edits ({materialChanges.length})
                </AppText>
                {materialChanges.map((item) => (
                  <View key={item.key} style={[styles.changeRow, { backgroundColor: currentTheme.surfaceSubtle || '#F8FAFC', borderColor: currentTheme.border }]}>
                    <AppText variant="bodySmall" style={{ fontWeight: '600', marginBottom: 4 }} color={currentTheme.textPrimary}>
                      {item.label}
                    </AppText>
                    <View style={styles.diffLine}>
                      <AppText variant="bodySmall" color={currentTheme.textMuted} style={styles.diffVal}>
                        {item.from}
                      </AppText>
                      <AppIcon icon={ArrowRight} size={14} color={currentTheme.primary} style={styles.arrow} />
                      <AppText variant="bodySmall" color={currentTheme.primary} style={[styles.diffVal, { fontWeight: '700' }]}>
                        {item.to}
                      </AppText>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Other Changes List */}
            {otherChanges.length > 0 && (
              <View style={styles.section}>
                <AppText variant="bodySmall" style={styles.sectionHeader} color={currentTheme.textSecondary}>
                  Other Preferences ({otherChanges.length})
                </AppText>
                {otherChanges.map((item) => (
                  <View key={item.key} style={[styles.changeRow, { backgroundColor: currentTheme.surfaceSubtle || '#F8FAFC', borderColor: currentTheme.border }]}>
                    <AppText variant="bodySmall" style={{ fontWeight: '600', marginBottom: 4 }} color={currentTheme.textPrimary}>
                      {item.label}
                    </AppText>
                    <View style={styles.diffLine}>
                      <AppText variant="bodySmall" color={currentTheme.textMuted} style={styles.diffVal}>
                        {item.from}
                      </AppText>
                      <AppIcon icon={ArrowRight} size={14} color={currentTheme.textSecondary} style={styles.arrow} />
                      <AppText variant="bodySmall" color={currentTheme.textPrimary} style={[styles.diffVal, { fontWeight: '600' }]}>
                        {item.to}
                      </AppText>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={[styles.footerRow, { borderTopColor: currentTheme.border }]}>
            <SecondaryButton
              title="Cancel"
              onPress={onClose}
              disabled={isSaving}
              style={styles.cancelBtn}
            />
            <PrimaryButton
              title={isSaving ? 'Saving...' : 'Confirm Changes'}
              onPress={onConfirm}
              disabled={isSaving}
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningIcon: {
    marginRight: 10,
  },
  scrollArea: {
    maxHeight: 380,
  },
  scrollContent: {
    padding: 18,
  },
  noticeBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  noticeText: {
    lineHeight: 18,
    fontWeight: '500',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  changeRow: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  diffLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  diffVal: {
    fontSize: 13,
  },
  arrow: {
    marginHorizontal: 8,
  },
  footerRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
  },
  confirmBtn: {
    flex: 1,
  },
});

export default ReviewChangesModal;
