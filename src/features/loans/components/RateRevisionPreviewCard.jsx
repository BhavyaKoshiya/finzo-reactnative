import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Percent, ChevronRight, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react-native';
import AppCard from '../../../components/cards/AppCard';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { formatDateForDisplay } from '../../../utils/dateUtils';

export const RateRevisionPreviewCard = ({
  loan,
  revisions = [],
  onViewRevisions,
  onLogRevision,
  style,
}) => {
  const { currentTheme } = useAppTheme();

  const revisionCount = revisions.length;
  const latestRevision = revisions[0] || null;
  const currentRate = Number(loan?.annualInterestRate) || 0;
  const isFloating = loan?.rateType !== 'fixed';

  let deltaText = null;
  let isRateHike = false;
  let isRateDrop = false;

  if (latestRevision) {
    const diff = Number(latestRevision.newRate) - Number(latestRevision.previousRate);
    if (diff > 0) {
      isRateHike = true;
      deltaText = `+${diff.toFixed(2)}%`;
    } else if (diff < 0) {
      isRateDrop = true;
      deltaText = `${diff.toFixed(2)}%`;
    }
  }

  const handlePress = () => {
    if (revisionCount > 0 && onViewRevisions) {
      onViewRevisions();
    } else if (onLogRevision) {
      onLogRevision();
    }
  };

  return (
    <AppCard style={[styles.card, style]}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={
          revisionCount > 0
            ? `View ${revisionCount} interest rate revisions. Current rate: ${currentRate}%`
            : 'Log interest rate revision'
        }
        style={styles.contentRow}
      >
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: isRateHike
                ? '#EF444415'
                : isRateDrop
                ? '#10B98115'
                : `${currentTheme.primary}18`,
            },
          ]}
        >
          <AppIcon
            icon={isRateHike ? TrendingUp : isRateDrop ? TrendingDown : Percent}
            size={20}
            color={
              isRateHike
                ? '#EF4444'
                : isRateDrop
                ? '#10B981'
                : currentTheme.primary
            }
          />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <AppText variant="bodyMedium" style={{ fontWeight: '700' }}>
              Interest Rate: {currentRate}%
            </AppText>
            {deltaText && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: isRateHike ? '#EF444420' : '#10B98120' },
                ]}
              >
                <AppText
                  variant="caption"
                  style={{
                    color: isRateHike ? '#EF4444' : '#10B981',
                    fontWeight: '700',
                    fontSize: 11,
                  }}
                >
                  {deltaText}
                </AppText>
              </View>
            )}
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isFloating ? `${currentTheme.primary}15` : `${currentTheme.card}80`,
                  marginLeft: deltaText ? 4 : 8,
                },
              ]}
            >
              <AppText
                variant="caption"
                style={{
                  color: isFloating ? currentTheme.primary : currentTheme.textSecondary,
                  fontWeight: '600',
                  fontSize: 10,
                }}
              >
                {isFloating ? 'Floating' : 'Fixed'}
              </AppText>
            </View>
          </View>

          {revisionCount > 0 ? (
            <AppText variant="caption" color={currentTheme.textSecondary}>
              {revisionCount} revision{revisionCount > 1 ? 's' : ''} logged • Last on{' '}
              {formatDateForDisplay(latestRevision.effectiveDate)}
            </AppText>
          ) : (
            <AppText variant="caption" color={currentTheme.textMuted}>
              {isFloating
                ? 'Track repo rate & EBLR revisions as bank notifies you'
                : 'Fixed interest rate loan'}
            </AppText>
          )}
        </View>

        <View style={styles.actionRight}>
          <AppText
            variant="caption"
            color={currentTheme.primary}
            style={{ fontWeight: '700', marginRight: 4 }}
          >
            {revisionCount > 0 ? 'History' : 'Log Revision'}
          </AppText>
          <AppIcon icon={ChevronRight} size={16} color={currentTheme.primary} />
        </View>
      </TouchableOpacity>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginBottom: 16,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  actionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default RateRevisionPreviewCard;
