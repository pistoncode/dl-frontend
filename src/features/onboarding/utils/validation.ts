/**
 * Onboarding Form Validation
 * 
 * Comprehensive validation functions for all onboarding form fields.
 * Provides consistent error messages and validation logic.
 */

import type { GenderType, SportType } from '../types';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate full name
 */
export const validateFullName = (name: string): ValidationResult => {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return { isValid: false, error: 'Name is required' };
  }
  
  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }
  
  if (trimmedName.length > 50) {
    return { isValid: false, error: 'Name must be less than 50 characters' };
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes, periods)
  const nameRegex = /^[a-zA-Z\s\-'.]+$/;
  if (!nameRegex.test(trimmedName)) {
    return { 
      isValid: false, 
      error: 'Name can only contain letters, spaces, hyphens, apostrophes, and periods' 
    };
  }
  
  // Check for at least one letter
  if (!/[a-zA-Z]/.test(trimmedName)) {
    return { isValid: false, error: 'Name must contain at least one letter' };
  }
  
  return { isValid: true };
};

/**
 * Validate gender selection
 */
export const validateGender = (gender: GenderType | null): ValidationResult => {
  if (!gender) {
    return { isValid: false, error: 'Gender selection is required' };
  }
  
  const validGenders: GenderType[] = ['male', 'female'];
  if (!validGenders.includes(gender)) {
    return { isValid: false, error: 'Please select a valid gender option' };
  }
  
  return { isValid: true };
};

/**
 * Validate date of birth with comprehensive age checking
 */
export const validateDateOfBirth = (dateOfBirth: Date | null, minAge = 13): ValidationResult => {
  if (!dateOfBirth) {
    return { isValid: false, error: 'Birthday is required' };
  }
  
  const today = new Date();
  
  // Check if date is in the future
  if (dateOfBirth > today) {
    return { isValid: false, error: 'Birthday cannot be in the future' };
  }
  
  // Calculate precise age
  const birthYear = dateOfBirth.getFullYear();
  const birthMonth = dateOfBirth.getMonth();
  const birthDay = dateOfBirth.getDate();
  
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  
  let age = currentYear - birthYear;
  
  // Adjust for birthday not yet occurred this year
  if (currentMonth < birthMonth || 
      (currentMonth === birthMonth && currentDay < birthDay)) {
    age--;
  }
  
  if (age < minAge) {
    return { isValid: false, error: `You must be at least ${minAge} years old` };
  }
  
  if (age > 120) {
    return { isValid: false, error: 'Please enter a valid birth date' };
  }
  
  // Check for reasonable date bounds (not before 1900)
  if (birthYear < 1900) {
    return { isValid: false, error: 'Please enter a birth year after 1900' };
  }
  
  return { isValid: true };
};

/**
 * Validate location input
 */
export const validateLocation = (
  location: string, 
  useCurrentLocation: boolean
): ValidationResult => {
  if (useCurrentLocation) {
    return { isValid: true };
  }
  
  const trimmedLocation = location.trim();
  
  if (!trimmedLocation) {
    return { isValid: false, error: 'Location is required' };
  }
  
  if (trimmedLocation.length < 2) {
    return { isValid: false, error: 'Location must be at least 2 characters' };
  }
  
  if (trimmedLocation.length > 100) {
    return { isValid: false, error: 'Location must be less than 100 characters' };
  }
  
  // Basic format check (letters, numbers, spaces, commas, periods, hyphens)
  const locationRegex = /^[a-zA-Z0-9\s,.'-]+$/;
  if (!locationRegex.test(trimmedLocation)) {
    return { 
      isValid: false, 
      error: 'Location contains invalid characters' 
    };
  }
  
  return { isValid: true };
};

/**
 * Validate sport selection
 */
export const validateSportSelection = (sports: SportType[]): ValidationResult => {
  if (!sports || sports.length === 0) {
    return { isValid: false, error: 'Please select at least one sport' };
  }
  
  if (sports.length > 3) {
    return { isValid: false, error: 'You can select up to 3 sports maximum' };
  }
  
  const validSports: SportType[] = ['pickleball', 'tennis', 'padel'];
  const invalidSports = sports.filter(sport => !validSports.includes(sport));
  
  if (invalidSports.length > 0) {
    return { isValid: false, error: 'Invalid sport selection detected' };
  }
  
  return { isValid: true };
};

/**
 * Validate email format (for future use)
 */
export const validateEmail = (email: string): ValidationResult => {
  const trimmedEmail = email.trim().toLowerCase();
  
  if (!trimmedEmail) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  if (trimmedEmail.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }
  
  return { isValid: true };
};

/**
 * Validate phone number (for future use)
 */
export const validatePhoneNumber = (phone: string): ValidationResult => {
  const cleanedPhone = phone.replace(/[\s\-\(\)\+]/g, '');
  
  if (!cleanedPhone) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // Basic phone number validation (10-15 digits)
  const phoneRegex = /^\d{10,15}$/;
  if (!phoneRegex.test(cleanedPhone)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }
  
  return { isValid: true };
};

/**
 * Validate complete onboarding data
 */
export const validateOnboardingData = (data: {
  fullName: string;
  gender: GenderType | null;
  dateOfBirth: Date | null;
  location: string;
  useCurrentLocation: boolean;
  selectedSports: SportType[];
}): { [key: string]: ValidationResult } => {
  return {
    fullName: validateFullName(data.fullName),
    gender: validateGender(data.gender),
    dateOfBirth: validateDateOfBirth(data.dateOfBirth),
    location: validateLocation(data.location, data.useCurrentLocation),
    selectedSports: validateSportSelection(data.selectedSports),
  };
};

/**
 * Check if all validations pass
 */
export const isValidationPassing = (validations: { [key: string]: ValidationResult }): boolean => {
  return Object.values(validations).every(result => result.isValid);
};

/**
 * Get first validation error message
 */
export const getFirstValidationError = (
  validations: { [key: string]: ValidationResult }
): string | null => {
  const firstError = Object.values(validations).find(result => !result.isValid);
  return firstError?.error || null;
};