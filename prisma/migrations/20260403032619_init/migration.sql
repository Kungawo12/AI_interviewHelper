-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('TECHNOLOGY', 'SERVICE', 'MEDICAL', 'EDUCATION', 'OTHER');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('CREATED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "QuestionCategory" AS ENUM ('TECHNICAL', 'BEHAVIORAL', 'SITUATIONAL', 'ROLE_SPECIFIC', 'COMPANY_FIT', 'COMMUNICATION');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "ResumeFormat" AS ENUM ('TEXT', 'PDF', 'DOC', 'DOCX', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "field" "FieldType" NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "companyName" TEXT,
    "jobDescription" TEXT NOT NULL,
    "experienceLevel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT,
    "format" "ResumeFormat" NOT NULL DEFAULT 'TEXT',
    "storageUrl" TEXT,
    "rawText" TEXT,
    "parsedText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "interviewProfileId" TEXT NOT NULL,
    "resumeId" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'CREATED',
    "totalQuestions" INTEGER NOT NULL DEFAULT 10,
    "currentQuestion" INTEGER NOT NULL DEFAULT 1,
    "overallScore" INTEGER,
    "finalSummary" TEXT,
    "improvementPlan" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "category" "QuestionCategory" NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL DEFAULT 'MEDIUM',
    "sequenceNumber" INTEGER NOT NULL,
    "sourceNotes" TEXT,
    "repeatOfQuestionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "transcript" TEXT,
    "audioUrl" TEXT,
    "durationSeconds" INTEGER,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answerQuality" INTEGER,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "strengths" TEXT NOT NULL,
    "weaknesses" TEXT NOT NULL,
    "improvementSuggestions" TEXT NOT NULL,
    "idealAnswer" TEXT,
    "resourceLinks" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "field" "FieldType" NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "category" "QuestionCategory" NOT NULL,
    "companyName" TEXT,
    "lastAskedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timesAsked" INTEGER NOT NULL DEFAULT 1,
    "timesMissed" INTEGER NOT NULL DEFAULT 0,
    "lastScore" INTEGER,

    CONSTRAINT "QuestionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "InterviewProfile_userId_field_jobTitle_idx" ON "InterviewProfile"("userId", "field", "jobTitle");

-- CreateIndex
CREATE INDEX "Resume_userId_createdAt_idx" ON "Resume"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "InterviewSession_userId_status_createdAt_idx" ON "InterviewSession"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "InterviewSession_interviewProfileId_idx" ON "InterviewSession"("interviewProfileId");

-- CreateIndex
CREATE INDEX "Question_sessionId_category_idx" ON "Question"("sessionId", "category");

-- CreateIndex
CREATE INDEX "Question_fingerprint_idx" ON "Question"("fingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "Question_sessionId_sequenceNumber_key" ON "Question"("sessionId", "sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_questionId_key" ON "Answer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_answerId_key" ON "Feedback"("answerId");

-- CreateIndex
CREATE INDEX "QuestionHistory_userId_lastAskedAt_idx" ON "QuestionHistory"("userId", "lastAskedAt");

-- CreateIndex
CREATE INDEX "QuestionHistory_field_jobTitle_category_idx" ON "QuestionHistory"("field", "jobTitle", "category");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionHistory_userId_fingerprint_jobTitle_key" ON "QuestionHistory"("userId", "fingerprint", "jobTitle");

-- AddForeignKey
ALTER TABLE "InterviewProfile" ADD CONSTRAINT "InterviewProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_interviewProfileId_fkey" FOREIGN KEY ("interviewProfileId") REFERENCES "InterviewProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_repeatOfQuestionId_fkey" FOREIGN KEY ("repeatOfQuestionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionHistory" ADD CONSTRAINT "QuestionHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
