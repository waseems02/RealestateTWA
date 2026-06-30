const translations = {
  he: {
    navHome: "בית",
    navListings: "דירות",
    navRoommates: "שותפים",
    navAI: "AI",
    navLogin: "כניסה",
    getStarted: "הרשמה",
    heroTitle: "הבית המושלם והשותף המתאים, באוניברסיטה שלך",
    heroSubtitle:
      "פלטפורמה לסטודנטים בישראל: דירות מאומתות, התאמת שותפים חכמה ועוזר AI שמלווה אותך מהחיפוש ועד החתימה על החוזה.",
    anyUniversity: "כל אוניברסיטה",
    placeholderMaxPrice: "מחיר מקס׳ (₪)",
    placeholderRooms: "חדרים",
    searchCta: "חפש",
    askAi: "שאל את עוזר ה-AI",
    featuredTitle: "דירות פופולריות ליד הקמפוס",
    featuredSubtitle: "דירות מאומתות שמוכנות לכניסה",
    viewAll: "לכל הדירות",
    howTitle: "שלושה צעדים פשוטים",
    howSubtitle: "מהחיפוש ועד למפתחות, בלי לחץ ובלי הפתעות",
    step1Title: "חפש",
    step1Body:
      "סנן לפי אוניברסיטה, תקציב והעדפות סגנון חיים. כל הדירות עם תיוג מקור (Yad2 / קבוצות פייסבוק / לוחות אוניברסיטה).",
    step2Title: "התאמה",
    step2Body:
      "עוזר ה-AI מנתח את ההעדפות שלך ומציע דירות ושותפים בהתאמה אישית, כולל ניקיון, שעות שקט וכשרות.",
    step3Title: "כניסה לדירה",
    step3Body:
      "שאל שאלות לבעל הדירה דרך הצ׳אט, קבל טיפים לחתימת חוזה, ועבור לדירה החדשה.",
    aiNeedHelp: "צריך עזרה במציאת דירה?",
    footerTagline: "פרויקט קורס מסדי נתונים · נתוני דמו בלבד",
    footerAbout: "אודות",
    footerContact: "צור קשר",
    footerTerms: "תנאי שימוש",
    footerPrivacy: "פרטיות",
    footer: "RoomieFit / CampusNest Israel - פרויקט קורס מסדי נתונים",
  },
  en: {
    navHome: "Home",
    navListings: "Listings",
    navRoommates: "Roommates",
    navAI: "AI",
    navLogin: "Login",
    getStarted: "Get Started",
    heroTitle: "Find your perfect home and roommate near your campus",
    heroSubtitle:
      "Built for students in Israel — verified listings, smart roommate matching, and an AI assistant from search to signing the lease.",
    anyUniversity: "Any university",
    placeholderMaxPrice: "Max price (₪)",
    placeholderRooms: "Rooms",
    searchCta: "Search",
    askAi: "Ask the AI assistant",
    featuredTitle: "Popular near campus",
    featuredSubtitle: "Hand-picked apartments ready for move-in",
    viewAll: "View all",
    howTitle: "Stress-free in three steps",
    howSubtitle: "Search to keys, without surprises",
    step1Title: "Search",
    step1Body:
      "Filter by university, budget, and lifestyle. Every listing is source-tagged (Yad2 / Facebook groups / university boards).",
    step2Title: "Match",
    step2Body:
      "Our AI matches you with apartments and roommates by cleanliness, quiet hours, kashrut, and more.",
    step3Title: "Move in",
    step3Body:
      "Chat with the landlord, get lease-signing tips, and move in.",
    aiNeedHelp: "Need help finding a home?",
    footerTagline: "Database course project · demo data only",
    footerAbout: "About",
    footerContact: "Contact",
    footerTerms: "Terms",
    footerPrivacy: "Privacy",
    footer: "RoomieFit / CampusNest Israel — Database course project",
  },
};

function getLanguage() {
  return localStorage.getItem("roomiefit_lang") || "he";
}

function applyTranslations() {
  const lang = getLanguage();
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "he" ? "rtl" : "ltr";

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (translations[lang]?.[key]) {
      element.textContent = translations[lang][key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    if (translations[lang]?.[key]) {
      element.setAttribute("placeholder", translations[lang][key]);
    }
  });

  // Visual language-toggle pill (used by new Tailwind pages)
  const heChip = document.querySelector("[data-lang-he]");
  const enChip = document.querySelector("[data-lang-en]");
  if (heChip && enChip) {
    const active = "bg-primary text-on-primary";
    const idle = "text-on-surface-variant";
    if (lang === "he") {
      heChip.classList.add(...active.split(" "));
      heChip.classList.remove(...idle.split(" "));
      enChip.classList.add(...idle.split(" "));
      enChip.classList.remove(...active.split(" "));
    } else {
      enChip.classList.add(...active.split(" "));
      enChip.classList.remove(...idle.split(" "));
      heChip.classList.add(...idle.split(" "));
      heChip.classList.remove(...active.split(" "));
    }
  }

  // Plain-text language-toggle button (used by legacy pages without the pill chips)
  document.querySelectorAll("[data-language-toggle]").forEach((toggle) => {
    if (toggle.querySelector("[data-lang-he]")) return;
    toggle.textContent = lang === "he" ? "English" : "עברית";
  });
}

const TELEGRAM_URL = (typeof window !== "undefined" && window.ROOMIEFIT_TELEGRAM_URL) || "https://t.me/RealestateTWA";

function injectFloatingActions() {
  if (document.querySelector("[data-floating-actions]")) return;
  const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const onAiPage = current === "ai-assistant.html";
  const html = `
    <div data-floating-actions class="fixed bottom-lg end-lg z-[60] flex flex-col gap-md items-end pointer-events-none">
      <a href="${TELEGRAM_URL}" target="_blank" rel="noopener"
         class="pointer-events-auto group flex items-center gap-md"
         aria-label="פתיחת RoomieFit בטלגרם">
        <span class="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 bg-white shadow-lg px-md py-sm rounded-xl text-sm font-bold" style="color:#229ED9;">
          פתח בטלגרם
        </span>
        <span class="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[0_10px_30px_-4px_rgba(34,158,217,0.45)] hover:scale-110 transition-transform" style="background:#229ED9;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
            <path d="M9.04 15.07 8.9 18.2c.28 0 .4-.12.54-.27l1.3-1.24 2.7 1.97c.49.27.84.13.97-.45l1.76-8.27c.18-.83-.3-1.15-.78-.96L4.66 12.5c-.81.32-.8.77-.14.97l2.7.84 6.27-3.95c.3-.18.57-.08.34.13L9.04 15.07z"/>
          </svg>
        </span>
      </a>
      ${onAiPage ? "" : `
      <a href="ai-assistant.html"
         class="pointer-events-auto group flex items-center gap-md"
         aria-label="פתיחת עוזר AI">
        <span class="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 bg-white shadow-lg px-md py-sm rounded-xl text-sm font-bold text-primary">
          שאל את עוזר ה-AI
        </span>
        <span class="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[0_10px_30px_-4px_rgba(53,37,205,0.45)] hover:scale-110 transition-transform" style="background:#3525cd;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
            <path d="M12 2 13.4 7.4 18.8 8.8 13.4 10.2 12 15.6 10.6 10.2 5.2 8.8 10.6 7.4 12 2zm6.7 11.2 1 3.6 3.6 1-3.6 1-1 3.6-1-3.6-3.6-1 3.6-1 1-3.6zM5.2 14.4l.7 2.6 2.6.7-2.6.7-.7 2.6-.7-2.6L2 17.7l2.5-.7.7-2.6z"/>
          </svg>
        </span>
      </a>`}
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);
}

function bindLanguageToggle() {
  document.querySelectorAll("[data-language-toggle]").forEach((toggle) => {
    if (toggle.dataset.langBound === "1") return;
    toggle.dataset.langBound = "1";
    toggle.addEventListener("click", () => {
      localStorage.setItem(
        "roomiefit_lang",
        getLanguage() === "he" ? "en" : "he"
      );
      applyTranslations();
    });
  });
}

function setupLayout() {
  // Pages that bring their own Tailwind header/footer opt out via data-no-auto-layout
  if (document.body.hasAttribute("data-no-auto-layout")) {
    bindLanguageToggle();
    applyTranslations();
    injectFloatingActions();
    return;
  }

  const current = location.pathname.split("/").pop() || "index.html";
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<header class="site-header">
      <nav class="nav">
        <a class="brand" href="index.html">RoomieFit</a>
        <div class="nav-links">
          <a href="index.html" data-i18n="navHome" class="${current === "index.html" ? "active" : ""}">בית</a>
          <a href="listings.html" data-i18n="navListings" class="${current === "listings.html" ? "active" : ""}">דירות</a>
          <a href="ai-assistant.html" data-i18n="navAI" class="${current === "ai-assistant.html" ? "active" : ""}">AI</a>
          <a href="login.html" data-i18n="navLogin" class="${current === "login.html" ? "active" : ""}">כניסה</a>
          <button class="lang-toggle" type="button" data-language-toggle>English</button>
        </div>
      </nav>
    </header>`
  );

  document.body.insertAdjacentHTML(
    "beforeend",
    `<footer class="site-footer"><div class="container" data-i18n="footer">RoomieFit / CampusNest Israel - פרויקט קורס מסדי נתונים</div></footer>`
  );

  bindLanguageToggle();
  applyTranslations();
  injectFloatingActions();
}

async function fetchListings() {
  const response = await fetch("/api/listings");
  const payload = await response.json();
  return payload.data || [];
}

function formatBool(value) {
  return value ? "כן" : "לא";
}

document.addEventListener("DOMContentLoaded", setupLayout);
