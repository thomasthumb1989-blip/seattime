import { useState, useEffect, useCallback } from 'react';
import { KEYS, getItem, setItem } from '@src/utils/storage';
import type { DriveSession } from '@src/types';

export function useDriveSessions() {
  const [sessions, setSessions] = useState<DriveSession[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const stored = await getItem<DriveSession[]>(KEYS.sessions);
      setSessions(stored ?? []);
    } catch {
      setSessions([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addSession = useCallback(
    async (session: DriveSession) => {
      const updated = [session, ...sessions];
      setSessions(updated);
      await setItem(KEYS.sessions, updated);
    },
    [sessions]
  );

  const deleteSession = useCallback(
    async (id: string) => {
      const updated = sessions.filter((s) => s.id !== id);
      setSessions(updated);
      await setItem(KEYS.sessions, updated);
    },
    [sessions]
  );

  return { sessions, loading, addSession, deleteSession, reload: load };
}

export function getTotalHours(sessions: DriveSession[]): number {
  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  return Math.round((totalSeconds / 3600) * 10) / 10;
}

export function getNightHours(sessions: DriveSession[]): number {
  const totalSeconds = sessions
    .filter((s) => s.conditions.timeOfDay === 'night')
    .reduce((sum, s) => sum + s.durationSeconds, 0);
  return Math.round((totalSeconds / 3600) * 10) / 10;
}

export function getDayHours(sessions: DriveSession[]): number {
  const totalSeconds = sessions
    .filter((s) => s.conditions.timeOfDay === 'day')
    .reduce((sum, s) => sum + s.durationSeconds, 0);
  return Math.round((totalSeconds / 3600) * 10) / 10;
}

export function generateSessionId(): string {
  return `drive_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function getWeeklyHours(sessions: DriveSession[]): number[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - mondayOffset);
  const mondayMs = monday.getTime();

  const hours = [0, 0, 0, 0, 0, 0, 0];
  for (const s of sessions) {
    const sessionDate = new Date(s.startTime);
    if (sessionDate.getTime() >= mondayMs) {
      const sDow = sessionDate.getDay();
      const idx = sDow === 0 ? 6 : sDow - 1;
      hours[idx] += s.durationSeconds / 3600;
    }
  }
  return hours.map((h) => Math.round(h * 10) / 10);
}

export function getAverageDuration(sessions: DriveSession[]): number {
  if (sessions.length === 0) return 0;
  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  return Math.round(totalSeconds / sessions.length / 60);
}

export function getLongestDrive(sessions: DriveSession[]): number {
  if (sessions.length === 0) return 0;
  const maxSeconds = Math.max(...sessions.map((s) => s.durationSeconds));
  return Math.round(maxSeconds / 60);
}

export function getCurrentStreak(sessions: DriveSession[]): number {
  if (sessions.length === 0) return 0;

  const daySet = new Set<string>();
  for (const s of sessions) {
    const d = new Date(s.startTime);
    daySet.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const check = new Date(today);

  const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  if (!daySet.has(key(check))) {
    check.setDate(check.getDate() - 1);
    if (!daySet.has(key(check))) return 0;
  }

  while (daySet.has(key(check))) {
    streak++;
    check.setDate(check.getDate() - 1);
  }
  return streak;
}

export function getProjectedCompletion(
  sessions: DriveSession[],
  requiredTotal: number,
  currentHours: number
): Date | null {
  if (requiredTotal <= 0 || currentHours >= requiredTotal) return null;
  if (sessions.length < 2) return null;

  const fourWeeksAgo = Date.now() - 28 * 24 * 60 * 60 * 1000;
  const recentSessions = sessions.filter((s) => s.startTime >= fourWeeksAgo);
  if (recentSessions.length === 0) return null;

  const recentSeconds = recentSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const recentHours = recentSeconds / 3600;

  const oldest = Math.min(...recentSessions.map((s) => s.startTime));
  const weeksCovered = Math.max((Date.now() - oldest) / (7 * 24 * 60 * 60 * 1000), 0.5);
  const hoursPerWeek = recentHours / weeksCovered;

  if (hoursPerWeek <= 0) return null;

  const remaining = requiredTotal - currentHours;
  const weeksNeeded = remaining / hoursPerWeek;
  const completionDate = new Date(Date.now() + weeksNeeded * 7 * 24 * 60 * 60 * 1000);
  return completionDate;
}
