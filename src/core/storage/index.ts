/**
 * Local Storage Service
 * 
 * Handles persistent storage of app data using AsyncStorage.
 * Provides type-safe methods for saving and loading data.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ONBOARDING_DATA: '@onboarding_data',
  ONBOARDING_PROGRESS: '@onboarding_progress',
  USER_PREFERENCES: '@user_preferences',
} as const;

/**
 * Generic storage service with type safety
 */
class StorageService {
  /**
   * Save data to AsyncStorage
   */
  async save<T>(key: string, data: T): Promise<void> {
    try {
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonData);
    } catch (error) {
      console.error(`Failed to save data for key ${key}:`, error);
      throw new Error(`Storage save failed: ${error}`);
    }
  }

  /**
   * Load data from AsyncStorage
   */
  async load<T>(key: string): Promise<T | null> {
    try {
      const jsonData = await AsyncStorage.getItem(key);
      if (jsonData === null) return null;
      return JSON.parse(jsonData) as T;
    } catch (error) {
      console.error(`Failed to load data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove data from AsyncStorage
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove data for key ${key}:`, error);
      throw new Error(`Storage remove failed: ${error}`);
    }
  }

  /**
   * Check if key exists in storage
   */
  async exists(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      console.error(`Failed to check existence for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all data from AsyncStorage
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw new Error(`Storage clear failed: ${error}`);
    }
  }

  /**
   * Get all keys from AsyncStorage
   */
  async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return [];
    }
  }
}

// Create singleton instance
const storageService = new StorageService();

/**
 * Onboarding-specific storage methods
 */
export const OnboardingStorage = {
  /**
   * Save onboarding data
   */
  async saveData(data: any): Promise<void> {
    return storageService.save(STORAGE_KEYS.ONBOARDING_DATA, data);
  },

  /**
   * Load onboarding data
   */
  async loadData<T>(): Promise<T | null> {
    return storageService.load<T>(STORAGE_KEYS.ONBOARDING_DATA);
  },

  /**
   * Clear onboarding data
   */
  async clearData(): Promise<void> {
    return storageService.remove(STORAGE_KEYS.ONBOARDING_DATA);
  },

  /**
   * Check if onboarding data exists
   */
  async hasData(): Promise<boolean> {
    return storageService.exists(STORAGE_KEYS.ONBOARDING_DATA);
  },

  /**
   * Save onboarding progress
   */
  async saveProgress(progress: {
    currentStep: string;
    completedSteps: string[];
    timestamp: number;
  }): Promise<void> {
    return storageService.save(STORAGE_KEYS.ONBOARDING_PROGRESS, progress);
  },

  /**
   * Load onboarding progress
   */
  async loadProgress(): Promise<{
    currentStep: string;
    completedSteps: string[];
    timestamp: number;
  } | null> {
    return storageService.load(STORAGE_KEYS.ONBOARDING_PROGRESS);
  },

  /**
   * Clear onboarding progress
   */
  async clearProgress(): Promise<void> {
    return storageService.remove(STORAGE_KEYS.ONBOARDING_PROGRESS);
  },
};

// Export the general storage service for other use cases
export default storageService;

// Export storage keys for external use
export { STORAGE_KEYS };