import { NextResponse } from "next/server";

type VoiceRequest = {
  text?: string;
  interviewerId?: "female" | "male";
};

// Google Cloud TTS voices
// en-US-Neural2-H = second Neural2 female voice — completely different timbre from F,
//   deeper and warmer. Fully supports speakingRate + pitch tuning.
//   Rate 0.82 = slow, deliberate, human-paced delivery.
//   Pitch -2.0 = lowers it off the shrill range, sounds much more natural.
// en-US-Journey-D = conversational male, natural American English.
const googleVoiceConfig = {
  female: { name: "en-US-Neural2-H", ssmlGender: "FEMALE" },
  male:   { name: "en-US-Journey-D", ssmlGender: "MALE"   },
} as const;

// ElevenLabs fallback
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

  // ── OpenAI TTS (primary when key present — most natural voices) ──────────
  // nova = warm, conversational female  |  onyx = deep, confident male
  // tts-1-hd = highest quality model
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

  // ── Google Cloud TTS (fallback — 1M chars/month free) ────────────────────
  if (googleKey) {
    const voice = googleVoiceConfig[interviewerId];

    const audioConfig = {
      audioEncoding: "MP3",
      speakingRate:  interviewerId === "female" ? 0.82 : 1.02,
      pitch:         interviewerId === "female" ? -2.0 : 0.0,
    };

    // Wrap in SSML to add natural pauses at sentence boundaries and commas.
    // This single change makes synthesised speech sound dramatically more human.
    const ssmlText = text
      .replace(/([.!?])\s+/g, "$1<break time=\"380ms\"/> ")
      .replace(/,\s+/g, ",<break time=\"160ms\"/> ")
      .replace(/:\s+/g, ":<break time=\"200ms\"/> ");
    const ssml = `<speak>${ssmlText}</speak>`;

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input:       { ssml },
          voice:       { languageCode: "en-US", name: voice.name, ssmlGender: voice.ssmlGender },
          audioConfig,
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

  // ── No key configured — client will fall back to browser speech ───────────
  return NextResponse.json(
    { error: "No voice API key configured. Add GOOGLE_TTS_API_KEY to .env.local." },
    { status: 503 },
  );
}
