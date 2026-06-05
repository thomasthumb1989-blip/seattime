import React, { useCallback, useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Play, Plus } from 'lucide-react-native';

import { Heading } from '@src/components/ui/Heading';
import { BodyText } from '@src/components/ui/BodyText';
import { GlassCard } from '@src/components/ui/GlassCard';
import { ProgressRing } from '@src/components/ui/ProgressRing';
import { DriveCard } from '@src/components/drive/DriveCard';
import { ManualLogForm } from '@src/components/drive/ManualLogForm';
import { Colors } from '@src/constants/colors';
import { Strings } from '@src/constants/strings';
import { useDriveSessions } from '@src/hooks/useDriveSessions';
import { useProgress } from '@src/hooks/useProgress';
import { getOnboardingData } from '@src/hooks/useOnboarding';
import type { DriveSession } from '@src/types';

const SH = Strings.HOME;

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const insets = useSafeAreaInsets();
  const { sessions, addSession, reload, loading } = useDriveSessions();

  const [teenName, setTeenName] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [showManualLog, setShowManualLog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getOnboardingData();
      if (data) {
        setTeenName(data.teenName);
        setStateCode(data.state);
      }
    })();
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!loading && sessions.length === 0) {
      setIsFirstVisit(true);
    }
  }, [loading, sessions.length]);

  const progress = useProgress(sessions, stateCode);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  const handleStartDrive = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/drive' as any);
  }, []);

  const handleLogPastDrive = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowManualLog(true);
  }, []);

  const handleManualSave = useCallback(
    async (session: DriveSession) => {
      await addSession(session);
    },
    [addSession]
  );

  const greetingText = teenName
    ? (isFirstVisit ? SH.GREETING_FIRST(teenName) : SH.GREETING(teenName))
    : Strings.appName;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Greeting */}
        <Animated.View entering={FadeIn.duration(300)}>
          <BodyText secondary style={styles.greetingLabel}>{greetingText}</BodyText>
          {teenName ? (
            <Heading variant="h1" style={styles.teenNameHeading}>{teenName}</Heading>
          ) : null}
        </Animated.View>

        {/* Hero Progress Ring */}
        {progress.requiredTotal > 0 && (
          <Animated.View entering={FadeIn.delay(100).duration(300)} style={styles.heroRing}>
            <ProgressRing
              progress={progress.totalProgress}
              size={180}
              strokeWidth={14}
            />
            <BodyText secondary style={styles.progressLabel}>
              {SH.PROGRESS_OF(progress.totalHours, progress.requiredTotal)}
            </BodyText>
          </Animated.View>
        )}

        {/* Day/Night stat cards */}
        {progress.requiredTotal > 0 && (
          <Animated.View entering={FadeIn.delay(250).duration(300)} style={styles.statRow}>
            <GlassCard style={styles.statCard}>
              <View style={styles.statCardInner}>
                <ProgressRing
                  progress={progress.dayProgress}
                  size={80}
                  strokeWidth={8}
                  label={`${progress.dayHours}h`}
                />
                <BodyText variant="caption" secondary style={styles.statCardLabel}>
                  {SH.HOURS_FRACTION(progress.dayHours, progress.requiredDay)} {SH.DAY_HOURS}
                </BodyText>
              </View>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <View style={styles.statCardInner}>
                <ProgressRing
                  progress={progress.nightProgress}
                  size={80}
                  strokeWidth={8}
                  color={colors.accent}
                  label={`${progress.nightHours}h`}
                />
                <BodyText variant="caption" secondary style={styles.statCardLabel}>
                  {SH.HOURS_FRACTION(progress.nightHours, progress.requiredNight)} {SH.NIGHT_HOURS}
                </BodyText>
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Animated.View entering={FadeIn.delay(400).duration(300)} style={styles.actionsSection}>
          <ActionButton
            label={SH.START_DRIVE}
            icon={<Play size={20} color="#FFFFFF" />}
            onPress={handleStartDrive}
            bgColor={colors.primary}
            textColor="#FFFFFF"
            borderColor={colors.primary}
            primary
          />
          <ActionButton
            label={SH.LOG_PAST_DRIVE}
            icon={<Plus size={20} color={colors.primary} />}
            onPress={handleLogPastDrive}
            bgColor="transparent"
            textColor={colors.primary}
            borderColor={colors.border}
          />
        </Animated.View>

        {/* Recent Drives */}
        {sessions.length > 0 && (
          <Animated.View entering={FadeIn.delay(500).duration(300)}>
            <View style={styles.sectionHeader}>
              <Heading variant="h3">{SH.RECENT_DRIVES}</Heading>
              <Pressable
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.navigate('/(tabs)/history' as any);
                }}
                hitSlop={12}
              >
                <BodyText style={{ color: colors.primary, fontWeight: '600', fontSize: 14 }}>
                  {SH.SEE_ALL}
                </BodyText>
              </Pressable>
            </View>
            {sessions.slice(0, 3).map((s, i) => (
              <DriveCard key={s.id} session={s} colors={colors} index={i} />
            ))}
          </Animated.View>
        )}

        {/* Empty State */}
        {sessions.length === 0 && !loading && (
          <Animated.View entering={FadeIn.delay(400).duration(300)} style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '15' }]}>
              <Play size={32} color={colors.primary} />
            </View>
            <Heading variant="h3" style={styles.emptyTitle}>{SH.EMPTY_TITLE}</Heading>
            <BodyText secondary style={styles.emptySubtitle}>{SH.EMPTY_SUBTITLE}</BodyText>
          </Animated.View>
        )}
      </ScrollView>

      {/* Floating Action Buttons (bottom) */}
      <View style={[styles.fabContainer, { paddingBottom: insets.bottom + 16 }]}>
        <ActionButton
          label={SH.LOG_PAST_DRIVE}
          icon={<Plus size={20} color={colors.primary} />}
          onPress={handleLogPastDrive}
          bgColor={colors.bgSecondary}
          textColor={colors.primary}
          borderColor={colors.border}
        />
        <ActionButton
          label={SH.START_DRIVE}
          icon={<Play size={20} color="#FFFFFF" />}
          onPress={handleStartDrive}
          bgColor={colors.primary}
          textColor="#FFFFFF"
          borderColor={colors.primary}
          primary
        />
      </View>

      <ManualLogForm
        visible={showManualLog}
        onClose={() => setShowManualLog(false)}
        onSave={handleManualSave}
        teenName={teenName}
        state={stateCode}
      />
    </View>
  );
}

function ActionButton({
  label,
  icon,
  onPress,
  bgColor,
  textColor,
  borderColor,
  primary = false,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  bgColor: string;
  textColor: string;
  borderColor: string;
  primary?: boolean;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 15, stiffness: 200 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 200 }); }}
      style={{ flex: primary ? 2 : 1 }}
    >
      <Animated.View
        style={[
          styles.actionButton,
          {
            backgroundColor: bgColor,
            borderColor,
            borderWidth: primary ? 0 : 1,
          },
          animatedStyle,
        ]}
      >
        {icon}
        <BodyText style={{ color: textColor, fontWeight: '600', fontSize: 15 }}>
          {label}
        </BodyText>
      </Animated.View>
    </Pressable>
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
  greetingLabel: {
    fontSize: 15,
    marginBottom: 4,
  },
  teenNameHeading: {
    marginBottom: 28,
  },
  heroRing: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressLabel: {
    marginTop: 12,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  statCardInner: {
    alignItems: 'center',
    gap: 10,
  },
  statCardLabel: {
    textAlign: 'center',
    fontWeight: '500',
  },
  actionsSection: {
    gap: 10,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
  actionButton: {
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
