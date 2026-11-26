import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  Plus,
  Save,
  Shield,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  calculateAgeFromDob,
  calculateProfileCompletion,
  createSampleStudentProfile,
  type StudentProfile,
} from '../types/visa';

interface ProfileWizardProps {
  profile: StudentProfile;
  onSaveProfile: (updated: StudentProfile) => Promise<void>;
  onStartInterview: (updated: StudentProfile) => Promise<void>;
}

const STEPS = [
  { id: 0, title: 'Personal Info' },
  { id: 1, title: 'Family Background' },
  { id: 2, title: 'Class 10' },
  { id: 3, title: 'Class 12' },
  { id: 4, title: 'Diploma' },
  { id: 5, title: "Bachelor's / B.Tech" },
  { id: 6, title: 'Gaps & Backlogs' },
  { id: 7, title: 'Work Experience' },
  { id: 8, title: 'Study Abroad' },
  { id: 9, title: 'Financial Plan' },
  { id: 10, title: 'Career Plans' },
  { id: 11, title: 'Summary & Timeline' },
];

const inputClass =
  'mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100';

const textareaClass = `${inputClass} min-h-[84px] resize-y`;

const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300';

export function ProfileWizard({
  profile: initialProfile,
  onSaveProfile,
  onStartInterview,
}: ProfileWizardProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<StudentProfile>(initialProfile);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const completionPct = useMemo(() => calculateProfileCompletion(data), [data]);
  const calculatedAge = useMemo(
    () => calculateAgeFromDob(data.personal.dateOfBirth),
    [data.personal.dateOfBirth]
  );

  async function handleSave(showNotice = true) {
    setError(null);
    setSaving(true);
    try {
      await onSaveProfile(data);
      if (showNotice) {
        setSavedNotice('Profile saved.');
        setTimeout(() => setSavedNotice(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handleNext() {
    setError(null);
    if (step === 0 && !data.personal.fullName.trim()) {
      setError('Please enter your full name before continuing.');
      return;
    }
    await handleSave(false);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleLaunchInterview() {
    setError(null);
    setSaving(true);
    try {
      await onStartInterview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start interview.');
    } finally {
      setSaving(false);
    }
  }

  function applySampleProfile() {
    const sample = createSampleStudentProfile(data.personal.email || 'aarav.sharma@example.com');
    setData(sample);
    setSavedNotice('Sample student data loaded. Review or edit any section, then save.');
    setTimeout(() => setSavedNotice(null), 4000);
  }

  const timelineNodes = [
    {
      label: 'Class 10',
      detail: data.class10.schoolName
        ? `${data.class10.schoolName} (${data.class10.passingYear || 'Year'}) · ${data.class10.score || 'Score'}`
        : 'Not added yet',
      active: Boolean(data.class10.schoolName),
    },
    {
      label: 'Class 12',
      detail: data.class12.schoolName
        ? `${data.class12.schoolName} · ${data.class12.stream} (${data.class12.passingYear || 'Year'}) · ${data.class12.score || 'Score'}`
        : 'Not added yet',
      active: Boolean(data.class12.schoolName),
    },
    ...(data.diplomas.hasDiploma && data.diplomas.items.length > 0
      ? [
          {
            label: 'Diploma',
            detail: `${data.diplomas.items[0].courseName || 'Diploma'} at ${data.diplomas.items[0].institutionName || 'Institute'}`,
            active: true,
          },
        ]
      : []),
    ...(data.bachelors.hasBachelors
      ? [
          {
            label: data.bachelors.isBtech ? "Bachelor's / B.Tech" : "Bachelor's Degree",
            detail: data.bachelors.collegeName
              ? `${data.bachelors.degreeName || 'Degree'} (${data.bachelors.branch || data.bachelors.btechBranch}) · ${data.bachelors.collegeName}`
              : 'Details pending',
            active: Boolean(data.bachelors.collegeName),
          },
        ]
      : []),
    ...(data.workExperience.hasWorkExperience && data.workExperience.items.length > 0
      ? [
          {
            label: 'Work Experience',
            detail: `${data.workExperience.items[0].jobTitle || 'Role'} at ${data.workExperience.items[0].companyName || 'Company'}`,
            active: true,
          },
        ]
      : []),
    {
      label: 'Abroad Studies',
      detail: data.studyAbroad.universityName
        ? `${data.studyAbroad.courseName || 'Program'} · ${data.studyAbroad.universityName} (${data.studyAbroad.destinationCountry || 'Destination'})`
        : 'Target university pending',
      active: Boolean(data.studyAbroad.universityName),
    },
  ];

  const personalizedPreviewQuestions = [
    data.class10.schoolName
      ? `Which school did you attend for Class 10, and what did you score under ${data.class10.board}?`
      : 'Which school did you attend for Class 10 and which board did you study under?',
    data.bachelors.finalYearProject
      ? `Explain your final-year project "${data.bachelors.finalYearProject}" and what your specific role was.`
      : 'Tell me about your bachelor’s degree and your favorite subjects.',
    data.studyAbroad.universityName
      ? `Why did you choose ${data.studyAbroad.universityName} in ${data.studyAbroad.destinationCountry || 'your destination country'} for ${data.studyAbroad.courseName || 'this course'}?`
      : 'Why did you choose this destination country and university?',
    data.financial.primarySponsor
      ? `Your ${data.financial.relationshipToStudent || data.financial.primarySponsor} is sponsoring your education—how will your tuition of ${data.financial.tuitionFee || 'the program'} be funded?`
      : 'Who is sponsoring your education and how will you cover tuition and living costs?',
    'What will you do if you cannot find a part-time job for several months after arriving?',
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header & Progress */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Step {step + 1} of {STEPS.length} · Profile Completion {completionPct}%
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {STEPS[step].title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleLaunchInterview}
              disabled={saving}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-95 disabled:opacity-60"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              <span>Skip Form & Start AI Interview</span>
            </button>
            <button
              type="button"
              onClick={applySampleProfile}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Autofill Sample Profile</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>Save Progress</span>
            </button>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600 transition-all duration-300"
            style={{ width: `${Math.round(((step + 1) / STEPS.length) * 100)}%` }}
          />
        </div>

        {/* Clickable Step Tabs */}
        <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
          {STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setError(null);
                setStep(s.id);
              }}
              className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                step === s.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              <span className="font-mono tabular-nums">{s.id + 1}.</span> {s.title}
            </button>
          ))}
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

      {savedNotice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Main Step Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        {/* STEP 1: PERSONAL INFO */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                Privacy-first profile: Never enter full passport numbers or national ID numbers. We only collect details needed to personalize your visa interview practice.
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input
                  type="text"
                  value={data.personal.fullName}
                  onChange={(e) =>
                    setData({ ...data, personal: { ...data.personal, fullName: e.target.value } })
                  }
                  placeholder="Your full name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Father's Full Name</label>
                <input
                  type="text"
                  value={data.personal.fatherFullName}
                  onChange={(e) =>
                    setData({
                      ...data,
                      personal: { ...data.personal, fatherFullName: e.target.value },
                    })
                  }
                  placeholder="Father's full name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Mother's Full Name</label>
                <input
                  type="text"
                  value={data.personal.motherFullName}
                  onChange={(e) =>
                    setData({
                      ...data,
                      personal: { ...data.personal, motherFullName: e.target.value },
                    })
                  }
                  placeholder="Mother's full name"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Date of Birth</label>
                <input
                  type="date"
                  value={data.personal.dateOfBirth}
                  onChange={(e) =>
                    setData({
                      ...data,
                      personal: { ...data.personal, dateOfBirth: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Age (Auto-calculated)</label>
                <div className="mt-1.5 flex h-[42px] items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 font-mono text-sm tabular-nums text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                  {calculatedAge !== null ? `${calculatedAge} years` : 'Select date of birth'}
                </div>
              </div>

              <div>
                <label className={labelClass}>Gender (Optional)</label>
                <select
                  value={data.personal.gender}
                  onChange={(e) =>
                    setData({ ...data, personal: { ...data.personal, gender: e.target.value } })
                  }
                  className={inputClass}
                >
                  <option value="">Prefer not to say</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Citizenship / Nationality</label>
                <input
                  type="text"
                  value={data.personal.citizenship}
                  onChange={(e) =>
                    setData({
                      ...data,
                      personal: { ...data.personal, citizenship: e.target.value },
                    })
                  }
                  placeholder="e.g. Indian"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Passport Country</label>
                <input
                  type="text"
                  value={data.personal.passportCountry}
                  onChange={(e) =>
                    setData({
                      ...data,
                      personal: { ...data.personal, passportCountry: e.target.value },
                    })
                  }
                  placeholder="e.g. India"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Passport Expiry (Optional)</label>
                <input
                  type="month"
                  value={data.personal.passportExpiry}
                  onChange={(e) =>
                    setData({
                      ...data,
                      personal: { ...data.personal, passportExpiry: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Current City</label>
                <input
                  type="text"
                  value={data.personal.city}
                  onChange={(e) =>
                    setData({ ...data, personal: { ...data.personal, city: e.target.value } })
                  }
                  placeholder="e.g. Pune"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>State / Province</label>
                <input
                  type="text"
                  value={data.personal.state}
                  onChange={(e) =>
                    setData({ ...data, personal: { ...data.personal, state: e.target.value } })
                  }
                  placeholder="e.g. Maharashtra"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Country</label>
                <input
                  type="text"
                  value={data.personal.country}
                  onChange={(e) =>
                    setData({ ...data, personal: { ...data.personal, country: e.target.value } })
                  }
                  placeholder="e.g. India"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Native Language</label>
                <input
                  type="text"
                  value={data.personal.nativeLanguage}
                  onChange={(e) =>
                    setData({
                      ...data,
                      personal: { ...data.personal, nativeLanguage: e.target.value },
                    })
                  }
                  placeholder="e.g. Hindi, Tamil, Telugu"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Preferred Practice Language</label>
                <select
                  value={data.personal.preferredPracticeLanguage}
                  onChange={(e) =>
                    setData({
                      ...data,
                      personal: { ...data.personal, preferredPracticeLanguage: e.target.value },
                    })
                  }
                  className={inputClass}
                >
                  <option value="English">English</option>
                  <option value="English (Simple & Clear)">English (Simple & Clear)</option>
                  <option value="Hindi + English Coaching">Hindi + English Coaching</option>
                  <option value="Spanish + English Coaching">Spanish + English Coaching</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={data.personal.email}
                  onChange={(e) =>
                    setData({ ...data, personal: { ...data.personal, email: e.target.value } })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={data.personal.phone}
                  onChange={(e) =>
                    setData({ ...data, personal: { ...data.personal, phone: e.target.value } })
                  }
                  placeholder="Optional"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: FAMILY BACKGROUND */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Father's Occupation</label>
                <input
                  type="text"
                  value={data.family.fatherOccupation}
                  onChange={(e) =>
                    setData({
                      ...data,
                      family: { ...data.family, fatherOccupation: e.target.value },
                    })
                  }
                  placeholder="e.g. Business owner, Government engineer"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Father's Business / Company Name (If applicable)</label>
                <input
                  type="text"
                  value={data.family.fatherCompany}
                  onChange={(e) =>
                    setData({ ...data, family: { ...data.family, fatherCompany: e.target.value } })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Father's Approximate Annual Income (Optional)</label>
                <input
                  type="text"
                  value={data.family.fatherIncome}
                  onChange={(e) =>
                    setData({ ...data, family: { ...data.family, fatherIncome: e.target.value } })
                  }
                  placeholder="Optional, e.g. INR 18,00,000"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Father's Education (Optional)</label>
                <input
                  type="text"
                  value={data.family.fatherEducation}
                  onChange={(e) =>
                    setData({
                      ...data,
                      family: { ...data.family, fatherEducation: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Mother's Occupation</label>
                <input
                  type="text"
                  value={data.family.motherOccupation}
                  onChange={(e) =>
                    setData({
                      ...data,
                      family: { ...data.family, motherOccupation: e.target.value },
                    })
                  }
                  placeholder="e.g. Homemaker, School teacher"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Mother's Education (Optional)</label>
                <input
                  type="text"
                  value={data.family.motherEducation}
                  onChange={(e) =>
                    setData({
                      ...data,
                      family: { ...data.family, motherEducation: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Mother's Approximate Annual Income (Optional)</label>
                <input
                  type="text"
                  value={data.family.motherIncome}
                  onChange={(e) =>
                    setData({ ...data, family: { ...data.family, motherIncome: e.target.value } })
                  }
                  placeholder="Optional"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Family Location</label>
                <input
                  type="text"
                  value={data.family.familyLocation}
                  onChange={(e) =>
                    setData({ ...data, family: { ...data.family, familyLocation: e.target.value } })
                  }
                  placeholder="City & country where your family lives"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Total Family Members</label>
                <input
                  type="number"
                  min={1}
                  value={data.family.totalFamilyMembers}
                  onChange={(e) =>
                    setData({
                      ...data,
                      family: { ...data.family, totalFamilyMembers: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Number of Siblings</label>
                <input
                  type="number"
                  min={0}
                  value={data.family.numberOfSiblings}
                  onChange={(e) =>
                    setData({
                      ...data,
                      family: { ...data.family, numberOfSiblings: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            {/* Siblings List */}
            <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                  Siblings Details (Optional)
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setData({
                      ...data,
                      family: {
                        ...data.family,
                        siblings: [
                          ...data.family.siblings,
                          { name: '', education: '', occupation: '' },
                        ],
                      },
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Sibling</span>
                </button>
              </div>
              {data.family.siblings.length > 0 && (
                <div className="mt-3 space-y-3">
                  {data.family.siblings.map((sib, idx) => (
                    <div
                      key={idx}
                      className="grid items-end gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800 sm:grid-cols-4"
                    >
                      <div>
                        <label className={labelClass}>Name (Optional)</label>
                        <input
                          type="text"
                          value={sib.name}
                          onChange={(e) => {
                            const next = [...data.family.siblings];
                            next[idx] = { ...sib, name: e.target.value };
                            setData({ ...data, family: { ...data.family, siblings: next } });
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Education</label>
                        <input
                          type="text"
                          value={sib.education}
                          onChange={(e) => {
                            const next = [...data.family.siblings];
                            next[idx] = { ...sib, education: e.target.value };
                            setData({ ...data, family: { ...data.family, siblings: next } });
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Occupation</label>
                        <input
                          type="text"
                          value={sib.occupation}
                          onChange={(e) => {
                            const next = [...data.family.siblings];
                            next[idx] = { ...sib, occupation: e.target.value };
                            setData({ ...data, family: { ...data.family, siblings: next } });
                          }}
                          className={inputClass}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const next = data.family.siblings.filter((_, i) => i !== idx);
                          setData({ ...data, family: { ...data.family, siblings: next } });
                        }}
                        className="inline-flex h-[42px] items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-slate-700 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-5 border-t border-slate-200 pt-5 dark:border-slate-800 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Who is sponsoring your education?</label>
                <input
                  type="text"
                  value={data.family.sponsoringEducation}
                  onChange={(e) =>
                    setData({
                      ...data,
                      family: { ...data.family, sponsoringEducation: e.target.value },
                    })
                  }
                  placeholder="e.g. Parents, Education loan + Father"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Are your parents supporting your studies?</label>
                <select
                  value={data.family.parentsSupporting}
                  onChange={(e) =>
                    setData({
                      ...data,
                      family: {
                        ...data.family,
                        parentsSupporting: e.target.value as 'Yes' | 'Partially' | 'No',
                      },
                    })
                  }
                  className={inputClass}
                >
                  <option value="Yes">Yes, fully supporting</option>
                  <option value="Partially">Partially supporting</option>
                  <option value="No">No, self-funded / scholarship / loan</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Family Responsibilities</label>
                <input
                  type="text"
                  value={data.family.familyResponsibilities}
                  onChange={(e) =>
                    setData({
                      ...data,
                      family: { ...data.family, familyResponsibilities: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Family Background Summary</label>
                <input
                  type="text"
                  value={data.family.familyBackgroundSummary}
                  onChange={(e) =>
                    setData({
                      ...data,
                      family: { ...data.family, familyBackgroundSummary: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-200 pt-5 dark:border-slate-800">
              <label className="inline-flex items-center gap-2.5 text-sm font-medium text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={data.family.hasRelativesAbroad}
                  onChange={(e) =>
                    setData({
                      ...data,
                      family: { ...data.family, hasRelativesAbroad: e.target.checked },
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <span>Do you have relatives living abroad?</span>
              </label>

              {data.family.hasRelativesAbroad && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Which country do they live in?</label>
                    <input
                      type="text"
                      value={data.family.relativesAbroadCountry}
                      onChange={(e) =>
                        setData({
                          ...data,
                          family: { ...data.family, relativesAbroadCountry: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>What is your relationship with them?</label>
                    <input
                      type="text"
                      value={data.family.relativesRelationship}
                      onChange={(e) =>
                        setData({
                          ...data,
                          family: { ...data.family, relativesRelationship: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className={labelClass}>What family ties do you have in your home country?</label>
                <textarea
                  value={data.family.homeCountryTies}
                  onChange={(e) =>
                    setData({
                      ...data,
                      family: { ...data.family, homeCountryTies: e.target.value },
                    })
                  }
                  placeholder="Parents, siblings, family property, business responsibilities, community ties"
                  className={textareaClass}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: CLASS 10 */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Class 10 School Name</label>
                <input
                  type="text"
                  value={data.class10.schoolName}
                  onChange={(e) =>
                    setData({ ...data, class10: { ...data.class10, schoolName: e.target.value } })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>School Location</label>
                <input
                  type="text"
                  value={data.class10.schoolLocation}
                  onChange={(e) =>
                    setData({
                      ...data,
                      class10: { ...data.class10, schoolLocation: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Board</label>
                <select
                  value={data.class10.board}
                  onChange={(e) =>
                    setData({
                      ...data,
                      class10: {
                        ...data.class10,
                        board: e.target.value as 'CBSE' | 'ICSE' | 'State Board' | 'Other',
                      },
                    })
                  }
                  className={inputClass}
                >
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State Board">State Board</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {data.class10.board === 'Other' && (
                <div>
                  <label className={labelClass}>Specify Board</label>
                  <input
                    type="text"
                    value={data.class10.boardOther}
                    onChange={(e) =>
                      setData({ ...data, class10: { ...data.class10, boardOther: e.target.value } })
                    }
                    className={inputClass}
                  />
                </div>
              )}
              <div>
                <label className={labelClass}>Passing Year</label>
                <input
                  type="text"
                  value={data.class10.passingYear}
                  onChange={(e) =>
                    setData({ ...data, class10: { ...data.class10, passingYear: e.target.value } })
                  }
                  placeholder="e.g. 2018"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Percentage or CGPA</label>
                <input
                  type="text"
                  value={data.class10.score}
                  onChange={(e) =>
                    setData({ ...data, class10: { ...data.class10, score: e.target.value } })
                  }
                  placeholder="e.g. 91.4% or 9.4 CGPA"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Main Subjects</label>
                <input
                  type="text"
                  value={data.class10.mainSubjects}
                  onChange={(e) =>
                    setData({ ...data, class10: { ...data.class10, mainSubjects: e.target.value } })
                  }
                  placeholder="Mathematics, Science, English, Social Science"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Achievements</label>
                <input
                  type="text"
                  value={data.class10.achievements}
                  onChange={(e) =>
                    setData({ ...data, class10: { ...data.class10, achievements: e.target.value } })
                  }
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Reason for Choosing the School (Optional)</label>
                <input
                  type="text"
                  value={data.class10.reasonForSchool}
                  onChange={(e) =>
                    setData({
                      ...data,
                      class10: { ...data.class10, reasonForSchool: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
              <label className="inline-flex items-center gap-2.5 text-sm font-medium text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={data.class10.hasGapAfter10}
                  onChange={(e) =>
                    setData({
                      ...data,
                      class10: { ...data.class10, hasGapAfter10: e.target.checked },
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <span>Any academic gap after Class 10?</span>
              </label>
              {data.class10.hasGapAfter10 && (
                <div className="mt-3">
                  <label className={labelClass}>Explanation of Gap After Class 10</label>
                  <textarea
                    value={data.class10.gapExplanation}
                    onChange={(e) =>
                      setData({
                        ...data,
                        class10: { ...data.class10, gapExplanation: e.target.value },
                      })
                    }
                    className={textareaClass}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: CLASS 12 */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Class 12 School Name</label>
                <input
                  type="text"
                  value={data.class12.schoolName}
                  onChange={(e) =>
                    setData({ ...data, class12: { ...data.class12, schoolName: e.target.value } })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>School Location</label>
                <input
                  type="text"
                  value={data.class12.schoolLocation}
                  onChange={(e) =>
                    setData({
                      ...data,
                      class12: { ...data.class12, schoolLocation: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Board</label>
                <input
                  type="text"
                  value={data.class12.board}
                  onChange={(e) =>
                    setData({ ...data, class12: { ...data.class12, board: e.target.value } })
                  }
                  placeholder="CBSE / ICSE / State Board"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Stream</label>
                <select
                  value={data.class12.stream}
                  onChange={(e) =>
                    setData({
                      ...data,
                      class12: {
                        ...data.class12,
                        stream: e.target.value as 'Science' | 'Commerce' | 'Arts' | 'Other',
                      },
                    })
                  }
                  className={inputClass}
                >
                  <option value="Science">Science</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Subjects Studied</label>
                <input
                  type="text"
                  value={data.class12.subjects}
                  onChange={(e) =>
                    setData({ ...data, class12: { ...data.class12, subjects: e.target.value } })
                  }
                  placeholder="e.g. Physics, Chemistry, Mathematics, Computer Science"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Passing Year</label>
                <input
                  type="text"
                  value={data.class12.passingYear}
                  onChange={(e) =>
                    setData({ ...data, class12: { ...data.class12, passingYear: e.target.value } })
                  }
                  placeholder="e.g. 2020"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Percentage or CGPA</label>
                <input
                  type="text"
                  value={data.class12.score}
                  onChange={(e) =>
                    setData({ ...data, class12: { ...data.class12, score: e.target.value } })
                  }
                  placeholder="e.g. 88.6%"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Achievements</label>
                <input
                  type="text"
                  value={data.class12.achievements}
                  onChange={(e) =>
                    setData({ ...data, class12: { ...data.class12, achievements: e.target.value } })
                  }
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Reason for Choosing This Stream</label>
                <textarea
                  value={data.class12.reasonForStream}
                  onChange={(e) =>
                    setData({
                      ...data,
                      class12: { ...data.class12, reasonForStream: e.target.value },
                    })
                  }
                  className={textareaClass}
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
              <label className="inline-flex items-center gap-2.5 text-sm font-medium text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={data.class12.hasGapAfter12}
                  onChange={(e) =>
                    setData({
                      ...data,
                      class12: { ...data.class12, hasGapAfter12: e.target.checked },
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <span>Any academic gap after Class 12?</span>
              </label>
              {data.class12.hasGapAfter12 && (
                <div className="mt-3">
                  <label className={labelClass}>Gap Explanation After Class 12</label>
                  <textarea
                    value={data.class12.gapExplanation}
                    onChange={(e) =>
                      setData({
                        ...data,
                        class12: { ...data.class12, gapExplanation: e.target.value },
                      })
                    }
                    className={textareaClass}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: DIPLOMA & OTHER QUALIFICATIONS */}
        {step === 4 && (
          <div className="space-y-5">
            <label className="inline-flex items-center gap-2.5 text-sm font-medium text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={data.diplomas.hasDiploma}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setData({
                    ...data,
                    diplomas: {
                      hasDiploma: checked,
                      items:
                        checked && data.diplomas.items.length === 0
                          ? [
                              {
                                id: crypto.randomUUID(),
                                institutionName: '',
                                location: '',
                                courseName: '',
                                specialization: '',
                                startYear: '',
                                completionYear: '',
                                duration: '',
                                marksOrCgpa: '',
                                subjects: '',
                                skillsLearned: '',
                                reasonForCourse: '',
                                furtherStudyAfterDiploma: '',
                              },
                            ]
                          : data.diplomas.items,
                    },
                  });
                }}
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
              />
              <span>I have completed a Diploma, Certificate, or Additional Qualification</span>
            </label>

            {!data.diplomas.hasDiploma ? (
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                No diploma selected. You can continue directly to Bachelor's / Graduation, or check the box above if you completed a diploma or certificate program.
              </p>
            ) : (
              <div className="space-y-6">
                {data.diplomas.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="space-y-4 rounded-xl border border-slate-200 p-5 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                        Qualification {idx + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          const next = data.diplomas.items.filter((d) => d.id !== item.id);
                          setData({
                            ...data,
                            diplomas: { hasDiploma: next.length > 0, items: next },
                          });
                        }}
                        className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <label className={labelClass}>Institution Name</label>
                        <input
                          type="text"
                          value={item.institutionName}
                          onChange={(e) => {
                            const next = [...data.diplomas.items];
                            next[idx] = { ...item, institutionName: e.target.value };
                            setData({ ...data, diplomas: { ...data.diplomas, items: next } });
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Location</label>
                        <input
                          type="text"
                          value={item.location}
                          onChange={(e) => {
                            const next = [...data.diplomas.items];
                            next[idx] = { ...item, location: e.target.value };
                            setData({ ...data, diplomas: { ...data.diplomas, items: next } });
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Course Name</label>
                        <input
                          type="text"
                          value={item.courseName}
                          onChange={(e) => {
                            const next = [...data.diplomas.items];
                            next[idx] = { ...item, courseName: e.target.value };
                            setData({ ...data, diplomas: { ...data.diplomas, items: next } });
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Specialization</label>
                        <input
                          type="text"
                          value={item.specialization}
                          onChange={(e) => {
                            const next = [...data.diplomas.items];
                            next[idx] = { ...item, specialization: e.target.value };
                            setData({ ...data, diplomas: { ...data.diplomas, items: next } });
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Start Year</label>
                        <input
                          type="text"
                          value={item.startYear}
                          onChange={(e) => {
                            const next = [...data.diplomas.items];
                            next[idx] = { ...item, startYear: e.target.value };
                            setData({ ...data, diplomas: { ...data.diplomas, items: next } });
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Completion Year</label>
                        <input
                          type="text"
                          value={item.completionYear}
                          onChange={(e) => {
                            const next = [...data.diplomas.items];
                            next[idx] = { ...item, completionYear: e.target.value };
                            setData({ ...data, diplomas: { ...data.diplomas, items: next } });
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Duration</label>
                        <input
                          type="text"
                          value={item.duration}
                          onChange={(e) => {
                            const next = [...data.diplomas.items];
                            next[idx] = { ...item, duration: e.target.value };
                            setData({ ...data, diplomas: { ...data.diplomas, items: next } });
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Marks / CGPA</label>
                        <input
                          type="text"
                          value={item.marksOrCgpa}
                          onChange={(e) => {
                            const next = [...data.diplomas.items];
                            next[idx] = { ...item, marksOrCgpa: e.target.value };
                            setData({ ...data, diplomas: { ...data.diplomas, items: next } });
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Subjects</label>
                        <input
                          type="text"
                          value={item.subjects}
                          onChange={(e) => {
                            const next = [...data.diplomas.items];
                            next[idx] = { ...item, subjects: e.target.value };
                            setData({ ...data, diplomas: { ...data.diplomas, items: next } });
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Skills Learned</label>
                        <input
                          type="text"
                          value={item.skillsLearned}
                          onChange={(e) => {
                            const next = [...data.diplomas.items];
                            next[idx] = { ...item, skillsLearned: e.target.value };
                            setData({ ...data, diplomas: { ...data.diplomas, items: next } });
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Reason for Selecting Course</label>
                        <input
                          type="text"
                          value={item.reasonForCourse}
                          onChange={(e) => {
                            const next = [...data.diplomas.items];
                            next[idx] = { ...item, reasonForCourse: e.target.value };
                            setData({ ...data, diplomas: { ...data.diplomas, items: next } });
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Further Study After Diploma</label>
                        <input
                          type="text"
                          value={item.furtherStudyAfterDiploma}
                          onChange={(e) => {
                            const next = [...data.diplomas.items];
                            next[idx] = { ...item, furtherStudyAfterDiploma: e.target.value };
                            setData({ ...data, diplomas: { ...data.diplomas, items: next } });
                          }}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setData({
                      ...data,
                      diplomas: {
                        ...data.diplomas,
                        items: [
                          ...data.diplomas.items,
                          {
                            id: crypto.randomUUID(),
                            institutionName: '',
                            location: '',
                            courseName: '',
                            specialization: '',
                            startYear: '',
                            completionYear: '',
                            duration: '',
                            marksOrCgpa: '',
                            subjects: '',
                            skillsLearned: '',
                            reasonForCourse: '',
                            furtherStudyAfterDiploma: '',
                          },
                        ],
                      },
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Another Qualification</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 6: BACHELOR'S / B.TECH */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-6">
              <label className="inline-flex items-center gap-2.5 text-sm font-medium text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={data.bachelors.hasBachelors}
                  onChange={(e) =>
                    setData({
                      ...data,
                      bachelors: { ...data.bachelors, hasBachelors: e.target.checked },
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <span>I am pursuing or completed a Bachelor's degree</span>
              </label>

              {data.bachelors.hasBachelors && (
                <label className="inline-flex items-center gap-2.5 text-sm font-medium text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={data.bachelors.isBtech}
                    onChange={(e) =>
                      setData({
                        ...data,
                        bachelors: { ...data.bachelors, isBtech: e.target.checked },
                      })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  <span>Include B.Tech / Engineering Technical Details & Projects</span>
                </label>
              )}
            </div>

            {data.bachelors.hasBachelors && (
              <>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className={labelClass}>College Name</label>
                    <input
                      type="text"
                      value={data.bachelors.collegeName}
                      onChange={(e) =>
                        setData({
                          ...data,
                          bachelors: { ...data.bachelors, collegeName: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>University Name</label>
                    <input
                      type="text"
                      value={data.bachelors.universityName}
                      onChange={(e) =>
                        setData({
                          ...data,
                          bachelors: { ...data.bachelors, universityName: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>College Location</label>
                    <input
                      type="text"
                      value={data.bachelors.collegeLocation}
                      onChange={(e) =>
                        setData({
                          ...data,
                          bachelors: { ...data.bachelors, collegeLocation: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Degree Name</label>
                    <input
                      type="text"
                      value={data.bachelors.degreeName}
                      onChange={(e) =>
                        setData({
                          ...data,
                          bachelors: { ...data.bachelors, degreeName: e.target.value },
                        })
                      }
                      placeholder="e.g. B.Tech / B.E. / B.Sc. / B.Com"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Branch / Specialization</label>
                    <input
                      type="text"
                      value={data.bachelors.branch}
                      onChange={(e) =>
                        setData({
                          ...data,
                          bachelors: { ...data.bachelors, branch: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Course Duration</label>
                    <input
                      type="text"
                      value={data.bachelors.courseDuration}
                      onChange={(e) =>
                        setData({
                          ...data,
                          bachelors: { ...data.bachelors, courseDuration: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Admission Year</label>
                    <input
                      type="text"
                      value={data.bachelors.admissionYear}
                      onChange={(e) =>
                        setData({
                          ...data,
                          bachelors: { ...data.bachelors, admissionYear: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Graduation / Expected Year</label>
                    <input
                      type="text"
                      value={data.bachelors.graduationYear}
                      onChange={(e) =>
                        setData({
                          ...data,
                          bachelors: { ...data.bachelors, graduationYear: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Current Year / Semester</label>
                    <input
                      type="text"
                      value={data.bachelors.currentYearOrSemester}
                      onChange={(e) =>
                        setData({
                          ...data,
                          bachelors: { ...data.bachelors, currentYearOrSemester: e.target.value },
                        })
                      }
                      placeholder="e.g. Graduated / Semester 7"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>CGPA or Percentage</label>
                    <input
                      type="text"
                      value={data.bachelors.cgpaOrPercentage}
                      onChange={(e) =>
                        setData({
                          ...data,
                          bachelors: { ...data.bachelors, cgpaOrPercentage: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Current Backlogs</label>
                    <input
                      type="text"
                      value={data.bachelors.currentBacklogs}
                      onChange={(e) =>
                        setData({
                          ...data,
                          bachelors: { ...data.bachelors, currentBacklogs: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Previous / Cleared Backlogs</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Previous"
                        value={data.bachelors.previousBacklogs}
                        onChange={(e) =>
                          setData({
                            ...data,
                            bachelors: { ...data.bachelors, previousBacklogs: e.target.value },
                          })
                        }
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="Cleared"
                        value={data.bachelors.clearedBacklogs}
                        onChange={(e) =>
                          setData({
                            ...data,
                            bachelors: { ...data.bachelors, clearedBacklogs: e.target.value },
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Favorite Subjects</label>
                    <input
                      type="text"
                      value={data.bachelors.favoriteSubjects}
                      onChange={(e) =>
                        setData({
                          ...data,
                          bachelors: { ...data.bachelors, favoriteSubjects: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Skills Developed</label>
                    <input
                      type="text"
                      value={data.bachelors.skillsDeveloped}
                      onChange={(e) =>
                        setData({
                          ...data,
                          bachelors: { ...data.bachelors, skillsDeveloped: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Academic Achievements</label>
                    <input
                      type="text"
                      value={data.bachelors.academicAchievements}
                      onChange={(e) =>
                        setData({
                          ...data,
                          bachelors: { ...data.bachelors, academicAchievements: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className={labelClass}>Reason for Choosing This Degree</label>
                    <textarea
                      value={data.bachelors.reasonForDegree}
                      onChange={(e) =>
                        setData({
                          ...data,
                          bachelors: { ...data.bachelors, reasonForDegree: e.target.value },
                        })
                      }
                      className={textareaClass}
                    />
                  </div>
                </div>

                {data.bachelors.isBtech && (
                  <div className="space-y-5 border-t border-slate-200 pt-6 dark:border-slate-800">
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      B.Tech / Engineering Technical Profile & Projects
                    </h3>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <label className={labelClass}>B.Tech Branch</label>
                        <select
                          value={data.bachelors.btechBranch}
                          onChange={(e) =>
                            setData({
                              ...data,
                              bachelors: {
                                ...data.bachelors,
                                btechBranch: e.target.value as StudentProfile['bachelors']['btechBranch'],
                              },
                            })
                          }
                          className={inputClass}
                        >
                          <option value="CSE">CSE</option>
                          <option value="IT">IT</option>
                          <option value="ECE">ECE</option>
                          <option value="Mechanical">Mechanical</option>
                          <option value="Civil">Civil</option>
                          <option value="Electrical">Electrical</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Programming Languages</label>
                        <input
                          type="text"
                          value={data.bachelors.programmingLanguages}
                          onChange={(e) =>
                            setData({
                              ...data,
                              bachelors: {
                                ...data.bachelors,
                                programmingLanguages: e.target.value,
                              },
                            })
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Technical Skills</label>
                        <input
                          type="text"
                          value={data.bachelors.technicalSkills}
                          onChange={(e) =>
                            setData({
                              ...data,
                              bachelors: { ...data.bachelors, technicalSkills: e.target.value },
                            })
                          }
                          className={inputClass}
                        />
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className={labelClass}>Final-Year Project Title</label>
                        <input
                          type="text"
                          value={data.bachelors.finalYearProject}
                          onChange={(e) =>
                            setData({
                              ...data,
                              bachelors: { ...data.bachelors, finalYearProject: e.target.value },
                            })
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Internships</label>
                        <input
                          type="text"
                          value={data.bachelors.internships}
                          onChange={(e) =>
                            setData({
                              ...data,
                              bachelors: { ...data.bachelors, internships: e.target.value },
                            })
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Industrial Training</label>
                        <input
                          type="text"
                          value={data.bachelors.industrialTraining}
                          onChange={(e) =>
                            setData({
                              ...data,
                              bachelors: { ...data.bachelors, industrialTraining: e.target.value },
                            })
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Certifications</label>
                        <input
                          type="text"
                          value={data.bachelors.certifications}
                          onChange={(e) =>
                            setData({
                              ...data,
                              bachelors: { ...data.bachelors, certifications: e.target.value },
                            })
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Hackathons</label>
                        <input
                          type="text"
                          value={data.bachelors.hackathons}
                          onChange={(e) =>
                            setData({
                              ...data,
                              bachelors: { ...data.bachelors, hackathons: e.target.value },
                            })
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Workshops</label>
                        <input
                          type="text"
                          value={data.bachelors.workshops}
                          onChange={(e) =>
                            setData({
                              ...data,
                              bachelors: { ...data.bachelors, workshops: e.target.value },
                            })
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Research / Practical Experience</label>
                        <input
                          type="text"
                          value={data.bachelors.research || data.bachelors.practicalExperience}
                          onChange={(e) =>
                            setData({
                              ...data,
                              bachelors: { ...data.bachelors, research: e.target.value },
                            })
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Projects array */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                          Academic & Technical Projects
                        </h4>
                        <button
                          type="button"
                          onClick={() =>
                            setData({
                              ...data,
                              bachelors: {
                                ...data.bachelors,
                                projects: [
                                  ...data.bachelors.projects,
                                  {
                                    id: crypto.randomUUID(),
                                    title: '',
                                    description: '',
                                    technologies: '',
                                    role: '',
                                    learned: '',
                                  },
                                ],
                              },
                            })
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add Project</span>
                        </button>
                      </div>

                      {data.bachelors.projects.map((proj, idx) => (
                        <div
                          key={proj.id}
                          className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">
                              Project {idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setData({
                                  ...data,
                                  bachelors: {
                                    ...data.bachelors,
                                    projects: data.bachelors.projects.filter(
                                      (p) => p.id !== proj.id
                                    ),
                                  },
                                })
                              }
                              className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className={labelClass}>Project Title</label>
                              <input
                                type="text"
                                value={proj.title}
                                onChange={(e) => {
                                  const next = [...data.bachelors.projects];
                                  next[idx] = { ...proj, title: e.target.value };
                                  setData({
                                    ...data,
                                    bachelors: { ...data.bachelors, projects: next },
                                  });
                                }}
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Technologies Used</label>
                              <input
                                type="text"
                                value={proj.technologies}
                                onChange={(e) => {
                                  const next = [...data.bachelors.projects];
                                  next[idx] = { ...proj, technologies: e.target.value };
                                  setData({
                                    ...data,
                                    bachelors: { ...data.bachelors, projects: next },
                                  });
                                }}
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Your Role</label>
                              <input
                                type="text"
                                value={proj.role}
                                onChange={(e) => {
                                  const next = [...data.bachelors.projects];
                                  next[idx] = { ...proj, role: e.target.value };
                                  setData({
                                    ...data,
                                    bachelors: { ...data.bachelors, projects: next },
                                  });
                                }}
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>What You Learned</label>
                              <input
                                type="text"
                                value={proj.learned}
                                onChange={(e) => {
                                  const next = [...data.bachelors.projects];
                                  next[idx] = { ...proj, learned: e.target.value };
                                  setData({
                                    ...data,
                                    bachelors: { ...data.bachelors, projects: next },
                                  });
                                }}
                                className={inputClass}
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className={labelClass}>Description</label>
                              <textarea
                                value={proj.description}
                                onChange={(e) => {
                                  const next = [...data.bachelors.projects];
                                  next[idx] = { ...proj, description: e.target.value };
                                  setData({
                                    ...data,
                                    bachelors: { ...data.bachelors, projects: next },
                                  });
                                }}
                                className={textareaClass}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* STEP 7: ACADEMIC GAPS & BACKLOGS */}
        {step === 6 && (
          <div className="space-y-5">
            <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
              Be completely honest here—VisaBuddy AI helps you explain academic gaps, backlogs, or
              course changes calmly and constructively, without shame or judgment.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { key: 'hasEducationGap', label: 'Education Gap' },
                { key: 'hasFailedSubjects', label: 'Failed Subjects' },
                { key: 'hasBacklogs', label: 'Backlogs (Active or Cleared)' },
                { key: 'hasCourseChange', label: 'Course / Stream Change' },
                { key: 'hasCollegeChange', label: 'College / University Change' },
                { key: 'hasDelayedGraduation', label: 'Delayed Graduation' },
              ].map((item) => {
                const fieldKey = item.key as
                  | 'hasEducationGap'
                  | 'hasFailedSubjects'
                  | 'hasBacklogs'
                  | 'hasCourseChange'
                  | 'hasCollegeChange'
                  | 'hasDelayedGraduation';
                return (
                  <label
                    key={item.key}
                    className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-3.5 text-sm font-medium text-slate-800 dark:border-slate-800 dark:text-slate-200"
                  >
                    <input
                      type="checkbox"
                      checked={data.gapsAndBacklogs[fieldKey]}
                      onChange={(e) =>
                        setData({
                          ...data,
                          gapsAndBacklogs: {
                            ...data.gapsAndBacklogs,
                            [fieldKey]: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    <span>{item.label}</span>
                  </label>
                );
              })}
            </div>

            {(data.gapsAndBacklogs.hasEducationGap ||
              data.gapsAndBacklogs.hasFailedSubjects ||
              data.gapsAndBacklogs.hasBacklogs ||
              data.gapsAndBacklogs.hasCourseChange ||
              data.gapsAndBacklogs.hasCollegeChange ||
              data.gapsAndBacklogs.hasDelayedGraduation) && (
              <div className="grid gap-5 border-t border-slate-200 pt-5 dark:border-slate-800 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>From Year</label>
                  <input
                    type="text"
                    value={data.gapsAndBacklogs.fromYear}
                    onChange={(e) =>
                      setData({
                        ...data,
                        gapsAndBacklogs: { ...data.gapsAndBacklogs, fromYear: e.target.value },
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>To Year</label>
                  <input
                    type="text"
                    value={data.gapsAndBacklogs.toYear}
                    onChange={(e) =>
                      setData({
                        ...data,
                        gapsAndBacklogs: { ...data.gapsAndBacklogs, toYear: e.target.value },
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Duration</label>
                  <input
                    type="text"
                    value={data.gapsAndBacklogs.duration}
                    onChange={(e) =>
                      setData({
                        ...data,
                        gapsAndBacklogs: { ...data.gapsAndBacklogs, duration: e.target.value },
                      })
                    }
                    placeholder="e.g. 1 year / 1 semester"
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className={labelClass}>Reason</label>
                  <input
                    type="text"
                    value={data.gapsAndBacklogs.reason}
                    onChange={(e) =>
                      setData({
                        ...data,
                        gapsAndBacklogs: { ...data.gapsAndBacklogs, reason: e.target.value },
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Courses or Training</label>
                  <input
                    type="text"
                    value={data.gapsAndBacklogs.coursesOrTraining}
                    onChange={(e) =>
                      setData({
                        ...data,
                        gapsAndBacklogs: {
                          ...data.gapsAndBacklogs,
                          coursesOrTraining: e.target.value,
                        },
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Employment During Period</label>
                  <input
                    type="text"
                    value={data.gapsAndBacklogs.employmentDuringGap}
                    onChange={(e) =>
                      setData({
                        ...data,
                        gapsAndBacklogs: {
                          ...data.gapsAndBacklogs,
                          employmentDuringGap: e.target.value,
                        },
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Exam Preparation</label>
                  <input
                    type="text"
                    value={data.gapsAndBacklogs.examPreparation}
                    onChange={(e) =>
                      setData({
                        ...data,
                        gapsAndBacklogs: {
                          ...data.gapsAndBacklogs,
                          examPreparation: e.target.value,
                        },
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Family Responsibilities</label>
                  <input
                    type="text"
                    value={data.gapsAndBacklogs.familyResponsibilities}
                    onChange={(e) =>
                      setData({
                        ...data,
                        gapsAndBacklogs: {
                          ...data.gapsAndBacklogs,
                          familyResponsibilities: e.target.value,
                        },
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>What You Did During This Period</label>
                  <input
                    type="text"
                    value={data.gapsAndBacklogs.activitiesDuringPeriod}
                    onChange={(e) =>
                      setData({
                        ...data,
                        gapsAndBacklogs: {
                          ...data.gapsAndBacklogs,
                          activitiesDuringPeriod: e.target.value,
                        },
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className={labelClass}>Honest Full Explanation</label>
                  <textarea
                    value={data.gapsAndBacklogs.explanation}
                    onChange={(e) =>
                      setData({
                        ...data,
                        gapsAndBacklogs: { ...data.gapsAndBacklogs, explanation: e.target.value },
                      })
                    }
                    className={textareaClass}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 8: WORK EXPERIENCE */}
        {step === 7 && (
          <div className="space-y-5">
            <label className="inline-flex items-center gap-2.5 text-sm font-medium text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={data.workExperience.hasWorkExperience}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setData({
                    ...data,
                    workExperience: {
                      hasWorkExperience: checked,
                      items:
                        checked && data.workExperience.items.length === 0
                          ? [
                              {
                                id: crypto.randomUUID(),
                                companyName: '',
                                jobTitle: '',
                                jobType: 'Full-time',
                                startDate: '',
                                endDate: '',
                                duration: '',
                                responsibilities: '',
                                skills: '',
                                salary: '',
                                reasonForLeaving: '',
                                currentlyEmployed: false,
                              },
                            ]
                          : data.workExperience.items,
                    },
                  });
                }}
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
              />
              <span>I have work experience or completed internships</span>
            </label>

            {data.workExperience.hasWorkExperience && (
              <div className="space-y-6">
                {data.workExperience.items.map((work, idx) => (
                  <div
                    key={work.id}
                    className="space-y-4 rounded-xl border border-slate-200 p-5 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                        Role {idx + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          const next = data.workExperience.items.filter((w) => w.id !== work.id);
                          setData({
                            ...data,
                            workExperience: { hasWorkExperience: next.length > 0, items: next },
                          });
                        }}
                        className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <label className={labelClass}>Company Name</label>
                        <input
                          type="text"
                          value={work.companyName}
                          onChange={(e) => {
                            const next = [...data.workExperience.items];
                            next[idx] = { ...work, companyName: e.target.value };
                            setData({
                              ...data,
                              workExperience: { ...data.workExperience, items: next },
                            });
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Job Title</label>
                        <input
                          type="text"
                          value={work.jobTitle}
                          onChange={(e) => {
                            const next = [...data.workExperience.items];
                            next[idx] = { ...work, jobTitle: e.target.value };
                            setData({
                              ...data,
                              workExperience: { ...data.workExperience, items: next },
                            });
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Job Type</label>
                        <select
                          value={work.jobType}
                          onChange={(e) => {
                            const next = [...data.workExperience.items];
                            next[idx] = {
                              ...work,
                              jobType: e.target.value as 'Full-time' | 'Part-time' | 'Internship',
                            };
                            setData({
                              ...data,
                              workExperience: { ...data.workExperience, items: next },
                            });
                          }}
                          className={inputClass}
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Internship">Internship</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Start Date</label>
                        <input
                          type="month"
                          value={work.startDate}
                          onChange={(e) => {
                            const next = [...data.workExperience.items];
                            next[idx] = { ...work, startDate: e.target.value };
                            setData({
                              ...data,
                              workExperience: { ...data.workExperience, items: next },
                            });
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>End Date</label>
                        <input
                          type="text"
                          value={work.endDate}
                          onChange={(e) => {
                            const next = [...data.workExperience.items];
                            next[idx] = { ...work, endDate: e.target.value };
                            setData({
                              ...data,
                              workExperience: { ...data.workExperience, items: next },
                            });
                          }}
                          placeholder="e.g. Present or 2025-06"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Duration</label>
                        <input
                          type="text"
                          value={work.duration}
                          onChange={(e) => {
                            const next = [...data.workExperience.items];
                            next[idx] = { ...work, duration: e.target.value };
                            setData({
                              ...data,
                              workExperience: { ...data.workExperience, items: next },
                            });
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Skills Gained</label>
                        <input
                          type="text"
                          value={work.skills}
                          onChange={(e) => {
                            const next = [...data.workExperience.items];
                            next[idx] = { ...work, skills: e.target.value };
                            setData({
                              ...data,
                              workExperience: { ...data.workExperience, items: next },
                            });
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Salary (Optional)</label>
                        <input
                          type="text"
                          value={work.salary}
                          onChange={(e) => {
                            const next = [...data.workExperience.items];
                            next[idx] = { ...work, salary: e.target.value };
                            setData({
                              ...data,
                              workExperience: { ...data.workExperience, items: next },
                            });
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div className="flex items-end pb-2">
                        <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={work.currentlyEmployed}
                            onChange={(e) => {
                              const next = [...data.workExperience.items];
                              next[idx] = { ...work, currentlyEmployed: e.target.checked };
                              setData({
                                ...data,
                                workExperience: { ...data.workExperience, items: next },
                              });
                            }}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600"
                          />
                          <span>Currently employed here</span>
                        </label>
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className={labelClass}>Key Responsibilities</label>
                        <textarea
                          value={work.responsibilities}
                          onChange={(e) => {
                            const next = [...data.workExperience.items];
                            next[idx] = { ...work, responsibilities: e.target.value };
                            setData({
                              ...data,
                              workExperience: { ...data.workExperience, items: next },
                            });
                          }}
                          className={textareaClass}
                        />
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className={labelClass}>Reason for Leaving to Study Further</label>
                        <input
                          type="text"
                          value={work.reasonForLeaving}
                          onChange={(e) => {
                            const next = [...data.workExperience.items];
                            next[idx] = { ...work, reasonForLeaving: e.target.value };
                            setData({
                              ...data,
                              workExperience: { ...data.workExperience, items: next },
                            });
                          }}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setData({
                      ...data,
                      workExperience: {
                        ...data.workExperience,
                        items: [
                          ...data.workExperience.items,
                          {
                            id: crypto.randomUUID(),
                            companyName: '',
                            jobTitle: '',
                            jobType: 'Full-time',
                            startDate: '',
                            endDate: '',
                            duration: '',
                            responsibilities: '',
                            skills: '',
                            salary: '',
                            reasonForLeaving: '',
                            currentlyEmployed: false,
                          },
                        ],
                      },
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Another Role</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 9: STUDY ABROAD PROFILE */}
        {step === 8 && (
          <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className={labelClass}>Destination Country</label>
                <input
                  type="text"
                  value={data.studyAbroad.destinationCountry}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studyAbroad: { ...data.studyAbroad, destinationCountry: e.target.value },
                    })
                  }
                  placeholder="e.g. United States, UK, Canada, Germany, Australia"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Visa Type</label>
                <input
                  type="text"
                  value={data.studyAbroad.visaType}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studyAbroad: { ...data.studyAbroad, visaType: e.target.value },
                    })
                  }
                  placeholder="e.g. F-1 Student Visa / Student Route"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>University Name</label>
                <input
                  type="text"
                  value={data.studyAbroad.universityName}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studyAbroad: { ...data.studyAbroad, universityName: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>University Location</label>
                <input
                  type="text"
                  value={data.studyAbroad.universityLocation}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studyAbroad: { ...data.studyAbroad, universityLocation: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Course Name</label>
                <input
                  type="text"
                  value={data.studyAbroad.courseName}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studyAbroad: { ...data.studyAbroad, courseName: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Degree Level</label>
                <input
                  type="text"
                  value={data.studyAbroad.degreeLevel}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studyAbroad: { ...data.studyAbroad, degreeLevel: e.target.value },
                    })
                  }
                  placeholder="Bachelor's / Master's / PhD / Diploma"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Course Duration</label>
                <input
                  type="text"
                  value={data.studyAbroad.courseDuration}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studyAbroad: { ...data.studyAbroad, courseDuration: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Intake</label>
                <input
                  type="text"
                  value={data.studyAbroad.intake}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studyAbroad: { ...data.studyAbroad, intake: e.target.value },
                    })
                  }
                  placeholder="e.g. Fall 2027"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Start Date</label>
                <input
                  type="text"
                  value={data.studyAbroad.startDate}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studyAbroad: { ...data.studyAbroad, startDate: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Tuition Fees</label>
                <input
                  type="text"
                  value={data.studyAbroad.tuitionFees}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studyAbroad: { ...data.studyAbroad, tuitionFees: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Scholarship (If any)</label>
                <input
                  type="text"
                  value={data.studyAbroad.scholarship}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studyAbroad: { ...data.studyAbroad, scholarship: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Deposit Paid</label>
                <input
                  type="text"
                  value={data.studyAbroad.depositPaid}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studyAbroad: { ...data.studyAbroad, depositPaid: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Accommodation Plan</label>
                <input
                  type="text"
                  value={data.studyAbroad.accommodationPlan}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studyAbroad: { ...data.studyAbroad, accommodationPlan: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>University Ranking / Research Notes (Optional)</label>
                <input
                  type="text"
                  value={data.studyAbroad.universityRankingOrResearch}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studyAbroad: {
                        ...data.studyAbroad,
                        universityRankingOrResearch: e.target.value,
                      },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Other Universities Considered</label>
                <input
                  type="text"
                  value={data.studyAbroad.otherUniversitiesConsidered}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studyAbroad: {
                        ...data.studyAbroad,
                        otherUniversitiesConsidered: e.target.value,
                      },
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            {/* Multiple Universities for comparison practice */}
            <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  Additional Universities to Compare (Optional)
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setData({
                      ...data,
                      studyAbroad: {
                        ...data.studyAbroad,
                        comparedUniversities: [
                          ...data.studyAbroad.comparedUniversities,
                          {
                            id: crypto.randomUUID(),
                            name: '',
                            location: '',
                            courseName: '',
                            whyCompared: '',
                          },
                        ],
                      },
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add University</span>
                </button>
              </div>
              {data.studyAbroad.comparedUniversities.map((u, idx) => (
                <div
                  key={u.id}
                  className="mt-3 grid gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800 sm:grid-cols-4"
                >
                  <input
                    type="text"
                    placeholder="University name"
                    value={u.name}
                    onChange={(e) => {
                      const next = [...data.studyAbroad.comparedUniversities];
                      next[idx] = { ...u, name: e.target.value };
                      setData({
                        ...data,
                        studyAbroad: { ...data.studyAbroad, comparedUniversities: next },
                      });
                    }}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="Course"
                    value={u.courseName}
                    onChange={(e) => {
                      const next = [...data.studyAbroad.comparedUniversities];
                      next[idx] = { ...u, courseName: e.target.value };
                      setData({
                        ...data,
                        studyAbroad: { ...data.studyAbroad, comparedUniversities: next },
                      });
                    }}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="Why you chose primary over this"
                    value={u.whyCompared}
                    onChange={(e) => {
                      const next = [...data.studyAbroad.comparedUniversities];
                      next[idx] = { ...u, whyCompared: e.target.value };
                      setData({
                        ...data,
                        studyAbroad: { ...data.studyAbroad, comparedUniversities: next },
                      });
                    }}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setData({
                        ...data,
                        studyAbroad: {
                          ...data.studyAbroad,
                          comparedUniversities: data.studyAbroad.comparedUniversities.filter(
                            (x) => x.id !== u.id
                          ),
                        },
                      })
                    }
                    className="mt-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-slate-700 dark:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="grid gap-5 border-t border-slate-200 pt-5 dark:border-slate-800 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Why This Country?</label>
                <textarea
                  value={data.studyAbroad.whyThisCountry}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studyAbroad: { ...data.studyAbroad, whyThisCountry: e.target.value },
                    })
                  }
                  className={textareaClass}
                />
              </div>
              <div>
                <label className={labelClass}>Why This University?</label>
                <textarea
                  value={data.studyAbroad.whyThisUniversity}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studyAbroad: { ...data.studyAbroad, whyThisUniversity: e.target.value },
                    })
                  }
                  className={textareaClass}
                />
              </div>
              <div>
                <label className={labelClass}>Why This Course?</label>
                <textarea
                  value={data.studyAbroad.whyThisCourse}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studyAbroad: { ...data.studyAbroad, whyThisCourse: e.target.value },
                    })
                  }
                  className={textareaClass}
                />
              </div>
              <div>
                <label className={labelClass}>How Did You Select This University?</label>
                <textarea
                  value={data.studyAbroad.howSelectedUniversity}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studyAbroad: { ...data.studyAbroad, howSelectedUniversity: e.target.value },
                    })
                  }
                  className={textareaClass}
                />
              </div>
              <div>
                <label className={labelClass}>How Is This Course Related to Previous Education?</label>
                <textarea
                  value={data.studyAbroad.relationToPreviousEducation}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studyAbroad: {
                        ...data.studyAbroad,
                        relationToPreviousEducation: e.target.value,
                      },
                    })
                  }
                  className={textareaClass}
                />
              </div>
              <div>
                <label className={labelClass}>What Subjects Will You Study?</label>
                <textarea
                  value={data.studyAbroad.subjectsToStudy}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studyAbroad: { ...data.studyAbroad, subjectsToStudy: e.target.value },
                    })
                  }
                  className={textareaClass}
                />
              </div>
              <div>
                <label className={labelClass}>What Career Opportunities Does It Provide?</label>
                <textarea
                  value={data.studyAbroad.careerOpportunities}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studyAbroad: { ...data.studyAbroad, careerOpportunities: e.target.value },
                    })
                  }
                  className={textareaClass}
                />
              </div>
              <div>
                <label className={labelClass}>Why Not Study This Course in Your Home Country?</label>
                <textarea
                  value={data.studyAbroad.whyNotHomeCountry}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studyAbroad: { ...data.studyAbroad, whyNotHomeCountry: e.target.value },
                    })
                  }
                  className={textareaClass}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 10: FINANCIAL BACKGROUND */}
        {step === 9 && (
          <div className="space-y-6">
            <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                Never enter bank passwords, OTPs, full bank account numbers, or card numbers. Share only general funding breakdowns for realistic interview preparation.
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className={labelClass}>Primary Sponsor</label>
                <input
                  type="text"
                  value={data.financial.primarySponsor}
                  onChange={(e) =>
                    setData({
                      ...data,
                      financial: { ...data.financial, primarySponsor: e.target.value },
                    })
                  }
                  placeholder="e.g. Father & Education Loan"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Sponsor's Full Name</label>
                <input
                  type="text"
                  value={data.financial.sponsorFullName}
                  onChange={(e) =>
                    setData({
                      ...data,
                      financial: { ...data.financial, sponsorFullName: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Relationship to Student</label>
                <input
                  type="text"
                  value={data.financial.relationshipToStudent}
                  onChange={(e) =>
                    setData({
                      ...data,
                      financial: { ...data.financial, relationshipToStudent: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Sponsor Occupation</label>
                <input
                  type="text"
                  value={data.financial.sponsorOccupation}
                  onChange={(e) =>
                    setData({
                      ...data,
                      financial: { ...data.financial, sponsorOccupation: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Sponsor Income (Optional)</label>
                <input
                  type="text"
                  value={data.financial.sponsorIncome}
                  onChange={(e) =>
                    setData({
                      ...data,
                      financial: { ...data.financial, sponsorIncome: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Primary Source of Funds</label>
                <input
                  type="text"
                  value={data.financial.sourceOfFunds}
                  onChange={(e) =>
                    setData({
                      ...data,
                      financial: { ...data.financial, sourceOfFunds: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Family Savings</label>
                <input
                  type="text"
                  value={data.financial.familySavings}
                  onChange={(e) =>
                    setData({
                      ...data,
                      financial: { ...data.financial, familySavings: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Education Loan</label>
                <input
                  type="text"
                  value={data.financial.educationLoan}
                  onChange={(e) =>
                    setData({
                      ...data,
                      financial: { ...data.financial, educationLoan: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Scholarship Amount</label>
                <input
                  type="text"
                  value={data.financial.scholarshipAmount}
                  onChange={(e) =>
                    setData({
                      ...data,
                      financial: { ...data.financial, scholarshipAmount: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Other Funding Sources</label>
                <input
                  type="text"
                  value={data.financial.otherFundingSources}
                  onChange={(e) =>
                    setData({
                      ...data,
                      financial: { ...data.financial, otherFundingSources: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Total Tuition Fee</label>
                <input
                  type="text"
                  value={data.financial.tuitionFee}
                  onChange={(e) =>
                    setData({
                      ...data,
                      financial: { ...data.financial, tuitionFee: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Tuition Amount Paid</label>
                <input
                  type="text"
                  value={data.financial.tuitionPaid}
                  onChange={(e) =>
                    setData({
                      ...data,
                      financial: { ...data.financial, tuitionPaid: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Remaining Tuition</label>
                <input
                  type="text"
                  value={data.financial.remainingTuition}
                  onChange={(e) =>
                    setData({
                      ...data,
                      financial: { ...data.financial, remainingTuition: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Estimated Living Expenses</label>
                <input
                  type="text"
                  value={data.financial.estimatedLivingExpenses}
                  onChange={(e) =>
                    setData({
                      ...data,
                      financial: { ...data.financial, estimatedLivingExpenses: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Accommodation Expenses</label>
                <input
                  type="text"
                  value={data.financial.accommodationExpenses}
                  onChange={(e) =>
                    setData({
                      ...data,
                      financial: { ...data.financial, accommodationExpenses: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Health / Travel Insurance</label>
                <input
                  type="text"
                  value={data.financial.insurance}
                  onChange={(e) =>
                    setData({
                      ...data,
                      financial: { ...data.financial, insurance: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Part-Time Employment Reliance</label>
                <select
                  value={data.financial.dependingOnPartTimeIncome}
                  onChange={(e) =>
                    setData({
                      ...data,
                      financial: {
                        ...data.financial,
                        dependingOnPartTimeIncome: e.target.value as
                          | 'No'
                          | 'Supplementary Only'
                          | 'Unsure',
                      },
                    })
                  }
                  className={inputClass}
                >
                  <option value="No">No — full tuition & living covered by sponsor/loan/savings</option>
                  <option value="Supplementary Only">Optional pocket money only, not essential expenses</option>
                  <option value="Unsure">Unsure — need coaching on part-time scenarios</option>
                </select>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className={labelClass}>Overall Financial Support Plan</label>
                <textarea
                  value={data.financial.financialSupportPlan}
                  onChange={(e) =>
                    setData({
                      ...data,
                      financial: { ...data.financial, financialSupportPlan: e.target.value },
                    })
                  }
                  placeholder="Explain clearly how tuition and living expenses are covered even if you do not work part-time."
                  className={textareaClass}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 11: FUTURE CAREER PLANS */}
        {step === 10 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Desired Job Role</label>
              <input
                type="text"
                value={data.careerPlans.desiredJobRole}
                onChange={(e) =>
                  setData({
                    ...data,
                    careerPlans: { ...data.careerPlans, desiredJobRole: e.target.value },
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Career Field</label>
              <input
                type="text"
                value={data.careerPlans.careerField}
                onChange={(e) =>
                  setData({
                    ...data,
                    careerPlans: { ...data.careerPlans, careerField: e.target.value },
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Desired Industry</label>
              <input
                type="text"
                value={data.careerPlans.desiredIndustry}
                onChange={(e) =>
                  setData({
                    ...data,
                    careerPlans: { ...data.careerPlans, desiredIndustry: e.target.value },
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Skills to Develop</label>
              <input
                type="text"
                value={data.careerPlans.skillsToDevelop}
                onChange={(e) =>
                  setData({
                    ...data,
                    careerPlans: { ...data.careerPlans, skillsToDevelop: e.target.value },
                  })
                }
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Long-Term Career Goal</label>
              <textarea
                value={data.careerPlans.longTermGoal}
                onChange={(e) =>
                  setData({
                    ...data,
                    careerPlans: { ...data.careerPlans, longTermGoal: e.target.value },
                  })
                }
                className={textareaClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Career Plans After Completing Studies</label>
              <textarea
                value={data.careerPlans.plansAfterGraduation}
                onChange={(e) =>
                  setData({
                    ...data,
                    careerPlans: { ...data.careerPlans, plansAfterGraduation: e.target.value },
                  })
                }
                className={textareaClass}
              />
            </div>
            <div>
              <label className={labelClass}>How This Course Will Help</label>
              <textarea
                value={data.careerPlans.howCourseHelps}
                onChange={(e) =>
                  setData({
                    ...data,
                    careerPlans: { ...data.careerPlans, howCourseHelps: e.target.value },
                  })
                }
                className={textareaClass}
              />
            </div>
            <div>
              <label className={labelClass}>Intended Career Location (Genuine Plan)</label>
              <textarea
                value={data.careerPlans.intendedCareerLocation}
                onChange={(e) =>
                  setData({
                    ...data,
                    careerPlans: { ...data.careerPlans, intendedCareerLocation: e.target.value },
                  })
                }
                className={textareaClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Connection to Home-Country Opportunities (If relevant)</label>
              <textarea
                value={data.careerPlans.homeCountryOpportunities}
                onChange={(e) =>
                  setData({
                    ...data,
                    careerPlans: {
                      ...data.careerPlans,
                      homeCountryOpportunities: e.target.value,
                    },
                  })
                }
                className={textareaClass}
              />
            </div>
          </div>
        )}

        {/* STEP 12: PROFILE SUMMARY & TIMELINE */}
        {step === 11 && (
          <div className="space-y-8">
            {/* Education Timeline */}
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Education & Study Abroad Timeline
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {timelineNodes.map((node, i) => (
                  <div
                    key={node.label}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                      <span>0{i + 1}. {node.label}</span>
                      {node.active && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                    </div>
                    <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-300">
                      {node.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Cards Grid */}
            <div className="grid gap-4 border-t border-slate-200 pt-6 dark:border-slate-800 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    Personal & Family
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Edit
                  </button>
                </div>
                <dl className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Student</dt>
                    <dd className="font-medium text-slate-900 dark:text-white">
                      {data.personal.fullName || '—'} {calculatedAge !== null ? `(${calculatedAge})` : ''}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Location</dt>
                    <dd className="text-slate-800 dark:text-slate-200">
                      {[data.personal.city, data.personal.country].filter(Boolean).join(', ') || '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Father</dt>
                    <dd className="text-slate-800 dark:text-slate-200">
                      {data.personal.fatherFullName || '—'} · {data.family.fatherOccupation || '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Mother</dt>
                    <dd className="text-slate-800 dark:text-slate-200">
                      {data.personal.motherFullName || '—'} · {data.family.motherOccupation || '—'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    Study Abroad & Sponsor
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(8)}
                    className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Edit
                  </button>
                </div>
                <dl className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Destination</dt>
                    <dd className="font-medium text-slate-900 dark:text-white">
                      {data.studyAbroad.destinationCountry || '—'} ({data.studyAbroad.visaType || 'Student Visa'})
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">University</dt>
                    <dd className="text-slate-800 dark:text-slate-200">
                      {data.studyAbroad.universityName || '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Course</dt>
                    <dd className="text-slate-800 dark:text-slate-200">
                      {data.studyAbroad.courseName || '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Sponsor & Tuition</dt>
                    <dd className="text-slate-800 dark:text-slate-200">
                      {data.financial.primarySponsor || '—'} · {data.financial.tuitionFee || '—'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Sample Generated Questions Preview */}
            <div className="border-t border-slate-200 pt-6 dark:border-slate-800">
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Sample Personalized Questions Ready for Your Interview
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {personalizedPreviewQuestions.map((q) => (
                  <li
                    key={q}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800"
                  >
                    {q}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-800">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Edit Profile
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Save Profile
                </button>
              </div>
              <button
                type="button"
                onClick={handleLaunchInterview}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                <span>Start Personalized Interview</span>
              </button>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation */}
        {step < 11 && (
          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep((s) => Math.max(0, s - 1));
              }}
              disabled={step === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Save & Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
