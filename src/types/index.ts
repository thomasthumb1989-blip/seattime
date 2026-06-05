export interface DrivingSession {
  id: string;
  startTime: number;
  endTime: number | null;
  durationMinutes: number;
  isNight: boolean;
  supervisorName: string;
  notes: string;
  route?: {
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
  };
}

export interface StateRequirement {
  state: string;
  abbreviation: string;
  totalHours: number;
  dayHours: number;
  nightHours: number;
  permitAge: number;
  permitMonths: number;
  hasRequirement: boolean;
  notes: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  stateCode: string;
  dateOfBirth: string;
  permitStartDate: string;
}

export interface OnboardingData {
  state: string;
  teenName: string;
  completedOnboarding: boolean;
}

export type TimeOfDay = 'day' | 'night';
export type Weather = 'clear' | 'rain' | 'snow' | 'fog';
export type RoadType = 'residential' | 'highway' | 'rural' | 'parking';

export interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface DriveConditions {
  timeOfDay: TimeOfDay;
  weather: Weather;
  roadType: RoadType;
}

export interface DriveSession {
  id: string;
  teenName: string;
  state: string;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  distanceMiles: number;
  route: RoutePoint[];
  conditions: DriveConditions;
  isManual: boolean;
  createdAt: number;
}
