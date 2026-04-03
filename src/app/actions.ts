"use server";

import { FieldType, ResumeFormat, SessionStatus } from "@prisma/client";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";

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
  const resumeText = readValue(formData, "resumeText");

  if (!field || !jobTitle || !jobDescription || !resumeText) {
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
        fileName: "pasted-resume.txt",
        format: ResumeFormat.TEXT,
        rawText: resumeText,
        parsedText: resumeText,
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

    redirect(`/interview/session/${session.id}`);
  } catch {
    redirect("/?error=save-failed");
  }
}
