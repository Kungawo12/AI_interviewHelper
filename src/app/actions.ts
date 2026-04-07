"use server";

import { FieldType, ResumeFormat, SessionStatus } from "@prisma/client";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { generateInterviewQuestions, getInterviewQuestionCount } from "@/lib/interview-questions";
import { parseResumeUpload } from "@/lib/resume";

const fieldTypeMap: Record<string, FieldType> = {
  technology: FieldType.TECHNOLOGY,
  service: FieldType.SERVICE,
  medical: FieldType.MEDICAL,
  education: FieldType.EDUCATION,
  other: FieldType.OTHER,
};

function readValue(formData: FormData, key: string) {
  return formData.get(key)?.toString().trim() ?? "";
}

function normalizeForComparison(value: string | null | undefined) {
  return value?.trim() || "";
}

export async function createInterviewSession(formData: FormData) {
  const fieldValue = readValue(formData, "field");
  let field = fieldTypeMap[fieldValue];
  const candidateName = readValue(formData, "candidateName");
  const email = readValue(formData, "email");
  let jobTitle = readValue(formData, "jobTitle");
  const companyName = readValue(formData, "companyName");
  const jobDescription = readValue(formData, "jobDescription");
  const pastedResumeText = readValue(formData, "resumeText");
  const resumeFile = formData.get("resumeFile");
  const useSavedProfile = formData.get("useSavedProfile") === "on";

  const difficultyValue = readValue(formData, "difficulty");
  const difficulty: "easy" | "medium" | "hard" =
    difficultyValue === "easy" ? "easy" : difficultyValue === "hard" ? "hard" : "medium";

  let uploadedResume =
    resumeFile instanceof File ? await parseResumeUpload(resumeFile) : null;
  let normalizedPastedResumeText = pastedResumeText.trim();
  let hasResumeInput =
    normalizedPastedResumeText.length > 0 || uploadedResume !== null;
  let resumeContent =
    uploadedResume?.parsedText || normalizedPastedResumeText || "";

  let savedProfile:
    | {
        field: FieldType;
        jobTitle: string;
        resumeText: string;
      }
    | null = null;

  if (useSavedProfile) {
    if (!email) {
      redirect("/?error=saved-profile-email-required");
    }

    const latestSession = await db.interviewSession.findFirst({
      where: {
        user: {
          email,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        interviewProfile: true,
        resume: true,
      },
    });

    const savedResumeText =
      latestSession?.resume?.parsedText || latestSession?.resume?.rawText || "";

    if (!latestSession || !savedResumeText) {
      redirect("/?error=saved-profile-not-found");
    }

    savedProfile = {
      field: latestSession.interviewProfile.field,
      jobTitle: latestSession.interviewProfile.jobTitle,
      resumeText: savedResumeText,
    };

    field = savedProfile.field;
    jobTitle = jobTitle || savedProfile.jobTitle;
    normalizedPastedResumeText = normalizedPastedResumeText || savedProfile.resumeText;
    resumeContent = resumeContent || savedProfile.resumeText;
    hasResumeInput = true;
    uploadedResume = null;
  }

  if (
    !field ||
    !jobTitle ||
    !companyName ||
    !jobDescription ||
    !hasResumeInput
  ) {
    redirect("/?error=missing-fields");
  }

  let sessionId: string | null = null;

  try {
    const duplicateIdentity =
      email.length > 0
        ? { user: { email } }
        : candidateName.length > 0
          ? { user: { email: null, name: candidateName } }
          : null;

    const duplicateResumeText = normalizeForComparison(
      resumeContent || normalizedPastedResumeText,
    );

    if (duplicateIdentity && duplicateResumeText) {
      const existingSession = await db.interviewSession.findFirst({
        where: {
          ...duplicateIdentity,
          interviewProfile: {
            field,
            jobTitle,
            companyName,
            jobDescription,
          },
          resume: {
            OR: [
              { parsedText: duplicateResumeText },
              { rawText: duplicateResumeText },
            ],
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (existingSession) {
        const params = new URLSearchParams({
          error: "duplicate-session",
          sessionId: existingSession.id,
        });

        redirect(`/?${params.toString()}`);
      }
    }

    const user =
      email.length > 0
        ? await db.user.upsert({
            where: { email },
            update: {
              name: candidateName || undefined,
            },
            create: {
              email,
              name: candidateName || "Candidate",
            },
          })
        : await db.user.create({
            data: {
              name: candidateName || "Guest Candidate",
            },
          });

    const interviewProfile = await db.interviewProfile.create({
      data: {
        userId: user.id,
        field,
        jobTitle,
        companyName: companyName || null,
        jobDescription,
        experienceLevel: difficulty,
      },
    });

    const resume = await db.resume.create({
      data: {
        userId: user.id,
        fileName: uploadedResume?.fileName ?? "pasted-resume.txt",
        format:
          uploadedResume?.format === "PDF"
            ? ResumeFormat.PDF
            : ResumeFormat.TEXT,
        rawText: uploadedResume?.rawText || normalizedPastedResumeText || null,
        parsedText: resumeContent || null,
      },
    });

    const session = await db.interviewSession.create({
      data: {
        userId: user.id,
        interviewProfileId: interviewProfile.id,
        resumeId: resume.id,
        status: SessionStatus.CREATED,
        totalQuestions: getInterviewQuestionCount(difficulty, companyName),
        currentQuestion: 1,
        startedAt: new Date(),
      },
    });

    const generatedQuestions = generateInterviewQuestions({
      field,
      jobTitle,
      companyName,
      jobDescription,
      resumeText: resumeContent,
      difficulty,
    });

    await db.question.createMany({
      data: generatedQuestions.map((question, index) => ({
        sessionId: session.id,
        questionText: question.questionText,
        fingerprint: question.fingerprint,
        category: question.category,
        difficulty: question.difficulty,
        sequenceNumber: index + 1,
        sourceNotes: question.sourceNotes,
      })),
    });
    sessionId = session.id;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNSUPPORTED_RESUME_FORMAT"
    ) {
      redirect("/?error=unsupported-resume-format");
    }

    redirect("/?error=save-failed");
  }

  if (!sessionId) {
    redirect("/?error=save-failed");
  }

  redirect(`/interview/session/${sessionId}`);
}
