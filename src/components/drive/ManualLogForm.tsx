import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
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
import { X } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

import { Heading } from '@src/components/ui/Heading';
import { BodyText } from '@src/components/ui/BodyText';
import { Colors, type AppColors } from '@src/constants/colors';
import { Strings } from '@src/constants/strings';
import { detectTimeOfDay } from '@src/hooks/useDriveTimer';
import { generateSessionId } from '@src/hooks/useDriveSessions';
import type { DriveSession, TimeOfDay, Weather, RoadType } from '@src/types';

const S = Strings.DRIVE;

interface ManualLogFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (session: DriveSession) => void;
  teenName: string;
  state: string;
}

interface ManualChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  colors: AppColors;
}

function ManualChip({ label, selected, onPress, colors }: ManualChipProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 15, stiffness: 200 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 200 }); }}
    >
      <Animated.View
        style={[
          styles.manualChip,
          {
            borderColor: selected ? colors.primary : colors.border,
            backgroundColor: selected ? colors.primary + '15' : 'transparent',
          },
          animatedStyle,
        ]}
      >
        <BodyText style={{ fontSize: 13, fontWeight: '500', color: selected ? colors.primary : colors.textSecondary }}>
          {label}
        </BodyText>
      </Animated.View>
    </Pressable>
  );
}

export function ManualLogForm({ visible, onClose, onSave, teenName, state }: ManualLogFormProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(detectTimeOfDay());
  const [weather, setWeather] = useState<Weather>('clear');
  const [roadType, setRoadType] = useState<RoadType>('residential');

  const buttonScale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const canSave = () => {
    const h = parseInt(hours || '0', 10);
    const m = parseInt(minutes || '0', 10);
    return h > 0 || m > 0;
  };

  const handleSave = () => {
    if (!canSave()) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const h = parseInt(hours || '0', 10);
    const m = parseInt(minutes || '0', 10);
    const durationSeconds = h * 3600 + m * 60;
    const now = Date.now();

    const session: DriveSession = {
      id: generateSessionId(),
      teenName,
      state,
      startTime: now - durationSeconds * 1000,
      endTime: now,
      durationSeconds,
      distanceMiles: 0,
      route: [],
      conditions: { timeOfDay, weather, roadType },
      isManual: true,
      createdAt: now,
    };

    onSave(session);
    setHours('');
    setMinutes('');
    setTimeOfDay(detectTimeOfDay());
    setWeather('clear');
    setRoadType('residential');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <BlurView intensity={40} tint={theme} style={StyleSheet.absoluteFill} />
        <Animated.View
          entering={FadeIn.duration(200)}
          style={[styles.modalContent, { backgroundColor: colors.bg }]}
        >
          <View style={styles.modalHeader}>
            <Heading variant="h2">{S.MANUAL_LOG_TITLE}</Heading>
            <Pressable onPress={onClose} hitSlop={16}>
              <X size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.form}>
            <BodyText style={{ ...styles.fieldLabel, color: colors.textSecondary }}>
              Duration
            </BodyText>
            <View style={styles.durationRow}>
              <View style={styles.durationField}>
                <TextInput
                  style={[styles.durationInput, { color: colors.text, borderColor: colors.border }]}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  value={hours}
                  onChangeText={(t) => setHours(t.replace(/[^0-9]/g, ''))}
                  maxLength={2}
                />
                <BodyText variant="caption" secondary>{S.MANUAL_HOURS_LABEL}</BodyText>
              </View>
              <View style={styles.durationField}>
                <TextInput
                  style={[styles.durationInput, { color: colors.text, borderColor: colors.border }]}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  value={minutes}
                  onChangeText={(t) => setMinutes(t.replace(/[^0-9]/g, ''))}
                  maxLength={2}
                />
                <BodyText variant="caption" secondary>{S.MANUAL_MINUTES_LABEL}</BodyText>
              </View>
            </View>

            <BodyText style={{ ...styles.fieldLabel, color: colors.textSecondary }}>
              Time of Day
            </BodyText>
            <View style={styles.chipRow}>
              <ManualChip label={S.TIME_OF_DAY_DAY} selected={timeOfDay === 'day'} onPress={() => setTimeOfDay('day')} colors={colors} />
              <ManualChip label={S.TIME_OF_DAY_NIGHT} selected={timeOfDay === 'night'} onPress={() => setTimeOfDay('night')} colors={colors} />
            </View>

            <BodyText style={{ ...styles.fieldLabel, color: colors.textSecondary }}>
              Weather
            </BodyText>
            <View style={styles.chipRow}>
              <ManualChip label={S.WEATHER_CLEAR} selected={weather === 'clear'} onPress={() => setWeather('clear')} colors={colors} />
              <ManualChip label={S.WEATHER_RAIN} selected={weather === 'rain'} onPress={() => setWeather('rain')} colors={colors} />
              <ManualChip label={S.WEATHER_SNOW} selected={weather === 'snow'} onPress={() => setWeather('snow')} colors={colors} />
              <ManualChip label={S.WEATHER_FOG} selected={weather === 'fog'} onPress={() => setWeather('fog')} colors={colors} />
            </View>

            <BodyText style={{ ...styles.fieldLabel, color: colors.textSecondary }}>
              Road Type
            </BodyText>
            <View style={styles.chipRow}>
              <ManualChip label={S.ROAD_RESIDENTIAL} selected={roadType === 'residential'} onPress={() => setRoadType('residential')} colors={colors} />
              <ManualChip label={S.ROAD_HIGHWAY} selected={roadType === 'highway'} onPress={() => setRoadType('highway')} colors={colors} />
              <ManualChip label={S.ROAD_RURAL} selected={roadType === 'rural'} onPress={() => setRoadType('rural')} colors={colors} />
              <ManualChip label={S.ROAD_PARKING} selected={roadType === 'parking'} onPress={() => setRoadType('parking')} colors={colors} />
            </View>
          </ScrollView>

          <Pressable
            onPress={handleSave}
            onPressIn={() => { buttonScale.value = withSpring(0.96, { damping: 15, stiffness: 200 }); }}
            onPressOut={() => { buttonScale.value = withSpring(1, { damping: 15, stiffness: 200 }); }}
            disabled={!canSave()}
          >
            <Animated.View
              style={[
                styles.saveButton,
                { backgroundColor: colors.primary, opacity: canSave() ? 1 : 0.4 },
                buttonAnimatedStyle,
              ]}
            >
              <BodyText style={styles.saveButtonText}>{S.MANUAL_SAVE}</BodyText>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  form: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 16,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 16,
  },
  durationField: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  durationInput: {
    width: '100%',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  manualChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  saveButton: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
