export interface QuestionnaireResponse {
  [key: string]: string | number | { [key: string]: string };
}

export interface SkillQuestions {
  [key: string]: string;
}

export interface RatingResult {
  singles_rating: number;
  doubles_rating: number;
  confidence: 'low' | 'medium' | 'medium-high' | 'high';
  rating_deviation: number;
  source: 'dupr_conversion' | 'questionnaire' | 'default' | 'error_fallback';
  adjustment_detail?: any;
  error?: string;
  reliability_score?: number;
  pattern_flags?: string[];
  confidence_breakdown?: { [key: string]: number };
}

export interface Question {
  key: string;
  question: string;
  type: 'single_choice' | 'number' | 'skill_matrix' | 'reliability_check';
  options?: string[];
  sub_questions?: { [key: string]: { question: string; options: string[] } };
  min_value?: number;
  max_value?: number;
  step?: number;
  optional?: boolean;
  help_text?: string;
  conditional?: string;
  reliability_target?: string;
}

export class PickleballQuestionnaire {
  private BASE_RATING = 1500;
  private EXPERIENCE_RANGE = 300;
  private SPORTS_BACKGROUND_RANGE = 280;
  private FREQUENCY_RANGE = 150;
  private SKILL_RANGE = 320;
  private COMPETITIVE_RANGE = 200;

  private CONFIDENCE_WEIGHTS = {
    experience: 2.0,
    skills: 1.8,
    self_rating: 1.5,
    competitive_level: 1.3,
    sports_background: 1.2,
    frequency: 1.0,
    tournament: 1.0,
  };

  private questions = {
    has_dupr: {
      question: "Do you have a DUPR (Dynamic Universal Pickleball Rating)?",
      answers: {
        "Yes": true,
        "No": false,
        "Not sure what DUPR is": false,
      },
    },
    dupr_singles: {
      question: "What is your current DUPR Singles rating?",
      input_type: "number",
      min_value: 2.0,
      max_value: 8.0,
      step: 0.01,
      conditional: "has_dupr",
      optional: true,
      help_text: "Leave blank if you don't have a singles DUPR rating",
    },
    dupr_doubles: {
      question: "What is your current DUPR Doubles rating?",
      input_type: "number",
      min_value: 2.0,
      max_value: 8.0,
      step: 0.01,
      conditional: "has_dupr",
      optional: true,
      help_text: "Leave blank if you don't have a doubles DUPR rating",
    },
    dupr_reliability_games: {
      question: "How many games is your DUPR rating based on?",
      answers: {
        "Less than 5 games": 0.3,
        "5-10 games": 0.6,
        "11-20 games": 0.8,
        "More than 20 games": 1.0,
      },
      conditional: "has_dupr",
      help_text: "More games generally means a more reliable DUPR rating",
    },
    dupr_recent_activity: {
      question: "When did you last play a DUPR-rated game?",
      answers: {
        "Within the last week": 1.0,
        "Within the last month": 0.9,
        "1-3 months ago": 0.7,
        "More than 3 months ago": 0.5,
      },
      conditional: "has_dupr",
      help_text: "Recent activity helps ensure your rating reflects current skill level",
    },
    dupr_competition_level: {
      question: "What level of competition were your DUPR games?",
      answers: {
        "Mostly recreational games": 0.6,
        "Mix of recreational and competitive": 0.8,
        "Mostly competitive tournaments": 1.0,
        "High-level competitive events": 1.0,
      },
      conditional: "has_dupr",
      help_text: "Competitive games generally provide more accurate ratings",
    },
    experience: {
      question: "How long have you been playing pickleball?",
      answers: {
        "Less than 1 month": -0.7,
        "1-3 months": -0.4,
        "3-6 months": -0.1,
        "6-12 months": 0.2,
        "1-2 years": 0.5,
        "More than 2 years": 1.0,
      },
    },
    sports_background: {
      question: "What is your background in racquet sports?",
      answers: {
        "No experience with racquet sports": -0.8,
        "Casual/recreational player of other racquet sports": -0.3,
        "Intermediate level in tennis, badminton, or table tennis": 0.4,
        "Advanced/competitive player in other racquet sports": 0.9,
        "Professional athlete in racquet sports": 1.0,
      },
    },
    frequency: {
      question: "How often do you play pickleball?",
      answers: {
        "Once a month": -0.4,
        "2-3 times a month": 0.0,
        "Once a week": 0.3,
        "2-3 times a week": 0.7,
        "4+ times a week": 1.0,
      },
    },
    competitive_level: {
      question: "What level do you typically play at?",
      answers: {
        "Recreational/fun games with friends": -0.4,
        "Club/DUPR match play": 0.2,
        "Novice/Intermediate Competitive tournaments": 0.7,
        "High-level competitive tournaments": 1.0,
      },
    },
    skills: {
      question: "Rate your pickleball skills:",
      sub_questions: {
        serving: {
          question: "Serving accuracy and consistency",
          answers: {
            "Beginner (learning basic serves)": -0.7,
            "Developing (consistent basic serves)": -0.2,
            "Intermediate (can place serves)": 0.3,
            "Advanced (variety of controlled serves)": 0.8,
          },
        },
        dinking: {
          question: "Dinking and soft game",
          answers: {
            "Beginner (learning to dink)": -0.7,
            "Developing (can sustain short rallies)": -0.2,
            "Intermediate (good control and placement)": 0.3,
            "Advanced (excellent control and strategy)": 0.8,
          },
        },
        volleys: {
          question: "Volleys and net play",
          answers: {
            "Beginner (learning basic volleys)": -0.7,
            "Developing (can sustain volley exchanges)": -0.2,
            "Intermediate (good reflexes and placement)": 0.3,
            "Advanced (excellent reflexes and strategy)": 0.8,
          },
        },
        positioning: {
          question: "Court positioning and strategy",
          answers: {
            "Beginner (learning basic positioning)": -0.7,
            "Developing (understand basic strategy)": -0.2,
            "Intermediate (good positioning and awareness)": 0.3,
            "Advanced (excellent strategy and adaptability)": 0.8,
          },
        },
      },
    },
    self_rating: {
      question: "How would you rate yourself as a pickleball player on a scale of 1.0 to 5.0?",
      answers: {
        "1.0-1.5 (Beginner)": -0.8,
        "2.0-2.5 (Lower Intermediate)": -0.4,
        "3.0-3.5 (Intermediate)": 0.0,
        "4.0-4.5 (Advanced)": 0.5,
        "5.0+ (Expert/Pro)": 1.0,
      },
    },
    tournament: {
      question: "Have you competed in pickleball tournaments?",
      answers: {
        "Never": -0.5,
        "Recreational/local tournaments": 0.0,
        "Regional tournaments": 0.5,
        "National tournaments": 1.0,
      },
    },
    consistency_check_1: {
      question: "On a scale of 1-10, how would you rate your overall pickleball ability?",
      answers: {
        "1-2 (Complete beginner)": 1.5,
        "3-4 (Learning basics)": 2.5,
        "5-6 (Recreational player)": 3.5,
        "7-8 (Strong player)": 4.5,
        "9-10 (Expert/competitive)": 5.5,
      },
      help_text: "This helps us verify the consistency of your responses",
    },
    consistency_check_2: {
      question: "What best describes your typical pickleball opponents?",
      answers: {
        "Complete beginners like me": 1.5,
        "Mixed beginners and intermediate": 2.5,
        "Mostly intermediate players": 3.5,
        "Advanced and competitive players": 4.5,
        "Expert and professional level": 5.5,
      },
      help_text: "Your regular competition level is a good indicator of your skill",
    },
  };

  shouldSkipQuestionnaire(responses: QuestionnaireResponse): boolean {
    const hasDupr = responses.has_dupr;
    const duprSingles = responses.dupr_singles;
    const duprDoubles = responses.dupr_doubles;

    if (hasDupr && (duprSingles || duprDoubles)) {
      let validSingles = false;
      let validDoubles = false;

      if (duprSingles) {
        try {
          const singlesFloat = parseFloat(duprSingles.toString());
          validSingles = singlesFloat >= 2.0 && singlesFloat <= 8.0;
        } catch {
          // Invalid input
        }
      }

      if (duprDoubles) {
        try {
          const doublesFloat = parseFloat(duprDoubles.toString());
          validDoubles = doublesFloat >= 2.0 && doublesFloat <= 8.0;
        } catch {
          // Invalid input
        }
      }

      return validSingles || validDoubles;
    }

    return false;
  }

  getConditionalQuestions(responses: QuestionnaireResponse): Question[] {
    if (!responses.has_dupr) {
      return [
        {
          key: 'has_dupr',
          question: this.questions.has_dupr.question,
          type: 'single_choice',
          options: Object.keys(this.questions.has_dupr.answers),
          help_text: 'DUPR is the official rating system used in competitive pickleball',
        },
      ];
    }

    if (responses.has_dupr === 'No' || responses.has_dupr === 'Not sure what DUPR is') {
      return this.getRemainingQuestionnaireQuestions(responses);
    }

    if (responses.has_dupr === 'Yes') {
      // DUPR rating questions
      if (!('dupr_singles' in responses)) {
        return [
          {
            key: 'dupr_singles',
            question: 'What is your DUPR Singles rating? (Leave blank if you don\'t play singles)',
            type: 'number',
            min_value: 2.0,
            max_value: 8.0,
            step: 0.01,
            optional: true,
            help_text: 'Your singles DUPR rating (e.g., 3.75). Skip if you don\'t have one.',
          },
        ];
      }

      if (!('dupr_doubles' in responses)) {
        return [
          {
            key: 'dupr_doubles',
            question: 'What is your DUPR Doubles rating? (Leave blank if you don\'t play doubles)',
            type: 'number',
            min_value: 2.0,
            max_value: 8.0,
            step: 0.01,
            optional: true,
            help_text: 'Your doubles DUPR rating (e.g., 4.12). Skip if you don\'t have one.',
          },
        ];
      }

      // DUPR reliability questions
      const duprReliabilityKeys = ['dupr_reliability_games', 'dupr_recent_activity', 'dupr_competition_level'];
      for (const key of duprReliabilityKeys) {
        if (!(key in responses)) {
          return [
            {
              key,
              question: this.questions[key].question,
              type: 'single_choice',
              options: Object.keys(this.questions[key].answers),
              help_text: this.questions[key].help_text,
              conditional: 'has_dupr',
            },
          ];
        }
      }

      if (this.shouldSkipQuestionnaire(responses)) {
        return [];
      }
    }

    return this.getRemainingQuestionnaireQuestions(responses);
  }

  private getRemainingQuestionnaireQuestions(responses: QuestionnaireResponse): Question[] {
    const remainingQuestions: Question[] = [];
    const questionnaireKeys = [
      'experience',
      'sports_background', 
      'frequency',
      'competitive_level',
      'skills',
      'self_rating',
      'tournament',
      'consistency_check_1',
      'consistency_check_2',
    ];

    for (const key of questionnaireKeys) {
      if (!(key in responses)) {
        if (key === 'skills') {
          remainingQuestions.push({
            key,
            question: this.questions[key].question,
            type: 'skill_matrix',
            sub_questions: Object.fromEntries(
              Object.entries(this.questions[key].sub_questions).map(([skillKey, skillData]) => [
                skillKey,
                {
                  question: skillData.question,
                  options: Object.keys(skillData.answers),
                },
              ])
            ),
          });
        } else {
          remainingQuestions.push({
            key,
            question: this.questions[key].question,
            type: 'single_choice',
            options: Object.keys(this.questions[key].answers),
            help_text: this.questions[key].help_text,
          });
        }
      }
    }

    return remainingQuestions;
  }

  calculateInitialRating(responses: QuestionnaireResponse): RatingResult {
    try {
      if (!responses || Object.keys(responses).length === 0) {
        return {
          singles_rating: this.BASE_RATING,
          doubles_rating: this.BASE_RATING,
          confidence: 'low',
          rating_deviation: 350,
          source: 'default',
        };
      }

      if (this.shouldSkipQuestionnaire(responses)) {
        const duprSingles = responses.dupr_singles ? parseFloat(responses.dupr_singles.toString()) : null;
        const duprDoubles = responses.dupr_doubles ? parseFloat(responses.dupr_doubles.toString()) : null;
        
        return this.convertDuprToRatingWithReliability(duprSingles, duprDoubles, responses);
      }

      // Advanced questionnaire-based calculation with pattern recognition
      const analysisResult = this.analyzeResponsePatterns(responses);
      let ratingAdjustment = 0;
      const confidenceBreakdown: { [key: string]: number } = {};

      // Process each response category with advanced weighting
      const categories = ['experience', 'sports_background', 'frequency', 'competitive_level', 'self_rating', 'tournament'];
      
      for (const category of categories) {
        if (responses[category]) {
          const answer = responses[category] as string;
          const weight = this.questions[category].answers[answer] || 0;
          let categoryAdjustment = 0;

          if (category === 'experience') {
            categoryAdjustment = weight * this.EXPERIENCE_RANGE;
          } else if (category === 'sports_background') {
            categoryAdjustment = weight * this.SPORTS_BACKGROUND_RANGE;
          } else if (category === 'frequency') {
            categoryAdjustment = weight * this.FREQUENCY_RANGE;
          } else if (category === 'competitive_level') {
            categoryAdjustment = weight * this.COMPETITIVE_RANGE;
          } else if (category === 'self_rating') {
            categoryAdjustment = weight * this.SKILL_RANGE * 0.7;
          } else if (category === 'tournament') {
            categoryAdjustment = weight * this.SKILL_RANGE * 0.5;
          }

          // Apply reliability modifier based on pattern analysis
          const reliabilityModifier = analysisResult.reliability_score;
          categoryAdjustment *= reliabilityModifier;
          ratingAdjustment += categoryAdjustment;

          confidenceBreakdown[category] = Math.abs(weight) * this.CONFIDENCE_WEIGHTS[category] * reliabilityModifier;
        }
      }

      // Process skills with advanced analysis
      if (responses.skills && typeof responses.skills === 'object') {
        const skillWeights: number[] = [];
        const skillResponses = responses.skills as SkillQuestions;
        
        for (const [skill, answer] of Object.entries(skillResponses)) {
          if (this.questions.skills.sub_questions[skill]) {
            const weight = this.questions.skills.sub_questions[skill].answers[answer] || 0;
            skillWeights.push(weight);
          }
        }

        if (skillWeights.length > 0) {
          const avgSkillWeight = skillWeights.reduce((a, b) => a + b, 0) / skillWeights.length;
          const skillVariance = this.calculateVariance(skillWeights);
          
          // Apply consistency penalty for inconsistent skill ratings
          const consistencyModifier = skillVariance > 0.3 ? 0.8 : 1.0;
          const skillAdjustment = avgSkillWeight * this.SKILL_RANGE * consistencyModifier * analysisResult.reliability_score;
          
          ratingAdjustment += skillAdjustment;
          confidenceBreakdown['skills'] = Math.abs(avgSkillWeight) * this.CONFIDENCE_WEIGHTS.skills * consistencyModifier;
        }
      }

      // Calculate overall confidence with pattern recognition
      const totalConfidence = Object.values(confidenceBreakdown).reduce((a, b) => a + b, 0);
      const maxPossibleConfidence = Object.values(this.CONFIDENCE_WEIGHTS).reduce((a, b) => a + b, 0);
      let confidenceRatio = maxPossibleConfidence > 0 ? Math.min(totalConfidence / maxPossibleConfidence, 1.0) : 0;

      // Apply pattern-based confidence adjustments
      confidenceRatio *= analysisResult.reliability_score;

      let confidence: 'low' | 'medium' | 'medium-high' | 'high';
      let rd: number;

      if (confidenceRatio < 0.3) {
        confidence = 'low';
        rd = 350;
      } else if (confidenceRatio < 0.5) {
        confidence = 'medium';
        rd = 280;
      } else if (confidenceRatio < 0.75) {
        confidence = 'medium-high';
        rd = 200;
      } else {
        confidence = 'high';
        rd = 150;
      }

      // Final ratings with advanced adjustments
      let singlesRating = this.BASE_RATING + ratingAdjustment;
      const doublesAdjustment = ratingAdjustment < 0 ? 50 : 0;
      let doublesRating = singlesRating + doublesAdjustment;

      // Apply range constraints
      singlesRating = Math.max(1000, Math.min(8000, singlesRating));
      doublesRating = Math.max(1000, Math.min(8000, doublesRating));

      return {
        singles_rating: Math.round(singlesRating),
        doubles_rating: Math.round(doublesRating),
        confidence,
        rating_deviation: rd,
        source: 'questionnaire',
        reliability_score: analysisResult.reliability_score,
        pattern_flags: analysisResult.flags,
        confidence_breakdown: confidenceBreakdown,
        adjustment_detail: {
          base_rating: this.BASE_RATING,
          total_adjustment: ratingAdjustment,
          confidence_ratio: confidenceRatio,
          pattern_analysis: analysisResult,
        },
      };
    } catch (error) {
      return {
        singles_rating: this.BASE_RATING,
        doubles_rating: this.BASE_RATING,
        confidence: 'low',
        rating_deviation: 350,
        source: 'error_fallback',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private analyzeResponsePatterns(responses: QuestionnaireResponse): { reliability_score: number; flags: string[] } {
    const flags: string[] = [];
    let reliabilityScore = 1.0;

    // Check for consistency between self-assessment questions
    if (responses.consistency_check_1 && responses.consistency_check_2) {
      const rating1 = this.questions.consistency_check_1.answers[responses.consistency_check_1 as string] || 0;
      const rating2 = this.questions.consistency_check_2.answers[responses.consistency_check_2 as string] || 0;
      const difference = Math.abs(rating1 - rating2);
      
      if (difference > 1.5) {
        flags.push('inconsistent_self_assessment');
        reliabilityScore *= 0.8;
      }
    }

    // Check for unrealistic experience vs skill combinations
    if (responses.experience && responses.self_rating) {
      const experienceWeight = this.questions.experience.answers[responses.experience as string] || 0;
      const selfRatingWeight = this.questions.self_rating.answers[responses.self_rating as string] || 0;
      
      // Beginner claiming advanced skills
      if (experienceWeight < -0.3 && selfRatingWeight > 0.3) {
        flags.push('unrealistic_skill_claim');
        reliabilityScore *= 0.7;
      }
      
      // Advanced experience with beginner self-rating (possible sandbagger)
      if (experienceWeight > 0.7 && selfRatingWeight < -0.3) {
        flags.push('potential_sandbagging');
        reliabilityScore *= 0.9;
      }
    }

    // Check frequency vs competitive level consistency
    if (responses.frequency && responses.competitive_level) {
      const frequencyWeight = this.questions.frequency.answers[responses.frequency as string] || 0;
      const competitiveWeight = this.questions.competitive_level.answers[responses.competitive_level as string] || 0;
      
      if (frequencyWeight < 0 && competitiveWeight > 0.5) {
        flags.push('inconsistent_frequency_competition');
        reliabilityScore *= 0.85;
      }
    }

    // Check tournament experience vs self-rating consistency
    if (responses.tournament && responses.self_rating) {
      const tournamentWeight = this.questions.tournament.answers[responses.tournament as string] || 0;
      const selfRatingWeight = this.questions.self_rating.answers[responses.self_rating as string] || 0;
      
      if (tournamentWeight > 0.3 && selfRatingWeight < -0.2) {
        flags.push('tournament_rating_mismatch');
        reliabilityScore *= 0.9;
      }
    }

    return { reliability_score: Math.max(0.5, reliabilityScore), flags };
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  private convertDuprToRatingWithReliability(duprSingles: number | null, duprDoubles: number | null, responses: QuestionnaireResponse): RatingResult {
    // Calculate base DUPR conversion
    const baseResult = this.convertDuprToRating(duprSingles, duprDoubles);
    
    // Calculate DUPR reliability score
    let duprReliabilityScore = 1.0;
    const reliabilityFactors: string[] = [];

    if (responses.dupr_reliability_games) {
      const gamesReliability = this.questions.dupr_reliability_games.answers[responses.dupr_reliability_games as string] || 0;
      duprReliabilityScore *= gamesReliability;
      if (gamesReliability < 0.6) reliabilityFactors.push('few_games');
    }

    if (responses.dupr_recent_activity) {
      const activityReliability = this.questions.dupr_recent_activity.answers[responses.dupr_recent_activity as string] || 0;
      duprReliabilityScore *= activityReliability;
      if (activityReliability < 0.7) reliabilityFactors.push('outdated_rating');
    }

    if (responses.dupr_competition_level) {
      const competitionReliability = this.questions.dupr_competition_level.answers[responses.dupr_competition_level as string] || 0;
      duprReliabilityScore *= competitionReliability;
      if (competitionReliability < 0.8) reliabilityFactors.push('low_competition_level');
    }

    // Adjust confidence and rating deviation based on reliability
    let adjustedConfidence: 'low' | 'medium' | 'medium-high' | 'high' = 'high';
    let adjustedRD = 110;

    if (duprReliabilityScore < 0.6) {
      adjustedConfidence = 'medium';
      adjustedRD = 180;
    } else if (duprReliabilityScore < 0.8) {
      adjustedConfidence = 'medium-high';
      adjustedRD = 140;
    }

    return {
      ...baseResult,
      confidence: adjustedConfidence,
      rating_deviation: adjustedRD,
      reliability_score: duprReliabilityScore,
      pattern_flags: reliabilityFactors,
      adjustment_detail: {
        ...baseResult.adjustment_detail,
        dupr_reliability_score: duprReliabilityScore,
        reliability_factors: reliabilityFactors,
      },
    };
  }

  private convertDuprToRating(duprSingles: number | null, duprDoubles: number | null): RatingResult {
    const duprToRatingConversion = (dupr: number): number => {
      const clampedDupr = Math.max(2.0, Math.min(8.0, dupr));
      
      if (clampedDupr <= 3.0) {
        return 1000 + (clampedDupr - 2.0) * 900;
      } else if (clampedDupr <= 4.0) {
        return 1900 + (clampedDupr - 3.0) * 1000;
      } else if (clampedDupr <= 5.0) {
        return 2900 + (clampedDupr - 4.0) * 1000;
      } else if (clampedDupr <= 6.0) {
        return 3900 + (clampedDupr - 5.0) * 800;
      } else {
        return 4700 + (clampedDupr - 6.0) * 650;
      }
    };

    let singlesRating = duprSingles ? Math.round(duprToRatingConversion(duprSingles)) : null;
    let doublesRating = duprDoubles ? Math.round(duprToRatingConversion(duprDoubles)) : null;

    // Estimate missing ratings
    if (singlesRating && !doublesRating) {
      const estimatedDuprDoubles = Math.max(2.0, duprSingles! - 0.15);
      doublesRating = Math.round(duprToRatingConversion(estimatedDuprDoubles));
    } else if (doublesRating && !singlesRating) {
      const estimatedDuprSingles = Math.min(8.0, duprDoubles! + 0.15);
      singlesRating = Math.round(duprToRatingConversion(estimatedDuprSingles));
    }

    return {
      singles_rating: singlesRating || this.BASE_RATING,
      doubles_rating: doublesRating || this.BASE_RATING,
      confidence: 'high',
      rating_deviation: 110,
      source: 'dupr_conversion',
    };
  }

  generateFeedback(ratingData: RatingResult): string {
    const singlesRating = ratingData.singles_rating;
    const confidence = ratingData.confidence;
    const source = ratingData.source;

    // Determine skill level label based on rating
    let level: string;
    let description: string;

    if (singlesRating < 1200) {
      level = 'Beginner';
      description = "You're just starting your pickleball journey. Focus on learning the basic rules and shots.";
    } else if (singlesRating < 1500) {
      level = 'Advanced Beginner';
      description = 'You understand the basics and are developing consistency. Work on your dinking and third shot drops.';
    } else if (singlesRating < 1800) {
      level = 'Lower Intermediate';
      description = 'You have decent consistency and are developing better shot selection. Focus on strategy and positioning.';
    } else if (singlesRating < 2200) {
      level = 'Intermediate';
      description = 'You have good consistency and shot variety. Work on reducing unforced errors and improving your net game.';
    } else if (singlesRating < 2800) {
      level = 'Upper Intermediate';
      description = 'You have strong fundamentals and good strategy. Focus on adding more finesse to your soft game and shot placement.';
    } else if (singlesRating < 3500) {
      level = 'Advanced';
      description = 'You have excellent control, strategy, and shot selection. Work on adding more deception and adaptability to your game.';
    } else if (singlesRating < 4500) {
      level = 'Expert';
      description = 'You show mastery of all aspects of pickleball. Keep refining your game and working on mental toughness.';
    } else {
      level = 'Professional';
      description = 'You compete at the highest levels of pickleball. Focus on maintaining peak performance and strategic innovation.';
    }

    let confidenceNote: string;
    if (source === 'dupr_conversion') {
      confidenceNote = 'Your ratings were converted from your DUPR ratings. This provides a highly accurate starting point.';
    } else {
      if (confidence === 'low') {
        confidenceNote = "Since you're new to pickleball or have limited experience, your initial rating might change significantly as you play more matches.";
      } else if (confidence === 'medium') {
        confidenceNote = 'Based on your responses, we have a moderate level of confidence in this rating. It may adjust somewhat as you play more matches.';
      } else {
        confidenceNote = 'Based on your detailed responses, we have high confidence in this rating, but it will still be refined as you play matches.';
      }
    }

    return `Based on your ${source === 'dupr_conversion' ? 'DUPR ratings' : 'questionnaire responses'}, your initial rating is:

Singles DMR: ${singlesRating}
Doubles DMR: ${ratingData.doubles_rating}

Skill Level: ${level}

${description}

${confidenceNote}

Your rating will automatically adjust as you play matches in the app, becoming more accurate over time.`;
  }
}