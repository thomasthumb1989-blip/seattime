export const Strings = {
  appName: 'SeatTime',
  tagline: 'Track your permit driving hours',

  ONBOARDING: {
    WELCOME_HEADLINE: 'Track every mile to your teen\'s license',
    WELCOME_SUBTITLE: 'Log supervised driving hours, track progress toward your state\'s requirement, and generate a DMV-ready log when you\'re done.',
    GET_STARTED: 'Get Started',

    STATE_HEADLINE: 'Which state is your teen learning in?',
    STATE_SEARCH_PLACEHOLDER: 'Search states...',
    STATE_HOURS_LABEL: 'hours required',
    STATE_NO_REQUIREMENT: 'No hour requirement',
    STATE_CONTINUE: 'Continue',

    TEEN_NAME_HEADLINE: 'What\'s your teen\'s name?',
    TEEN_NAME_PLACEHOLDER: 'First name',
    TEEN_NAME_CONTINUE: 'Continue',

    READY_HEADLINE: 'You\'re all set!',
    READY_REQUIREMENT: (state: string, total: number, night: number) =>
      `${state} requires ${total} total hours${night > 0 ? ` (${night} at night)` : ''}`,
    READY_NO_REQUIREMENT: (state: string) =>
      `${state} doesn't require logged hours, but tracking practice is still a great idea!`,
    START_TRACKING: 'Start Tracking',
  },

  DRIVE: {
    START_DRIVE: 'Start Drive',
    LOG_PAST_DRIVE: 'Log Past Drive',
    END_DRIVE: 'End Drive',
    END_DRIVE_CONFIRM_TITLE: 'End this drive?',
    END_DRIVE_CONFIRM_MESSAGE: 'This will save your drive session.',
    END_DRIVE_CONFIRM_YES: 'Save Drive',
    END_DRIVE_CONFIRM_NO: 'Keep Driving',
    TIMER_LABEL: 'Drive Time',
    DISTANCE_LABEL: 'mi',
    SPEED_LABEL: 'mph',
    CONDITIONS_LABEL: 'Conditions',
    TIME_OF_DAY_DAY: 'Day',
    TIME_OF_DAY_NIGHT: 'Night',
    WEATHER_CLEAR: 'Clear',
    WEATHER_RAIN: 'Rain',
    WEATHER_SNOW: 'Snow',
    WEATHER_FOG: 'Fog',
    ROAD_RESIDENTIAL: 'Residential',
    ROAD_HIGHWAY: 'Highway',
    ROAD_RURAL: 'Rural',
    ROAD_PARKING: 'Parking Lot',
    LOCATION_PERMISSION_TITLE: 'Location Access',
    LOCATION_PERMISSION_MESSAGE: 'SeatTime uses your location to track your driving route. This helps create an accurate log of each practice drive.',
    MANUAL_LOG_TITLE: 'Log a Past Drive',
    MANUAL_DATE_LABEL: 'Date',
    MANUAL_HOURS_LABEL: 'Hours',
    MANUAL_MINUTES_LABEL: 'Minutes',
    MANUAL_SAVE: 'Save Drive',
    DRIVE_SAVED: 'Drive saved!',
    NO_DRIVES_YET: 'No drives logged yet',
    NO_DRIVES_SUBTITLE: 'Start your first practice drive or log a past one.',
  },

  HOME: {
    GREETING: (name: string) => `${name}'s Progress`,
    TOTAL_HOURS: 'Total Hours',
    NIGHT_HOURS: 'Night Hours',
    RECENT_DRIVES: 'Recent Drives',
  },
} as const;
