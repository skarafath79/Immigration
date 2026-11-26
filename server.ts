import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import {
  createSessionToken,
  hashPassword,
  requireAuth,
  revokeSessionToken,
  verifyPassword,
  type AuthenticatedRequest,
} from './server/auth.ts';
import { db, getUserByEmail, type DbUser } from './server/db.ts';
import {
  evaluateStudentAnswer,
  generateFinalInterviewReport,
  generateInterviewPlan,
  type PlannedQuestion,
} from './server/gemini.ts';
import {
  calculateProfileCompletion,
  createEmptyProfile,
  createSampleStudentProfile,
  type FinalInterviewReport,
  type InterviewMode,
  type InterviewSessionDetail,
  type InterviewSessionSummary,
  type InterviewTurn,
  type QuestionCategoryKey,
  type SpeechMetrics,
  type StudentProfile,
  type UserAccount,
  type VoiceSettings,
} from './src/types/visa.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '2mb' }));

function formatUserAccount(row: DbUser): UserAccount {
  let voiceSettings: VoiceSettings = {
    autoReadQuestions: false,
    autoReadImprovedAnswers: false,
    speechRate: 1,
  };
  try {
    voiceSettings = { ...voiceSettings, ...JSON.parse(row.voice_settings_json) };
  } catch {
    // Keep defaults
  }
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    preferredLanguage: row.preferred_language || 'English',
    theme: row.theme === 'dark' ? 'dark' : 'light',
    voiceSettings,
  };
}

function getStoredProfile(userId: string, email: string, name: string): {
  profile: StudentProfile;
  completionPct: number;
} {
  const row = db
    .prepare('SELECT profile_json, completion_pct FROM student_profiles WHERE user_id = ?')
    .get(userId) as { profile_json: string; completion_pct: number } | undefined;

  if (!row) {
    const empty = createEmptyProfile(email, name);
    return { profile: empty, completionPct: 0 };
  }

  try {
    const parsed = JSON.parse(row.profile_json) as StudentProfile;
    return { profile: parsed, completionPct: row.completion_pct };
  } catch {
    const empty = createEmptyProfile(email, name);
    return { profile: empty, completionPct: 0 };
  }
}

function loadSessionTurns(sessionId: string): InterviewTurn[] {
  const rows = db
    .prepare('SELECT * FROM interview_turns WHERE session_id = ? ORDER BY id ASC')
    .all(sessionId) as Array<{
    id: number;
    session_id: string;
    turn_index: number;
    category: string;
    question_text: string;
    student_answer: string;
    attempt_number: number;
    evaluation_json: string;
    speech_metrics_json: string | null;
    created_at: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    sessionId: r.session_id,
    turnIndex: r.turn_index,
    category: r.category as QuestionCategoryKey,
    questionText: r.question_text,
    studentAnswer: r.student_answer,
    attemptNumber: r.attempt_number,
    evaluation: JSON.parse(r.evaluation_json),
    speechMetrics: r.speech_metrics_json ? JSON.parse(r.speech_metrics_json) : null,
    createdAt: r.created_at,
  }));
}

interface SessionRow {
  id: string;
  user_id: string;
  mode: string;
  focus_categories_json: string;
  status: string;
  current_question_index: number;
  total_questions: number;
  current_category: string;
  current_question: string;
  question_plan_json: string;
  overall_score: number | null;
  report_json: string | null;
  created_at: string;
  updated_at: string;
}

function formatSessionDetail(row: SessionRow): InterviewSessionDetail {
  return {
    id: row.id,
    mode: row.mode as InterviewMode,
    status: row.status as 'in_progress' | 'paused' | 'completed',
    currentQuestionIndex: row.current_question_index,
    totalQuestions: row.total_questions,
    currentCategory: row.current_category as QuestionCategoryKey,
    currentQuestion: row.current_question,
    overallScore: row.overall_score,
    focusCategories: JSON.parse(row.focus_categories_json || '[]'),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    turns: loadSessionTurns(row.id),
    report: row.report_json ? (JSON.parse(row.report_json) as FinalInterviewReport) : null,
  };
}

// --- AUTH ROUTES ---

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body as {
    email?: string;
    password?: string;
    name?: string;
  };

  if (!email || !password || !name) {
    res.status(400).json({ error: 'Name, email, and password are required.' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters.' });
    return;
  }

  const existing = getUserByEmail(normalizedEmail);
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
    return;
  }

  const id = crypto.randomUUID();
  const { hash, salt } = hashPassword(password);
  const now = new Date().toISOString();

  db.prepare(
    'INSERT INTO users (id, email, name, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, normalizedEmail, name.trim(), hash, salt, now);

  const initialProfile = createEmptyProfile(normalizedEmail, name.trim());
  db.prepare(
    'INSERT INTO student_profiles (user_id, profile_json, completion_pct, updated_at) VALUES (?, ?, ?, ?)'
  ).run(id, JSON.stringify(initialProfile), calculateProfileCompletion(initialProfile), now);

  const token = createSessionToken(id);
  const user = getUserByEmail(normalizedEmail)!;

  res.status(201).json({
    token,
    user: formatUserAccount(user),
    profile: initialProfile,
    completionPct: calculateProfileCompletion(initialProfile),
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const user = getUserByEmail(email.trim().toLowerCase());
  if (!user || !verifyPassword(password, user.salt, user.password_hash)) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const token = createSessionToken(user.id);
  const { profile, completionPct } = getStoredProfile(user.id, user.email, user.name);

  res.json({
    token,
    user: formatUserAccount(user),
    profile,
    completionPct,
  });
});

app.post('/api/auth/demo', (req, res) => {
  const { quickPractice = false } = (req.body || {}) as { quickPractice?: boolean };
  const id = crypto.randomUUID();
  const demoEmail = `demo.${id.slice(0, 8)}@visabuddy.local`;
  const demoPassword = crypto.randomBytes(16).toString('hex');
  const { hash, salt } = hashPassword(demoPassword);
  const now = new Date().toISOString();
  const displayName = quickPractice ? 'Student Guest' : 'Aarav Sharma (Demo)';

  db.prepare(
    'INSERT INTO users (id, email, name, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, demoEmail, displayName, hash, salt, now);

  const studentProfile = quickPractice
    ? createEmptyProfile(demoEmail, '')
    : createSampleStudentProfile(demoEmail);
  const completionPct = calculateProfileCompletion(studentProfile);
  db.prepare(
    'INSERT INTO student_profiles (user_id, profile_json, completion_pct, updated_at) VALUES (?, ?, ?, ?)'
  ).run(id, JSON.stringify(studentProfile), completionPct, now);

  const token = createSessionToken(id);
  const user = getUserByEmail(demoEmail)!;

  res.json({
    token,
    user: formatUserAccount(user),
    profile: studentProfile,
    completionPct,
  });
});

app.post('/api/auth/logout', requireAuth, (req: AuthenticatedRequest, res) => {
  if (req.authToken) {
    revokeSessionToken(req.authToken);
  }
  res.json({ ok: true });
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.authUser!;
  const { profile, completionPct } = getStoredProfile(user.id, user.email, user.name);
  res.json({
    user: formatUserAccount(user),
    profile,
    completionPct,
  });
});

// --- PROFILE & SETTINGS ROUTES ---

app.get('/api/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.authUser!;
  const { profile, completionPct } = getStoredProfile(user.id, user.email, user.name);
  res.json({ profile, completionPct });
});

app.put('/api/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.authUser!;
  const { profile } = req.body as { profile?: StudentProfile };
  if (!profile || !profile.personal) {
    res.status(400).json({ error: 'Valid student profile payload is required.' });
    return;
  }

  const completionPct = calculateProfileCompletion(profile);
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO student_profiles (user_id, profile_json, completion_pct, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       profile_json = excluded.profile_json,
       completion_pct = excluded.completion_pct,
       updated_at = excluded.updated_at`
  ).run(user.id, JSON.stringify(profile), completionPct, now);

  if (profile.personal.fullName.trim()) {
    db.prepare('UPDATE users SET name = ?, preferred_language = ? WHERE id = ?').run(
      profile.personal.fullName.trim(),
      profile.personal.preferredPracticeLanguage || 'English',
      user.id
    );
  }

  res.json({ profile, completionPct });
});

app.put('/api/settings', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.authUser!;
  const { preferredLanguage, theme, voiceSettings, destinationCountry, visaType } = req.body as {
    preferredLanguage?: string;
    theme?: 'light' | 'dark';
    voiceSettings?: VoiceSettings;
    destinationCountry?: string;
    visaType?: string;
  };

  const nextLang = preferredLanguage || user.preferred_language;
  const nextTheme = theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : user.theme;
  const nextVoice = voiceSettings
    ? JSON.stringify(voiceSettings)
    : user.voice_settings_json;

  db.prepare(
    'UPDATE users SET preferred_language = ?, theme = ?, voice_settings_json = ? WHERE id = ?'
  ).run(nextLang, nextTheme, nextVoice, user.id);

  if (destinationCountry !== undefined || visaType !== undefined || preferredLanguage !== undefined) {
    const { profile } = getStoredProfile(user.id, user.email, user.name);
    if (destinationCountry !== undefined) profile.studyAbroad.destinationCountry = destinationCountry;
    if (visaType !== undefined) profile.studyAbroad.visaType = visaType;
    if (preferredLanguage !== undefined) profile.personal.preferredPracticeLanguage = preferredLanguage;
    const completionPct = calculateProfileCompletion(profile);
    db.prepare(
      'UPDATE student_profiles SET profile_json = ?, completion_pct = ?, updated_at = ? WHERE user_id = ?'
    ).run(JSON.stringify(profile), completionPct, new Date().toISOString(), user.id);
  }

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id) as unknown as DbUser;
  const { profile, completionPct } = getStoredProfile(user.id, user.email, user.name);
  res.json({ user: formatUserAccount(updated), profile, completionPct });
});

app.delete('/api/history', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.authUser!;
  db.prepare('DELETE FROM interview_sessions WHERE user_id = ?').run(user.id);
  res.json({ ok: true });
});

app.delete('/api/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.authUser!;
  db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
  res.json({ ok: true });
});

// --- DASHBOARD ROUTE ---

app.get('/api/dashboard', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.authUser!;
  const { profile, completionPct } = getStoredProfile(user.id, user.email, user.name);

  const sessions = db
    .prepare(
      `SELECT id, mode, status, current_question_index, total_questions, current_category,
              current_question, overall_score, focus_categories_json, created_at, updated_at, report_json
       FROM interview_sessions WHERE user_id = ? ORDER BY updated_at DESC`
    )
    .all(user.id) as unknown as Array<SessionRow>;

  const sessionSummaries: InterviewSessionSummary[] = sessions.map((s) => ({
    id: s.id,
    mode: s.mode as InterviewMode,
    status: s.status as 'in_progress' | 'paused' | 'completed',
    currentQuestionIndex: s.current_question_index,
    totalQuestions: s.total_questions,
    currentCategory: s.current_category as QuestionCategoryKey,
    currentQuestion: s.current_question,
    overallScore: s.overall_score,
    focusCategories: JSON.parse(s.focus_categories_json || '[]'),
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  }));

  const turnCountRow = db
    .prepare(
      `SELECT COUNT(*) as total FROM interview_turns
       WHERE session_id IN (SELECT id FROM interview_sessions WHERE user_id = ?)`
    )
    .get(user.id) as { total: number };

  const completedWithReports = sessions.filter((s) => s.status === 'completed' && s.report_json);
  const latestScore =
    completedWithReports.length > 0 ? completedWithReports[0].overall_score : null;

  let strongestCategories: Array<{ label: string; score: number }> = [];
  let weakestCategories: Array<{ label: string; score: number }> = [];
  let weakCategoryKeys: QuestionCategoryKey[] = [];

  if (completedWithReports.length > 0 && completedWithReports[0].report_json) {
    try {
      const report = JSON.parse(completedWithReports[0].report_json) as FinalInterviewReport;
      const entries: Array<{ label: string; score: number }> = [
        { label: 'Personal Introduction', score: report.categoryScores.personalIntroduction },
        { label: 'Family Background', score: report.categoryScores.familyBackground },
        { label: 'Education Background', score: report.categoryScores.educationBackground },
        { label: 'Class 10 & 12', score: report.categoryScores.class10And12 },
        { label: 'Graduation Knowledge', score: report.categoryScores.graduationKnowledge },
        { label: 'Course Knowledge', score: report.categoryScores.courseKnowledge },
        { label: 'University Knowledge', score: report.categoryScores.universityKnowledge },
        { label: 'Financial Answers', score: report.categoryScores.financialAnswers },
        { label: 'Career Plans', score: report.categoryScores.careerPlans },
        { label: 'Communication', score: report.categoryScores.communication },
        { label: 'Confidence', score: report.categoryScores.confidence },
        { label: 'Consistency', score: report.categoryScores.consistency },
      ];
      const sorted = [...entries].sort((a, b) => b.score - a.score);
      strongestCategories = sorted.slice(0, 3);
      weakestCategories = sorted.slice(-3).reverse();
      weakCategoryKeys = report.weakCategories || [];
    } catch {
      // Ignore parse error
    }
  }

  const scoreHistory = completedWithReports
    .slice(0, 8)
    .reverse()
    .map((s, idx) => ({
      label: `Session ${idx + 1}`,
      score: s.overall_score || 0,
      date: s.updated_at,
    }));

  res.json({
    user: formatUserAccount(user),
    profile,
    completionPct,
    overallReadinessScore: latestScore,
    questionsPracticed: turnCountRow.total,
    sessions: sessionSummaries,
    activeSession: sessionSummaries.find((s) => s.status !== 'completed') || null,
    strongestCategories,
    weakestCategories,
    weakCategoryKeys,
    scoreHistory,
  });
});

// --- INTERVIEW ROUTES ---

app.post('/api/interview/start', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.authUser!;
    const { mode = 'friendly', focusCategories = [] } = req.body as {
      mode?: InterviewMode;
      focusCategories?: QuestionCategoryKey[];
    };

    const { profile } = getStoredProfile(user.id, user.email, user.name);
    const plan = await generateInterviewPlan(profile, mode, focusCategories);

    const sessionId = crypto.randomUUID();
    const now = new Date().toISOString();
    const first = plan[0];

    db.prepare(
      `INSERT INTO interview_sessions (
        id, user_id, mode, focus_categories_json, status,
        current_question_index, total_questions, current_category,
        current_question, question_plan_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'in_progress', 0, ?, ?, ?, ?, ?, ?)`
    ).run(
      sessionId,
      user.id,
      mode,
      JSON.stringify(focusCategories),
      plan.length,
      first.category,
      first.question,
      JSON.stringify(plan),
      now,
      now
    );

    const row = db
      .prepare('SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?')
      .get(sessionId, user.id) as unknown as SessionRow;

    res.status(201).json({ session: formatSessionDetail(row) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to start interview session.';
    res.status(500).json({ error: message });
  }
});

app.get('/api/interview/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.authUser!;
  const row = db
    .prepare('SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?')
    .get(req.params.id, user.id) as SessionRow | undefined;

  if (!row) {
    res.status(404).json({ error: 'Interview session not found.' });
    return;
  }

  res.json({ session: formatSessionDetail(row) });
});

app.post('/api/interview/:id/answer', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.authUser!;
    const { answer, isRetry = false, speechMetrics = null } = req.body as {
      answer?: string;
      isRetry?: boolean;
      speechMetrics?: SpeechMetrics | null;
    };

    if (!answer || !answer.trim()) {
      res.status(400).json({ error: 'Please write or speak an answer before submitting.' });
      return;
    }

    const row = db
      .prepare('SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?')
      .get(req.params.id, user.id) as SessionRow | undefined;

    if (!row) {
      res.status(404).json({ error: 'Interview session not found.' });
      return;
    }

    const { profile } = getStoredProfile(user.id, user.email, user.name);
    const priorTurns = loadSessionTurns(row.id);

    const existingAttemptsForTurn = priorTurns.filter(
      (t) => t.turnIndex === row.current_question_index
    ).length;
    const attemptNumber = isRetry ? existingAttemptsForTurn + 1 : existingAttemptsForTurn + 1;

    const evaluation = await evaluateStudentAnswer({
      profile,
      mode: row.mode as InterviewMode,
      category: row.current_category as QuestionCategoryKey,
      question: row.current_question,
      studentAnswer: answer.trim(),
      attemptNumber,
      priorTurns,
      speechMetrics,
    });

    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO interview_turns (
        session_id, turn_index, category, question_text, student_answer,
        attempt_number, evaluation_json, speech_metrics_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      row.id,
      row.current_question_index,
      row.current_category,
      row.current_question,
      answer.trim(),
      attemptNumber,
      JSON.stringify(evaluation),
      speechMetrics ? JSON.stringify(speechMetrics) : null,
      now
    );

    db.prepare('UPDATE interview_sessions SET updated_at = ?, status = ? WHERE id = ?').run(
      now,
      'in_progress',
      row.id
    );

    const updatedRow = db
      .prepare('SELECT * FROM interview_sessions WHERE id = ?')
      .get(row.id) as unknown as SessionRow;

    res.json({
      evaluation,
      session: formatSessionDetail(updatedRow),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to evaluate answer.';
    res.status(500).json({ error: message });
  }
});

app.post('/api/interview/:id/next', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.authUser!;
  const { followUpQuestion } = req.body as { followUpQuestion?: string };

  const row = db
    .prepare('SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?')
    .get(req.params.id, user.id) as SessionRow | undefined;

  if (!row) {
    res.status(404).json({ error: 'Interview session not found.' });
    return;
  }

  const plan = JSON.parse(row.question_plan_json || '[]') as PlannedQuestion[];
  const now = new Date().toISOString();

  if (followUpQuestion && followUpQuestion.trim()) {
    const nextIdx = row.current_question_index + 1;
    const newPlan = [...plan];
    newPlan.splice(nextIdx, 0, {
      category: row.current_category as QuestionCategoryKey,
      question: followUpQuestion.trim(),
    });
    db.prepare(
      `UPDATE interview_sessions
       SET current_question_index = ?, total_questions = ?, current_question = ?,
           question_plan_json = ?, updated_at = ?
       WHERE id = ?`
    ).run(nextIdx, newPlan.length, followUpQuestion.trim(), JSON.stringify(newPlan), now, row.id);

    const updated = db.prepare('SELECT * FROM interview_sessions WHERE id = ?').get(row.id) as unknown as SessionRow;
    res.json({ readyToFinish: false, session: formatSessionDetail(updated) });
    return;
  }

  const nextIdx = row.current_question_index + 1;
  if (nextIdx >= plan.length) {
    res.json({ readyToFinish: true, session: formatSessionDetail(row) });
    return;
  }

  const nextItem = plan[nextIdx];
  db.prepare(
    `UPDATE interview_sessions
     SET current_question_index = ?, current_category = ?, current_question = ?, updated_at = ?
     WHERE id = ?`
  ).run(nextIdx, nextItem.category, nextItem.question, now, row.id);

  const updated = db.prepare('SELECT * FROM interview_sessions WHERE id = ?').get(row.id) as unknown as SessionRow;
  res.json({ readyToFinish: false, session: formatSessionDetail(updated) });
});

app.post('/api/interview/:id/skip', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.authUser!;
  const row = db
    .prepare('SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?')
    .get(req.params.id, user.id) as SessionRow | undefined;

  if (!row) {
    res.status(404).json({ error: 'Interview session not found.' });
    return;
  }

  const plan = JSON.parse(row.question_plan_json || '[]') as PlannedQuestion[];
  const nextIdx = row.current_question_index + 1;

  if (nextIdx >= plan.length) {
    res.json({ readyToFinish: true, session: formatSessionDetail(row) });
    return;
  }

  const nextItem = plan[nextIdx];
  db.prepare(
    `UPDATE interview_sessions
     SET current_question_index = ?, current_category = ?, current_question = ?, updated_at = ?
     WHERE id = ?`
  ).run(nextIdx, nextItem.category, nextItem.question, new Date().toISOString(), row.id);

  const updated = db.prepare('SELECT * FROM interview_sessions WHERE id = ?').get(row.id) as unknown as SessionRow;
  res.json({ readyToFinish: false, session: formatSessionDetail(updated) });
});

app.post('/api/interview/:id/pause', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.authUser!;
  db.prepare(
    'UPDATE interview_sessions SET status = ?, updated_at = ? WHERE id = ? AND user_id = ?'
  ).run('paused', new Date().toISOString(), req.params.id, user.id);

  const row = db
    .prepare('SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?')
    .get(req.params.id, user.id) as SessionRow | undefined;
  if (!row) {
    res.status(404).json({ error: 'Session not found.' });
    return;
  }
  res.json({ session: formatSessionDetail(row) });
});

app.post('/api/interview/:id/resume', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.authUser!;
  db.prepare(
    'UPDATE interview_sessions SET status = ?, updated_at = ? WHERE id = ? AND user_id = ?'
  ).run('in_progress', new Date().toISOString(), req.params.id, user.id);

  const row = db
    .prepare('SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?')
    .get(req.params.id, user.id) as SessionRow | undefined;
  if (!row) {
    res.status(404).json({ error: 'Session not found.' });
    return;
  }
  res.json({ session: formatSessionDetail(row) });
});

app.post('/api/interview/:id/restart', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.authUser!;
  const row = db
    .prepare('SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?')
    .get(req.params.id, user.id) as SessionRow | undefined;
  if (!row) {
    res.status(404).json({ error: 'Session not found.' });
    return;
  }

  const plan = JSON.parse(row.question_plan_json || '[]') as PlannedQuestion[];
  const first = plan[0];

  db.prepare('DELETE FROM interview_turns WHERE session_id = ?').run(row.id);
  db.prepare(
    `UPDATE interview_sessions
     SET status = 'in_progress', current_question_index = 0, current_category = ?,
         current_question = ?, overall_score = NULL, report_json = NULL, updated_at = ?
     WHERE id = ?`
  ).run(first.category, first.question, new Date().toISOString(), row.id);

  const updated = db.prepare('SELECT * FROM interview_sessions WHERE id = ?').get(row.id) as unknown as SessionRow;
  res.json({ session: formatSessionDetail(updated) });
});

app.post('/api/interview/:id/complete', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.authUser!;
    const row = db
      .prepare('SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?')
      .get(req.params.id, user.id) as SessionRow | undefined;

    if (!row) {
      res.status(404).json({ error: 'Interview session not found.' });
      return;
    }

    const turns = loadSessionTurns(row.id);
    if (turns.length === 0) {
      res.status(400).json({
        error: 'Answer at least one question before generating your readiness report.',
      });
      return;
    }

    const { profile } = getStoredProfile(user.id, user.email, user.name);
    const report = await generateFinalInterviewReport({
      profile,
      mode: row.mode as InterviewMode,
      turns,
    });

    const now = new Date().toISOString();
    db.prepare(
      `UPDATE interview_sessions
       SET status = 'completed', overall_score = ?, report_json = ?, updated_at = ?
       WHERE id = ?`
    ).run(report.overallReadinessScore, JSON.stringify(report), now, row.id);

    const updated = db.prepare('SELECT * FROM interview_sessions WHERE id = ?').get(row.id) as unknown as SessionRow;
    res.json({ session: formatSessionDetail(updated) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to generate final report.';
    res.status(500).json({ error: message });
  }
});

// --- SERVER BOOTSTRAP ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VisaBuddy AI server running on http://localhost:${PORT}`);
  });
}

startServer();
