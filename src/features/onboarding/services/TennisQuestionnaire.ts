export interface TennisQuestionnaireResponse {
  [key: string]: string | number | { [key: string]: string };
}

export interface TennisSkillQuestions {
  [key: string]: string;
}

export interface TennisRatingResult {
  rating: number;
  confidence: 'low' | 'medium' | 'high';
  rating_deviation: number;
  source: 'questionnaire' | 'default' | 'error_fallback';
  adjustment_detail?: any;
  error?: string;
  confidence_breakdown?: { [key: string]: number };
}

export interface TennisQuestion {
  key: string;
  question: string;
  type: 'single_choice' | 'skill_matrix';
  options?: string[];
  sub_questions?: { [key: string]: { question: string; options: string[]; tooltip?: string } };
  help_text?: string;
  contextText?: string;
  tooltipText?: string;
}

export class TennisQuestionnaire {
  private BASE_RATING = 1500;
  private EXPERIENCE_RANGE = 400;
  private COACHING_RANGE = 300;
  private FREQUENCY_RANGE = 200;
  private SKILL_RANGE = 350;
  private COMPETITIVE_RANGE = 250;
  private TOURNAMENT_RANGE = 200;

  private CONFIDENCE_WEIGHTS = {
    experience: 1.8,
    skills: 2.0,
    self_rating: 1.5,
    competitive_level: 1.4,
    coaching_background: 1.3,
    frequency: 1.1,
    tournament: 1.2,
  };

  private questions = {
    experience: {
      question: "How long have you been playing tennis?",
      answers: {
        "Less than 6 months": -0.8,
        "6 months - 1 year": -0.5,
        "1-2 years": -0.1,
        "2-5 years": 0.4,
        "More than 5 years": 1.0,
      },
      context_text: "Your tennis playing history",
      help_text: "Include all tennis experience, whether casual or formal",
    },
    frequency: {
      question: "How often do you currently play tennis?",
      answers: {
        "Rarely (less than once a month)": -0.6,
        "Monthly (1-2 times per month)": -0.2,
        "Weekly (1-2 times per week)": 0.3,
        "Regular (3-4 times per week)": 0.7,
        "Daily/Intensive (5+ times per week)": 1.0,
      },
      context_text: "Current playing frequency",
      help_text: "Consider your average playing frequency over the past few months",
    },
    competitive_level: {
      question: "What level do you typically play at?",
      answers: {
        "Recreational/social tennis with friends": -0.5,
        "Social/friendly matches": -0.1,
        "Local/small tournaments": 0.4,
        "Regional/state tournaments": 0.8,
        "National tournaments": 1.0,
      },
      context_text: "Competitive experience level",
      help_text: "Select the highest level you regularly compete at",
    },
    coaching_background: {
      question: "What is your experience with tennis coaching/instruction?",
      answers: {
        "Self-taught/no formal instruction": -0.7,
        "Some coaching experience (group or private)": -0.3,
        "Regular coaching in the past or ongoing group lessons": 0.2,
        "Extensive private coaching experience": 0.6,
        "Professional/academy training background": 1.0,
      },
      context_text: "Formal instruction background",
      help_text: "Include any lessons, clinics, or formal training you've received",
    },
    tournament: {
      question: "What is your tournament playing experience?",
      answers: {
        "Never played tournaments": -0.6,
        "Club level tournaments": -0.1,
        "Regional tournaments": 0.3,
        "State level tournaments": 0.7,
        "National tournaments": 1.0,
      },
      context_text: "Tournament competition history",
      help_text: "Select your highest level of tournament participation",
    },
    skills: {
      question: "Rate your tennis skills in each area:",
      context_text: "Technical skill assessment",
      help_text: "Be honest about your current abilities in each tennis skill area",
      sub_questions: {
        serving: {
          question: "Serving",
          answers: {
            "Beginner (learning basic serve motion)": -0.8,
            "Developing (consistent first serve, learning second serve)": -0.3,
            "Intermediate (good first serve placement, reliable second serve)": 0.3,
            "Advanced (variety of serves with good placement and power)": 0.8,
          },
          tooltip: "Rate your serving ability including first serve consistency, second serve reliability, and placement control",
        },
        forehand: {
          question: "Groundstrokes (Forehand)",
          answers: {
            "Beginner (learning basic strokes)": -0.8,
            "Developing (can rally consistently from baseline)": -0.3,
            "Intermediate (good power and placement from baseline)": 0.3,
            "Advanced (excellent control, variety, and tactical awareness)": 0.8,
          },
          tooltip: "Assess your forehand groundstroke technique, consistency, and ability to control pace and placement",
        },
        backhand: {
          question: "Groundstrokes (Backhand)",
          answers: {
            "Beginner (learning basic strokes)": -0.8,
            "Developing (can rally consistently from baseline)": -0.3,
            "Intermediate (good power and placement from baseline)": 0.3,
            "Advanced (excellent control, variety, and tactical awareness)": 0.8,
          },
          tooltip: "Rate your backhand technique and consistency, whether one-handed or two-handed",
        },
        net_play: {
          question: "Net Play (Volleys/Overheads)",
          answers: {
            "Beginner (rarely come to net, basic volley technique)": -0.8,
            "Developing (comfortable with basic volleys)": -0.3,
            "Intermediate (good net coverage and volley placement)": 0.3,
            "Advanced (excellent net game and transition play)": 0.8,
          },
          tooltip: "Evaluate your ability at the net including volleys, overheads, and court coverage",
        },
        movement: {
          question: "Court Movement and Positioning",
          answers: {
            "Beginner (learning basic court positioning)": -0.8,
            "Developing (understand basic court coverage)": -0.3,
            "Intermediate (good court movement and recovery)": 0.3,
            "Advanced (excellent anticipation and court positioning)": 0.8,
          },
          tooltip: "Rate your footwork, court coverage, and ability to get into proper position for shots",
        },
        mental_game: {
          question: "Mental Game and Strategy",
          answers: {
            "Beginner (focus mainly on hitting the ball back)": -0.8,
            "Developing (basic understanding of tactics)": -0.3,
            "Intermediate (good match strategy and point construction)": 0.3,
            "Advanced (excellent tactical awareness and mental toughness)": 0.8,
          },
          tooltip: "Assess your tactical understanding, point construction ability, and mental resilience during matches",
        },
      },
    },
    self_rating: {
      question: "How would you rate yourself?",
      answers: {
        "1.0-2.0 (Beginner)": -0.8,
        "2.0-3.0 (Improver)": -0.4,
        "3.0-4.0 (Intermediate)": 0.0,
        "4.0-5.0 (Advanced)": 0.6,
        "5.0-6.0 (Professional)": 1.0,
      },
      context_text: "Overall self-assessment",
      help_text: "Based on standard tennis rating scales (NTRP/UTR equivalent)",
      tooltip: "1.0-2.0: New to tennis, learning basic strokes\n2.0-3.0: Can sustain simple rallies\n3.0-4.0: Consistent groundstrokes, developing strategy\n4.0-5.0: Strong all-around game, competitive player\n5.0-6.0: Tournament-level play, advanced tactics",
    },
  };

  getConditionalQuestions(responses: TennisQuestionnaireResponse): TennisQuestion[] {
    const remainingQuestions: TennisQuestion[] = [];
    const questionKeys = [
      'experience',
      'frequency',
      'competitive_level',
      'coaching_background',
      'tournament',
      'skills',
      'self_rating',
    ];

    for (const key of questionKeys) {
      if (!(key in responses)) {
        if (key === 'skills') {
          const questionData = this.questions[key as keyof typeof this.questions] as any;
          remainingQuestions.push({
            key,
            question: questionData.question,
            type: 'skill_matrix',
            help_text: questionData.help_text,
            contextText: questionData.context_text,
            sub_questions: Object.fromEntries(
              Object.entries(questionData.sub_questions).map(([skillKey, skillData]) => [
                skillKey,
                {
                  question: (skillData as any).question,
                  options: Object.keys((skillData as any).answers),
                  tooltip: (skillData as any).tooltip,
                },
              ])
            ),
          });
        } else {
          const questionData = this.questions[key as keyof typeof this.questions] as any;
          remainingQuestions.push({
            key,
            question: questionData.question,
            type: 'single_choice',
            options: Object.keys(questionData.answers),
            help_text: questionData.help_text,
            contextText: questionData.context_text,
            tooltipText: questionData.tooltip,
          });
        }
      }
    }

    return remainingQuestions;
  }

  calculateInitialRating(responses: TennisQuestionnaireResponse): TennisRatingResult {
    try {
      if (!responses || Object.keys(responses).length === 0) {
        return {
          rating: this.BASE_RATING,
          confidence: 'low',
          rating_deviation: 350,
          source: 'default',
        };
      }

      let ratingAdjustment = 0;
      let weightedConfidenceScore = 0;
      let maxWeightedConfidence = 0;
      const confidenceBreakdown: { [key: string]: number } = {};

      // Process each response category
      const categories = ['experience', 'frequency', 'competitive_level', 'coaching_background', 'tournament', 'self_rating'];
      
      for (const category of categories) {
        if (responses[category]) {
          const answer = responses[category] as string;
          const questionData = this.questions[category as keyof typeof this.questions] as any;
          const weight = questionData?.answers?.[answer] || 0;
          let categoryAdjustment = 0;

          if (category === 'experience') {
            categoryAdjustment = weight * this.EXPERIENCE_RANGE;
          } else if (category === 'frequency') {
            categoryAdjustment = weight * this.FREQUENCY_RANGE;
          } else if (category === 'competitive_level') {
            categoryAdjustment = weight * this.COMPETITIVE_RANGE;
          } else if (category === 'coaching_background') {
            categoryAdjustment = weight * this.COACHING_RANGE;
          } else if (category === 'tournament') {
            categoryAdjustment = weight * this.TOURNAMENT_RANGE;
          } else if (category === 'self_rating') {
            categoryAdjustment = weight * this.SKILL_RANGE * 0.6;
          }

          ratingAdjustment += categoryAdjustment;

          const confidenceContribution = Math.abs(weight) * (this.CONFIDENCE_WEIGHTS as any)[category];
          weightedConfidenceScore += confidenceContribution;
          maxWeightedConfidence += (this.CONFIDENCE_WEIGHTS as any)[category];
          confidenceBreakdown[category] = confidenceContribution;
        }
      }

      // Process skills
      if (responses.skills && typeof responses.skills === 'object') {
        const skillWeights: number[] = [];
        const skillResponses = responses.skills as TennisSkillQuestions;
        
        for (const [skill, answer] of Object.entries(skillResponses)) {
          const skillData = (this.questions.skills as any).sub_questions[skill];
          if (skillData) {
            const weight = skillData.answers[answer] || 0;
            skillWeights.push(weight);
          }
        }

        if (skillWeights.length > 0) {
          const avgSkillWeight = skillWeights.reduce((a, b) => a + b, 0) / skillWeights.length;
          const skillAdjustment = avgSkillWeight * this.SKILL_RANGE;
          
          ratingAdjustment += skillAdjustment;
          
          const confidenceContribution = Math.abs(avgSkillWeight) * this.CONFIDENCE_WEIGHTS.skills;
          weightedConfidenceScore += confidenceContribution;
          maxWeightedConfidence += this.CONFIDENCE_WEIGHTS.skills;
          confidenceBreakdown['skills'] = confidenceContribution;
        }
      }

      // Calculate overall confidence
      const confidenceRatio = maxWeightedConfidence > 0 ? Math.min(weightedConfidenceScore / maxWeightedConfidence, 1.0) : 0;

      let confidence: 'low' | 'medium' | 'high';
      let rd: number;

      if (confidenceRatio < 0.4) {
        confidence = 'low';
        rd = 350;
      } else if (confidenceRatio < 0.7) {
        confidence = 'medium';
        rd = 250;
      } else {
        confidence = 'high';
        rd = 150;
      }

      // Final rating
      let finalRating = this.BASE_RATING + ratingAdjustment;
      finalRating = Math.max(800, Math.min(8000, finalRating));

      return {
        rating: Math.round(finalRating),
        confidence,
        rating_deviation: rd,
        source: 'questionnaire',
        confidence_breakdown: confidenceBreakdown,
        adjustment_detail: {
          base_rating: this.BASE_RATING,
          total_adjustment: ratingAdjustment,
          confidence_ratio: confidenceRatio,
        },
      };
    } catch (error) {
      return {
        rating: this.BASE_RATING,
        confidence: 'low',
        rating_deviation: 350,
        source: 'error_fallback',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  generateFeedback(ratingData: TennisRatingResult): string {
    const rating = ratingData.rating;
    const confidence = ratingData.confidence;

    // Determine skill level label based on rating
    let level: string;
    let description: string;

    if (rating < 1000) {
      level = 'Beginner';
      description = "You're just starting your tennis journey. Focus on learning proper technique and basic strokes.";
    } else if (rating < 1300) {
      level = 'Advanced Beginner';
      description = "You have the basics down and are building consistency. Work on your serve and rally endurance.";
    } else if (rating < 1600) {
      level = 'Improver';
      description = "You can sustain rallies and have developing shot variety. Focus on court positioning and strategy.";
    } else if (rating < 1900) {
      level = 'Intermediate';
      description = "You have good consistency and are developing tactical awareness. Work on your weaker shots and net game.";
    } else if (rating < 2300) {
      level = 'Upper Intermediate';
      description = "You have strong fundamentals and good court sense. Focus on shot selection and mental toughness.";
    } else if (rating < 2800) {
      level = 'Advanced';
      description = "You have excellent technique and tactical understanding. Work on adapting your game to different opponents.";
    } else if (rating < 3500) {
      level = 'Expert';
      description = "You show mastery of all tennis skills. Focus on fine-tuning your game and competitive performance.";
    } else {
      level = 'Professional';
      description = "You compete at the highest levels. Continue perfecting your craft and maintaining peak performance.";
    }

    let confidenceNote: string;
    if (confidence === 'low') {
      confidenceNote = "Since you're new to tennis or have limited experience, your initial rating might change significantly as you play more matches.";
    } else if (confidence === 'medium') {
      confidenceNote = 'Based on your responses, we have a moderate level of confidence in this rating. It may adjust somewhat as you play more matches.';
    } else {
      confidenceNote = 'Based on your detailed responses, we have high confidence in this rating, but it will still be refined as you play matches.';
    }

    return `Based on your questionnaire responses, your initial rating is:

Tennis Rating: ${rating}

Skill Level: ${level}

${description}

${confidenceNote}

Your rating will automatically adjust as you play matches in the app, becoming more accurate over time.`;
  }
}