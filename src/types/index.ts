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
