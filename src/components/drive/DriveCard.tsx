import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Moon, Sun, Cloud, Snowflake, Eye, MapPin } from 'lucide-react-native';

import { Heading } from '@src/components/ui/Heading';
import { BodyText } from '@src/components/ui/BodyText';
import type { AppColors } from '@src/constants/colors';
import type { DriveSession } from '@src/types';

interface DriveCardProps {
  session: DriveSession;
  colors: AppColors;
  index?: number;
  showTimeRange?: boolean;
  onPress?: (session: DriveSession) => void;
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getWeatherIcon(weather: string, color: string) {
  switch (weather) {
    case 'rain': return <Cloud size={12} color={color} />;
    case 'snow': return <Snowflake size={12} color={color} />;
    case 'fog': return <Eye size={12} color={color} />;
    default: return <Sun size={12} color={color} />;
  }
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function DriveCard({
  session,
  colors,
  index = 0,
  showTimeRange = false,
  onPress,
}: DriveCardProps) {
  const minutes = Math.round(session.durationSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const durationText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  const date = new Date(session.startTime);
  const dateText = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const isNight = session.conditions.timeOfDay === 'night';

  const content = (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.bgSecondary, borderColor: colors.border },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.icon, { backgroundColor: isNight ? colors.accent + '20' : colors.primary + '20' }]}>
          {isNight ? (
            <Moon size={16} color={colors.accent} />
          ) : (
            <Sun size={16} color={colors.primary} />
          )}
        </View>
        <View style={styles.info}>
          <Heading variant="h3" style={{ fontSize: 16 }}>{durationText}</Heading>
          <BodyText variant="caption" secondary>{dateText}</BodyText>
        </View>
        {session.distanceMiles > 0 ? (
          <BodyText variant="caption" secondary>
            {session.distanceMiles.toFixed(1)} mi
          </BodyText>
        ) : session.isManual ? (
          <BodyText variant="caption" secondary style={{ fontStyle: 'italic' }}>
            Manual
          </BodyText>
        ) : null}
      </View>

      {showTimeRange && !session.isManual && (
        <BodyText variant="caption" secondary style={styles.timeRange}>
          {formatTime(session.startTime)} — {formatTime(session.endTime)}
        </BodyText>
      )}

      <View style={styles.badgeRow}>
        <View style={[styles.badge, { backgroundColor: isNight ? colors.accent + '15' : colors.primary + '15' }]}>
          {isNight ? <Moon size={12} color={colors.accent} /> : <Sun size={12} color={colors.primary} />}
          <BodyText variant="caption" style={{ fontWeight: '500', fontSize: 12 }}>
            {isNight ? 'Night' : 'Day'}
          </BodyText>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.textSecondary + '12' }]}>
          {getWeatherIcon(session.conditions.weather, colors.textSecondary)}
          <BodyText variant="caption" secondary style={{ fontSize: 12 }}>
            {capitalizeFirst(session.conditions.weather)}
          </BodyText>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.textSecondary + '12' }]}>
          <MapPin size={12} color={colors.textSecondary} />
          <BodyText variant="caption" secondary style={{ fontSize: 12 }}>
            {capitalizeFirst(session.conditions.roadType)}
          </BodyText>
        </View>
      </View>
    </View>
  );

  return (
    <Animated.View entering={FadeIn.delay(index * 50).duration(200)}>
      {onPress ? (
        <Pressable onPress={() => onPress(session)}>
          {content}
        </Pressable>
      ) : (
        content
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  timeRange: {
    marginBottom: 10,
    marginLeft: 52,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
});
