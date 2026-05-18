import { VoiceOption } from "@/lib/voice";
import { useRef, useState } from "react";

export type { VoiceOption };

export function useVoice() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<{ element: HTMLAudioElement; url: string } | null>(null);

  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.element.pause();
      URL.revokeObjectURL(audioRef.current.url);
      audioRef.current = null;
    }
  };

  const speak = async (text: string, voice: VoiceOption = "nova") => {
    cleanupAudio();
    setIsPlaying(false);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/voice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate speech (HTTP ${response.status})`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audioElement = new Audio(audioUrl);

      audioRef.current = { element: audioElement, url: audioUrl };

      audioElement.onplay = () => setIsPlaying(true);
      audioElement.onended = () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        setIsPlaying(false);
      };

      audioElement.play();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const stop = () => {
    cleanupAudio();
    setIsPlaying(false);
  };

  return { speak, stop, isLoading, isPlaying, error };
}
