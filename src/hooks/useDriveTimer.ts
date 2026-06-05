import { useState, useRef, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import type { RoutePoint, TimeOfDay } from '@src/types';

export function detectTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  return hour < 6 || hour >= 20 ? 'night' : 'day';
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateTotalDistance(route: RoutePoint[]): number {
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    total += haversineDistance(
      route[i - 1].latitude,
      route[i - 1].longitude,
      route[i].latitude,
      route[i].longitude
    );
  }
  return Math.round(total * 10) / 10;
}

export function useDriveTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [route, setRoute] = useState<RoutePoint[]>([]);
  const [distanceMiles, setDistanceMiles] = useState(0);
  const [speedMph, setSpeedMph] = useState(0);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const startTimeRef = useRef<number>(0);

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      setHasLocationPermission(false);
      return false;
    }
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasLocationPermission(granted);
      return granted;
    } catch {
      setHasLocationPermission(false);
      return false;
    }
  }, []);

  const startLocationTracking = useCallback(async () => {
    if (Platform.OS === 'web' || !hasLocationPermission) return;
    try {
      locationSubRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          const point: RoutePoint = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp,
          };
          setRoute((prev) => {
            const updated = [...prev, point];
            setDistanceMiles(calculateTotalDistance(updated));
            return updated;
          });
          if (location.coords.speed != null && location.coords.speed >= 0) {
            setSpeedMph(Math.round(location.coords.speed * 2.237));
          }
        }
      );
    } catch {
      // Location tracking failed silently — drive still records time
    }
  }, [hasLocationPermission]);

  const start = useCallback(async () => {
    const now = Date.now();
    startTimeRef.current = now;
    setStartTime(now);
    setElapsedSeconds(0);
    setRoute([]);
    setDistanceMiles(0);
    setSpeedMph(0);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    await startLocationTracking();
  }, [startLocationTracking]);

  const stop = useCallback((): {
    startTime: number;
    endTime: number;
    durationSeconds: number;
    distanceMiles: number;
    route: RoutePoint[];
  } => {
    setIsRunning(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (locationSubRef.current) {
      locationSubRef.current.remove();
      locationSubRef.current = null;
    }

    const endTime = Date.now();
    const durationSeconds = Math.floor((endTime - startTimeRef.current) / 1000);

    return {
      startTime: startTimeRef.current,
      endTime,
      durationSeconds,
      distanceMiles,
      route,
    };
  }, [distanceMiles, route]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (locationSubRef.current) locationSubRef.current.remove();
    };
  }, []);

  return {
    isRunning,
    elapsedSeconds,
    route,
    distanceMiles,
    speedMph,
    startTime,
    hasLocationPermission,
    requestLocationPermission,
    start,
    stop,
  };
}

export function formatTimer(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
