import { useState } from 'react';
import {
  ArrowLeft,
  CheckSquare,
  Download,
  RefreshCw,
  ShieldCheck,
  Square,
  Target,
} from 'lucide-react';
import {
  CATEGORY_LABELS,
  type InterviewSessionDetail,
  type QuestionCategoryKey,
} from '../types/visa';

interface FinalReportViewProps {
  session: InterviewSessionDetail;
  studentName: string;
  onPracticeWeakQuestions: (weakCategories: QuestionCategoryKey[]) => void;
  onRestartInterview: () => void;
  onGoToDashboard: () => void;
}

export function FinalReportView({
  session,
  studentName,
  onPracticeWeakQuestions,
  onRestartInterview,
  onGoToDashboard,
}: FinalReportViewProps) {
  const report = session.report;
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  if (!report) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          No report is generated for this session yet.
        </p>
        <button
          type="button"
          onClick={onGoToDashboard}
          className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const categoryRows = [
    { label: 'Personal Introduction', score: report.categoryScores.personalIntroduction },
    { label: 'Family Background', score: report.categoryScores.familyBackground },
    { label: 'Education Background', score: report.categoryScores.educationBackground },
    { label: 'Class 10 & 12 Knowledge', score: report.categoryScores.class10And12 },
    { label: 'Graduation Knowledge', score: report.categoryScores.graduationKnowledge },
    { label: 'Course Knowledge', score: report.categoryScores.courseKnowledge },
    { label: 'University Knowledge', score: report.categoryScores.universityKnowledge },
    { label: 'Financial Answers', score: report.categoryScores.financialAnswers },
    { label: 'Career Plans', score: report.categoryScores.careerPlans },
    { label: 'Communication', score: report.categoryScores.communication },
    { label: 'Confidence', score: report.categoryScores.confidence },
    { label: 'Consistency', score: report.categoryScores.consistency },
  ];

  function handleDownloadReport() {
    if (!report) return;
    const lines = [
      `VISABUDDY AI — INTERVIEW READINESS REPORT`,
      `Student: ${studentName}`,
      `Date: ${new Date(session.updatedAt).toLocaleDateString()}`,
      `Mode: ${session.mode}`,
      `Overall Readiness Score: ${report.overallReadinessScore}/100`,
      ``,
      `SUMMARY`,
      report.readinessSummary,
      ``,
      `CATEGORY SCORES`,
      ...categoryRows.map((c) => `- ${c.label}: ${c.score}/100`),
      ``,
      `YOUR STRONGEST ANSWERS`,
      ...report.strongestAnswers.map(
        (s) => `- Q: ${s.question}\n  Answer excerpt: ${s.excerpt}\n  Why it worked: ${s.whyItWorked}`
      ),
      ``,
      `ANSWERS TO IMPROVE`,
      ...report.answersToImprove.map(
        (a) =>
          `- Q: ${a.question}\n  Your answer: ${a.studentAnswer}\n  Issue: ${a.issue}\n  How to strengthen: ${a.howToStrengthen}`
      ),
      ``,
      `PROFILE-BASED WEAKNESSES`,
      ...report.profileBasedWeaknesses.map((w) => `- ${w}`),
      ``,
      `COMMUNICATION FEEDBACK`,
      `- Speaking clearly: ${report.communicationFeedback.speakingClearly}`,
      `- Avoiding long answers: ${report.communicationFeedback.avoidingLongAnswers}`,
      `- Answering directly: ${report.communicationFeedback.answeringDirectly}`,
      `- Avoiding robotic responses: ${report.communicationFeedback.avoidingRoboticResponses}`,
      `- Maintaining confidence: ${report.communicationFeedback.maintainingConfidence}`,
      ``,
      `PERSONALIZED IMPROVEMENT PLAN`,
      ...report.improvementPlan.map(
        (d) => `${d.day} — ${d.focus}\n${d.tasks.map((t) => `  * ${t}`).join('\n')}`
      ),
      ``,
      `FINAL PREPARATION CHECKLIST`,
      ...report.finalChecklist.map((c) => `[ ] ${c}`),
      ``,
      `Disclaimer: VisaBuddy AI is an interview preparation tool and does not guarantee visa approval.`,
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VisaBuddy-Readiness-Report-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Top Score Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Final Interview Readiness Report · {studentName}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Overall Readiness Score:{' '}
              <span className="font-mono tabular-nums text-blue-600 dark:text-blue-400">
                {report.overallReadinessScore}/100
              </span>
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {report.readinessSummary}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {report.weakCategories.length > 0 && (
              <button
                type="button"
                onClick={() => onPracticeWeakQuestions(report.weakCategories)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95"
              >
                <Target className="h-4 w-4" />
                <span>Practice Weak Questions</span>
              </button>
            )}
            <button
              type="button"
              onClick={onRestartInterview}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Restart Interview</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadReport}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Download className="h-4 w-4" />
              <span>Download Report</span>
            </button>
            <button
              type="button"
              onClick={onGoToDashboard}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go to Dashboard</span>
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <span>
            This readiness score reflects communication clarity, consistency, and preparation across
            practice answers. It does not predict or guarantee official visa approval.
          </span>
        </div>
      </div>

      {/* 12 Category Scores */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          Category Breakdown
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryRows.map((cat) => (
            <div
              key={cat.label}
              className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">{cat.label}</span>
                <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                  {cat.score}/100
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full ${
                    cat.score >= 75
                      ? 'bg-emerald-600'
                      : cat.score >= 55
                      ? 'bg-blue-600'
                      : 'bg-amber-600'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, cat.score))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strongest Answers & Answers to Improve */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Your Strongest Answers
          </h2>
          <div className="mt-4 space-y-4">
            {report.strongestAnswers.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {item.question}
                </div>
                <p className="mt-1.5 text-sm italic text-slate-700 dark:text-slate-300">
                  “{item.excerpt}”
                </p>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                  {item.whyItWorked}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Answers to Improve
          </h2>
          <div className="mt-4 space-y-4">
            {report.answersToImprove.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  {item.question}
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Your answer: “{item.studentAnswer}”
                </p>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                  <strong>Issue:</strong> {item.issue}
                </p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                  <strong>How to strengthen:</strong> {item.howToStrengthen}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profile Weaknesses & Questions Struggled With */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Profile-Based Weaknesses
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
            {report.profileBasedWeaknesses.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
          {report.weakCategories.length > 0 && (
            <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Recommended Focus Categories:
              </div>
              <div className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                {report.weakCategories
                  .map((c) => CATEGORY_LABELS[c] || c)
                  .join(' · ')}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Questions You Struggled With
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
            {report.questionsStruggledWith.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Communication Feedback */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          Communication Feedback
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Speaking Clearly', text: report.communicationFeedback.speakingClearly },
            { title: 'Avoiding Overly Long Answers', text: report.communicationFeedback.avoidingLongAnswers },
            { title: 'Answering Directly', text: report.communicationFeedback.answeringDirectly },
            { title: 'Avoiding Memorized Robotic Responses', text: report.communicationFeedback.avoidingRoboticResponses },
            { title: 'Maintaining Confidence', text: report.communicationFeedback.maintainingConfidence },
          ].map((tip) => (
            <div
              key={tip.title}
              className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
            >
              <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                {tip.title}
              </h3>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized Improvement Plan & Final Checklist */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Personalized Improvement Plan
          </h2>
          <div className="mt-4 space-y-4">
            {report.improvementPlan.map((dayPlan, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
              >
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {dayPlan.day} · {dayPlan.focus}
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700 dark:text-slate-300">
                  {dayPlan.tasks.map((task, idx) => (
                    <li key={idx}>{task}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Final Pre-Interview Checklist
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Check off each item as you verify your preparation.
          </p>
          <div className="mt-4 space-y-2.5">
            {report.finalChecklist.map((item, idx) => {
              const checked = Boolean(checkedItems[idx]);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }))
                  }
                  className="flex w-full items-start gap-2.5 rounded-xl border border-slate-200 p-3 text-left text-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                >
                  {checked ? (
                    <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <Square className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  )}
                  <span
                    className={
                      checked
                        ? 'text-slate-400 line-through dark:text-slate-500'
                        : 'text-slate-700 dark:text-slate-200'
                    }
                  >
                    {item}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
