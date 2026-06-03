import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  sessions: 'seattime_sessions',
  profile: 'seattime_profile',
  onboarded: 'seattime_onboarded',
} as const;

export async function getItem<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export { KEYS };
