import React, { useCallback, useEffect, useState } from 'react';
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
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Play, Plus, Clock, Moon, Sun } from 'lucide-react-native';

import { Heading } from '@src/components/ui/Heading';
import { BodyText } from '@src/components/ui/BodyText';
import { ManualLogForm } from '@src/components/drive/ManualLogForm';
import { Colors, type AppColors } from '@src/constants/colors';
import { Strings } from '@src/constants/strings';
import {
  useDriveSessions,
  getTotalHours,
  getNightHours,
} from '@src/hooks/useDriveSessions';
import { getOnboardingData } from '@src/hooks/useOnboarding';
import type { DriveSession } from '@src/types';

const SD = Strings.DRIVE;
const SH = Strings.HOME;

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const insets = useSafeAreaInsets();
  const { sessions, addSession, reload } = useDriveSessions();

  const [teenName, setTeenName] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [showManualLog, setShowManualLog] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getOnboardingData();
      if (data) {
        setTeenName(data.teenName);
        setStateCode(data.state);
      }
    })();
  }, []);

  // Reload sessions when screen gains focus (after returning from drive)
  useEffect(() => {
    reload();
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

  const totalHours = getTotalHours(sessions);
  const nightHours = getNightHours(sessions);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <Animated.View entering={FadeIn.duration(300)}>
          <Heading variant="h1" style={styles.greeting}>
            {teenName ? SH.GREETING(teenName) : Strings.appName}
          </Heading>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeIn.delay(100).duration(300)} style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            <Clock size={20} color={colors.primary} />
            <Heading variant="h2" color={colors.primary}>
              {totalHours}
            </Heading>
            <BodyText variant="caption" secondary>{SH.TOTAL_HOURS}</BodyText>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            <Moon size={20} color={colors.accent} />
            <Heading variant="h2" color={colors.accent}>
              {nightHours}
            </Heading>
            <BodyText variant="caption" secondary>{SH.NIGHT_HOURS}</BodyText>
          </View>
        </Animated.View>

        {/* Recent Drives */}
        {sessions.length > 0 && (
          <Animated.View entering={FadeIn.delay(200).duration(300)}>
            <Heading variant="h3" style={styles.sectionTitle}>
              {SH.RECENT_DRIVES}
            </Heading>
            {sessions.slice(0, 5).map((session, index) => (
              <DriveRow key={session.id} session={session} colors={colors} index={index} />
            ))}
          </Animated.View>
        )}

        {sessions.length === 0 && (
          <Animated.View entering={FadeIn.delay(200).duration(300)} style={styles.emptyState}>
            <BodyText secondary style={styles.emptyTitle}>{SD.NO_DRIVES_YET}</BodyText>
            <BodyText variant="caption" secondary style={styles.emptySubtitle}>
              {SD.NO_DRIVES_SUBTITLE}
            </BodyText>
          </Animated.View>
        )}
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={[styles.fabContainer, { paddingBottom: insets.bottom + 16 }]}>
        <ActionButton
          label={SD.LOG_PAST_DRIVE}
          icon={<Plus size={20} color={colors.primary} />}
          onPress={handleLogPastDrive}
          bgColor={colors.bgSecondary}
          textColor={colors.primary}
          borderColor={colors.border}
        />
        <ActionButton
          label={SD.START_DRIVE}
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

function DriveRow({
  session,
  colors,
  index,
}: {
  session: DriveSession;
  colors: AppColors;
  index: number;
}) {
  const minutes = Math.round(session.durationSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const durationText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  const date = new Date(session.startTime);
  const dateText = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const isNight = session.conditions.timeOfDay === 'night';

  return (
    <Animated.View entering={FadeIn.delay(index * 50).duration(200)}>
      <View
        style={[
          styles.driveRow,
          { backgroundColor: colors.bgSecondary, borderColor: colors.border },
        ]}
      >
        <View style={[styles.driveIcon, { backgroundColor: isNight ? colors.accent + '20' : colors.primary + '20' }]}>
          {isNight ? (
            <Moon size={16} color={colors.accent} />
          ) : (
            <Sun size={16} color={colors.primary} />
          )}
        </View>
        <View style={styles.driveInfo}>
          <BodyText style={{ fontWeight: '500' }}>{durationText}</BodyText>
          <BodyText variant="caption" secondary>
            {dateText} · {session.conditions.weather} · {session.conditions.roadType}
            {session.isManual ? ' · Manual' : ''}
          </BodyText>
        </View>
        {session.distanceMiles > 0 && (
          <BodyText variant="caption" secondary>
            {session.distanceMiles.toFixed(1)} mi
          </BodyText>
        )}
      </View>
    </Animated.View>
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
  greeting: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  driveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  driveIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driveInfo: {
    flex: 1,
    gap: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  emptySubtitle: {
    textAlign: 'center',
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
