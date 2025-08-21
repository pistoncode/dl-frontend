export interface PadelQuestionnaireResponse {
  [key: string]: string | number | { [key: string]: string };
}

export interface PadelSkillQuestions {
  [key: string]: string;
}

export interface PadelRatingResult {
  rating: number;
  confidence: 'low' | 'medium' | 'high';
  rating_deviation: number;
  source: 'questionnaire' | 'default' | 'error_fallback';
  adjustment_detail?: any;
  error?: string;
  confidence_breakdown?: { [key: string]: number };
}

export interface PadelQuestion {
  key: string;
  question: string;
  type: 'single_choice' | 'skill_matrix';
  options?: string[];
  sub_questions?: { [key: string]: { question: string; options: string[]; tooltip?: string } };
  help_text?: string;
  contextText?: string;
  tooltipText?: string;
}

export class PadelQuestionnaire {
  private BASE_RATING = 1500;
  private EXPERIENCE_RANGE = 350;
  private COACHING_RANGE = 280;
  private FREQUENCY_RANGE = 180;
  private SKILL_RANGE = 400;
  private COMPETITIVE_RANGE = 220;
  private TOURNAMENT_RANGE = 180;
  private SPORTS_BACKGROUND_RANGE = 300;

  private CONFIDENCE_WEIGHTS = {
    experience: 1.9,
    skills: 2.2,
    self_rating: 1.6,
    competitive_level: 1.4,
    coaching_background: 1.3,
    frequency: 1.1,
    tournament: 1.2,
    sports_background: 1.0,
  };

  private questions = {
    experience: {
      question: "How long have you been playing padel?",
      answers: {
        "Less than 3 months": -0.8,
        "3-6 months": -0.4,
        "6 months - 1 year": 0.0,
        "1-2 years": 0.5,
        "More than 2 years": 1.0,
      },
      context_text: "Your padel playing history",
      help_text: "Include all padel experience, whether casual or formal",
    },
    sports_background: {
      question: "What is your background in racquet sports?",
      answers: {
        "No experience with racquet sports": -0.8,
        "Casual player in tennis/squash/badminton": -0.2,
        "Intermediate level in tennis or squash": 0.4,
        "Advanced/competitive player in tennis or squash": 0.8,
        "Professional athlete in racquet sports": 1.0,
      },
      context_text: "Other sports experience",
      help_text: "Tennis, squash, and badminton skills transfer well to padel",
    },
    frequency: {
      question: "How often do you currently play padel?",
      answers: {
        "Rarely (less than once a month)": -0.6,
        "Monthly (1-2 times per month)": -0.2,
        "Weekly (1-2 times per week)": 0.3,
        "Regular (3-4 times per week)": 0.7,
        "Daily (5+ times per week)": 1.0,
      },
      context_text: "Current playing frequency",
      help_text: "Consider your average playing frequency over the past few months",
    },
    competitive_level: {
      question: "What level do you typically play at?",
      answers: {
        "Social/recreational games with friends": -0.5,
        "Club-level matches": -0.1,
        "Local club-level social tournaments": 0.3,
        "Regional tournaments": 0.7,
        "Professional tournaments": 1.0,
      },
      context_text: "Competitive experience level",
      help_text: "Select the highest level you regularly compete at",
    },
    coaching_background: {
      question: "Have you had any padel coaching or instruction?",
      answers: {
        "Self-taught/no formal instruction": -0.7,
        "Some group lessons or clinics": -0.3,
        "Regular group lessons": 0.2,
        "Consistent private coaching sessions": 0.6,
        "Professional/academy training": 1.0,
      },
      context_text: "Formal instruction background",
      help_text: "Include any lessons, clinics, or formal training you've received",
    },
    tournament: {
      question: "What is your tournament playing experience?",
      answers: {
        "Never played tournaments": -0.6,
        "Social tournaments only": -0.2,
        "Club level beginner/novice tournaments": 0.2,
        "Intermediate/Advanced tournaments": 0.8,
      },
      context_text: "Tournament competition history",
      help_text: "Select your highest level of tournament participation",
    },
    skills: {
      question: "Rate your padel skills in each area:",
      context_text: "Technical skill assessment",
      help_text: "Be honest about your current abilities in each padel skill area",
      sub_questions: {
        serving: {
          question: "Serving",
          answers: {
            "Beginner (learning basic underhand serve)": -0.8,
            "Developing (consistent serve to service box)": -0.3,
            "Intermediate (good placement and variety)": 0.3,
            "Advanced (excellent placement, spin, and tactical serving)": 0.8,
          },
          tooltip: "Rate your underhand serving ability including placement, consistency, and tactical variety",
        },
        wall_play: {
          question: "Wall Play (Back walls)",
          answers: {
            "Beginner (struggle with balls off the wall)": -0.8,
            "Developing (can play basic shots off back wall)": -0.3,
            "Intermediate (comfortable using walls tactically)": 0.3,
            "Advanced (excellent wall play and court geometry understanding)": 0.8,
          },
          tooltip: "Assess your ability to play shots off the back walls and use them strategically",
        },
        net_play: {
          question: "Net Play (Volleys and positioning)",
          answers: {
            "Beginner (basic volleys, rarely at net)": -0.8,
            "Developing (comfortable with simple volleys)": -0.3,
            "Intermediate (good net coverage and volley placement)": 0.3,
            "Advanced (dominant net game with excellent positioning)": 0.8,
          },
          tooltip: "Rate your net game including volleys, positioning, and court coverage with your partner",
        },
        lob_smash: {
          question: "Lob and Smash",
          answers: {
            "Beginner (learning basic lobs and overheads)": -0.8,
            "Developing (can execute basic lobs and smashes)": -0.3,
            "Intermediate (good lob placement and overhead power)": 0.3,
            "Advanced (excellent lob variety and smash winners)": 0.8,
          },
          tooltip: "Evaluate your lob accuracy and overhead smash technique and power",
        },
        glass_play: {
          question: "Glass Play (Side walls)",
          answers: {
            "Beginner (struggle with balls off glass walls)": -0.8,
            "Developing (can return balls off glass walls)": -0.3,
            "Intermediate (use glass walls tactically)": 0.3,
            "Advanced (master glass wall angles and spins)": 0.8,
          },
          tooltip: "Rate your ability to play shots off the side glass walls and use them strategically",
        },
        positioning: {
          question: "Court Positioning and Movement",
          answers: {
            "Beginner (learning basic court positions, focused on hitting the ball)": -0.8,
            "Developing (understand basic partner positioning)": -0.3,
            "Intermediate (good court coverage with partner)": 0.3,
            "Advanced (excellent tactical positioning and anticipation)": 0.8,
          },
          tooltip: "Assess your court movement, partner positioning, and tactical awareness in doubles play",
        },
      },
    },
    self_rating: {
      question: "How would you rate yourself as a padel player?",
      answers: {
        "Beginner: Just starting, learning the basic rules and strokes.": -0.8,
        "Improver: Can sustain short rallies but lacks consistency and tactical knowledge.": -0.4,
        "Intermediate: Can play consistently, understands basic tactics, and uses a variety of shots.": 0.0,
        "Advanced: Has a strong command of all major shots and a deep understanding of strategy.": 0.6,
        "Expert/Competitive: Plays at a high level in competitive tournaments.": 1.0,
      },
      context_text: "Overall self-assessment",
      help_text: "Based on your overall padel playing ability and understanding",
      tooltip: "Beginner: Learning basic rules and wall play\nImprover: Can sustain short rallies\nIntermediate: Consistent play with tactical understanding\nAdvanced: Strong command of all shots and strategy\nExpert: High-level competitive play",
    },
  };

  getConditionalQuestions(responses: PadelQuestionnaireResponse): PadelQuestion[] {
    const remainingQuestions: PadelQuestion[] = [];
    const questionKeys = [
      'experience',
      'sports_background',
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

  calculateInitialRating(responses: PadelQuestionnaireResponse): PadelRatingResult {
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
      const categories = ['experience', 'sports_background', 'frequency', 'competitive_level', 'coaching_background', 'tournament', 'self_rating'];
      
      for (const category of categories) {
        if (responses[category]) {
          const answer = responses[category] as string;
          const questionData = this.questions[category as keyof typeof this.questions] as any;
          const weight = questionData?.answers?.[answer] || 0;
          let categoryAdjustment = 0;

          if (category === 'experience') {
            categoryAdjustment = weight * this.EXPERIENCE_RANGE;
          } else if (category === 'sports_background') {
            categoryAdjustment = weight * this.SPORTS_BACKGROUND_RANGE;
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

      // Process skills - giving higher weight to padel-specific skills
      if (responses.skills && typeof responses.skills === 'object') {
        const skillWeights: number[] = [];
        const skillResponses = responses.skills as PadelSkillQuestions;
        const padelSpecificSkills = ["wall_play", "glass_play", "positioning"]; // More important for padel
        
        for (const [skill, answer] of Object.entries(skillResponses)) {
          const skillData = (this.questions.skills as any).sub_questions[skill];
          if (skillData) {
            let weight = skillData.answers[answer] || 0;
            
            // Give extra weight to padel-specific skills
            if (padelSpecificSkills.includes(skill)) {
              weight *= 1.2;
            }
            
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

      // Final rating - padel typically has slightly lower starting ratings than tennis
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

  generateFeedback(ratingData: PadelRatingResult): string {
    const rating = ratingData.rating;
    const confidence = ratingData.confidence;

    // Determine skill level label based on rating - adjusted for padel
    let level: string;
    let description: string;

    if (rating < 1000) {
      level = 'Beginner';
      description = "You're just starting your padel journey. Focus on learning the basic rules, wall play, and underhand serving technique.";
    } else if (rating < 1300) {
      level = 'Improver';
      description = "You can sustain short rallies and understand basic positioning. Work on your wall play and net game consistency.";
    } else if (rating < 1600) {
      level = 'Intermediate';
      description = "You have good consistency and understand padel tactics. Focus on improving your glass play and court positioning with your partner.";
    } else if (rating < 1900) {
      level = 'Upper Intermediate';
      description = "You have strong fundamentals and good tactical awareness. Work on advanced wall shots and improving your smash game.";
    } else if (rating < 2300) {
      level = 'Advanced';
      description = "You show excellent control and strategic understanding. Focus on perfecting your glass play angles and team coordination.";
    } else if (rating < 2800) {
      level = 'Expert';
      description = "You have mastery of all padel techniques including advanced wall play. Work on mental toughness and adapting to different playing styles.";
    } else {
      level = 'Professional';
      description = "You compete at the highest levels of padel. Continue refining your game and maintaining peak performance.";
    }

    let confidenceNote: string;
    if (confidence === 'low') {
      confidenceNote = "Since you're new to padel or have limited experience, your initial rating might change significantly as you play more matches.";
    } else if (confidence === 'medium') {
      confidenceNote = 'Based on your responses, we have a moderate level of confidence in this rating. It may adjust somewhat as you play more matches.';
    } else {
      confidenceNote = 'Based on your detailed responses, we have high confidence in this rating, but it will still be refined as you play matches.';
    }

    return `Based on your questionnaire responses, your initial rating is:

Padel Rating: ${rating}

Skill Level: ${level}

${description}

${confidenceNote}

Since padel is exclusively a doubles game, your rating will be used for all match play. Your rating will automatically adjust as you play matches in the app, becoming more accurate over time.`;
  }
}