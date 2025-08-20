/**
 * Onboarding Utilities
 * 
 * Common utility functions used throughout the onboarding flow.
 */

import type { SportType, OnboardingData, ValidationError } from '../types';

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validates a full name input
 * @param name - The name to validate
 * @returns Validation error message or null if valid
 */
export const validateFullName = (name: string): string | null => {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return 'Name is required';
  }
  
  if (trimmedName.length < 2) {
    return 'Name must be at least 2 characters';
  }
  
  if (trimmedName.length > 50) {
    return 'Name must be less than 50 characters';
  }
  
  // Check for invalid characters (allow letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(trimmedName)) {
    return 'Name can only contain letters, spaces, hyphens, and apostrophes';
  }
  
  return null;
};

/**
 * Validates a date of birth
 * @param dateOfBirth - The date to validate
 * @param minAge - Minimum age requirement (default: 13)
 * @returns Validation error message or null if valid
 */
export const validateDateOfBirth = (
  dateOfBirth: Date | null, 
  minAge: number = 13
): string | null => {
  if (!dateOfBirth) {
    return 'Birthday is required';
  }
  
  const today = new Date();
  const age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  
  // Adjust age if birthday hasn't occurred this year
  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate()) 
    ? age - 1 
    : age;
  
  if (actualAge < minAge) {
    return `You must be at least ${minAge} years old`;
  }
  
  if (actualAge > 120) {
    return 'Please enter a valid birth date';
  }
  
  return null;
};

/**
 * Validates location input
 * @param location - The location string to validate
 * @param useCurrentLocation - Whether user is using current location
 * @returns Validation error message or null if valid
 */
export const validateLocation = (
  location: string, 
  useCurrentLocation: boolean
): string | null => {
  if (useCurrentLocation) {
    return null; // Current location is always valid
  }
  
  const trimmedLocation = location.trim();
  
  if (!trimmedLocation) {
    return 'Location is required';
  }
  
  if (trimmedLocation.length < 2) {
    return 'Location must be at least 2 characters';
  }
  
  return null;
};

/**
 * Validates sport selection
 * @param sports - Array of selected sports
 * @returns Validation error message or null if valid
 */
export const validateSportSelection = (sports: SportType[]): string | null => {
  if (sports.length === 0) {
    return 'Please select at least one sport';
  }
  
  if (sports.length > 3) {
    return 'You can select up to 3 sports';
  }
  
  return null;
};

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Formats a sport name for display
 * @param sport - The sport type
 * @returns Formatted sport name
 */
export const formatSportName = (sport: SportType): string => {
  const sportNames = {
    pickleball: 'Pickleball',
    tennis: 'Tennis',
    padel: 'Padel'
  };
  
  return sportNames[sport];
};

/**
 * Formats a confidence level string
 * @param confidence - Raw confidence string
 * @returns Properly capitalized confidence string
 */
export const formatConfidence = (confidence: string): string => {
  return confidence.toLowerCase().split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

/**
 * Formats a date for display
 * @param date - The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// ============================================================================
// PROGRESS UTILITIES
// ============================================================================

/**
 * Calculates onboarding completion percentage
 * @param data - Current onboarding data
 * @returns Completion percentage (0-100)
 */
export const calculateCompletionPercentage = (data: OnboardingData): number => {
  const steps = [
    !!data.fullName && !!data.gender && !!data.dateOfBirth, // Personal info
    !!data.location || data.useCurrentLocation, // Location
    data.selectedSports.length > 0, // Sports selection
    data.selectedSports.every(sport => !!data.skillAssessments[sport]), // Assessments
    true, // Results (always completed after assessments)
    true, // Profile picture (optional, so always "complete")
  ];
  
  const completedSteps = steps.filter(Boolean).length;
  return Math.round((completedSteps / steps.length) * 100);
};

/**
 * Gets the next incomplete step in the onboarding flow
 * @param data - Current onboarding data
 * @returns The next step to complete or null if all complete
 */
export const getNextIncompleteStep = (data: OnboardingData): string | null => {
  if (!data.fullName || !data.gender || !data.dateOfBirth) {
    return 'personal-info';
  }
  
  if (!data.location && !data.useCurrentLocation) {
    return 'location';
  }
  
  if (data.selectedSports.length === 0) {
    return 'game-select';
  }
  
  // Check if all selected sports have assessments
  const incompleteSport = data.selectedSports.find(
    sport => !data.skillAssessments[sport]
  );
  
  if (incompleteSport) {
    return 'skill-assessment';
  }
  
  return null; // All steps complete
};

// ============================================================================
// DATA UTILITIES
// ============================================================================

/**
 * Creates a clean onboarding data object with defaults
 * @param partial - Partial onboarding data to merge
 * @returns Complete onboarding data object
 */
export const createOnboardingData = (
  partial: Partial<OnboardingData> = {}
): OnboardingData => {
  return {
    fullName: '',
    gender: null,
    dateOfBirth: null,
    location: '',
    useCurrentLocation: false,
    selectedSports: [],
    skillAssessments: {},
    ...partial
  };
};

/**
 * Sanitizes onboarding data for storage or transmission
 * @param data - Raw onboarding data
 * @returns Sanitized data object
 */
export const sanitizeOnboardingData = (data: OnboardingData): OnboardingData => {
  return {
    ...data,
    fullName: data.fullName.trim(),
    location: data.location.trim(),
    // Remove any empty or invalid skill assessments
    skillAssessments: Object.fromEntries(
      Object.entries(data.skillAssessments).filter(
        ([_, assessment]) => assessment && assessment.rating > 0
      )
    )
  };
};

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Validates all onboarding data and returns errors
 * @param data - Onboarding data to validate
 * @returns Array of validation errors
 */
export const validateAllOnboardingData = (data: OnboardingData): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Validate personal info
  const nameError = validateFullName(data.fullName);
  if (nameError) {
    errors.push({ field: 'fullName', message: nameError });
  }
  
  if (!data.gender) {
    errors.push({ field: 'gender', message: 'Gender selection is required' });
  }
  
  const dobError = validateDateOfBirth(data.dateOfBirth);
  if (dobError) {
    errors.push({ field: 'dateOfBirth', message: dobError });
  }
  
  // Validate location
  const locationError = validateLocation(data.location, data.useCurrentLocation);
  if (locationError) {
    errors.push({ field: 'location', message: locationError });
  }
  
  // Validate sports
  const sportsError = validateSportSelection(data.selectedSports);
  if (sportsError) {
    errors.push({ field: 'selectedSports', message: sportsError });
  }
  
  return errors;
};