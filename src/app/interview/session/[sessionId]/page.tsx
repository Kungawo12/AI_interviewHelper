import Link from "next/link";
import { notFound } from "next/navigation";

import { InterviewProcess } from "@/components/interview-process";
import { Reveal } from "@/components/reveal";
import { db } from "@/lib/db";

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
      questions: {
        orderBy: {
          sequenceNumber: "asc",
        },
      },
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
              Your interview session is ready.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/76 sm:text-base">
              Move through the generated questions, draft answers, and use this
              page as the start of the real interview flow.
            </p>
          </div>
        </Reveal>

        <InterviewProcess
          sessionId={session.id}
          jobTitle={session.interviewProfile.jobTitle}
          companyName={session.interviewProfile.companyName}
          questions={session.questions}
        />

        <Reveal delay={260} className="glass-card flex flex-col gap-3 rounded-[1.6rem] border border-white/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Backend next step</p>
            <p className="text-sm leading-6 text-muted">
              Persist answers, add speech-to-text, and generate detailed
              AI feedback after each question.
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
