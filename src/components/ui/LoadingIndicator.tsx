import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { Colors } from '@src/constants/colors';

type LoadingSize = 'sm' | 'md' | 'lg';

interface LoadingIndicatorProps {
  size?: LoadingSize;
  style?: ViewStyle;
}

const SIZE_MAP: Record<LoadingSize, number> = {
  sm: 24,
  md: 40,
  lg: 64,
};

export function LoadingIndicator({ size = 'md', style }: LoadingIndicatorProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const dimension = SIZE_MAP[size];

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: colors.primary,
        },
        style,
      ]}
    />
  );
}
