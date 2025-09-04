import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { OnboardingData, SportType, GenderType, SkillAssessmentResult } from './types';
import { OnboardingStorage } from '@core/storage';

// Re-export types for convenience
export type { OnboardingData, SportType, GenderType, SkillAssessmentResult };

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  clearData: () => void;
  isLoading: boolean;
  saveProgress: () => Promise<void>;
}

const initialData: OnboardingData = {
  fullName: '',
  gender: null,
  dateOfBirth: null,
  location: '',
  useCurrentLocation: false,
  latitude: undefined,
  longitude: undefined,
  selectedSports: [],
  skillAssessments: {},
  profileImage: undefined,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from storage on mount
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        setIsLoading(true);
        const storedData = await OnboardingStorage.loadData<OnboardingData>();
        if (storedData) {
          // Merge stored data with initial data to handle schema changes
          setData({ ...initialData, ...storedData });
        }
      } catch (error) {
        console.error('Failed to load onboarding data:', error);
        // Continue with initial data if loading fails
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();
  }, []);

  const updateData = async (updates: Partial<OnboardingData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    
    // Auto-save to storage
    try {
      await OnboardingStorage.saveData(newData);
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      // Continue despite save failure
    }
  };

  const clearData = async () => {
    setData(initialData);
    try {
      await OnboardingStorage.clearData();
      await OnboardingStorage.clearProgress();
    } catch (error) {
      console.error('Failed to clear onboarding data:', error);
    }
  };

  const saveProgress = async () => {
    try {
      const completedSteps: string[] = [];
      
      // Determine completed steps based on data
      if (data.fullName && data.gender && data.dateOfBirth) {
        completedSteps.push('personal-info');
      }
      if (data.location || (data.useCurrentLocation && data.latitude && data.longitude)) {
        completedSteps.push('location');
      }
      if (data.selectedSports.length > 0) {
        completedSteps.push('game-select');
      }
      if (Object.keys(data.skillAssessments).length > 0) {
        completedSteps.push('skill-assessment');
      }
      if (data.profileImage) {
        completedSteps.push('profile-picture');
      }

      await OnboardingStorage.saveProgress({
        currentStep: completedSteps[completedSteps.length - 1] || 'personal-info',
        completedSteps,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  return (
    <OnboardingContext.Provider value={{ 
      data, 
      updateData, 
      clearData, 
      isLoading, 
      saveProgress 
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};