import type {
  AnswerEvaluation,
  InterviewMode,
  InterviewSessionDetail,
  InterviewSessionSummary,
  QuestionCategoryKey,
  SpeechMetrics,
  StudentProfile,
  UserAccount,
  VoiceSettings,
} from '../types/visa';

let authTokenInMemory: string | null = null;

export function setAuthToken(token: string | null): void {
  authTokenInMemory = token;
}

export function getAuthToken(): string | null {
  return authTokenInMemory;
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (authTokenInMemory) {
    headers.set('Authorization', `Bearer ${authTokenInMemory}`);
  }

  const res = await fetch(path, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }
  return data as T;
}

export interface AuthResponse {
  token: string;
  user: UserAccount;
  profile: StudentProfile;
  completionPct: number;
}

export interface DashboardResponse {
  user: UserAccount;
  profile: StudentProfile;
  completionPct: number;
  overallReadinessScore: number | null;
  questionsPracticed: number;
  sessions: InterviewSessionSummary[];
  activeSession: InterviewSessionSummary | null;
  strongestCategories: Array<{ label: string; score: number }>;
  weakestCategories: Array<{ label: string; score: number }>;
  weakCategoryKeys: QuestionCategoryKey[];
  scoreHistory: Array<{ label: string; score: number; date: string }>;
}

export const api = {
  register(payload: { name: string; email: string; password: string }) {
    return apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  login(payload: { email: string; password: string }) {
    return apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  demoLogin(quickPractice = false) {
    return apiRequest<AuthResponse>('/api/auth/demo', {
      method: 'POST',
      body: JSON.stringify({ quickPractice }),
    });
  },
  logout() {
    return apiRequest<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
  },
  getMe() {
    return apiRequest<Omit<AuthResponse, 'token'>>('/api/auth/me');
  },
  saveProfile(profile: StudentProfile) {
    return apiRequest<{ profile: StudentProfile; completionPct: number }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify({ profile }),
    });
  },
  updateSettings(payload: {
    preferredLanguage?: string;
    theme?: 'light' | 'dark';
    voiceSettings?: VoiceSettings;
    destinationCountry?: string;
    visaType?: string;
  }) {
    return apiRequest<Omit<AuthResponse, 'token'>>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  deleteHistory() {
    return apiRequest<{ ok: boolean }>('/api/history', { method: 'DELETE' });
  },
  deleteProfile() {
    return apiRequest<{ ok: boolean }>('/api/profile', { method: 'DELETE' });
  },
  getDashboard() {
    return apiRequest<DashboardResponse>('/api/dashboard');
  },
  startInterview(mode: InterviewMode, focusCategories: QuestionCategoryKey[] = []) {
    return apiRequest<{ session: InterviewSessionDetail }>('/api/interview/start', {
      method: 'POST',
      body: JSON.stringify({ mode, focusCategories }),
    });
  },
  getInterview(sessionId: string) {
    return apiRequest<{ session: InterviewSessionDetail }>(`/api/interview/${sessionId}`);
  },
  submitAnswer(
    sessionId: string,
    payload: { answer: string; isRetry?: boolean; speechMetrics?: SpeechMetrics | null }
  ) {
    return apiRequest<{ evaluation: AnswerEvaluation; session: InterviewSessionDetail }>(
      `/api/interview/${sessionId}/answer`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },
  nextQuestion(sessionId: string, followUpQuestion?: string) {
    return apiRequest<{ readyToFinish: boolean; session: InterviewSessionDetail }>(
      `/api/interview/${sessionId}/next`,
      {
        method: 'POST',
        body: JSON.stringify({ followUpQuestion }),
      }
    );
  },
  skipQuestion(sessionId: string) {
    return apiRequest<{ readyToFinish: boolean; session: InterviewSessionDetail }>(
      `/api/interview/${sessionId}/skip`,
      {
        method: 'POST',
      }
    );
  },
  pauseInterview(sessionId: string) {
    return apiRequest<{ session: InterviewSessionDetail }>(`/api/interview/${sessionId}/pause`, {
      method: 'POST',
    });
  },
  resumeInterview(sessionId: string) {
    return apiRequest<{ session: InterviewSessionDetail }>(`/api/interview/${sessionId}/resume`, {
      method: 'POST',
    });
  },
  restartInterview(sessionId: string) {
    return apiRequest<{ session: InterviewSessionDetail }>(`/api/interview/${sessionId}/restart`, {
      method: 'POST',
    });
  },
  completeInterview(sessionId: string) {
    return apiRequest<{ session: InterviewSessionDetail }>(
      `/api/interview/${sessionId}/complete`,
      {
        method: 'POST',
      }
    );
  },
};
