import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";

function buildPreviewQuestions(jobTitle: string, companyName?: string | null) {
  const companyContext = companyName ? ` at ${companyName}` : "";

  return [
    `Tell me about yourself and why you want this ${jobTitle} role${companyContext}.`,
    `Which skills from your background best prepare you for this ${jobTitle} position?`,
    `Describe a challenge you handled that shows you can succeed in this role.`,
  ];
}

export default async function InterviewSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const session = await db.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      user: true,
      interviewProfile: true,
      resume: true,
    },
  });

  if (!session) {
    notFound();
  }

  const previewQuestions = buildPreviewQuestions(
    session.interviewProfile.jobTitle,
    session.interviewProfile.companyName,
  );

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8f3ea_0%,#f4efe4_55%,#efe5d2_100%)] px-5 py-8 sm:px-8 lg:px-12">
      <section className="mx-auto flex max-w-6xl flex-col gap-6 rounded-[2rem] border border-line bg-panel-strong/95 p-6 shadow-[0_28px_90px_rgba(19,34,56,0.08)] sm:p-8 lg:p-10">
        <div className="flex flex-col gap-4 rounded-[1.75rem] bg-foreground px-6 py-7 text-white">
          <p className="w-fit rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em]">
            Interview session created
          </p>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Your interview setup has been saved and is ready for question generation.
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-white/78 sm:text-base">
              This page confirms the role context we saved. The next feature pass
              will generate the full 10-question interview and move the user into
              a live session flow.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[1.5rem] border border-line bg-panel p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Saved context
            </p>
            <dl className="mt-4 space-y-4 text-sm leading-6">
              <div>
                <dt className="font-semibold text-foreground">Candidate</dt>
                <dd className="text-muted">{session.user.name ?? "Candidate"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Field</dt>
                <dd className="text-muted">{session.interviewProfile.field}</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Job title</dt>
                <dd className="text-muted">{session.interviewProfile.jobTitle}</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Company</dt>
                <dd className="text-muted">
                  {session.interviewProfile.companyName || "Not specified yet"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Session ID</dt>
                <dd className="font-mono text-xs text-muted">{session.id}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[1.5rem] border border-line bg-panel-strong p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Interview preview
            </p>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-line bg-panel px-4 py-4">
                <p className="text-sm font-semibold text-foreground">
                  Job specification
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {session.interviewProfile.jobDescription}
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-panel px-4 py-4">
                <p className="text-sm font-semibold text-foreground">
                  Question preview
                </p>
                <ul className="mt-3 space-y-3 text-sm leading-6 text-muted">
                  {previewQuestions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-line bg-[linear-gradient(180deg,rgba(209,104,63,0.08),rgba(255,255,255,0.72))] px-4 py-4">
                <p className="text-sm font-semibold text-foreground">
                  Resume captured
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {session.resume?.parsedText?.slice(0, 260) ?? "No resume text saved."}
                  {session.resume?.parsedText && session.resume.parsedText.length > 260
                    ? "..."
                    : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-[1.5rem] border border-line bg-panel p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Next build step
            </p>
            <p className="text-sm leading-6 text-muted">
              Generate all 10 questions, store them in the session, and begin the
              answer-and-feedback experience.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
          >
            Back to setup
          </Link>
        </div>
      </section>
    </main>
  );
}
