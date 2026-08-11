import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { FileText, CheckCircle2, X } from 'lucide-react-native';
import AppCard from '../../../components/cards/AppCard';
import AppText from '../../../components/common/AppText';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';
import AppIcon from '../../../components/common/AppIcon';
import { useAppTheme } from '../../../hooks/useAppTheme';

export const ExportPdfModal = ({
  visible,
  onClose,
  onExport,
  isGenerating = false,
}) => {
  const { currentTheme } = useAppTheme();
  const [selectedMode, setSelectedMode] = useState('quick'); // 'quick' | 'detailed'

  const handleExportConfirm = () => {
    onExport(selectedMode);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <AppCard style={styles.modalCard}>
          <View style={styles.headerRow}>
            <View style={styles.titleGroup}>
              <AppIcon icon={FileText} size={22} color={currentTheme.primary} />
              <AppText variant="h3" style={styles.headerTitle}>
                Export PDF Report
              </AppText>
            </View>
            <TouchableOpacity
              onPress={onClose}
              disabled={isGenerating}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppIcon icon={X} size={20} color={currentTheme.textMuted} />
            </TouchableOpacity>
          </View>

          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.description}>
            Select the report detail level for your PDF document.
          </AppText>

          {/* Quick PDF Option */}
          <TouchableOpacity
            onPress={() => setSelectedMode('quick')}
            disabled={isGenerating}
            activeOpacity={0.7}
            style={[
              styles.optionCard,
              {
                borderColor: selectedMode === 'quick' ? currentTheme.primary : currentTheme.border,
                backgroundColor: selectedMode === 'quick' ? currentTheme.primaryLight : currentTheme.surface,
              },
            ]}
          >
            <View style={styles.optionHeader}>
              <View style={styles.optionTitleRow}>
                <AppText variant="cardTitle" color={selectedMode === 'quick' ? currentTheme.primary : currentTheme.textPrimary}>
                  Quick PDF
                </AppText>
                <View style={styles.chip}>
                  <AppText variant="caption" color={currentTheme.primary}>1 Page A4</AppText>
                </View>
              </View>
              {selectedMode === 'quick' && (
                <AppIcon icon={CheckCircle2} size={18} color={currentTheme.primary} />
              )}
            </View>
            <AppText variant="caption" color={currentTheme.textSecondary} style={styles.optionSub}>
              Concise summary containing key inputs, primary result, and essential metrics.
            </AppText>
          </TouchableOpacity>

          {/* Detailed PDF Option */}
          <TouchableOpacity
            onPress={() => setSelectedMode('detailed')}
            disabled={isGenerating}
            activeOpacity={0.7}
            style={[
              styles.optionCard,
              {
                borderColor: selectedMode === 'detailed' ? currentTheme.primary : currentTheme.border,
                backgroundColor: selectedMode === 'detailed' ? currentTheme.primaryLight : currentTheme.surface,
              },
            ]}
          >
            <View style={styles.optionHeader}>
              <View style={styles.optionTitleRow}>
                <AppText variant="cardTitle" color={selectedMode === 'detailed' ? currentTheme.primary : currentTheme.textPrimary}>
                  Detailed PDF
                </AppText>
                <View style={styles.chip}>
                  <AppText variant="caption" color={currentTheme.primary}>Full Report</AppText>
                </View>
              </View>
              {selectedMode === 'detailed' && (
                <AppIcon icon={CheckCircle2} size={18} color={currentTheme.primary} />
              )}
            </View>
            <AppText variant="caption" color={currentTheme.textSecondary} style={styles.optionSub}>
              Complete report with full amortization schedules, year-by-year projections, and tax breakdowns.
            </AppText>
          </TouchableOpacity>

          <View style={styles.actionsRow}>
            <SecondaryButton
              title="Cancel"
              onPress={onClose}
              disabled={isGenerating}
              style={styles.actionButton}
            />
            <PrimaryButton
              title={isGenerating ? 'Generating...' : 'Export PDF'}
              onPress={handleExportConfirm}
              disabled={isGenerating}
              style={styles.actionButton}
            />
          </View>
        </AppCard>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    marginLeft: 10,
  },
  description: {
    marginBottom: 16,
  },
  optionCard: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  optionSub: {
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});

export default ExportPdfModal;
