"use client";

import { useState } from "react";

type InterviewQuestion = {
  id: string;
  sequenceNumber: number;
  questionText: string;
  category: string;
  difficulty: string;
};

type InterviewProcessProps = {
  sessionId: string;
  jobTitle: string;
  companyName?: string | null;
  questions: InterviewQuestion[];
};

export function InterviewProcess({
  sessionId,
  jobTitle,
  companyName,
  questions,
}: InterviewProcessProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [draftAnswer, setDraftAnswer] = useState("");

  const currentQuestion = questions[currentIndex];
  const progress = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
      <section className="glass-card rounded-[1.65rem] border border-white/60 p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          Interview details
        </p>
        <div className="mt-4 space-y-4 text-sm leading-6 text-foreground">
          <div>
            <p className="font-semibold">Session ID</p>
            <p className="font-mono text-xs text-muted">{sessionId}</p>
          </div>
          <div>
            <p className="font-semibold">Target role</p>
            <p className="text-muted">
              {jobTitle}
              {companyName ? ` at ${companyName}` : ""}
            </p>
          </div>
          <div>
            <p className="font-semibold">Progress</p>
            <div className="mt-2 h-2 rounded-full bg-[#10233c]/10">
              <div
                className="h-2 rounded-full bg-accent transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="rounded-[1.2rem] border border-line bg-white/72 px-4 py-4">
            <p className="font-semibold">Question list</p>
            <ol className="mt-3 space-y-2 text-muted">
              {questions.map((question, index) => (
                <li
                  key={question.id}
                  className={
                    index === currentIndex ? "font-semibold text-foreground" : ""
                  }
                >
                  {question.sequenceNumber}. {question.category.toLowerCase()}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="glass-card rounded-[1.65rem] border border-white/60 p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-highlight">
          Interview in progress
        </p>
        <div className="mt-4 space-y-4">
          <div className="rounded-[1.3rem] border border-line bg-white/72 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              {currentQuestion.category.toLowerCase()} ·{" "}
              {currentQuestion.difficulty.toLowerCase()}
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-[-0.05em] text-foreground">
              {currentQuestion.questionText}
            </h2>
          </div>

          <div className="rounded-[1.3rem] border border-line bg-white/72 px-4 py-4">
            <p className="text-sm font-semibold text-foreground">
              Draft answer
            </p>
            <textarea
              rows={8}
              value={draftAnswer}
              onChange={(event) => setDraftAnswer(event.target.value)}
              placeholder="This is where the spoken transcript or typed answer will appear in the next backend step."
              className="mt-3 w-full rounded-[1.2rem] border border-line bg-white/84 px-4 py-4 text-sm leading-7 text-foreground outline-none transition placeholder:text-muted focus:border-accent"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
              disabled={currentIndex === 0}
              className="rounded-[1.1rem] border border-line bg-white/84 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentIndex((index) =>
                  Math.min(questions.length - 1, index + 1),
                )
              }
              disabled={currentIndex === questions.length - 1}
              className="rounded-[1.1rem] bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:bg-[#f0b39b]"
            >
              Next question
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
