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
} as const;
