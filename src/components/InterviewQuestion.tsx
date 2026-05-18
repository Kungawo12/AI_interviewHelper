"use client";

import { useVoice, VoiceOption } from "@/hooks/useVoice";
import { useState } from "react";

export function InterviewQuestion({ question }: { question: string }) {
  const { speak, stop, isPlaying, isLoading, error } = useVoice();
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>("nova");

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-lg font-semibold">{question}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => speak(question, selectedVoice)}
          disabled={isLoading || isPlaying}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Loading..." : isPlaying ? "Playing..." : "🔊 Read Question"}
        </button>

        {isPlaying && (
          <button
            onClick={stop}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Stop
          </button>
        )}
      </div>

      <select
        value={selectedVoice}
        onChange={(e) => setSelectedVoice(e.target.value as VoiceOption)}
        className="px-3 py-2 border border-gray-300 rounded"
      >
        <option value="alloy">Alloy (Neutral)</option>
        <option value="echo">Echo (Warm)</option>
        <option value="fable">Fable (Expressive)</option>
        <option value="onyx">Onyx (Deep)</option>
        <option value="nova">Nova (Bright)</option>
        <option value="shimmer">Shimmer (Clear)</option>
      </select>

      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
