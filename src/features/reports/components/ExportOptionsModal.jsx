import React, { useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import AppText from '../../../components/common/AppText';
import AppCard from '../../../components/cards/AppCard';
import AppIcon from '../../../components/common/AppIcon';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';
import { FileText, ReceiptText, LineChart, X, AlertCircle } from 'lucide-react-native';
import { useAppTheme } from '../../../hooks/useAppTheme';

export const ExportOptionsModal = ({
  visible,
  onClose,
  onExport,
  loanName = 'Loan Account',
}) => {
  const { currentTheme } = useAppTheme();
  const [selectedType, setSelectedType] = useState('summary');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const reportOptions = [
    {
      id: 'summary',
      title: 'Loan Summary Report',
      subtitle: 'Key configuration, current balance, and interest terms.',
      icon: FileText,
    },
    {
      id: 'statement',
      title: 'Full Loan Statement',
      subtitle: 'Complete transaction ledger, prepayments, and balance history.',
      icon: ReceiptText,
    },
    {
      id: 'insights',
      title: 'Loan Insights Report',
      subtitle: 'Payoff progress, interest avoided, remaining tenure & projections.',
      icon: LineChart,
    },
  ];

  const handleConfirmExport = async () => {
    setErrorMessage(null);
    setIsGenerating(true);

    try {
      if (onExport) {
        await onExport(selectedType);
      }
      setIsGenerating(false);
      onClose();
    } catch (err) {
      setIsGenerating(false);
      setErrorMessage(err.message || "Couldn't create the PDF. Please try again.");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.cardContainer,
            { backgroundColor: currentTheme.surface, borderColor: currentTheme.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <AppText variant="cardTitle" style={styles.modalTitle}>
                Export Report
              </AppText>
              <AppText variant="caption" color={currentTheme.textSecondary}>
                {loanName}
              </AppText>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} disabled={isGenerating}>
              <AppIcon icon={X} size={20} color={currentTheme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Error Banner */}
          {errorMessage && (
            <View style={[styles.errorBanner, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <AppIcon icon={AlertCircle} size={16} color={currentTheme.error || '#EF4444'} style={{ marginRight: 8 }} />
              <AppText variant="caption" color={currentTheme.error || '#EF4444'} style={{ flex: 1 }}>
                {errorMessage}
              </AppText>
            </View>
          )}

          {/* Options List */}
          <View style={styles.optionsList}>
            {reportOptions.map((opt) => {
              const isSelected = selectedType === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => setSelectedType(opt.id)}
                  activeOpacity={0.7}
                  disabled={isGenerating}
                  style={[
                    styles.optionItem,
                    {
                      borderColor: isSelected ? currentTheme.primary : currentTheme.border,
                      backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.05)' : currentTheme.card,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.1)' : 'rgba(0, 0, 0, 0.04)' },
                    ]}
                  >
                    <AppIcon icon={opt.icon} size={18} color={isSelected ? currentTheme.primary : currentTheme.textSecondary} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <AppText
                      variant="bodyMedium"
                      style={{ fontWeight: '700', color: isSelected ? currentTheme.primary : currentTheme.textPrimary }}
                    >
                      {opt.title}
                    </AppText>
                    <AppText variant="caption" color={currentTheme.textSecondary} style={{ marginTop: 2 }}>
                      {opt.subtitle}
                    </AppText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Footer Actions */}
          <View style={styles.actionRow}>
            <SecondaryButton
              title="Cancel"
              onPress={onClose}
              disabled={isGenerating}
              style={styles.flexBtn}
            />
            <View style={styles.gap} />
            <PrimaryButton
              title={isGenerating ? 'Preparing...' : 'Export & Share'}
              onPress={handleConfirmExport}
              disabled={isGenerating}
              style={styles.flexBtn}
            />
          </View>

          {isGenerating && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color={currentTheme.primary} style={{ marginBottom: 6 }} />
              <AppText variant="caption" color={currentTheme.primary} style={{ fontWeight: '600' }}>
                Preparing your report...
              </AppText>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  cardContainer: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  optionsList: {
    gap: 10,
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
  },
  flexBtn: {
    flex: 1,
  },
  gap: {
    width: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
});

export default ExportOptionsModal;
