/*
 * Firestore Security Rules — Apply in Firebase Console → Firestore → Rules
 *
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /families/{familyId} {
 *       allow read, write: if request.auth != null
 *         && request.auth.uid in resource.data.members;
 *       allow create: if request.auth != null;
 *     }
 *     match /families/{familyId}/sessions/{sessionId} {
 *       allow read, write: if request.auth != null
 *         && request.auth.uid in
 *            get(/databases/$(database)/documents/families/$(familyId)).data.members;
 *     }
 *     match /invites/{code} {
 *       allow read: if request.auth != null;
 *       allow create: if request.auth != null;
 *       allow delete: if request.auth != null;
 *     }
 *   }
 * }
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  deleteDoc,
  writeBatch,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '@src/lib/firebase';
import { useAuth } from '@src/contexts/AuthContext';
import { KEYS, getItem, setItem } from '@src/utils/storage';
import { getOnboardingData } from '@src/hooks/useOnboarding';
import type { DriveSession, FamilyMember } from '@src/types';

// ─── Context ───

interface SyncContextValue {
  familyId: string | null;
  syncState: 'idle' | 'syncing' | 'synced' | 'offline';
  familyMembers: FamilyMember[];
  familyCreator: string | null;
  pushSession: (session: DriveSession) => Promise<void>;
  generateInvite: () => Promise<string>;
  joinFamily: (code: string) => Promise<boolean>;
  removeMember: (uid: string) => Promise<void>;
  loadFamily: () => Promise<void>;
}

const defaultValue: SyncContextValue = {
  familyId: null,
  syncState: 'idle',
  familyMembers: [],
  familyCreator: null,
  pushSession: async () => {},
  generateInvite: async () => '',
  joinFamily: async () => false,
  removeMember: async () => {},
  loadFamily: async () => {},
};

const SyncContext = createContext<SyncContextValue>(defaultValue);

export const useSync = () => useContext(SyncContext);

// ─── Utility Functions ───

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function mergeSessions(local: DriveSession[], cloud: DriveSession[]): DriveSession[] {
  const map = new Map<string, DriveSession>();
  for (const s of local) {
    map.set(s.id, s);
  }
  for (const s of cloud) {
    const existing = map.get(s.id);
    if (!existing || s.createdAt > existing.createdAt) {
      map.set(s.id, s);
    }
  }
  return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
}

async function findUserFamily(userId: string): Promise<string | null> {
  try {
    const q = query(collection(db, 'families'), where('members', 'array-contains', userId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].id;
  } catch {
    return null;
  }
}

async function createFamilyDoc(
  userId: string,
  email: string,
  teenName: string,
  state: string,
): Promise<string> {
  const familyRef = doc(collection(db, 'families'));
  await setDoc(familyRef, {
    members: [userId],
    memberEmails: { [userId]: email },
    teenName,
    state,
    createdBy: userId,
    createdAt: Date.now(),
  });
  return familyRef.id;
}

async function uploadSessionsToCloud(
  familyId: string,
  userId: string,
  sessions: DriveSession[],
): Promise<void> {
  const batch = writeBatch(db);
  for (const session of sessions) {
    const ref = doc(db, 'families', familyId, 'sessions', session.id);
    batch.set(ref, {
      ...session,
      createdBy: session.createdBy ?? userId,
      syncedAt: Date.now(),
    });
  }
  await batch.commit();
}

async function bidirectionalSync(familyId: string, userId: string): Promise<void> {
  const localSessions = (await getItem<DriveSession[]>(KEYS.sessions)) ?? [];
  const cloudRef = collection(db, 'families', familyId, 'sessions');
  const snapshot = await getDocs(cloudRef);
  const cloudSessions = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as DriveSession);

  const merged = mergeSessions(localSessions, cloudSessions);
  await setItem(KEYS.sessions, merged);

  const cloudIds = new Set(cloudSessions.map((s) => s.id));
  const localOnly = merged.filter((s) => !cloudIds.has(s.id));
  if (localOnly.length > 0) {
    await uploadSessionsToCloud(familyId, userId, localOnly);
  }
}

// ─── Provider ───

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<SyncContextValue['syncState']>('idle');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [familyCreator, setFamilyCreator] = useState<string | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    getItem<string>(KEYS.family_id).then((id) => {
      if (id) setFamilyId(id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) {
      setFamilyId(null);
      setFamilyMembers([]);
      setFamilyCreator(null);
      setSyncState('idle');
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
      return;
    }

    let cancelled = false;

    async function initSync() {
      setSyncState('syncing');
      try {
        let fId = await findUserFamily(user!.uid);

        if (!fId) {
          const onboardingData = await getOnboardingData();
          fId = await createFamilyDoc(
            user!.uid,
            user!.email ?? '',
            onboardingData?.teenName ?? '',
            onboardingData?.state ?? '',
          );

          const localSessions = (await getItem<DriveSession[]>(KEYS.sessions)) ?? [];
          if (localSessions.length > 0) {
            await uploadSessionsToCloud(fId, user!.uid, localSessions);
          }
        }

        if (cancelled) return;
        setFamilyId(fId);
        await setItem(KEYS.family_id, fId);

        const familyDoc = await getDoc(doc(db, 'families', fId));
        if (familyDoc.exists() && !cancelled) {
          const data = familyDoc.data();
          setFamilyCreator(data.createdBy ?? null);
          const emails = (data.memberEmails ?? {}) as Record<string, string>;
          setFamilyMembers(
            ((data.members ?? []) as string[]).map((uid: string) => ({
              uid,
              email: emails[uid] ?? 'Unknown',
            })),
          );
        }

        await bidirectionalSync(fId, user!.uid);
        if (!cancelled) setSyncState('synced');
      } catch {
        if (!cancelled) setSyncState('offline');
      }
    }

    initSync();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }

    if (!familyId || !user) return;

    const q = query(collection(db, 'families', familyId, 'sessions'));
    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const cloudSessions = snapshot.docs.map(
            (d) => ({ ...d.data(), id: d.id }) as DriveSession,
          );
          const localSessions = (await getItem<DriveSession[]>(KEYS.sessions)) ?? [];
          const merged = mergeSessions(localSessions, cloudSessions);
          await setItem(KEYS.sessions, merged);
          setSyncState('synced');
        } catch {
          // merge failed silently
        }
      },
      () => {
        setSyncState('offline');
      },
    );

    unsubRef.current = unsubscribe;
    return () => {
      unsubscribe();
      unsubRef.current = null;
    };
  }, [familyId, user]);

  const pushSessionFn = useCallback(
    async (session: DriveSession) => {
      if (!familyId || !user) return;
      try {
        const ref = doc(db, 'families', familyId, 'sessions', session.id);
        await setDoc(ref, {
          ...session,
          createdBy: session.createdBy ?? user.uid,
          syncedAt: Date.now(),
        });
      } catch {
        // Offline — already saved locally
      }
    },
    [familyId, user],
  );

  const generateInviteFn = useCallback(async (): Promise<string> => {
    if (!familyId || !user) throw new Error('Not signed in');
    const code = generateCode();
    await setDoc(doc(db, 'invites', code), {
      familyId,
      createdBy: user.uid,
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
    return code;
  }, [familyId, user]);

  const joinFamilyFn = useCallback(
    async (code: string): Promise<boolean> => {
      if (!user) return false;
      try {
        const inviteSnap = await getDoc(doc(db, 'invites', code.toUpperCase()));
        if (!inviteSnap.exists()) return false;

        const invite = inviteSnap.data();
        if (invite.expiresAt < Date.now()) return false;

        const targetFamilyId = invite.familyId as string;

        await updateDoc(doc(db, 'families', targetFamilyId), {
          members: arrayUnion(user.uid),
          [`memberEmails.${user.uid}`]: user.email ?? '',
        });

        await deleteDoc(doc(db, 'invites', code.toUpperCase()));

        setFamilyId(targetFamilyId);
        await setItem(KEYS.family_id, targetFamilyId);

        const localSessions = (await getItem<DriveSession[]>(KEYS.sessions)) ?? [];
        if (localSessions.length > 0) {
          await uploadSessionsToCloud(targetFamilyId, user.uid, localSessions);
        }

        await bidirectionalSync(targetFamilyId, user.uid);

        const familyDoc = await getDoc(doc(db, 'families', targetFamilyId));
        if (familyDoc.exists()) {
          const data = familyDoc.data();
          setFamilyCreator(data.createdBy ?? null);
          const emails = (data.memberEmails ?? {}) as Record<string, string>;
          setFamilyMembers(
            ((data.members ?? []) as string[]).map((uid: string) => ({
              uid,
              email: emails[uid] ?? 'Unknown',
            })),
          );
        }

        setSyncState('synced');
        return true;
      } catch {
        return false;
      }
    },
    [user],
  );

  const removeMemberFn = useCallback(
    async (uid: string) => {
      if (!familyId) return;
      try {
        await updateDoc(doc(db, 'families', familyId), {
          members: arrayRemove(uid),
        });
        setFamilyMembers((prev) => prev.filter((m) => m.uid !== uid));
      } catch {
        // offline
      }
    },
    [familyId],
  );

  const loadFamilyFn = useCallback(async () => {
    if (!familyId) return;
    try {
      const familyDoc = await getDoc(doc(db, 'families', familyId));
      if (familyDoc.exists()) {
        const data = familyDoc.data();
        setFamilyCreator(data.createdBy ?? null);
        const emails = (data.memberEmails ?? {}) as Record<string, string>;
        setFamilyMembers(
          ((data.members ?? []) as string[]).map((uid: string) => ({
            uid,
            email: emails[uid] ?? 'Unknown',
          })),
        );
      }
    } catch {
      // offline
    }
  }, [familyId]);

  return (
    <SyncContext.Provider
      value={{
        familyId,
        syncState,
        familyMembers,
        familyCreator,
        pushSession: pushSessionFn,
        generateInvite: generateInviteFn,
        joinFamily: joinFamilyFn,
        removeMember: removeMemberFn,
        loadFamily: loadFamilyFn,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}
