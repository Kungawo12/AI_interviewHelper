import { NextResponse } from "next/server";

type VoiceRequest = {
  text?: string;
  interviewerId?: "female" | "male";
};

// Google Cloud TTS voices
// en-US-Studio-O  = studio-recorded female — warmest, most human-sounding Google voice
//                   Recorded by a real voice actor in a professional studio
// en-US-Journey-D = conversational male — natural and confident American English
const googleVoiceConfig = {
  female: { name: "en-US-Studio-O", ssmlGender: "FEMALE" },
  male:   { name: "en-US-Journey-D", ssmlGender: "MALE"   },
} as const;

// ElevenLabs voice IDs — 10,000 chars/month free
const elevenLabsVoiceConfig = {
  female: { voiceId: "21m00Tcm4TlvDq8ikWAM" }, // Rachel
  male:   { voiceId: "pNInz6obpgDQGcFmaJgB" }, // Adam
} as const;

export async function POST(request: Request) {
  const googleKey      = process.env.GOOGLE_TTS_API_KEY;
  const elevenLabsKey  = process.env.ELEVENLABS_API_KEY;
  const openAiKey      = process.env.OPENAI_API_KEY;

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

  // ── Google Cloud TTS (primary — 1M chars/month free forever) ─────────────
  if (googleKey) {
    const voice = googleVoiceConfig[interviewerId];

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input:       { text },
          voice:       { languageCode: "en-US", name: voice.name, ssmlGender: voice.ssmlGender },
          audioConfig: {
            audioEncoding:    "MP3",
            speakingRate:     interviewerId === "female" ? 0.90 : 1.02,
            pitch:            interviewerId === "female" ? 0.0  : 0.0,
            volumeGainDb:     0.0,
            effectsProfileId: ["headphone-class-device"],
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

  // ── ElevenLabs (secondary — 10K chars/month free) ────────────────────────
  if (elevenLabsKey) {
    const { voiceId } = elevenLabsVoiceConfig[interviewerId];

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

  // ── OpenAI TTS (tertiary fallback) ───────────────────────────────────────
  if (openAiKey) {
    const voice = interviewerId === "male" ? "onyx" : "nova";

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${openAiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "tts-1-hd", voice, input: text, response_format: "mp3" }),
    });

    if (response.ok) {
      const audioBuffer = await response.arrayBuffer();
      return new NextResponse(audioBuffer, {
        status: 200,
        headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store, max-age=0" },
      });
    }
  }

  // ── No key configured — client will fall back to browser speech ───────────
  return NextResponse.json(
    { error: "No voice API key configured. Add GOOGLE_TTS_API_KEY to .env.local." },
    { status: 503 },
  );
}
