import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Sparkles, ExternalLink, ShieldCheck } from 'lucide-react-native';
import AppCard from '../cards/AppCard';
import AppText from '../common/AppText';
import AppIcon from '../common/AppIcon';
import { useAppTheme } from '../../hooks/useAppTheme';

/**
 * Reusable Simulated Native Ad UI Component.
 * Integrated naturally into Finzo card layouts:
 * - Badge: Sponsored / Advertisement
 * - Icon / Graphic Placeholder
 * - Headline ("Example Sponsor")
 * - Short description
 * - [ Learn More ] CTA button
 * - Easily replaceable by a future RealNativeAd provider
 */
export const SimulatedNativeAd = ({
  headline = 'Example Sponsor',
  description = 'Explore modern financial planning utilities with Finzo offline calculators.',
  callToAction = 'Learn More',
  style,
}) => {
  const { currentTheme, isDark } = useAppTheme();

  return (
    <AppCard
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
          borderColor: isDark ? '#334155' : '#E2E8F0',
        },
        style,
      ]}
      accessibilityRole="summary"
      accessibilityLabel={`Sponsored Native Advertisement. ${headline}. ${description}`}
    >
      {/* Header Row: Sponsored Badge */}
      <View style={styles.headerRow}>
        <View style={styles.badgeGroup}>
          <View style={styles.sponsoredPill}>
            <AppIcon icon={Sparkles} size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
            <AppText variant="caption" color="#FFFFFF" style={styles.badgeText}>
              SPONSORED
            </AppText>
          </View>
          <AppText variant="caption" color={currentTheme.textMuted} style={styles.adLabel}>
            Advertisement
          </AppText>
        </View>
        <AppIcon icon={ShieldCheck} size={14} color={currentTheme.textMuted} />
      </View>

      {/* Main Content Body */}
      <View style={styles.bodyRow}>
        <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE' }]}>
          <AppIcon icon={Sparkles} size={22} color={currentTheme.primary} />
        </View>

        <View style={styles.textGroup}>
          <AppText variant="bodyLarge" style={styles.headline}>
            {headline}
          </AppText>
          <AppText variant="caption" color={currentTheme.textSecondary} style={styles.description}>
            {description}
          </AppText>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={[styles.ctaButton, { backgroundColor: currentTheme.primary }]}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${callToAction} for ${headline}`}
      >
        <AppText variant="caption" color="#FFFFFF" style={styles.ctaText}>
          {callToAction}
        </AppText>
        <AppIcon icon={ExternalLink} size={12} color="#FFFFFF" style={{ marginLeft: 4 }} />
      </TouchableOpacity>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sponsoredPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  adLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textGroup: {
    flex: 1,
  },
  headline: {
    fontWeight: '700',
    fontSize: 15,
  },
  description: {
    marginTop: 2,
    lineHeight: 16,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  ctaText: {
    fontWeight: '700',
    fontSize: 12,
  },
});

export default SimulatedNativeAd;
