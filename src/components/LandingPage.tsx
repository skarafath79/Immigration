import { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  FileBarChart2,
  Globe2,
  GraduationCap,
  MessageSquare,
  Mic,
  Moon,
  ShieldCheck,
  Sun,
  Wallet,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface LandingPageProps {
  isAuthenticated: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onStartPractice: () => void;
  onQuickPractice: () => void;
  onSignIn: () => void;
}

const FEATURES = [
  {
    icon: MessageSquare,
    title: 'Personalized Interview Questions',
    description:
      'Every question adapts to your real Class 10, Class 12, bachelor’s degree, projects, academic gaps, and study-abroad plan.',
  },
  {
    icon: GraduationCap,
    title: 'Education Background Analysis',
    description:
      'Connects your previous academics, B.Tech projects, internships, and any backlogs into a clear, consistent narrative.',
  },
  {
    icon: Wallet,
    title: 'Financial Question Preparation',
    description:
      'Practice explaining your sponsor’s occupation, savings, education loan, and scholarship figures accurately without sharing sensitive bank logins.',
  },
  {
    icon: Briefcase,
    title: 'Part-Time Job Scenario Practice',
    description:
      'Prepare realistic answers for tough officer questions about managing tuition and living expenses without relying on part-time work.',
  },
  {
    icon: Mic,
    title: 'Voice & Real-Time Answer Feedback',
    description:
      'Speak or type your answer, review speaking pace and filler words, and receive honest 1–10 scoring across five clear criteria.',
  },
  {
    icon: FileBarChart2,
    title: 'Interview Readiness Report',
    description:
      'Finish with a readiness score out of 100, category breakdowns, communication tips, and a personalized 5-day improvement plan.',
  },
];

const INTERVIEW_CATEGORIES = [
  { code: 'A', title: 'Personal Introduction', sample: 'Tell me about yourself and your academic background.' },
  { code: 'B', title: 'Parents & Family', sample: 'Who is sponsoring your education and what do they do?' },
  { code: 'C', title: 'Class 10 Education', sample: 'Which board did you study under and what subjects stood out?' },
  { code: 'D', title: 'Class 12 Education', sample: 'Why did you choose your stream and how did it lead to your degree?' },
  { code: 'E', title: 'Diploma & Other Qualifications', sample: 'How does your diploma connect to your bachelor’s or master’s?' },
  { code: 'F', title: "Bachelor's / B.Tech", sample: 'Explain your final-year project and your specific technical role.' },
  { code: 'G', title: 'Academic Gaps & Backlogs', sample: 'What were you doing during your academic gap and how did you prepare?' },
  { code: 'H', title: 'Work Experience', sample: 'How does your current engineering role relate to this graduate program?' },
  { code: 'I', title: 'Country & University', sample: 'Why did you select this university over others you considered?' },
  { code: 'J', title: 'Course Knowledge', sample: 'Which subjects will you study and how do they support your goals?' },
  { code: 'K', title: 'Financial Background', sample: 'How will your tuition and living costs be funded across the full program?' },
  { code: 'L', title: 'Part-Time Job Scenarios', sample: 'What will you do if you cannot find a part-time job for several months?' },
  { code: 'M', title: 'Future Career Plans', sample: 'What role are you aiming for after graduation and where?' },
  { code: 'N', title: 'Difficult Questions', sample: 'Why should an officer believe you are a genuine, well-prepared student?' },
];

const TESTIMONIALS = [
  {
    name: 'Priya Nair',
    role: 'M.Sc. Data Analytics Applicant · Sample Profile',
    quote:
      'Before practicing, my answers about my education loan and why I chose my university sounded rehearsed and vague. After four practice rounds, I could explain my funding breakdown and coursework calmly in two crisp sentences.',
    outcome: 'Readiness score improved from 54 to 86 across 4 sessions',
    avatar: '/src/assets/images/avatar_student_priya_1795673538823.jpg',
  },
  {
    name: 'Arjun Patel',
    role: 'M.S. Mechanical Engineering Applicant · Sample Profile',
    quote:
      'I was nervous about explaining a one-year gap and two cleared backlogs from my second year. VisaBuddy AI helped me state the facts honestly without sounding defensive, and forced me to practice the part-time job question until it clicked.',
    outcome: 'Completed 18 targeted gap & financial scenario retries',
    avatar: '/src/assets/images/avatar_student_arjun_1795673539288.jpg',
  },
];

const FAQS = [
  {
    q: 'Does VisaBuddy AI guarantee my student visa will be approved?',
    a: 'No. VisaBuddy AI is an interview preparation and communication coaching platform, not an immigration authority, lawyer, or visa approval service. Visa decisions belong solely to official consular and immigration officers.',
  },
  {
    q: 'Do I need to enter my passport number or bank account credentials?',
    a: 'Never. We intentionally exclude full passport numbers, bank account numbers, card details, OTPs, and bank passwords. You only enter general preparation context such as your sponsor relationship, approximate tuition, and funding type.',
  },
  {
    q: 'How does the AI personalize questions to my background?',
    a: 'Your 12-part student profile is provided securely on the server during your session so the AI asks questions grounded in your real schools, projects, gaps, work experience, target university, and funding plan—without inventing facts.',
  },
  {
    q: 'Can I pause an interview and resume it later?',
    a: 'Yes. Every answer, evaluation, and question index is saved to your account so you can pause anytime and resume from your dashboard or practice only your weakest categories.',
  },
  {
    q: 'Does voice practice work in the browser?',
    a: 'Yes, on browsers that support Web Speech recognition (such as Chrome and Edge), you can speak your answers, edit the transcript before sending, review speaking pace and filler words, and listen to questions read aloud.',
  },
];

export function LandingPage({
  isAuthenticated,
  theme,
  onToggleTheme,
  onStartPractice,
  onQuickPractice,
  onSignIn,
}: LandingPageProps) {
  const [sampleTab, setSampleTab] = useState<'weak' | 'improved'>('weak');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [campusImgFailed, setCampusImgFailed] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
          <a href="#top" className="whitespace-nowrap shrink-0">
            <BrandLogo />
          </a>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
            <a href="#how-it-works" className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 dark:hover:text-white">
              How It Works
            </a>
            <a href="#features" className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 dark:hover:text-white">
              Features
            </a>
            <a href="#categories" className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 dark:hover:text-white">
              Categories
            </a>
            <a href="#faq" className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 dark:hover:text-white">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onStartPractice}
              className="whitespace-nowrap shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start Free Practice'}
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="grid items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="flex flex-col justify-center lg:col-span-6">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                Practice like a friend. Prepare like a pro.
              </p>
              <h1
                className="mt-3 font-display font-bold tracking-tight text-slate-900 dark:text-white"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.75rem)', lineHeight: 1.08, textWrap: 'balance' }}
              >
                Your Personal AI Visa Interview Coach
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
                Prepare for your student visa interview with personalized AI questions, real-time
                feedback, and confidence-building practice.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onQuickPractice}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
                >
                  <span>Start Quick AI Interview</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onStartPractice}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <span>Build Profile</span>
                </button>
                <a
                  href="#how-it-works"
                  className="px-2 py-2 text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-white"
                >
                  How It Works
                </a>
                {!isAuthenticated && (
                  <button
                    type="button"
                    onClick={onSignIn}
                    className="px-2 py-2 text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-white"
                  >
                    Sign in
                  </button>
                )}
              </div>

              <div className="mt-8 border-t border-slate-200 pt-5 text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
                Practice → Answer → Improve → Build Confidence → Get Interview Ready
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-full min-h-[300px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
                {!heroImgFailed ? (
                  <img
                    src="/src/assets/images/hero_visa_coach_1795673537399.jpg"
                    alt="Graduate student preparing for an international study abroad visa interview at a sunlit desk"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-[320px] flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-violet-50 p-8 text-center dark:from-slate-900 dark:to-slate-800">
                    <Globe2 className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                    <p className="mt-3 font-display text-lg font-semibold text-slate-900 dark:text-white">
                      Personal Student Visa Interview Preparation
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Sample Conversation Preview */}
          <div className="mt-16 rounded-2xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900/60 sm:p-8">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Sample Coaching Session
                </p>
                <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  See how VisaBuddy AI coaches one question at a time
                </h2>
              </div>
              <div className="inline-flex rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setSampleTab('weak')}
                  className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    sampleTab === 'weak'
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Initial Student Answer
                </button>
                <button
                  type="button"
                  onClick={() => setSampleTab('improved')}
                  className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    sampleTab === 'improved'
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  AI Feedback & Improved Answer
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-6">
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    VisaBuddy AI · Course & Motivation · Question 6 of 14
                  </div>
                  <p className="mt-2 text-base font-medium text-slate-900 dark:text-white">
                    “Why did you choose to study abroad instead of pursuing this degree in your home country?”
                  </p>
                </div>

                <div className="rounded-xl border border-blue-200/80 bg-blue-50/70 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
                  <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    Student Response ({sampleTab === 'weak' ? 'Attempt 1' : 'Revised Attempt'})
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                    {sampleTab === 'weak'
                      ? '“I want to go abroad for a better future, international exposure, and a good job after graduation.”'
                      : '“After 16 months building ETL pipelines following my B.E. in Computer Science, I selected the MS in Data Science at Northeastern for its core coursework in Distributed Data Management and Supervised Machine Learning, which directly prepares me for senior data engineering roles back in India.”'}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    Coach Evaluation
                  </span>
                  <span className="font-mono text-xs font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                    {sampleTab === 'weak'
                      ? 'Relevance 5/10 · Personalization 2/10 · Clarity 7/10'
                      : 'Relevance 9/10 · Personalization 9/10 · Clarity 9/10'}
                  </span>
                </div>

                {sampleTab === 'weak' ? (
                  <div className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                    <p>
                      <strong className="text-slate-900 dark:text-white">Good start, my friend!</strong>{' '}
                      Your sentence is clear and polite, but it sounds too general—any applicant could say this.
                    </p>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">What is missing:</p>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-600 dark:text-slate-400">
                        <li>How this course connects to your B.E. and current engineering work</li>
                        <li>Specific curriculum subjects at your target university</li>
                        <li>A concrete post-graduation career direction</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                    <p>
                      <strong className="text-emerald-700 dark:text-emerald-400">Much stronger!</strong>{' '}
                      You grounded your motivation in your actual work experience, named concrete subjects, and explained your career trajectory naturally.
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      Confidence tip: Pause briefly after mentioning your university name so your key points land clearly.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="border-t border-slate-200 bg-slate-50/50 py-16 dark:border-slate-800 dark:bg-slate-900/30 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">How It Works</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Four structured steps from profile to interview readiness
              </h2>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: '01',
                  title: 'Build Your Student Profile',
                  desc: 'Enter your personal, family, Class 10, Class 12, graduation, gaps, work, university, financial, and career details step by step.',
                },
                {
                  step: '02',
                  title: 'Choose Your Practice Mode',
                  desc: 'Pick Friendly Practice for unlimited guidance, Mock Visa Interview for realistic pacing, or Difficult Questions for stress testing.',
                },
                {
                  step: '03',
                  title: 'Answer One Question at a Time',
                  desc: 'Reply by typing or voice. Get instant 1–10 scoring, missing points, contradiction checks, and a personalized sample answer.',
                },
                {
                  step: '04',
                  title: 'Review Your Readiness Report',
                  desc: 'Inspect your score out of 100, category breakdown, 5-day study plan, and relaunch practice for weak categories only.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                >
                  <span className="font-mono text-sm font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                    {item.step}.
                  </span>
                  <h3 className="mt-3 font-display text-lg font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features & Why VisaBuddy AI */}
        <section id="features" className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Why VisaBuddy AI
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Built specifically for real student backgrounds—not generic scripts
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                  Generic question lists leave students memorizing robotic sentences that fall apart
                  when an officer asks a follow-up. VisaBuddy AI coaches you to speak truthfully,
                  consistently, and clearly using your own real profile.
                </p>

                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
                  {!campusImgFailed ? (
                    <img
                      src="/src/assets/images/feature_campus_prep_1795673539623.jpg"
                      alt="International university campus courtyard in morning sunlight"
                      referrerPolicy="no-referrer"
                      onError={() => setCampusImgFailed(true)}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center p-8 text-slate-500">
                      <BookOpen className="h-10 w-10" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
                {FEATURES.map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={feat.title}
                      className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 font-display text-base font-bold text-slate-900 dark:text-white">
                        {feat.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {feat.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Interview Practice Categories */}
        <section id="categories" className="border-t border-slate-200 bg-slate-50/50 py-16 dark:border-slate-800 dark:bg-slate-900/30 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  14 Question Categories
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Targeted practice across every part of your academic & financial profile
                </h2>
              </div>
              <button
                type="button"
                onClick={onStartPractice}
                className="inline-flex items-center gap-2 self-start whitespace-nowrap rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                <span>Build Profile & Practice</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {INTERVIEW_CATEGORIES.map((cat) => (
                <div
                  key={cat.code}
                  className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    Category {cat.code}
                  </div>
                  <h3 className="mt-1 font-display text-base font-bold text-slate-900 dark:text-white">
                    {cat.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                    “{cat.sample}”
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Sample Student Stories
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                How structured practice builds calm, honest answers
              </h2>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.name}
                  className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                >
                  <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
                    “{t.quote}”
                  </p>
                  <div className="mt-6 flex items-center gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      referrerPolicy="no-referrer"
                      className="h-12 w-12 rounded-full object-cover bg-slate-200"
                    />
                    <div>
                      <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
                        {t.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {t.role} · {t.outcome}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-slate-200 bg-slate-50/50 py-16 dark:border-slate-800 dark:bg-slate-900/30 lg:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
              {FAQS.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={item.q} className="p-5 sm:p-6">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 text-left"
                    >
                      <span className="font-display text-base font-semibold text-slate-900 dark:text-white">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-10 text-center text-white sm:px-12">
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Ready to practice your real visa interview?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-blue-50 sm:text-base">
                Create your private student profile, test your answers across all 14 interview
                categories, and get your readiness report in minutes.
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={onStartPractice}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-100"
                >
                  <span>Start Free Practice</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <BrandLogo />
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
              <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white">
                How It Works
              </a>
              <a href="#features" className="hover:text-slate-900 dark:hover:text-white">
                Features
              </a>
              <a href="#categories" className="hover:text-slate-900 dark:hover:text-white">
                Categories
              </a>
              <a href="#faq" className="hover:text-slate-900 dark:hover:text-white">
                FAQ
              </a>
              <button
                type="button"
                onClick={onToggleTheme}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 text-xs leading-relaxed text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                VisaBuddy AI is a student interview preparation and communication coaching tool—not
                an immigration authority, legal advisor, or visa approval service. It never
                guarantees visa approval.
              </span>
            </p>
            <p className="flex items-center gap-1.5 whitespace-nowrap">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Private profile · Editable & deletable anytime</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
