import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Navigation, Gauge } from 'lucide-react-native';

import { Heading } from '@src/components/ui/Heading';
import { BodyText } from '@src/components/ui/BodyText';
import { ConditionChips } from '@src/components/drive/ConditionChips';
import { Colors } from '@src/constants/colors';
import { Strings } from '@src/constants/strings';
import {
  useDriveTimer,
  formatTimer,
  detectTimeOfDay,
} from '@src/hooks/useDriveTimer';
import {
  useDriveSessions,
  generateSessionId,
} from '@src/hooks/useDriveSessions';
import { useSync } from '@src/hooks/useFirestoreSync';
import { getOnboardingData } from '@src/hooks/useOnboarding';
import type { TimeOfDay, Weather, RoadType, DriveSession } from '@src/types';

const S = Strings.DRIVE;
const TEAL = '#5ABFBF';
const DARK_BG = '#1A1A1A';

export default function DriveScreen() {
  const insets = useSafeAreaInsets();
  const timer = useDriveTimer();
  const { addSession } = useDriveSessions();
  const { pushSession } = useSync();

  const [teenName, setTeenName] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(detectTimeOfDay());
  const [weather, setWeather] = useState<Weather>('clear');
  const [roadType, setRoadType] = useState<RoadType>('residential');
  const [showConfirm, setShowConfirm] = useState(false);
  const [started, setStarted] = useState(false);

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
    if (!started) {
      (async () => {
        await timer.requestLocationPermission();
        await timer.start();
        setStarted(true);
      })();
    }
  }, [started]);

  // Colon pulse
  const colonOpacity = useSharedValue(1);
  useEffect(() => {
    colonOpacity.value = withRepeat(
      withTiming(0.4, { duration: 500 }),
      -1,
      true
    );
  }, [colonOpacity]);
  const colonStyle = useAnimatedStyle(() => ({
    opacity: colonOpacity.value,
  }));

  const handleEndDrive = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowConfirm(true);
  }, []);

  const confirmEndDrive = useCallback(async () => {
    setShowConfirm(false);
    const result = timer.stop();

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const session: DriveSession = {
      id: generateSessionId(),
      teenName,
      state: stateCode,
      startTime: result.startTime,
      endTime: result.endTime,
      durationSeconds: result.durationSeconds,
      distanceMiles: result.distanceMiles,
      route: result.route,
      conditions: { timeOfDay, weather, roadType },
      isManual: false,
      createdAt: Date.now(),
    };

    await addSession(session);
    pushSession(session).catch(() => {});
    router.replace({ pathname: '/drive-complete', params: { sessionId: session.id } } as any);
  }, [timer, teenName, stateCode, timeOfDay, weather, roadType, addSession]);

  const cancelEndDrive = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowConfirm(false);
  }, []);

  // End Drive button
  const endScale = useSharedValue(1);
  const endAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: endScale.value }],
  }));

  const timerText = formatTimer(timer.elapsedSeconds);
  const parts = timerText.split(':');

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
      <StatusBar style="light" />

      {/* Timer */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.timerContainer}>
        <BodyText style={styles.timerLabel}>{S.TIMER_LABEL}</BodyText>
        <View style={styles.timerRow}>
          <Heading variant="metric" color="#FFFFFF" style={styles.timerDigit}>
            {parts[0]}
          </Heading>
          <Animated.View style={colonStyle}>
            <Heading variant="metric" color={TEAL} style={styles.timerColon}>
              :
            </Heading>
          </Animated.View>
          <Heading variant="metric" color="#FFFFFF" style={styles.timerDigit}>
            {parts[1]}
          </Heading>
          <Animated.View style={colonStyle}>
            <Heading variant="metric" color={TEAL} style={styles.timerColon}>
              :
            </Heading>
          </Animated.View>
          <Heading variant="metric" color="#FFFFFF" style={styles.timerDigit}>
            {parts[2]}
          </Heading>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Navigation size={16} color={TEAL} />
            <Heading variant="h3" color="#FFFFFF">
              {timer.distanceMiles.toFixed(1)}
            </Heading>
            <BodyText style={styles.statUnit}>{S.DISTANCE_LABEL}</BodyText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Gauge size={16} color={TEAL} />
            <Heading variant="h3" color="#FFFFFF">
              {timer.speedMph}
            </Heading>
            <BodyText style={styles.statUnit}>{S.SPEED_LABEL}</BodyText>
          </View>
        </View>
      </Animated.View>

      {/* Conditions */}
      <View style={styles.conditionsContainer}>
        <ConditionChips
          timeOfDay={timeOfDay}
          weather={weather}
          roadType={roadType}
          onTimeOfDayChange={setTimeOfDay}
          onWeatherChange={setWeather}
          onRoadTypeChange={setRoadType}
          tealColor={TEAL}
        />
      </View>

      {/* End Drive */}
      <Pressable
        onPress={handleEndDrive}
        onPressIn={() => { endScale.value = withSpring(0.96, { damping: 15, stiffness: 200 }); }}
        onPressOut={() => { endScale.value = withSpring(1, { damping: 15, stiffness: 200 }); }}
      >
        <Animated.View style={[styles.endButton, endAnimatedStyle]}>
          <BodyText style={styles.endButtonText}>{S.END_DRIVE}</BodyText>
        </Animated.View>
      </Pressable>

      {/* Confirmation Modal */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.confirmOverlay}>
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
          <Animated.View entering={FadeIn.duration(150)} style={styles.confirmCard}>
            <Heading variant="h3" color="#FFFFFF" style={styles.confirmTitle}>
              {S.END_DRIVE_CONFIRM_TITLE}
            </Heading>
            <BodyText style={styles.confirmMessage}>
              {S.END_DRIVE_CONFIRM_MESSAGE}
            </BodyText>
            <View style={styles.confirmButtons}>
              <Pressable
                onPress={cancelEndDrive}
                style={[styles.confirmBtn, styles.confirmBtnCancel]}
              >
                <BodyText style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>
                  {S.END_DRIVE_CONFIRM_NO}
                </BodyText>
              </Pressable>
              <Pressable
                onPress={confirmEndDrive}
                style={[styles.confirmBtn, styles.confirmBtnSave]}
              >
                <BodyText style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>
                  {S.END_DRIVE_CONFIRM_YES}
                </BodyText>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  timerContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  timerLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerDigit: {
    fontSize: 64,
    lineHeight: 72,
  },
  timerColon: {
    fontSize: 56,
    lineHeight: 72,
    marginHorizontal: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 24,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  statUnit: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  conditionsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  endButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#C44545',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  endButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  confirmOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  confirmCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  confirmTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmMessage: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 15,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnCancel: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  confirmBtnSave: {
    backgroundColor: '#C44545',
  },
});
