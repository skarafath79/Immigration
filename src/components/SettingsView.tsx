import { useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  LogOut,
  Moon,
  Save,
  Sun,
  Trash2,
  UserCog,
} from 'lucide-react';
import { api } from '../lib/api';
import type { StudentProfile, UserAccount, VoiceSettings } from '../types/visa';

interface SettingsViewProps {
  user: UserAccount;
  profile: StudentProfile;
  onUpdated: (user: UserAccount, profile: StudentProfile) => void;
  onEditProfile: () => void;
  onHistoryDeleted: () => void;
  onAccountDeleted: () => void;
  onLogout: () => void;
}

export function SettingsView({
  user,
  profile,
  onUpdated,
  onEditProfile,
  onHistoryDeleted,
  onAccountDeleted,
  onLogout,
}: SettingsViewProps) {
  const [preferredLanguage, setPreferredLanguage] = useState(user.preferredLanguage);
  const [destinationCountry, setDestinationCountry] = useState(
    profile.studyAbroad.destinationCountry
  );
  const [visaType, setVisaType] = useState(profile.studyAbroad.visaType);
  const [theme, setTheme] = useState<'light' | 'dark'>(user.theme);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(user.voiceSettings);

  const [saving, setSaving] = useState(false);
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSaveSettings() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const res = await api.updateSettings({
        preferredLanguage,
        destinationCountry,
        visaType,
        theme,
        voiceSettings,
      });
      onUpdated(res.user, res.profile);
      setNotice('Settings saved.');
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save settings.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteHistory() {
    setBusyAction('history');
    setError(null);
    try {
      await api.deleteHistory();
      setConfirmClearHistory(false);
      onHistoryDeleted();
      setNotice('All interview history deleted.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete interview history.');
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDeleteAccount() {
    setBusyAction('account');
    setError(null);
    try {
      await api.deleteProfile();
      onAccountDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete profile.');
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Settings & Privacy
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Signed in as {user.email}
            </p>
          </div>

          <button
            type="button"
            onClick={onEditProfile}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <UserCog className="h-4 w-4" />
            <span>Edit Full Profile</span>
          </button>
        </div>

        {notice && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Preferred Practice Language
            </label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="English">English</option>
              <option value="English (Simple & Clear)">English (Simple & Clear)</option>
              <option value="Hindi + English Coaching">Hindi + English Coaching</option>
              <option value="Spanish + English Coaching">Spanish + English Coaching</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Appearance (Light / Dark Mode)
            </label>
            <div className="mt-1.5 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium ${
                  theme === 'light'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="h-4 w-4" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium ${
                  theme === 'dark'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="h-4 w-4" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Destination Country
            </label>
            <input
              type="text"
              value={destinationCountry}
              onChange={(e) => setDestinationCountry(e.target.value)}
              placeholder="e.g. United States, UK, Canada"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Visa Type
            </label>
            <input
              type="text"
              value={visaType}
              onChange={(e) => setVisaType(e.target.value)}
              placeholder="e.g. F-1 Student Visa"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        {/* Voice Practice Settings */}
        <div className="mt-6 space-y-3 border-t border-slate-200 pt-6 dark:border-slate-800">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Voice Practice Settings
          </h2>

          <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={voiceSettings.autoReadQuestions}
              onChange={(e) =>
                setVoiceSettings({ ...voiceSettings, autoReadQuestions: e.target.checked })
              }
              className="h-4 w-4 rounded border-slate-300 text-blue-600"
            />
            <span>Automatically read interview questions aloud</span>
          </label>

          <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={voiceSettings.autoReadImprovedAnswers}
              onChange={(e) =>
                setVoiceSettings({ ...voiceSettings, autoReadImprovedAnswers: e.target.checked })
              }
              className="h-4 w-4 rounded border-slate-300 text-blue-600"
            />
            <span>Automatically read improved sample answers aloud</span>
          </label>

          <div className="max-w-xs pt-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Speech Playback Speed:{' '}
              <span className="font-mono tabular-nums">{voiceSettings.speechRate}x</span>
            </label>
            <input
              type="range"
              min="0.75"
              max="1.25"
              step="0.05"
              value={voiceSettings.speechRate}
              onChange={(e) =>
                setVoiceSettings({ ...voiceSettings, speechRate: Number(e.target.value) })
              }
              className="mt-1.5 w-full"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-800">
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Data Privacy & Deletion */}
      <div className="rounded-2xl border border-red-200 bg-white p-6 dark:border-red-900/50 dark:bg-slate-900 sm:p-8">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          Privacy & Data Management
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Your student profile and practice sessions are private to your account. You can remove
          your interview history or permanently delete your profile at any time.
        </p>

        <div className="mt-5 flex flex-wrap gap-4">
          {!confirmClearHistory ? (
            <button
              type="button"
              onClick={() => setConfirmClearHistory(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
              <span>Delete Interview History</span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 dark:border-red-900 dark:bg-red-950/40">
              <span className="text-xs font-medium text-red-800 dark:text-red-200">
                Delete all interview sessions?
              </span>
              <button
                type="button"
                onClick={handleDeleteHistory}
                disabled={busyAction === 'history'}
                className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
              >
                {busyAction === 'history' ? 'Deleting...' : 'Confirm'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmClearHistory(false)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Cancel
              </button>
            </div>
          )}

          {!confirmDeleteAccount ? (
            <button
              type="button"
              onClick={() => setConfirmDeleteAccount(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Profile & Account</span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2 dark:border-red-900 dark:bg-red-950/40">
              <span className="text-xs font-medium text-red-800 dark:text-red-200">
                Permanently delete your account & profile?
              </span>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={busyAction === 'account'}
                className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
              >
                {busyAction === 'account' ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteAccount(false)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
