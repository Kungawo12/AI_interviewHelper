"use server";

import { FieldType, ResumeFormat, SessionStatus } from "@prisma/client";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { generateInterviewQuestions } from "@/lib/interview-questions";
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
  const field = fieldTypeMap[fieldValue];
  const candidateName = readValue(formData, "candidateName");
  const email = readValue(formData, "email");
  const jobTitle = readValue(formData, "jobTitle");
  const companyName = readValue(formData, "companyName");
  const jobDescription = readValue(formData, "jobDescription");
  const pastedResumeText = readValue(formData, "resumeText");
  const resumeFile = formData.get("resumeFile");

  const uploadedResume =
    resumeFile instanceof File ? await parseResumeUpload(resumeFile) : null;
  const normalizedPastedResumeText = pastedResumeText.trim();
  const hasResumeInput =
    normalizedPastedResumeText.length > 0 || uploadedResume !== null;
  const resumeContent =
    uploadedResume?.parsedText || normalizedPastedResumeText || "";

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
        totalQuestions: 10,
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
