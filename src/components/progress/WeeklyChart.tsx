import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { BodyText } from '@src/components/ui/BodyText';
import type { AppColors } from '@src/constants/colors';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface WeeklyChartProps {
  hours: number[];
  colors: AppColors;
}

function Bar({
  value,
  maxValue,
  index,
  isToday,
  barWidth,
  chartHeight,
  colors,
}: {
  value: number;
  maxValue: number;
  index: number;
  isToday: boolean;
  barWidth: number;
  chartHeight: number;
  colors: AppColors;
}) {
  const minBarHeight = 4;
  const targetHeight = maxValue > 0
    ? Math.max((value / maxValue) * chartHeight, value > 0 ? minBarHeight : 0)
    : 0;

  const animHeight = useSharedValue(0);

  useEffect(() => {
    animHeight.value = withDelay(
      index * 80,
      withTiming(targetHeight, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
  }, [targetHeight, index, animHeight]);

  const animatedProps = useAnimatedProps(() => ({
    height: animHeight.value,
    y: chartHeight - animHeight.value,
  }));

  const fill = isToday ? colors.accent : colors.primary;
  const x = index * (barWidth + 8);

  return (
    <AnimatedRect
      x={x}
      rx={barWidth / 2}
      width={barWidth}
      fill={fill}
      animatedProps={animatedProps}
    />
  );
}

export function WeeklyChart({ hours, colors }: WeeklyChartProps) {
  const maxValue = Math.max(...hours, 0.5);
  const chartHeight = 100;
  const barWidth = 28;
  const totalWidth = 7 * barWidth + 6 * 8;

  const now = new Date();
  const dow = now.getDay();
  const todayIdx = dow === 0 ? 6 : dow - 1;

  return (
    <View style={styles.container}>
      <View style={[styles.chartWrapper, { width: totalWidth, height: chartHeight }]}>
        <Svg width={totalWidth} height={chartHeight}>
          {hours.map((h, i) => (
            <Bar
              key={i}
              value={h}
              maxValue={maxValue}
              index={i}
              isToday={i === todayIdx}
              barWidth={barWidth}
              chartHeight={chartHeight}
              colors={colors}
            />
          ))}
        </Svg>
      </View>
      <View style={[styles.labelsRow, { width: totalWidth }]}>
        {DAY_LABELS.map((label, i) => (
          <View key={i} style={[styles.labelCell, { width: barWidth + 8 }]}>
            <BodyText
              variant="caption"
              style={{
                fontWeight: i === todayIdx ? '700' : '400',
                color: i === todayIdx ? colors.accent : colors.textSecondary,
                fontSize: 12,
              }}
            >
              {label}
            </BodyText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartWrapper: {
    marginBottom: 8,
  },
  labelsRow: {
    flexDirection: 'row',
  },
  labelCell: {
    alignItems: 'center',
  },
});
