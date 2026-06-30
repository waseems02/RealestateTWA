// RoomieFit listings page — filters + grid + Leaflet map.
//
// Reads/writes filter state from URL query string so the home page hero search
// can deep-link here. Talks to /api/listings with the filter shape the backend
// route already supports.

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
];

const SOURCE_PRESENTATION = {
  yad2:             { label: "Yad2", cls: "bg-yellow-100 text-yellow-800" },
  facebook_group:   { label: "פייסבוק", cls: "bg-blue-100 text-blue-800" },
  facebook:         { label: "פייסבוק", cls: "bg-blue-100 text-blue-800" },
  university_board: { label: "לוח קמפוס", cls: "bg-indigo-100 text-indigo-800" },
  public_source:    { label: "מקור פתוח", cls: "bg-emerald-100 text-emerald-800" },
  manual:           { label: "ידני", cls: "bg-surface-container-highest text-on-surface-variant" },
  other:            { label: "אחר", cls: "bg-emerald-100 text-emerald-800" },
};

const STATE = {
  listings: [],
  selectedId: null,
  view: "list", // "list" | "map"
  map: null,
  markers: new Map(), // id -> { marker, listing }
  uniLayer: null,
};

// ---------- helpers ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const fmtPrice = (n) => (n == null ? "—" : "₪" + Number(n).toLocaleString("he-IL"));
const fmtDist = (m) => (m == null ? "—" : m < 1000 ? `${m} מ׳` : `${(m / 1000).toFixed(1)} ק"מ`);
const escapeHtml = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Walking speed ≈ 80 m/min. Cards show minutes — more useful for students than
// raw distance. > 1.5 km we show distance instead since they wouldn't walk it.
function walkMin(m) {
  return m == null ? null : Math.max(1, Math.round(m / 80));
}
function commuteLabel(m) {
  if (m == null) return null;
  if (m <= 1500) return `${walkMin(m)} דק׳ הליכה`;
  return fmtDist(m);
}

function imageFor(listing, idx) {
  return (listing.images && listing.images[0]) || listing.image_url || HERO_IMAGES[idx % HERO_IMAGES.length];
}

function sourceBadge(src) {
  const p = SOURCE_PRESENTATION[src] || SOURCE_PRESENTATION.manual;
  return `<span class="${p.cls} px-sm py-0.5 rounded-full text-[11px] font-semibold">${p.label} · דמו</span>`;
}

// ---------- URL <-> form state ----------
const URL_KEYS = [
  "city",
  "university_name",
  "max_university_distance_m",
  "min_price",
  "max_price",
  "min_rooms",
  "has_balcony",
  "pets_allowed",
  "parking_available",
  "air_conditioning",
  "accessible",
  "smoking_allowed",
  "furnished",
  "roommates_status",
  "religious",
  "gender_preference",
];

function readUrlIntoForm() {
  const q = new URLSearchParams(location.search);
  const set = (id, key) => { const v = q.get(key); if (v != null) $(id).value = v; };
  set("#f_city", "city");
  set("#f_university", "university_name");
  set("#f_max_uni_distance", "max_university_distance_m");
  set("#f_min_price", "min_price");
  set("#f_max_price", "max_price");
  set("#f_furnished", "furnished");
  if (q.get("has_balcony") === "true") $("#f_has_balcony").checked = true;
  if (q.get("pets_allowed") === "true") $("#f_pets_allowed").checked = true;
  if (q.get("parking_available") === "true") $("#f_parking").checked = true;
  if (q.get("air_conditioning") === "true") $("#f_ac").checked = true;
  if (q.get("accessible") === "true") $("#f_accessible").checked = true;
  setChip("roomsChips", "rooms", q.get("min_rooms") ?? "", "#f_min_rooms");
  setChip("smokingChips", "smk", q.get("smoking_allowed") ?? "", "#f_smoking_allowed");
  setChip("rmStatusChips", "rms", q.get("roommates_status") ?? "", "#f_roommates_status");
  setChip("religiousChips", "rel", q.get("religious") ?? "", "#f_religious");
  setChip("genderChips", "gnd", q.get("gender_preference") ?? "", "#f_gender_preference");
}

function buildQuery() {
  const q = new URLSearchParams();
  const push = (k, v) => { if (v !== "" && v != null) q.set(k, v); };
  push("city", $("#f_city").value.trim());
  push("university_name", $("#f_university").value);
  push("max_university_distance_m", $("#f_max_uni_distance").value);
  push("min_price", $("#f_min_price").value);
  push("max_price", $("#f_max_price").value);
  push("min_rooms", $("#f_min_rooms").value);
  push("furnished", $("#f_furnished").value);
  if ($("#f_has_balcony").checked) push("has_balcony", "true");
  if ($("#f_pets_allowed").checked) push("pets_allowed", "true");
  if ($("#f_parking").checked) push("parking_available", "true");
  if ($("#f_ac").checked) push("air_conditioning", "true");
  if ($("#f_accessible").checked) push("accessible", "true");
  push("smoking_allowed", $("#f_smoking_allowed").value);
  push("roommates_status", $("#f_roommates_status").value);
  push("religious", $("#f_religious").value);
  push("gender_preference", $("#f_gender_preference").value);
  push("limit", "100");
  return q;
}

function syncUrl() {
  const q = buildQuery();
  q.delete("limit");
  const qs = q.toString();
  history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
}

// ---------- Chip groups ----------
function setChip(containerId, dataAttr, value, hiddenInputSelector) {
  const buttons = $$(`#${containerId} [data-${dataAttr}]`);
  buttons.forEach((b) => {
    const active = (b.dataset[dataAttr] || "") === (value || "");
    b.classList.toggle("is-active", active);
    if (active) {
      b.classList.add("bg-primary", "text-white", "border-transparent");
      b.classList.remove("border-outline-variant");
    } else {
      b.classList.remove("bg-primary", "text-white");
      b.classList.add("border-outline-variant");
    }
  });
  if (hiddenInputSelector) $(hiddenInputSelector).value = value || "";
}

function bindChipGroup(containerId, dataAttr, hiddenInputSelector, onChange) {
  $$(`#${containerId} [data-${dataAttr}]`).forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      setChip(containerId, dataAttr, btn.dataset[dataAttr] || "", hiddenInputSelector);
      onChange();
    });
  });
}

// ---------- Render ----------
function listingCard(listing, idx) {
  const img = imageFor(listing, idx);
  const uni = listing.nearest_university;
  const uniMins = walkMin(uni?.distance_m);
  const uniName = uni?.name_he || uni?.name_en || uni?.name || "";
  const uniLabel = uni
    ? (uni.distance_m <= 1500
        ? `${uniMins} דק׳ מ${uniName}`
        : `${(uni.distance_m / 1000).toFixed(1)} ק"מ מ${uniName}`)
    : "";
  const typeBadge = listing.listing_type === "room"
    ? '<span class="bg-primary text-on-primary px-sm py-xs rounded-full text-[10px] font-bold">חדר</span>'
    : listing.listing_type === "apartment"
      ? '<span class="bg-brand-coral text-white px-sm py-xs rounded-full text-[10px] font-bold">דירה</span>'
      : "";

  const lifestyleChips = [];
  if (listing.roommates?.status === "student") lifestyleChips.push({ t: "סטודנטים", c: "bg-indigo-50 text-indigo-700" });
  if (listing.roommates?.status === "professional") lifestyleChips.push({ t: "עובדים", c: "bg-indigo-50 text-indigo-700" });
  if (listing.roommates?.religious_tag === "religious") lifestyleChips.push({ t: "דתי", c: "bg-amber-50 text-amber-700" });
  if (listing.roommates?.religious_tag === "secular") lifestyleChips.push({ t: "חילוני", c: "bg-emerald-50 text-emerald-700" });
  if (listing.roommates?.religious_tag === "traditional") lifestyleChips.push({ t: "מסורתי", c: "bg-orange-50 text-orange-700" });
  if (listing.roommates?.gender_preference === "female") lifestyleChips.push({ t: "בנות בלבד", c: "bg-rose-50 text-rose-700" });
  if (listing.roommates?.gender_preference === "male") lifestyleChips.push({ t: "בנים בלבד", c: "bg-blue-50 text-blue-700" });
  if (listing.smoking_allowed) lifestyleChips.push({ t: "מותר לעשן", c: "bg-stone-100 text-stone-700" });
  else lifestyleChips.push({ t: "לא מעשנים", c: "bg-emerald-50 text-emerald-700" });
  if (listing.pets_allowed) lifestyleChips.push({ t: "מותר חיות", c: "bg-amber-50 text-amber-700" });

  const amenityIcons = [];
  if (listing.balcony) amenityIcons.push({ i: "balcony", t: "מרפסת" });
  if (listing.air_conditioning) amenityIcons.push({ i: "ac_unit", t: "מזגן" });
  if (listing.parking) amenityIcons.push({ i: "garage", t: "חניה" });
  if (listing.accessible) amenityIcons.push({ i: "accessible", t: "נגישות" });
  if (listing.furnished) amenityIcons.push({ i: "chair", t: "מרוהט" });

  return `<a href="listing-details.html?id=${encodeURIComponent(listing.id)}" class="bg-white rounded-2xl overflow-hidden custom-shadow custom-shadow-hover transition-all group cursor-pointer block">
    <div class="relative h-64">
      <img loading="lazy" src="${img}" alt="${escapeHtml(listing.title || "דירה")}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div class="absolute top-md start-md flex gap-xs flex-wrap">${typeBadge}${sourceBadge(listing.source)}</div>
      <button class="absolute top-md end-md bg-white/90 backdrop-blur-md p-sm rounded-full custom-shadow text-on-surface-variant hover:text-brand-coral" type="button" onclick="event.preventDefault(); event.stopPropagation();">
        <span class="material-symbols-outlined">favorite</span>
      </button>
      ${listing.available_from ? `<div class="absolute bottom-md start-md bg-emerald-50 text-emerald-800 px-sm py-xs rounded-lg text-[11px] font-bold">פנוי מ-${new Date(listing.available_from).toLocaleDateString("he-IL")}</div>` : ""}
    </div>
    <div class="p-lg">
      <div class="flex justify-between items-start mb-sm">
        <h3 class="font-heading font-semibold text-xl">${fmtPrice(listing.price)} <span class="text-sm text-on-surface-variant font-normal">/ חודש</span></h3>
        <span class="text-xs text-on-surface-variant">${escapeHtml(listing.city || "")} ${listing.neighborhood ? "· " + escapeHtml(listing.neighborhood) : ""}</span>
      </div>
      <p class="text-sm text-on-surface-variant mb-sm font-bold">${escapeHtml(listing.title || "")}</p>
      <p class="text-xs text-on-surface-variant mb-md">${listing.rooms ?? "?"} חדרים · ${listing.size_sqm ?? "?"} מ"ר · קומה ${listing.floor ?? "—"}${listing.roommates?.count ? ` · ${listing.roommates.count} שותפים` : ""}</p>
      <div class="flex flex-wrap gap-xs mb-md">
        ${lifestyleChips.slice(0, 4).map((c) => `<span class="${c.c} px-sm py-xs rounded-lg text-[11px] font-semibold">${c.t}</span>`).join("")}
      </div>
      <div class="border-t border-surface-container pt-sm flex justify-between items-center">
        <div class="flex gap-md text-xs text-on-surface-variant flex-wrap">
          ${uniLabel ? `<span class="flex items-center gap-xs"><span class="material-symbols-outlined text-[16px]">school</span>${escapeHtml(uniLabel)}</span>` : ""}
          ${listing.distance_to_bus_m != null ? `<span class="flex items-center gap-xs"><span class="material-symbols-outlined text-[16px]">directions_bus</span>${commuteLabel(listing.distance_to_bus_m)}</span>` : ""}
        </div>
        <div class="flex gap-xs">
          ${amenityIcons.slice(0, 4).map((a) => `<span title="${a.t}" class="material-symbols-outlined text-secondary text-[18px]">${a.i}</span>`).join("")}
        </div>
      </div>
    </div>
  </a>`;
}

function renderGrid() {
  const grid = $("#grid");
  if (!STATE.listings.length) {
    grid.innerHTML = `<div class="col-span-full text-center text-on-surface-variant py-2xl"><span class="material-symbols-outlined text-6xl">search_off</span><p class="mt-md">לא נמצאו דירות לפי הסינון. נסה לרכך את הקריטריונים.</p></div>`;
    return;
  }
  grid.innerHTML = STATE.listings.map((l, i) => listingCard(l, i)).join("");
}

function renderCount() {
  $("#resultsCount").textContent = STATE.listings.length;
}

// ---------- Map ----------
const UNIVERSITIES = [
  { name_he: "אוניברסיטת תל אביב", lat: 32.1133, lng: 34.8044 },
  { name_he: "האוניברסיטה העברית", lat: 31.7766, lng: 35.1972 },
  { name_he: "הטכניון", lat: 32.7780, lng: 35.0234 },
  { name_he: "בר-אילן", lat: 32.0700, lng: 34.8425 },
  { name_he: "בן-גוריון", lat: 31.2620, lng: 34.8016 },
  { name_he: "אוניברסיטת חיפה", lat: 32.7619, lng: 35.0203 },
  { name_he: "רייכמן", lat: 32.1668, lng: 34.8123 },
  { name_he: "אריאל", lat: 32.1043, lng: 35.2030 },
  { name_he: "ספיר", lat: 31.5232, lng: 34.6033 },
  { name_he: "האוניברסיטה הפתוחה", lat: 32.1810, lng: 34.8950 },
  { name_he: "בצלאל", lat: 31.7857, lng: 35.2007 },
  { name_he: "HIT חולון", lat: 32.0170, lng: 34.7780 },
];

function initMap() {
  if (STATE.map) return;
  STATE.map = L.map("map", { zoomControl: true }).setView([31.85, 35.0], 8);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap',
  }).addTo(STATE.map);

  STATE.uniLayer = L.layerGroup();
  UNIVERSITIES.forEach((u) => {
    const icon = L.divIcon({ className: "", html: `<div class="uni-pin">🎓 ${u.name_he}</div>`, iconSize: [120, 24], iconAnchor: [60, 12] });
    L.marker([u.lat, u.lng], { icon, zIndexOffset: -500 }).bindTooltip(u.name_he).addTo(STATE.uniLayer);
  });
  STATE.uniLayer.addTo(STATE.map);
}

function updateMapMarkers() {
  if (!STATE.map) return;
  STATE.markers.forEach(({ marker }) => STATE.map.removeLayer(marker));
  STATE.markers.clear();

  const bounds = [];
  STATE.listings.forEach((listing) => {
    if (listing.latitude == null || listing.longitude == null) return;
    const icon = L.divIcon({
      className: "",
      html: `<div class="price-pin" data-id="${listing.id}">${fmtPrice(listing.price)}</div>`,
      iconSize: [80, 28],
      iconAnchor: [40, 14],
    });
    const marker = L.marker([listing.latitude, listing.longitude], { icon }).addTo(STATE.map);
    marker.bindPopup(buildPopup(listing), { maxWidth: 320, minWidth: 280, className: "rf-popup" });
    marker.on("click", () => { STATE.selectedId = listing.id; highlightPin(listing.id); });
    STATE.markers.set(listing.id, { marker, listing });
    bounds.push([listing.latitude, listing.longitude]);
  });

  if (bounds.length) {
    STATE.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }
}

function highlightPin(id) {
  STATE.markers.forEach(({ marker }) => {
    const el = marker.getElement();
    if (!el) return;
    const pin = el.querySelector(".price-pin");
    if (pin) pin.classList.remove("is-active");
  });
  const cur = STATE.markers.get(id);
  if (cur) {
    const el = cur.marker.getElement();
    const pin = el && el.querySelector(".price-pin");
    if (pin) pin.classList.add("is-active");
  }
}

function buildPopup(listing) {
  const img = imageFor(listing, 0);
  const uni = listing.nearest_university;
  return `<div class="font-body text-on-surface" style="font-family: 'Heebo', system-ui, sans-serif;">
    <img src="${img}" class="w-full h-32 object-cover rounded-lg mb-sm" />
    <h4 class="font-bold text-base mb-xs">${escapeHtml(listing.title || "")}</h4>
    <p class="text-sm text-on-surface-variant mb-xs">${escapeHtml(listing.city || "")} · ${escapeHtml(listing.neighborhood || "")}</p>
    <p class="text-xl font-bold text-primary mb-xs">${fmtPrice(listing.price)} <span class="text-xs font-normal text-on-surface-variant">/ חודש</span></p>
    <p class="text-xs text-on-surface-variant mb-sm">${listing.rooms ?? "?"} חדרים · ${listing.size_sqm ?? "?"} מ"ר${uni ? ` · ${fmtDist(uni.distance_m)} מ${uni.name_he || uni.name_en || ""}` : ""}</p>
    <a href="listing-details.html?id=${encodeURIComponent(listing.id)}" class="block w-full bg-brand-coral hover:bg-brand-coral-dark text-white text-center py-sm rounded-xl font-bold text-sm">לפרטים →</a>
  </div>`;
}

// ---------- Fetching ----------
async function fetchAndRender() {
  const q = buildQuery();
  // Hit /api/listings with our filters
  try {
    const res = await fetch(`/api/listings?${q.toString()}`);
    const payload = await res.json();
    STATE.listings = payload.data || [];
    applySort();
    renderCount();
    renderGrid();
    if (STATE.view === "map") updateMapMarkers();
    syncUrl();
  } catch (err) {
    $("#grid").innerHTML = `<div class="col-span-full text-center text-red-600 py-2xl">שגיאה בטעינת הדירות.</div>`;
    console.error(err);
  }
}

function applySort() {
  const mode = $("#sortBy").value;
  STATE.listings.sort((a, b) => {
    if (mode === "price_asc") return (a.price || 0) - (b.price || 0);
    if (mode === "price_desc") return (b.price || 0) - (a.price || 0);
    if (mode === "distance_asc") {
      const da = a.nearest_university?.distance_m ?? Infinity;
      const db = b.nearest_university?.distance_m ?? Infinity;
      return da - db;
    }
    return 0;
  });
}

// ---------- View toggle ----------
function setView(v) {
  STATE.view = v;
  if (v === "map") {
    $("#mapPanel").classList.remove("hidden");
    $("#grid").classList.add("hidden");
    $("#viewMap").classList.add("bg-primary", "text-white");
    $("#viewMap").classList.remove("text-on-surface-variant");
    $("#viewList").classList.remove("bg-primary", "text-white");
    $("#viewList").classList.add("text-on-surface-variant");
    initMap();
    setTimeout(() => { STATE.map.invalidateSize(); updateMapMarkers(); }, 100);
  } else {
    $("#mapPanel").classList.add("hidden");
    $("#grid").classList.remove("hidden");
    $("#viewList").classList.add("bg-primary", "text-white");
    $("#viewList").classList.remove("text-on-surface-variant");
    $("#viewMap").classList.remove("bg-primary", "text-white");
    $("#viewMap").classList.add("text-on-surface-variant");
  }
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  readUrlIntoForm();

  // Range label
  const distSlider = $("#f_max_uni_distance");
  const distLabel = $("#distLabel");
  const updateDistLabel = () => { distLabel.textContent = `${(distSlider.value / 1000).toFixed(1)} ק"מ`; };
  distSlider.addEventListener("input", updateDistLabel);
  updateDistLabel();

  // Chip groups
  bindChipGroup("roomsChips", "rooms", "#f_min_rooms", fetchAndRender);
  bindChipGroup("smokingChips", "smk", "#f_smoking_allowed", fetchAndRender);
  bindChipGroup("rmStatusChips", "rms", "#f_roommates_status", fetchAndRender);
  bindChipGroup("religiousChips", "rel", "#f_religious", fetchAndRender);
  bindChipGroup("genderChips", "gnd", "#f_gender_preference", fetchAndRender);

  // Filter form re-fetch on any change
  let debounceTimer;
  const debouncedFetch = () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(fetchAndRender, 200); };
  $("#filters").addEventListener("input", debouncedFetch);
  $("#filters").addEventListener("change", debouncedFetch);

  // Clear
  const CHIP_GROUPS = [
    ["roomsChips", "rooms", "#f_min_rooms"],
    ["smokingChips", "smk", "#f_smoking_allowed"],
    ["rmStatusChips", "rms", "#f_roommates_status"],
    ["religiousChips", "rel", "#f_religious"],
    ["genderChips", "gnd", "#f_gender_preference"],
  ];
  $("#clearFilters").addEventListener("click", (e) => {
    e.preventDefault();
    $("#filters").reset();
    CHIP_GROUPS.forEach(([g, attr, hidden]) => setChip(g, attr, "", hidden));
    distSlider.value = 3000; updateDistLabel();
    fetchAndRender();
  });

  // View toggle
  $("#viewList").addEventListener("click", () => setView("list"));
  $("#viewMap").addEventListener("click", () => setView("map"));

  // Sort
  $("#sortBy").addEventListener("change", () => { applySort(); renderGrid(); if (STATE.view === "map") updateMapMarkers(); });

  fetchAndRender();
});
