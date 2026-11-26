import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'visabuddy.db');
export const db = new DatabaseSync(dbPath);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    preferred_language TEXT NOT NULL DEFAULT 'English',
    theme TEXT NOT NULL DEFAULT 'light',
    voice_settings_json TEXT NOT NULL DEFAULT '{"autoReadQuestions":false,"autoReadImprovedAnswers":false,"speechRate":1}',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS student_profiles (
    user_id TEXT PRIMARY KEY,
    profile_json TEXT NOT NULL,
    completion_pct INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS interview_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    mode TEXT NOT NULL,
    focus_categories_json TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'in_progress',
    current_question_index INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 12,
    current_category TEXT NOT NULL,
    current_question TEXT NOT NULL,
    question_plan_json TEXT NOT NULL DEFAULT '[]',
    overall_score INTEGER,
    report_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS interview_turns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    turn_index INTEGER NOT NULL,
    category TEXT NOT NULL,
    question_text TEXT NOT NULL,
    student_answer TEXT NOT NULL,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    evaluation_json TEXT NOT NULL,
    speech_metrics_json TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE
  );
`);

export interface DbUser {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  salt: string;
  preferred_language: string;
  theme: 'light' | 'dark';
  voice_settings_json: string;
  created_at: string;
}

export function getUserByEmail(email: string): DbUser | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE lower(email) = lower(?)');
  return stmt.get(email) as DbUser | undefined;
}

export function getUserById(id: string): DbUser | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as DbUser | undefined;
}
