export const Colors = {
  light: {
    text: '#1A1A2E',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    tint: '#2563EB',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#2563EB',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  dark: {
    text: '#F9FAFB',
    background: '#0F172A',
    surface: '#1E293B',
    tint: '#60A5FA',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#60A5FA',
    border: '#334155',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
  },
} as const;

export type ColorScheme = keyof typeof Colors;
