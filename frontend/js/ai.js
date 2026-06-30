// RoomieFit AI assistant — chat panel that posts to /api/ai/chat and renders
// returned listing matches as inline horizontal cards.

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=400&q=80",
];

const fmtPrice = (n) => (n == null ? "—" : "₪" + Number(n).toLocaleString("he-IL"));
const fmtDist = (m) => (m == null ? "—" : m < 1000 ? `${m} מ׳` : `${(m / 1000).toFixed(1)} ק"מ`);
const escapeHtml = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const fmtTime = () => new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });

function bubbleAssistant(text, listings) {
  const chat = document.querySelector("#chatBox");
  const wrap = document.createElement("div");
  wrap.className = "flex flex-col items-start max-w-[90%]";
  wrap.innerHTML = `
    <div class="bg-primary-container/10 text-on-surface p-md rounded-2xl rounded-ts-xs whitespace-pre-line">${escapeHtml(text)}</div>
    <span class="text-xs text-outline mt-xs me-xs">${fmtTime()}</span>
    ${listings && listings.length ? `<div class="space-y-md w-full mt-md">${listings.slice(0, 4).map(listingResultCard).join("")}</div>` : ""}
  `;
  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
}

function bubbleUser(text) {
  const chat = document.querySelector("#chatBox");
  const wrap = document.createElement("div");
  wrap.className = "flex flex-col items-end self-end max-w-[85%] ms-auto";
  wrap.innerHTML = `
    <div class="bg-brand-coral text-white p-md rounded-2xl rounded-te-xs shadow-md">${escapeHtml(text)}</div>
    <span class="text-xs text-outline mt-xs ms-xs">${fmtTime()}</span>
  `;
  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
}

function typingIndicator() {
  const chat = document.querySelector("#chatBox");
  const wrap = document.createElement("div");
  wrap.id = "typingIndicator";
  wrap.className = "flex items-center gap-xs p-md bg-primary-container/5 rounded-2xl w-fit";
  wrap.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
}

function removeTyping() {
  const el = document.querySelector("#typingIndicator");
  if (el) el.remove();
}

function listingResultCard(listing, idx) {
  const img = (listing.images && listing.images[0]) || listing.image_url || HERO_IMAGES[idx % HERO_IMAGES.length];
  const uni = listing.nearest_university;
  return `<a href="listing-details.html?id=${encodeURIComponent(listing.id)}" class="bg-white border border-outline-variant p-sm rounded-2xl flex gap-md hover:shadow-md transition-shadow block">
    <div class="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
      <img src="${img}" class="w-full h-full object-cover" alt="${escapeHtml(listing.title || "")}" />
    </div>
    <div class="flex-1 flex flex-col justify-between py-xs min-w-0">
      <div>
        <div class="flex justify-between items-start gap-sm">
          <h4 class="text-sm font-bold truncate">${escapeHtml(listing.title || "")}</h4>
          <span class="text-primary font-bold whitespace-nowrap">${fmtPrice(listing.price)}</span>
        </div>
        <div class="flex flex-wrap gap-xs mt-xs">
          <span class="bg-surface-container-low px-sm py-xs rounded-lg text-xs text-on-surface-variant">${listing.rooms ?? "?"} חדרים</span>
          ${uni ? `<span class="bg-surface-container-low px-sm py-xs rounded-lg text-xs text-on-surface-variant">${fmtDist(uni.distance_m)} מ${escapeHtml(uni.name_he || uni.name_en || "")}</span>` : ""}
          ${!listing.smoking_allowed ? `<span class="bg-emerald-50 px-sm py-xs rounded-lg text-xs text-emerald-700">לא מעשנים</span>` : ""}
          ${listing.pets_allowed ? `<span class="bg-amber-50 px-sm py-xs rounded-lg text-xs text-amber-700">חיות מחמד</span>` : ""}
        </div>
      </div>
      <div class="text-end">
        <span class="text-xs text-primary font-bold">לפרטים ←</span>
      </div>
    </div>
  </a>`;
}

async function sendMessage(text) {
  if (!text || !text.trim()) return;
  bubbleUser(text);
  typingIndicator();
  try {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const payload = await res.json();
    removeTyping();
    bubbleAssistant(payload.reply || "לא התקבלה תשובה.", payload.listings || payload.results || payload.data);
  } catch (err) {
    removeTyping();
    bubbleAssistant("מצטער, נכשלה הבקשה. נסה שוב בעוד רגע.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  bubbleAssistant("שלום! אני עוזר RoomieFit. ספר/י לי מה את/ה מחפש/ת — אוניברסיטה, תקציב, סגנון חיים — ואני אמצא דירות מתאימות בזמן אמת מהמסד.");

  document.querySelector("#chatForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.querySelector("#message");
    const msg = input.value.trim();
    input.value = "";
    if (msg) sendMessage(msg);
  });

  document.querySelectorAll(".suggestion").forEach((btn) => {
    btn.addEventListener("click", () => sendMessage(btn.textContent.trim()));
  });
});
