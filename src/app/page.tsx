import {
  coachingSignals,
  interviewFields,
  onboardingHighlights,
} from "@/lib/interview-config";
import { Reveal } from "@/components/reveal";

import { createInterviewSession } from "./actions";

const errorMessages: Record<string, string> = {
  "missing-fields":
    "Please complete the required fields and provide a resume as PDF, TXT, or pasted text before creating an interview session.",
  "save-failed":
    "We could not save the interview setup. In deployment, this usually means the hosted PostgreSQL connection is missing or migrations have not been run yet.",
  "unsupported-resume-format":
    "Resume upload currently supports PDF and TXT files. You can also paste resume text directly.",
};

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const error = params?.error ? errorMessages[params.error] : null;

  return (
    <main className="relative overflow-hidden px-5 py-6 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute left-[-6rem] top-20 h-56 w-56 rounded-full bg-[#ff8c61]/18 blur-3xl float-soft" />
      <div className="pointer-events-none absolute right-[-5rem] top-40 h-72 w-72 rounded-full bg-[#1c7891]/16 blur-3xl float-delayed" />

      <section className="mx-auto flex max-w-7xl flex-col gap-6 rounded-[2.2rem] border border-white/50 bg-white/44 p-4 shadow-[0_30px_120px_rgba(19,34,56,0.08)] backdrop-blur md:p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
          <Reveal className="rounded-[2rem] bg-[#10233c] p-6 text-white shadow-[0_26px_70px_rgba(16,35,60,0.34)] sm:p-8">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/86">
                  AI Interview Helper
                </span>
                <span className="rounded-full bg-[#ff8c61]/16 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#ffbc9f]">
                  Mock interview platform
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="max-w-3xl font-display text-5xl leading-[0.95] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
                  Build interview confidence with a sharper, more human practice experience.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
                  Personalized question generation, resume-aware coaching, and a
                  more polished path from job target to live practice session.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {coachingSignals.map((signal, index) => (
                  <Reveal
                    key={signal}
                    delay={index * 80}
                    className="rounded-[1.35rem] border border-white/10 bg-white/7 px-4 py-4 text-sm leading-6 text-white/78"
                  >
                    {signal}
                  </Reveal>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/7 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/68">
                    Session plan
                  </p>
                  <ol className="mt-4 space-y-3 text-sm leading-6 text-white/78">
                    {onboardingHighlights.map((item, index) => (
                      <li key={item} className="flex gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                          {index + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,124,73,0.16),rgba(255,255,255,0.05))] p-5 pulse-glow">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ffbc9f]">
                    Product direction
                  </p>
                  <p className="mt-4 text-sm leading-7 text-white/76">
                    The next version will generate the 10-question interview,
                    save performance data, and move users into a timed practice
                    flow with voice and coaching.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100} className="glass-card rounded-[2rem] border border-white/60 p-6 shadow-[0_24px_60px_rgba(19,34,56,0.08)] sm:p-8">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                Start the setup
              </p>
              <h2 className="font-display text-4xl tracking-[-0.05em] text-foreground sm:text-5xl">
                Create an interview profile that feels tailored from the beginning.
              </h2>
              <p className="max-w-xl text-sm leading-7 text-muted sm:text-base">
                Users can choose the field, add job context, upload a resume,
                and move into a real interview session structure.
              </p>
            </div>

            {error ? (
              <div className="mt-6 rounded-[1.5rem] border border-[#ff8c61]/26 bg-[#ff8c61]/9 px-4 py-4 text-sm leading-6 text-accent-strong">
                {error}
              </div>
            ) : null}

            <form action={createInterviewSession} className="mt-8 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-foreground">
                    Candidate name
                  </span>
                  <input
                    type="text"
                    name="candidateName"
                    placeholder="Tenzin Kunga"
                    className="w-full rounded-[1.2rem] border border-line bg-white/84 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-foreground">
                    Email
                  </span>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    className="w-full rounded-[1.2rem] border border-line bg-white/84 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                  />
                </label>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  1. Choose the interview field
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {interviewFields.map((field, index) => (
                    <Reveal key={field.id} delay={index * 60} className="h-full">
                      <label className="flex h-full cursor-pointer gap-3 rounded-[1.4rem] border border-line bg-white/80 px-4 py-4 transition hover:border-accent/55 hover:bg-[#fff4ef]">
                        <input
                          type="radio"
                          name="field"
                          value={field.id}
                          defaultChecked={field.id === "technology"}
                          className="mt-1 h-4 w-4 border-line text-accent focus:ring-accent"
                        />
                        <span className="space-y-1">
                          <span className="block text-sm font-semibold text-foreground">
                            {field.label}
                          </span>
                          <span className="block text-sm leading-6 text-muted">
                            {field.description}
                          </span>
                        </span>
                      </label>
                    </Reveal>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-foreground">
                    2. Job title
                  </span>
                  <input
                    type="text"
                    name="jobTitle"
                    placeholder="Junior Software Engineer"
                    className="w-full rounded-[1.2rem] border border-line bg-white/84 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-foreground">
                    3. Company name
                  </span>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Airbnb"
                    className="w-full rounded-[1.2rem] border border-line bg-white/84 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-foreground">
                  4. Job specification or job description
                </span>
                <textarea
                  rows={6}
                  name="jobDescription"
                  placeholder="Paste the responsibilities, requirements, preferred qualifications, and company expectations here."
                  className="w-full rounded-[1.45rem] border border-line bg-white/84 px-4 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                />
              </label>

              <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-foreground">
                    5. Resume text fallback
                  </span>
                  <textarea
                    rows={8}
                    name="resumeText"
                    placeholder="Paste the resume here only when a file upload is not available."
                    className="w-full rounded-[1.45rem] border border-line bg-white/84 px-4 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                  />
                </label>

                <div className="rounded-[1.5rem] border border-[#ff8c61]/20 bg-[linear-gradient(180deg,rgba(255,124,73,0.08),rgba(255,255,255,0.74))] p-5">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                      Resume intake
                    </p>
                    <h3 className="font-display text-3xl tracking-[-0.05em] text-foreground">
                      Upload the resume directly
                    </h3>
                    <p className="text-sm leading-7 text-muted">
                      PDF and TXT upload are supported now. Pasted text still
                      works as a fallback for quick testing.
                    </p>
                  </div>

                  <label className="mt-5 block space-y-2">
                    <span className="text-sm font-semibold text-foreground">
                      Resume file
                    </span>
                    <input
                      type="file"
                      name="resumeFile"
                      accept=".pdf,.txt,application/pdf,text/plain"
                      className="block w-full rounded-[1.2rem] border border-line bg-white/84 px-4 py-3 text-sm text-foreground file:mr-4 file:rounded-xl file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                    />
                  </label>

                  <div className="mt-5 rounded-[1.35rem] border border-line bg-white/76 px-4 py-4 text-sm leading-6 text-foreground">
                    Current support:
                    <ul className="mt-2 space-y-2 text-muted">
                      <li>PDF resume upload and extraction</li>
                      <li>TXT resume upload</li>
                      <li>Pasted text fallback</li>
                      <li>Saved parsed text for session generation</li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    className="mt-5 w-full rounded-[1.2rem] bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
                  >
                    Save interview session
                  </button>
                </div>
              </div>
            </form>
          </Reveal>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
          <Reveal delay={120} className="glass-card rounded-[1.7rem] border border-white/60 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-highlight">
              Production note
            </p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-foreground">
              <p>
                If Vercel shows a server-side error after submitting the form,
                the most likely cause is missing database configuration in
                production rather than a broken UI route.
              </p>
              <p className="text-muted">
                Add the hosted PostgreSQL `DATABASE_URL`, run Prisma migrations
                against that database, then redeploy.
              </p>
            </div>
          </Reveal>

          <Reveal delay={200} className="glass-card rounded-[1.7rem] border border-white/60 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Already built
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                "Modern Next.js app scaffold",
                "Resume upload with PDF parsing",
                "Prisma and PostgreSQL schema",
                "Session creation flow",
                "Session preview route",
                "Security-patched Next.js release",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.3rem] border border-line bg-white/72 px-4 py-4 text-sm leading-6 text-foreground"
                >
                  {item}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
