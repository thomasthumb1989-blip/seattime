// Last verified: June 2026. Requirements may change — verify with your state DMV.
import type { StateRequirement } from '../types';

export const STATE_REQUIREMENTS: StateRequirement[] = [
  { state: 'Alabama', abbreviation: 'AL', totalHours: 50, dayHours: 50, nightHours: 0, permitAge: 15, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'Alaska', abbreviation: 'AK', totalHours: 40, dayHours: 30, nightHours: 10, permitAge: 14, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'Arizona', abbreviation: 'AZ', totalHours: 30, dayHours: 20, nightHours: 10, permitAge: 15, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'Arkansas', abbreviation: 'AR', totalHours: 0, dayHours: 0, nightHours: 0, permitAge: 14, permitMonths: 6, hasRequirement: false, notes: 'No specific hour requirement' },
  { state: 'California', abbreviation: 'CA', totalHours: 50, dayHours: 40, nightHours: 10, permitAge: 15, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'Colorado', abbreviation: 'CO', totalHours: 50, dayHours: 40, nightHours: 10, permitAge: 15, permitMonths: 12, hasRequirement: true, notes: '' },
  { state: 'Connecticut', abbreviation: 'CT', totalHours: 40, dayHours: 40, nightHours: 0, permitAge: 16, permitMonths: 4, hasRequirement: true, notes: '4 months with driver ed, 6 without' },
  { state: 'Delaware', abbreviation: 'DE', totalHours: 50, dayHours: 40, nightHours: 10, permitAge: 16, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'District of Columbia', abbreviation: 'DC', totalHours: 40, dayHours: 30, nightHours: 10, permitAge: 16, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'Florida', abbreviation: 'FL', totalHours: 50, dayHours: 40, nightHours: 10, permitAge: 15, permitMonths: 12, hasRequirement: true, notes: '' },
  { state: 'Georgia', abbreviation: 'GA', totalHours: 40, dayHours: 34, nightHours: 6, permitAge: 15, permitMonths: 12, hasRequirement: true, notes: '' },
  { state: 'Hawaii', abbreviation: 'HI', totalHours: 50, dayHours: 40, nightHours: 10, permitAge: 15, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'Idaho', abbreviation: 'ID', totalHours: 50, dayHours: 40, nightHours: 10, permitAge: 14, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'Illinois', abbreviation: 'IL', totalHours: 50, dayHours: 40, nightHours: 10, permitAge: 15, permitMonths: 9, hasRequirement: true, notes: '' },
  { state: 'Indiana', abbreviation: 'IN', totalHours: 50, dayHours: 40, nightHours: 10, permitAge: 15, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'Iowa', abbreviation: 'IA', totalHours: 20, dayHours: 18, nightHours: 2, permitAge: 14, permitMonths: 12, hasRequirement: true, notes: 'Lowest hour requirement in US' },
  { state: 'Kansas', abbreviation: 'KS', totalHours: 50, dayHours: 40, nightHours: 10, permitAge: 14, permitMonths: 12, hasRequirement: true, notes: '' },
  { state: 'Kentucky', abbreviation: 'KY', totalHours: 60, dayHours: 50, nightHours: 10, permitAge: 16, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'Louisiana', abbreviation: 'LA', totalHours: 50, dayHours: 35, nightHours: 15, permitAge: 15, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'Maine', abbreviation: 'ME', totalHours: 70, dayHours: 60, nightHours: 10, permitAge: 15, permitMonths: 6, hasRequirement: true, notes: 'Highest hour requirement in US' },
  { state: 'Maryland', abbreviation: 'MD', totalHours: 60, dayHours: 50, nightHours: 10, permitAge: 15, permitMonths: 9, hasRequirement: true, notes: '' },
  { state: 'Massachusetts', abbreviation: 'MA', totalHours: 40, dayHours: 40, nightHours: 0, permitAge: 16, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'Michigan', abbreviation: 'MI', totalHours: 50, dayHours: 40, nightHours: 10, permitAge: 14, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'Minnesota', abbreviation: 'MN', totalHours: 50, dayHours: 35, nightHours: 15, permitAge: 15, permitMonths: 6, hasRequirement: true, notes: '40 hours if parent completes awareness class' },
  { state: 'Mississippi', abbreviation: 'MS', totalHours: 0, dayHours: 0, nightHours: 0, permitAge: 15, permitMonths: 12, hasRequirement: false, notes: 'No specific hour requirement' },
  { state: 'Missouri', abbreviation: 'MO', totalHours: 40, dayHours: 30, nightHours: 10, permitAge: 15, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'Montana', abbreviation: 'MT', totalHours: 50, dayHours: 40, nightHours: 10, permitAge: 14, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'Nebraska', abbreviation: 'NE', totalHours: 50, dayHours: 40, nightHours: 10, permitAge: 15, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'Nevada', abbreviation: 'NV', totalHours: 50, dayHours: 40, nightHours: 10, permitAge: 15, permitMonths: 6, hasRequirement: true, notes: '100 hours if no driver ed available within 30 miles' },
  { state: 'New Hampshire', abbreviation: 'NH', totalHours: 40, dayHours: 30, nightHours: 10, permitAge: 15, permitMonths: 0, hasRequirement: true, notes: 'No minimum permit holding period' },
  { state: 'New Jersey', abbreviation: 'NJ', totalHours: 50, dayHours: 40, nightHours: 10, permitAge: 16, permitMonths: 6, hasRequirement: true, notes: '50-hour requirement added February 2025' },
  { state: 'New Mexico', abbreviation: 'NM', totalHours: 50, dayHours: 40, nightHours: 10, permitAge: 15, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'New York', abbreviation: 'NY', totalHours: 50, dayHours: 35, nightHours: 15, permitAge: 16, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'North Carolina', abbreviation: 'NC', totalHours: 60, dayHours: 50, nightHours: 10, permitAge: 15, permitMonths: 9, hasRequirement: true, notes: '' },
  { state: 'North Dakota', abbreviation: 'ND', totalHours: 50, dayHours: 50, nightHours: 0, permitAge: 14, permitMonths: 12, hasRequirement: true, notes: 'Under 16 only; no hours required if 16+' },
  { state: 'Ohio', abbreviation: 'OH', totalHours: 50, dayHours: 40, nightHours: 10, permitAge: 15, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'Oklahoma', abbreviation: 'OK', totalHours: 50, dayHours: 40, nightHours: 10, permitAge: 15, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'Oregon', abbreviation: 'OR', totalHours: 50, dayHours: 50, nightHours: 0, permitAge: 15, permitMonths: 6, hasRequirement: true, notes: '100 hours without driver ed' },
  { state: 'Pennsylvania', abbreviation: 'PA', totalHours: 65, dayHours: 55, nightHours: 10, permitAge: 16, permitMonths: 6, hasRequirement: true, notes: '5 hours in bad weather recommended' },
  { state: 'Rhode Island', abbreviation: 'RI', totalHours: 50, dayHours: 40, nightHours: 10, permitAge: 16, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'South Carolina', abbreviation: 'SC', totalHours: 40, dayHours: 30, nightHours: 10, permitAge: 15, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'South Dakota', abbreviation: 'SD', totalHours: 50, dayHours: 40, nightHours: 10, permitAge: 14, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'Tennessee', abbreviation: 'TN', totalHours: 50, dayHours: 40, nightHours: 10, permitAge: 15, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'Texas', abbreviation: 'TX', totalHours: 30, dayHours: 20, nightHours: 10, permitAge: 15, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'Utah', abbreviation: 'UT', totalHours: 40, dayHours: 30, nightHours: 10, permitAge: 15, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'Vermont', abbreviation: 'VT', totalHours: 40, dayHours: 30, nightHours: 10, permitAge: 15, permitMonths: 12, hasRequirement: true, notes: '' },
  { state: 'Virginia', abbreviation: 'VA', totalHours: 45, dayHours: 30, nightHours: 15, permitAge: 15, permitMonths: 9, hasRequirement: true, notes: '' },
  { state: 'Washington', abbreviation: 'WA', totalHours: 50, dayHours: 40, nightHours: 10, permitAge: 15, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'West Virginia', abbreviation: 'WV', totalHours: 50, dayHours: 40, nightHours: 10, permitAge: 15, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'Wisconsin', abbreviation: 'WI', totalHours: 50, dayHours: 40, nightHours: 10, permitAge: 15, permitMonths: 6, hasRequirement: true, notes: '' },
  { state: 'Wyoming', abbreviation: 'WY', totalHours: 50, dayHours: 40, nightHours: 10, permitAge: 15, permitMonths: 10, hasRequirement: true, notes: '' },
];

export function getStateByAbbreviation(abbreviation: string): StateRequirement | undefined {
  return STATE_REQUIREMENTS.find((s) => s.abbreviation === abbreviation.toUpperCase());
}

export function getStateByName(name: string): StateRequirement | undefined {
  return STATE_REQUIREMENTS.find((s) => s.state.toLowerCase() === name.toLowerCase());
}
