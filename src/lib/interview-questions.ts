import { DifficultyLevel, FieldType, QuestionCategory } from "@prisma/client";

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

export function generateInterviewQuestions(input: {
  field: FieldType;
  jobTitle: string;
  companyName?: string | null;
  jobDescription: string;
  resumeText: string;
}): QuestionDraft[] {
  const { field, jobTitle, companyName, jobDescription, resumeText } = input;
  const companyContext = companyName ? ` at ${companyName}` : "";
  const fieldFocus = pickFieldFocus(field);
  const jobSnippet = jobDescription.split(".").slice(0, 2).join(".").trim();
  const resumeSignal = resumeText
    .split("\n")
    .find((line) => line.trim().length > 20)?.trim();

  const drafts: Array<Omit<QuestionDraft, "fingerprint"> & { key: string }> = [
    {
      key: "intro",
      questionText: `Tell me about yourself and why you want this ${jobTitle} role${companyContext}.`,
      category: QuestionCategory.BEHAVIORAL,
      difficulty: DifficultyLevel.EASY,
      sourceNotes: "Opening motivation and self-introduction.",
    },
    {
      key: "resume-fit",
      questionText: `Which parts of your background best prepare you for this ${jobTitle} opportunity, and how would you connect them to the team's needs?`,
      category: QuestionCategory.ROLE_SPECIFIC,
      difficulty: DifficultyLevel.MEDIUM,
      sourceNotes: resumeSignal
        ? `Resume signal used: ${resumeSignal}`
        : "Resume-driven fit question.",
    },
    {
      key: "field-focus",
      questionText: `This role appears to value ${fieldFocus}. Walk me through a real example that proves you can deliver in that area.`,
      category: QuestionCategory.ROLE_SPECIFIC,
      difficulty: DifficultyLevel.MEDIUM,
      sourceNotes: "Field-specific competency question.",
    },
    {
      key: "company-fit",
      questionText: `What makes you a strong fit for this team${companyContext}, and what would you want the interviewer to remember about you after this conversation?`,
      category: QuestionCategory.COMPANY_FIT,
      difficulty: DifficultyLevel.MEDIUM,
      sourceNotes: "Company alignment and positioning.",
    },
    {
      key: "challenge",
      questionText: `Describe a challenging situation related to your work or studies and how you handled it from start to finish.`,
      category: QuestionCategory.SITUATIONAL,
      difficulty: DifficultyLevel.MEDIUM,
      sourceNotes: "Challenge-response narrative.",
    },
    {
      key: "decision",
      questionText: `Tell me about a time you had to make a decision with incomplete information. What did you do and what was the outcome?`,
      category: QuestionCategory.BEHAVIORAL,
      difficulty: DifficultyLevel.MEDIUM,
      sourceNotes: "Decision-making under uncertainty.",
    },
    {
      key: "collaboration",
      questionText: `How do you collaborate with teammates when priorities shift or pressure increases? Give a concrete example.`,
      category: QuestionCategory.COMMUNICATION,
      difficulty: DifficultyLevel.MEDIUM,
      sourceNotes: "Communication and teamwork.",
    },
    {
      key: "job-specific",
      questionText: `Based on this role, what do you think would be the hardest part of succeeding as a ${jobTitle}, and how would you prepare for it?`,
      category: QuestionCategory.TECHNICAL,
      difficulty: DifficultyLevel.HARD,
      sourceNotes: jobSnippet
        ? `Job description context: ${jobSnippet}`
        : "Role challenge question.",
    },
    {
      key: "improvement",
      questionText: `What is one skill you are still actively improving, and how are you making measurable progress on it?`,
      category: QuestionCategory.BEHAVIORAL,
      difficulty: DifficultyLevel.MEDIUM,
      sourceNotes: "Growth mindset question.",
    },
    {
      key: "closing",
      questionText: `If you joined this role next month, what would you want to achieve in your first 90 days?`,
      category: QuestionCategory.COMPANY_FIT,
      difficulty: DifficultyLevel.HARD,
      sourceNotes: "Closing impact question.",
    },
  ];

  return drafts.map((draft) => ({
    questionText: draft.questionText,
    fingerprint: normalizeFingerprint(`${field}_${jobTitle}_${draft.key}`),
    category: draft.category,
    difficulty: draft.difficulty,
    sourceNotes: draft.sourceNotes,
  }));
}
