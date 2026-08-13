import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Sparkles, Info } from 'lucide-react-native';
import AppText from '../common/AppText';
import AppIcon from '../common/AppIcon';
import { useAppTheme } from '../../hooks/useAppTheme';

/**
 * Reusable Simulated Banner Ad UI Component.
 * - Compact, unobtrusive (predictable height ~54px)
 * - Clearly marked "Advertisement" / "Sponsored"
 * - Responsive width, respects safe areas
 * - Easily replaceable by a future RealBannerAd provider
 */
export const SimulatedBannerAd = ({ style }) => {
  const { currentTheme, isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
          borderColor: isDark ? '#3B82F6' : '#BFDBFE',
        },
        style,
      ]}
      accessibilityRole="summary"
      accessibilityLabel="Simulated advertisement development banner"
    >
      <View style={styles.topBadgeRow}>
        <View style={styles.tagPill}>
          <AppIcon icon={Sparkles} size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
          <AppText variant="caption" color="#FFFFFF" style={styles.tagText}>
            SPONSORED
          </AppText>
        </View>
        <AppText variant="caption" color={currentTheme.textMuted} style={styles.subText}>
          Advertisement
        </AppText>
      </View>

      <View style={styles.contentRow}>
        <AppIcon icon={Info} size={16} color={currentTheme.primary} style={{ marginRight: 8 }} />
        <View style={styles.textColumn}>
          <AppText variant="bodyMedium" style={{ fontWeight: '700', fontSize: 13 }}>
            Example Sponsor — Finzo Features
          </AppText>
          <AppText variant="caption" color={currentTheme.textSecondary} style={{ fontSize: 11 }}>
            Development Simulated Ad • Finzo Swappable Ad Architecture
          </AppText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 10,
    overflow: 'hidden',
  },
  topBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subText: {
    fontSize: 10,
    fontWeight: '600',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textColumn: {
    flex: 1,
  },
});

export default SimulatedBannerAd;
