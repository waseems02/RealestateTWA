"use client";

import { useState } from "react";
import he from "../../messages/he.json";

export function AiButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">
      {hovered && (
        <div className="bg-white shadow-lg px-4 py-2 rounded-xl text-sm font-bold text-primary mb-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {he.ai.help_label}
        </div>
      )}
      <button
        aria-label={he.ai.help_label}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-16 h-16 bg-primary text-on-primary rounded-full shadow-[0_10px_30px_-4px_rgba(53,37,205,0.35)] flex items-center justify-center hover:scale-110 transition-transform duration-300"
      >
        <span className="text-2xl" aria-hidden>✨</span>
      </button>
    </div>
  );
}
