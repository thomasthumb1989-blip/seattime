import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import {
  useSharedValue,
  withTiming,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { Colors } from '@src/constants/colors';
import { Heading } from './Heading';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
  isMilestone?: boolean;
}

export function ProgressRing({
  progress,
  size = 160,
  strokeWidth = 12,
  label,
  color,
  isMilestone = false,
}: ProgressRingProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(Math.min(progress, 1), {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const center = size / 2;
  const radius = (size - strokeWidth) / 2;

  const bgPath = Skia.Path.Make();
  bgPath.addCircle(center, center, radius);

  const fillColor = isMilestone
    ? colors.accent
    : color ?? colors.primary;

  const bgRingColor = theme === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.06)';

  const sweepAngle = useDerivedValue(() => {
    return animatedProgress.value * 360;
  });

  const foregroundPath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const startAngle = -90;
    const oval = Skia.XYWHRect(
      center - radius,
      center - radius,
      radius * 2,
      radius * 2
    );
    path.addArc(oval, startAngle, sweepAngle.value);
    return path;
  });

  const displayValue = label ?? `${Math.round(progress * 100)}%`;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Canvas style={{ width: size, height: size }}>
        <Path
          path={bgPath}
          style="stroke"
          strokeWidth={strokeWidth}
          color={bgRingColor}
          strokeCap="round"
        />
        <Path
          path={foregroundPath}
          style="stroke"
          strokeWidth={strokeWidth}
          color={fillColor}
          strokeCap="round"
        />
      </Canvas>
      <View style={styles.labelContainer}>
        <Heading
          variant="metric"
          color={fillColor}
          style={{ fontSize: size * 0.2 }}
        >
          {displayValue}
        </Heading>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
