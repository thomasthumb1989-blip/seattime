import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { BodyText } from '@src/components/ui/BodyText';
import type { AppColors } from '@src/constants/colors';

export type FilterKey =
  | 'all'
  | 'day'
  | 'night'
  | 'highway'
  | 'residential'
  | 'rural'
  | 'parking'
  | 'manual';

interface FilterChipsProps {
  filters: { key: FilterKey; label: string }[];
  selected: FilterKey;
  onSelect: (key: FilterKey) => void;
  colors: AppColors;
}

function Chip({
  label,
  selected,
  onPress,
  colors,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  colors: AppColors;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 15, stiffness: 200 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 200 }); }}
    >
      <Animated.View
        style={[
          styles.chip,
          {
            backgroundColor: selected ? colors.primary : 'transparent',
            borderColor: selected ? colors.primary : colors.border,
          },
          animatedStyle,
        ]}
      >
        <BodyText
          variant="caption"
          style={{
            fontWeight: '600',
            color: selected ? '#FFFFFF' : colors.textSecondary,
          }}
        >
          {label}
        </BodyText>
      </Animated.View>
    </Pressable>
  );
}

export function FilterChips({ filters, selected, onSelect, colors }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}
    >
      {filters.map((f) => (
        <Chip
          key={f.key}
          label={f.label}
          selected={selected === f.key}
          onPress={() => onSelect(f.key)}
          colors={colors}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginBottom: 16,
    flexGrow: 0,
  },
  scrollContent: {
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
});
