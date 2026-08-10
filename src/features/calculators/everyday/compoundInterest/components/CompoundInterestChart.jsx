import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import AppText from '../../../../../components/common/AppText';
import AppCard from '../../../../../components/cards/AppCard';
import { useAppTheme } from '../../../../../hooks/useAppTheme';
import { formatINRCompact } from '../../../../../calculations/core/currency';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const CompoundInterestChart = ({ result, style }) => {
  const { currentTheme } = useAppTheme();
  const progress = useSharedValue(0);

  const principal = result?.principal || 0;
  const interestEarned = result?.interestEarned || 0;
  const total = result?.maturityAmount || 1;

  const interestRatio = Math.min(Math.max(interestEarned / total, 0), 1);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [result, progress]);

  const size = 160;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progress.value * interestRatio);
    return {
      strokeDashoffset,
    };
  });

  if (!result) return null;

  return (
    <AppCard style={[styles.card, style]}>
      <AppText variant="cardTitle" style={styles.title}>
        Principal vs Interest Breakdown
      </AppText>

      <View style={styles.chartContainer}>
        <View style={styles.svgWrapper}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Background ring: Principal */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={currentTheme.primary}
              strokeWidth={strokeWidth}
              fill="none"
              opacity={0.2}
            />
            {/* Foreground arc: Interest Earned */}
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={currentTheme.secondary}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              animatedProps={animatedProps}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>

          <View style={styles.centerTextContainer}>
            <AppText variant="caption" color={currentTheme.textMuted}>
              Total
            </AppText>
            <AppText variant="cardTitle" align="center" color={currentTheme.textPrimary}>
              {formatINRCompact(total)}
            </AppText>
          </View>
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: currentTheme.primary }]} />
            <View style={styles.legendTextGroup}>
              <AppText variant="caption" color={currentTheme.textSecondary}>
                Principal Amount
              </AppText>
              <AppText variant="bodyMedium">
                {formatINRCompact(principal)} ({Math.round((principal / total) * 100)}%)
              </AppText>
            </View>
          </View>

          <View style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: currentTheme.secondary }]} />
            <View style={styles.legendTextGroup}>
              <AppText variant="caption" color={currentTheme.textSecondary}>
                Interest Earned
              </AppText>
              <AppText variant="bodyMedium">
                {formatINRCompact(interestEarned)} ({Math.round((interestEarned / total) * 100)}%)
              </AppText>
            </View>
          </View>
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
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  svgWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    flex: 1,
    marginLeft: 16,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    marginRight: 8,
  },
  legendTextGroup: {
    flex: 1,
  },
});

export default CompoundInterestChart;
