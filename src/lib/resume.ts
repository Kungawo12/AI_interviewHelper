import { createRequire } from "node:module";

type ParsedResume =
  | {
      fileName: string;
      format: "PDF" | "TEXT";
      rawText: string;
      parsedText: string;
      extractedText: boolean;
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
      extractedText: true,
    };
  }

  if (lowerName.endsWith(".pdf")) {
    try {
      const { pdf } = require("pdf-parse");
      const buffer = await file.arrayBuffer();
      const result = await pdf(new Uint8Array(buffer));
      const parsedText = normalizeResumeText(result.text);

      if (!parsedText) {
        return {
          fileName,
          format: "PDF",
          rawText: "",
          parsedText: "",
          extractedText: false,
        };
      }

      return {
        fileName,
        format: "PDF",
        rawText: parsedText,
        parsedText,
        extractedText: true,
      };
    } catch (error) {
      console.error("PDF resume parsing failed", error);

      return {
        fileName,
        format: "PDF",
        rawText: "",
        parsedText: "",
        extractedText: false,
      };
    }
  }

  throw new Error("UNSUPPORTED_RESUME_FORMAT");
}
