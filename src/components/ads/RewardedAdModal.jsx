import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Sparkles, X, CheckCircle2, PlayCircle } from 'lucide-react-native';
import AppText from '../common/AppText';
import AppIcon from '../common/AppIcon';
import PrimaryButton from '../buttons/PrimaryButton';
import SecondaryButton from '../buttons/SecondaryButton';
import { useAppTheme } from '../../hooks/useAppTheme';

export const RewardedAdModal = ({
  visible,
  onComplete,
  onCancel,
  countdownSeconds = 5,
}) => {
  const { currentTheme, isDark } = useAppTheme();
  const [timeLeft, setTimeLeft] = useState(countdownSeconds);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!visible) {
      setTimeLeft(countdownSeconds);
      setIsFinished(false);
      return;
    }

    setTimeLeft(countdownSeconds);
    setIsFinished(false);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, countdownSeconds]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
          {/* Top Banner */}
          <View style={styles.headerRow}>
            <View style={styles.testBadge}>
              <AppIcon icon={Sparkles} size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
              <AppText variant="caption" color="#FFFFFF" style={{ fontWeight: '800', fontSize: 10 }}>
                TEST AD — DEVELOPMENT ONLY
              </AppText>
            </View>

            <TouchableOpacity
              onPress={onCancel}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Close advertisement"
            >
              <AppIcon icon={X} size={20} color={currentTheme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Ad Canvas simulation */}
          <View style={[styles.adCanvas, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
            <AppIcon icon={PlayCircle} size={48} color={currentTheme.primary} style={{ marginBottom: 12 }} />
            <AppText variant="titleMedium" style={{ fontWeight: '800', textAlign: 'center', marginBottom: 4 }}>
              Finzo Simulated Rewarded Ad
            </AppText>
            <AppText variant="caption" color={currentTheme.textSecondary} style={{ textAlign: 'center' }}>
              Experience safe, provider-agnostic ad rewards during local development.
            </AppText>

            {/* Countdown Badge */}
            <View style={styles.countdownBadge}>
              {isFinished ? (
                <AppText variant="bodyMedium" color={currentTheme.success} style={{ fontWeight: '800' }}>
                  ✓ Video Complete!
                </AppText>
              ) : (
                <AppText variant="bodyMedium" color={currentTheme.primary} style={{ fontWeight: '800' }}>
                  Reward in {timeLeft}s
                </AppText>
              )}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            {isFinished ? (
              <PrimaryButton
                title="Claim Reward"
                icon={CheckCircle2}
                onPress={onComplete}
                style={{ flex: 1 }}
              />
            ) : (
              <SecondaryButton
                title="Cancel Video"
                onPress={onCancel}
                style={{ flex: 1 }}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  testBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  adCanvas: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  countdownBadge: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
  },
  actionRow: {
    flexDirection: 'row',
  },
});

export default RewardedAdModal;
