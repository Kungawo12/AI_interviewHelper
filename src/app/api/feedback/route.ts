import { NextResponse } from "next/server";

type QA = { question: string; answer: string };

export async function POST(request: Request) {
  const openAiKey = process.env.OPENAI_API_KEY;
  if (!openAiKey || openAiKey === "your-openai-api-key" || openAiKey === "") {
    return NextResponse.json({ error: "No OpenAI key configured." }, { status: 503 });
  }

  let body: { questions: QA[]; jobTitle: string; companyName?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { questions, jobTitle, companyName } = body;

  const qaText = questions
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer || "(no answer)"}`)
    .join("\n\n");

  const prompt = `You are an expert interview coach evaluating a mock interview for the role of ${jobTitle}${
    companyName ? ` at ${companyName}` : ""
  }.

Interview transcript:
${qaText}

Provide honest, specific, actionable feedback as JSON with exactly these fields:
- "summary": 2–3 sentence spoken summary in conversational tone (will be read aloud by a voice)
- "strengths": array of exactly 3 short bullet strings (what they did well)
- "improvements": array of exactly 3 short bullet strings (specific areas to work on)
- "overallScore": integer 1–10

Respond with ONLY valid JSON, no markdown fences.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "OpenAI request failed." }, { status: 500 });
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };
  const content = data.choices[0]?.message?.content ?? "{}";

  try {
    const feedback = JSON.parse(content) as {
      summary: string;
      strengths: string[];
      improvements: string[];
      overallScore: number;
    };
    return NextResponse.json(feedback);
  } catch {
    return NextResponse.json({ error: "Could not parse feedback." }, { status: 500 });
  }
}
