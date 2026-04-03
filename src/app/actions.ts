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
  const resumeContent =
    uploadedResume?.parsedText || normalizedPastedResumeText || "";

  if (!field || !jobTitle || !jobDescription || !resumeContent) {
    redirect("/?error=missing-fields");
  }

  try {
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
        rawText: uploadedResume?.rawText ?? normalizedPastedResumeText,
        parsedText: resumeContent,
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

    redirect(`/interview/session/${session.id}`);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNSUPPORTED_RESUME_FORMAT"
    ) {
      redirect("/?error=unsupported-resume-format");
    }

    redirect("/?error=save-failed");
  }
}
