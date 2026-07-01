// RoomieFit floating AI chat widget.
//
// Inject once on any page:
//   <script src="js/chat-widget.js" defer></script>
//
// Renders a pill-shaped bubble bottom-end ("יש לך שאלות? תשאל אותי!") that
// expands into an in-page chat panel overlay when clicked. Posts to the
// existing /api/ai/chat endpoint with conversation history so the agent can
// answer multi-turn follow-ups. Same response shape as /ai-assistant.html
// (which the widget supersedes).

(function () {
  if (window.__roomieFitChatWidgetLoaded) return;
  window.__roomieFitChatWidgetLoaded = true;

  const SUGGESTIONS = [
    "חדר בתל אביב עד 3000 שח",
    "דירה ליד הטכניון",
    "דירה זולה בבאר שבע",
    "חדר עם מרפסת ליד אוניברסיטת תל אביב",
  ];

  const conversation = [];
  let panelOpen = false;

  const APARTMENT_PHOTOS = [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1522444690501-d3cdef84a8c1?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80",
  ];
  const placeholderImageFor = (id) => {
    const seed = String(id || Math.random()).split("").reduce((s, c) => s + c.charCodeAt(0), 0);
    return APARTMENT_PHOTOS[seed % APARTMENT_PHOTOS.length];
  };

  const fmtPrice = (n) => (n == null ? "—" : "₪" + Number(n).toLocaleString("he-IL"));
  const fmtDist = (m) =>
    m == null ? "—" : m < 1000 ? `${m} מ׳` : `${(m / 1000).toFixed(1)} ק"מ`;
  const escapeHtml = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const fmtTime = () =>
    new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .rf-chat-fab {
        position: fixed;
        bottom: 24px;
        inset-inline-end: 24px;
        z-index: 9998;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 18px;
        border-radius: 9999px;
        background: linear-gradient(135deg, #FB7185 0%, #F43F5E 100%);
        color: white;
        font-family: "Heebo", "Geist", system-ui, sans-serif;
        font-weight: 600;
        font-size: 14px;
        border: none;
        box-shadow: 0 12px 32px rgba(244, 63, 94, 0.35), 0 4px 12px rgba(0,0,0,0.08);
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
      }
      .rf-chat-fab:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 16px 40px rgba(244, 63, 94, 0.4), 0 6px 16px rgba(0,0,0,0.1);
      }
      .rf-chat-fab:active { transform: scale(0.98); }
      .rf-chat-fab.rf-hidden { opacity: 0; pointer-events: none; transform: translateY(20px) scale(0.9); }
      .rf-chat-fab .rf-icon { font-size: 20px; line-height: 1; }
      .rf-chat-fab .rf-pulse {
        position: absolute;
        inset: 0;
        border-radius: 9999px;
        background: rgba(251, 113, 133, 0.4);
        animation: rf-pulse 2s ease-out infinite;
        z-index: -1;
      }
      @keyframes rf-pulse {
        0%   { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(1.4); opacity: 0; }
      }

      .rf-chat-panel {
        position: fixed;
        bottom: 24px;
        inset-inline-end: 24px;
        z-index: 9999;
        width: min(420px, calc(100vw - 32px));
        max-height: min(640px, calc(100vh - 48px));
        display: flex;
        flex-direction: column;
        background: #ffffff;
        border-radius: 24px;
        box-shadow: 0 32px 64px rgba(53, 37, 205, 0.25), 0 12px 24px rgba(0,0,0,0.1);
        font-family: "Heebo", "Geist", system-ui, sans-serif;
        overflow: hidden;
        opacity: 0;
        transform: translateY(20px) scale(0.96);
        pointer-events: none;
        transition: opacity 0.25s ease, transform 0.25s ease;
        direction: rtl;
      }
      .rf-chat-panel.rf-open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      .rf-chat-header {
        background: linear-gradient(135deg, #3525cd 0%, #4f46e5 100%);
        color: white;
        padding: 18px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .rf-chat-header .rf-avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: linear-gradient(135deg, #FB7185 0%, #F43F5E 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        flex-shrink: 0;
      }
      .rf-chat-header .rf-title { font-weight: 700; font-size: 15px; line-height: 1.2; }
      .rf-chat-header .rf-subtitle { font-size: 12px; opacity: 0.85; margin-top: 2px; }
      .rf-chat-header .rf-spacer { flex: 1; }
      .rf-chat-header button {
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s ease;
      }
      .rf-chat-header button:hover { background: rgba(255,255,255,0.15); }

      .rf-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        background: #fafaf9;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .rf-msg { display: flex; flex-direction: column; max-width: 88%; gap: 4px; }
      .rf-msg.rf-assistant { align-self: flex-start; align-items: flex-start; }
      .rf-msg.rf-user { align-self: flex-end; align-items: flex-end; }
      .rf-msg .rf-bubble {
        padding: 10px 14px;
        border-radius: 18px;
        font-size: 14px;
        line-height: 1.45;
        white-space: pre-line;
        word-wrap: break-word;
      }
      .rf-msg.rf-assistant .rf-bubble {
        background: white;
        color: #111c2d;
        border: 1px solid #e7eeff;
        border-bottom-right-radius: 4px;
      }
      .rf-msg.rf-user .rf-bubble {
        background: linear-gradient(135deg, #FB7185 0%, #F43F5E 100%);
        color: white;
        border-bottom-left-radius: 4px;
      }
      .rf-msg .rf-time { font-size: 11px; color: #777587; padding: 0 6px; }

      .rf-listings { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; width: 100%; }
      .rf-listing-card {
        display: flex;
        gap: 10px;
        background: white;
        border: 1px solid #c7c4d8;
        border-radius: 14px;
        padding: 8px;
        text-decoration: none;
        color: inherit;
        transition: box-shadow 0.15s ease, transform 0.15s ease, border-color 0.15s ease;
      }
      .rf-listing-card:hover {
        box-shadow: 0 6px 16px rgba(53,37,205,0.08);
        transform: translateY(-1px);
        border-color: #4f46e5;
      }
      .rf-listing-card img {
        width: 80px; height: 80px;
        border-radius: 10px;
        object-fit: cover;
        flex-shrink: 0;
      }
      .rf-listing-body { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between; }
      .rf-listing-title { font-weight: 700; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .rf-listing-price { color: #3525cd; font-weight: 700; font-size: 13px; }
      .rf-listing-meta { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
      .rf-tag {
        background: #f0f3ff;
        color: #464555;
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 8px;
      }
      .rf-listing-cta { font-size: 11px; color: #3525cd; font-weight: 700; text-align: end; margin-top: 4px; }

      .rf-suggestions {
        display: flex; flex-wrap: wrap; gap: 6px;
        padding: 12px 20px 0;
      }
      .rf-suggestion {
        background: #f0f3ff;
        border: 1px solid #c7c4d8;
        color: #3525cd;
        font-size: 12px;
        padding: 6px 12px;
        border-radius: 9999px;
        cursor: pointer;
        font-family: inherit;
        transition: background 0.15s ease;
      }
      .rf-suggestion:hover { background: #dee8ff; }

      .rf-chat-form {
        padding: 14px 16px;
        background: white;
        border-top: 1px solid #e7eeff;
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .rf-chat-form input {
        flex: 1;
        background: #f0f3ff;
        border: none;
        border-radius: 14px;
        padding: 12px 14px;
        font-size: 14px;
        font-family: inherit;
        color: #111c2d;
        outline: none;
        transition: background 0.15s ease, box-shadow 0.15s ease;
      }
      .rf-chat-form input:focus {
        background: white;
        box-shadow: 0 0 0 2px #3525cd;
      }
      .rf-chat-form button {
        width: 44px; height: 44px;
        background: linear-gradient(135deg, #FB7185 0%, #F43F5E 100%);
        color: white;
        border: none;
        border-radius: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        transition: transform 0.15s ease;
      }
      .rf-chat-form button:hover { transform: scale(1.05); }
      .rf-chat-form button:active { transform: scale(0.95); }
      .rf-chat-form button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

      .rf-typing {
        align-self: flex-start;
        background: white;
        border: 1px solid #e7eeff;
        border-radius: 18px;
        border-bottom-right-radius: 4px;
        padding: 12px 14px;
        display: flex; gap: 4px;
      }
      .rf-typing span {
        width: 6px; height: 6px;
        background: #777587;
        border-radius: 50%;
        animation: rf-typing 1.4s infinite ease-in-out;
      }
      .rf-typing span:nth-child(2) { animation-delay: 0.2s; }
      .rf-typing span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes rf-typing {
        0%, 60%, 100% { transform: scale(1); opacity: 0.5; }
        30% { transform: scale(1.3); opacity: 1; }
      }

      @media (max-width: 480px) {
        .rf-chat-panel {
          inset-inline-end: 12px;
          inset-inline-start: 12px;
          bottom: 12px;
          width: auto;
          max-height: 80vh;
        }
        .rf-chat-fab {
          inset-inline-end: 16px;
          bottom: 16px;
          padding: 12px 16px;
          font-size: 13px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function buildFab() {
    const fab = document.createElement("button");
    fab.className = "rf-chat-fab";
    fab.setAttribute("aria-label", "פתח/י שיחה עם העוזר");
    fab.innerHTML = `
      <span class="rf-pulse"></span>
      <span class="material-symbols-outlined rf-icon">smart_toy</span>
      <span>יש לך שאלות? תשאל אותי!</span>
    `;
    fab.addEventListener("click", openPanel);
    return fab;
  }

  function buildPanel() {
    const panel = document.createElement("div");
    panel.className = "rf-chat-panel";
    panel.dir = "rtl";
    panel.innerHTML = `
      <div class="rf-chat-header">
        <div class="rf-avatar">
          <span class="material-symbols-outlined">smart_toy</span>
        </div>
        <div>
          <div class="rf-title">העוזר של RoomieFit</div>
          <div class="rf-subtitle">בינה מלאכותית · מחפש עבורך דירות</div>
        </div>
        <div class="rf-spacer"></div>
        <button class="rf-close" aria-label="סגור">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="rf-chat-messages" id="rfMessages"></div>
      <div class="rf-suggestions" id="rfSuggestions">
        ${SUGGESTIONS.map((s) => `<button class="rf-suggestion" type="button">${escapeHtml(s)}</button>`).join("")}
      </div>
      <form class="rf-chat-form" id="rfForm">
        <input type="text" id="rfInput" placeholder="שאל/י על דירות, שותפים, תקציב..." autocomplete="off" />
        <button type="submit" aria-label="שלח">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
      </form>
    `;

    panel.querySelector(".rf-close").addEventListener("click", closePanel);
    panel.querySelector("#rfForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const input = panel.querySelector("#rfInput");
      const msg = input.value.trim();
      input.value = "";
      if (msg) send(msg);
    });
    panel.querySelectorAll(".rf-suggestion").forEach((btn) => {
      btn.addEventListener("click", () => {
        const txt = btn.textContent.trim();
        // Hide suggestions after the first one is used.
        panel.querySelector("#rfSuggestions").style.display = "none";
        send(txt);
      });
    });

    return panel;
  }

  let fabEl, panelEl;

  function openPanel() {
    panelEl.classList.add("rf-open");
    fabEl.classList.add("rf-hidden");
    panelOpen = true;
    if (!conversation.length) {
      addAssistant(
        "שלום! 👋 אני עוזר RoomieFit. ספר/י לי איזו עיר, אוניברסיטה, תקציב או סגנון חיים — ואני אמצא עבורך דירות מתאימות מהמאגר שלנו."
      );
    }
    setTimeout(() => panelEl.querySelector("#rfInput")?.focus(), 250);
  }

  function closePanel() {
    panelEl.classList.remove("rf-open");
    fabEl.classList.remove("rf-hidden");
    panelOpen = false;
  }

  function addUser(text) {
    const msgs = panelEl.querySelector("#rfMessages");
    const el = document.createElement("div");
    el.className = "rf-msg rf-user";
    el.innerHTML = `
      <div class="rf-bubble">${escapeHtml(text)}</div>
      <span class="rf-time">${fmtTime()}</span>
    `;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addAssistant(text, listings) {
    const msgs = panelEl.querySelector("#rfMessages");
    const el = document.createElement("div");
    el.className = "rf-msg rf-assistant";
    el.innerHTML = `
      <div class="rf-bubble">${escapeHtml(text)}</div>
      ${listings && listings.length ? renderListings(listings) : ""}
      <span class="rf-time">${fmtTime()}</span>
    `;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function renderListings(listings) {
    const cards = listings
      .slice(0, 4)
      .map((listing) => {
        const img =
          (listing.images && listing.images[0]) ||
          listing.image_url ||
          placeholderImageFor(listing.id);
        const uni = listing.nearest_university;
        return `
          <a href="listing-details.html?id=${encodeURIComponent(listing.id)}" class="rf-listing-card">
            <img src="${escapeHtml(img)}" alt="${escapeHtml(listing.title || "")}" />
            <div class="rf-listing-body">
              <div>
                <div class="rf-listing-title">${escapeHtml(listing.title || "")}</div>
                <div class="rf-listing-meta">
                  <span class="rf-tag">${listing.rooms ?? "?"} חדרים</span>
                  ${uni ? `<span class="rf-tag">${escapeHtml(fmtDist(uni.distance_m))} מ${escapeHtml(uni.name_he || uni.name_en || "הקמפוס")}</span>` : ""}
                </div>
              </div>
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <span class="rf-listing-price">${fmtPrice(listing.price)}</span>
                <span class="rf-listing-cta">לפרטים ←</span>
              </div>
            </div>
          </a>`;
      })
      .join("");
    return `<div class="rf-listings">${cards}</div>`;
  }

  function showTyping() {
    const msgs = panelEl.querySelector("#rfMessages");
    const el = document.createElement("div");
    el.className = "rf-typing";
    el.id = "rfTyping";
    el.innerHTML = "<span></span><span></span><span></span>";
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function hideTyping() {
    panelEl.querySelector("#rfTyping")?.remove();
  }

  async function send(text) {
    if (!text) return;
    addUser(text);
    showTyping();
    panelEl.querySelector("#rfSuggestions").style.display = "none";
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: conversation.slice(-6) }),
      });
      const payload = await res.json();
      hideTyping();
      const reply = payload.reply || "לא התקבלה תשובה.";
      addAssistant(reply, payload.listings || payload.results || payload.data);
      conversation.push({ role: "user", content: text });
      conversation.push({ role: "assistant", content: reply });
    } catch (err) {
      hideTyping();
      addAssistant("מצטער, נכשלה הבקשה. נסה/י שוב בעוד רגע.");
    }
  }

  function init() {
    injectStyles();
    fabEl = buildFab();
    panelEl = buildPanel();
    document.body.appendChild(fabEl);
    document.body.appendChild(panelEl);

    // Auto-open the panel if URL has ?chat=open (so links from other pages
    // can deep-link into the assistant — e.g. /ai-assistant.html redirect).
    if (new URLSearchParams(location.search).get("chat") === "open") {
      setTimeout(openPanel, 300);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
