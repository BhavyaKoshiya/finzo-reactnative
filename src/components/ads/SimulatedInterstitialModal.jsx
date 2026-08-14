import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { X, Sparkles, ShieldCheck } from 'lucide-react-native';
import AppText from '../common/AppText';
import AppIcon from '../common/AppIcon';
import PrimaryButton from '../buttons/PrimaryButton';
import { useAppTheme } from '../../hooks/useAppTheme';
import adService from '../../services/adService';

/**
 * Reusable Simulated Interstitial Full-Screen Ad Modal.
 * - Clear Advertisement label
 * - Close button control
 * - Deterministic completion callback for tests/UI
 * - Easily replaceable by a future RealInterstitialAd provider
 */
export const SimulatedInterstitialModal = () => {
  const { currentTheme, isDark } = useAppTheme();
  const [visible, setVisible] = useState(false);
  const [activePlacement, setActivePlacement] = useState(null);
  const [currentResolver, setCurrentResolver] = useState(null);

  useEffect(() => {
    // Register interstitial modal handler with adService
    adService.setInterstitialModalHandler(({ placementId }) => {
      return new Promise((resolve) => {
        setActivePlacement(placementId);
        setCurrentResolver(() => resolve);
        setVisible(true);
      });
    });

    return () => {
      adService.setInterstitialModalHandler(null);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    if (currentResolver) {
      currentResolver({ completed: true, placementId: activePlacement });
      setCurrentResolver(null);
    }
  };

  if (!visible || (typeof __DEV__ !== 'undefined' && __DEV__ === false)) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <View style={styles.badgePill}>
              <AppIcon icon={Sparkles} size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
              <AppText variant="caption" color="#FFFFFF" style={styles.badgeText}>
                SPONSORED
              </AppText>
            </View>
            <AppText variant="caption" color={currentTheme.textSecondary} style={{ fontWeight: '600' }}>
              Advertisement
            </AppText>
          </View>

          <TouchableOpacity
            onPress={handleClose}
            style={[styles.closeButton, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Close Advertisement"
          >
            <AppIcon icon={X} size={18} color={currentTheme.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Center Simulated Creative */}
        <View style={styles.creativeBody}>
          <View style={[styles.creativeIconBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE' }]}>
            <AppIcon icon={Sparkles} size={48} color={currentTheme.primary} />
          </View>

          <AppText variant="h2" style={styles.headline}>
            Example Sponsor
          </AppText>

          <AppText variant="bodyLarge" color={currentTheme.textSecondary} style={styles.subtext}>
            Simulated Interstitial Creative — Finzo Swappable Ad Architecture
          </AppText>

          <View style={styles.featuresBox}>
            <View style={styles.featureItem}>
              <AppIcon icon={ShieldCheck} size={16} color={currentTheme.primary} style={{ marginRight: 8 }} />
              <AppText variant="bodySmall" color={currentTheme.textPrimary}>
                Development simulation testing
              </AppText>
            </View>
            <View style={styles.featureItem}>
              <AppIcon icon={ShieldCheck} size={16} color={currentTheme.primary} style={{ marginRight: 8 }} />
              <AppText variant="bodySmall" color={currentTheme.textPrimary}>
                Frequency capped & non-intrusive
              </AppText>
            </View>
          </View>
        </View>

        {/* Bottom CTA & Dismiss Button */}
        <View style={styles.bottomBar}>
          <PrimaryButton
            title="Close Ad"
            onPress={handleClose}
            style={styles.actionBtn}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    justifyContent: 'space-between',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creativeBody: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  creativeIconBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headline: {
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtext: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  featuresBox: {
    width: '100%',
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomBar: {
    width: '100%',
  },
  actionBtn: {
    width: '100%',
  },
});

export default SimulatedInterstitialModal;
