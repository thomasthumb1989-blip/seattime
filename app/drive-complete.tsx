import React, { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, Navigation, Sun, Moon, Cloud, Snowflake, Eye, MapPin } from 'lucide-react-native';

import { Heading } from '@src/components/ui/Heading';
import { BodyText } from '@src/components/ui/BodyText';
import { GlassCard } from '@src/components/ui/GlassCard';
import { ProgressRing } from '@src/components/ui/ProgressRing';
import { MilestoneBurst } from '@src/components/ui/MilestoneBurst';
import { Colors } from '@src/constants/colors';
import { Strings } from '@src/constants/strings';
import { useDriveSessions } from '@src/hooks/useDriveSessions';
import { useProgress } from '@src/hooks/useProgress';
import { getOnboardingData } from '@src/hooks/useOnboarding';
import type { DriveSession } from '@src/types';

const S = Strings.DRIVE_COMPLETE;

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function getWeatherIcon(weather: string, color: string) {
  switch (weather) {
    case 'rain': return <Cloud size={16} color={color} />;
    case 'snow': return <Snowflake size={16} color={color} />;
    case 'fog': return <Eye size={16} color={color} />;
    default: return <Sun size={16} color={color} />;
  }
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function DriveCompleteScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const insets = useSafeAreaInsets();
  const { sessions } = useDriveSessions();

  const [teenName, setTeenName] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [showMilestone, setShowMilestone] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getOnboardingData();
      if (data) {
        setTeenName(data.teenName);
        setStateCode(data.state);
      }
    })();
  }, []);

  const session: DriveSession | undefined = useMemo(
    () => sessions.find((s) => s.id === sessionId),
    [sessions, sessionId]
  );

  const progress = useProgress(sessions, stateCode, session);

  useEffect(() => {
    if (progress.milestone) {
      const timer = setTimeout(() => setShowMilestone(true), 800);
      return () => clearTimeout(timer);
    }
  }, [progress.milestone]);

  // Checkmark bounce
  const checkScale = useSharedValue(0);
  useEffect(() => {
    checkScale.value = withDelay(
      200,
      withSpring(1, { damping: 12, stiffness: 180 })
    );
  }, [checkScale]);
  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  // Done button
  const doneScale = useSharedValue(1);
  const doneStyle = useAnimatedStyle(() => ({
    transform: [{ scale: doneScale.value }],
  }));

  const handleDone = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(tabs)' as any);
  };

  if (!session) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
        <BodyText>Loading...</BodyText>
      </View>
    );
  }

  const driveDate = new Date(session.startTime);
  const dateText = driveDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const isNight = session.conditions.timeOfDay === 'night';

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.hero}>
          <Animated.View style={[styles.checkBadge, { backgroundColor: colors.primary + '15' }, checkStyle]}>
            <Heading variant="metric" color={colors.primary} style={{ fontSize: 40 }}>
              {'✓'}
            </Heading>
          </Animated.View>
          <Heading variant="h1" style={styles.heroTitle}>
            {teenName ? S.HERO(teenName) : S.HERO_FALLBACK}
          </Heading>
        </Animated.View>

        {/* Drive Stats Card */}
        <Animated.View entering={FadeIn.delay(150).duration(300)}>
          <GlassCard style={styles.cardPadding}>
            <BodyText style={{ ...styles.cardLabel, color: colors.textSecondary }}>
              {S.DRIVE_STATS}
            </BodyText>

            {/* Duration big number */}
            <View style={styles.durationRow}>
              <Clock size={20} color={colors.primary} />
              <Heading variant="metric" color={colors.primary} style={{ fontSize: 36 }}>
                {formatDuration(session.durationSeconds)}
              </Heading>
            </View>

            {/* Distance */}
            {session.distanceMiles > 0 && (
              <View style={styles.statRow}>
                <Navigation size={16} color={colors.textSecondary} />
                <BodyText style={{ fontWeight: '500' }}>
                  {session.distanceMiles.toFixed(1)} {S.MILES}
                </BodyText>
              </View>
            )}

            {/* Conditions */}
            <View style={styles.conditionsRow}>
              <View style={styles.conditionChip}>
                {isNight ? <Moon size={14} color={colors.accent} /> : <Sun size={14} color={colors.primary} />}
                <BodyText variant="caption" style={{ fontWeight: '500' }}>
                  {isNight ? 'Night' : 'Day'}
                </BodyText>
              </View>
              <View style={styles.conditionChip}>
                {getWeatherIcon(session.conditions.weather, colors.textSecondary)}
                <BodyText variant="caption" style={{ fontWeight: '500' }}>
                  {capitalizeFirst(session.conditions.weather)}
                </BodyText>
              </View>
              <View style={styles.conditionChip}>
                <MapPin size={14} color={colors.textSecondary} />
                <BodyText variant="caption" style={{ fontWeight: '500' }}>
                  {capitalizeFirst(session.conditions.roadType)}
                </BodyText>
              </View>
            </View>

            {/* Timestamp */}
            <BodyText variant="caption" secondary style={styles.timestamp}>
              {dateText}
            </BodyText>
          </GlassCard>
        </Animated.View>

        {/* Progress Card */}
        {progress.requiredTotal > 0 && (
          <Animated.View entering={FadeIn.delay(300).duration(300)}>
            <GlassCard style={styles.cardPadding}>
              <BodyText style={{ ...styles.cardLabel, color: colors.textSecondary }}>
                {S.PROGRESS}
              </BodyText>
              <View style={styles.progressCenter}>
                <ProgressRing
                  progress={progress.totalProgress}
                  size={140}
                  strokeWidth={10}
                  isMilestone={progress.milestone !== null}
                />
              </View>
              <BodyText secondary style={styles.progressSubtext}>
                {progress.hoursRemaining > 0
                  ? S.HOURS_REMAINING(progress.hoursRemaining)
                  : S.COMPLETE}
              </BodyText>

              {progress.requiredNight > 0 && (
                <View style={styles.nightProgressRow}>
                  <Moon size={14} color={colors.accent} />
                  <View style={styles.nightBar}>
                    <View
                      style={[
                        styles.nightBarFill,
                        {
                          backgroundColor: colors.accent,
                          width: `${Math.min(progress.nightProgress * 100, 100)}%`,
                        },
                      ]}
                    />
                  </View>
                  <BodyText variant="caption" secondary>
                    {Math.round(progress.nightProgress * 100)}%
                  </BodyText>
                </View>
              )}
              {progress.requiredNight > 0 && progress.nightRemaining > 0 && (
                <BodyText variant="caption" secondary style={styles.nightSubtext}>
                  {S.NIGHT_REMAINING(progress.nightRemaining)}
                </BodyText>
              )}
            </GlassCard>
          </Animated.View>
        )}
      </ScrollView>

      {/* Done button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          onPress={handleDone}
          onPressIn={() => { doneScale.value = withSpring(0.96, { damping: 15, stiffness: 200 }); }}
          onPressOut={() => { doneScale.value = withSpring(1, { damping: 15, stiffness: 200 }); }}
        >
          <Animated.View style={[styles.doneButton, { backgroundColor: colors.primary }, doneStyle]}>
            <BodyText style={styles.doneButtonText}>{S.DONE}</BodyText>
          </Animated.View>
        </Pressable>
      </View>

      {/* Milestone overlay */}
      {progress.milestone && (
        <MilestoneBurst
          visible={showMilestone}
          milestoneName={progress.milestone.name}
          milestoneHours={progress.milestone.hours}
          onDismiss={() => setShowMilestone(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    gap: 20,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 8,
  },
  checkBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    textAlign: 'center',
  },
  cardPadding: {
    paddingVertical: 24,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  conditionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  conditionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  timestamp: {
    marginTop: 4,
  },
  progressCenter: {
    alignItems: 'center',
    marginBottom: 12,
  },
  progressSubtext: {
    textAlign: 'center',
    marginBottom: 16,
  },
  nightProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nightBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  nightBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  nightSubtext: {
    textAlign: 'center',
    marginTop: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  doneButton: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
