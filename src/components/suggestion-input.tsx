"use client";

import { useEffect, useMemo, useState } from "react";

type SuggestionInputProps = {
  name: string;
  label: string;
  placeholder: string;
  suggestions: readonly string[];
};

function getSuggestion(value: string, suggestions: readonly string[]) {
  if (!value.trim()) {
    return "";
  }

  const normalized = value.toLowerCase();

  return (
    suggestions.find(
      (item) =>
        item.toLowerCase().startsWith(normalized) &&
        item.toLowerCase() !== normalized,
    ) ?? ""
  );
}

export function SuggestionInput({
  name,
  label,
  placeholder,
  suggestions,
}: SuggestionInputProps) {
  const [value, setValue] = useState("");
  const suggestion = useMemo(
    () => getSuggestion(value, suggestions),
    [suggestions, value],
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Tab" && suggestion) {
        const target = event.target as HTMLInputElement | null;
        if (target?.name === name) {
          event.preventDefault();
          setValue(suggestion);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [name, suggestion]);

  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 overflow-hidden rounded-[1.2rem] px-4 py-3 text-sm">
          <span className="invisible whitespace-pre">{value}</span>
          {suggestion ? (
            <span className="whitespace-pre text-muted/55">
              {suggestion.slice(value.length)}
            </span>
          ) : null}
        </div>
        <input
          type="text"
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete="off"
          placeholder={placeholder}
          className="relative z-10 w-full rounded-[1.2rem] border border-line bg-white/84 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
        />
      </div>
      {suggestion ? (
        <p className="text-xs text-muted">
          Press <span className="font-semibold text-foreground">Tab</span> to
          accept: {suggestion}
        </p>
      ) : (
        <p className="text-xs text-muted">Smart suggestions appear as you type.</p>
      )}
    </label>
  );
}
