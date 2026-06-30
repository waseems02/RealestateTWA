let map;
let markersLayer;

function formatValue(value, fallback = "לא צוין") {
  return value === null || value === undefined || value === "" ? fallback : value;
}

function formatPrice(value) {
  if (value === null || value === undefined || value === "") return "לא צוין";
  return Number(value).toLocaleString("he-IL");
}

function formatListingType(type) {
  return type === "room" ? "חדר" : "דירה";
}

function getFilterQuery() {
  const params = new URLSearchParams();
  const city = document.querySelector("#city").value.trim();
  const maxPrice = document.querySelector("#maxPrice").value;
  const listingType = document.querySelector("#listingType").value;

  if (city) params.set("city", city);
  if (maxPrice) params.set("maxPrice", maxPrice);
  if (listingType) params.set("listingType", listingType);
  if (document.querySelector("#hasBalcony").checked) params.set("hasBalcony", "true");
  if (document.querySelector("#furnished").checked) params.set("furnished", "true");
  if (document.querySelector("#nearTransport").checked) params.set("nearTransport", "true");
  params.set("limit", "100");

  return params;
}

async function loadListings() {
  const query = getFilterQuery().toString();
  const response = await fetch(`/api/listings?${query}`);
  const payload = await response.json();
  return {
    source: payload.source || payload.mode || "mock",
    count: payload.count ?? (payload.listings || payload.data || []).length,
    listings: payload.listings || payload.data || []
  };
}

function renderListings(listings) {
  const container = document.querySelector("#listingsGrid");

  container.innerHTML = listings
    .map(
      (listing) => `<article class="card listing-card">
        <h2>${formatValue(listing.title, "דירה לסטודנטים")}</h2>
        <div class="listing-price">${formatPrice(listing.price)} ₪</div>
        <dl class="listing-facts">
          <div><dt>עיר</dt><dd>${formatValue(listing.city)}</dd></div>
          <div><dt>שכונה</dt><dd>${formatValue(listing.neighborhood)}</dd></div>
          <div><dt>סוג</dt><dd>${formatListingType(listing.listing_type)}</dd></div>
          <div><dt>חדרים</dt><dd>${formatValue(listing.rooms)}</dd></div>
          <div><dt>גודל</dt><dd>${formatValue(listing.size_sqm)} מ"ר</dd></div>
          <div><dt>מרפסת</dt><dd>${formatBool(listing.balcony)}</dd></div>
          <div><dt>מעלית</dt><dd>${formatBool(listing.elevator)}</dd></div>
          <div><dt>חניה</dt><dd>${formatBool(listing.parking)}</dd></div>
          <div><dt>מרוהטת</dt><dd>${formatBool(listing.furnished)}</dd></div>
          <div><dt>עישון</dt><dd>${listing.smoking_allowed ? "מותר" : "לא מותר"}</dd></div>
          <div><dt>שותפים</dt><dd>${formatValue(listing.current_roommates_count)}</dd></div>
          <div><dt>מרחק מהקמפוס</dt><dd>${formatValue(listing.distance_to_campus_km)} ק"מ</dd></div>
          <div><dt>תחבורה ציבורית</dt><dd>${formatValue(listing.nearest_bus_station)}, ${formatValue(listing.distance_to_bus_station_m)} מטר</dd></div>
          <div><dt>רכבת</dt><dd>${formatValue(listing.nearest_train_station)}, ${formatValue(listing.distance_to_train_station_km)} ק"מ</dd></div>
        </dl>
        <p>${formatValue(listing.description, "")}</p>
        <a class="button primary" href="listing-details.html?id=${encodeURIComponent(listing.id)}">פרטים</a>
      </article>`
    )
    .join("");

  if (!listings.length) {
    container.innerHTML = `<div class="panel">לא נמצאו דירות לפי הסינון הנוכחי.</div>`;
  }
}

function initMap() {
  if (map || !window.L) return;
  map = L.map("map").setView([31.7683, 35.2137], 11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
}

function renderMap(listings) {
  initMap();
  if (!map || !markersLayer) return;

  const mapMessage = document.querySelector("#mapMessage");
  markersLayer.clearLayers();
  const bounds = [];

  listings.forEach((listing) => {
    const lat = Number(listing.latitude);
    const lng = Number(listing.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const marker = L.marker([lat, lng]).addTo(markersLayer);
    marker.bindPopup(`
      <strong>${formatValue(listing.title)}</strong><br>
      ${formatPrice(listing.price)} ₪<br>
      ${formatValue(listing.city)} / ${formatValue(listing.neighborhood)}<br>
      מרחק מהקמפוס: ${formatValue(listing.distance_to_campus_km)} ק"מ<br>
      <a href="listing-details.html?id=${encodeURIComponent(listing.id)}">לפרטים</a>
    `);
    bounds.push([lat, lng]);
  });

  if (bounds.length) {
    mapMessage.hidden = true;
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 14 });
  } else {
    map.setView([31.7683, 35.2137], 11);
    mapMessage.textContent = "אין מיקום זמין לדירות שמוצגות כרגע.";
    mapMessage.hidden = false;
  }
}

async function refreshListings() {
  const { source, count, listings } = await loadListings();
  document.querySelector("#resultsMeta").textContent = `${count} תוצאות (${source === "supabase" ? "Supabase" : "נתוני דמו"})`;
  renderListings(listings);
  renderMap(listings);
}

document.addEventListener("DOMContentLoaded", () => {
  refreshListings();
  document.querySelector("#filters").addEventListener("input", refreshListings);
});
