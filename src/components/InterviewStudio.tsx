import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  Send,
  SkipForward,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { api } from '../lib/api';
import {
  CATEGORY_LABELS,
  type InterviewMode,
  type InterviewSessionDetail,
  type QuestionCategoryKey,
  type SpeechMetrics,
  type StudentProfile,
  type VoiceSettings,
} from '../types/visa';

interface InterviewStudioProps {
  studentName: string;
  profile: StudentProfile;
  session: InterviewSessionDetail | null;
  voiceSettings: VoiceSettings;
  onSessionUpdate: (session: InterviewSessionDetail | null) => void;
  onReportReady: (session: InterviewSessionDetail) => void;
  onBackToDashboard: () => void;
}

const WELCOME_MESSAGE = `Hey! 👋 Welcome to your VisaBuddy AI interview practice.

Don't worry, my friend. This is just practice. I'm here to help you improve your confidence and prepare for your real visa interview.

I already have your education and study-abroad profile, so I'll ask questions based on your real background.

I'll ask one question at a time. You answer naturally, and after each answer I'll tell you what was good, what needs improvement, and how you can make your answer stronger.

Ready? Let's begin!`;

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'actually', 'basically', 'literally', 'sort of'];

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function getSpeechRecognitionConstructor(): (new () => BrowserSpeechRecognition) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function computeSpeechMetrics(text: string, durationSeconds: number): SpeechMetrics {
  const cleaned = text.trim();
  const words = cleaned ? cleaned.split(/\s+/) : [];
  const lower = cleaned.toLowerCase();
  const found: string[] = [];
  let fillerCount = 0;

  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches && matches.length > 0) {
      fillerCount += matches.length;
      found.push(`${filler} (${matches.length})`);
    }
  }

  const safeDuration = Math.max(1, Math.round(durationSeconds));
  const wpm = Math.round((words.length / safeDuration) * 60);

  return {
    durationSeconds: safeDuration,
    wordCount: words.length,
    wordsPerMinute: wpm,
    fillerWordCount: fillerCount,
    fillerWordsFound: found,
  };
}

export function InterviewStudio({
  studentName,
  profile,
  session,
  voiceSettings,
  onSessionUpdate,
  onReportReady,
  onBackToDashboard,
}: InterviewStudioProps) {
  const [selectedMode, setSelectedMode] = useState<InterviewMode>('friendly');
  const [answerText, setAnswerText] = useState('');
  const [isRetryMode, setIsRetryMode] = useState(false);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Voice practice state
  const [isListening, setIsListening] = useState(false);
  const [voiceStartTime, setVoiceStartTime] = useState<number | null>(null);
  const [recordedSpeechMetrics, setRecordedSpeechMetrics] = useState<SpeechMetrics | null>(null);
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const speechSupported =
    typeof window !== 'undefined' && getSpeechRecognitionConstructor() !== null;
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.turns.length, session?.currentQuestion, submitting]);

  useEffect(() => {
    if (
      session &&
      session.status === 'in_progress' &&
      voiceSettings.autoReadQuestions &&
      ttsSupported
    ) {
      speakText(session.currentQuestion);
    }
    return () => {
      if (ttsSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [session?.currentQuestion, session?.status]);

  function speakText(text: string) {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceSettings.speechRate || 1;
    utterance.onstart = () => setIsSpeakingAudio(true);
    utterance.onend = () => setIsSpeakingAudio(false);
    utterance.onerror = () => setIsSpeakingAudio(false);
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeakingAudio(false);
  }

  function startVoiceInput() {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) return;
    setError(null);

    const rec = new Recognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    const baseText = answerText.trim();
    const startedAt = Date.now();
    setVoiceStartTime(startedAt);

    rec.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + ' ';
      }
      const combined = [baseText, transcript.trim()].filter(Boolean).join(' ');
      setAnswerText(combined);
      const elapsedSec = (Date.now() - startedAt) / 1000;
      setRecordedSpeechMetrics(computeSpeechMetrics(transcript, elapsedSec));
    };

    rec.onerror = (ev) => {
      setIsListening(false);
      if (ev.error !== 'aborted') {
        setError(`Voice input paused (${ev.error}). You can type or retry microphone.`);
      }
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }

  function stopVoiceInput() {
    recognitionRef.current?.stop();
    setIsListening(false);
    if (voiceStartTime && answerText.trim()) {
      const elapsedSec = (Date.now() - voiceStartTime) / 1000;
      setRecordedSpeechMetrics(computeSpeechMetrics(answerText, elapsedSec));
    }
  }

  async function handleStartSession(mode: InterviewMode, focusCategories: QuestionCategoryKey[] = []) {
    setError(null);
    setStarting(true);
    try {
      const res = await api.startInterview(mode, focusCategories);
      setAnswerText('');
      setIsRetryMode(false);
      setRecordedSpeechMetrics(null);
      onSessionUpdate(res.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start interview.');
    } finally {
      setStarting(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!session || !answerText.trim()) return;
    if (isListening) stopVoiceInput();

    setError(null);
    setSubmitting(true);
    try {
      const res = await api.submitAnswer(session.id, {
        answer: answerText.trim(),
        isRetry: isRetryMode,
        speechMetrics: recordedSpeechMetrics,
      });
      setAnswerText('');
      setIsRetryMode(false);
      setRecordedSpeechMetrics(null);
      onSessionUpdate(res.session);

      if (voiceSettings.autoReadImprovedAnswers && res.evaluation.improvedSampleAnswer) {
        speakText(res.evaluation.improvedSampleAnswer);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to evaluate answer.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleNextQuestion(followUpQuestion?: string) {
    if (!session) return;
    setError(null);
    setAdvancing(true);
    try {
      const res = await api.nextQuestion(session.id, followUpQuestion);
      if (res.readyToFinish) {
        await handleFinishReport();
        return;
      }
      setAnswerText('');
      setIsRetryMode(false);
      onSessionUpdate(res.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load next question.');
    } finally {
      setAdvancing(false);
    }
  }

  async function handleSkipQuestion() {
    if (!session) return;
    setError(null);
    setAdvancing(true);
    try {
      const res = await api.skipQuestion(session.id);
      if (res.readyToFinish) {
        await handleFinishReport();
        return;
      }
      setAnswerText('');
      setIsRetryMode(false);
      onSessionUpdate(res.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to skip question.');
    } finally {
      setAdvancing(false);
    }
  }

  async function handleTogglePause() {
    if (!session) return;
    setError(null);
    try {
      const res =
        session.status === 'paused'
          ? await api.resumeInterview(session.id)
          : await api.pauseInterview(session.id);
      onSessionUpdate(res.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update session status.');
    }
  }

  async function handleRestart() {
    if (!session) return;
    setError(null);
    setAdvancing(true);
    try {
      const res = await api.restartInterview(session.id);
      setAnswerText('');
      setIsRetryMode(false);
      onSessionUpdate(res.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to restart interview.');
    } finally {
      setAdvancing(false);
    }
  }

  async function handleFinishReport() {
    if (!session) return;
    setError(null);
    setCompleting(true);
    try {
      const res = await api.completeInterview(session.id);
      onReportReady(res.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate final report.');
    } finally {
      setCompleting(false);
    }
  }

  // Mode selection view when no active session is loaded
  if (!session) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
            Select Interview Mode
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Choose how you want to practice today
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {profile.studyAbroad.universityName || profile.personal.fullName
              ? `Tailored for ${profile.personal.fullName || studentName} · ${profile.studyAbroad.universityName || 'Target University'} · ${profile.studyAbroad.destinationCountry || 'Study Abroad'}`
              : 'Quick Practice Mode · No form needed—AI will ask all visa questions and coach your simple answers.'}
          </p>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
            >
              {error}
            </div>
          )}

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                id: 'friendly' as InterviewMode,
                title: 'Friendly Practice',
                desc: 'Relaxed pace, supportive friend-like guidance, detailed missing points, and unlimited retries.',
              },
              {
                id: 'mock' as InterviewMode,
                title: 'Mock Visa Interview',
                desc: 'Realistic consular interview flow, crisp phrasing, professional tone, and balanced feedback.',
              },
              {
                id: 'difficult' as InterviewMode,
                title: 'Difficult Questions',
                desc: 'Challenging stress-test on academic gaps, backlogs, financial funding, part-time jobs, and future plans.',
              },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMode(m.id)}
                className={`rounded-2xl border p-5 text-left transition-colors ${
                  selectedMode === m.id
                    ? 'border-blue-600 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-950/30'
                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-base font-bold text-slate-900 dark:text-white">
                    {m.title}
                  </span>
                  {selectedMode === m.id && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {m.desc}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-800">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Back to Dashboard
            </button>

            <button
              type="button"
              onClick={() => handleStartSession(selectedMode)}
              disabled={starting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 disabled:opacity-60"
            >
              {starting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Preparing personalized questions...</span>
                </>
              ) : (
                <>
                  <span>Start Interview</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const turnsForCurrentQuestion = session.turns.filter(
    (t) => t.turnIndex === session.currentQuestionIndex
  );
  const latestTurnForCurrent =
    turnsForCurrentQuestion.length > 0
      ? turnsForCurrentQuestion[turnsForCurrentQuestion.length - 1]
      : null;

  const progressPct = Math.min(
    100,
    Math.round(((session.currentQuestionIndex + 1) / Math.max(1, session.totalQuestions)) * 100)
  );

  const modeLabel =
    session.mode === 'friendly'
      ? 'Friendly Practice'
      : session.mode === 'mock'
      ? 'Mock Visa Interview'
      : 'Difficult Questions';

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      {/* Interview Header & Progress Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-blue-600 dark:text-blue-400">{modeLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{CATEGORY_LABELS[session.currentCategory] || session.currentCategory}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                Question {session.currentQuestionIndex + 1} of {session.totalQuestions}
              </span>
            </div>
            <div className="mt-2 h-2 w-full max-w-md overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTogglePause}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {session.status === 'paused' ? (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>Pause</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleRestart}
              disabled={advancing}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restart</span>
            </button>
            <button
              type="button"
              onClick={handleFinishReport}
              disabled={completing || session.turns.length === 0}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              {completing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Square className="h-3.5 w-3.5" />
              )}
              <span>End & Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {/* Scrollable Chat History */}
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        {/* Start Welcome Message */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 font-display text-xs font-bold text-white">
            VB
          </div>
          <div className="max-w-2xl rounded-2xl rounded-tl-sm border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 whitespace-pre-line dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200">
            {WELCOME_MESSAGE}
          </div>
        </div>

        {/* Past & Current Recorded Turns */}
        {session.turns.map((turn) => (
          <div key={turn.id} className="space-y-4">
            {/* AI Question Bubble */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 font-display text-xs font-bold text-white">
                VB
              </div>
              <div className="max-w-2xl rounded-2xl rounded-tl-sm border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {CATEGORY_LABELS[turn.category] || turn.category} · Question{' '}
                  <span className="font-mono tabular-nums">{turn.turnIndex + 1}</span>
                </div>
                <p className="mt-1.5 text-sm font-medium text-slate-900 dark:text-white">
                  {turn.questionText}
                </p>
              </div>
            </div>

            {/* Student Answer Bubble */}
            <div className="flex flex-row-reverse items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 font-display text-xs font-bold text-white dark:bg-slate-200 dark:text-slate-900">
                {(profile.personal.fullName || studentName || 'S').slice(0, 2).toUpperCase()}
              </div>
              <div className="max-w-2xl rounded-2xl rounded-tr-sm bg-blue-600 p-4 text-sm text-white">
                <div className="flex items-center justify-between gap-4 text-xs text-blue-100">
                  <span>
                    {profile.personal.fullName || studentName} · Attempt {turn.attemptNumber}
                  </span>
                  <span className="font-mono tabular-nums">
                    {new Date(turn.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="mt-1.5 leading-relaxed">{turn.studentAnswer}</p>
                {turn.speechMetrics && (
                  <div className="mt-2 border-t border-blue-500/50 pt-2 font-mono text-xs tabular-nums text-blue-100">
                    Voice pace: {turn.speechMetrics.wordsPerMinute} WPM · {turn.speechMetrics.wordCount} words ·{' '}
                    {turn.speechMetrics.fillerWordCount} filler words
                  </div>
                )}
              </div>
            </div>

            {/* Evaluation Feedback Card */}
            <div className="ml-0 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 sm:ml-12">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    Answer Evaluation
                  </span>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                    {turn.evaluation.coachFeedbackMessage}
                  </p>
                </div>
                <div className="font-mono text-lg font-bold tabular-nums text-slate-900 dark:text-white">
                  {turn.evaluation.overallTurnScore} / 10
                </div>
              </div>

              {/* 5 Criteria Scores */}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[
                  { label: 'Relevance', val: turn.evaluation.scores.relevance },
                  { label: 'Clarity', val: turn.evaluation.scores.clarity },
                  { label: 'Confidence', val: turn.evaluation.scores.confidence },
                  { label: 'Personalization', val: turn.evaluation.scores.personalization },
                  { label: 'Completeness', val: turn.evaluation.scores.completeness },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="text-xs text-slate-500 dark:text-slate-400">{metric.label}</div>
                    <div className="mt-1 font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                      {metric.val}/10
                    </div>
                  </div>
                ))}
              </div>

              {turn.evaluation.contradictionDetected && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <span className="font-semibold">Profile consistency check: </span>
                    {turn.evaluation.contradictionDetected}
                  </div>
                </div>
              )}

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    What you did well
                  </h4>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                    {turn.evaluation.whatYouDidWell}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    Weaknesses & Missing Points
                  </h4>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-slate-600 dark:text-slate-400">
                    {[...turn.evaluation.weaknesses, ...turn.evaluation.missingPoints].map(
                      (pt, idx) => (
                        <li key={idx}>{pt}</li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              {turn.evaluation.improvedSampleAnswer && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                      Improved Sample Answer (Grounded in Your Profile)
                    </h4>
                    {ttsSupported && (
                      <button
                        type="button"
                        onClick={() => speakText(turn.evaluation.improvedSampleAnswer)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>Listen</span>
                      </button>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    “{turn.evaluation.improvedSampleAnswer}”
                  </p>
                </div>
              )}

              <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                <strong className="text-slate-900 dark:text-white">Confidence tip: </strong>
                {turn.evaluation.confidenceTip}
              </div>
            </div>
          </div>
        ))}

        {/* Current Pending Question if not yet answered (or if user clicked Retry) */}
        {(!latestTurnForCurrent || isRetryMode) && (
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 font-display text-xs font-bold text-white">
              VB
            </div>
            <div className="max-w-2xl rounded-2xl rounded-tl-sm border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
              <div className="flex items-center justify-between gap-4 text-xs text-blue-700 dark:text-blue-300">
                <span>
                  {CATEGORY_LABELS[session.currentCategory] || session.currentCategory} · Question{' '}
                  <span className="font-mono tabular-nums">{session.currentQuestionIndex + 1}</span>
                  {isRetryMode ? ' (Retry Attempt)' : ''}
                </span>
                {ttsSupported && (
                  <button
                    type="button"
                    onClick={() =>
                      isSpeakingAudio ? stopSpeaking() : speakText(session.currentQuestion)
                    }
                    className="inline-flex items-center gap-1 font-medium hover:underline"
                  >
                    {isSpeakingAudio ? (
                      <>
                        <VolumeX className="h-3.5 w-3.5" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>Read Aloud</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-base font-semibold text-slate-900 dark:text-white">
                {session.currentQuestion}
              </p>
            </div>
          </div>
        )}

        {/* AI Typing / Evaluating Indicator */}
        {submitting && (
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 font-display text-xs font-bold text-white">
              VB
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span>Reviewing your answer against your profile...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Action Controls: Either Retry/Next OR Answer Composer */}
      {session.status === 'paused' ? (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Interview is paused. Your progress is saved.
          </p>
          <button
            type="button"
            onClick={handleTogglePause}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            <Play className="h-4 w-4" />
            <span>Resume Interview</span>
          </button>
        </div>
      ) : latestTurnForCurrent && !isRetryMode ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => {
                setIsRetryMode(true);
                setAnswerText('');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Retry Answer</span>
            </button>
            {latestTurnForCurrent.evaluation.followUpQuestion && (
              <button
                type="button"
                disabled={advancing}
                onClick={() =>
                  handleNextQuestion(latestTurnForCurrent.evaluation.followUpQuestion || undefined)
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
              >
                <span>Practice Follow-Up Question</span>
              </button>
            )}
          </div>

          <button
            type="button"
            disabled={advancing || completing}
            onClick={() => handleNextQuestion()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-60"
          >
            {advancing || completing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>
                  {session.currentQuestionIndex + 1 >= session.totalQuestions
                    ? 'Generate Final Report'
                    : 'Next Question'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <label htmlFor="interview-answer" className="sr-only">
            Your interview answer
          </label>
          <textarea
            id="interview-answer"
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmitAnswer();
              }
            }}
            rows={3}
            placeholder="Type your answer in your own words, or use Voice Practice to speak..."
            className="w-full resize-y rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />

          {recordedSpeechMetrics && (
            <div className="mt-2 font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
              Voice transcript captured: {recordedSpeechMetrics.wordCount} words ·{' '}
              {recordedSpeechMetrics.wordsPerMinute} WPM · {recordedSpeechMetrics.fillerWordCount}{' '}
              filler words
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {speechSupported && (
                <button
                  type="button"
                  onClick={isListening ? stopVoiceInput : startVoiceInput}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors ${
                    isListening
                      ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
                      : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-3.5 w-3.5" />
                      <span>Stop Voice</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5" />
                      <span>Speak Answer</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={handleSkipQuestion}
                disabled={advancing || submitting}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <SkipForward className="h-3.5 w-3.5" />
                <span>Skip Question</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={submitting || !answerText.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>Submit Answer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
