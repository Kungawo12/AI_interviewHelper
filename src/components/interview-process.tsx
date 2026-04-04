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
  photo,
  state,
}: {
  interviewerId: "female" | "male";
  photo: string;
  state: VoiceState;
}) {
  const isSpeaking = state === "speaking";
  const isListening = state === "listening";
  const name = interviewerId === "female" ? "Elena" : "Marcus";

  return (
    <div className="relative h-full min-h-[340px] overflow-hidden rounded-[2rem] bg-[#0d1827] shadow-[0_30px_80px_rgba(7,18,32,0.38)]">
      {/* Photo fills the frame */}
      <Image
        src={photo}
        alt={name}
        fill
        className={`object-cover object-top transition-all duration-300 ${
          isSpeaking ? "scale-[1.02]" : "scale-100"
        }`}
      />

      {/* Dark gradient at bottom for readability */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Speaking pulse ring */}
      {isSpeaking && (
        <>
          <div className="absolute inset-0 rounded-[2rem] border-2 border-[#ff8c61]/70 animate-pulse" />
          <div className="absolute inset-[6px] rounded-[1.6rem] border border-[#ff8c61]/30 animate-pulse" style={{ animationDelay: "150ms" }} />
        </>
      )}

      {/* Listening ring */}
      {isListening && (
        <div className="absolute inset-0 rounded-[2rem] border-2 border-[#1c7891]/70 animate-pulse" />
      )}

      {/* Live badge */}
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-md">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#5ce28a]" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90">Live</span>
      </div>

      {/* Status badge */}
      <div className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md transition-colors ${
        isSpeaking
          ? "bg-[#ff8c61]/30 text-[#ffb08a]"
          : isListening
            ? "bg-[#1c7891]/30 text-[#5ecbe8]"
            : "bg-white/12 text-white/80"
      }`}>
        {isSpeaking ? "Speaking" : isListening ? "Listening" : "Ready"}
      </div>

      {/* Sound wave bars when speaking */}
      {isSpeaking && (
        <div className="absolute bottom-[72px] left-1/2 flex -translate-x-1/2 items-end gap-[3px]">
          {[12, 20, 28, 20, 14, 24, 16].map((h, i) => (
            <div
              key={i}
              className="w-[3px] rounded-full bg-[#ff8c61]/80 animate-bounce"
              style={{ height: `${h}px`, animationDelay: `${i * 80}ms`, animationDuration: "600ms" }}
            />
          ))}
        </div>
      )}

      {/* Bottom info */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-[1.2rem] border border-white/10 bg-black/50 px-4 py-3 backdrop-blur-md">
        <div>
          <p className="text-sm font-semibold text-white">{name}</p>
          <p className="mt-0.5 text-xs text-white/60">
            {isSpeaking ? "Asking the question..." : isListening ? "Listening closely" : "Waiting for your response"}
          </p>
        </div>
        <div className={`h-9 w-9 rounded-full border border-white/16 transition-colors ${
          isSpeaking
            ? "bg-[radial-gradient(circle,rgba(255,140,97,0.9),rgba(255,140,97,0.16))] animate-pulse"
            : isListening
              ? "bg-[radial-gradient(circle,rgba(28,120,145,0.9),rgba(28,120,145,0.16))] animate-pulse"
              : "bg-[radial-gradient(circle,rgba(255,255,255,0.3),rgba(255,255,255,0.06))]"
        }`} />
      </div>
    </div>
  );
}

const interviewerOptions: InterviewerOption[] = [
  {
    id: "female",
    name: "Elena",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "male",
    name: "Marcus",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
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
      const preferred = voices.find((v) =>
        isFemale
          ? /samantha|victoria|karen|moira|tessa|fiona|female|zira/i.test(v.name)
          : /daniel|alex|fred|oliver|google uk english male|david/i.test(v.name),
      );
      if (preferred) {
        utterance.voice = preferred;
      }
      utterance.pitch = isFemale ? 1.1 : 0.82;
      utterance.rate = 0.9;

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
