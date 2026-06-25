"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Message = {
  role: "user" | "assistant";
  text: string;
  listings?: ChatListing[];
};

type ChatListing = {
  id: string;
  title: string;
  price_nis: number;
  rooms: number | null;
  size_sqm: number | null;
  city: string | null;
};

const SUGGESTIONS = [
  "2 חדרים ליד אוניברסיטת תל אביב עד ₪4,000 עם מרפסת",
  "שותפים סטודנטים, ללא עישון, עד ₪3,500",
  "דירה מרוהטת בירושלים למסורתיים",
  "3 חדרים בחיפה ליד הטכניון",
];

export function AiChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "שלום! אני עוזר ה-AI של RoomieFit 👋\nאנסה למצוא לך דירה לפי הדרישות שלך. מה מחפש?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", text: data.reply, listings: data.listings ?? [] },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "אירעה שגיאה. נסה שוב." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex md:items-end md:justify-end md:p-6 pointer-events-none">
      {/* Backdrop (mobile) */}
      <div
        className="absolute inset-0 bg-on-surface/30 backdrop-blur-sm md:hidden pointer-events-auto"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full md:w-[420px] md:h-[680px] h-full bg-white md:rounded-2xl shadow-[0_20px_60px_-8px_rgba(30,41,59,0.25)] flex flex-col pointer-events-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-primary text-on-primary">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <div>
              <p className="font-bold text-sm">RoomieFit Assistant</p>
              <p className="text-xs opacity-75">עוזר חיפוש AI</p>
            </div>
          </div>
          <button onClick={onClose} className="text-on-primary/80 hover:text-on-primary text-xl transition-colors">
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-surface-container-low/30">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[85%] space-y-2 ${msg.role === "user" ? "order-2" : "order-1"}`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-brand-coral text-white rounded-tr-sm"
                      : "bg-white text-on-surface shadow-sm rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>

                {/* Listing cards in chat */}
                {msg.listings && msg.listings.length > 0 && (
                  <div className="space-y-2">
                    {msg.listings.map((l) => (
                      <div key={l.id} className="bg-white rounded-xl shadow-sm p-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-sm text-on-surface">
                            ₪{l.price_nis.toLocaleString("he-IL")}
                            <span className="text-xs font-normal text-on-surface-variant"> /חודש</span>
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {l.rooms} חדרים · {l.size_sqm} מ"ר{l.city ? ` · ${l.city}` : ""}
                          </p>
                        </div>
                        <Link
                          href={`/listings/${l.id}`}
                          className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors whitespace-nowrap"
                        >
                          צפה
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-end">
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestion chips */}
        {messages.length <= 1 && (
          <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide border-t border-outline-variant/30">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs font-medium whitespace-nowrap px-3 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors bg-white"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className="px-4 py-3 border-t border-outline-variant bg-white flex items-center gap-2">
          <button className="text-on-surface-variant hover:text-primary transition-colors p-2">
            🎤
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="תאר מה אתה מחפש..."
            className="flex-1 bg-surface-container-low rounded-full px-4 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="bg-primary text-on-primary p-2 rounded-full hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="text-sm">←</span>
          </button>
        </div>
      </div>
    </div>
  );
}
