import { NextResponse } from "next/server";

type VoiceRequest = {
  text?: string;
  interviewerId?: "female" | "male";
};

// ElevenLabs voice IDs — available on all plans including free tier
// Rachel (female) — warm, natural, professional
// Adam (male)   — confident, deep, professional
const voiceConfig = {
  female: {
    voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel
  },
  male: {
    voiceId: "pNInz6obpgDQGcFmaJgB", // Adam
  },
} as const;

export async function POST(request: Request) {
  const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  let body: VoiceRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const text = body.text?.trim();
  const interviewerId = body.interviewerId === "male" ? "male" : "female";

  if (!text) {
    return NextResponse.json({ error: "Text is required." }, { status: 400 });
  }

  // ── ElevenLabs (primary) ──────────────────────────────────────────────────
  if (elevenLabsKey) {
    const { voiceId } = voiceConfig[interviewerId];

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
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (response.ok) {
      const audioBuffer = await response.arrayBuffer();
      return new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }
  }

  // ── OpenAI TTS (fallback) ─────────────────────────────────────────────────
  if (openAiKey) {
    const openAiVoice = interviewerId === "male" ? "onyx" : "nova";

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
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
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }
  }

  // ── No API key configured ─────────────────────────────────────────────────
  return NextResponse.json(
    { error: "No voice API key configured. Add ELEVENLABS_API_KEY to .env.local." },
    { status: 503 },
  );
}
