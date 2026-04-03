"use client";

import { useEffect, useRef, useState } from "react";

import { companySuggestions, interviewFields, jobTitleSuggestions } from "@/lib/interview-config";

import { createInterviewSession } from "@/app/actions";

type InterviewSetupFormProps = {
  error?: string | null;
};

function valueOf(form: HTMLFormElement, name: string) {
  const field = form.elements.namedItem(name);

  if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
    return "";
  }

  return field.value.trim();
}

function formIsReady(form: HTMLFormElement) {
  const jobTitle = valueOf(form, "jobTitle");
  const companyName = valueOf(form, "companyName");
  const jobDescription = valueOf(form, "jobDescription");
  const resumeText = valueOf(form, "resumeText");
  const resumeFileField = form.elements.namedItem("resumeFile");
  const hasResumeFile =
    resumeFileField instanceof HTMLInputElement &&
    (resumeFileField.files?.length ?? 0) > 0;

  return (
    jobTitle.length > 0 &&
    companyName.length > 0 &&
    jobDescription.length > 0 &&
    (resumeText.length > 0 || hasResumeFile)
  );
}

function focusFirstMissingField(form: HTMLFormElement) {
  const orderedNames = [
    "jobTitle",
    "companyName",
    "jobDescription",
    "resumeFile",
    "resumeText",
  ] as const;

  for (const name of orderedNames) {
    const field = form.elements.namedItem(name);

    if (name === "resumeFile" || name === "resumeText") {
      const resumeText = valueOf(form, "resumeText");
      const resumeFileField = form.elements.namedItem("resumeFile");
      const hasResumeFile =
        resumeFileField instanceof HTMLInputElement &&
        (resumeFileField.files?.length ?? 0) > 0;

      if (!resumeText && !hasResumeFile) {
        if (resumeFileField instanceof HTMLElement) {
          resumeFileField.focus();
        }
        return;
      }

      continue;
    }

    if (
      (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) &&
      !field.value.trim()
    ) {
      field.focus();
      return;
    }
  }
}

export function InterviewSetupForm({ error }: InterviewSetupFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    const form = formRef.current;
    const submitButton = submitButtonRef.current;

    if (!form || !submitButton) {
      return;
    }

    let frameId = 0;

    const syncSubmitState = () => {
      submitButton.disabled = !formIsReady(form);
    };

    const scheduleSync = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(syncSubmitState);
    };

    syncSubmitState();
    form.addEventListener("input", scheduleSync);
    form.addEventListener("change", scheduleSync);

    return () => {
      cancelAnimationFrame(frameId);
      form.removeEventListener("input", scheduleSync);
      form.removeEventListener("change", scheduleSync);
    };
  }, []);

  return (
    <form
      ref={formRef}
      action={createInterviewSession}
      className="mt-8 space-y-8"
      onSubmit={(event) => {
        const form = formRef.current;
        const ready = form ? formIsReady(form) : false;

        if (!ready) {
          event.preventDefault();
          setWarning(
            "Complete the required fields before continuing. Job title, company name, job description, and a resume are required.",
          );
          if (form) {
            focusFirstMissingField(form);
          }
          return;
        }

        setWarning(null);
      }}
    >
      {error ? (
        <div className="rounded-[1.4rem] border border-[#ff8c61]/26 bg-[#ff8c61]/9 px-4 py-4 text-sm leading-6 text-accent-strong">
          {error}
        </div>
      ) : null}

      {warning ? (
        <div className="rounded-[1.4rem] border border-[#ff8c61]/26 bg-[#ff8c61]/9 px-4 py-4 text-sm leading-6 text-accent-strong">
          {warning}
        </div>
      ) : null}

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
          <span className="text-sm font-semibold text-foreground">Email</span>
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
          {interviewFields.map((field) => (
            <label
              key={field.id}
              className="flex h-full cursor-pointer gap-3 rounded-[1.45rem] border border-line bg-white/80 px-4 py-4 transition hover:border-accent/55 hover:bg-[#fff4ef]"
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

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-foreground">
            Target job title
          </span>
          <input
            type="text"
            name="jobTitle"
            required
            list="job-title-suggestions"
            autoComplete="off"
            placeholder="Start typing a role"
            className="w-full rounded-[1.2rem] border border-line bg-white/84 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
          />
          <datalist id="job-title-suggestions">
            {jobTitleSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
          <p className="text-xs text-muted">
            Browser suggestions appear as you type.
          </p>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-foreground">
            Company name
          </span>
          <input
            type="text"
            name="companyName"
            required
            list="company-suggestions"
            autoComplete="off"
            placeholder="Start typing a company"
            className="w-full rounded-[1.2rem] border border-line bg-white/84 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
          />
          <datalist id="company-suggestions">
            {companySuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
          <p className="text-xs text-muted">
            Browser suggestions appear as you type.
          </p>
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-foreground">
          Job specification or job description
        </span>
        <textarea
          rows={7}
          name="jobDescription"
          required
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
          <div className="mt-5 rounded-[1.35rem] border border-line bg-white/76 px-4 py-4 text-sm leading-6 text-foreground">
            Required before continuing:
            <ul className="mt-2 space-y-2 text-muted">
              <li>Job title</li>
              <li>Company name</li>
              <li>Job description</li>
              <li>Resume file or resume text</li>
            </ul>
          </div>

          <button
            ref={submitButtonRef}
            type="button"
            disabled
            onClick={() => {
              const form = formRef.current;

              if (!form) {
                return;
              }

              const ready = formIsReady(form);

              if (!ready) {
                setWarning(
                  "Complete the required fields before continuing. Job title, company name, job description, and a resume are required.",
                );
                focusFirstMissingField(form);
                return;
              }

              setWarning(null);
              form.requestSubmit();
            }}
            className="mt-5 w-full rounded-[1.2rem] bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:bg-[#f0b39b]"
          >
            Save interview session
          </button>
        </div>
      </div>
    </form>
  );
}
