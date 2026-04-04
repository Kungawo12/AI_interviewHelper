import { NextResponse } from "next/server";

type VoiceRequest = {
  text?: string;
  interviewerId?: "female" | "male";
};

const voiceConfig = {
  female: {
    voice: "nova",
  },
  male: {
    voice: "onyx",
  },
} as const;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 503 },
    );
  }

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

  const selected = voiceConfig[interviewerId];

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1-hd",
      voice: selected.voice,
      input: text,
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: "Voice generation failed.", details: errorText },
      { status: 502 },
    );
  }

  const audioBuffer = await response.arrayBuffer();

  return new NextResponse(audioBuffer, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
