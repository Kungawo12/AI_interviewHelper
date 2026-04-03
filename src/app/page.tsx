import Link from "next/link";

import { InterviewScene } from "@/components/interview-scene";
import { InterviewSetupForm } from "@/components/interview-setup-form";
import {
  coachingSignals,
  tutorialSteps,
} from "@/lib/interview-config";

const errorMessages: Record<string, string> = {
  "missing-fields":
    "Please complete the required fields and provide a resume as PDF, TXT, or pasted text before creating an interview session.",
  "save-failed":
    "We could not save the interview setup. In deployment, this usually means the hosted PostgreSQL connection is missing or migrations have not been run yet.",
  "saved-profile-email-required":
    "Add the same email from your earlier session before using the saved profile option.",
  "saved-profile-not-found":
    "We could not find a saved profile for that email yet. Start with a full first session once, then you can reuse it later.",
  "duplicate-session":
    "This interview setup already exists in the database for you. Open the saved session instead of creating a duplicate.",
  "unsupported-resume-format":
    "Resume upload currently supports PDF and TXT files. You can also paste resume text directly.",
};

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; sessionId?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const error = params?.error ? errorMessages[params.error] : null;
  const existingSessionId = params?.sessionId || null;

  return (
    <main className="relative overflow-hidden px-5 py-6 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute left-[-7rem] top-16 h-60 w-60 rounded-full bg-[#ff8c61]/18 blur-3xl float-soft" />
      <div className="pointer-events-none absolute right-[-4rem] top-36 h-72 w-72 rounded-full bg-[#1c7891]/14 blur-3xl float-delayed" />

      <section className="mx-auto flex max-w-6xl flex-col gap-6 rounded-[2.3rem] border border-white/50 bg-white/44 p-4 shadow-[0_30px_120px_rgba(19,34,56,0.08)] backdrop-blur md:p-6 lg:p-8">
        <div className="glass-card rounded-[2rem] border border-white/60 p-6 shadow-[0_24px_70px_rgba(19,34,56,0.08)] sm:p-8 lg:p-10">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#10233c]/10 bg-[#10233c]/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#10233c]">
                AI Interview Helper
              </span>
              <span className="rounded-full bg-[#ff8c61]/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">
                New age interview practice
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl font-display text-4xl leading-[0.96] tracking-[-0.06em] text-foreground sm:text-5xl lg:text-6xl">
                New age interview practice.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-muted sm:text-lg">
                A sharper way to prepare with role-aware prompts, resume-driven
                context, and a more realistic interview flow.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {coachingSignals.map((signal) => (
                <div
                  key={signal}
                  className="rounded-[1.35rem] border border-line bg-white/72 px-4 py-4 text-sm leading-6 text-foreground"
                >
                  {signal}
                </div>
              ))}
            </div>

            <InterviewScene />
          </div>
        </div>

        <div className="glass-card rounded-[2rem] border border-white/60 p-6 shadow-[0_24px_70px_rgba(19,34,56,0.08)] sm:p-8 lg:p-10">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Build your session
            </p>
            <h2 className="font-display text-3xl tracking-[-0.05em] text-foreground sm:text-4xl">
              Create the interview setup.
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-muted sm:text-base">
              Enter the role, company, job details, and resume context. Use
              <span className="font-semibold text-foreground"> Tab </span>
              to accept suggestions in supported fields.
            </p>
          </div>

          <div className="mt-6 rounded-[1.7rem] border border-line bg-white/76 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              How it works
            </p>
            <div className="mt-4 grid gap-3">
              {tutorialSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-[1.3rem] border border-[#10233c]/8 bg-[#10233c]/4 px-4 py-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    Step {index + 1}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <InterviewSetupForm error={error} />

          {params?.error === "duplicate-session" && existingSessionId ? (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[1.4rem] border border-[#10233c]/10 bg-[#10233c]/6 px-4 py-4 text-sm text-foreground">
              <span>
                Your previous session is still available.
              </span>
              <Link
                href={`/interview/session/${existingSessionId}`}
                className="inline-flex items-center justify-center rounded-xl bg-[#10233c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#183252]"
              >
                Open saved session
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
