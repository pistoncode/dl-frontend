import { validateFullName, validateDateOfBirth } from './index';

describe('Onboarding Validation Utilities', () => {
  describe('validateFullName', () => {
    it('should return null for valid names', () => {
      expect(validateFullName('John Doe')).toBeNull();
      expect(validateFullName('Jane Smith-Wilson')).toBeNull();
      expect(validateFullName("Mary O'Connor")).toBeNull();
      expect(validateFullName('Alice')).toBeNull();
    });

    it('should return error for empty name', () => {
      expect(validateFullName('')).toBe('Name is required');
      expect(validateFullName('   ')).toBe('Name is required');
    });

    it('should return error for name too short', () => {
      expect(validateFullName('A')).toBe('Name must be at least 2 characters');
    });

    it('should return error for name too long', () => {
      const longName = 'A'.repeat(51);
      expect(validateFullName(longName)).toBe('Name must be less than 50 characters');
    });

    it('should return error for invalid characters', () => {
      expect(validateFullName('John123')).toBe('Name can only contain letters, spaces, hyphens, and apostrophes');
      expect(validateFullName('John@Doe')).toBe('Name can only contain letters, spaces, hyphens, and apostrophes');
      expect(validateFullName('John_Doe')).toBe('Name can only contain letters, spaces, hyphens, and apostrophes');
    });

    it('should handle names with multiple spaces', () => {
      expect(validateFullName('John   Doe')).toBeNull(); // Multiple spaces are valid
    });

    it('should trim whitespace before validation', () => {
      expect(validateFullName('  John Doe  ')).toBeNull();
      expect(validateFullName('  A  ')).toBe('Name must be at least 2 characters'); // After trimming, it's too short
    });
  });

  describe('validateDateOfBirth', () => {
    const currentYear = new Date().getFullYear();
    
    it('should return null for valid dates', () => {
      const validDate = new Date('1990-01-01');
      expect(validateDateOfBirth(validDate)).toBeNull();
    });

    it('should return error for null date', () => {
      expect(validateDateOfBirth(null)).toBe('Birthday is required');
    });

    it('should return error for users under default minimum age (13)', () => {
      const tooYoungDate = new Date(currentYear - 10, 5, 15); // 10 years old
      expect(validateDateOfBirth(tooYoungDate)).toBe('You must be at least 13 years old');
    });

    it('should return error for users under custom minimum age', () => {
      const date = new Date(currentYear - 16, 5, 15); // 16 years old
      expect(validateDateOfBirth(date, 18)).toBe('You must be at least 18 years old');
    });

    it('should handle users exactly at minimum age', () => {
      const today = new Date();
      const exactlyThirteenYearsAgo = new Date(
        today.getFullYear() - 13,
        today.getMonth(),
        today.getDate()
      );
      expect(validateDateOfBirth(exactlyThirteenYearsAgo)).toBeNull();
    });

    it('should handle birthday not yet occurred this year', () => {
      const today = new Date();
      const birthdayNextMonth = new Date(
        today.getFullYear() - 13,
        today.getMonth() + 1, // Next month
        today.getDate()
      );
      
      // If next month exists (not December), this should be valid (they're 13)
      if (today.getMonth() < 11) {
        expect(validateDateOfBirth(birthdayNextMonth)).toBe('You must be at least 13 years old');
      }
    });

    it('should return error for unrealistic ages', () => {
      const tooOldDate = new Date(1900, 1, 1); // Over 120 years old
      expect(validateDateOfBirth(tooOldDate)).toBe('Please enter a valid birth date');
    });

    it('should handle leap years correctly', () => {
      const leapYearDate = new Date(2000, 1, 29); // Feb 29, 2000 (leap year)
      expect(validateDateOfBirth(leapYearDate)).toBeNull();
    });

    it('should handle edge case - birthday today but different year', () => {
      const today = new Date();
      const exactlyThirteenToday = new Date(
        today.getFullYear() - 13,
        today.getMonth(),
        today.getDate()
      );
      expect(validateDateOfBirth(exactlyThirteenToday)).toBeNull();
    });
  });

  describe('Age calculation edge cases', () => {
    it('should correctly calculate age when birthday is later in the year', () => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      const currentDay = today.getDate();
      
      // Create a date that's 13 years ago but with birthday later this year
      let futureMonth = currentMonth + 2;
      let futureYear = currentYear - 13;
      
      if (futureMonth > 11) {
        futureMonth = futureMonth - 12;
        futureYear = futureYear + 1;
      }
      
      const birthdayLaterThisYear = new Date(futureYear, futureMonth, currentDay);
      
      // This person should still be 12 (birthday hasn't occurred yet this year)
      if (futureMonth > currentMonth) {
        expect(validateDateOfBirth(birthdayLaterThisYear)).toBe('You must be at least 13 years old');
      }
    });

    it('should correctly calculate age when birthday is same month but later day', () => {
      const today = new Date();
      const birthdayLaterThisMonth = new Date(
        today.getFullYear() - 13,
        today.getMonth(),
        today.getDate() + 5
      );
      
      // If this creates a valid date in the same month
      if (birthdayLaterThisMonth.getMonth() === today.getMonth()) {
        expect(validateDateOfBirth(birthdayLaterThisMonth)).toBe('You must be at least 13 years old');
      }
    });
  });
});