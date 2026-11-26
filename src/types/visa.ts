export type InterviewMode = 'friendly' | 'mock' | 'difficult';

export type QuestionCategoryKey =
  | 'personal_intro'
  | 'parents_family'
  | 'class_10'
  | 'class_12'
  | 'diploma'
  | 'bachelors'
  | 'education_gaps'
  | 'work_experience'
  | 'country_university'
  | 'course'
  | 'financial'
  | 'part_time_job'
  | 'future_plans'
  | 'difficult_questions';

export const CATEGORY_LABELS: Record<QuestionCategoryKey, string> = {
  personal_intro: 'Personal Introduction',
  parents_family: 'Parents & Family',
  class_10: 'Class 10 Education',
  class_12: 'Class 12 Education',
  diploma: 'Diploma & Other Qualifications',
  bachelors: "Bachelor's / B.Tech",
  education_gaps: 'Academic Gaps & Backlogs',
  work_experience: 'Work Experience',
  country_university: 'Country & University',
  course: 'Course Knowledge',
  financial: 'Financial Background',
  part_time_job: 'Part-Time Job Scenarios',
  future_plans: 'Future Career Plans',
  difficult_questions: 'Difficult Questions',
};

export interface SiblingInfo {
  name: string;
  education: string;
  occupation: string;
}

export interface DiplomaQualification {
  id: string;
  institutionName: string;
  location: string;
  courseName: string;
  specialization: string;
  startYear: string;
  completionYear: string;
  duration: string;
  marksOrCgpa: string;
  subjects: string;
  skillsLearned: string;
  reasonForCourse: string;
  furtherStudyAfterDiploma: string;
}

export interface AcademicProject {
  id: string;
  title: string;
  description: string;
  technologies: string;
  role: string;
  learned: string;
}

export interface WorkExperienceItem {
  id: string;
  companyName: string;
  jobTitle: string;
  jobType: 'Full-time' | 'Part-time' | 'Internship';
  startDate: string;
  endDate: string;
  duration: string;
  responsibilities: string;
  skills: string;
  salary: string;
  reasonForLeaving: string;
  currentlyEmployed: boolean;
}

export interface UniversityOption {
  id: string;
  name: string;
  location: string;
  courseName: string;
  whyCompared: string;
}

export interface StudentProfile {
  personal: {
    fullName: string;
    fatherFullName: string;
    motherFullName: string;
    dateOfBirth: string;
    gender: string;
    citizenship: string;
    passportCountry: string;
    passportExpiry: string;
    city: string;
    state: string;
    country: string;
    nativeLanguage: string;
    preferredPracticeLanguage: string;
    email: string;
    phone: string;
  };
  family: {
    fatherOccupation: string;
    fatherCompany: string;
    fatherIncome: string;
    fatherEducation: string;
    motherOccupation: string;
    motherEducation: string;
    motherIncome: string;
    totalFamilyMembers: string;
    numberOfSiblings: string;
    siblings: SiblingInfo[];
    familyLocation: string;
    familyResponsibilities: string;
    familyBackgroundSummary: string;
    sponsoringEducation: string;
    parentsSupporting: 'Yes' | 'Partially' | 'No';
    hasRelativesAbroad: boolean;
    relativesAbroadCountry: string;
    relativesRelationship: string;
    homeCountryTies: string;
  };
  class10: {
    schoolName: string;
    schoolLocation: string;
    board: 'CBSE' | 'ICSE' | 'State Board' | 'Other';
    boardOther: string;
    passingYear: string;
    score: string;
    mainSubjects: string;
    achievements: string;
    reasonForSchool: string;
    hasGapAfter10: boolean;
    gapExplanation: string;
  };
  class12: {
    schoolName: string;
    schoolLocation: string;
    board: string;
    stream: 'Science' | 'Commerce' | 'Arts' | 'Other';
    subjects: string;
    passingYear: string;
    score: string;
    achievements: string;
    reasonForStream: string;
    hasGapAfter12: boolean;
    gapExplanation: string;
  };
  diplomas: {
    hasDiploma: boolean;
    items: DiplomaQualification[];
  };
  bachelors: {
    hasBachelors: boolean;
    collegeName: string;
    universityName: string;
    collegeLocation: string;
    degreeName: string;
    branch: string;
    courseDuration: string;
    admissionYear: string;
    graduationYear: string;
    currentYearOrSemester: string;
    cgpaOrPercentage: string;
    currentBacklogs: string;
    previousBacklogs: string;
    clearedBacklogs: string;
    academicAchievements: string;
    reasonForDegree: string;
    favoriteSubjects: string;
    skillsDeveloped: string;
    isBtech: boolean;
    btechBranch: 'CSE' | 'IT' | 'ECE' | 'Mechanical' | 'Civil' | 'Electrical' | 'Other';
    programmingLanguages: string;
    technicalSkills: string;
    finalYearProject: string;
    projects: AcademicProject[];
    internships: string;
    industrialTraining: string;
    certifications: string;
    hackathons: string;
    workshops: string;
    research: string;
    practicalExperience: string;
  };
  gapsAndBacklogs: {
    hasEducationGap: boolean;
    hasFailedSubjects: boolean;
    hasBacklogs: boolean;
    hasCourseChange: boolean;
    hasCollegeChange: boolean;
    hasDelayedGraduation: boolean;
    fromYear: string;
    toYear: string;
    duration: string;
    reason: string;
    activitiesDuringPeriod: string;
    coursesOrTraining: string;
    employmentDuringGap: string;
    familyResponsibilities: string;
    examPreparation: string;
    explanation: string;
  };
  workExperience: {
    hasWorkExperience: boolean;
    items: WorkExperienceItem[];
  };
  studyAbroad: {
    destinationCountry: string;
    visaType: string;
    universityName: string;
    universityLocation: string;
    courseName: string;
    degreeLevel: string;
    courseDuration: string;
    intake: string;
    startDate: string;
    tuitionFees: string;
    scholarship: string;
    depositPaid: string;
    accommodationPlan: string;
    universityRankingOrResearch: string;
    otherUniversitiesConsidered: string;
    comparedUniversities: UniversityOption[];
    whyThisCountry: string;
    whyThisUniversity: string;
    whyThisCourse: string;
    howSelectedUniversity: string;
    relationToPreviousEducation: string;
    subjectsToStudy: string;
    careerOpportunities: string;
    whyNotHomeCountry: string;
  };
  financial: {
    primarySponsor: string;
    sponsorFullName: string;
    relationshipToStudent: string;
    sponsorOccupation: string;
    sponsorIncome: string;
    sourceOfFunds: string;
    familySavings: string;
    educationLoan: string;
    scholarshipAmount: string;
    otherFundingSources: string;
    tuitionFee: string;
    tuitionPaid: string;
    remainingTuition: string;
    estimatedLivingExpenses: string;
    accommodationExpenses: string;
    insurance: string;
    financialSupportPlan: string;
    dependingOnPartTimeIncome: 'No' | 'Supplementary Only' | 'Unsure';
  };
  careerPlans: {
    desiredJobRole: string;
    careerField: string;
    longTermGoal: string;
    desiredIndustry: string;
    skillsToDevelop: string;
    plansAfterGraduation: string;
    howCourseHelps: string;
    intendedCareerLocation: string;
    homeCountryOpportunities: string;
  };
}

export interface SpeechMetrics {
  durationSeconds: number;
  wordCount: number;
  wordsPerMinute: number;
  fillerWordCount: number;
  fillerWordsFound: string[];
}

export interface AnswerEvaluation {
  scores: {
    relevance: number;
    clarity: number;
    confidence: number;
    personalization: number;
    completeness: number;
  };
  overallTurnScore: number;
  whatYouDidWell: string;
  weaknesses: string[];
  missingPoints: string[];
  improvedSampleAnswer: string;
  confidenceTip: string;
  coachFeedbackMessage: string;
  needsRetryRecommended: boolean;
  contradictionDetected: string | null;
  followUpQuestion: string | null;
}

export interface InterviewTurn {
  id: number;
  sessionId: string;
  turnIndex: number;
  category: QuestionCategoryKey;
  questionText: string;
  studentAnswer: string;
  attemptNumber: number;
  evaluation: AnswerEvaluation;
  speechMetrics: SpeechMetrics | null;
  createdAt: string;
}

export interface FinalInterviewReport {
  overallReadinessScore: number;
  readinessSummary: string;
  categoryScores: {
    personalIntroduction: number;
    familyBackground: number;
    educationBackground: number;
    class10And12: number;
    graduationKnowledge: number;
    courseKnowledge: number;
    universityKnowledge: number;
    financialAnswers: number;
    careerPlans: number;
    communication: number;
    confidence: number;
    consistency: number;
  };
  strongestAnswers: Array<{
    question: string;
    excerpt: string;
    whyItWorked: string;
  }>;
  answersToImprove: Array<{
    question: string;
    studentAnswer: string;
    issue: string;
    howToStrengthen: string;
  }>;
  profileBasedWeaknesses: string[];
  questionsStruggledWith: string[];
  communicationFeedback: {
    speakingClearly: string;
    avoidingLongAnswers: string;
    answeringDirectly: string;
    avoidingRoboticResponses: string;
    maintainingConfidence: string;
  };
  improvementPlan: Array<{
    day: string;
    focus: string;
    tasks: string[];
  }>;
  weakCategories: QuestionCategoryKey[];
  finalChecklist: string[];
}

export interface InterviewSessionSummary {
  id: string;
  mode: InterviewMode;
  status: 'in_progress' | 'paused' | 'completed';
  currentQuestionIndex: number;
  totalQuestions: number;
  currentCategory: QuestionCategoryKey;
  currentQuestion: string;
  overallScore: number | null;
  focusCategories: QuestionCategoryKey[];
  createdAt: string;
  updatedAt: string;
}

export interface InterviewSessionDetail extends InterviewSessionSummary {
  turns: InterviewTurn[];
  report: FinalInterviewReport | null;
}

export interface VoiceSettings {
  autoReadQuestions: boolean;
  autoReadImprovedAnswers: boolean;
  speechRate: number;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  preferredLanguage: string;
  theme: 'light' | 'dark';
  voiceSettings: VoiceSettings;
}

export function calculateAgeFromDob(dob: string): number | null {
  if (!dob) return null;
  const parsed = new Date(dob);
  if (Number.isNaN(parsed.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - parsed.getFullYear();
  const m = today.getMonth() - parsed.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < parsed.getDate())) {
    age--;
  }
  return age >= 0 && age <= 100 ? age : null;
}

export function createEmptyProfile(email = '', fullName = ''): StudentProfile {
  return {
    personal: {
      fullName,
      fatherFullName: '',
      motherFullName: '',
      dateOfBirth: '',
      gender: '',
      citizenship: '',
      passportCountry: '',
      passportExpiry: '',
      city: '',
      state: '',
      country: '',
      nativeLanguage: '',
      preferredPracticeLanguage: 'English',
      email,
      phone: '',
    },
    family: {
      fatherOccupation: '',
      fatherCompany: '',
      fatherIncome: '',
      fatherEducation: '',
      motherOccupation: '',
      motherEducation: '',
      motherIncome: '',
      totalFamilyMembers: '',
      numberOfSiblings: '0',
      siblings: [],
      familyLocation: '',
      familyResponsibilities: '',
      familyBackgroundSummary: '',
      sponsoringEducation: 'Parents',
      parentsSupporting: 'Yes',
      hasRelativesAbroad: false,
      relativesAbroadCountry: '',
      relativesRelationship: '',
      homeCountryTies: '',
    },
    class10: {
      schoolName: '',
      schoolLocation: '',
      board: 'CBSE',
      boardOther: '',
      passingYear: '',
      score: '',
      mainSubjects: '',
      achievements: '',
      reasonForSchool: '',
      hasGapAfter10: false,
      gapExplanation: '',
    },
    class12: {
      schoolName: '',
      schoolLocation: '',
      board: 'CBSE',
      stream: 'Science',
      subjects: '',
      passingYear: '',
      score: '',
      achievements: '',
      reasonForStream: '',
      hasGapAfter12: false,
      gapExplanation: '',
    },
    diplomas: {
      hasDiploma: false,
      items: [],
    },
    bachelors: {
      hasBachelors: true,
      collegeName: '',
      universityName: '',
      collegeLocation: '',
      degreeName: '',
      branch: '',
      courseDuration: '4 years',
      admissionYear: '',
      graduationYear: '',
      currentYearOrSemester: '',
      cgpaOrPercentage: '',
      currentBacklogs: '0',
      previousBacklogs: '0',
      clearedBacklogs: '0',
      academicAchievements: '',
      reasonForDegree: '',
      favoriteSubjects: '',
      skillsDeveloped: '',
      isBtech: false,
      btechBranch: 'CSE',
      programmingLanguages: '',
      technicalSkills: '',
      finalYearProject: '',
      projects: [],
      internships: '',
      industrialTraining: '',
      certifications: '',
      hackathons: '',
      workshops: '',
      research: '',
      practicalExperience: '',
    },
    gapsAndBacklogs: {
      hasEducationGap: false,
      hasFailedSubjects: false,
      hasBacklogs: false,
      hasCourseChange: false,
      hasCollegeChange: false,
      hasDelayedGraduation: false,
      fromYear: '',
      toYear: '',
      duration: '',
      reason: '',
      activitiesDuringPeriod: '',
      coursesOrTraining: '',
      employmentDuringGap: '',
      familyResponsibilities: '',
      examPreparation: '',
      explanation: '',
    },
    workExperience: {
      hasWorkExperience: false,
      items: [],
    },
    studyAbroad: {
      destinationCountry: '',
      visaType: '',
      universityName: '',
      universityLocation: '',
      courseName: '',
      degreeLevel: "Master's",
      courseDuration: '',
      intake: '',
      startDate: '',
      tuitionFees: '',
      scholarship: '',
      depositPaid: '',
      accommodationPlan: '',
      universityRankingOrResearch: '',
      otherUniversitiesConsidered: '',
      comparedUniversities: [],
      whyThisCountry: '',
      whyThisUniversity: '',
      whyThisCourse: '',
      howSelectedUniversity: '',
      relationToPreviousEducation: '',
      subjectsToStudy: '',
      careerOpportunities: '',
      whyNotHomeCountry: '',
    },
    financial: {
      primarySponsor: 'Father',
      sponsorFullName: '',
      relationshipToStudent: 'Father',
      sponsorOccupation: '',
      sponsorIncome: '',
      sourceOfFunds: '',
      familySavings: '',
      educationLoan: '',
      scholarshipAmount: '',
      otherFundingSources: '',
      tuitionFee: '',
      tuitionPaid: '',
      remainingTuition: '',
      estimatedLivingExpenses: '',
      accommodationExpenses: '',
      insurance: '',
      financialSupportPlan: '',
      dependingOnPartTimeIncome: 'No',
    },
    careerPlans: {
      desiredJobRole: '',
      careerField: '',
      longTermGoal: '',
      desiredIndustry: '',
      skillsToDevelop: '',
      plansAfterGraduation: '',
      howCourseHelps: '',
      intendedCareerLocation: '',
      homeCountryOpportunities: '',
    },
  };
}

export function createSampleStudentProfile(email = 'aarav.sharma@example.com'): StudentProfile {
  return {
    personal: {
      fullName: 'Aarav Sharma',
      fatherFullName: 'Rajesh Sharma',
      motherFullName: 'Sunita Sharma',
      dateOfBirth: '2002-08-14',
      gender: 'Male',
      citizenship: 'Indian',
      passportCountry: 'India',
      passportExpiry: '2032-05',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      nativeLanguage: 'Hindi',
      preferredPracticeLanguage: 'English',
      email,
      phone: '+91 98200 12345',
    },
    family: {
      fatherOccupation: 'Civil Contractor & Business Owner',
      fatherCompany: 'Sharma Infrastructure Services',
      fatherIncome: 'INR 22,00,000 / year',
      fatherEducation: 'B.E. Civil Engineering',
      motherOccupation: 'Senior High School Mathematics Teacher',
      motherEducation: 'M.Sc. Mathematics, B.Ed.',
      motherIncome: 'INR 9,50,000 / year',
      totalFamilyMembers: '4',
      numberOfSiblings: '1',
      siblings: [
        {
          name: 'Ananya Sharma',
          education: 'B.Com (Final Year)',
          occupation: 'Undergraduate Student in Pune',
        },
      ],
      familyLocation: 'Pune, Maharashtra, India',
      familyResponsibilities: 'Supporting parents and managing family agricultural/residential property in Pune.',
      familyBackgroundSummary: 'Close-knit academic and engineering-oriented family based in Pune for over 25 years.',
      sponsoringEducation: 'Parents (Father & Mother) + Sanctioned Education Loan',
      parentsSupporting: 'Yes',
      hasRelativesAbroad: false,
      relativesAbroadCountry: '',
      relativesRelationship: '',
      homeCountryTies: 'Parents, younger sister, family home, and father’s established infrastructure firm in Pune.',
    },
    class10: {
      schoolName: 'Delhi Public School, Pune',
      schoolLocation: 'Pune, Maharashtra',
      board: 'CBSE',
      boardOther: '',
      passingYear: '2018',
      score: '91.4%',
      mainSubjects: 'Mathematics, Science, Social Science, English, Hindi',
      achievements: 'School Science Olympiad Silver Medalist',
      reasonForSchool: 'Strong STEM curriculum and structured CBSE preparation.',
      hasGapAfter10: false,
      gapExplanation: '',
    },
    class12: {
      schoolName: 'Delhi Public School, Pune',
      schoolLocation: 'Pune, Maharashtra',
      board: 'CBSE',
      stream: 'Science',
      subjects: 'Physics, Chemistry, Mathematics, Computer Science, English',
      passingYear: '2020',
      score: '88.6%',
      achievements: 'Top 5% in Computer Science practical project',
      reasonForStream: 'Interest in software systems, algorithms, and quantitative problem solving.',
      hasGapAfter12: false,
      gapExplanation: '',
    },
    diplomas: {
      hasDiploma: false,
      items: [],
    },
    bachelors: {
      hasBachelors: true,
      collegeName: 'Pune Institute of Computer Technology (PICT)',
      universityName: 'Savitribai Phule Pune University',
      collegeLocation: 'Pune, Maharashtra',
      degreeName: 'Bachelor of Engineering (B.E.) / B.Tech',
      branch: 'Computer Science and Engineering',
      courseDuration: '4 years',
      admissionYear: '2020',
      graduationYear: '2024',
      currentYearOrSemester: 'Graduated (2024)',
      cgpaOrPercentage: '8.42 CGPA',
      currentBacklogs: '0',
      previousBacklogs: '1',
      clearedBacklogs: '1',
      academicAchievements: 'Finalist at Smart India Hackathon 2023',
      reasonForDegree: 'Wanted a strong foundation in algorithms, databases, and distributed software engineering.',
      favoriteSubjects: 'Database Management Systems, Machine Learning, Computer Networks',
      skillsDeveloped: 'System design, backend API engineering, Python data pipelines, team collaboration',
      isBtech: true,
      btechBranch: 'CSE',
      programmingLanguages: 'Python, TypeScript, Java, SQL',
      technicalSkills: 'PostgreSQL, FastAPI, Docker, PyTorch, React',
      finalYearProject: 'Real-Time Traffic Congestion Prediction Using Graph Neural Networks',
      projects: [
        {
          id: 'proj-1',
          title: 'Real-Time Traffic Congestion Prediction Using Graph Neural Networks',
          description: 'Built a spatio-temporal forecasting pipeline predicting urban junction bottlenecks 30 minutes ahead.',
          technologies: 'Python, PyTorch Geometric, FastAPI, PostgreSQL',
          role: 'Lead Backend & ML Pipeline Developer',
          learned: 'Handling noisy time-series sensor streams and evaluating model latency under load.',
        },
      ],
      internships: '6-month Software Engineering Intern at Persistent Systems, Pune (Jan 2024 – Jun 2024)',
      industrialTraining: 'Cloud Data Engineering Bootcamp (8 weeks)',
      certifications: 'AWS Certified Cloud Practitioner',
      hackathons: 'Smart India Hackathon 2023 Finalist',
      workshops: 'Applied NLP & Vector Search Workshop at SPPU',
      research: 'Co-authored departmental symposium paper on urban mobility forecasting',
      practicalExperience: 'Built and deployed production REST APIs during internship.',
    },
    gapsAndBacklogs: {
      hasEducationGap: false,
      hasFailedSubjects: false,
      hasBacklogs: true,
      hasCourseChange: false,
      hasCollegeChange: false,
      hasDelayedGraduation: false,
      fromYear: '2022',
      toYear: '2022',
      duration: '1 semester',
      reason: 'Had 1 backlog in Engineering Mathematics III during Semester 3 due to dengue fever during exams.',
      activitiesDuringPeriod: 'Recovered health and continued regular coursework.',
      coursesOrTraining: 'Completed remedial problem-solving sessions.',
      employmentDuringGap: '',
      familyResponsibilities: '',
      examPreparation: 'Reappeared in the very next examination cycle.',
      explanation: 'I missed one semester exam due to hospitalized dengue fever, recovered, and cleared the subject on my next attempt with a B+ grade without delaying graduation.',
    },
    workExperience: {
      hasWorkExperience: true,
      items: [
        {
          id: 'work-1',
          companyName: 'Persistent Systems',
          jobTitle: 'Junior Data & Backend Engineer',
          jobType: 'Full-time',
          startDate: '2024-07',
          endDate: 'Present',
          duration: '1 year 4 months',
          responsibilities: 'Developing ETL microservices in Python, optimizing SQL queries, and maintaining enterprise analytics dashboards.',
          skills: 'Python, SQL, Apache Airflow, AWS, API reliability',
          salary: 'INR 7,50,000 / year',
          reasonForLeaving: 'Leaving to pursue specialized Master’s study in Data Science & Distributed Systems.',
          currentlyEmployed: true,
        },
      ],
    },
    studyAbroad: {
      destinationCountry: 'United States',
      visaType: 'F-1 Student Visa',
      universityName: 'Northeastern University',
      universityLocation: 'Boston, Massachusetts',
      courseName: 'MS in Data Science',
      degreeLevel: "Master's",
      courseDuration: '2 years (32 credits)',
      intake: 'Fall 2027',
      startDate: 'September 2027',
      tuitionFees: '$58,400 total (~$29,200/year)',
      scholarship: '$6,000 Dean’s Merit Scholarship',
      depositPaid: '$1,000 enrollment deposit paid',
      accommodationPlan: 'Shared off-campus graduate housing near Huntington Ave ($1,150/month)',
      universityRankingOrResearch: 'Khoury College of Computer Sciences co-op curriculum and applied machine learning labs.',
      otherUniversitiesConsidered: 'University of Illinois Chicago, Arizona State University',
      comparedUniversities: [
        {
          id: 'uni-1',
          name: 'Arizona State University',
          location: 'Tempe, AZ',
          courseName: 'MS in Data Science, Analytics & Engineering',
          whyCompared: 'Admitted, but Northeastern offered stronger core statistical ML electives and Boston healthcare/fintech research proximity.',
        },
      ],
      whyThisCountry: 'The US offers structured interdisciplinary graduate curricula with hands-on research labs and global engineering standards.',
      whyThisUniversity: 'Northeastern’s Khoury College combines rigorous statistical theory with applied systems courses like Large-Scale Information Storage.',
      whyThisCourse: 'After working 16 months on ETL pipelines, I want formal depth in scalable machine learning and distributed data engineering.',
      howSelectedUniversity: 'Evaluated course syllabi, faculty research in spatio-temporal ML, alumni outcomes, and total net tuition.',
      relationToPreviousEducation: 'Directly builds on my B.E. in Computer Science (DBMS, ML, final-year GNN project) and backend engineering role.',
      subjectsToStudy: 'Supervised Machine Learning, Algorithms, Data Management & Processing, Unsupervised Learning',
      careerOpportunities: 'Senior Data Engineer, Applied ML Engineer, or Data Architect roles in enterprise tech and analytics firms.',
      whyNotHomeCountry: 'I want exposure to specialized graduate electives in scalable distributed ML and global cross-disciplinary lab research.',
    },
    financial: {
      primarySponsor: 'Father & Education Loan',
      sponsorFullName: 'Rajesh Sharma',
      relationshipToStudent: 'Father',
      sponsorOccupation: 'Civil Contractor & Business Owner',
      sponsorIncome: 'INR 31,50,000 combined parents income / year',
      sourceOfFunds: 'Sanctioned HDFC Credila education loan + family fixed deposits & liquid savings',
      familySavings: 'INR 32,00,000 (~$38,000) in liquid bank savings and fixed deposits',
      educationLoan: 'INR 45,00,000 (~$53,500) sanctioned non-collateral/collateral education loan',
      scholarshipAmount: '$6,000 merit scholarship',
      otherFundingSources: 'Personal savings from 16 months of engineering employment (~INR 4,50,000)',
      tuitionFee: '$58,400 total',
      tuitionPaid: '$1,000 deposit paid',
      remainingTuition: '$51,400 after scholarship & deposit',
      estimatedLivingExpenses: '$18,000 / year',
      accommodationExpenses: '$13,800 / year',
      insurance: '$2,400 / year university health plan',
      financialSupportPlan: 'Full first- and second-year tuition plus living costs are covered via the sanctioned education loan and verified family liquid savings without needing part-time earnings.',
      dependingOnPartTimeIncome: 'No',
    },
    careerPlans: {
      desiredJobRole: 'Senior Data Engineer / Applied Machine Learning Engineer',
      careerField: 'Data Science & Distributed Systems',
      longTermGoal: 'Lead enterprise data platforms and AI infrastructure teams in India’s growing fintech and mobility tech sector.',
      desiredIndustry: 'Enterprise SaaS, Mobility Analytics, Financial Technology',
      skillsToDevelop: 'Distributed ML systems, causal inference, scalable streaming architectures',
      plansAfterGraduation: 'Apply my specialized data engineering expertise to large-scale analytics architecture and return to India to take up senior engineering leadership roles.',
      howCourseHelps: 'Bridges the gap between basic backend ETL work and designing production-grade distributed machine learning systems.',
      intendedCareerLocation: 'India (Pune / Bengaluru tech hubs) after optional academic training if eligible',
      homeCountryOpportunities: 'Major Indian technology hubs and global capability centers in Pune and Bengaluru are actively hiring MS-trained data architects.',
    },
  };
}

export function calculateProfileCompletion(profile: StudentProfile): number {
  const checks = [
    Boolean(profile.personal.fullName.trim()),
    Boolean(profile.personal.dateOfBirth.trim()),
    Boolean(profile.personal.citizenship.trim()),
    Boolean(profile.personal.city.trim() && profile.personal.country.trim()),
    Boolean(profile.personal.fatherFullName.trim() && profile.personal.motherFullName.trim()),
    Boolean(profile.family.fatherOccupation.trim()),
    Boolean(profile.family.homeCountryTies.trim()),
    Boolean(profile.class10.schoolName.trim() && profile.class10.score.trim()),
    Boolean(profile.class12.schoolName.trim() && profile.class12.score.trim()),
    Boolean(!profile.bachelors.hasBachelors || (profile.bachelors.collegeName.trim() && profile.bachelors.degreeName.trim())),
    Boolean(profile.studyAbroad.destinationCountry.trim() && profile.studyAbroad.universityName.trim()),
    Boolean(profile.studyAbroad.courseName.trim() && profile.studyAbroad.whyThisCourse.trim()),
    Boolean(profile.financial.primarySponsor.trim() && profile.financial.sourceOfFunds.trim()),
    Boolean(profile.financial.tuitionFee.trim() && profile.financial.estimatedLivingExpenses.trim()),
    Boolean(profile.careerPlans.desiredJobRole.trim() && profile.careerPlans.plansAfterGraduation.trim()),
  ];
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}
