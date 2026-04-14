import { NextResponse } from "next/server";

type VoiceRequest = {
  text?: string;
  voiceId?: string;                    // OpenAI voice name (nova, shimmer, onyx, etc.)
  interviewerId?: "female" | "male";   // legacy fallback
};

// OpenAI voice → gender mapping (for Google/ElevenLabs fallback)
const openAiVoiceGender: Record<string, "female" | "male"> = {
  nova: "female", shimmer: "female", coral: "female", sage: "female",
  onyx: "male",   echo: "male",      fable: "male",   ash: "male",
  alloy: "female", verse: "male",    ballad: "male",
};

// Google Cloud Journey voices — conversational, natural American English
const googleVoiceConfig = {
  female: { name: "en-US-Journey-F", ssmlGender: "FEMALE" },
  male:   { name: "en-US-Journey-D", ssmlGender: "MALE"   },
} as const;

// ElevenLabs voice IDs — 10,000 chars/month free
const elevenLabsVoiceConfig = {
  female: { voiceId: "21m00Tcm4TlvDq8ikWAM" }, // Rachel
  male:   { voiceId: "pNInz6obpgDQGcFmaJgB" }, // Adam
} as const;

export async function POST(request: Request) {
  const openAiKey     = process.env.OPENAI_API_KEY;
  const googleKey     = process.env.GOOGLE_TTS_API_KEY;
  const elevenLabsKey = process.env.ELEVENLABS_API_KEY;

  let body: VoiceRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json({ error: "Text is required." }, { status: 400 });
  }

  // Resolve the OpenAI voice name and gender
  const openAiVoice =
    body.voiceId ??
    (body.interviewerId === "male" ? "onyx" : "nova");

  const gender: "female" | "male" =
    openAiVoiceGender[openAiVoice] ??
    (body.interviewerId === "male" ? "male" : "female");

  // ── OpenAI TTS (primary — highest quality, user has key) ─────────────────
  if (openAiKey && openAiKey !== "your-openai-api-key") {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${openAiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "tts-1-hd",
        voice: openAiVoice,
        input: text,
        response_format: "mp3",
      }),
    });

    if (response.ok) {
      const audioBuffer = await response.arrayBuffer();
      return new NextResponse(audioBuffer, {
        status: 200,
        headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store, max-age=0" },
      });
    }
  }

  // ── Google Cloud TTS (secondary — 1M chars/month free) ───────────────────
  if (googleKey) {
    const voice = googleVoiceConfig[gender];

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input:       { text },
          voice:       { languageCode: "en-US", name: voice.name, ssmlGender: voice.ssmlGender },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: gender === "female" ? 1.0 : 1.05,
            pitch: 0.0,
          },
        }),
      },
    );

    if (response.ok) {
      const data = (await response.json()) as { audioContent: string };
      const audioBuffer = Buffer.from(data.audioContent, "base64");
      return new NextResponse(audioBuffer, {
        status: 200,
        headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store, max-age=0" },
      });
    }
  }

  // ── ElevenLabs (tertiary — 10K chars/month free) ─────────────────────────
  if (elevenLabsKey && elevenLabsKey !== "your-elevenlabs-api-key") {
    const { voiceId } = elevenLabsVoiceConfig[gender];

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": elevenLabsKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true },
        }),
      },
    );

    if (response.ok) {
      const audioBuffer = await response.arrayBuffer();
      return new NextResponse(audioBuffer, {
        status: 200,
        headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store, max-age=0" },
      });
    }
  }

  // ── No key configured — client falls back to browser speech ──────────────
  return NextResponse.json(
    { error: "No voice API key configured. Add OPENAI_API_KEY to .env.local." },
    { status: 503 },
  );
}
