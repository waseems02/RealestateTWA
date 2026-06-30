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

async function fetchListing(id) {
  const response = await fetch(`/api/listings/${encodeURIComponent(id)}`);
  if (!response.ok) return null;
  const payload = await response.json();
  return payload.listing || null;
}

function renderDetailMap(listing) {
  const message = document.querySelector("#mapMessage");
  const lat = Number(listing.latitude);
  const lng = Number(listing.longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !window.L) {
    message.textContent = "אין מיקום זמין לדירה זו.";
    message.hidden = false;
    return;
  }

  const map = L.map("map").setView([lat, lng], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(`
      <strong>${formatValue(listing.title)}</strong><br>
      ${formatPrice(listing.price)} ₪<br>
      תחנת אוטובוס: ${formatValue(listing.nearest_bus_station)}<br>
      רכבת / רכבת קלה: ${formatValue(listing.nearest_train_station)}
    `)
    .openPopup();
}

document.addEventListener("DOMContentLoaded", async () => {
  const id = new URLSearchParams(location.search).get("id");
  const listing = id ? await fetchListing(id) : null;
  const container = document.querySelector("#listingDetails");

  if (!listing) {
    container.innerHTML = `<div class="panel">לא נמצאה דירה להצגה.</div>`;
    return;
  }

  container.innerHTML = `<section class="panel">
    <h1 class="page-title">${formatValue(listing.title, "פרטי דירה")}</h1>
    <p class="lead">${formatValue(listing.description, "")}</p>
    <div class="detail-list">
      <span>מחיר: ${formatPrice(listing.price)} ₪</span>
      <span>עיר: ${formatValue(listing.city)}</span>
      <span>שכונה: ${formatValue(listing.neighborhood)}</span>
      <span>סוג: ${formatListingType(listing.listing_type)}</span>
      <span>חדרים: ${formatValue(listing.rooms)}</span>
      <span>גודל: ${formatValue(listing.size_sqm)} מ"ר</span>
      <span>מרפסת: ${formatBool(listing.balcony)}</span>
      <span>קומה: ${formatValue(listing.floor)}</span>
      <span>חניה: ${formatBool(listing.parking)}</span>
      <span>מעלית: ${formatBool(listing.elevator)}</span>
      <span>מרוהטת: ${formatBool(listing.furnished)}</span>
      <span>שותפים: ${formatValue(listing.current_roommates_count)}</span>
      <span>עישון: ${listing.smoking_allowed ? "מותר" : "לא מותר"}</span>
      <span>מרחק מהקמפוס: ${formatValue(listing.distance_to_campus_km)} ק"מ</span>
      <span>תחנת אוטובוס: ${formatValue(listing.nearest_bus_station)}, ${formatValue(listing.distance_to_bus_station_m)} מטר</span>
      <span>רכבת / רכבת קלה: ${formatValue(listing.nearest_train_station)}, ${formatValue(listing.distance_to_train_station_km)} ק"מ</span>
    </div>
  </section>
  <section class="map-panel" aria-label="מיקום הדירה">
    <div id="map"></div>
    <p id="mapMessage" class="map-message" hidden></p>
  </section>`;

  renderDetailMap(listing);
});
