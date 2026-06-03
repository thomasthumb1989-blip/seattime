import React, { useEffect, useCallback } from 'react';
import { StyleSheet, View, Pressable, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '@src/constants/colors';
import { GlassCard } from './GlassCard';
import { Heading } from './Heading';
import { BodyText } from './BodyText';

interface MilestoneBurstProps {
  visible: boolean;
  milestoneName: string;
  milestoneHours: number;
  onDismiss: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function MilestoneBurst({
  visible,
  milestoneName,
  milestoneHours,
  onDismiss,
}: MilestoneBurstProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  const cardTranslateY = useSharedValue(100);
  const cardOpacity = useSharedValue(0);
  const ringScale = useSharedValue(1);
  const overlayOpacity = useSharedValue(0);

  const triggerHaptic = useCallback(async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  }, []);

  const scheduleDismiss = useCallback(() => {
    const timeout = setTimeout(() => {
      onDismiss();
    }, 3000);
    return () => clearTimeout(timeout);
  }, [onDismiss]);

  useEffect(() => {
    if (visible) {
      triggerHaptic();

      overlayOpacity.value = withTiming(1, { duration: 200 });

      ringScale.value = withSpring(1.1, { damping: 12, stiffness: 180 }, () => {
        ringScale.value = withSpring(1, { damping: 12, stiffness: 180 });
      });

      cardTranslateY.value = withDelay(
        300,
        withSpring(0, { damping: 15, stiffness: 200 })
      );
      cardOpacity.value = withDelay(300, withTiming(1, { duration: 200 }));

      const timeout = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timeout);
    } else {
      overlayOpacity.value = withTiming(0, { duration: 200 });
      cardTranslateY.value = withTiming(100, { duration: 200 });
      cardOpacity.value = withTiming(0, { duration: 200 });
      ringScale.value = 1;
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardTranslateY.value }],
    opacity: cardOpacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <Pressable style={styles.dismissArea} onPress={onDismiss}>
        <View style={styles.confettiContainer}>
          <LottieView
            source={require('../../../assets/animations/confetti.json')}
            autoPlay
            loop={false}
            style={styles.confetti}
          />
        </View>

        <Animated.View style={[styles.ringPulse, ringStyle]}>
          <View
            style={[
              styles.pulseCircle,
              { borderColor: colors.accent },
            ]}
          />
        </Animated.View>

        <Animated.View style={[styles.cardWrapper, cardStyle]}>
          <GlassCard>
            <View style={styles.cardContent}>
              <Heading variant="h2" color={colors.accent} style={styles.cardTitle}>
                {milestoneName}
              </Heading>
              <Heading variant="metric" color={colors.accent}>
                {milestoneHours}h
              </Heading>
              <BodyText secondary style={styles.cardMessage}>
                Keep up the great work!
              </BodyText>
            </View>
          </GlassCard>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 9999,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  dismissArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  confetti: {
    width: '100%',
    height: '100%',
  },
  ringPulse: {
    position: 'absolute',
    top: '30%',
    alignSelf: 'center',
  },
  pulseCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
  },
  cardWrapper: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  cardContent: {
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    textAlign: 'center',
  },
  cardMessage: {
    textAlign: 'center',
    marginTop: 4,
  },
});
