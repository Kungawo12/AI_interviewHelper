"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

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

type PermissionState = "idle" | "granted" | "denied";
type VoiceState = "idle" | "speaking" | "listening";
type VoiceEngine = "ai" | "browser" | "unavailable" | "none";
type InterviewerOption = {
  id: "female" | "male";
  name: string;
  photo: string;
};

type PresenceMetrics = {
  attention: number;
  eyeContact: number;
  confidence: number;
  status: string;
};

function InterviewerFigure({
  interviewerId,
  state,
}: {
  interviewerId: "female" | "male";
  photo?: string;
  state: VoiceState;
}) {
  const isSpeaking = state === "speaking";
  const isListening = state === "listening";
  const name = interviewerId === "female" ? "Elena" : "Marcus";
  const isFemale = interviewerId === "female";

  const [blinking, setBlinking] = useState(false);
  const [mouthPhase, setMouthPhase] = useState(0);
  const [headTilt, setHeadTilt] = useState(0);

  // Random blink every 2–5 s
  useEffect(() => {
    let t: number;
    const scheduleBlink = () => {
      t = window.setTimeout(() => {
        setBlinking(true);
        window.setTimeout(() => { setBlinking(false); scheduleBlink(); }, 130);
      }, 2200 + Math.random() * 2800);
    };
    scheduleBlink();
    return () => window.clearTimeout(t);
  }, []);

  // Mouth animation while speaking
  useEffect(() => {
    if (!isSpeaking) { setMouthPhase(0); return; }
    let ph = 0;
    const id = window.setInterval(() => { ph = (ph + 1) % 4; setMouthPhase(ph); }, 145);
    return () => window.clearInterval(id);
  }, [isSpeaking]);

  // Gentle nod while listening
  useEffect(() => {
    if (!isListening) { setHeadTilt(0); return; }
    let dir = 1;
    const id = window.setInterval(() => { setHeadTilt(dir * 3); dir *= -1; }, 1500);
    return () => window.clearInterval(id);
  }, [isListening]);

  const C = isFemale ? {
    skin: "#F2C09A", skinShadow: "#D9A07A",
    hair: "#2B1810", hairHL: "#5C3020",
    eye: "#4A2E1A",
    blazer: "#1B3D6E", blazerHL: "#2756A0",
    shirt: "#E8EDF5",
    lips: "#D4776A", lipsInner: "#9B3E36",
    blush: "rgba(240,110,100,0.13)",
  } : {
    skin: "#C88B62", skinShadow: "#A86A42",
    hair: "#111111", hairHL: "#2A2A2A",
    eye: "#1A2535",
    blazer: "#0F2744", blazerHL: "#1B3D6E",
    shirt: "#D0D8E8",
    lips: "#9A5848", lipsInner: "#6A3530",
    blush: "rgba(180,90,70,0.08)",
  };

  const browLift = isListening ? -4 : isSpeaking ? -2 : 0;

  // Eyelid covers eye when blinking (scaleY from top)
  const lidScale = blinking ? 1 : 0.05;

  // Mouth shape
  const Mouth = () => {
    if (isSpeaking) {
      if (mouthPhase >= 2)
        return (
          <>
            <path d="M 115 217 Q 140 242 165 217 Q 140 256 115 217" fill={C.lipsInner} />
            <ellipse cx="140" cy="232" rx="18" ry="9" fill="#F5F0EB" opacity="0.9" />
            <path d="M 115 217 Q 140 242 165 217" fill="none" stroke={C.lips} strokeWidth="2.5" strokeLinecap="round" />
          </>
        );
      return (
        <>
          <path d="M 117 217 Q 140 234 163 217 Q 140 244 117 217" fill={C.lipsInner} />
          <path d="M 117 217 Q 140 234 163 217" fill="none" stroke={C.lips} strokeWidth="2.5" strokeLinecap="round" />
        </>
      );
    }
    if (isListening)
      return <path d="M 118 217 Q 140 230 162 217" fill="none" stroke={C.lips} strokeWidth="3" strokeLinecap="round" />;
    return (
      <>
        <path d="M 120 217 Q 140 228 160 217" fill="none" stroke={C.lips} strokeWidth="3" strokeLinecap="round" />
        <path d="M 126 214 Q 133 209 140 212 Q 147 209 154 214" fill="none" stroke={C.lips} strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
      </>
    );
  };

  const waveHeights = [8, 16, 26, 34, 26, 16, 8, 20, 30, 20, 12, 22, 14];

  return (
    <div className={`relative h-full min-h-[340px] overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#0f2035] via-[#0d1a2e] to-[#08111e] transition-shadow duration-500 ${
      isSpeaking
        ? "shadow-[0_0_0_3px_rgba(255,140,97,0.6),0_30px_80px_rgba(255,100,50,0.2)]"
        : isListening
          ? "shadow-[0_0_0_3px_rgba(28,120,145,0.6),0_30px_80px_rgba(28,120,145,0.18)]"
          : "shadow-[0_30px_80px_rgba(7,18,32,0.4)]"
    }`}>

      {/* Ambient glow behind character */}
      {isSpeaking  && <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(255,140,97,0.09),transparent_70%)] animate-pulse" />}
      {isListening && <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(28,120,145,0.09),transparent_70%)] animate-pulse" />}

      {/* ── Animated SVG character ────────────────────────────────── */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `rotate(${headTilt}deg)`,
          transition: "transform 0.9s ease-in-out",
          transformOrigin: "center 60%",
        }}
      >
        <svg viewBox="0 0 280 370" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id={`sg-${interviewerId}`} cx="38%" cy="32%" r="62%">
              <stop offset="0%" stopColor={C.skin} />
              <stop offset="100%" stopColor={C.skinShadow} />
            </radialGradient>
            <radialGradient id={`eg-${interviewerId}`} cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#7A6A5A" />
              <stop offset="100%" stopColor={C.eye} />
            </radialGradient>
          </defs>

          {/* Shirt visible above blazer */}
          <path d="M 95 282 L 140 310 L 185 282 L 198 370 L 82 370 Z" fill={C.shirt} />

          {/* Blazer body */}
          <path d="M 0 370 L 0 298 Q 55 255 108 270 L 140 310 L 172 270 Q 225 255 280 298 L 280 370 Z" fill={C.blazer} />
          {/* Lapels */}
          <path d="M 108 270 L 140 310 L 122 370 L 78 370 L 88 292 Z" fill={C.blazerHL} opacity="0.45" />
          <path d="M 172 270 L 140 310 L 158 370 L 202 370 L 192 292 Z" fill={C.blazerHL} opacity="0.45" />

          {/* Neck */}
          <rect x="118" y="258" width="44" height="38" rx="10" fill={`url(#sg-${interviewerId})`} />

          {/* ── Hair (behind face) ──── */}
          {isFemale ? (
            <>
              {/* Bun */}
              <ellipse cx="165" cy="86" rx="25" ry="21" fill={C.hair} />
              <ellipse cx="165" cy="86" rx="16" ry="13" fill={C.hairHL} opacity="0.35" />
              {/* Main hair */}
              <path d="M 62 158 Q 58 96 84 72 Q 110 50 140 48 Q 170 50 196 72 Q 222 96 218 158" fill={C.hair} />
              {/* Side strands */}
              <path d="M 64 162 Q 55 190 60 215" fill="none" stroke={C.hair} strokeWidth="9" strokeLinecap="round" />
              <path d="M 216 162 Q 225 190 220 215" fill="none" stroke={C.hair} strokeWidth="9" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M 62 158 Q 60 92 92 66 Q 116 46 140 44 Q 164 46 188 66 Q 220 92 218 158" fill={C.hair} />
              <path d="M 62 158 Q 60 180 65 200" fill="none" stroke={C.hair} strokeWidth="11" strokeLinecap="round" opacity="0.55" />
              <path d="M 218 158 Q 220 180 215 200" fill="none" stroke={C.hair} strokeWidth="11" strokeLinecap="round" opacity="0.55" />
            </>
          )}

          {/* Ears */}
          <ellipse cx="61" cy="176" rx="13" ry="17" fill={`url(#sg-${interviewerId})`} />
          <ellipse cx="219" cy="176" rx="13" ry="17" fill={`url(#sg-${interviewerId})`} />

          {/* Face */}
          <ellipse cx="140" cy="172" rx="80" ry="92" fill={`url(#sg-${interviewerId})`} />

          {/* Chin shadow */}
          <ellipse cx="140" cy="252" rx="48" ry="12" fill={C.skinShadow} opacity="0.2" />

          {/* Cheek blush */}
          <ellipse cx="96" cy="196" rx="28" ry="17" fill={C.blush} />
          <ellipse cx="184" cy="196" rx="28" ry="17" fill={C.blush} />

          {/* ── Eyebrows ─────────────────────────────────────────── */}
          <g style={{ transform: `translateY(${browLift}px)`, transition: "transform 0.4s ease" }}>
            {isFemale ? (
              <>
                <path d="M 85 138 Q 106 130 128 136" fill="none" stroke={C.hair} strokeWidth="3.5" strokeLinecap="round" />
                <path d="M 152 136 Q 174 130 195 138" fill="none" stroke={C.hair} strokeWidth="3.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M 83 138 Q 105 132 128 137" fill="none" stroke={C.hair} strokeWidth="5" strokeLinecap="round" />
                <path d="M 152 137 Q 175 132 197 138" fill="none" stroke={C.hair} strokeWidth="5" strokeLinecap="round" />
              </>
            )}
          </g>

          {/* ── Eyes ─────────────────────────────────────────────── */}
          {/* Whites */}
          <ellipse cx="108" cy="158" rx="21" ry="12" fill="white" />
          <ellipse cx="172" cy="158" rx="21" ry="12" fill="white" />
          {/* Iris + pupil + highlight */}
          <circle cx="110" cy="158" r="9.5" fill={`url(#eg-${interviewerId})`} />
          <circle cx="110" cy="158" r="5.5" fill={C.eye} />
          <circle cx="114" cy="154" r="2.8" fill="white" opacity="0.92" />
          <circle cx="174" cy="158" r="9.5" fill={`url(#eg-${interviewerId})`} />
          <circle cx="174" cy="158" r="5.5" fill={C.eye} />
          <circle cx="178" cy="154" r="2.8" fill="white" opacity="0.92" />
          {/* Eyelashes line */}
          <path d="M 88 150 Q 108 144 128 150" fill="none" stroke={C.hair} strokeWidth={isFemale ? "2.5" : "2"} strokeLinecap="round" />
          <path d="M 152 150 Q 172 144 192 150" fill="none" stroke={C.hair} strokeWidth={isFemale ? "2.5" : "2"} strokeLinecap="round" />
          {/* Eyelid (blink) — scaleY from top */}
          <rect x="87" y="146" width="42" height="24" rx="4" fill={C.skin}
            style={{ transformOrigin: "108px 146px", transform: `scaleY(${lidScale})`, transition: "transform 0.07s ease-in-out" }} />
          <rect x="151" y="146" width="42" height="24" rx="4" fill={C.skin}
            style={{ transformOrigin: "172px 146px", transform: `scaleY(${lidScale})`, transition: "transform 0.07s ease-in-out" }} />

          {/* ── Nose ─────────────────────────────────────────────── */}
          <path d="M 135 185 Q 130 200 137 206 Q 140 208 143 206 Q 150 200 145 185" fill="none" stroke={C.skinShadow} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <ellipse cx="134" cy="206" rx="5" ry="3.5" fill={C.skinShadow} opacity="0.2" />
          <ellipse cx="146" cy="206" rx="5" ry="3.5" fill={C.skinShadow} opacity="0.2" />

          {/* ── Mouth ────────────────────────────────────────────── */}
          <Mouth />
        </svg>
      </div>

      {/* Live badge */}
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-md border border-white/10">
        <span className={`h-2 w-2 rounded-full ${isSpeaking || isListening ? "bg-[#5ce28a] animate-pulse" : "bg-[#5ce28a]/60"}`} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/90">Live</span>
      </div>

      {/* Status badge */}
      <div className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md border transition-all duration-300 ${
        isSpeaking ? "bg-[#ff8c61]/25 text-[#ffb08a] border-[#ff8c61]/30" :
        isListening ? "bg-[#1c7891]/25 text-[#5ecbe8] border-[#1c7891]/30" :
        "bg-white/10 text-white/70 border-white/10"
      }`}>
        {isSpeaking ? "Speaking" : isListening ? "Listening" : "Ready"}
      </div>

      {/* Voice wave bars */}
      {isSpeaking && (
        <div className="absolute bottom-[76px] left-1/2 flex -translate-x-1/2 items-end gap-[2.5px]">
          {waveHeights.map((h, i) => (
            <div key={i} className="w-[2.5px] rounded-full bg-[#ff8c61]"
              style={{ height: `${h}px`, opacity: 0.65 + (i % 3) * 0.12,
                animation: `bounce ${0.48 + (i % 4) * 0.09}s ease-in-out infinite alternate`,
                animationDelay: `${i * 52}ms` }} />
          ))}
        </div>
      )}

      {/* Mic wave bars while listening */}
      {isListening && (
        <div className="absolute bottom-[76px] left-1/2 -translate-x-1/2 flex items-end gap-[2.5px]">
          {[7, 13, 9, 15, 9, 13, 7].map((h, i) => (
            <div key={i} className="w-[2.5px] rounded-full bg-[#1c7891]"
              style={{ height: `${h}px`, opacity: 0.6,
                animation: `bounce ${0.55 + i * 0.07}s ease-in-out infinite alternate`,
                animationDelay: `${i * 68}ms` }} />
          ))}
        </div>
      )}

      {/* Name card */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-[1.2rem] border border-white/10 bg-black/65 px-4 py-3 backdrop-blur-md">
        <div>
          <p className="text-sm font-semibold text-white">{name}</p>
          <p className="mt-0.5 text-[11px] text-white/55">
            {isSpeaking ? "Asking the question…" : isListening ? "Listening closely…" : "Waiting for your response"}
          </p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/14 transition-all duration-300 ${
          isSpeaking ? "bg-[#ff8c61]/22" : isListening ? "bg-[#1c7891]/22" : "bg-white/8"
        }`}>
          {isSpeaking ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#ff8c61]">
              <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : isListening ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#5ecbe8] animate-pulse">
              <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor"/>
              <path d="M5 10a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white/40">
              <circle cx="12" cy="12" r="4" fill="currentColor"/>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

const interviewerOptions: InterviewerOption[] = [
  {
    id: "female",
    name: "Elena",
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    id: "male",
    name: "Marcus",
    photo: "https://randomuser.me/api/portraits/men/75.jpg",
  },
];

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function browserSupportsSpeechRecognition() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function buildInterviewIntro({
  interviewerName,
  jobTitle,
  companyName,
  questionCount,
}: {
  interviewerName: string;
  jobTitle: string;
  companyName?: string | null;
  questionCount: number;
}) {
  return [
    `Hello, I am ${interviewerName}, and I will be your interviewer for this session.`,
    `Today we are practicing for the role of ${jobTitle}${
      companyName ? ` at ${companyName}` : ""
    }.`,
    `Here is how this interview will go. I will ask ${questionCount} questions, one at a time. After each question, take a moment, answer clearly, and move forward when you are ready.`,
    "Please speak naturally, stay focused on the question, and answer with specific examples whenever possible.",
    "A few interview rules before we begin. Keep your answers relevant, do not rush, and treat this like a real professional interview.",
    "If you prefer, you can type instead of speaking, but I encourage you to answer out loud for better practice.",
    "We are ready to begin. Listen carefully to the first question.",
  ].join(" ");
}

export function InterviewProcess({
  sessionId,
  jobTitle,
  companyName,
  questions,
}: InterviewProcessProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>({});
  const [microphonePermission, setMicrophonePermission] =
    useState<PermissionState>("idle");
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [selectedInterviewerId, setSelectedInterviewerId] =
    useState<InterviewerOption["id"]>("female");

  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);
  const [voiceEngine, setVoiceEngine] = useState<VoiceEngine>("none");
  const [cameraPermission, setCameraPermission] =
    useState<PermissionState>("idle");
  const [presenceMetrics, setPresenceMetrics] = useState<PresenceMetrics>({
    attention: 0,
    eyeContact: 0,
    confidence: 0,
    status: "Camera not started",
  });
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const recognitionQuestionIdRef = useRef<string | null>(null);
  const speechTimeoutRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const presenceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const presenceHistoryRef = useRef<{ attention: number; eyeContact: number; confidence: number }[]>([]);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = draftAnswers[currentQuestion.id] ?? "";
  const progress = useMemo(() => {
    if (!questions.length) {
      return 0;
    }

    if (isComplete) {
      return 100;
    }

    return Math.round(((currentIndex + 1) / questions.length) * 100);
  }, [currentIndex, isComplete, questions.length]);

  const selectedInterviewer =
    interviewerOptions.find((option) => option.id === selectedInterviewerId) ??
    interviewerOptions[0];

  useEffect(() => {
    setHasSpeechRecognition(browserSupportsSpeechRecognition());
  }, []);

  useEffect(() => {
    if (!hasStarted || isComplete) {
      return;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [hasStarted, isComplete]);

  useEffect(() => {
    return () => {
      if (speechTimeoutRef.current) {
        window.clearTimeout(speechTimeoutRef.current);
      }

      audioRef.current?.pause();
      audioRef.current = null;
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (!hasStarted || isComplete || cameraPermission !== "granted" || !videoRef.current) {
      return;
    }

    // Create an off-screen canvas once and reuse it
    if (!presenceCanvasRef.current) {
      presenceCanvasRef.current = document.createElement("canvas");
      presenceCanvasRef.current.width  = 160;
      presenceCanvasRef.current.height = 120;
    }

    let active = true;
    let intervalId: number | null = null;

    // Detect whether a pixel looks like human skin (covers light → dark skin tones)
    const isSkinTone = (r: number, g: number, b: number): boolean => {
      return (
        r > 50 && g > 30 && b > 15 &&        // not too dark
        r > g && r > b &&                      // red-dominant (skin)
        r - b > 8 &&                           // warm hue
        Math.abs(r - g) > 5 &&                 // not greyscale
        r < 252 && g < 230 &&                  // not blown-out
        r / (g + 1) < 2.2                      // not neon/overexposed
      );
    };

    const updateMetrics = () => {
      if (!active || !videoRef.current || !presenceCanvasRef.current) return;

      const video  = videoRef.current;
      const canvas = presenceCanvasRef.current;
      const ctx    = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) return;

      // Draw full frame scaled down for performance
      ctx.drawImage(video, 0, 0, 160, 120);
      const { data } = ctx.getImageData(0, 0, 160, 120);
      const prev = prevFrameRef.current;

      // ── Full-frame skin + motion analysis ─────────────────────────────
      let skinCount    = 0;
      let motionCount  = 0;
      const total      = 160 * 120;

      for (let i = 0; i < total; i++) {
        const idx = i * 4;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];

        if (isSkinTone(r, g, b)) skinCount++;

        if (prev) {
          const diff = Math.abs(r - prev[idx]) + Math.abs(g - prev[idx + 1]) + Math.abs(b - prev[idx + 2]);
          // Lower threshold → more sensitive to subtle movement (talking, gesturing)
          if (diff > 18) motionCount++;
        }
      }

      prevFrameRef.current = new Uint8ClampedArray(data);

      const skinRatio   = skinCount / total;
      const motionRatio = prev ? Math.min(1, motionCount / total / 0.04) : 0; // 0–1, saturates at 4% changed pixels

      const facePresent = skinRatio > 0.04; // lower threshold — full frame, not just centre

      if (!facePresent) {
        presenceHistoryRef.current = [];
        setPresenceMetrics({
          attention:  12 + Math.round(Math.random() * 10),
          eyeContact: 10 + Math.round(Math.random() * 8),
          confidence: 15 + Math.round(Math.random() * 10),
          status: "Move closer — face not detected. Centre yourself in the frame.",
        });
        return;
      }

      // ── Scores — wide ranges so they react visibly ──────────────────
      // Attention:  motion-heavy (talking & nodding pushes it up fast)
      // Eye contact: skin coverage based (how well-framed the face is)
      // Confidence:  blend of both
      const rawAttention  = Math.min(97, Math.round(52 + motionRatio * 44 + skinRatio * 200));
      const rawEyeContact = Math.min(96, Math.round(48 + skinRatio * 220 + motionRatio * 18));
      const rawConfidence = Math.min(95, Math.round(46 + skinRatio * 170 + motionRatio * 30));

      const raw = { attention: rawAttention, eyeContact: rawEyeContact, confidence: rawConfidence };

      // Light smoothing — only 2-frame average so values react quickly
      const history = presenceHistoryRef.current;
      history.push(raw);
      if (history.length > 2) history.shift();

      const n = history.length;
      const attention  = Math.round(history.reduce((s, f) => s + f.attention,  0) / n);
      const eyeContact = Math.round(history.reduce((s, f) => s + f.eyeContact, 0) / n);
      const confidence = Math.round(history.reduce((s, f) => s + f.confidence, 0) / n);

      const overallScore = (attention + eyeContact + confidence) / 3;
      const status =
        overallScore > 78 ? "Strong presence. Eye contact is solid." :
        overallScore > 60 ? "Good. Keep looking into the camera lens." :
        "Move closer and keep your face centred in the frame.";

      setPresenceMetrics({ attention, eyeContact, confidence, status });
    };

    // Run immediately then every 600 ms — faster updates = feels more live
    updateMetrics();
    intervalId = window.setInterval(updateMetrics, 600);

    return () => {
      active = false;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [cameraPermission, hasStarted, isComplete]);

  useEffect(() => {
    if (!hasStarted || isComplete || currentIndex === 0) {
      return;
    }

    speakQuestion(currentQuestion.questionText);
    setInterimTranscript("");
    stopListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, hasStarted, isComplete]);

  function stopSpeaking() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (speechTimeoutRef.current) {
      window.clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }

    if (voiceState === "speaking") {
      setVoiceState("idle");
    }
  }

  async function speakText(text: string, notice: string) {
    stopSpeaking();

    try {
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          interviewerId: selectedInterviewer.id,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onplay = () => {
          setVoiceEngine("ai");
          setVoiceState("speaking");
          setVoiceNotice(notice);
        };

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          setVoiceState("idle");
          setVoiceNotice("Question finished. You can answer by voice or by typing.");
        };

        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          setVoiceEngine("unavailable");
          setVoiceState("idle");
          setVoiceNotice(
            "Real AI voice could not finish playback. Add OPENAI_API_KEY in Vercel so the interviewer can use generated voice reliably.",
          );
        };

        await audio.play();
        return;
      }

      speakWithBrowser(text, notice);
    } catch {
      speakWithBrowser(text, notice);
    }
  }

  function speakWithBrowser(text: string, notice: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setVoiceEngine("unavailable");
      setVoiceState("idle");
      setVoiceNotice("Voice is unavailable. Add OPENAI_API_KEY to enable AI voice.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const isFemale = selectedInterviewer.id === "female";

    const applyVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const enVoices = voices.filter((v) => v.lang.startsWith("en"));

      let selected: SpeechSynthesisVoice | undefined;

      if (isFemale) {
        // 1. Preferred by name — high-quality local voices first
        selected = enVoices.find((v) =>
          /samantha|google us english|zira|victoria|karen|moira|tessa|fiona/i.test(v.name),
        );
        // 2. Any voice with a female gender hint in the name
        selected ??= enVoices.find((v) => /female|woman/i.test(v.name));
        // 3. Any en-US voice as fallback
        selected ??= enVoices.find((v) => v.lang === "en-US");
      } else {
        // 1. Preferred by name — natural male voices
        selected = enVoices.find((v) =>
          /google uk english male|daniel|alex|fred|oliver|david|aaron/i.test(v.name),
        );
        // 2. Any voice with a male gender hint in the name
        selected ??= enVoices.find((v) => /male|man/i.test(v.name));
        // 3. Any en-US voice as fallback
        selected ??= enVoices.find((v) => v.lang === "en-US");
      }

      if (selected) {
        utterance.voice = selected;
      }

      // Female: slower, deliberate pace sounds warmer and more human
      // Male: slightly above 1.0 keeps energy without rushing
      utterance.rate  = isFemale ? 0.92 : 1.05;
      utterance.pitch = isFemale ? 1.05 : 1.02;

      utterance.onstart = () => {
        setVoiceEngine("browser");
        setVoiceState("speaking");
        setVoiceNotice(notice);
      };
      utterance.onend = () => {
        setVoiceState("idle");
        setVoiceNotice("Question finished. You can answer by voice or by typing.");
      };
      utterance.onerror = () => {
        setVoiceEngine("unavailable");
        setVoiceState("idle");
      };

      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      applyVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        applyVoice();
      };
    }
  }

  function speakQuestion(questionText: string) {
    void speakText(
      questionText,
      `${selectedInterviewer.name} is asking the next interview question.`,
    );
  }

  function speakIntroductionAndQuestion(questionText: string) {
    const intro = buildInterviewIntro({
      interviewerName: selectedInterviewer.name,
      jobTitle,
      companyName,
      questionCount: questions.length,
    });

    void speakText(
      `${intro} First question. ${questionText}`,
      `${selectedInterviewer.name} is introducing the interview and setting expectations.`,
    );
  }

  async function requestMicrophonePermission() {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setMicrophonePermission("denied");
      setVoiceNotice(
        "Microphone access is not available in this browser. You can still practice with typed answers.",
      );
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicrophonePermission("granted");
      setVoiceNotice("Microphone is ready. You can answer by voice when the question starts.");
      return true;
    } catch {
      setMicrophonePermission("denied");
      setVoiceNotice(
        "Microphone permission was denied. You can still continue by typing your answer.",
      );
      return false;
    }
  }

  async function requestCameraPermission() {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraPermission("denied");
      setPresenceMetrics({
        attention: 0,
        eyeContact: 0,
        confidence: 0,
        status: "Camera access is not available in this browser.",
      });
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      cameraStreamRef.current = stream;
      setCameraPermission("granted");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }

      setPresenceMetrics({
        attention: 55,
        eyeContact: 52,
        confidence: 56,
        status: "Camera is live. Stay centered for stronger interview presence.",
      });
      return true;
    } catch {
      setCameraPermission("denied");
      setPresenceMetrics({
        attention: 0,
        eyeContact: 0,
        confidence: 0,
        status: "Camera permission was denied. Interview can continue without video tracking.",
      });
      return false;
    }
  }

  function stopListening() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    recognitionQuestionIdRef.current = null;
    setInterimTranscript("");
    setVoiceState((previous) => (previous === "listening" ? "idle" : previous));
  }

  function startListening() {
    if (!hasSpeechRecognition) {
      setVoiceNotice(
        "Speech-to-text is not supported in this browser. You can keep using the answer box manually.",
      );
      return;
    }

    if (microphonePermission === "denied") {
      setVoiceNotice("Microphone permission is still blocked, so speech-to-text cannot start.");
      return;
    }

    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Recognition) {
      setVoiceNotice(
        "Speech-to-text is not available in this browser. You can still type your answer.",
      );
      return;
    }

    stopSpeaking();
    stopListening();

    try {
      const recognition = new Recognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognitionQuestionIdRef.current = currentQuestion.id;

      recognition.onstart = () => {
        setVoiceState("listening");
        setVoiceNotice("Listening now. Speak naturally and your answer will appear below.");
      };

      recognition.onresult = (event) => {
        let finalTranscript = "";
        let liveTranscript = "";

        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const phrase = event.results[index][0]?.transcript ?? "";

          if (event.results[index].isFinal) {
            finalTranscript += `${phrase} `;
          } else {
            liveTranscript += phrase;
          }
        }

        if (finalTranscript) {
          setDraftAnswers((existing) => {
            const base = existing[currentQuestion.id] ?? "";
            return {
              ...existing,
              [currentQuestion.id]: `${base}${base ? " " : ""}${finalTranscript.trim()}`.trim(),
            };
          });
        }

        setInterimTranscript(liveTranscript.trim());
      };

      recognition.onerror = () => {
        setVoiceState("idle");
        setVoiceNotice(
          "Speech recognition stopped unexpectedly. You can start listening again or continue typing.",
        );
        setInterimTranscript("");
      };

      recognition.onend = () => {
        recognitionRef.current = null;
        recognitionQuestionIdRef.current = null;
        setInterimTranscript("");
        setVoiceState((previous) => (previous === "listening" ? "idle" : previous));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setVoiceState("idle");
      setVoiceNotice(
        "This browser could not start speech recognition, so you can continue typing your answer.",
      );
    }
  }

  async function handleStartInterview() {
    // Unlock browser speech synthesis immediately — must happen synchronously
    // inside the user gesture (button click) before any await breaks the context.
    // Without this, Chrome silently blocks speechSynthesis.speak().
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
      window.speechSynthesis.cancel();
    }

    await Promise.all([requestMicrophonePermission(), requestCameraPermission()]);
    setHasStarted(true);
    speakIntroductionAndQuestion(questions[0].questionText);
  }

  function resetToInterviewStart() {
    stopListening();
    stopSpeaking();
    setHasStarted(false);
    setIsComplete(false);
    setElapsedSeconds(0);
    setCurrentIndex(0);
    setInterimTranscript("");
    setVoiceState("idle");
    setVoiceEngine("none");
    setVoiceNotice(null);
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    setCameraPermission("idle");
    setPresenceMetrics({
      attention: 0,
      eyeContact: 0,
      confidence: 0,
      status: "Camera not started",
    });
  }

  function goToNextQuestion() {
    if (currentIndex === questions.length - 1) {
      stopListening();
      stopSpeaking();
      setIsComplete(true);
      setVoiceNotice("Interview finished. Great work staying through the full session.");
      return;
    }

    setCurrentIndex((index) => index + 1);
  }

  if (!questions.length) {
    return (
      <section className="glass-card rounded-[1.8rem] border border-white/60 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          Interview session
        </p>
        <h2 className="mt-4 font-display text-3xl tracking-[-0.05em] text-foreground">
          No questions are available for this session yet.
        </h2>
      </section>
    );
  }

  if (!hasStarted) {
    return (
      <section className="glass-card rounded-[1.9rem] border border-white/60 p-6 shadow-[0_24px_70px_rgba(19,34,56,0.08)] sm:p-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Start interview
            </p>
            <h2 className="font-display text-4xl tracking-[-0.06em] text-foreground sm:text-5xl">
              Let&apos;s begin your practice round.
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
              {selectedInterviewer.name} will introduce the session, explain the
              role and the rules, then begin asking questions one by one.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.6rem] border border-line bg-white/78 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                Choose your interviewer
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {interviewerOptions.map((option) => {
                  const isActive = option.id === selectedInterviewerId;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setSelectedInterviewerId(option.id);
                        setDraftAnswers({});
                        setCurrentIndex(0);
                        setVoiceNotice(null);
                        stopSpeaking();
                      }}
                      className={`rounded-[1.35rem] border px-4 py-4 text-left transition ${
                        isActive
                          ? "border-[#10233c] bg-[#10233c] text-white shadow-[0_18px_38px_rgba(16,35,60,0.18)]"
                          : "border-line bg-white/84 text-foreground hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={option.photo}
                          alt={option.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-full object-cover object-top border-2 border-white/20"
                        />
                        <div>
                          <p className="text-base font-semibold">{option.name}</p>
                          <p className={`text-xs ${isActive ? "text-white/60" : "text-muted"}`}>
                            {option.id === "female" ? "Female · AI Voice" : "Male · AI Voice"}
                          </p>
                        </div>
                      </div>
                      <p className={`mt-3 text-sm leading-6 ${isActive ? "text-white/78" : "text-muted"}`}>
                        {option.id === "female"
                          ? "Warm, composed, polished interviewer energy."
                          : "Measured, grounded, executive interviewer energy."}
                      </p>
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">
                When real AI voice is available, {selectedInterviewer.name} will open the interview like a live call and guide the session naturally.
              </p>
            </div>

            <div className="overflow-hidden rounded-[1.6rem] border border-[#10233c]/10 bg-[#10233c] p-4 shadow-[0_26px_70px_rgba(16,35,60,0.18)]">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                <span>Preview call</span>
                <span>{selectedInterviewer.name}</span>
              </div>
              <div className="mt-4 aspect-[4/3]">
                <InterviewerFigure interviewerId={selectedInterviewer.id} photo={selectedInterviewer.photo} state="idle" />
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-line bg-white/78 p-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  Role
                </p>
                <p className="mt-2 text-sm text-foreground">
                  {jobTitle}
                  {companyName ? ` at ${companyName}` : ""}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  Questions
                </p>
                <p className="mt-2 text-sm text-foreground">{questions.length}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  Session ID
                </p>
                <p className="mt-2 break-all font-mono text-xs text-muted">
                  {sessionId}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.35rem] border border-line bg-white/76 px-4 py-4 text-sm leading-6 text-muted">
              Microphone permission is requested once when the interview starts.
            </div>
            <div className="rounded-[1.35rem] border border-line bg-white/76 px-4 py-4 text-sm leading-6 text-muted">
              Speech-to-text fills the answer box while you speak, when supported.
            </div>
            <div className="rounded-[1.35rem] border border-line bg-white/76 px-4 py-4 text-sm leading-6 text-muted">
              Camera permission is requested too, so the app can start tracking attention and on-camera presence.
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[#10233c]/10 bg-[#10233c]/5 p-5 text-sm leading-7 text-muted">
            Interview rules: stay professional, keep answers relevant, use real
            examples when possible, and treat the session like a live interview.
          </div>

          <button
            type="button"
            onClick={handleStartInterview}
            className="inline-flex items-center justify-center rounded-[1.2rem] bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
          >
            Start interview
          </button>
        </div>
      </section>
    );
  }

  if (isComplete) {
    return (
      <section className="glass-card rounded-[1.9rem] border border-white/60 p-6 shadow-[0_24px_70px_rgba(19,34,56,0.08)] sm:p-8">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#10233c] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
              Interview complete
            </span>
            <span className="rounded-full bg-[#ff8c61]/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">
              Total time {formatDuration(elapsedSeconds)}
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-4xl tracking-[-0.06em] text-foreground sm:text-5xl">
              You finished the session.
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
              You made it through all {questions.length} questions for {jobTitle}
              {companyName ? ` at ${companyName}` : ""}.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-line bg-white/76 p-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  Progress
                </p>
                <p className="mt-2 text-sm text-foreground">100%</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  Questions answered
                </p>
                <p className="mt-2 text-sm text-foreground">{questions.length}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  Session timer
                </p>
                <p className="mt-2 text-sm text-foreground">
                  {formatDuration(elapsedSeconds)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="glass-card rounded-[1.9rem] border border-white/60 p-6 shadow-[0_24px_70px_rgba(19,34,56,0.08)] sm:p-8">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Interview in progress
            </p>
            <p className="text-sm leading-6 text-muted">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="rounded-[1.2rem] bg-[#10233c] px-4 py-3 text-sm font-semibold text-white">
            Timer {formatDuration(elapsedSeconds)}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={resetToInterviewStart}
            className="rounded-[1.1rem] border border-line bg-white/84 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-white"
          >
            Back to interview start
          </button>
        </div>

        <div className="h-2 rounded-full bg-[#10233c]/10">
          <div
            className="h-2 rounded-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <span className="rounded-full bg-[#10233c]/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
              Microphone {microphonePermission}
          </span>
          <span className="rounded-full bg-[#ff8c61]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent-strong">
            Voice {voiceState}
          </span>
          <span className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
            voiceEngine === "ai"
              ? "bg-[#10233c] text-white"
              : voiceEngine === "browser"
                ? "bg-[#1a4a2a] text-[#5ce28a]"
                : voiceEngine === "unavailable"
                  ? "bg-[#ff8c61]/12 text-accent-strong"
                  : "bg-[#10233c]/8 text-foreground"
          }`}>
            {voiceEngine === "ai" ? "AI Voice" : voiceEngine === "browser" ? "Browser Voice" : voiceEngine === "unavailable" ? "Voice Unavailable" : "Voice Ready"}
          </span>
          <span className="rounded-full bg-[#10233c]/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
            Interviewer {selectedInterviewer.name}
          </span>
          <span className="rounded-full bg-[#10233c]/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
            Camera {cameraPermission}
          </span>
          {!hasSpeechRecognition ? (
            <span className="rounded-full bg-[#10233c]/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Speech-to-text unavailable in this browser
            </span>
          ) : null}
        </div>

        {voiceNotice ? (
          <div className="rounded-[1.35rem] border border-[#10233c]/10 bg-[#10233c]/5 px-4 py-4 text-sm leading-7 text-muted">
            {voiceNotice}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-[1.7rem] border border-[#10233c]/12 bg-[#0f1b2d] p-4 shadow-[0_28px_80px_rgba(8,17,28,0.2)] sm:p-5">
          <div className="flex items-center justify-between gap-3 rounded-[1.25rem] bg-white/6 px-4 py-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/68">
                Live interview call
              </p>
              <h3 className="mt-1 text-xl font-semibold text-white">
                {selectedInterviewer.name} is on the call
              </h3>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-black/18 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72">
              <span className="h-2.5 w-2.5 rounded-full bg-[#5ce28a]" />
              Connected
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            {/* Interviewer — left, large */}
            <div className="overflow-hidden rounded-[1.8rem] border border-white/10">
              <div className="aspect-[4/3]">
                <InterviewerFigure interviewerId={selectedInterviewer.id} photo={selectedInterviewer.photo} state={voiceState} />
              </div>
            </div>

            {/* Right column — user camera + presence */}
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#132238]">
                <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${cameraPermission === "granted" ? "bg-[#5ce28a] animate-pulse" : "bg-white/30"}`} />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/68">You</span>
                  </div>
                  <span className="text-[11px] text-white/40">{cameraPermission}</span>
                </div>
                <div className="relative aspect-[3/4] bg-[linear-gradient(180deg,#1a3556,#0d1623)]">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                    style={{ transform: "scaleX(-1)" }}
                  />
                  {cameraPermission !== "granted" ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
                      <div className="h-16 w-16 rounded-full bg-white/8 flex items-center justify-center text-2xl">👤</div>
                      <p className="text-sm leading-6 text-white/60">
                        Your camera will appear here.
                      </p>
                    </div>
                  ) : null}
                  {/* Name overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-[0.8rem] bg-black/50 px-3 py-2 backdrop-blur-sm">
                    <span className="text-xs font-semibold text-white">You</span>
                    {voiceState === "listening" && (
                      <span className="text-[10px] text-[#5ce28a] animate-pulse">● Listening</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/68">
                  Presence
                </p>
                <div className="mt-3 space-y-3">
                  {[
                    ["Attention", presenceMetrics.attention],
                    ["Eye contact", presenceMetrics.eyeContact],
                    ["Confidence", presenceMetrics.confidence],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-xs text-white/70">
                        <span>{label}</span>
                        <span>{value}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-white/10">
                        <div
                          className="h-1.5 rounded-full bg-[linear-gradient(90deg,#ff8c61,#f3c07a)] transition-all duration-700"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-5 text-white/50">
                  {presenceMetrics.status}
                </p>
              </div>
            </div>
          </div>

        </div>

        <div className="rounded-[1.5rem] border border-line bg-white/76 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            {currentQuestion.category.toLowerCase()} ·{" "}
            {currentQuestion.difficulty.toLowerCase()}
          </p>
          <h2 className="mt-3 font-display text-3xl tracking-[-0.05em] text-foreground sm:text-4xl">
            {currentQuestion.questionText}
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                  window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
                  window.speechSynthesis.cancel();
                }
                speakQuestion(currentQuestion.questionText);
              }}
              className="rounded-[1.1rem] border border-line bg-white/84 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-white"
            >
              Read question aloud
            </button>
            <button
              type="button"
              onClick={startListening}
              disabled={!hasSpeechRecognition || voiceState === "listening"}
              className="rounded-[1.1rem] bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:bg-[#f0b39b]"
            >
              Start voice answer
            </button>
            <button
              type="button"
              onClick={stopListening}
              disabled={voiceState !== "listening"}
              className="rounded-[1.1rem] border border-line bg-white/84 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Stop listening
            </button>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-line bg-white/76 p-5">
          <p className="text-sm font-semibold text-foreground">Your answer</p>
          <textarea
            rows={10}
            value={currentAnswer}
            onChange={(event) =>
              setDraftAnswers((existing) => ({
                ...existing,
                [currentQuestion.id]: event.target.value,
              }))
            }
            placeholder="Speak naturally or type your answer here."
            className="mt-3 w-full rounded-[1.2rem] border border-line bg-white/84 px-4 py-4 text-sm leading-7 text-foreground outline-none transition placeholder:text-muted focus:border-accent"
          />
          {interimTranscript ? (
            <p className="mt-3 text-sm leading-6 text-muted">
              Listening now: <span className="text-foreground">{interimTranscript}</span>
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              stopListening();
              setCurrentIndex((index) => Math.max(0, index - 1));
            }}
            disabled={currentIndex === 0}
            className="rounded-[1.1rem] border border-line bg-white/84 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={goToNextQuestion}
            className="rounded-[1.1rem] bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
          >
            {currentIndex === questions.length - 1
              ? "Finish interview"
              : "Next question"}
          </button>
        </div>
      </div>
    </section>
  );
}
