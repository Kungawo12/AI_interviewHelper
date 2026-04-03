import { NextResponse } from "next/server";

type VoiceRequest = {
  text?: string;
  interviewerId?: "female" | "male";
  mode?: "intro" | "question";
};

const voiceConfig = {
  female: {
    voice: "marin",
    style:
      "Speak like a calm, warm, highly professional interviewer in a realistic video interview. Sound natural, polished, human, and reassuring.",
  },
  male: {
    voice: "cedar",
    style:
      "Speak like a confident, composed, highly professional interviewer in a realistic live interview. Sound natural, polished, human, and measured.",
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
  const mode = body.mode === "intro" ? "intro" : "question";

  if (!text) {
    return NextResponse.json({ error: "Text is required." }, { status: 400 });
  }

  const selected = voiceConfig[interviewerId];
  const instructions =
    mode === "intro"
      ? `${selected.style} Deliver a polished interview introduction with a welcoming but professional tone.`
      : `${selected.style} Ask the interview question clearly and naturally, like a real human interviewer in a live interview.`;

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini-tts",
      voice: selected.voice,
      input: text,
      instructions,
      format: "mp3",
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
      "Cache-Control": "no-store",
    },
  });
}
