import { useState, type FormEvent } from 'react';
import { ArrowRight, Loader2, MessageSquare, Sparkles, X } from 'lucide-react';
import { api, setAuthToken, type AuthResponse } from '../lib/api';
import { BrandLogo } from './BrandLogo';

interface AuthPanelProps {
  initialMode?: 'register' | 'login';
  onSuccess: (auth: AuthResponse, launchMode: 'default' | 'demo' | 'quick') => void;
  onClose?: () => void;
}

export function AuthPanel({ initialMode = 'register', onSuccess, onClose }: AuthPanelProps) {
  const [mode, setMode] = useState<'register' | 'login'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res =
        mode === 'register'
          ? await api.register({ name: name.trim(), email: email.trim(), password })
          : await api.login({ email: email.trim(), password });
      setAuthToken(res.token);
      onSuccess(res, 'default');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to authenticate.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin(quickPractice: boolean) {
    setError(null);
    setDemoLoading(true);
    try {
      const res = await api.demoLogin(quickPractice);
      setAuthToken(res.token);
      onSuccess(res, quickPractice ? 'quick' : 'demo');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to launch practice session.');
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <BrandLogo />
          <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {mode === 'register' ? 'Create your student account' : 'Welcome back'}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {mode === 'register'
              ? 'Save your academic & financial profile privately and resume practice anytime.'
              : 'Sign in to access your profile, practice sessions, and readiness reports.'}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in dialog"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="mt-6 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setError(null);
          }}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors whitespace-nowrap ${
            mode === 'register'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          Register
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setError(null);
          }}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors whitespace-nowrap ${
            mode === 'login'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          Sign In
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {mode === 'register' && (
          <div>
            <label htmlFor="auth-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Full Name
            </label>
            <input
              id="auth-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Nair"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
        )}

        <div>
          <label htmlFor="auth-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Email Address
          </label>
          <input
            id="auth-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@example.com"
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="auth-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading || demoLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{mode === 'register' ? 'Creating account...' : 'Signing in...'}</span>
            </>
          ) : (
            <>
              <span>{mode === 'register' ? 'Create Account & Continue' : 'Sign In'}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-5 space-y-2.5 border-t border-slate-200 pt-5 dark:border-slate-800">
        <button
          type="button"
          onClick={() => handleDemoLogin(true)}
          disabled={loading || demoLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-60 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-950/60"
        >
          {demoLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MessageSquare className="h-4 w-4" />
          )}
          <span>Skip Form & Start AI Interview Now</span>
        </button>

        <button
          type="button"
          onClick={() => handleDemoLogin(false)}
          disabled={loading || demoLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Try Sample Student Profile</span>
        </button>
        <p className="pt-1 text-center text-xs text-slate-500 dark:text-slate-400">
          Jump straight into AI questions without filling forms, or explore with a sample profile.
        </p>
      </div>
    </div>
  );
}
