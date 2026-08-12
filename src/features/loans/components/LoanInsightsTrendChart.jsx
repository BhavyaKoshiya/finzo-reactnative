import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Rect, Line, Circle, Path } from 'react-native-svg';
import AppCard from '../../../components/cards/AppCard';
import AppText from '../../../components/common/AppText';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { formatCurrency } from '../../../utils/financeFormatters';

export const LoanInsightsTrendChart = ({ historySeries, style }) => {
  const { currentTheme } = useAppTheme();
  const [activeTab, setActiveTab] = useState('balance'); // 'balance' | 'breakdown'

  const balanceData = historySeries?.balanceHistory || [];
  const breakdownData = historySeries?.paymentBreakdownHistory || [];

  if (balanceData.length === 0 && breakdownData.length === 0) {
    return null;
  }

  const chartHeight = 150;
  const chartWidth = 280;

  const renderBalanceChart = () => {
    if (balanceData.length < 2) {
      return (
        <View style={styles.emptyChart}>
          <AppText variant="caption" color={currentTheme.textSecondary}>
            Record more payments to visualize balance trend.
          </AppText>
        </View>
      );
    }

    const balances = balanceData.map((d) => d.balance);
    const maxVal = Math.max(...balances, 1);
    const minVal = Math.min(...balances);
    const range = maxVal - minVal || 1;

    const points = balanceData.map((d, index) => {
      const x = (index / (balanceData.length - 1)) * (chartWidth - 20) + 10;
      const y = chartHeight - 20 - ((d.balance - minVal) / range) * (chartHeight - 40);
      return { x, y, data: d };
    });

    const pathD = points.reduce(
      (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
      ''
    );

    return (
      <View style={styles.chartWrapper}>
        <Svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          {/* Grid lines */}
          <Line x1="10" y1="20" x2={chartWidth - 10} y2="20" stroke={currentTheme.border} strokeDasharray="4 4" strokeWidth="1" />
          <Line x1="10" y1={chartHeight / 2} x2={chartWidth - 10} y2={chartHeight / 2} stroke={currentTheme.border} strokeDasharray="4 4" strokeWidth="1" />
          <Line x1="10" y1={chartHeight - 20} x2={chartWidth - 10} y2={chartHeight - 20} stroke={currentTheme.border} strokeWidth="1" />

          {/* Trend path */}
          <Path d={pathD} fill="none" stroke={currentTheme.primary} strokeWidth="3" />

          {/* Data points */}
          {points.map((pt, i) => (
            <Circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r="4"
              fill={currentTheme.card}
              stroke={currentTheme.primary}
              strokeWidth="2"
            />
          ))}
        </Svg>

        <View style={styles.chartLabelsRow}>
          <AppText variant="caption" color={currentTheme.textSecondary}>
            {balanceData[0]?.date || 'Start'}
          </AppText>
          <AppText variant="caption" color={currentTheme.textSecondary}>
            {balanceData[balanceData.length - 1]?.date || 'Latest'}
          </AppText>
        </View>
      </View>
    );
  };

  const renderBreakdownChart = () => {
    if (breakdownData.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <AppText variant="caption" color={currentTheme.textSecondary}>
            No payment breakdown data available yet.
          </AppText>
        </View>
      );
    }

    const items = breakdownData.slice(-6); // Max 6 recent items
    const barWidth = 24;
    const gap = (chartWidth - items.length * barWidth) / (items.length + 1);

    const maxTotal = Math.max(...items.map((d) => d.total), 1);

    return (
      <View style={styles.chartWrapper}>
        <Svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          <Line x1="10" y1={chartHeight - 20} x2={chartWidth - 10} y2={chartHeight - 20} stroke={currentTheme.border} strokeWidth="1" />

          {items.map((d, index) => {
            const x = gap + index * (barWidth + gap);
            const totalH = ((d.total / maxTotal) * (chartHeight - 40));
            const prinH = (d.principal / d.total) * totalH || 0;
            const intH = totalH - prinH || 0;

            const yInt = chartHeight - 20 - intH;
            const yPrin = yInt - prinH;

            return (
              <React.Fragment key={index}>
                {/* Interest portion (Secondary/Orange) */}
                <Rect
                  x={x}
                  y={yInt}
                  width={barWidth}
                  height={Math.max(0, intH)}
                  fill={currentTheme.secondary || '#F59E0B'}
                  rx="2"
                />
                {/* Principal portion (Primary/Green) */}
                <Rect
                  x={x}
                  y={yPrin}
                  width={barWidth}
                  height={Math.max(0, prinH)}
                  fill={currentTheme.primary}
                  rx="2"
                />
              </React.Fragment>
            );
          })}
        </Svg>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: currentTheme.primary }]} />
            <AppText variant="caption" color={currentTheme.textSecondary}>Principal</AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: currentTheme.secondary || '#F59E0B' }]} />
            <AppText variant="caption" color={currentTheme.textSecondary}>Interest</AppText>
          </View>
        </View>
      </View>
    );
  };

  return (
    <AppCard style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <AppText variant="cardTitle" style={{ fontWeight: '700' }}>
          Historical Trends
        </AppText>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab('balance')}
            style={[
              styles.tabBtn,
              activeTab === 'balance' && { backgroundColor: currentTheme.primary },
            ]}
          >
            <AppText
              variant="caption"
              style={[
                styles.tabText,
                { color: activeTab === 'balance' ? '#FFFFFF' : currentTheme.textSecondary },
              ]}
            >
              Balance
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('breakdown')}
            style={[
              styles.tabBtn,
              activeTab === 'breakdown' && { backgroundColor: currentTheme.primary },
            ]}
          >
            <AppText
              variant="caption"
              style={[
                styles.tabText,
                { color: activeTab === 'breakdown' ? '#FFFFFF' : currentTheme.textSecondary },
              ]}
            >
              Breakdown
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'balance' ? renderBalanceChart() : renderBreakdownChart()}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 2,
  },
  tabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tabText: {
    fontWeight: '600',
    fontSize: 11,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChart: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 6,
    paddingHorizontal: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default LoanInsightsTrendChart;
