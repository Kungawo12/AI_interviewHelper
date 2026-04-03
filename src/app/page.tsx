import { InterviewScene } from "@/components/interview-scene";
import { Reveal } from "@/components/reveal";
import { SuggestionInput } from "@/components/suggestion-input";
import {
  coachingSignals,
  companySuggestions,
  interviewFields,
  jobTitleSuggestions,
  onboardingHighlights,
} from "@/lib/interview-config";

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
      <div className="pointer-events-none absolute left-[-7rem] top-16 h-60 w-60 rounded-full bg-[#ff8c61]/18 blur-3xl float-soft" />
      <div className="pointer-events-none absolute right-[-4rem] top-36 h-72 w-72 rounded-full bg-[#1c7891]/14 blur-3xl float-delayed" />

      <section className="mx-auto flex max-w-6xl flex-col gap-6 rounded-[2.3rem] border border-white/50 bg-white/44 p-4 shadow-[0_30px_120px_rgba(19,34,56,0.08)] backdrop-blur md:p-6 lg:p-8">
        <Reveal className="glass-card rounded-[2rem] border border-white/60 p-6 shadow-[0_24px_70px_rgba(19,34,56,0.08)] sm:p-8 lg:p-10">
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
              <h1 className="max-w-4xl font-display text-5xl leading-[0.92] tracking-[-0.06em] text-foreground sm:text-6xl lg:text-7xl">
                The new age of interview preparation should feel intelligent,
                cinematic, and deeply professional.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-muted sm:text-lg">
                Practice with a modern AI interviewer that understands the role,
                your resume, and the company context. The experience is designed
                to feel more like a real interview room than a basic form.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {coachingSignals.map((signal, index) => (
                <Reveal
                  key={signal}
                  delay={index * 70}
                  className="rounded-[1.35rem] border border-line bg-white/72 px-4 py-4 text-sm leading-6 text-foreground"
                >
                  {signal}
                </Reveal>
              ))}
            </div>

            <InterviewScene />
          </div>
        </Reveal>

        <Reveal delay={120} className="glass-card rounded-[2rem] border border-white/60 p-6 shadow-[0_24px_70px_rgba(19,34,56,0.08)] sm:p-8 lg:p-10">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Build your session
            </p>
            <h2 className="font-display text-4xl tracking-[-0.05em] text-foreground sm:text-5xl">
              One continuous setup flow with better guidance and stronger interaction.
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-muted sm:text-base">
              Start with the role target, let the system shape the interview
              context, then move into the generated session. Some fields now
              suggest completions as you type. Press <span className="font-semibold text-foreground">Tab</span> to accept a suggestion.
            </p>
          </div>

          {error ? (
            <div className="mt-6 rounded-[1.4rem] border border-[#ff8c61]/26 bg-[#ff8c61]/9 px-4 py-4 text-sm leading-6 text-accent-strong">
              {error}
            </div>
          ) : null}

          <form action={createInterviewSession} className="mt-8 space-y-8">
            <div className="grid gap-4 md:grid-cols-2">
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

            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-highlight">
                Select the field
              </p>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {interviewFields.map((field, index) => (
                  <Reveal key={field.id} delay={index * 60}>
                    <label className="flex h-full cursor-pointer gap-3 rounded-[1.45rem] border border-line bg-white/80 px-4 py-4 transition hover:border-accent/55 hover:bg-[#fff4ef]">
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

            <div className="grid gap-5 md:grid-cols-2">
              <SuggestionInput
                name="jobTitle"
                label="Target job title"
                placeholder="Start typing a role"
                suggestions={jobTitleSuggestions}
              />

              <SuggestionInput
                name="companyName"
                label="Company name"
                placeholder="Start typing a company"
                suggestions={companySuggestions}
              />
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-foreground">
                Job specification or job description
              </span>
              <textarea
                rows={7}
                name="jobDescription"
                placeholder="Paste the responsibilities, qualifications, expectations, and company requirements here."
                className="w-full rounded-[1.5rem] border border-line bg-white/84 px-4 py-4 text-sm leading-7 text-foreground outline-none transition placeholder:text-muted focus:border-accent"
              />
            </label>

            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[1.6rem] border border-line bg-white/74 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                  Resume intake
                </p>
                <div className="mt-4 grid gap-4">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-foreground">
                      Upload resume file
                    </span>
                    <input
                      type="file"
                      name="resumeFile"
                      accept=".pdf,.txt,application/pdf,text/plain"
                      className="block w-full rounded-[1.2rem] border border-line bg-white/84 px-4 py-3 text-sm text-foreground file:mr-4 file:rounded-xl file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-foreground">
                      Resume text fallback
                    </span>
                    <textarea
                      rows={8}
                      name="resumeText"
                      placeholder="Use this only when no PDF or TXT file is available."
                      className="w-full rounded-[1.4rem] border border-line bg-white/84 px-4 py-4 text-sm leading-7 text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-[#ff8c61]/20 bg-[linear-gradient(180deg,rgba(255,124,73,0.1),rgba(255,255,255,0.76))] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                  Session roadmap
                </p>
                <ol className="mt-4 space-y-3 text-sm leading-7 text-foreground">
                  {onboardingHighlights.map((item, index) => (
                    <li key={item} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/70 text-xs font-semibold text-accent-strong">
                        {index + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>

                <div className="mt-5 rounded-[1.35rem] border border-line bg-white/76 px-4 py-4 text-sm leading-6 text-foreground">
                  This version already supports PDF parsing, session creation,
                  and a saved interview preview. The next production step is the
                  real question engine and hosted PostgreSQL deployment.
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
      </section>
    </main>
  );
}
