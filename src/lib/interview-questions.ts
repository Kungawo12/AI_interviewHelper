import { DifficultyLevel, FieldType, QuestionCategory } from "@prisma/client";

export type InterviewDifficulty = "easy" | "medium" | "hard";

type QuestionDraft = {
  questionText: string;
  fingerprint: string;
  category: QuestionCategory;
  difficulty: DifficultyLevel;
  sourceNotes: string;
};

function normalizeFingerprint(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function pickFieldFocus(field: FieldType) {
  switch (field) {
    case FieldType.TECHNOLOGY:
      return "technical depth, problem solving, and shipping production-quality work";
    case FieldType.SERVICE:
      return "customer care, reliability, and handling fast-paced situations";
    case FieldType.MEDICAL:
      return "patient safety, communication, and calm decision-making";
    case FieldType.EDUCATION:
      return "classroom communication, student support, and practical planning";
    default:
      return "role fit, communication, and practical impact";
  }
}

// Determine company tier to scale question count for Hard interviews
function getCompanyTier(companyName: string | null | undefined): "top" | "large" | "standard" {
  if (!companyName) return "standard";
  const n = companyName.toLowerCase().trim();
  const top = /google|amazon|microsoft|apple|meta|facebook|netflix|openai|anthropic|uber|airbnb|stripe|palantir|databricks|tiktok|bytedance|salesforce|oracle|ibm|intel|goldman|jpmorgan|morgan stanley|blackrock|mayo clinic|cleveland clinic|johns hopkins/;
  const large = /tesla|linkedin|adobe|atlassian|shopify|spotify|lyft|doordash|coinbase|target|walmart|cvs|walgreens|marriott|hilton|deloitte|accenture|pwc|kpmg|mckinsey|bain|bcg|siemens|samsung|sony|toyota|bosch/;
  if (top.test(n)) return "top";
  if (large.test(n)) return "large";
  return "standard";
}

// Dynamic question count: company reputation × difficulty
export function getInterviewQuestionCount(
  difficulty: InterviewDifficulty,
  companyName: string | null | undefined,
): number {
  const tier = getCompanyTier(companyName);
  const map: Record<InterviewDifficulty, Record<"top" | "large" | "standard", number>> = {
    easy:   { top: 5, large: 4, standard: 4 },
    medium: { top: 8, large: 7, standard: 6 },
    hard:   { top: 12, large: 10, standard: 8 },
  };
  return map[difficulty][tier];
}

export function generateInterviewQuestions(input: {
  field: FieldType;
  jobTitle: string;
  companyName?: string | null;
  jobDescription: string;
  resumeText: string;
  difficulty?: InterviewDifficulty;
}): QuestionDraft[] {
  const { field, jobTitle, companyName, jobDescription, resumeText, difficulty = "medium" } = input;
  const companyContext = companyName ? ` at ${companyName}` : "";
  const fieldFocus = pickFieldFocus(field);
  const jobSnippet = jobDescription.split(".").slice(0, 2).join(".").trim();
  const resumeSignal = resumeText.split("\n").find((l) => l.trim().length > 20)?.trim();
  const count = getInterviewQuestionCount(difficulty, companyName);

  // ── Easy pool (surface-level, no technical depth) ────────────────────────
  const easyPool: Array<Omit<QuestionDraft, "fingerprint"> & { key: string }> = [
    {
      key: "intro",
      questionText: `Tell me about yourself and why you are interested in this ${jobTitle} role${companyContext}.`,
      category: QuestionCategory.BEHAVIORAL,
      difficulty: DifficultyLevel.EASY,
      sourceNotes: "Opening self-introduction.",
    },
    {
      key: "motivation",
      questionText: `What attracted you to${companyContext ? companyContext : " this company"} and why do you feel this role is the right next step for you?`,
      category: QuestionCategory.COMPANY_FIT,
      difficulty: DifficultyLevel.EASY,
      sourceNotes: "Motivation and company interest.",
    },
    {
      key: "strength",
      questionText: `What would you say is your greatest strength, and can you give a quick example of it in action?`,
      category: QuestionCategory.BEHAVIORAL,
      difficulty: DifficultyLevel.EASY,
      sourceNotes: "Strength with light evidence.",
    },
    {
      key: "easy-situation",
      questionText: `Tell me about a time you helped a colleague or team member with something. What happened?`,
      category: QuestionCategory.SITUATIONAL,
      difficulty: DifficultyLevel.EASY,
      sourceNotes: "Simple teamwork situation.",
    },
    {
      key: "goals",
      questionText: `Where do you see yourself professionally in the next two or three years, and how does this role fit that picture?`,
      category: QuestionCategory.BEHAVIORAL,
      difficulty: DifficultyLevel.EASY,
      sourceNotes: "Short-term career goals.",
    },
  ];

  // ── Medium pool (behavioral + situational + light role-specific) ──────────
  const mediumPool: Array<Omit<QuestionDraft, "fingerprint"> & { key: string }> = [
    {
      key: "intro",
      questionText: `Walk me through your background and what makes you the right fit for this ${jobTitle} opportunity${companyContext}.`,
      category: QuestionCategory.BEHAVIORAL,
      difficulty: DifficultyLevel.EASY,
      sourceNotes: "Opening narrative.",
    },
    {
      key: "resume-fit",
      questionText: `Which parts of your background best prepare you for this role, and how would you connect them to the team's needs?`,
      category: QuestionCategory.ROLE_SPECIFIC,
      difficulty: DifficultyLevel.MEDIUM,
      sourceNotes: resumeSignal ? `Resume signal: ${resumeSignal}` : "Resume-driven fit.",
    },
    {
      key: "challenge",
      questionText: `Describe a challenging situation you faced at work or school and walk me through how you resolved it.`,
      category: QuestionCategory.SITUATIONAL,
      difficulty: DifficultyLevel.MEDIUM,
      sourceNotes: "Challenge-resolution narrative.",
    },
    {
      key: "collaboration",
      questionText: `How do you handle working with teammates when priorities shift or pressure increases? Give a specific example.`,
      category: QuestionCategory.COMMUNICATION,
      difficulty: DifficultyLevel.MEDIUM,
      sourceNotes: "Teamwork under pressure.",
    },
    {
      key: "company-fit",
      questionText: `What draws you to${companyContext ? companyContext : " this company"} specifically, and what would you want the interviewer to remember about you after this conversation?`,
      category: QuestionCategory.COMPANY_FIT,
      difficulty: DifficultyLevel.MEDIUM,
      sourceNotes: "Company alignment.",
    },
    {
      key: "field-focus",
      questionText: `This role values ${fieldFocus}. Walk me through a real example that shows you can deliver in that area.`,
      category: QuestionCategory.ROLE_SPECIFIC,
      difficulty: DifficultyLevel.MEDIUM,
      sourceNotes: "Field-specific competency.",
    },
    {
      key: "improvement",
      questionText: `What is one skill you are actively improving right now, and how are you measuring your progress?`,
      category: QuestionCategory.BEHAVIORAL,
      difficulty: DifficultyLevel.MEDIUM,
      sourceNotes: "Growth mindset.",
    },
    {
      key: "closing",
      questionText: `If you joined this team next month, what would you prioritise in your first 30 to 60 days?`,
      category: QuestionCategory.COMPANY_FIT,
      difficulty: DifficultyLevel.MEDIUM,
      sourceNotes: "Entry impact plan.",
    },
  ];

  // ── Hard pool (technical depth + hard behavioral + pressure questions) ────
  const hardPool: Array<Omit<QuestionDraft, "fingerprint"> & { key: string }> = [
    {
      key: "intro",
      questionText: `Give me a concise but complete picture of your background — where you started, where you are now, and why you are sitting in this interview for a ${jobTitle} role${companyContext}.`,
      category: QuestionCategory.BEHAVIORAL,
      difficulty: DifficultyLevel.EASY,
      sourceNotes: "Structured self-narrative.",
    },
    {
      key: "resume-deep",
      questionText: `Looking at your experience, what is the most technically or professionally demanding thing you have delivered, and what made it hard?`,
      category: QuestionCategory.ROLE_SPECIFIC,
      difficulty: DifficultyLevel.HARD,
      sourceNotes: resumeSignal ? `Resume signal: ${resumeSignal}` : "Deep resume probe.",
    },
    {
      key: "technical-depth",
      questionText: `Based on this ${jobTitle} role, what do you see as the hardest technical or domain challenge in the first six months, and how would you approach it? Ground your answer in the job description: ${jobSnippet || "the role requirements"}.`,
      category: QuestionCategory.TECHNICAL,
      difficulty: DifficultyLevel.HARD,
      sourceNotes: "Job-description-grounded technical question.",
    },
    {
      key: "field-hard",
      questionText: `This role demands ${fieldFocus} at a high level. Describe a situation where you had to push past your existing knowledge to deliver. What did you do and what was the result?`,
      category: QuestionCategory.TECHNICAL,
      difficulty: DifficultyLevel.HARD,
      sourceNotes: "Field-specific depth.",
    },
    {
      key: "failure",
      questionText: `Tell me about a significant professional or academic failure. Be specific — what went wrong, what was your role in it, and what did you actually change as a result?`,
      category: QuestionCategory.BEHAVIORAL,
      difficulty: DifficultyLevel.HARD,
      sourceNotes: "Failure and accountability.",
    },
    {
      key: "conflict",
      questionText: `Describe a time you strongly disagreed with a manager, senior colleague, or client decision. How did you handle it and what was the outcome?`,
      category: QuestionCategory.BEHAVIORAL,
      difficulty: DifficultyLevel.HARD,
      sourceNotes: "Conflict resolution and candour.",
    },
    {
      key: "pressure-decision",
      questionText: `Walk me through a situation where you had to make a high-stakes decision quickly with limited information. What was the decision, how did you make it, and would you do anything differently?`,
      category: QuestionCategory.SITUATIONAL,
      difficulty: DifficultyLevel.HARD,
      sourceNotes: "Pressure and judgment.",
    },
    {
      key: "differentiation",
      questionText: `We are interviewing several strong candidates for this ${jobTitle} role. What makes you the one we should hire, and be specific — not generic.`,
      category: QuestionCategory.COMPANY_FIT,
      difficulty: DifficultyLevel.HARD,
      sourceNotes: "Differentiation under pressure.",
    },
    {
      key: "impact-plan",
      questionText: `If you start this role next month, describe your first 90 days in concrete terms — what you would learn, what you would deliver, and how you would measure whether you are succeeding.`,
      category: QuestionCategory.COMPANY_FIT,
      difficulty: DifficultyLevel.HARD,
      sourceNotes: "90-day impact plan.",
    },
    {
      key: "edge-case",
      questionText: `Describe a time when requirements or priorities changed significantly mid-project. How did you adapt without losing quality or missing key commitments?`,
      category: QuestionCategory.SITUATIONAL,
      difficulty: DifficultyLevel.HARD,
      sourceNotes: "Adaptability under change.",
    },
    {
      key: "collaboration-hard",
      questionText: `Tell me about the most difficult team dynamic you have worked in. How did you navigate it and keep things moving forward?`,
      category: QuestionCategory.COMMUNICATION,
      difficulty: DifficultyLevel.HARD,
      sourceNotes: "Hard team dynamics.",
    },
    {
      key: "ambiguity",
      questionText: `Give me an example of a time you had to drive a project or initiative without clear direction or authority. What did you do and how did it turn out?`,
      category: QuestionCategory.ROLE_SPECIFIC,
      difficulty: DifficultyLevel.HARD,
      sourceNotes: "Driving through ambiguity.",
    },
  ];

  const pool = difficulty === "easy" ? easyPool : difficulty === "hard" ? hardPool : mediumPool;
  const selected = pool.slice(0, count);

  return selected.map((draft) => ({
    questionText: draft.questionText,
    fingerprint: normalizeFingerprint(`${field}_${jobTitle}_${difficulty}_${draft.key}`),
    category: draft.category,
    difficulty: draft.difficulty,
    sourceNotes: draft.sourceNotes,
  }));
}
