"use client";

import { useState } from "react";

export function StickyCta({
  contactName,
  price,
}: {
  contactName: string | null;
  price: number;
}) {
  const [requested, setRequested] = useState(false);

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-outline-variant shadow-[0_-4px_20px_-2px_rgba(30,41,59,0.08)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-on-surface-variant">מחיר חודשי</p>
          <p className="text-2xl font-black text-on-surface">
            ₪{price.toLocaleString("he-IL")}
          </p>
          {contactName && (
            <p className="text-xs text-on-surface-variant">{contactName}</p>
          )}
        </div>
        <button
          onClick={() => setRequested(true)}
          disabled={requested}
          className="bg-brand-coral text-white font-bold px-8 py-3 rounded-full text-sm hover:scale-105 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
        >
          {requested ? "✓ פנייה נשלחה" : "פנייה לדירה"}
        </button>
      </div>
    </div>
  );
}
