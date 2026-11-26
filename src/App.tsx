import { useEffect, useState } from 'react';
import {
  ClipboardList,
  FileBarChart2,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Moon,
  Settings,
  Sun,
} from 'lucide-react';
import { AuthPanel } from './components/AuthModal';
import { BrandLogo } from './components/BrandLogo';
import { DashboardView } from './components/DashboardView';
import { FinalReportView } from './components/FinalReportView';
import { InterviewStudio } from './components/InterviewStudio';
import { LandingPage } from './components/LandingPage';
import { ProfileWizard } from './components/ProfileWizard';
import { SettingsView } from './components/SettingsView';
import { api, setAuthToken, type AuthResponse, type DashboardResponse } from './lib/api';
import {
  calculateProfileCompletion,
  type InterviewMode,
  type InterviewSessionDetail,
  type QuestionCategoryKey,
  type StudentProfile,
  type UserAccount,
} from './types/visa';

type AppView = 'landing' | 'dashboard' | 'profile' | 'interview' | 'report' | 'settings';

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const [authModalMode, setAuthModalMode] = useState<'register' | 'login' | null>(null);

  const [user, setUser] = useState<UserAccount | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const [activeSession, setActiveSession] = useState<InterviewSessionDetail | null>(null);
  const [reportSession, setReportSession] = useState<InterviewSessionDetail | null>(null);
  const [startingMode, setStartingMode] = useState<InterviewMode | null>(null);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  async function refreshDashboard() {
    setDashboardLoading(true);
    try {
      const data = await api.getDashboard();
      setDashboard(data);
      setProfile(data.profile);
      setUser(data.user);
    } catch (err) {
      setWorkspaceError(err instanceof Error ? err.message : 'Failed to load dashboard.');
    } finally {
      setDashboardLoading(false);
    }
  }

  function handleAuthSuccess(auth: AuthResponse, launchMode: 'default' | 'demo' | 'quick') {
    setUser(auth.user);
    setProfile(auth.profile);
    setTheme(auth.user.theme || 'light');
    setAuthModalMode(null);
    setWorkspaceError(null);

    if (launchMode === 'quick') {
      setActiveSession(null);
      setView('interview');
      refreshDashboard();
      return;
    }

    setView('dashboard');
    refreshDashboard();
  }

  async function handleQuickPractice() {
    setWorkspaceError(null);
    if (!user) {
      try {
        const res = await api.demoLogin(true);
        setAuthToken(res.token);
        setUser(res.user);
        setProfile(res.profile);
        setTheme(res.user.theme || 'light');
      } catch (err) {
        setWorkspaceError(err instanceof Error ? err.message : 'Unable to start quick practice.');
        setAuthModalMode('register');
        return;
      }
    }
    setActiveSession(null);
    setView('interview');
    refreshDashboard();
  }

  async function handleToggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (user) {
      try {
        const res = await api.updateSettings({ theme: next });
        setUser(res.user);
      } catch {
        // Keep visual toggle responsive even if offline
      }
    }
  }

  async function handleSaveProfile(updated: StudentProfile) {
    const res = await api.saveProfile(updated);
    setProfile(res.profile);
    await refreshDashboard();
  }

  async function handleStartInterview(
    mode: InterviewMode,
    focusCategories: QuestionCategoryKey[] = []
  ) {
    setWorkspaceError(null);
    setStartingMode(mode);
    try {
      const res = await api.startInterview(mode, focusCategories);
      setActiveSession(res.session);
      setView('interview');
    } catch (err) {
      setWorkspaceError(err instanceof Error ? err.message : 'Unable to start interview.');
    } finally {
      setStartingMode(null);
    }
  }

  async function handleResumeSession(sessionId: string) {
    setWorkspaceError(null);
    try {
      const res = await api.getInterview(sessionId);
      setActiveSession(res.session);
      setView('interview');
    } catch (err) {
      setWorkspaceError(err instanceof Error ? err.message : 'Unable to resume session.');
    }
  }

  async function handleViewReport(sessionId: string) {
    setWorkspaceError(null);
    try {
      const res = await api.getInterview(sessionId);
      setReportSession(res.session);
      setView('report');
    } catch (err) {
      setWorkspaceError(err instanceof Error ? err.message : 'Unable to load report.');
    }
  }

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      // Ignore error during logout
    }
    setAuthToken(null);
    setUser(null);
    setProfile(null);
    setDashboard(null);
    setActiveSession(null);
    setReportSession(null);
    setView('landing');
  }

  if (view === 'landing' || !user || !profile) {
    return (
      <>
        <LandingPage
          isAuthenticated={Boolean(user)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onStartPractice={() => {
            if (user) {
              setView('dashboard');
              refreshDashboard();
            } else {
              setAuthModalMode('register');
            }
          }}
          onQuickPractice={handleQuickPractice}
          onSignIn={() => setAuthModalMode('login')}
        />

        {authModalMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <AuthPanel
              initialMode={authModalMode}
              onSuccess={handleAuthSuccess}
              onClose={() => setAuthModalMode(null)}
            />
          </div>
        )}
      </>
    );
  }

  const completionPct = calculateProfileCompletion(profile);

  const navItems: Array<{ id: AppView; label: string; icon: typeof LayoutDashboard }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Student Profile', icon: ClipboardList },
    { id: 'interview', label: 'AI Interview', icon: MessageSquare },
    ...(reportSession
      ? [{ id: 'report' as AppView, label: 'Readiness Report', icon: FileBarChart2 }]
      : []),
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 lg:flex">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:flex">
        <div>
          <button
            type="button"
            onClick={() => setView('landing')}
            className="text-left"
            title="View Landing Page"
          >
            <BrandLogo />
          </button>

          <nav className="mt-8 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setWorkspaceError(null);
                    setView(item.id);
                    if (item.id === 'dashboard') refreshDashboard();
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <div className="px-1">
            <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {profile.personal.fullName || user.name}
            </div>
            <div className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
              Profile {completionPct}% complete
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleTheme}
              aria-label="Toggle color theme"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sign out"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Top Bar (compact <= 15% viewport height) */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 lg:hidden">
          <button type="button" onClick={() => setView('dashboard')}>
            <BrandLogo />
          </button>
          <div className="flex items-center gap-2 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setView(item.id);
                  if (item.id === 'dashboard') refreshDashboard();
                }}
                className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                  view === item.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {workspaceError && (
            <div
              role="alert"
              className="mx-auto mb-5 max-w-6xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
            >
              {workspaceError}
            </div>
          )}

          {view === 'dashboard' && (
            <DashboardView
              dashboard={dashboard}
              loading={dashboardLoading}
              startingMode={startingMode}
              onStartInterview={handleStartInterview}
              onResumeSession={handleResumeSession}
              onViewReport={handleViewReport}
              onEditProfile={() => setView('profile')}
            />
          )}

          {view === 'profile' && (
            <ProfileWizard
              profile={profile}
              onSaveProfile={handleSaveProfile}
              onStartInterview={async (updated) => {
                await handleSaveProfile(updated);
                setActiveSession(null);
                setView('interview');
              }}
            />
          )}

          {view === 'interview' && (
            <InterviewStudio
              studentName={user.name}
              profile={profile}
              session={activeSession}
              voiceSettings={user.voiceSettings}
              onSessionUpdate={(updated) => setActiveSession(updated)}
              onReportReady={(completedSession) => {
                setActiveSession(null);
                setReportSession(completedSession);
                setView('report');
                refreshDashboard();
              }}
              onBackToDashboard={() => {
                setView('dashboard');
                refreshDashboard();
              }}
            />
          )}

          {view === 'report' && reportSession && (
            <FinalReportView
              session={reportSession}
              studentName={profile.personal.fullName || user.name}
              onPracticeWeakQuestions={(weakCats) => {
                handleStartInterview('difficult', weakCats);
              }}
              onRestartInterview={() => {
                handleStartInterview(reportSession.mode, reportSession.focusCategories);
              }}
              onGoToDashboard={() => {
                setView('dashboard');
                refreshDashboard();
              }}
            />
          )}

          {view === 'settings' && (
            <SettingsView
              user={user}
              profile={profile}
              onUpdated={(updatedUser, updatedProfile) => {
                setUser(updatedUser);
                setProfile(updatedProfile);
                setTheme(updatedUser.theme);
                refreshDashboard();
              }}
              onEditProfile={() => setView('profile')}
              onHistoryDeleted={() => {
                setActiveSession(null);
                setReportSession(null);
                refreshDashboard();
              }}
              onAccountDeleted={() => {
                setAuthToken(null);
                setUser(null);
                setProfile(null);
                setDashboard(null);
                setActiveSession(null);
                setReportSession(null);
                setView('landing');
              }}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>
    </div>
  );
}
