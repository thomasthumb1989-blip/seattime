import React, { useCallback, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClipboardList } from 'lucide-react-native';

import { Heading } from '@src/components/ui/Heading';
import { BodyText } from '@src/components/ui/BodyText';
import { DriveCard } from '@src/components/drive/DriveCard';
import { FilterChips, type FilterKey } from '@src/components/drive/FilterChips';
import { Colors } from '@src/constants/colors';
import { Strings } from '@src/constants/strings';
import { useDriveSessions, getTotalHours, getNightHours } from '@src/hooks/useDriveSessions';
import type { DriveSession } from '@src/types';

const SH = Strings.HISTORY;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: SH.FILTER_ALL },
  { key: 'day', label: SH.FILTER_DAY },
  { key: 'night', label: SH.FILTER_NIGHT },
  { key: 'highway', label: SH.FILTER_HIGHWAY },
  { key: 'residential', label: SH.FILTER_RESIDENTIAL },
  { key: 'rural', label: SH.FILTER_RURAL },
  { key: 'parking', label: SH.FILTER_PARKING },
  { key: 'manual', label: SH.FILTER_MANUAL },
];

const EMPTY_MESSAGES: Record<FilterKey, string> = {
  all: SH.EMPTY_ALL,
  day: SH.EMPTY_DAY,
  night: SH.EMPTY_NIGHT,
  highway: SH.EMPTY_HIGHWAY,
  residential: SH.EMPTY_RESIDENTIAL,
  rural: SH.EMPTY_RURAL,
  parking: SH.EMPTY_PARKING,
  manual: SH.EMPTY_MANUAL,
};

function filterSessions(sessions: DriveSession[], filter: FilterKey): DriveSession[] {
  switch (filter) {
    case 'day': return sessions.filter((s) => s.conditions.timeOfDay === 'day');
    case 'night': return sessions.filter((s) => s.conditions.timeOfDay === 'night');
    case 'highway': return sessions.filter((s) => s.conditions.roadType === 'highway');
    case 'residential': return sessions.filter((s) => s.conditions.roadType === 'residential');
    case 'rural': return sessions.filter((s) => s.conditions.roadType === 'rural');
    case 'parking': return sessions.filter((s) => s.conditions.roadType === 'parking');
    case 'manual': return sessions.filter((s) => s.isManual);
    default: return sessions;
  }
}

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const insets = useSafeAreaInsets();
  const { sessions, loading, reload } = useDriveSessions();

  const [filter, setFilter] = useState<FilterKey>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => filterSessions(sessions, filter), [sessions, filter]);
  const filteredTotalHours = getTotalHours(filtered);
  const filteredNightHours = getNightHours(filtered);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  const handleCardPress = useCallback((session: DriveSession) => {
    console.log('Drive detail:', session.id);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(300)}>
          <Heading variant="h2">{SH.TITLE}</Heading>
          <BodyText variant="caption" secondary style={styles.subtitle}>
            {SH.DRIVE_COUNT(sessions.length)}
          </BodyText>
        </Animated.View>

        {/* Filters */}
        <Animated.View entering={FadeIn.delay(100).duration(300)}>
          <FilterChips
            filters={FILTERS}
            selected={filter}
            onSelect={setFilter}
            colors={colors}
          />
        </Animated.View>

        {/* Summary bar */}
        {filtered.length > 0 && (
          <Animated.View entering={FadeIn.delay(150).duration(200)}>
            <View style={[styles.summaryBar, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '20' }]}>
              <BodyText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>
                {SH.SUMMARY(filteredTotalHours, filteredNightHours)}
              </BodyText>
            </View>
          </Animated.View>
        )}

        {/* Drive list */}
        {filtered.map((session, index) => (
          <DriveCard
            key={session.id}
            session={session}
            colors={colors}
            index={index}
            showTimeRange
            onPress={handleCardPress}
          />
        ))}

        {/* Empty state */}
        {filtered.length === 0 && !loading && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '15' }]}>
              <ClipboardList size={32} color={colors.primary} />
            </View>
            <Heading variant="h3" style={styles.emptyTitle}>
              {EMPTY_MESSAGES[filter]}
            </Heading>
            <BodyText secondary style={styles.emptySubtitle}>
              {SH.EMPTY_SUBTITLE}
            </BodyText>
          </Animated.View>
        )}
      </ScrollView>
    </View>
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
  subtitle: {
    marginTop: 4,
    marginBottom: 20,
  },
  summaryBar: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 64,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
});
