import {
  coachingSignals,
  interviewFields,
  onboardingHighlights,
} from "@/lib/interview-config";
import { createInterviewSession } from "./actions";

const errorMessages: Record<string, string> = {
  "missing-fields": "Please complete the required fields and provide a resume as PDF, TXT, or pasted text before creating an interview session.",
  "save-failed": "We could not save the interview setup. Check that PostgreSQL is running and the schema has been migrated.",
  "unsupported-resume-format": "Resume upload currently supports PDF and TXT files. You can also paste resume text directly.",
};

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const error = params?.error ? errorMessages[params.error] : null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(209,104,63,0.18),transparent_28%),linear-gradient(180deg,#f8f3ea_0%,#f4efe4_52%,#efe5d2_100%)] px-5 py-6 sm:px-8 lg:px-12">
      <section className="mx-auto flex max-w-7xl flex-col gap-6 rounded-[2rem] border border-line bg-panel-strong/90 p-5 shadow-[0_28px_90px_rgba(19,34,56,0.08)] backdrop-blur sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="flex flex-col gap-6 rounded-[1.75rem] bg-foreground px-6 py-7 text-white sm:px-8">
            <div className="space-y-4">
              <p className="w-fit rounded-full bg-white/10 px-4 py-2 text-sm font-semibold tracking-[0.2em] text-white uppercase">
                AI Interview Helper
              </p>
              <div className="space-y-4">
                <h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                  Build stronger interview confidence with an app that practices like a real interviewer.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
                  We are turning your product idea into a guided interview coach
                  for students, job seekers, and career changers. This first
                  screen captures the exact context we need to generate smarter,
                  more relevant interview questions.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {coachingSignals.map((signal) => (
                <div
                  key={signal}
                  className="rounded-2xl border border-white/12 bg-white/6 px-4 py-4 text-sm leading-6 text-white/78"
                >
                  {signal}
                </div>
              ))}
            </div>

            <div className="rounded-[1.5rem] border border-white/12 bg-white/8 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                Session plan
              </p>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-white/78">
                {onboardingHighlights.map((item, index) => (
                  <li key={item} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/12 text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-line bg-panel p-6 sm:p-7">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                Start an interview
              </p>
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                Create the first guided interview profile
              </h2>
              <p className="max-w-xl text-sm leading-6 text-muted sm:text-base">
                We’ll use these inputs to generate role-specific interview
                questions and prepare the session flow.
              </p>
            </div>

            {error ? (
              <div className="mt-6 rounded-2xl border border-[rgba(168,72,37,0.22)] bg-[rgba(209,104,63,0.08)] px-4 py-4 text-sm leading-6 text-accent-strong">
                {error}
              </div>
            ) : null}

            <form action={createInterviewSession} className="mt-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-foreground">
                    Candidate name
                  </span>
                  <input
                    type="text"
                    name="candidateName"
                    placeholder="Tenzin Kunga"
                    className="w-full rounded-2xl border border-line bg-panel-strong px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
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
                    className="w-full rounded-2xl border border-line bg-panel-strong px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                  />
                </label>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">
                  1. Choose the interview field
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {interviewFields.map((field) => (
                    <label
                      key={field.id}
                      className="group flex cursor-pointer gap-3 rounded-2xl border border-line bg-panel-strong px-4 py-4 transition hover:border-accent/55 hover:bg-accent/5"
                    >
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
                    className="w-full rounded-2xl border border-line bg-panel-strong px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
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
                    className="w-full rounded-2xl border border-line bg-panel-strong px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
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
                  className="w-full rounded-[1.5rem] border border-line bg-panel-strong px-4 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                />
              </label>

              <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-foreground">
                    5. Resume text fallback
                  </span>
                  <textarea
                    rows={7}
                    name="resumeText"
                    placeholder="Paste the resume only if the user does not upload a PDF or TXT file."
                    className="w-full rounded-[1.5rem] border border-line bg-panel-strong px-4 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                  />
                </label>

                <div className="space-y-4 rounded-[1.5rem] border border-dashed border-accent/35 bg-[linear-gradient(180deg,rgba(209,104,63,0.08),rgba(255,255,255,0.6))] p-5">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                      Resume intake
                    </p>
                    <h3 className="text-xl font-semibold tracking-[-0.03em] text-foreground">
                      Upload the resume directly
                    </h3>
                    <p className="text-sm leading-6 text-muted">
                      The app now accepts PDF and TXT uploads. If no file is
                      available, pasted text still works as a fallback.
                    </p>
                  </div>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-foreground">
                      Resume file
                    </span>
                    <input
                      type="file"
                      name="resumeFile"
                      accept=".pdf,.txt,application/pdf,text/plain"
                      className="block w-full rounded-2xl border border-line bg-panel-strong px-4 py-3 text-sm text-foreground file:mr-4 file:rounded-xl file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                    />
                  </label>

                  <div className="rounded-2xl border border-line bg-panel-strong px-4 py-4 text-sm leading-6 text-foreground">
                    Current support:
                    <ul className="mt-2 space-y-2 text-muted">
                      <li>PDF resume upload and text extraction</li>
                      <li>TXT resume upload</li>
                      <li>Pasted text fallback</li>
                      <li>Saved parsed text for session generation</li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
                  >
                    Save interview session
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[1.5rem] border border-line bg-panel p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              What the app will do next
            </p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-foreground">
              <p>
                The first submitted profile will create a reusable interview
                context in the database and start the user’s first interview
                session.
              </p>
              <p className="text-muted">
                After that, we’ll generate 10 tailored questions, store them in
                PostgreSQL, and wire the session screen for answer capture and
                feedback.
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-line bg-panel-strong p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Already built
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                "Next.js app scaffold",
                "Prisma client setup",
                "PostgreSQL schema",
                "Question history model",
                "GitHub-connected repo",
                "Vercel-safe Next.js patch level",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-line bg-panel px-4 py-4 text-sm leading-6 text-foreground"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
