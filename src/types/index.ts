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
  stateCode: string;
  stateName: string;
  totalHours: number;
  nightHours: number;
  minimumAge: number;
  permitDurationMonths: number;
}

export interface UserProfile {
  id: string;
  displayName: string;
  stateCode: string;
  dateOfBirth: string;
  permitStartDate: string;
  isPremium: boolean;
}
