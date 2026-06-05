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
