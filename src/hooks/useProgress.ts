import { useMemo } from 'react';
import { getStateByAbbreviation } from '@src/data/stateRequirements';
import { getTotalHours, getNightHours } from '@src/hooks/useDriveSessions';
import type { DriveSession, StateRequirement } from '@src/types';

export interface ProgressData {
  totalHours: number;
  nightHours: number;
  requiredTotal: number;
  requiredNight: number;
  totalProgress: number;
  nightProgress: number;
  hoursRemaining: number;
  nightRemaining: number;
  milestone: MilestoneHit | null;
  stateData: StateRequirement | null;
}

export interface MilestoneHit {
  name: string;
  hours: number;
  percentage: number;
}

const MILESTONE_THRESHOLDS = [0.25, 0.5, 0.75, 1.0];

function getMilestoneName(pct: number): string {
  if (pct >= 1.0) return 'Goal Complete!';
  if (pct >= 0.75) return '75% There!';
  if (pct >= 0.5) return 'Halfway!';
  return '25% Done!';
}

export function checkMilestone(
  prevHours: number,
  newHours: number,
  requiredTotal: number
): MilestoneHit | null {
  if (requiredTotal <= 0) return null;

  const prevPct = prevHours / requiredTotal;
  const newPct = newHours / requiredTotal;

  for (let i = MILESTONE_THRESHOLDS.length - 1; i >= 0; i--) {
    const threshold = MILESTONE_THRESHOLDS[i];
    if (newPct >= threshold && prevPct < threshold) {
      return {
        name: getMilestoneName(threshold),
        hours: Math.round(requiredTotal * threshold),
        percentage: threshold,
      };
    }
  }
  return null;
}

export function useProgress(
  sessions: DriveSession[],
  stateCode: string,
  latestSession?: DriveSession
): ProgressData {
  return useMemo(() => {
    const stateData = getStateByAbbreviation(stateCode) ?? null;
    const requiredTotal = stateData?.totalHours ?? 0;
    const requiredNight = stateData?.nightHours ?? 0;

    const totalHours = getTotalHours(sessions);
    const nightHours = getNightHours(sessions);

    const totalProgress = requiredTotal > 0 ? Math.min(totalHours / requiredTotal, 1) : 0;
    const nightProgress = requiredNight > 0 ? Math.min(nightHours / requiredNight, 1) : 0;

    const hoursRemaining = Math.max(requiredTotal - totalHours, 0);
    const nightRemaining = Math.max(requiredNight - nightHours, 0);

    let milestone: MilestoneHit | null = null;
    if (latestSession && requiredTotal > 0) {
      const prevSeconds = sessions
        .filter((s) => s.id !== latestSession.id)
        .reduce((sum, s) => sum + s.durationSeconds, 0);
      const prevHours = prevSeconds / 3600;
      milestone = checkMilestone(prevHours, totalHours, requiredTotal);
    }

    return {
      totalHours,
      nightHours,
      requiredTotal,
      requiredNight,
      totalProgress,
      nightProgress,
      hoursRemaining,
      nightRemaining,
      milestone,
      stateData,
    };
  }, [sessions, stateCode, latestSession]);
}
