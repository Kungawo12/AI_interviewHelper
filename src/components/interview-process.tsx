"use client";

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
type VoiceEngine = "ai" | "unavailable" | "none";
type InterviewerOption = {
  id: "female" | "male";
  name: string;
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
  state: VoiceState;
}) {
  const isFemale = interviewerId === "female";
  const isSpeaking = state === "speaking";
  const isListening = state === "listening";

  return (
    <div className="relative h-full min-h-[340px] overflow-hidden rounded-[2rem] border border-white/12 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_35%),linear-gradient(180deg,#203452_0%,#15253a_44%,#0d1827_100%)] shadow-[0_30px_80px_rgba(7,18,32,0.38)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_20%),radial-gradient(circle_at_80%_10%,rgba(255,140,97,0.18),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
      <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-black/18 px-3 py-1.5 backdrop-blur-md">
        <span className="h-2.5 w-2.5 rounded-full bg-[#5ce28a]" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/88">
          Live interviewer
        </span>
      </div>
      <div className="absolute right-5 top-5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur-md">
        {isSpeaking ? "Speaking" : isListening ? "Listening" : "Ready"}
      </div>

      <div className="absolute inset-x-0 bottom-0 top-[18%] flex items-end justify-center">
        <svg viewBox="0 0 320 420" className="h-[92%] w-full max-w-[380px]">
          <defs>
            <linearGradient id={`suitTone-${interviewerId}`} x1="0" x2="1">
              <stop offset="0%" stopColor={isFemale ? "#b55640" : "#1c3150"} />
              <stop offset="100%" stopColor={isFemale ? "#7e3f34" : "#10233c"} />
            </linearGradient>
            <linearGradient id={`skinTone-${interviewerId}`} x1="0" x2="1">
              <stop offset="0%" stopColor="#f4d2b8" />
              <stop offset="100%" stopColor="#eeb996" />
            </linearGradient>
          </defs>

          <ellipse cx="160" cy="392" rx="92" ry="18" fill="rgba(8,15,26,0.28)" />
          <path
            d={isFemale ? "M98 382 C106 300, 124 254, 160 254 C196 254, 214 300, 222 382 Z" : "M94 382 C104 302, 126 260, 160 260 C194 260, 216 302, 226 382 Z"}
            fill={`url(#suitTone-${interviewerId})`}
          />
          <path
            d={isFemale ? "M128 256 L160 290 L192 256" : "M134 262 L160 292 L186 262"}
            fill={isFemale ? "#f6efe9" : "#dce7f2"}
          />
          <rect x="150" y="290" width="20" height="74" rx="10" fill={isFemale ? "#953f31" : "#0b1a2d"} />
          <path d="M146 232 C146 218, 174 218, 174 232 L174 260 C174 270, 146 270, 146 260 Z" fill={`url(#skinTone-${interviewerId})`} />
          <ellipse cx="160" cy="150" rx="62" ry="76" fill={`url(#skinTone-${interviewerId})`} />
          <path
            d={
              isFemale
                ? "M96 154 C100 92, 132 58, 192 82 C214 90, 226 112, 224 146 C206 124, 179 112, 159 112 C132 112, 110 124, 96 154 Z"
                : "M102 154 C108 96, 136 70, 188 86 C212 94, 222 116, 220 146 C208 122, 184 110, 160 110 C134 110, 116 120, 102 154 Z"
            }
            fill={isFemale ? "#2b211d" : "#241d18"}
          />
          <path
            d={
              isFemale
                ? "M100 144 C94 108, 116 74, 152 72 L204 88 C214 114, 214 146, 206 176 C194 154, 176 140, 160 138 C138 136, 116 140, 100 144 Z"
                : "M106 140 C104 102, 126 78, 162 74 L204 90 C212 114, 212 144, 202 172 C188 150, 174 140, 160 138 C140 136, 122 138, 106 140 Z"
            }
            fill={isFemale ? "#332822" : "#2c241e"}
          />
          <ellipse cx="136" cy="154" rx="8" ry={isSpeaking ? 4.6 : 5.6} fill="#2b231f" />
          <ellipse cx="184" cy="154" rx="8" ry={isSpeaking ? 4.6 : 5.6} fill="#2b231f" />
          <path d="M146 182 Q160 192 174 182" stroke="#b67a62" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path
            d={
              isSpeaking
                ? "M142 206 Q160 228 178 206 Q160 238 142 206"
                : isListening
                  ? "M144 208 Q160 218 176 208"
                  : "M146 208 Q160 214 174 208"
            }
            fill={isSpeaking ? "#9e564c" : "none"}
            stroke="#8f4d43"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M144 136 Q152 128 160 132 Q168 128 176 136" stroke="#3a2b23" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M112 274 C108 246, 114 230, 132 224" stroke={`url(#suitTone-${interviewerId})`} strokeWidth="22" strokeLinecap="round" fill="none" />
          <path d="M208 274 C212 246, 206 230, 188 224" stroke={`url(#suitTone-${interviewerId})`} strokeWidth="22" strokeLinecap="round" fill="none" />
        </svg>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-[1.3rem] border border-white/10 bg-black/22 px-4 py-3 backdrop-blur-md">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/68">
            Interview mode
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {isSpeaking ? "Asking the question" : isListening ? "Listening closely" : "Waiting for your response"}
          </p>
        </div>
        <div className={`h-12 w-12 rounded-full border border-white/16 ${
          isSpeaking
            ? "bg-[radial-gradient(circle,rgba(255,140,97,0.9),rgba(255,140,97,0.16))]"
            : isListening
              ? "bg-[radial-gradient(circle,rgba(28,120,145,0.9),rgba(28,120,145,0.16))]"
              : "bg-[radial-gradient(circle,rgba(255,255,255,0.36),rgba(255,255,255,0.08))]"
        }`} />
      </div>
    </div>
  );
}

const interviewerOptions: InterviewerOption[] = [
  {
    id: "female",
    name: "Elena",
  },
  {
    id: "male",
    name: "Marcus",
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
  const [hasDeliveredIntroduction, setHasDeliveredIntroduction] = useState(false);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);
  const [voiceEngine, setVoiceEngine] = useState<VoiceEngine>("none");
  const [cameraPermission, setCameraPermission] =
    useState<PermissionState>("idle");
  const [hasFaceDetection, setHasFaceDetection] = useState(false);
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
    setHasFaceDetection(typeof window !== "undefined" && "FaceDetector" in window);
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

    let active = true;
    let detector: FaceDetector | null = null;
    let intervalId: number | null = null;

    if (hasFaceDetection && window.FaceDetector) {
      detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
    }

    const updateMetrics = async () => {
      if (!active || !videoRef.current) {
        return;
      }

      const video = videoRef.current;

      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        return;
      }

      if (!detector) {
        setPresenceMetrics({
          attention: 72,
          eyeContact: 68,
          confidence: 70,
          status: "Camera is live. Advanced face tracking depends on browser support.",
        });
        return;
      }

      try {
        const faces = await detector.detect(video);

        if (!faces.length) {
          setPresenceMetrics({
            attention: 24,
            eyeContact: 18,
            confidence: 30,
            status: "Face not detected clearly. Move into the center of the frame.",
          });
          return;
        }

        const face = faces[0];
        const box = face.boundingBox;
        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;
        const offsetX = Math.abs(centerX / video.videoWidth - 0.5);
        const offsetY = Math.abs(centerY / video.videoHeight - 0.5);
        const centeredScore = Math.max(0, 1 - (offsetX + offsetY) * 1.35);
        const faceSizeRatio = box.width / video.videoWidth;
        const sizeScore = Math.max(0, 1 - Math.abs(faceSizeRatio - 0.28) * 3.4);

        const attention = Math.round(50 + centeredScore * 50);
        const eyeContact = Math.round(40 + centeredScore * 60);
        const confidence = Math.round(42 + (centeredScore * 0.6 + sizeScore * 0.4) * 58);

        setPresenceMetrics({
          attention,
          eyeContact,
          confidence,
          status:
            centeredScore > 0.72
              ? "Strong on-camera presence right now."
              : "Good start. Lift your eyeline and center yourself a little more.",
        });
      } catch {
        setPresenceMetrics({
          attention: 68,
          eyeContact: 64,
          confidence: 67,
          status: "Camera is live. Tracking is limited in this browser right now.",
        });
      }
    };

    intervalId = window.setInterval(() => {
      void updateMetrics();
    }, 1800);

    void updateMetrics();

    return () => {
      active = false;

      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [cameraPermission, hasFaceDetection, hasStarted, isComplete]);

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

      setVoiceEngine("unavailable");
      setVoiceState("idle");
      setVoiceNotice(
        "Real AI voice is unavailable right now. Add OPENAI_API_KEY in Vercel to enable distinct Elena and Marcus voices.",
      );
    } catch {
      setVoiceEngine("unavailable");
      setVoiceState("idle");
      setVoiceNotice(
        "Real AI voice could not start. Add OPENAI_API_KEY in Vercel so the interviewer can use real generated voice.",
      );
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
    await Promise.all([requestMicrophonePermission(), requestCameraPermission()]);
    setHasDeliveredIntroduction(true);
    setHasStarted(true);
    speakIntroductionAndQuestion(questions[0].questionText);
  }

  function resetToInterviewStart() {
    stopListening();
    stopSpeaking();
    setHasStarted(false);
    setHasDeliveredIntroduction(false);
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
                      onClick={() => setSelectedInterviewerId(option.id)}
                      className={`rounded-[1.35rem] border px-4 py-4 text-left transition ${
                        isActive
                          ? "border-[#10233c] bg-[#10233c] text-white shadow-[0_18px_38px_rgba(16,35,60,0.18)]"
                          : "border-line bg-white/84 text-foreground hover:bg-white"
                      }`}
                    >
                      <p className="text-base font-semibold">{option.name}</p>
                      <p className={`mt-2 text-sm leading-6 ${isActive ? "text-white/78" : "text-muted"}`}>
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
                <InterviewerFigure interviewerId={selectedInterviewer.id} state="idle" />
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
              : voiceEngine === "unavailable"
                ? "bg-[#ff8c61]/12 text-accent-strong"
                : "bg-[#10233c]/8 text-foreground"
          }`}>
            Engine {voiceEngine}
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

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#15253a] p-3">
              <div className="aspect-[16/10]">
                <InterviewerFigure interviewerId={selectedInterviewer.id} state={voiceState} />
              </div>
              <div className="pointer-events-none absolute bottom-6 left-6 rounded-[1.3rem] border border-white/10 bg-black/22 px-4 py-3 backdrop-blur-md">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/68">
                  Interviewer
                </p>
                <p className="mt-1 text-base font-semibold text-white">
                  {selectedInterviewer.name}
                </p>
                <p className="mt-1 text-sm text-white/70">
                  {voiceState === "speaking"
                    ? "Speaking naturally and guiding the session."
                    : voiceState === "listening"
                      ? "Listening and observing your delivery."
                      : "Waiting for your response."}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#132238]">
                <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/68">
                  <span>Your camera</span>
                  <span>{cameraPermission}</span>
                </div>
                <div className="relative aspect-[4/5] bg-[linear-gradient(180deg,#1a3556,#0d1623)]">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                  {cameraPermission !== "granted" ? (
                    <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm leading-6 text-white/72">
                      Your live preview will appear here after camera permission is granted.
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/68">
                  Presence read
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    ["Attention", presenceMetrics.attention],
                    ["Eye contact", presenceMetrics.eyeContact],
                    ["Confidence", presenceMetrics.confidence],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-sm text-white/82">
                        <span>{label}</span>
                        <span>{value}%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-white/10">
                        <div
                          className="h-2 rounded-full bg-[linear-gradient(90deg,#ff8c61,#f3c07a)]"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-white/66">
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
              onClick={() => speakQuestion(currentQuestion.questionText)}
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
