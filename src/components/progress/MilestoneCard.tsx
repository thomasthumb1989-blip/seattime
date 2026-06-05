import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Check, Lock, Flag, Star, Award, Trophy } from 'lucide-react-native';

import { Heading } from '@src/components/ui/Heading';
import { BodyText } from '@src/components/ui/BodyText';
import type { AppColors } from '@src/constants/colors';

interface MilestoneCardProps {
  name: string;
  percentage: number;
  achieved: boolean;
  currentProgress: number;
  index: number;
  colors: AppColors;
}

function getMilestoneIcon(pct: number, achieved: boolean, colors: AppColors) {
  const color = achieved ? colors.accent : colors.textSecondary;
  const size = 20;
  if (pct >= 1.0) return <Trophy size={size} color={color} />;
  if (pct >= 0.75) return <Award size={size} color={color} />;
  if (pct >= 0.5) return <Star size={size} color={color} />;
  return <Flag size={size} color={color} />;
}

export function MilestoneCard({
  name,
  percentage,
  achieved,
  currentProgress,
  index,
  colors,
}: MilestoneCardProps) {
  const progressToward = Math.min(currentProgress / percentage, 1);

  if (achieved && Platform.OS !== 'web') {
    // Haptic fires on first render of achieved card
  }

  return (
    <Animated.View entering={FadeIn.delay(index * 150).duration(300)}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.bgSecondary,
            borderColor: achieved ? colors.accent + '40' : colors.border,
            borderWidth: achieved ? 1.5 : 1,
          },
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: achieved ? colors.accent + '15' : colors.textSecondary + '12' }]}>
          {getMilestoneIcon(percentage, achieved, colors)}
        </View>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Heading variant="h3" style={{ fontSize: 15 }}>{name}</Heading>
            {achieved ? (
              <View style={[styles.achievedBadge, { backgroundColor: colors.accent + '15' }]}>
                <Check size={12} color={colors.accent} />
                <BodyText variant="caption" style={{ color: colors.accent, fontWeight: '600', fontSize: 11 }}>
                  Done
                </BodyText>
              </View>
            ) : (
              <Lock size={14} color={colors.textSecondary} />
            )}
          </View>
          <BodyText variant="caption" secondary>
            {Math.round(percentage * 100)}% of total hours
          </BodyText>
          {!achieved && (
            <View style={styles.barContainer}>
              <View style={[styles.barBg, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: colors.primary,
                      width: `${Math.round(progressToward * 100)}%`,
                    },
                  ]}
                />
              </View>
              <BodyText variant="caption" secondary style={{ fontSize: 11 }}>
                {Math.round(progressToward * 100)}%
              </BodyText>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  barBg: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});
