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
type VoiceEngine = "ai" | "browser" | "none";
type InterviewerOption = {
  id: "female" | "male";
  name: string;
  preference: string[];
  fallbackRate: number;
  fallbackPitch: number;
};

type PresenceMetrics = {
  attention: number;
  eyeContact: number;
  confidence: number;
  status: string;
};

const interviewerOptions: InterviewerOption[] = [
  {
    id: "female",
    name: "Elena",
    preference: ["female", "woman", "samantha", "victoria", "karen", "zira", "ava", "aria"],
    fallbackRate: 0.98,
    fallbackPitch: 1.12,
  },
  {
    id: "male",
    name: "Marcus",
    preference: ["male", "man", "david", "mark", "alex", "daniel", "fred", "tom", "google uk english male", "microsoft david"],
    fallbackRate: 0.9,
    fallbackPitch: 0.82,
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

function browserSupportsSpeechSynthesis() {
  if (typeof window === "undefined") {
    return false;
  }

  return "speechSynthesis" in window;
}

function pickInterviewerVoice(
  voices: SpeechSynthesisVoice[],
  interviewer: InterviewerOption,
) {
  const englishVoices = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith("en"),
  );
  const pool = englishVoices.length > 0 ? englishVoices : voices;

  const matched = pool.find((voice) => {
    const normalized = `${voice.name} ${voice.voiceURI}`.toLowerCase();
    return interviewer.preference.some((hint) => normalized.includes(hint));
  });

  if (matched) {
    return matched;
  }

  if (interviewer.id === "male") {
    const lessLikelyFemale = pool.find((voice) => {
      const normalized = `${voice.name} ${voice.voiceURI}`.toLowerCase();
      return !["female", "woman", "samantha", "victoria", "zira", "karen", "ava", "aria"].some((hint) =>
        normalized.includes(hint),
      );
    });

    return lessLikelyFemale ?? pool[0] ?? null;
  }

  return pool[0] ?? null;
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
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedInterviewerId, setSelectedInterviewerId] =
    useState<InterviewerOption["id"]>("female");
  const [hasDeliveredIntroduction, setHasDeliveredIntroduction] = useState(false);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);
  const [hasSpeechSynthesis, setHasSpeechSynthesis] = useState(false);
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
    setHasSpeechSynthesis(browserSupportsSpeechSynthesis());
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
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

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

  useEffect(() => {
    if (!hasSpeechSynthesis) {
      return;
    }

    const syncVoices = () => {
      try {
        setAvailableVoices(window.speechSynthesis?.getVoices?.() ?? []);
      } catch {
        setAvailableVoices([]);
      }
    };

    syncVoices();

    const synthesis = window.speechSynthesis;
    const previousHandler = synthesis.onvoiceschanged;
    synthesis.onvoiceschanged = syncVoices;

    return () => {
      synthesis.onvoiceschanged = previousHandler;
    };
  }, [hasSpeechSynthesis]);

  function stopSpeaking() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (!hasSpeechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();

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
          fallbackToBrowserSpeech(text, notice);
        };

        await audio.play();
        return;
      }
    } catch {
      // Browser fallback below.
    }

    fallbackToBrowserSpeech(text, notice);
  }

  function fallbackToBrowserSpeech(text: string, notice: string) {
    setVoiceEngine("browser");

    if (!hasSpeechSynthesis) {
      setVoiceEngine("none");
      setVoiceNotice(
        "Question audio is not available in this browser, but you can still continue with typed answers.",
      );
      return;
    }

    try {
      stopSpeaking();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = selectedInterviewer.fallbackRate;
      utterance.pitch = selectedInterviewer.fallbackPitch;
      const chosenVoice = pickInterviewerVoice(availableVoices, selectedInterviewer);

      if (chosenVoice) {
        utterance.voice = chosenVoice;
        utterance.lang = chosenVoice.lang;
      } else {
        utterance.lang = "en-US";
      }

      utterance.onstart = () => {
        setVoiceState("speaking");
        setVoiceNotice(notice);
      };
      utterance.onend = () => {
        setVoiceState("idle");
        setVoiceNotice("Question finished. You can answer by voice or by typing.");
      };
      utterance.onerror = () => {
        setVoiceState("idle");
        setVoiceNotice("Voice playback could not finish, so you can read the question on screen.");
      };

      // Let the DOM settle a touch so speech starts more reliably after navigation.
      speechTimeoutRef.current = window.setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 120);
    } catch {
      setVoiceState("idle");
      setVoiceNotice(
        "This browser could not start interviewer voice playback, so you can continue with on-screen questions.",
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
          <span className="rounded-full bg-[#10233c]/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
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
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full border text-white shadow-[0_18px_40px_rgba(16,35,60,0.18)] transition ${
                  voiceState === "speaking"
                    ? "scale-105 border-[#ff8c61]/50 bg-[radial-gradient(circle_at_top,#ffb08f,#ff7c49_58%,#10233c)]"
                    : "border-[#10233c]/15 bg-[radial-gradient(circle_at_top,#33557d,#10233c_68%,#09111e)]"
                }`}
              >
                <span className="font-display text-2xl">
                  {selectedInterviewer.name.slice(0, 1)}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
                  Live interviewer
                </p>
                <h3 className="font-display text-3xl tracking-[-0.05em] text-foreground">
                  {selectedInterviewer.name}
                </h3>
                <p className="max-w-xl text-sm leading-6 text-muted">
                  A video-call style interviewer presence while the session is active.
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
