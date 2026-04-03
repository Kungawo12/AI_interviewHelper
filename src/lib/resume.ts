import { createRequire } from "node:module";

type ParsedResume =
  | {
      fileName: string;
      format: "PDF" | "TEXT";
      rawText: string;
      parsedText: string;
    }
  | null;

function normalizeResumeText(value: string) {
  return value.replace(/\r\n/g, "\n").trim();
}

const require = createRequire(import.meta.url);

export async function parseResumeUpload(file: File | null): Promise<ParsedResume> {
  if (!file || file.size === 0) {
    return null;
  }

  const fileName = file.name || "uploaded-resume";
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith(".txt")) {
    const rawText = normalizeResumeText(await file.text());

    if (!rawText) {
      return null;
    }

    return {
      fileName,
      format: "TEXT",
      rawText,
      parsedText: rawText,
    };
  }

  if (lowerName.endsWith(".pdf")) {
    const { pdf } = require("pdf-parse");
    const buffer = await file.arrayBuffer();
    const result = await pdf(new Uint8Array(buffer));
    const parsedText = normalizeResumeText(result.text);

    if (!parsedText) {
      return null;
    }

    return {
      fileName,
      format: "PDF",
      rawText: parsedText,
      parsedText,
    };
  }

  throw new Error("UNSUPPORTED_RESUME_FORMAT");
}
