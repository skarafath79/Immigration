import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type {
  AnswerEvaluation,
  FinalInterviewReport,
  InterviewMode,
  InterviewTurn,
  QuestionCategoryKey,
  SpeechMetrics,
  StudentProfile,
} from '../src/types/visa.ts';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured on the server. Add your Gemini API key in Settings > Secrets to run AI interview coaching.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface PlannedQuestion {
  category: QuestionCategoryKey;
  question: string;
}

function isMinimalProfile(profile: StudentProfile): boolean {
  const filledCount = [
    profile.class10.schoolName.trim(),
    profile.class12.schoolName.trim(),
    profile.bachelors.collegeName.trim(),
    profile.studyAbroad.universityName.trim(),
    profile.studyAbroad.courseName.trim(),
    profile.financial.primarySponsor.trim(),
  ].filter(Boolean).length;
  return filledCount <= 1;
}

export function buildEligibleCategories(
  profile: StudentProfile,
  mode: InterviewMode,
  focusCategories?: QuestionCategoryKey[]
): QuestionCategoryKey[] {
  if (focusCategories && focusCategories.length > 0) {
    return focusCategories;
  }

  const minimal = isMinimalProfile(profile);
  const categories: QuestionCategoryKey[] = ['personal_intro', 'parents_family'];

  if (minimal || profile.class10.schoolName.trim()) {
    categories.push('class_10');
  }
  if (minimal || profile.class12.schoolName.trim()) {
    categories.push('class_12');
  }
  if (profile.diplomas.hasDiploma && profile.diplomas.items.length > 0) {
    categories.push('diploma');
  }
  if (minimal || profile.bachelors.hasBachelors) {
    categories.push('bachelors');
  }

  const hasAnyGapOrBacklog =
    profile.gapsAndBacklogs.hasEducationGap ||
    profile.gapsAndBacklogs.hasFailedSubjects ||
    profile.gapsAndBacklogs.hasBacklogs ||
    profile.gapsAndBacklogs.hasCourseChange ||
    profile.gapsAndBacklogs.hasCollegeChange ||
    profile.gapsAndBacklogs.hasDelayedGraduation ||
    Number(profile.bachelors.previousBacklogs || 0) > 0 ||
    Number(profile.bachelors.currentBacklogs || 0) > 0;

  if (minimal || hasAnyGapOrBacklog) {
    categories.push('education_gaps');
  }

  if (profile.workExperience.hasWorkExperience && profile.workExperience.items.length > 0) {
    categories.push('work_experience');
  }

  categories.push('country_university', 'course', 'financial', 'part_time_job', 'future_plans');

  if (mode === 'difficult') {
    return [
      ...(minimal || hasAnyGapOrBacklog ? (['education_gaps'] as QuestionCategoryKey[]) : []),
      'financial',
      'part_time_job',
      'country_university',
      'course',
      'future_plans',
      'difficult_questions',
    ];
  }

  if (mode === 'mock' || minimal) {
    categories.push('difficult_questions');
  }

  return categories;
}

function summarizeProfileForPrompt(profile: StudentProfile): string {
  return JSON.stringify(profile, null, 2);
}

export async function generateInterviewPlan(
  profile: StudentProfile,
  mode: InterviewMode,
  focusCategories?: QuestionCategoryKey[]
): Promise<PlannedQuestion[]> {
  const ai = getGeminiClient();
  const eligibleCategories = buildEligibleCategories(profile, mode, focusCategories);
  const minimal = isMinimalProfile(profile);

  const modeDescription =
    mode === 'friendly'
      ? 'Friendly Practice: Start warm and straightforward, gradually increase depth.'
      : mode === 'mock'
      ? 'Mock Visa Interview: Realistic, crisp consular/immigration officer phrasing.'
      : 'Difficult Questions: Challenging, probing follow-up style questions on finances, part-time jobs, gaps, backlogs, home ties, and course relevance.';

  const profileNote = minimal
    ? 'NOTE: The student skipped filling out the detailed profile form and wants to jump straight into practicing with simple answers. Ask clear, direct, standard student visa interview questions across every category so they can tell you about their background in their own simple words.'
    : 'Personalize questions to reference the student\'s actual university, course, country, sponsor, projects, or work when appropriate — while still keeping questions natural like a real visa officer asks.';

  const prompt = `You are designing a personalized student visa interview question sequence for VisaBuddy AI.

STUDENT PROFILE (use ONLY these real facts when present — never invent degrees, scores, companies, or funding):
${summarizeProfileForPrompt(profile)}

INTERVIEW MODE: ${modeDescription}
ELIGIBLE CATEGORIES IN ORDER: ${eligibleCategories.join(', ')}
PREFERRED PRACTICE LANGUAGE: ${profile.personal.preferredPracticeLanguage || 'English'}

Generate 12 to 15 tailored interview questions (or 6 to 8 if focusCategories is narrow: ${focusCategories?.length || 0} categories specified).
Rules:
1. Cover every eligible category in a natural progression from simple warm-up questions to specific and challenging ones.
2. ${profileNote}
3. Ask clear, concise, one-sentence or two-sentence spoken interview questions in simple English (not multi-part essay prompts).
4. Include realistic Part-Time Job Scenario questions in 'part_time_job' (e.g., managing tuition/living without depending on part-time work).
5. Return JSON matching the schema.`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: 'One of the eligible QuestionCategoryKey values.',
            },
            question: {
              type: Type.STRING,
              description: 'A single realistic spoken visa interview question.',
            },
          },
          required: ['category', 'question'],
        },
      },
    },
  });

  const parsed = JSON.parse((response.text || '[]').trim()) as Array<{
    category: string;
    question: string;
  }>;

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('AI failed to generate an interview question plan. Please try again.');
  }

  return parsed.map((item) => ({
    category: (eligibleCategories.includes(item.category as QuestionCategoryKey)
      ? item.category
      : eligibleCategories[0]) as QuestionCategoryKey,
    question: item.question.trim(),
  }));
}

export async function evaluateStudentAnswer(params: {
  profile: StudentProfile;
  mode: InterviewMode;
  category: QuestionCategoryKey;
  question: string;
  studentAnswer: string;
  attemptNumber: number;
  priorTurns: InterviewTurn[];
  speechMetrics: SpeechMetrics | null;
}): Promise<AnswerEvaluation> {
  const ai = getGeminiClient();
  const {
    profile,
    mode,
    category,
    question,
    studentAnswer,
    attemptNumber,
    priorTurns,
    speechMetrics,
  } = params;

  const recentHistory = priorTurns.slice(-6).map((t) => ({
    category: t.category,
    question: t.questionText,
    answer: t.studentAnswer,
    score: t.evaluation.overallTurnScore,
  }));

  const modeTone =
    mode === 'friendly'
      ? 'Act like a warm, encouraging friend and patient coach. Praise genuine effort first, explain clearly what is missing, and invite them to try again if weak.'
      : mode === 'mock'
      ? 'Keep the feedback objective, crisp, and grounded in how an immigration officer perceives the response, while still being constructive and supportive.'
      : 'Be firm, sharp, and thorough like a tough visa officer followed by an honest coach — expose vague claims, financial gaps, or weak home-country/career logic constructively.';

  const speechContext = speechMetrics
    ? `Voice Delivery Metrics (measured on client): ${speechMetrics.wordCount} words in ${speechMetrics.durationSeconds}s (~${speechMetrics.wordsPerMinute} WPM), ${speechMetrics.fillerWordCount} filler words (${speechMetrics.fillerWordsFound.join(', ') || 'none'}). Note: Only comment on pace, word length, and filler words—do not claim to measure pronunciation or emotion.`
    : 'Answered via text input.';

  const prompt = `You are VisaBuddy AI, a supportive student visa interview coach and realistic mock interviewer.

COACHING TONE FOR THIS MODE (${mode}):
${modeTone}

STUDENT REAL PROFILE (GROUND TRUTH — NEVER invent details missing from this profile):
${summarizeProfileForPrompt(profile)}

RECENT INTERVIEW TURNS:
${JSON.stringify(recentHistory)}

CURRENT QUESTION CATEGORY: ${category}
QUESTION ASKED: "${question}"
STUDENT ANSWER (Attempt #${attemptNumber}): "${studentAnswer}"
DELIVERY CONTEXT: ${speechContext}

Evaluate the student's answer honestly and helpfully.
CRITICAL RULES:
1. HONEST SCORING: Never give 9 or 10 out of 10 for short, generic, vague, or memorized answers. A vague answer like "for better future and good job" should score around 3-5 overall.
2. NO FABRICATION & CONVERSATION MEMORY: In 'improvedSampleAnswer', ONLY use facts actually present in the STUDENT REAL PROFILE or explicitly stated by the student in their current answer or RECENT INTERVIEW TURNS above. If the student skipped filling out the profile form, do NOT tell them to go fill out a form—just use the details they shared in chat (and clean bracketed placeholders like [Your University] or [Your Course] only for specifics they haven't mentioned yet) and explain in simple, friendly English what to include in their spoken answer.
3. PART-TIME JOB POLICY: For part_time_job or financial questions, never advise claiming part-time income will fund tuition or essential living costs unless their profile genuinely shows sufficient independent funding; reinforce explaining their real sponsor/loan/savings plan.
4. CONTRADICTION CHECK: If the student's answer contradicts their saved profile (when filled) or earlier answers in RECENT INTERVIEW TURNS, set 'contradictionDetected' to a polite, clear clarification note and optionally set 'followUpQuestion'. Otherwise set 'contradictionDetected' to null.
5. NO SHAME FOR GAPS/BACKLOGS: If discussing academic gaps or backlogs, guide the student to answer honestly, calmly, and constructively without judgment.
6. SIMPLE, ENCOURAGING LANGUAGE: Keep feedback clear, friendly, and easy to understand in ${profile.personal.preferredPracticeLanguage || 'English'}.
7. Output strict JSON matching the schema.`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scores: {
            type: Type.OBJECT,
            properties: {
              relevance: { type: Type.INTEGER },
              clarity: { type: Type.INTEGER },
              confidence: { type: Type.INTEGER },
              personalization: { type: Type.INTEGER },
              completeness: { type: Type.INTEGER },
            },
            required: ['relevance', 'clarity', 'confidence', 'personalization', 'completeness'],
          },
          overallTurnScore: { type: Type.NUMBER },
          whatYouDidWell: { type: Type.STRING },
          weaknesses: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          missingPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          improvedSampleAnswer: { type: Type.STRING },
          confidenceTip: { type: Type.STRING },
          coachFeedbackMessage: { type: Type.STRING },
          needsRetryRecommended: { type: Type.BOOLEAN },
          contradictionDetected: { type: Type.STRING, nullable: true },
          followUpQuestion: { type: Type.STRING, nullable: true },
        },
        required: [
          'scores',
          'overallTurnScore',
          'whatYouDidWell',
          'weaknesses',
          'missingPoints',
          'improvedSampleAnswer',
          'confidenceTip',
          'coachFeedbackMessage',
          'needsRetryRecommended',
        ],
      },
    },
  });

  const evalData = JSON.parse((response.text || '{}').trim()) as AnswerEvaluation;
  return {
    scores: {
      relevance: clampScore(evalData.scores?.relevance ?? 5),
      clarity: clampScore(evalData.scores?.clarity ?? 5),
      confidence: clampScore(evalData.scores?.confidence ?? 5),
      personalization: clampScore(evalData.scores?.personalization ?? 5),
      completeness: clampScore(evalData.scores?.completeness ?? 5),
    },
    overallTurnScore: Number(
      Math.max(1, Math.min(10, evalData.overallTurnScore ?? 5)).toFixed(1)
    ),
    whatYouDidWell: evalData.whatYouDidWell || 'Good effort answering directly.',
    weaknesses: Array.isArray(evalData.weaknesses) ? evalData.weaknesses : [],
    missingPoints: Array.isArray(evalData.missingPoints) ? evalData.missingPoints : [],
    improvedSampleAnswer: evalData.improvedSampleAnswer || '',
    confidenceTip:
      evalData.confidenceTip || 'Pause for one beat before answering and speak at a steady pace.',
    coachFeedbackMessage:
      evalData.coachFeedbackMessage || 'Good start! Let us refine the specific details together.',
    needsRetryRecommended: Boolean(evalData.needsRetryRecommended),
    contradictionDetected: evalData.contradictionDetected || null,
    followUpQuestion: evalData.followUpQuestion || null,
  };
}

export async function generateFinalInterviewReport(params: {
  profile: StudentProfile;
  mode: InterviewMode;
  turns: InterviewTurn[];
}): Promise<FinalInterviewReport> {
  const ai = getGeminiClient();
  const { profile, mode, turns } = params;

  const compactTurns = turns.map((t) => ({
    turnIndex: t.turnIndex,
    category: t.category,
    question: t.questionText,
    answer: t.studentAnswer,
    attemptNumber: t.attemptNumber,
    scores: t.evaluation.scores,
    overallTurnScore: t.evaluation.overallTurnScore,
    weaknesses: t.evaluation.weaknesses,
    contradiction: t.evaluation.contradictionDetected,
    speechMetrics: t.speechMetrics,
  }));

  const prompt = `You are VisaBuddy AI creating the comprehensive Final Interview Readiness Report after a student's mock visa interview.

STUDENT PROFILE:
${summarizeProfileForPrompt(profile)}

INTERVIEW MODE: ${mode}
RECORDED TURNS & SCORES:
${JSON.stringify(compactTurns, null, 2)}

Generate an honest, deeply personalized readiness report.
Rules:
1. Do NOT guarantee visa approval; frame readiness strictly around communication clarity, factual consistency, and preparation level.
2. Score 'overallReadinessScore' from 0 to 100 honestly based on actual answer scores and profile preparation.
3. Score all 12 'categoryScores' from 0 to 100 honestly (if a category wasn't directly tested, infer carefully from related profile answers or mark realistically).
4. In 'weakCategories', return 2 to 4 QuestionCategoryKey values from: personal_intro, parents_family, class_10, class_12, diploma, bachelors, education_gaps, work_experience, country_university, course, financial, part_time_job, future_plans, difficult_questions.
5. In 'improvementPlan', create a practical 5-day personalized practice plan tailored to this student's weak spots.
6. In 'finalChecklist', create 6 to 8 specific preparation checklist items tailored to their profile (documents to review, numbers to remember, honest explanations to practice—never ask for bank passwords or sensitive raw numbers).
7. Respond in ${profile.personal.preferredPracticeLanguage || 'English'}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallReadinessScore: { type: Type.INTEGER },
          readinessSummary: { type: Type.STRING },
          categoryScores: {
            type: Type.OBJECT,
            properties: {
              personalIntroduction: { type: Type.INTEGER },
              familyBackground: { type: Type.INTEGER },
              educationBackground: { type: Type.INTEGER },
              class10And12: { type: Type.INTEGER },
              graduationKnowledge: { type: Type.INTEGER },
              courseKnowledge: { type: Type.INTEGER },
              universityKnowledge: { type: Type.INTEGER },
              financialAnswers: { type: Type.INTEGER },
              careerPlans: { type: Type.INTEGER },
              communication: { type: Type.INTEGER },
              confidence: { type: Type.INTEGER },
              consistency: { type: Type.INTEGER },
            },
            required: [
              'personalIntroduction',
              'familyBackground',
              'educationBackground',
              'class10And12',
              'graduationKnowledge',
              'courseKnowledge',
              'universityKnowledge',
              'financialAnswers',
              'careerPlans',
              'communication',
              'confidence',
              'consistency',
            ],
          },
          strongestAnswers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                excerpt: { type: Type.STRING },
                whyItWorked: { type: Type.STRING },
              },
              required: ['question', 'excerpt', 'whyItWorked'],
            },
          },
          answersToImprove: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                studentAnswer: { type: Type.STRING },
                issue: { type: Type.STRING },
                howToStrengthen: { type: Type.STRING },
              },
              required: ['question', 'studentAnswer', 'issue', 'howToStrengthen'],
            },
          },
          profileBasedWeaknesses: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          questionsStruggledWith: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          communicationFeedback: {
            type: Type.OBJECT,
            properties: {
              speakingClearly: { type: Type.STRING },
              avoidingLongAnswers: { type: Type.STRING },
              answeringDirectly: { type: Type.STRING },
              avoidingRoboticResponses: { type: Type.STRING },
              maintainingConfidence: { type: Type.STRING },
            },
            required: [
              'speakingClearly',
              'avoidingLongAnswers',
              'answeringDirectly',
              'avoidingRoboticResponses',
              'maintainingConfidence',
            ],
          },
          improvementPlan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                focus: { type: Type.STRING },
                tasks: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['day', 'focus', 'tasks'],
            },
          },
          weakCategories: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          finalChecklist: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          'overallReadinessScore',
          'readinessSummary',
          'categoryScores',
          'strongestAnswers',
          'answersToImprove',
          'profileBasedWeaknesses',
          'questionsStruggledWith',
          'communicationFeedback',
          'improvementPlan',
          'weakCategories',
          'finalChecklist',
        ],
      },
    },
  });

  const report = JSON.parse((response.text || '{}').trim()) as FinalInterviewReport;
  return {
    ...report,
    overallReadinessScore: Math.max(0, Math.min(100, Math.round(report.overallReadinessScore ?? 65))),
  };
}

function clampScore(val: number): number {
  return Math.max(1, Math.min(10, Math.round(val)));
}
