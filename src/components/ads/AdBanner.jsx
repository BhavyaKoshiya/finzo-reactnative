import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { Sparkles, Info } from 'lucide-react-native';
import AppText from '../common/AppText';
import AppIcon from '../common/AppIcon';
import { useAppTheme } from '../../hooks/useAppTheme';
import { selectIsAdFree } from '../../store/slices/rewardsSlice';
import adService from '../../services/adService';
import { AD_PLACEMENTS } from '../../services/ads/adPlacementConstants';

export const AdBanner = ({
  placementId = AD_PLACEMENTS.HOME_BANNER,
  style,
}) => {
  const { currentTheme, isDark } = useAppTheme();
  const isAdFree = useSelector(selectIsAdFree);
  const [isAvailable, setIsAvailable] = useState(false);
  const [providerType, setProviderType] = useState('no_ad');

  useEffect(() => {
    if (isAdFree) {
      setIsAvailable(false);
      return;
    }

    const available = adService.isBannerAvailable(placementId);
    const provider = adService.getProvider();
    setIsAvailable(available);
    setProviderType(provider ? provider.getType() : 'no_ad');

    if (available) {
      adService.loadBanner(placementId);
    }
  }, [placementId, isAdFree]);

  // Suppress banner if user has active ad-free entitlement or ads unavailable
  if (isAdFree || !isAvailable) {
    return null;
  }

  // Simulated provider development banner
  if (providerType === 'simulated') {
    return (
      <View
        style={[
          styles.simulatedContainer,
          {
            backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
            borderColor: isDark ? '#3B82F6' : '#BFDBFE',
          },
          style,
        ]}
        accessibilityRole="summary"
        accessibilityLabel="Simulated advertisement development banner"
      >
        <View style={styles.testTag}>
          <AppIcon icon={Sparkles} size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
          <AppText variant="caption" color="#FFFFFF" style={styles.testTagText}>
            TEST AD
          </AppText>
        </View>

        <View style={styles.contentRow}>
          <AppIcon icon={Info} size={16} color={currentTheme.primary} style={{ marginRight: 8 }} />
          <View style={styles.textColumn}>
            <AppText variant="bodyMedium" style={{ fontWeight: '700' }}>
              Simulated Advertisement
            </AppText>
            <AppText variant="caption" color={currentTheme.textSecondary}>
              Development Only — Finzo Swappable Ad Architecture
            </AppText>
          </View>
        </View>
      </View>
    );
  }

  // Standard container placeholder for future ApprovedAdProvider (AdMob / AppLovin / Unity)
  return (
    <View
      style={[
        styles.productionContainer,
        { backgroundColor: currentTheme.surface, borderColor: currentTheme.border },
        style,
      ]}
      accessibilityRole="summary"
      accessibilityLabel="Advertisement"
    />
  );
};

const styles = StyleSheet.create({
  simulatedContainer: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 12,
    overflow: 'hidden',
  },
  testTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  testTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textColumn: {
    flex: 1,
  },
  productionContainer: {
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 12,
  },
});

export default AdBanner;
