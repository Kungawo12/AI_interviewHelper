import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/reveal";
import { db } from "@/lib/db";

function buildPreviewQuestions(jobTitle: string, companyName?: string | null) {
  const companyContext = companyName ? ` at ${companyName}` : "";

  return [
    `Tell me about yourself and why you want this ${jobTitle} role${companyContext}.`,
    `Which skills from your background best prepare you for this ${jobTitle} position?`,
    `Describe a challenge you handled that shows you can succeed in this role.`,
  ];
}

function SessionLoadError() {
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <section className="mx-auto flex max-w-6xl flex-col gap-6 rounded-[2rem] border border-white/50 bg-white/50 p-6 shadow-[0_28px_90px_rgba(19,34,56,0.08)] backdrop-blur sm:p-8 lg:p-10">
        <Reveal className="rounded-[1.85rem] bg-[#10233c] p-6 text-white sm:p-8">
          <p className="w-fit rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/86">
            Session unavailable
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl tracking-[-0.05em] sm:text-5xl">
            The session page could not load from the database yet.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/76 sm:text-base">
            The most common production cause is that the deployed app is missing
            the hosted PostgreSQL connection or the schema has not been migrated.
          </p>
        </Reveal>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Reveal delay={120} className="glass-card rounded-[1.6rem] border border-white/60 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Check these first
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-foreground">
              <li>Set `DATABASE_URL` in Vercel using your hosted PostgreSQL project.</li>
              <li>Run Prisma migrations against the production database.</li>
              <li>Redeploy after the database is reachable.</li>
            </ul>
          </Reveal>

          <Reveal delay={200} className="glass-card rounded-[1.6rem] border border-white/60 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-highlight">
              What to do next
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-[1.2rem] bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
              >
                Return to setup
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

async function loadInterviewSession(sessionId: string) {
  return db.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      user: true,
      interviewProfile: true,
      resume: true,
    },
  });
}

export default async function InterviewSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  let session: Awaited<ReturnType<typeof loadInterviewSession>> = null;

  try {
    session = await loadInterviewSession(sessionId);
  } catch {
    return <SessionLoadError />;
  }

  if (!session) {
    notFound();
  }

  const previewQuestions = buildPreviewQuestions(
    session.interviewProfile.jobTitle,
    session.interviewProfile.companyName,
  );

  return (
    <main className="relative overflow-hidden px-5 py-8 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute left-[-6rem] top-16 h-56 w-56 rounded-full bg-[#ff8c61]/18 blur-3xl float-soft" />
      <div className="pointer-events-none absolute right-[-4rem] top-28 h-72 w-72 rounded-full bg-[#1c7891]/14 blur-3xl float-delayed" />

      <section className="mx-auto flex max-w-6xl flex-col gap-6 rounded-[2rem] border border-white/50 bg-white/48 p-6 shadow-[0_28px_90px_rgba(19,34,56,0.08)] backdrop-blur sm:p-8 lg:p-10">
        <Reveal className="rounded-[1.9rem] bg-[#10233c] p-6 text-white shadow-[0_26px_70px_rgba(16,35,60,0.3)] sm:p-8">
          <p className="w-fit rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/86">
            Interview session created
          </p>
          <div className="mt-5 space-y-3">
            <h1 className="max-w-3xl font-display text-4xl tracking-[-0.05em] sm:text-5xl">
              Your interview setup is saved and ready for question generation.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/76 sm:text-base">
              This preview confirms the saved role context and prepares the app
              for the next stage: generating the 10-question practice interview.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <Reveal delay={120} className="glass-card rounded-[1.65rem] border border-white/60 p-5">
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
          </Reveal>

          <Reveal delay={200} className="glass-card rounded-[1.65rem] border border-white/60 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-highlight">
              Interview preview
            </p>
            <div className="mt-4 space-y-4">
              <div className="rounded-[1.3rem] border border-line bg-white/72 px-4 py-4">
                <p className="text-sm font-semibold text-foreground">
                  Job specification
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {session.interviewProfile.jobDescription}
                </p>
              </div>

              <div className="rounded-[1.3rem] border border-line bg-white/72 px-4 py-4">
                <p className="text-sm font-semibold text-foreground">
                  Question preview
                </p>
                <ul className="mt-3 space-y-3 text-sm leading-6 text-muted">
                  {previewQuestions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[1.3rem] border border-[#ff8c61]/18 bg-[linear-gradient(180deg,rgba(255,124,73,0.08),rgba(255,255,255,0.74))] px-4 py-4">
                <p className="text-sm font-semibold text-foreground">
                  Resume captured
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {session.resume?.parsedText?.slice(0, 260) ??
                    "No resume text saved."}
                  {session.resume?.parsedText &&
                  session.resume.parsedText.length > 260
                    ? "..."
                    : ""}
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={260} className="glass-card flex flex-col gap-3 rounded-[1.6rem] border border-white/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Next build step</p>
            <p className="text-sm leading-6 text-muted">
              Generate all 10 questions, store them in the session, and begin
              the answer-and-feedback experience.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-[1.2rem] bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
          >
            Back to setup
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
