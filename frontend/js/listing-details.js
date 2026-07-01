// RoomieFit listing details — fetches single listing from /api/listings, renders
// gallery + key facts + amenities + roommates + commute + embedded mini-map.

// Curated real apartment photos, deterministic per listing id. Each gallery
// tile picks a different photo from the pool so the four thumbnails don't
// repeat.
// 12 hand-verified simple apartment interiors. Dropped 6 questionable
// IDs from the previous pool (one turned out to be a shampoo bottle).
const APARTMENT_PHOTOS = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1522444690501-d3cdef84a8c1?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1600&q=80",
];
function galleryFallbacks(listingId) {
  const seed = String(listingId || "x").split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return [0, 1, 2, 3].map((offset) => APARTMENT_PHOTOS[(seed + offset) % APARTMENT_PHOTOS.length]);
}

const fmtPrice = (n) => (n == null ? "—" : "₪" + Number(n).toLocaleString("he-IL"));
const fmtDist = (m) => (m == null ? "—" : m < 1000 ? `${m} מ׳` : `${(m / 1000).toFixed(1)} ק"מ`);
const escapeHtml = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Walking speed ≈ 80 m/min. For distances > 2 km we show the km figure too —
// students wouldn't walk 4 km to the train station, they'd take a bus.
function walkMinutes(metres) {
  if (metres == null) return null;
  return Math.max(1, Math.round(metres / 80));
}
function commuteText(metres, mode) {
  if (metres == null) return "—";
  const mins = walkMinutes(metres);
  if (metres <= 1500) return `${mins} דק׳ הליכה`;
  if (metres <= 3000) return `${mins} דק׳ / ${fmtDist(metres)}`;
  return fmtDist(metres);
}
function listingTypeLabel(t) {
  return t === "room" ? "חדר בדירת שותפים" : t === "apartment" ? "דירה שלמה" : null;
}

function furnishedLabel(f) {
  return ({ none: "ללא ריהוט", partial: "ריהוט חלקי", full: "מרוהטת לגמרי" })[f] || "—";
}
function statusLabel(s) {
  return ({ student: "סטודנטים", professional: "עובדים", mixed: "מעורב" })[s] || null;
}
function religiousLabel(t) {
  return ({ secular: "חילוני", traditional: "מסורתי", religious: "דתי", mixed: "מעורב" })[t] || null;
}
function genderLabel(g) {
  return ({ female: "בנות בלבד", male: "בנים בלבד", any: "לא משנה" })[g] || null;
}
function sourceTone(src) {
  return ({
    yad2: "bg-yellow-100 text-yellow-800",
    facebook_group: "bg-blue-100 text-blue-800",
    facebook: "bg-blue-100 text-blue-800",
    university_board: "bg-indigo-100 text-indigo-800",
    public_source: "bg-emerald-100 text-emerald-800",
    other: "bg-emerald-100 text-emerald-800",
    manual: "bg-surface-container-highest text-on-surface-variant",
  })[src] || "bg-surface-container-highest text-on-surface-variant";
}
function sourceLabel(src) {
  return ({
    yad2: "Yad2",
    facebook_group: "פייסבוק",
    facebook: "פייסבוק",
    university_board: "לוח האוניברסיטה",
    public_source: "מקור פתוח",
    other: "אחר",
    manual: "ידני",
  })[src] || "ידני";
}

async function load() {
  const id = new URLSearchParams(location.search).get("id");
  if (!id) {
    document.getElementById("detailRoot").innerHTML = errorBox("לא צוין מזהה דירה.");
    return;
  }

  let listing;
  try {
    // The DB now has 160+ listings; bump the search size so deep links
    // resolve even for listings that aren't on the first page.
    const res = await fetch(`/api/listings?limit=200`);
    const payload = await res.json();
    listing = (payload.data || []).find((x) => String(x.id) === String(id));
  } catch (err) {
    document.getElementById("detailRoot").innerHTML = errorBox("שגיאה בטעינת הדירה. נסה שוב.");
    return;
  }

  if (!listing) {
    document.getElementById("detailRoot").innerHTML = errorBox("הדירה לא נמצאה.");
    return;
  }

  document.title = `${listing.title} | RoomieFit`;
  render(listing);
}

function errorBox(msg) {
  return `<div class="bg-white rounded-2xl p-2xl text-center custom-shadow">
    <span class="material-symbols-outlined text-6xl text-on-surface-variant">error_outline</span>
    <p class="mt-md text-on-surface-variant">${escapeHtml(msg)}</p>
    <a href="listings.html" class="inline-block mt-lg bg-primary text-white px-lg py-sm rounded-xl font-bold text-sm">חזרה לדירות</a>
  </div>`;
}

function render(listing) {
  const fb = galleryFallbacks(listing.id);
  const galleryImgs = (listing.images && listing.images.length ? listing.images : []).concat(fb).slice(0, 4);
  const root = document.getElementById("detailRoot");
  const uni = listing.nearest_university;
  const rm = listing.roommates || {};

  root.innerHTML = `
    <!-- Gallery (click to zoom) — shrunk from 500 px → 380 px so the
         main image doesn't dominate the fold and the title / details
         are visible without scrolling. -->
    <section class="grid grid-cols-1 md:grid-cols-4 gap-md md:h-[380px]">
      <button type="button" class="js-lightbox group md:col-span-3 h-72 md:h-full rounded-2xl overflow-hidden custom-shadow relative cursor-zoom-in border-none p-0" data-img-idx="0">
        <img src="${galleryImgs[0]}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="${escapeHtml(listing.title)}" />
        <span class="absolute bottom-md end-md bg-black/55 text-white text-xs font-bold px-md py-xs rounded-full flex items-center gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
          <span class="material-symbols-outlined" style="font-size:16px;">zoom_in</span>
          הגדל
        </span>
      </button>
      <div class="grid grid-cols-3 md:grid-cols-1 gap-md h-full">
        <button type="button" class="js-lightbox rounded-2xl overflow-hidden custom-shadow relative cursor-zoom-in group border-none p-0" data-img-idx="1">
          <img src="${galleryImgs[1]}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="תמונה 2" />
        </button>
        <button type="button" class="js-lightbox rounded-2xl overflow-hidden custom-shadow relative cursor-zoom-in group border-none p-0" data-img-idx="2">
          <img src="${galleryImgs[2]}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="תמונה 3" />
        </button>
        <button type="button" class="js-lightbox rounded-2xl overflow-hidden custom-shadow relative cursor-zoom-in group border-none p-0" data-img-idx="3">
          <img src="${galleryImgs[3]}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="תמונה 4" />
        </button>
      </div>
    </section>

    <div class="grid lg:grid-cols-3 gap-xl items-start">
      <!-- Left column -->
      <div class="lg:col-span-2 space-y-xl">
        <!-- Title -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div>
            <div class="flex items-center gap-sm mb-sm flex-wrap">
              ${listingTypeLabel(listing.listing_type) ? `<span class="bg-primary text-on-primary px-sm py-xs rounded-full text-xs font-bold">${listingTypeLabel(listing.listing_type)}</span>` : ""}
              <span class="${sourceTone(listing.source)} px-sm py-xs rounded-full text-xs font-bold">מקור: ${sourceLabel(listing.source)} (דמו)</span>
              ${listing.source_url ? `<a href="${listing.source_url}" target="_blank" rel="noopener" class="text-xs text-on-surface-variant underline">קישור מקור</a>` : ""}
            </div>
            <h1 class="font-heading font-bold text-3xl md:text-4xl">${escapeHtml(listing.title)}</h1>
            <p class="text-on-surface-variant text-base flex items-center gap-xs mt-xs flex-wrap">
              <span class="material-symbols-outlined text-primary">location_on</span>
              <span>${escapeHtml(listing.city || "")}${listing.neighborhood ? ` · ${escapeHtml(listing.neighborhood)}` : ""}${listing.street ? ` · ${escapeHtml(listing.street)}` : ""}</span>
            </p>
          </div>
          <div class="text-end">
            <div class="text-primary font-heading font-bold text-3xl md:text-4xl leading-none">${fmtPrice(listing.price)}<span class="text-xs font-normal text-on-surface-variant"> / חודש</span></div>
          </div>
        </div>

        <!-- Description -->
        ${listing.description ? `<p class="text-base leading-relaxed text-on-surface-variant">${escapeHtml(listing.description)}</p>` : ""}

        <!-- Key facts -->
        <div class="bg-white p-xl rounded-2xl custom-shadow border border-surface-container">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-xl">
            ${factCell("חדרים", listing.rooms ?? "—")}
            ${factCell("גודל", listing.size_sqm ? `${listing.size_sqm} מ"ר` : "—")}
            ${factCell("קומה", listing.floor ?? "—")}
            ${factCell("ריהוט", furnishedLabel(listing.furnished_level))}
            ${factCell("שותפים בדירה", rm.count != null ? `${rm.count}` : "—")}
            ${factCell("פנוי מתאריך", listing.available_from ? new Date(listing.available_from).toLocaleDateString("he-IL") : "מיידי")}
          </div>
        </div>

        <!-- Amenities row -->
        <div>
          <h2 class="font-heading font-semibold text-xl mb-md">מה כלול בדירה</h2>
          <div class="flex flex-wrap gap-sm">
            ${amenityChip("balcony", "מרפסת", listing.balcony)}
            ${amenityChip("ac_unit", "מזגן", listing.air_conditioning)}
            ${amenityChip("garage", "חניה", listing.parking)}
            ${amenityChip("elevator", "מעלית", listing.elevator)}
            ${amenityChip("chair", "מרוהטת", listing.furnished)}
            ${amenityChip("pets", "מותר חיות מחמד", listing.pets_allowed)}
            ${amenityChip("smoke_free", "עישון אסור", !listing.smoking_allowed)}
            ${amenityChip("accessible", "נגישות", listing.accessible)}
          </div>
        </div>

        ${rentalFactsPanel(listing.rental)}

        <!-- Lifestyle / roommates rules -->
        <div class="bg-white p-xl rounded-2xl custom-shadow border border-surface-container">
          <h2 class="font-heading font-semibold text-xl mb-md">סגנון חיים בדירה</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-md text-sm">
            ${ruleRow("smoking_rooms", "עישון", listing.smoking_allowed ? "מותר" : "לא מותר", !listing.smoking_allowed)}
            ${ruleRow("pets", "חיות מחמד", listing.pets_allowed ? "מותר" : "לא מותר", !!listing.pets_allowed)}
            ${ruleRow("group", "סוג השותפים", statusLabel(rm.status) || "לא צוין", !!statusLabel(rm.status))}
            ${ruleRow("local_florist", "אורח חיים", religiousLabel(rm.religious_tag) || listing.lifestyle_tradition_preference || "לא צוין", !!(religiousLabel(rm.religious_tag) || listing.lifestyle_tradition_preference))}
            ${ruleRow("face", "העדפת מגדר", genderLabel(rm.gender_preference) || "לא משנה", true)}
            ${ruleRow("groups", "שותפים בדירה", rm.count != null ? `${rm.count} שותפים` : "—", rm.count != null)}
            ${ruleRow("accessible", "נגישות לכיסא גלגלים / מעלית", listing.accessible == null ? "לא צוין" : listing.accessible ? "כן" : "לא", !!listing.accessible)}
            ${listing.noise_level != null ? ruleRow("volume_up", "רעש (1=שקט, 5=תוסס)", `${listing.noise_level} / 5`, listing.noise_level <= 2) : ""}
            ${listing.safety_rating != null ? ruleRow("shield", "ביטחון (1-5)", `${listing.safety_rating} / 5`, listing.safety_rating >= 4) : ""}
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="space-y-xl">
        <!-- Roommates avatar block -->
        ${rm.count > 0 ? `
        <div class="bg-white p-xl rounded-2xl custom-shadow border border-surface-container">
          <h3 class="font-heading font-semibold text-xl mb-md">השותפים בדירה</h3>
          <div class="flex items-center gap-md mb-md">
            <div class="flex -space-x-3 rtl:space-x-reverse">
              ${[...Array(Math.min(rm.count, 4))].map((_, i) => `<div class="w-12 h-12 rounded-full border-4 border-white bg-primary-fixed flex items-center justify-center text-primary font-bold">${["א","ב","ג","ד"][i]}</div>`).join("")}
            </div>
            <p class="text-sm text-on-surface-variant">${rm.count} שותפים נוכחיים</p>
          </div>
          <div class="flex flex-wrap gap-sm">
            ${statusLabel(rm.status) ? `<span class="bg-primary-fixed text-primary px-md py-xs rounded-full text-xs font-semibold">${statusLabel(rm.status)}</span>` : ""}
            ${religiousLabel(rm.religious_tag) ? `<span class="bg-emerald-50 text-emerald-700 px-md py-xs rounded-full text-xs font-semibold">${religiousLabel(rm.religious_tag)}</span>` : ""}
            ${genderLabel(rm.gender_preference) && rm.gender_preference !== "any" ? `<span class="bg-rose-50 text-rose-700 px-md py-xs rounded-full text-xs font-semibold">${genderLabel(rm.gender_preference)}</span>` : ""}
          </div>
        </div>` : ""}

        <!-- Location + map -->
        <div class="bg-white p-xl rounded-2xl custom-shadow border border-surface-container">
          <h3 class="font-heading font-semibold text-xl mb-md">מיקום ותחבורה</h3>
          <div id="miniMap" class="w-full h-72 rounded-xl mb-md overflow-hidden bg-surface-container-high"></div>
          <div class="space-y-sm text-sm">
            ${commuteRow("school", uni ? (uni.name_he || uni.name_en || uni.name) : "אוניברסיטה / קמפוס", commuteText(uni?.distance_m, "campus"))}
            ${commuteRow("directions_bus", listing.nearest_bus_station || "תחנת אוטובוס", commuteText(listing.distance_to_bus_m, "bus"))}
            ${commuteRow("train", listing.nearest_train_station || "תחנת רכבת", commuteText(listing.distance_to_train_m, "train"))}
          </div>
        </div>

        <!-- Contact -->
        <div class="bg-primary text-on-primary p-xl rounded-2xl shadow-lg">
          <h3 class="font-heading font-semibold text-xl mb-sm">צור קשר עם בעל הדירה</h3>
          ${listing.contact?.name ? `<p class="text-sm opacity-90 mb-xs">${escapeHtml(listing.contact.name)}${listing.contact.phone ? ` · <span dir="ltr">${escapeHtml(listing.contact.phone)}</span>` : ""}</p>` : `<p class="text-sm opacity-90 mb-md">בקש פרטים נוספים, סייר וירטואלי, או תאם ביקור.</p>`}
          <button id="contactBtnSide" type="button" class="w-full bg-brand-coral hover:bg-brand-coral-dark text-white py-md rounded-xl font-bold transition-all mt-md">
            <span class="material-symbols-outlined align-middle">forum</span>
            <span class="align-middle">שלח הודעה</span>
          </button>
          <button type="button" onclick="location.href='index.html?chat=open'" class="w-full mt-sm text-center text-sm text-on-primary/80 hover:text-white underline bg-transparent border-none cursor-pointer">
            או שאל את עוזר ה-AI על הדירה
          </button>
        </div>
      </div>
    </div>
  `;

  // Sticky bar
  document.getElementById("stickyPrice").textContent = fmtPrice(listing.price);
  document.getElementById("stickyBar").classList.remove("hidden");

  // Contact buttons — open a small modal with the owner's contact info,
  // not a placeholder alert.
  const onContact = () => openContactModal(listing);
  document.getElementById("contactBtn").addEventListener("click", onContact);
  const sideBtn = document.getElementById("contactBtnSide");
  if (sideBtn) sideBtn.addEventListener("click", onContact);

  // Lightbox — clicking any gallery tile opens a full-screen overlay.
  root.querySelectorAll(".js-lightbox").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.imgIdx) || 0;
      openLightbox(galleryImgs, idx);
    });
  });

  // Mini map — apartment pin (price) + campus pin (uni name) + dashed walking
  // line between them, auto-fit to show both.
  if (listing.latitude != null && listing.longitude != null) {
    const mapEl = document.getElementById("miniMap");
    const map = L.map(mapEl, { zoomControl: true, attributionControl: false }).setView(
      [listing.latitude, listing.longitude],
      15
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);

    const apartmentIcon = L.divIcon({
      className: "",
      html: `<div style="background:linear-gradient(135deg,#3525cd,#4f46e5);color:white;padding:6px 12px;border-radius:999px;font-weight:700;font-size:13px;box-shadow:0 6px 16px rgba(53,37,205,.35);border:2px solid white;white-space:nowrap;">${fmtPrice(listing.price)}</div>`,
      iconSize: [90, 28],
      iconAnchor: [45, 14],
    });
    const apartmentMarker = L.marker([listing.latitude, listing.longitude], { icon: apartmentIcon })
      .addTo(map)
      .bindPopup(`<b>${escapeHtml(listing.title || "")}</b><br>${escapeHtml(listing.neighborhood || "")}`);

    const bounds = [[listing.latitude, listing.longitude]];

    const campus = listing.campus;
    if (campus && campus.latitude != null && campus.longitude != null) {
      const campusIcon = L.divIcon({
        className: "",
        html: `<div style="background:#FB7185;color:white;padding:5px 10px;border-radius:8px;font-weight:700;font-size:12px;box-shadow:0 4px 12px rgba(244,63,94,.35);border:2px solid white;white-space:nowrap;">🎓 ${escapeHtml((campus.name_he || campus.name_en || "").slice(0, 24))}</div>`,
        iconSize: [140, 26],
        iconAnchor: [70, 13],
      });
      L.marker([campus.latitude, campus.longitude], { icon: campusIcon })
        .addTo(map)
        .bindPopup(`<b>${escapeHtml(campus.name_he || campus.name_en || "")}</b>`);

      // Dashed walking line between apartment and campus
      L.polyline(
        [
          [listing.latitude, listing.longitude],
          [campus.latitude, campus.longitude],
        ],
        { color: "#3525cd", weight: 3, opacity: 0.55, dashArray: "8 6" }
      ).addTo(map);

      bounds.push([campus.latitude, campus.longitude]);
    }

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }

    // Fix the "map is cut off" bug — Leaflet caches container size at init,
    // but our container sits inside a grid that finishes layout AFTER init
    // (right column stacks under the gallery on mobile, sticky bar renders
    // late, etc.). invalidateSize forces Leaflet to remeasure and repaint
    // tiles over the full container. We do it:
    //   1. On the next animation frame (immediately after layout settles)
    //   2. After 300ms (in case images / sticky bar shift the layout)
    //   3. On window resize (rotate / responsive breakpoints)
    //   4. On any container resize (ResizeObserver — catches sidebar/font
    //      changes we didn't anticipate).
    const refit = () => {
      map.invalidateSize();
      if (bounds.length > 1) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    };
    requestAnimationFrame(refit);
    setTimeout(refit, 300);
    window.addEventListener("resize", refit);
    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(() => map.invalidateSize()).observe(mapEl);
    }
  } else {
    document.getElementById("miniMap").innerHTML =
      '<div class="flex items-center justify-center h-full text-on-surface-variant text-sm">לא קיימת קואורדינטה לדירה זו.</div>';
  }
}

function factCell(label, value) {
  return `<div class="space-y-xs">
    <p class="text-xs text-on-surface-variant uppercase tracking-wider">${escapeHtml(label)}</p>
    <p class="font-heading font-semibold text-xl">${escapeHtml(String(value))}</p>
  </div>`;
}

function amenityChip(icon, label, active) {
  const cls = active
    ? "bg-primary/10 text-primary border-primary/20"
    : "bg-surface-container text-on-surface-variant/60 border-outline-variant/40 line-through";
  return `<div class="${cls} flex items-center gap-sm px-md py-sm rounded-xl border text-sm font-medium">
    <span class="material-symbols-outlined">${icon}</span>
    ${escapeHtml(label)}
  </div>`;
}

function ruleRow(icon, label, value, positive) {
  return `<div class="flex items-center justify-between gap-sm bg-surface-container-low rounded-xl px-md py-sm">
    <div class="flex items-center gap-sm text-on-surface-variant">
      <span class="material-symbols-outlined text-[20px]">${icon}</span>
      <span>${escapeHtml(label)}</span>
    </div>
    <span class="font-bold ${positive ? "text-emerald-700" : "text-on-surface"}">${escapeHtml(String(value))}</span>
  </div>`;
}

function commuteRow(icon, label, value) {
  return `<div class="flex items-center justify-between">
    <div class="flex items-center gap-sm text-on-surface-variant">
      <span class="material-symbols-outlined">${icon}</span>
      <span>${escapeHtml(label)}</span>
    </div>
    <span class="font-bold">${escapeHtml(String(value))}</span>
  </div>`;
}

// Israeli rental facts — arnona / electricity / water / mamad / shelter /
// deposit / agent fee. Renders "לא צוין" when a field is null so users can
// see what's known vs unknown at a glance.
function rentalFactsPanel(rental) {
  if (!rental) return "";
  const yn = (b) =>
    b == null
      ? '<span class="text-on-surface-variant">לא צוין</span>'
      : b
        ? '<span class="text-emerald-700 font-bold">כלול ✓</span>'
        : '<span class="text-rose-600 font-bold">לא כלול</span>';
  const bool = (b, yes = "יש", no = "אין") =>
    b == null
      ? '<span class="text-on-surface-variant">לא צוין</span>'
      : b
        ? `<span class="text-emerald-700 font-bold">${yes} ✓</span>`
        : `<span class="text-rose-600 font-bold">${no}</span>`;
  const money = (m) =>
    m == null
      ? '<span class="text-on-surface-variant">לא צוין</span>'
      : m === 0
        ? '<span class="text-emerald-700 font-bold">אין ✓</span>'
        : `<span class="font-bold">${m} חודשי שכירות</span>`;

  const row = (label, value) =>
    `<div class="flex items-center justify-between gap-sm bg-surface-container-low rounded-xl px-md py-sm text-sm">
      <span class="text-on-surface-variant">${escapeHtml(label)}</span>${value}
    </div>`;

  return `
    <div class="bg-white p-xl rounded-2xl custom-shadow border border-surface-container">
      <h2 class="font-heading font-semibold text-xl mb-md">פרטי השכירות</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
        ${row("ארנונה", yn(rental.includes_arnona))}
        ${row("חשמל", yn(rental.includes_electricity))}
        ${row("מים", yn(rental.includes_water))}
        ${row("אינטרנט", yn(rental.includes_internet))}
        ${row("ועד בית", yn(rental.includes_building_fee))}
        ${row('ממ״ד בדירה', bool(rental.has_mamad))}
        ${row("מקלט בבניין", bool(rental.has_shelter))}
        ${row("פיקדון", money(rental.deposit_months))}
        ${row("דמי תיווך", money(rental.agent_fee_months))}
      </div>
      <p class="text-xs text-on-surface-variant mt-md">💡 יש/אין ספק? אפשר לשאול את העוזר בצ׳אט על הדירה הזו.</p>
    </div>`;
}

// ---------- Lightbox ----------
function openLightbox(images, startIdx = 0) {
  let idx = startIdx;
  const overlay = document.createElement("div");
  overlay.id = "rfLightbox";
  overlay.style.cssText =
    "position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column;padding:24px;backdrop-filter:blur(4px);";
  overlay.innerHTML = `
    <button type="button" id="lbClose" aria-label="סגור" style="position:absolute;top:24px;inset-inline-end:24px;background:rgba(255,255,255,.15);color:white;border:none;border-radius:50%;width:48px;height:48px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:24px;">
      <span class="material-symbols-outlined">close</span>
    </button>
    <img id="lbImg" src="${images[idx]}" style="max-width:90%;max-height:80%;object-fit:contain;border-radius:12px;box-shadow:0 24px 64px rgba(0,0,0,.5);" />
    <div style="display:flex;gap:16px;align-items:center;margin-top:24px;color:white;">
      <button type="button" id="lbPrev" aria-label="הקודמת" style="background:rgba(255,255,255,.15);color:white;border:none;border-radius:50%;width:44px;height:44px;cursor:pointer;font-size:24px;">
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
      <span id="lbCount" style="font-weight:bold;font-size:14px;">${idx + 1} / ${images.length}</span>
      <button type="button" id="lbNext" aria-label="הבאה" style="background:rgba(255,255,255,.15);color:white;border:none;border-radius:50%;width:44px;height:44px;cursor:pointer;font-size:24px;">
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
    </div>
  `;
  const close = () => { overlay.remove(); document.removeEventListener("keydown", onKey); };
  const show = (n) => {
    idx = (n + images.length) % images.length;
    overlay.querySelector("#lbImg").src = images[idx];
    overlay.querySelector("#lbCount").textContent = `${idx + 1} / ${images.length}`;
  };
  const onKey = (e) => {
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(idx + 1);  // RTL: left = next
    if (e.key === "ArrowRight") show(idx - 1); // RTL: right = prev
  };
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  overlay.querySelector("#lbClose").addEventListener("click", close);
  overlay.querySelector("#lbPrev").addEventListener("click", () => show(idx - 1));
  overlay.querySelector("#lbNext").addEventListener("click", () => show(idx + 1));
  document.addEventListener("keydown", onKey);
  document.body.appendChild(overlay);
}

// ---------- Contact modal ----------
function openContactModal(listing) {
  const c = listing.contact || {};
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(4px);";
  const cleanPhone = c.phone ? String(c.phone).replace(/[^\d+]/g, "") : null;
  overlay.innerHTML = `
    <div style="background:white;border-radius:24px;max-width:420px;width:100%;padding:28px;font-family:Heebo,system-ui,sans-serif;" dir="rtl">
      <div style="display:flex;justify-content:space-between;align-items:start;gap:12px;margin-bottom:8px;">
        <div>
          <h3 style="font-size:18px;font-weight:bold;margin:0;">צור קשר עם בעל/ת הדירה</h3>
          <p style="font-size:12px;color:#777587;margin:4px 0 0 0;">${escapeHtml(listing.title || "")}</p>
        </div>
        <button id="rfCloseContact" aria-label="סגור" style="background:none;border:none;cursor:pointer;color:#777587;">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:20px;">
        ${c.name ? `<div style="background:#f0f3ff;border-radius:12px;padding:12px 14px;"><div style="font-size:11px;color:#777587;">שם</div><div style="font-weight:bold;">${escapeHtml(c.name)}</div></div>` : ""}
        ${c.phone ? `<a href="tel:${escapeHtml(cleanPhone)}" style="background:#3525cd;color:white;border-radius:12px;padding:14px;text-align:center;font-weight:bold;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:8px;"><span class="material-symbols-outlined">call</span><span dir="ltr">${escapeHtml(c.phone)}</span></a>` : ""}
        ${c.phone && cleanPhone ? `<a href="https://wa.me/${escapeHtml(cleanPhone.replace(/^\+?/, "972").replace(/^9720/, "972"))}" target="_blank" rel="noopener" style="background:#25D366;color:white;border-radius:12px;padding:14px;text-align:center;font-weight:bold;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:8px;">💬 שלח/י WhatsApp</a>` : ""}
        ${c.email ? `<a href="mailto:${escapeHtml(c.email)}?subject=פנייה%20לגבי%20דירה%20ב-RoomieFit&body=שלום,%20ראיתי%20את%20המודעה%20%22${encodeURIComponent(listing.title || "")}%22%20ואשמח%20לפרטים." style="background:white;color:#3525cd;border:2px solid #3525cd;border-radius:12px;padding:12px;text-align:center;font-weight:bold;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:8px;"><span class="material-symbols-outlined">mail</span>${escapeHtml(c.email)}</a>` : ""}
        ${!c.name && !c.phone && !c.email ? `<p style="text-align:center;color:#777587;font-size:14px;padding:12px;">לא הוזנו פרטי קשר עדיין. נסה/י לפנות דרך פלטפורמת הפרסום (Yad2 / קבוצת פייסבוק וכו׳).</p>` : ""}
      </div>
    </div>
  `;
  const close = () => overlay.remove();
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  overlay.querySelector("#rfCloseContact").addEventListener("click", close);
  document.body.appendChild(overlay);
}

document.addEventListener("DOMContentLoaded", load);
