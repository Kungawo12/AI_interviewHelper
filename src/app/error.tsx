"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[linear-gradient(180deg,#0f1b2d_0%,#132238_48%,#1f3958_100%)] px-5 py-8 text-white sm:px-8 lg:px-12">
        <main className="mx-auto flex max-w-5xl flex-col gap-6 rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_28px_90px_rgba(8,14,26,0.34)] backdrop-blur sm:p-8 lg:p-10">
          <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="w-fit rounded-full bg-[#ff8c61]/16 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#ffb99f]">
              Application issue
            </p>
            <h1 className="max-w-3xl font-display text-4xl tracking-[-0.05em] text-white sm:text-5xl">
              The app hit a server-side problem, but the project itself is still recoverable.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/76 sm:text-base">
              This usually happens in deployment when the database environment
              variables are missing or the schema has not been migrated yet.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ffb99f]">
                Most likely fixes
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/78">
                <li>Add `DATABASE_URL` to your Vercel project environment variables.</li>
                <li>Run the Prisma migration against the hosted PostgreSQL database.</li>
                <li>Redeploy after the database is reachable from production.</li>
              </ul>
              {error.digest ? (
                <p className="mt-4 rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-xs font-mono text-white/58">
                  Digest: {error.digest}
                </p>
              ) : null}
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/7 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ffb99f]">
                Quick actions
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#ff8c61] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#f27545]"
                >
                  Go to home
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm font-semibold text-white/86 transition hover:bg-white/10"
                >
                  Return to setup
                </Link>
              </div>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
