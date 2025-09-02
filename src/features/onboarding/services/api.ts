// API service for questionnaires
import { getBackendBaseURL } from '../../../config/network';

const BASE_URL = getBackendBaseURL();

export interface QuestionOption {
  label: string;
  weight?: number;
  value?: boolean | number;
}

export interface Question {
  key: string;
  question: string;
  type: 'single_choice' | 'number' | 'skill_matrix';
  options?: QuestionOption[];
  subQuestions?: {
    [key: string]: {
      question: string;
      options: QuestionOption[];
    };
  };
  min?: number;
  max?: number;
  step?: number;
  optional?: boolean;
  helptext?: string;
  visible_if?: {
    key: string;
    op: string;
    value: any;
  }[];
}

export interface QuestionnaireData {
  sport: string;
  version: number;
  questions: Question[];
}

export interface QuestionnaireResponse {
  [key: string]: string | number | { [key: string]: string };
}

export interface RatingResult {
  source: string;
  singles: number;
  doubles: number;
  rd: number;
  confidence: string;
  detail?: any;
}

export interface SubmissionResult {
  responseId: number;
  version: number;
  qHash: string;
  result: RatingResult;
  sport: string;
  success: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  gender?: string;
  dateOfBirth?: string;
  createdAt: string;
}

export interface UserProfileUpdate {
  name: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
}

export class QuestionnaireAPI {
  private readonly getAuthHeaders = async () => {
    return {
      'Content-Type': 'application/json',
      // Add authorization header if needed in the future
    };
  };

  async getQuestionnaire(sport: string): Promise<QuestionnaireData> {
    try {
      const response = await fetch(`${BASE_URL}/onboarding/${sport}/questions`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch questionnaire: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching questionnaire:', error);
      throw error;
    }
  }

  async submitQuestionnaire(sport: string, answers: QuestionnaireResponse, userId: string): Promise<SubmissionResult> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${BASE_URL}/onboarding/${sport}/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: userId,
          answers
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to submit questionnaire: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      throw error;
    }
  }

  async getUserResponses(userId: string): Promise<{ responses: any[]; success: boolean }> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${BASE_URL}/onboarding/responses/${userId}`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch responses: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user responses:', error);
      throw error;
    }
  }

  async getSportResponse(sport: string, userId: string): Promise<{ response: any; success: boolean } | null> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${BASE_URL}/onboarding/responses/${userId}/${sport}`, {
        headers
      });
      
      if (response.status === 404) {
        return null; // No response found for this sport
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sport response: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching sport response:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: string, profileData: UserProfileUpdate): Promise<{ user: UserProfile; success: boolean }> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${BASE_URL}/api/onboarding/profile/${userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update profile: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<{ user: UserProfile; success: boolean }> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${BASE_URL}/onboarding/profile/${userId}`, {
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch profile: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
}

export const questionnaireAPI = new QuestionnaireAPI();
