export function InterviewScene() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,#10233c_0%,#173250_44%,#1f4e64_100%)] p-6 shadow-[0_28px_80px_rgba(16,35,60,0.32)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_60%)]" />
      <div className="pointer-events-none absolute right-8 top-8 h-24 w-24 rounded-full bg-[#ff8c61]/20 blur-2xl" />
      <div className="pointer-events-none absolute left-10 top-12 h-20 w-20 rounded-full bg-[#7de3ff]/12 blur-2xl" />

      <div className="mb-5 flex items-center justify-between text-white/72">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em]">
            New Age Interview
          </p>
          <p className="mt-2 text-sm leading-6 text-white/70">
            Human presence, AI guidance, real-world confidence practice.
          </p>
        </div>
        <div className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/82">
          Live coaching
        </div>
      </div>

      <svg
        viewBox="0 0 720 460"
        className="h-auto w-full"
        role="img"
        aria-label="Professional interview scene"
      >
        <defs>
          <linearGradient id="desk" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#f0b08e" />
            <stop offset="100%" stopColor="#ff8557" />
          </linearGradient>
          <linearGradient id="screen" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#f9fcff" />
            <stop offset="100%" stopColor="#d7eef7" />
          </linearGradient>
          <linearGradient id="chair" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#173250" />
            <stop offset="100%" stopColor="#0d1a2a" />
          </linearGradient>
        </defs>

        <rect x="110" y="288" width="510" height="34" rx="17" fill="url(#desk)" />
        <rect x="130" y="322" width="470" height="20" rx="10" fill="#d7653c" opacity="0.6" />

        <rect x="276" y="112" width="168" height="112" rx="16" fill="url(#screen)" />
        <rect x="290" y="126" width="140" height="84" rx="12" fill="#ffffff" />
        <rect x="333" y="224" width="54" height="12" rx="6" fill="#c5d8e2" />
        <rect x="317" y="236" width="86" height="14" rx="7" fill="#dbeaf0" />

        <circle cx="360" cy="167" r="24" fill="#ffd4be" />
        <rect x="330" y="194" width="60" height="20" rx="10" fill="#79b5cb" />
        <path d="M331 151c5-22 53-26 59 1-8-4-18-6-29-6s-22 2-30 5Z" fill="#1f4e64" />
        <rect x="318" y="211" width="86" height="43" rx="18" fill="#1c7891" />

        <ellipse cx="205" cy="364" rx="68" ry="15" fill="#0c1520" opacity="0.28" />
        <ellipse cx="530" cy="364" rx="68" ry="15" fill="#0c1520" opacity="0.28" />

        <rect x="152" y="204" width="98" height="104" rx="26" fill="url(#chair)" />
        <rect x="174" y="152" width="54" height="72" rx="24" fill="url(#chair)" />
        <circle cx="199" cy="132" r="25" fill="#ffd1b6" />
        <path d="M176 121c2-22 42-28 48-1-7-3-15-5-24-5-9 0-17 2-24 6Z" fill="#132238" />
        <path d="M172 218c8-17 48-22 61-1l10 65h-82l11-64Z" fill="#f4efe4" />
        <rect x="187" y="156" width="25" height="32" rx="12" fill="#ffd1b6" />
        <path d="M170 248c12 16 28 23 48 20l-8 72h-22l-18-92Z" fill="#132238" />
        <path d="M230 247c-11 17-27 24-48 21l16 72h22l10-93Z" fill="#173250" />
        <path d="M234 236l42 18-8 16-47-8 13-26Z" fill="#ffd1b6" />
        <path d="M253 247l61-10 4 18-61 16-4-24Z" fill="#ff8c61" />
        <circle cx="316" cy="246" r="8" fill="#ffffff" />

        <rect x="470" y="200" width="100" height="106" rx="26" fill="url(#chair)" />
        <rect x="495" y="149" width="52" height="72" rx="24" fill="url(#chair)" />
        <circle cx="520" cy="132" r="25" fill="#ffcfb2" />
        <path d="M498 120c1-20 39-28 47-1-8-4-16-6-24-6-9 0-16 2-23 7Z" fill="#1f4e64" />
        <path d="M486 220c9-18 50-21 66-2l8 63h-86l12-61Z" fill="#ff8c61" />
        <rect x="507" y="156" width="24" height="32" rx="12" fill="#ffcfb2" />
        <path d="M489 247c12 18 29 24 50 20l-8 73h-23l-19-93Z" fill="#10233c" />
        <path d="M551 246c-11 18-28 24-49 21l17 73h23l9-94Z" fill="#16304a" />
        <path d="M492 238l-44 21 8 14 49-10-13-25Z" fill="#ffcfb2" />
        <rect x="417" y="229" width="40" height="49" rx="9" fill="#f5fbff" />
        <rect x="423" y="237" width="28" height="4" rx="2" fill="#bdd2dd" />
        <rect x="423" y="247" width="22" height="4" rx="2" fill="#d5e4eb" />
        <rect x="423" y="257" width="25" height="4" rx="2" fill="#d5e4eb" />
        <rect x="423" y="267" width="18" height="4" rx="2" fill="#d5e4eb" />

        <path d="M88 99h77" stroke="#ffffff" strokeOpacity="0.15" strokeWidth="10" strokeLinecap="round" />
        <path d="M560 88h52" stroke="#ffffff" strokeOpacity="0.15" strokeWidth="10" strokeLinecap="round" />
        <path d="M85 121h48" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="10" strokeLinecap="round" />
      </svg>
    </div>
  );
}
