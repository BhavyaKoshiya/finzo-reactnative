import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import AppCard from '../../../../../components/cards/AppCard';
import AppText from '../../../../../components/common/AppText';
import { formatINR } from '../../../../../calculations/core/currency';
import { useAppTheme } from '../../../../../hooks/useAppTheme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DonutChart = ({ interestPct, primaryColor, secondaryColor, size = 140, strokeWidth = 22, theme }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(interestPct / 100, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [interestPct, progress]);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: circumference * (1 - progress.value),
    };
  });

  return (
    <View style={styles.donutWrapper}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Base Deposited Ring */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={primaryColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated Interest Arc */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={secondaryColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="butt"
          />
        </G>
      </Svg>
      <View style={styles.centerLabelAbsolute}>
        <AppText variant="caption" color={theme.textMuted}>
          Interest
        </AppText>
        <AppText variant="bodyMedium" style={styles.centerText}>
          {interestPct}%
        </AppText>
      </View>
    </View>
  );
};

export const RDBreakdownChart = ({ result, style }) => {
  const { currentTheme } = useAppTheme();

  if (!result) return null;

  const { totalDeposited, interestEarned, maturityAmount } = result;
  const total = maturityAmount || (totalDeposited + interestEarned) || 1;

  const depositedPct = Math.round((totalDeposited / total) * 100);
  const interestPct = Math.max(100 - depositedPct, 0);

  return (
    <AppCard style={[styles.card, style]}>
      <AppText variant="cardTitle" style={styles.title}>
        RD Growth Split
      </AppText>
      <AppText variant="caption" color={currentTheme.textSecondary} style={styles.subtitle}>
        Deposited Principal vs Interest Earned
      </AppText>

      <View style={styles.chartContainer}>
        <DonutChart
          interestPct={interestPct}
          primaryColor={currentTheme.primary}
          secondaryColor={currentTheme.secondary || '#F59E0B'}
          theme={currentTheme}
        />

        <View style={styles.legendContainer}>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: currentTheme.primary }]} />
            <AppText variant="bodySmall" color={currentTheme.textPrimary} style={styles.legendLabel}>
              Deposits ({depositedPct}%)
            </AppText>
          </View>
          <AppText variant="bodyMedium" style={styles.legendValue}>
            {formatINR(totalDeposited)}
          </AppText>

          <View style={[styles.legendRow, styles.legendRowMargin]}>
            <View style={[styles.legendDot, { backgroundColor: currentTheme.secondary || '#F59E0B' }]} />
            <AppText variant="bodySmall" color={currentTheme.textPrimary} style={styles.legendLabel}>
              Interest ({interestPct}%)
            </AppText>
          </View>
          <AppText variant="bodyMedium" style={styles.legendValue}>
            {formatINR(interestEarned)}
          </AppText>
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  title: {
    marginBottom: 2,
  },
  subtitle: {
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  donutWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabelAbsolute: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    fontWeight: '700',
  },
  legendContainer: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  legendRowMargin: {
    marginTop: 12,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendLabel: {
    fontWeight: '500',
  },
  legendValue: {
    marginLeft: 18,
    fontWeight: '600',
  },
});

export default RDBreakdownChart;
