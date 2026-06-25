const translations = {
  he: {
    navHome: "בית",
    navListings: "דירות",
    navAI: "AI",
    navLogin: "כניסה",
    footer: "RoomieFit / CampusNest Israel - פרויקט קורס מסדי נתונים"
  },
  en: {
    navHome: "Home",
    navListings: "Listings",
    navAI: "AI",
    navLogin: "Login",
    footer: "RoomieFit / CampusNest Israel - Database course project"
  }
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

  const toggle = document.querySelector("[data-language-toggle]");
  if (toggle) {
    toggle.textContent = lang === "he" ? "English" : "עברית";
  }
}

function setupLayout() {
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

  document.querySelector("[data-language-toggle]").addEventListener("click", () => {
    localStorage.setItem("roomiefit_lang", getLanguage() === "he" ? "en" : "he");
    applyTranslations();
  });

  applyTranslations();
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
