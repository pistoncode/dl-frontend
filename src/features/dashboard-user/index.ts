export * from './screens';
export * from './services';
export { DashboardProvider, useDashboard } from './DashboardContext';
export * from './types';
export const DASHBOARD_TABS = [
  'overview',
  'matches', 
  'stats',
  'profile',
  'settings'
] as const;
export const QUICK_ACTIONS = [
  'find-match',
  'create-match',
  'view-schedule',
  'update-profile'
] as const;
export const ACTIVITY_TYPES = [
  'match-created',
  'match-joined',
  'skill-updated',
  'profile-updated'
] as const;
export const DASHBOARD_CONFIG = {
  defaultTab: 'overview' as const,
  refreshInterval: 300,
  maxRecentActivities: 10,
  maxUpcomingMatches: 5,
  enableNotifications: true,
  theme: 'auto' as const,
} as const;
export const REFRESH_INTERVALS = {
  fast: 60,
  normal: 300,
  slow: 900,
  manual: 0,
} as const;
