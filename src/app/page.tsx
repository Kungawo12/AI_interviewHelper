export default function Home() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-16">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 rounded-[2rem] border border-line bg-panel-strong p-8 shadow-[0_24px_80px_rgba(19,34,56,0.08)] lg:p-12">
        <div className="flex flex-col gap-4">
          <p className="w-fit rounded-full bg-accent/10 px-4 py-2 text-sm font-semibold tracking-[0.18em] text-accent uppercase">
            AI Interview Helper
          </p>
          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Build a realistic AI interviewer for students and job seekers.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
              This starter gives us a clean Next.js foundation plus a
              PostgreSQL-ready Prisma schema for interview profiles, sessions,
              generated questions, answers, and coaching feedback.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-[1.75rem] border border-line bg-[linear-gradient(135deg,rgba(209,104,63,0.12),rgba(19,34,56,0.02))] p-6">
            <h2 className="text-xl font-semibold">MVP flow</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                "Choose the field and role",
                "Paste company and job specification",
                "Upload or paste resume content",
                "Generate 10 tailored interview questions",
                "Capture spoken answers and transcripts",
                "Score answers and save feedback history",
              ].map((item, index) => (
                <div
                  key={item}
                  className="rounded-2xl border border-line bg-panel px-4 py-4"
                >
                  <p className="text-sm font-medium text-accent">
                    Step {index + 1}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-line bg-foreground p-6 text-white">
            <h2 className="text-xl font-semibold">Data model ready</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-white/80">
              <li>`User` keeps identity and ownership.</li>
              <li>`InterviewProfile` stores role, field, and company context.</li>
              <li>`Resume` stores source files and extracted text.</li>
              <li>`InterviewSession` tracks each mock interview run.</li>
              <li>`Question`, `Answer`, and `Feedback` power coaching.</li>
              <li>`QuestionHistory` helps prevent repeated prompts.</li>
            </ul>
            <div className="mt-6 rounded-2xl bg-white/8 p-4 text-sm leading-6 text-white/90">
              Next move: connect PostgreSQL, run Prisma migrations, and build
              the onboarding form for the first interview session.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
