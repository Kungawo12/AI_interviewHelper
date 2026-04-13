import { generateSpeech, VoiceOption } from "@/lib/voice";
import { NextRequest, NextResponse } from "next/server";

const VALID_VOICES: VoiceOption[] = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];

export async function POST(request: NextRequest) {
  try {
    const { text, voice } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (voice !== undefined && !VALID_VOICES.includes(voice)) {
      return NextResponse.json(
        { error: `Invalid voice. Must be one of: ${VALID_VOICES.join(", ")}` },
        { status: 400 },
      );
    }

    const selectedVoice: VoiceOption = VALID_VOICES.includes(voice)
      ? (voice as VoiceOption)
      : "nova";

    const audioBuffer = await generateSpeech(text, selectedVoice);

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Voice generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 },
    );
  }
}
