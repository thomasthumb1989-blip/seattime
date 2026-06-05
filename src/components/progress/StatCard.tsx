import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Heading } from '@src/components/ui/Heading';
import { BodyText } from '@src/components/ui/BodyText';
import type { AppColors } from '@src/constants/colors';

interface StatCardProps {
  label: string;
  value: string;
  index: number;
  colors: AppColors;
}

export function StatCard({ label, value, index, colors }: StatCardProps) {
  return (
    <Animated.View
      entering={FadeIn.delay(index * 100).duration(200)}
      style={[styles.card, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
    >
      <Heading variant="h2" color={colors.primary} style={{ fontSize: 22 }}>
        {value}
      </Heading>
      <BodyText variant="caption" secondary>{label}</BodyText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
});
