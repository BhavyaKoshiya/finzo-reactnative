import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Star, Trash2, Calculator } from 'lucide-react-native';
import { format } from 'date-fns';
import AppCard from '../../../components/cards/AppCard';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { getCalculatorById } from '../../../calculators';
import { getSavedCalculationPrimaryResult } from '../utils/savedCalculationAdapters';

export const SavedCalculationCard = ({
  item,
  onPress,
  onToggleFavorite,
  onDelete,
  style,
}) => {
  const { currentTheme } = useAppTheme();
  const calcMetadata = getCalculatorById(item.calculatorId);
  const IconComponent = calcMetadata?.icon || Calculator;
  const calcName = calcMetadata?.name || 'Calculator';

  const { primaryValue, primaryLabel } = getSavedCalculationPrimaryResult(item);

  const formattedDate = item.updatedAt || item.savedAt
    ? format(new Date(item.updatedAt || item.savedAt), 'MMM d, yyyy')
    : '';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Open saved calculation ${item.title || calcName}`}
      style={[styles.touchable, style]}
    >
      <AppCard style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.iconTitleGroup}>
            <View style={[styles.iconBox, { backgroundColor: `${currentTheme.primary}12` }]}>
              <AppIcon icon={IconComponent} size={20} color={currentTheme.primary} />
            </View>
            <View style={styles.titleTextGroup}>
              <AppText variant="cardTitle" numberOfLines={1}>
                {item.title || calcName}
              </AppText>
              <AppText variant="caption" color={currentTheme.textSecondary} numberOfLines={1}>
                {calcName}
              </AppText>
            </View>
          </View>

          <View style={styles.actionsGroup}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onToggleFavorite(item.id);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              style={styles.actionBtn}
            >
              <AppIcon
                icon={Star}
                size={18}
                color={item.isFavorite ? '#F59E0B' : currentTheme.textMuted}
                fill={item.isFavorite ? '#F59E0B' : 'transparent'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Delete saved calculation"
              style={styles.actionBtn}
            >
              <AppIcon icon={Trash2} size={18} color={currentTheme.error} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />

        <View style={styles.bottomRow}>
          <View style={styles.resultGroup}>
            <AppText variant="caption" color={currentTheme.textSecondary}>
              {primaryLabel}
            </AppText>
            <AppText variant="currencyMedium" color={currentTheme.primary} style={styles.primaryValueText}>
              {primaryValue}
            </AppText>
          </View>

          {formattedDate !== '' && (
            <AppText variant="caption" color={currentTheme.textMuted}>
              Saved {formattedDate}
            </AppText>
          )}
        </View>
      </AppCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
    marginBottom: 14,
  },
  card: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleTextGroup: {
    flex: 1,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    padding: 6,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  resultGroup: {
    flex: 1,
  },
  primaryValueText: {
    marginTop: 2,
    fontWeight: '700',
  },
});

export default SavedCalculationCard;
