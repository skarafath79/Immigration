import {
  ArrowRight,
  BookOpen,
  FileBarChart2,
  Loader2,
  Play,
  Target,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import type { DashboardResponse } from '../lib/api';
import {
  CATEGORY_LABELS,
  type InterviewMode,
  type QuestionCategoryKey,
} from '../types/visa';

interface DashboardViewProps {
  dashboard: DashboardResponse | null;
  loading: boolean;
  startingMode: InterviewMode | null;
  onStartInterview: (mode: InterviewMode, focusCategories?: QuestionCategoryKey[]) => void;
  onResumeSession: (sessionId: string) => void;
  onViewReport: (sessionId: string) => void;
  onEditProfile: () => void;
}

export function DashboardView({
  dashboard,
  loading,
  startingMode,
  onStartInterview,
  onResumeSession,
  onViewReport,
  onEditProfile,
}: DashboardViewProps) {
  if (loading || !dashboard) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      </div>
    );
  }

  const {
    user,
    profile,
    completionPct,
    overallReadinessScore,
    questionsPracticed,
    sessions,
    activeSession,
    strongestCategories,
    weakestCategories,
    weakCategoryKeys,
    scoreHistory,
  } = dashboard;

  const studentName = profile.personal.fullName || user.name;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Student Preparation Dashboard
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Welcome back, {studentName}
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
              {profile.studyAbroad.universityName
                ? `Preparing for ${profile.studyAbroad.courseName || 'your degree'} at ${profile.studyAbroad.universityName} (${profile.studyAbroad.destinationCountry || 'Abroad'})`
                : 'Complete your student profile to unlock personalized visa interview questions.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {activeSession && (
              <button
                type="button"
                onClick={() => onResumeSession(activeSession.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
              >
                <Play className="h-4 w-4" />
                <span>
                  Continue Interview ({activeSession.currentQuestionIndex + 1}/
                  {activeSession.totalQuestions})
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onStartInterview('friendly')}
              disabled={startingMode !== null}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-60"
            >
              {startingMode === 'friendly' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              <span>Start Mock Interview</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Profile Completion</span>
            <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
            {completionPct}%
          </div>
          <button
            type="button"
            onClick={onEditProfile}
            className="mt-2 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            {completionPct < 100 ? 'Complete profile →' : 'Edit profile →'}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Overall Readiness Score</span>
            <FileBarChart2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
            {overallReadinessScore !== null ? `${overallReadinessScore}/100` : '—'}
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {overallReadinessScore !== null
              ? 'From your latest completed session'
              : 'Complete a session to generate score'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Questions Practiced</span>
            <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
            {questionsPracticed}
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Across {sessions.length} total session{sessions.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Recommended Practice</span>
            <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
            {weakCategoryKeys.length > 0
              ? weakCategoryKeys.map((k) => CATEGORY_LABELS[k] || k).slice(0, 2).join(' · ')
              : 'Friendly Practice Run'}
          </div>
          <button
            type="button"
            disabled={startingMode !== null}
            onClick={() =>
              weakCategoryKeys.length > 0
                ? onStartInterview('difficult', weakCategoryKeys)
                : onStartInterview('friendly')
            }
            className="mt-2 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            {weakCategoryKeys.length > 0 ? 'Practice weak categories →' : 'Start session →'}
          </button>
        </div>
      </div>

      {/* Mode Launcher + Progress Over Time Chart */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Practice Modes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Start a Practice Session
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Every mode uses your saved profile and evaluates one answer at a time.
          </p>

          <div className="mt-4 space-y-3">
            {[
              {
                mode: 'friendly' as InterviewMode,
                title: 'Friendly Practice',
                desc: 'Warm coaching, detailed hints, unlimited retries.',
              },
              {
                mode: 'mock' as InterviewMode,
                title: 'Mock Visa Interview',
                desc: 'Realistic consular interview tone and flow.',
              },
              {
                mode: 'difficult' as InterviewMode,
                title: 'Difficult Questions',
                desc: 'Focuses on finances, part-time jobs, gaps, and ties.',
              },
            ].map((item) => (
              <button
                key={item.mode}
                type="button"
                disabled={startingMode !== null}
                onClick={() => onStartInterview(item.mode)}
                className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 text-left transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:hover:bg-slate-800/50"
              >
                <div>
                  <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {item.desc}
                  </div>
                </div>
                {startingMode === item.mode ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-600" />
                ) : (
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Chart & Strongest / Weakest Categories */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Readiness Progress Over Time
            </h2>
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>

          {scoreHistory.length > 0 ? (
            <div className="mt-4">
              <div className="flex h-40 items-end gap-3 border-b border-slate-200 pb-2 dark:border-slate-800">
                {scoreHistory.map((pt, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="font-mono text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                      {pt.score}
                    </span>
                    <div className="flex h-28 w-full max-w-[44px] items-end rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                      <div
                        className="w-full rounded-md bg-gradient-to-t from-blue-600 to-violet-600 transition-all"
                        style={{ height: `${Math.max(8, pt.score)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{pt.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
              Complete your first mock interview and generate a readiness report to track your score
              trend here.
            </div>
          )}

          {(strongestCategories.length > 0 || weakestCategories.length > 0) && (
            <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 dark:border-slate-800 sm:grid-cols-2">
              <div>
                <h3 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Strongest Categories
                </h3>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {strongestCategories.map((c) => (
                    <li key={c.label} className="flex justify-between">
                      <span className="text-slate-700 dark:text-slate-300">{c.label}</span>
                      <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                        {c.score}/100
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  Weakest Categories
                </h3>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {weakestCategories.map((c) => (
                    <li key={c.label} className="flex justify-between">
                      <span className="text-slate-700 dark:text-slate-300">{c.label}</span>
                      <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                        {c.score}/100
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interview History Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          Recent Practice Sessions & Interview History
        </h2>

        {sessions.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            You have not started any practice sessions yet. Choose a mode above to begin!
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="py-2.5 pr-4 font-medium">Mode</th>
                  <th className="py-2.5 pr-4 font-medium">Progress</th>
                  <th className="py-2.5 pr-4 font-medium">Status</th>
                  <th className="py-2.5 pr-4 font-medium">Readiness Score</th>
                  <th className="py-2.5 pr-4 font-medium">Updated</th>
                  <th className="py-2.5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                    <td className="py-3 pr-4 font-medium capitalize text-slate-900 dark:text-white">
                      {s.mode === 'friendly'
                        ? 'Friendly Practice'
                        : s.mode === 'mock'
                        ? 'Mock Interview'
                        : 'Difficult Questions'}
                    </td>
                    <td className="py-3 pr-4 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                      {Math.min(s.currentQuestionIndex + 1, s.totalQuestions)} / {s.totalQuestions}
                    </td>
                    <td className="py-3 pr-4 capitalize text-slate-600 dark:text-slate-300">
                      {s.status.replace('_', ' ')}
                    </td>
                    <td className="py-3 pr-4 font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                      {s.overallScore !== null ? `${s.overallScore}/100` : '—'}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                      {new Date(s.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      {s.status === 'completed' ? (
                        <button
                          type="button"
                          onClick={() => onViewReport(s.id)}
                          className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                        >
                          View Report
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onResumeSession(s.id)}
                          className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                        >
                          Resume
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
