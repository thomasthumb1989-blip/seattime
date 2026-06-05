import React, { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react-native';

import { Heading } from '@src/components/ui/Heading';
import { BodyText } from '@src/components/ui/BodyText';
import { Colors, type AppColors } from '@src/constants/colors';
import { Strings } from '@src/constants/strings';

const SE = Strings.ERROR;

interface Props {
  error: Error;
  resetError: () => void;
}

export function ErrorFallback({ error, resetError }: Props) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const insets = useSafeAreaInsets();
  const [showDetails, setShowDetails] = useState(false);
  const isDev = __DEV__;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
          paddingTop: insets.top + 48,
          paddingBottom: insets.bottom + 32,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: colors.warning + '18' }]}>
          <AlertTriangle size={40} color={colors.warning} strokeWidth={1.8} />
        </View>

        <Heading variant="h2" style={styles.headline}>{SE.TITLE}</Heading>

        <BodyText secondary style={styles.reassurance}>{SE.REASSURANCE}</BodyText>

        <View style={styles.buttons}>
          <ActionButton
            label={SE.TRY_AGAIN}
            onPress={resetError}
            colors={colors}
            primary
          />
          <ActionButton
            label={SE.RESTART}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              resetError();
            }}
            colors={colors}
          />
        </View>

        {isDev && (
          <View style={styles.devSection}>
            <Pressable
              onPress={() => setShowDetails(!showDetails)}
              style={[styles.devToggle, { borderColor: colors.border }]}
            >
              <BodyText variant="caption" style={{ fontWeight: '600' }}>
                {SE.DEV_DETAILS}
              </BodyText>
              {showDetails
                ? <ChevronUp size={16} color={colors.textSecondary} />
                : <ChevronDown size={16} color={colors.textSecondary} />}
            </Pressable>
            {showDetails && (
              <ScrollView
                style={[styles.devDetails, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
              >
                <BodyText variant="caption" style={{ color: colors.error, fontWeight: '600', marginBottom: 4 }}>
                  {error.message}
                </BodyText>
                <BodyText variant="caption" secondary style={{ fontSize: 10, lineHeight: 16 }}>
                  {error.stack ?? 'No stack trace'}
                </BodyText>
              </ScrollView>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  colors,
  primary = false,
}: {
  label: string;
  onPress: () => void;
  colors: AppColors;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[
        styles.button,
        primary
          ? { backgroundColor: colors.primary }
          : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
      ]}
    >
      <BodyText
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: primary ? '#FFFFFF' : colors.text,
        }}
      >
        {label}
      </BodyText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  headline: {
    textAlign: 'center',
    marginBottom: 8,
  },
  reassurance: {
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  button: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  devSection: {
    width: '100%',
    marginTop: 32,
  },
  devToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 10,
  },
  devDetails: {
    marginTop: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    maxHeight: 200,
  },
});
