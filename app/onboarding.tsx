import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
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
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, MapPin, Car } from 'lucide-react-native';

import { Heading } from '@src/components/ui/Heading';
import { BodyText } from '@src/components/ui/BodyText';
import { Colors, type ColorScheme } from '@src/constants/colors';
import { Strings } from '@src/constants/strings';
import { STATE_REQUIREMENTS } from '@src/data/stateRequirements';
import { useOnboarding } from '@src/hooks/useOnboarding';
import type { StateRequirement } from '@src/types';

type AppColors = (typeof Colors)[ColorScheme];

const S = Strings.ONBOARDING;

// ─── Page Indicator ───
function PageDots({ current, total }: { current: number; total: number }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  return (
    <View style={styles.dotsContainer}>
      {Array.from({ length: total }).map((_, i) => (
        <Dot key={i} active={i === current} colors={colors} />
      ))}
    </View>
  );
}

function Dot({ active, colors }: { active: boolean; colors: AppColors }) {
  const width = useSharedValue(active ? 24 : 8);
  const opacity = useSharedValue(active ? 1 : 0.3);

  useEffect(() => {
    width.value = withSpring(active ? 24 : 8, { damping: 15, stiffness: 200 });
    opacity.value = withTiming(active ? 1 : 0.3, { duration: 200 });
  }, [active, width, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: colors.primary },
        animatedStyle,
      ]}
    />
  );
}

// ─── Screen Wrapper (fadeIn + translateY) ───
function ScreenWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.screen}
    >
      {children}
    </Animated.View>
  );
}

// ─── Welcome Screen ───
function WelcomeScreen({ onNext, colors }: { onNext: () => void; colors: AppColors }) {
  return (
    <ScreenWrapper>
      <View style={styles.screenContent}>
        <View style={styles.iconContainer}>
          <Car size={64} color={colors.primary} strokeWidth={1.5} />
        </View>
        <Heading variant="h1" style={styles.headline}>
          {S.WELCOME_HEADLINE}
        </Heading>
        <BodyText secondary style={styles.subtitle}>
          {S.WELCOME_SUBTITLE}
        </BodyText>
      </View>
      <PrimaryButton label={S.GET_STARTED} onPress={onNext} colors={colors} />
    </ScreenWrapper>
  );
}

// ─── State Picker Screen ───
function StatePickerScreen({
  selectedState,
  onSelectState,
  onNext,
  colors,
}: {
  selectedState: string;
  onSelectState: (abbr: string) => void;
  onNext: () => void;
  colors: AppColors;
}) {
  const [search, setSearch] = useState('');

  const filtered = STATE_REQUIREMENTS.filter((s) =>
    s.state.toLowerCase().includes(search.toLowerCase()) ||
    s.abbreviation.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = useCallback(
    ({ item, index }: { item: StateRequirement; index: number }) => (
      <StateRow
        item={item}
        selected={selectedState === item.abbreviation}
        onSelect={onSelectState}
        colors={colors}
        index={index}
      />
    ),
    [selectedState, onSelectState, colors]
  );

  return (
    <ScreenWrapper>
      <Heading variant="h2" style={styles.headline}>
        {S.STATE_HEADLINE}
      </Heading>
      <View style={[styles.searchContainer, { borderColor: colors.border }]}>
        <MapPin size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={S.STATE_SEARCH_PLACEHOLDER}
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.abbreviation}
        renderItem={renderItem}
        style={styles.stateList}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
      <PrimaryButton
        label={S.STATE_CONTINUE}
        onPress={onNext}
        colors={colors}
        disabled={selectedState.length === 0}
      />
    </ScreenWrapper>
  );
}

function StateRow({
  item,
  selected,
  onSelect,
  colors,
  index,
}: {
  item: StateRequirement;
  selected: boolean;
  onSelect: (abbr: string) => void;
  colors: AppColors;
  index: number;
}) {
  const handlePress = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSelect(item.abbreviation);
  }, [item.abbreviation, onSelect]);

  return (
    <Animated.View entering={FadeIn.delay(Math.min(index * 50, 500)).duration(200)}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.stateRow,
          {
            borderColor: selected ? colors.primary : colors.border,
            backgroundColor: selected ? colors.primary + '10' : 'transparent',
          },
        ]}
      >
        <View style={styles.stateInfo}>
          <BodyText style={{ fontWeight: '500' }}>{item.state}</BodyText>
          <BodyText variant="caption" secondary>
            {item.hasRequirement
              ? `${item.totalHours} ${S.STATE_HOURS_LABEL}`
              : S.STATE_NO_REQUIREMENT}
          </BodyText>
        </View>
        {selected && (
          <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
            <Check size={14} color="#FFFFFF" strokeWidth={3} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ─── Teen Name Screen ───
function TeenNameScreen({
  teenName,
  onChangeName,
  onNext,
  colors,
}: {
  teenName: string;
  onChangeName: (name: string) => void;
  onNext: () => void;
  colors: AppColors;
}) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ScreenWrapper>
      <View style={styles.screenContent}>
        <Heading variant="h2" style={styles.headline}>
          {S.TEEN_NAME_HEADLINE}
        </Heading>
        <TextInput
          ref={inputRef}
          style={[
            styles.nameInput,
            {
              color: colors.text,
              borderColor: teenName.trim().length > 0 ? colors.primary : colors.border,
            },
          ]}
          placeholder={S.TEEN_NAME_PLACEHOLDER}
          placeholderTextColor={colors.textSecondary}
          value={teenName}
          onChangeText={onChangeName}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={() => {
            if (teenName.trim().length > 0) onNext();
          }}
        />
      </View>
      <PrimaryButton
        label={S.TEEN_NAME_CONTINUE}
        onPress={onNext}
        colors={colors}
        disabled={teenName.trim().length === 0}
      />
    </ScreenWrapper>
  );
}

// ─── Ready Screen ───
function ReadyScreen({
  teenName,
  selectedState,
  onComplete,
  colors,
}: {
  teenName: string;
  selectedState: string;
  onComplete: () => void;
  colors: AppColors;
}) {
  const stateData = STATE_REQUIREMENTS.find((s) => s.abbreviation === selectedState);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    checkScale.value = withSpring(1, { damping: 12, stiffness: 180, overshootClamping: false });
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [checkScale]);

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const requirementText = stateData?.hasRequirement
    ? S.READY_REQUIREMENT(stateData.state, stateData.totalHours, stateData.nightHours)
    : stateData
      ? S.READY_NO_REQUIREMENT(stateData.state)
      : '';

  return (
    <ScreenWrapper>
      <View style={styles.screenContent}>
        <Animated.View
          style={[
            styles.readyCheckCircle,
            { backgroundColor: colors.primary },
            checkAnimatedStyle,
          ]}
        >
          <Check size={48} color="#FFFFFF" strokeWidth={2.5} />
        </Animated.View>
        <Heading variant="h1" style={styles.headline}>
          {S.READY_HEADLINE}
        </Heading>
        <Heading variant="h3" style={{ ...styles.teenNameDisplay, color: colors.primary }}>
          {teenName.trim()}
        </Heading>
        <BodyText secondary style={styles.requirementText}>
          {requirementText}
        </BodyText>
      </View>
      <PrimaryButton label={S.START_TRACKING} onPress={onComplete} colors={colors} />
    </ScreenWrapper>
  );
}

// ─── Shared Primary Button ───
function PrimaryButton({
  label,
  onPress,
  colors,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  colors: AppColors;
  disabled?: boolean;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 200 });
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.primaryButton,
          { backgroundColor: colors.primary, opacity: disabled ? 0.4 : 1 },
          animatedStyle,
        ]}
      >
        <BodyText style={styles.primaryButtonText}>{label}</BodyText>
      </Animated.View>
    </Pressable>
  );
}

// ─── Main Onboarding Screen ───
export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const insets = useSafeAreaInsets();

  const {
    step,
    totalSteps,
    selectedState,
    setSelectedState,
    teenName,
    setTeenName,
    canContinue,
    next,
    back,
    complete,
  } = useOnboarding();

  const handleComplete = useCallback(async () => {
    await complete();
    router.replace('/(tabs)' as any);
  }, [complete]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 16,
        },
      ]}
    >
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

      {step === 0 && <WelcomeScreen onNext={next} colors={colors} />}
      {step === 1 && (
        <StatePickerScreen
          selectedState={selectedState}
          onSelectState={setSelectedState}
          onNext={next}
          colors={colors}
        />
      )}
      {step === 2 && (
        <TeenNameScreen
          teenName={teenName}
          onChangeName={setTeenName}
          onNext={next}
          colors={colors}
        />
      )}
      {step === 3 && (
        <ReadyScreen
          teenName={teenName}
          selectedState={selectedState}
          onComplete={handleComplete}
          colors={colors}
        />
      )}

      <PageDots current={step} total={totalSteps} />
    </View>
  );
}

// ─── Styles ───
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  screen: {
    flex: 1,
  },
  screenContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: 'rgba(58, 125, 126, 0.08)',
  },
  headline: {
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
  },
  stateList: {
    flex: 1,
    marginBottom: 16,
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8,
  },
  stateInfo: {
    flex: 1,
    gap: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameInput: {
    width: '100%',
    fontSize: 20,
    fontFamily: 'DMSans_400Regular',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    textAlign: 'center',
    marginTop: 24,
  },
  readyCheckCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  teenNameDisplay: {
    textAlign: 'center',
    marginBottom: 8,
  },
  requirementText: {
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  primaryButton: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
