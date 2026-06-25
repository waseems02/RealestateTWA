"use client";

import { useState } from "react";
import { AiChat } from "./ai-chat";
import he from "../../messages/he.json";

export function AiButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <AiChat onClose={() => setOpen(false)} />}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start gap-2 group">
        {!open && (
          <div className="opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 bg-white shadow-lg px-3 py-1.5 rounded-xl text-xs font-bold text-primary mb-1">
            {he.ai.help_label}
          </div>
        )}
        <button
          aria-label={he.ai.help_label}
          onClick={() => setOpen((o) => !o)}
          className={`w-14 h-14 rounded-full shadow-[0_10px_30px_-4px_rgba(53,37,205,0.35)] flex items-center justify-center hover:scale-110 transition-all duration-300 ${
            open ? "bg-on-surface text-on-primary" : "bg-primary text-on-primary"
          }`}
        >
          <span className="text-xl" aria-hidden>{open ? "✕" : "✨"}</span>
        </button>
      </div>
    </>
  );
}
