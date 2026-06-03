import type { StateRequirement } from '../types';

export const stateRequirements: StateRequirement[] = [
  { stateCode: 'CA', stateName: 'California', totalHours: 50, nightHours: 10, minimumAge: 15.5, permitDurationMonths: 12 },
  { stateCode: 'TX', stateName: 'Texas', totalHours: 30, nightHours: 10, minimumAge: 15, permitDurationMonths: 12 },
  { stateCode: 'NY', stateName: 'New York', totalHours: 50, nightHours: 15, minimumAge: 16, permitDurationMonths: 6 },
  { stateCode: 'FL', stateName: 'Florida', totalHours: 50, nightHours: 10, minimumAge: 15, permitDurationMonths: 12 },
  { stateCode: 'PA', stateName: 'Pennsylvania', totalHours: 65, nightHours: 10, minimumAge: 16, permitDurationMonths: 6 },
];
