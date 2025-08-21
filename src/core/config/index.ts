/**
 * Application Configuration
 * 
 * Central configuration for the application.
 * All environment variables and config should be accessed through this module.
 */

export const APP_CONFIG = {
  // App Info
  name: 'Deuce League',
  version: '1.0.0',
  
  // API Configuration
  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 30000,
  },
  
  // Feature Flags
  features: {
    enableAnalytics: true,
    enableCrashReporting: true,
    enablePushNotifications: true,
  },
  
  // Onboarding Configuration
  onboarding: {
    minAge: 13,
    maxSportsSelection: 3,
    requireProfilePicture: false,
  },
  
  // Theme
  theme: {
    primaryColor: '#FE9F4D',
    secondaryColor: '#6C7278',
  },
} as const;