import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronRight } from 'lucide-react-native';

import { BodyText } from '@src/components/ui/BodyText';
import type { AppColors } from '@src/constants/colors';

interface SettingsRowProps {
  label: string;
  value?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  colors: AppColors;
  isLast?: boolean;
}

export function SettingsRow({
  label,
  value,
  icon,
  onPress,
  showChevron = true,
  destructive = false,
  colors,
  isLast = false,
}: SettingsRowProps) {
  const handlePress = () => {
    if (!onPress) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(
        destructive
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light
      );
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={!onPress}
      style={[
        styles.row,
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
      ]}
    >
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <View style={styles.labelWrap}>
        <BodyText style={{ color: destructive ? colors.error : colors.text, fontWeight: '500' }}>
          {label}
        </BodyText>
      </View>
      {value && (
        <BodyText variant="caption" secondary style={styles.value}>
          {value}
        </BodyText>
      )}
      {onPress && showChevron && (
        <ChevronRight size={18} color={colors.textSecondary} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  iconWrap: {
    width: 24,
    alignItems: 'center',
  },
  labelWrap: {
    flex: 1,
  },
  value: {
    marginRight: 4,
  },
});
