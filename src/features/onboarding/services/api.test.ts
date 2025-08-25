import { QuestionnaireAPI, UserProfileUpdate } from './api';

// Mock fetch globally
global.fetch = jest.fn();

describe('QuestionnaireAPI User Profile Methods', () => {
  let api: QuestionnaireAPI;
  const mockUserId = 'test-user-id';
  
  beforeEach(() => {
    api = new QuestionnaireAPI();
    jest.clearAllMocks();
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const profileData: UserProfileUpdate = {
        name: 'John Doe',
        gender: 'male',
        dateOfBirth: '1990-01-01'
      };

      const mockResponse = {
        user: {
          id: mockUserId,
          name: 'John Doe',
          email: 'john@example.com',
          gender: 'male',
          dateOfBirth: '1990-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        success: true
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.updateUserProfile(mockUserId, profileData);

      expect(fetch).toHaveBeenCalledWith(
        `http://192.168.1.7:3001/api/onboarding/profile/${mockUserId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(profileData)
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('should throw error when user ID is missing', async () => {
      const profileData: UserProfileUpdate = {
        name: 'John Doe',
        gender: 'male',
        dateOfBirth: '1990-01-01'
      };

      await expect(api.updateUserProfile('', profileData)).rejects.toThrow('User ID is required');
    });

    it('should handle API error responses', async () => {
      const profileData: UserProfileUpdate = {
        name: 'John Doe',
        gender: 'male',
        dateOfBirth: '1990-01-01'
      };

      const errorResponse = {
        error: 'Name must be at least 2 characters long',
        code: 'INVALID_NAME',
        success: false
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(api.updateUserProfile(mockUserId, profileData))
        .rejects.toThrow('Name must be at least 2 characters long');
    });

    it('should handle network errors', async () => {
      const profileData: UserProfileUpdate = {
        name: 'John Doe',
        gender: 'male',
        dateOfBirth: '1990-01-01'
      };

      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(api.updateUserProfile(mockUserId, profileData))
        .rejects.toThrow('Network error');
    });
  });

  describe('getUserProfile', () => {
    it('should fetch user profile successfully', async () => {
      const mockProfile = {
        user: {
          id: mockUserId,
          name: 'Jane Doe',
          email: 'jane@example.com',
          gender: 'female',
          dateOfBirth: '1985-05-15T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        success: true
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfile)
      });

      const result = await api.getUserProfile(mockUserId);

      expect(fetch).toHaveBeenCalledWith(
        `http://192.168.1.7:3001/api/onboarding/profile/${mockUserId}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      expect(result).toEqual(mockProfile);
    });

    it('should throw error when user ID is missing', async () => {
      await expect(api.getUserProfile('')).rejects.toThrow('User ID is required');
    });

    it('should handle user not found', async () => {
      const errorResponse = {
        error: 'User not found',
        code: 'USER_NOT_FOUND',
        success: false
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(api.getUserProfile(mockUserId))
        .rejects.toThrow('User not found');
    });

    it('should handle malformed response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      await expect(api.getUserProfile(mockUserId))
        .rejects.toThrow('Failed to fetch profile: Internal Server Error');
    });
  });

  describe('Error handling edge cases', () => {
    it('should handle empty response bodies gracefully', async () => {
      const profileData: UserProfileUpdate = {
        name: 'John Doe',
        gender: 'male',
        dateOfBirth: '1990-01-01'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.reject(new Error('No JSON'))
      });

      await expect(api.updateUserProfile(mockUserId, profileData))
        .rejects.toThrow('Failed to update profile: Bad Request');
    });

    it('should handle timeout scenarios', async () => {
      const profileData: UserProfileUpdate = {
        name: 'John Doe',
        gender: 'male',
        dateOfBirth: '1990-01-01'
      };

      (fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      await expect(api.updateUserProfile(mockUserId, profileData))
        .rejects.toThrow('Request timeout');
    });
  });
});