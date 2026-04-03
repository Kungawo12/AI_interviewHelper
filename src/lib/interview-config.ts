export const interviewFields = [
  {
    id: "technology",
    label: "Technology",
    description: "Software, IT support, data, product, cybersecurity, and engineering roles.",
  },
  {
    id: "service",
    label: "Service",
    description: "Hospitality, customer service, retail, logistics, and operations roles.",
  },
  {
    id: "medical",
    label: "Medical",
    description: "Clinical support, nursing, patient care, allied health, and medical admin roles.",
  },
  {
    id: "education",
    label: "Education",
    description: "Teaching, tutoring, student support, and school administration roles.",
  },
  {
    id: "other",
    label: "Other",
    description: "Any field that does not fit the main interview tracks yet.",
  },
] as const;

export const onboardingHighlights = [
  "Choose the field and target job title.",
  "Add company context and the job specification.",
  "Paste a resume or prepare for file upload next.",
  "Generate 10 tailored interview questions.",
  "Practice answers and get personalized feedback.",
] as const;

export const coachingSignals = [
  "Role-specific question mix",
  "Company-aware prompts",
  "Resume-grounded follow-ups",
  "Progress memory to reduce repeats",
] as const;

export const jobTitleSuggestions = [
  "Junior Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Product Designer",
  "Data Analyst",
  "Nursing Assistant",
  "Medical Receptionist",
  "Customer Service Representative",
  "Housekeeping Supervisor",
  "Elementary School Teacher",
] as const;

export const companySuggestions = [
  "Google",
  "Amazon",
  "Microsoft",
  "Airbnb",
  "Tesla",
  "Mayo Clinic",
  "Cleveland Clinic",
  "Marriott",
  "Hilton",
  "Target",
] as const;
