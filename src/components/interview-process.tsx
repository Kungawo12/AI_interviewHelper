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
    <div
      className={`relative h-56 w-44 overflow-hidden rounded-[2rem] border shadow-[0_24px_60px_rgba(16,35,60,0.18)] transition ${
        isSpeaking
          ? "scale-[1.02] border-[#ff8c61]/40 bg-[linear-gradient(180deg,#fff2ec_0%,#ffe7dc_34%,#f4f7fb_100%)]"
          : isListening
            ? "scale-[1.01] border-[#1c7891]/30 bg-[linear-gradient(180deg,#eef8fb_0%,#e3f1f4_34%,#f4f7fb_100%)]"
            : "border-[#10233c]/10 bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fb_42%,#f4f7fb_100%)]"
      }`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-24 ${
          isSpeaking
            ? "bg-[radial-gradient(circle_at_top,rgba(255,140,97,0.22),transparent_68%)]"
            : isListening
              ? "bg-[radial-gradient(circle_at_top,rgba(28,120,145,0.18),transparent_68%)]"
              : "bg-[radial-gradient(circle_at_top,rgba(16,35,60,0.08),transparent_68%)]"
        }`}
      />
      <div className="absolute inset-x-0 top-7 flex justify-center">
        <svg viewBox="0 0 220 300" className="h-48 w-40">
          <ellipse cx="110" cy="268" rx="64" ry="18" fill="rgba(16,35,60,0.08)" />
          <path
            d={isFemale ? "M64 108 C72 62, 148 58, 156 110 L156 142 C146 134, 128 128, 110 128 C92 128, 74 134, 64 142 Z" : "M70 110 C78 70, 144 68, 150 110 L148 132 C136 126, 122 124, 110 124 C96 124, 82 126, 72 132 Z"}
            fill={isFemale ? "#2e2521" : "#221b17"}
          />
          <ellipse cx="110" cy="125" rx="42" ry="48" fill="#f0c6a8" />
          <path
            d={isFemale ? "M72 116 C80 94, 140 94, 148 116 L148 88 C136 66, 84 66, 72 88 Z" : "M78 108 C88 86, 132 86, 142 108 L142 90 C132 72, 88 72, 78 90 Z"}
            fill={isFemale ? "#2e2521" : "#221b17"}
          />
          <ellipse cx="95" cy="122" rx={isListening ? 6 : 5} ry={isSpeaking ? 4 : 5} fill="#2b231f" />
          <ellipse cx="125" cy="122" rx={isListening ? 6 : 5} ry={isSpeaking ? 4 : 5} fill="#2b231f" />
          <path d="M98 145 Q110 152 122 145" stroke="#b47b65" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path
            d={
              isSpeaking
                ? "M98 158 Q110 174 122 158 Q110 184 98 158"
                : isListening
                  ? "M99 160 Q110 168 121 160"
                  : "M101 160 Q110 164 119 160"
            }
            fill={isSpeaking ? "#9f5548" : "none"}
            stroke={isSpeaking ? "#8f4d43" : "#8f4d43"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M102 153 Q110 149 118 153" stroke="#d89c87" strokeWidth="2" fill="none" strokeLinecap="round" />
          <rect x="98" y="170" width="24" height="16" rx="10" fill="#f0c6a8" />
          <path
            d={isFemale ? "M52 286 C60 224, 74 198, 110 198 C146 198, 160 224, 168 286 Z" : "M54 286 C62 228, 78 202, 110 202 C142 202, 158 228, 166 286 Z"}
            fill={isFemale ? "#d96d55" : "#19334f"}
          />
          <path
            d={isFemale ? "M86 198 L110 224 L134 198" : "M92 202 L110 224 L128 202"}
            fill={isFemale ? "#f4ede6" : "#d9e6f3"}
          />
          <rect x="100" y="224" width="20" height="54" rx="10" fill={isFemale ? "#b65945" : "#10233c"} />
        </svg>
      </div>
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
          isSpeaking
            ? "bg-[#10233c] text-white"
            : isListening
              ? "bg-[#1c7891] text-white"
              : "bg-white/80 text-[#10233c]"
        }`}
      >
        {isSpeaking ? "Speaking" : isListening ? "Listening" : "Waiting"}
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
    if (!hasStarted || isComplete) {
      return;
    }

    if (!hasDeliveredIntroduction && currentIndex === 0) {
      return;
    }

    if (currentIndex > 0 || hasDeliveredIntroduction) {
      speakQuestion(currentQuestion.questionText);
    }
    setInterimTranscript("");
    stopListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, hasDeliveredIntroduction, hasStarted, isComplete]);

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

  async function speakText(text: string, notice: string, mode: "intro" | "question") {
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
          mode,
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
      "question",
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
      "intro",
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

          <div className="rounded-[1.5rem] border border-line bg-white/78 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Choose your interviewer
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {interviewerOptions.map((option) => {
                const isActive = option.id === selectedInterviewerId;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedInterviewerId(option.id)}
                    className={`rounded-[1.2rem] px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-[#10233c] text-white"
                        : "border border-line bg-white/84 text-foreground hover:bg-white"
                    }`}
                  >
                    {option.name}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">
              Choose the interviewer voice that feels more comfortable for your
              practice session.
            </p>
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

        <div className="rounded-[1.5rem] border border-line bg-white/76 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-[220px] flex-1 items-start gap-4">
              <InterviewerFigure interviewerId={selectedInterviewer.id} state={voiceState} />
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
                  Live interviewer
                </p>
                <h3 className="font-display text-3xl tracking-[-0.05em] text-foreground">
                  {selectedInterviewer.name}
                </h3>
                <p className="max-w-xl text-sm leading-6 text-muted">
                  A more human, video-call style interviewer presence while the session is active.
                </p>
              </div>
            </div>

            <div className="w-full max-w-[250px] overflow-hidden rounded-[1.4rem] border border-[#10233c]/10 bg-[#10233c]">
              <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                <span>Your camera</span>
                <span>{cameraPermission}</span>
              </div>
              <div className="relative aspect-[4/5] bg-[linear-gradient(180deg,#183252,#0f1b2d)]">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
                {cameraPermission !== "granted" ? (
                  <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm leading-6 text-white/72">
                    Camera preview will appear here after permission is granted.
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.2rem] border border-[#10233c]/10 bg-[#10233c]/4 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                Attention
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {presenceMetrics.attention}%
              </p>
            </div>
            <div className="rounded-[1.2rem] border border-[#10233c]/10 bg-[#10233c]/4 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                Eye contact
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {presenceMetrics.eyeContact}%
              </p>
            </div>
            <div className="rounded-[1.2rem] border border-[#10233c]/10 bg-[#10233c]/4 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                Confidence
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {presenceMetrics.confidence}%
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">
            {presenceMetrics.status}
          </p>
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
