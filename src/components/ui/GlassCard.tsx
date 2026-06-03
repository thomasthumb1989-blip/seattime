import React, { useEffect } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { Colors } from '@src/constants/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GlassCard({ children, style, onPress }: GlassCardProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 300 });
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  const entryStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 200 });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[entryStyle, styles.container]}
      disabled={!onPress}
    >
      <BlurView
        intensity={60}
        tint={theme === 'dark' ? 'dark' : 'light'}
        style={[
          styles.blur,
          {
            backgroundColor: colors.glassBg,
            borderColor: colors.glassBorder,
          },
          style,
        ]}
      >
        {children}
      </BlurView>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.04,
  },
  blur: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
