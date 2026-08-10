import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import AppCard from '../../../../components/cards/AppCard';
import AppText from '../../../../components/common/AppText';
import AppIcon from '../../../../components/common/AppIcon';
import AmortizationRow from './AmortizationRow';
import { getYearlyAmortizationSummary } from '../utils/emiAdapters';
import { useAppTheme } from '../../../../hooks/useAppTheme';

export const AmortizationSection = ({
  schedule = [],
  isExpanded,
  onToggleExpand,
  viewMode = 'monthly',
  onToggleViewMode,
  onViewModeChange,
  style,
}) => {
  const { currentTheme } = useAppTheme();

  const handleModeChange = onViewModeChange || onToggleViewMode || (() => {});

  const yearlySchedule = useMemo(() => {
    return getYearlyAmortizationSummary(schedule);
  }, [schedule]);

  const displayData = viewMode === 'yearly' ? yearlySchedule : schedule;

  const renderItem = ({ item, index }) => (
    <AmortizationRow
      item={item}
      isYearly={viewMode === 'yearly'}
      isLast={index === displayData.length - 1}
    />
  );

  const keyExtractor = (item) =>
    viewMode === 'yearly' ? `year-${item.year}` : `month-${item.month}`;

  return (
    <AppCard style={[styles.card, style]}>
      {/* Header Toggle */}
      <TouchableOpacity
        onPress={onToggleExpand}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Toggle Amortization Schedule"
        style={styles.headerPressable}
      >
        <View style={styles.headerTitleGroup}>
          <AppText variant="cardTitle">Amortization Schedule</AppText>
          <AppText variant="caption" color={currentTheme.textSecondary}>
            {schedule.length} payments schedule
          </AppText>
        </View>
        <AppIcon
          icon={isExpanded ? ChevronUp : ChevronDown}
          size={22}
          color={currentTheme.primary}
        />
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Monthly / Yearly Switcher */}
          <View style={styles.tabSwitcher}>
            <TouchableOpacity
              onPress={() => handleModeChange('monthly')}
              activeOpacity={0.7}
              style={[
                styles.tabButton,
                viewMode === 'monthly' && {
                  backgroundColor: currentTheme.primary,
                },
              ]}
            >
              <AppText
                variant="caption"
                color={viewMode === 'monthly' ? '#FFFFFF' : currentTheme.textPrimary}
                style={styles.tabText}
              >
                Monthly
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleModeChange('yearly')}
              activeOpacity={0.7}
              style={[
                styles.tabButton,
                viewMode === 'yearly' && {
                  backgroundColor: currentTheme.primary,
                },
              ]}
            >
              <AppText
                variant="caption"
                color={viewMode === 'yearly' ? '#FFFFFF' : currentTheme.textPrimary}
                style={styles.tabText}
              >
                Yearly Summary
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Virtualized Schedule List */}
          <FlatList
            data={displayData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            scrollEnabled={false}
            initialNumToRender={12}
            maxToRenderPerBatch={24}
          />
        </View>
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  headerPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleGroup: {
    flex: 1,
  },
  expandedContent: {
    marginTop: 16,
  },
  tabSwitcher: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabText: {
    fontWeight: '600',
  },
});

export default AmortizationSection;
