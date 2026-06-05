import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrendingUp } from 'lucide-react-native';

import { Heading } from '@src/components/ui/Heading';
import { BodyText } from '@src/components/ui/BodyText';
import { GlassCard } from '@src/components/ui/GlassCard';
import { ProgressRing } from '@src/components/ui/ProgressRing';
import { WeeklyChart } from '@src/components/progress/WeeklyChart';
import { MilestoneCard } from '@src/components/progress/MilestoneCard';
import { StatCard } from '@src/components/progress/StatCard';
import { Colors } from '@src/constants/colors';
import { Strings } from '@src/constants/strings';
import {
  useDriveSessions,
  getWeeklyHours,
  getAverageDuration,
  getLongestDrive,
  getCurrentStreak,
  getProjectedCompletion,
} from '@src/hooks/useDriveSessions';
import { useProgress } from '@src/hooks/useProgress';
import { getOnboardingData } from '@src/hooks/useOnboarding';

const SP = Strings.PROGRESS;

const MILESTONES = [
  { pct: 0.25, name: SP.MILESTONE_25 },
  { pct: 0.5, name: SP.MILESTONE_50 },
  { pct: 0.75, name: SP.MILESTONE_75 },
  { pct: 1.0, name: SP.MILESTONE_100 },
];

export default function ProgressScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const insets = useSafeAreaInsets();
  const { sessions, loading, reload } = useDriveSessions();

  const [teenName, setTeenName] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getOnboardingData();
      if (data) {
        setTeenName(data.teenName);
        setStateCode(data.state);
      }
    })();
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const progress = useProgress(sessions, stateCode);

  const weeklyHours = useMemo(() => getWeeklyHours(sessions), [sessions]);
  const weekTotal = useMemo(() => Math.round(weeklyHours.reduce((a, b) => a + b, 0) * 10) / 10, [weeklyHours]);
  const avgDuration = useMemo(() => getAverageDuration(sessions), [sessions]);
  const longestDrive = useMemo(() => getLongestDrive(sessions), [sessions]);
  const streak = useMemo(() => getCurrentStreak(sessions), [sessions]);
  const projectedDate = useMemo(
    () => getProjectedCompletion(sessions, progress.requiredTotal, progress.totalHours),
    [sessions, progress.requiredTotal, progress.totalHours]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  const projectionText = useMemo(() => {
    if (progress.requiredTotal <= 0) return SP.NO_REQUIREMENT;
    if (progress.totalHours >= progress.requiredTotal) return SP.PROJECTION_DONE;
    if (!projectedDate) return SP.PROJECTION_EMPTY;
    const dateStr = projectedDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    return SP.PROJECTION(teenName || 'your teen', dateStr);
  }, [projectedDate, progress.requiredTotal, progress.totalHours, teenName]);

  const hasRequirement = progress.requiredTotal > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Title */}
        <Animated.View entering={FadeIn.duration(300)}>
          <Heading variant="h2" style={styles.title}>{SP.TITLE}</Heading>
        </Animated.View>

        {/* Hero Ring */}
        {hasRequirement && (
          <Animated.View entering={FadeIn.delay(100).duration(300)} style={styles.heroRing}>
            <ProgressRing
              progress={progress.totalProgress}
              size={200}
              strokeWidth={16}
            />
            <BodyText secondary style={styles.heroSubtext}>
              {SP.HOURS_OF(progress.totalHours, progress.requiredTotal)}
            </BodyText>
          </Animated.View>
        )}

        {/* No requirement message */}
        {!hasRequirement && !loading && (
          <Animated.View entering={FadeIn.delay(100).duration(300)} style={styles.noReqCard}>
            <GlassCard>
              <View style={styles.noReqInner}>
                <TrendingUp size={24} color={colors.primary} />
                <BodyText secondary style={styles.noReqText}>{SP.NO_REQUIREMENT}</BodyText>
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Day/Night breakdown */}
        {hasRequirement && (
          <Animated.View entering={FadeIn.delay(200).duration(300)} style={styles.breakdownRow}>
            <GlassCard style={styles.breakdownCard}>
              <View style={styles.breakdownInner}>
                <ProgressRing
                  progress={progress.dayProgress}
                  size={80}
                  strokeWidth={8}
                  label={`${progress.dayHours}h`}
                />
                <BodyText variant="caption" secondary style={styles.breakdownLabel}>
                  {SP.HOURS_FRACTION(progress.dayHours, progress.requiredDay)} {SP.DAY_HOURS}
                </BodyText>
              </View>
            </GlassCard>
            <GlassCard style={styles.breakdownCard}>
              <View style={styles.breakdownInner}>
                <ProgressRing
                  progress={progress.nightProgress}
                  size={80}
                  strokeWidth={8}
                  color={colors.accent}
                  label={`${progress.nightHours}h`}
                />
                <BodyText variant="caption" secondary style={styles.breakdownLabel}>
                  {SP.HOURS_FRACTION(progress.nightHours, progress.requiredNight)} {SP.NIGHT_HOURS}
                </BodyText>
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Weekly Activity */}
        <Animated.View entering={FadeIn.delay(300).duration(300)}>
          <Heading variant="h3" style={styles.sectionTitle}>{SP.THIS_WEEK}</Heading>
          <View style={[styles.weeklyCard, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            <WeeklyChart hours={weeklyHours} colors={colors} />
            <BodyText variant="caption" secondary style={styles.weeklyTotal}>
              {SP.WEEKLY_HOURS(weekTotal)}
            </BodyText>
          </View>
        </Animated.View>

        {/* Milestones */}
        {hasRequirement && (
          <Animated.View entering={FadeIn.delay(400).duration(300)}>
            <Heading variant="h3" style={styles.sectionTitle}>{SP.MILESTONES}</Heading>
            {MILESTONES.map((m, i) => (
              <MilestoneCard
                key={m.pct}
                name={m.name}
                percentage={m.pct}
                achieved={progress.totalProgress >= m.pct}
                currentProgress={progress.totalProgress}
                index={i}
                colors={colors}
              />
            ))}
          </Animated.View>
        )}

        {/* Projection */}
        {hasRequirement && (
          <Animated.View entering={FadeIn.delay(500).duration(300)}>
            <Heading variant="h3" style={styles.sectionTitle}>{SP.PROJECTION_TITLE}</Heading>
            <GlassCard>
              <View style={styles.projectionInner}>
                <TrendingUp size={20} color={colors.primary} />
                <BodyText style={styles.projectionText}>{projectionText}</BodyText>
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Stats Grid */}
        <Animated.View entering={FadeIn.delay(600).duration(300)}>
          <Heading variant="h3" style={styles.sectionTitle}>{SP.STATS}</Heading>
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatCard
                label={SP.TOTAL_DRIVES}
                value={`${sessions.length}`}
                index={0}
                colors={colors}
              />
              <StatCard
                label={SP.AVG_DURATION}
                value={`${avgDuration} ${SP.MINUTES}`}
                index={1}
                colors={colors}
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                label={SP.LONGEST_DRIVE}
                value={`${longestDrive} ${SP.MINUTES}`}
                index={2}
                colors={colors}
              />
              <StatCard
                label={SP.STREAK}
                value={SP.DAYS(streak)}
                index={3}
                colors={colors}
              />
            </View>
          </View>
        </Animated.View>
      </ScrollView>
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
  },
  title: {
    marginBottom: 24,
  },
  heroRing: {
    alignItems: 'center',
    marginBottom: 16,
  },
  heroSubtext: {
    marginTop: 12,
    textAlign: 'center',
  },
  noReqCard: {
    marginBottom: 24,
  },
  noReqInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  noReqText: {
    flex: 1,
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  breakdownCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  breakdownInner: {
    alignItems: 'center',
    gap: 10,
  },
  breakdownLabel: {
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionTitle: {
    marginBottom: 14,
    marginTop: 8,
  },
  weeklyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  weeklyTotal: {
    marginTop: 12,
    textAlign: 'center',
  },
  projectionInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  projectionText: {
    flex: 1,
    lineHeight: 22,
  },
  statsGrid: {
    gap: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
