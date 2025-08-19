import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface OnboardingData {
  // Personal Information
  fullName: string;
  gender: string | null;
  dateOfBirth: Date | null;
  
  // Location
  location: string;
  useCurrentLocation: boolean;
  
  // Game Selection
  selectedSport?: string | null; // Keep for backward compatibility
  selectedSports?: string[]; // New field for multiple sports
  
  // Skill Assessment
  skillLevel?: string | null; // Keep for backward compatibility
  skillLevels?: { [sport: string]: string }; // Store skill level for each sport
  
  // Profile Picture
  profilePicture: string | null;
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  clearData: () => void;
}

const initialData: OnboardingData = {
  fullName: '',
  gender: null,
  dateOfBirth: null,
  location: '',
  useCurrentLocation: false,
  selectedSport: null,
  selectedSports: [],
  skillLevel: null,
  skillLevels: {},
  profilePicture: null,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<OnboardingData>(initialData);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const clearData = () => {
    setData(initialData);
  };

  return (
    <OnboardingContext.Provider value={{ data, updateData, clearData }}>
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