import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Get the backend base URL for the current environment
 * Handles different scenarios: Expo Go, development builds, production
 */
export function getBackendBaseURL(): string {
  // Production or specific environment override
  if (__DEV__ === false) {
    // In production, use the production URL
    return process.env.EXPO_PUBLIC_API_URL || 'https://your-production-api.com';
  }
  
  // Development environment
  const port = process.env.EXPO_PUBLIC_API_PORT || '3001';
  
  // If explicitly set in environment
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // For Expo Go and development
  if (Platform.OS === 'web') {
    return `http://localhost:${port}`;
  }
  
  // For mobile devices in development
  // Try to get the IP from Expo's manifest or use localhost
  const expoIP = Constants.expoConfig?.hostUri?.split(':')[0];
  
  if (expoIP && expoIP !== 'localhost' && expoIP !== '127.0.0.1') {
    return `http://${expoIP}:${port}`;
  }
  
  // Fallback to localhost (will work for simulators)
  return `http://localhost:${port}`;
}

/**
 * Log the current network configuration for debugging
 */
export function logNetworkConfig(): void {
  if (__DEV__) {
    const baseURL = getBackendBaseURL();
    console.log('🌐 Network Configuration:');
    console.log(`   Platform: ${Platform.OS}`);
    console.log(`   Base URL: ${baseURL}`);
    console.log(`   Expo Host URI: ${Constants.expoConfig?.hostUri || 'Not available'}`);
    console.log(`   Environment: ${__DEV__ ? 'Development' : 'Production'}`);
  }
}
