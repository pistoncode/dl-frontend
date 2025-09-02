// Backend adapter for existing questionnaire services
import { questionnaireAPI, QuestionnaireData } from './api';

export class QuestionnaireBackendAdapter {
  private static instance: QuestionnaireBackendAdapter;
  private loadedQuestionnaires: Map<string, QuestionnaireData> = new Map();

  private constructor() {}

  static getInstance(): QuestionnaireBackendAdapter {
    if (!QuestionnaireBackendAdapter.instance) {
      QuestionnaireBackendAdapter.instance = new QuestionnaireBackendAdapter();
    }
    return QuestionnaireBackendAdapter.instance;
  }

  async loadQuestionnaire(sport: string): Promise<QuestionnaireData> {
    if (this.loadedQuestionnaires.has(sport)) {
      return this.loadedQuestionnaires.get(sport)!;
    }

    try {
      const questionnaireData = await questionnaireAPI.getQuestionnaire(sport);
      this.loadedQuestionnaires.set(sport, questionnaireData);
      return questionnaireData;
    } catch (error) {
      console.error(`Failed to load ${sport} questionnaire:`, error);
      throw error;
    }
  }

  async saveQuestionnaireResponse(sport: string, responses: Record<string, any>, userId: string) {
    try {
      const result = await questionnaireAPI.submitQuestionnaire(sport, responses, userId);
      return result;
    } catch (error) {
      console.error(`Failed to save ${sport} questionnaire response:`, error);
      throw error;
    }
  }

  async getUserResponse(sport: string, userId: string) {
    try {
      const response = await questionnaireAPI.getSportResponse(sport, userId);
      return response;
    } catch (error) {
      console.error(`Failed to get user ${sport} response:`, error);
      return null;
    }
  }

  // Convert backend questionnaire data to frontend format
  convertToFrontendQuestions(sport: string, backendData: QuestionnaireData) {
    const { questions } = backendData;
    
    // Convert questions to match existing frontend interfaces
    return questions.map(q => {
      const frontendQuestion: any = {
        key: q.key,
        question: q.question,
        type: q.type,
        help_text: q.helptext,
        optional: q.optional
      };

      if (q.type === 'single_choice' && q.options) {
        frontendQuestion.options = q.options.map(opt => opt.label);
      }

      if (q.type === 'number') {
        frontendQuestion.min_value = q.min;
        frontendQuestion.max_value = q.max;
        frontendQuestion.step = q.step;
      }

      if (q.type === 'skill_matrix' && q.subQuestions) {
        frontendQuestion.sub_questions = {};
        for (const [key, subQ] of Object.entries(q.subQuestions)) {
          frontendQuestion.sub_questions[key] = {
            question: subQ.question,
            options: subQ.options.map(opt => opt.label)
          };
        }
      }

      return frontendQuestion;
    });
  }
}

export const questionnaireAdapter = QuestionnaireBackendAdapter.getInstance();
