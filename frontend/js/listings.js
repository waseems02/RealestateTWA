function listingMatchesFilters(listing) {
  const city = document.querySelector("#city").value.trim();
  const campus = document.querySelector("#campus").value.trim();
  const listingType = document.querySelector("#listingType").value;
  const maxPrice = Number(document.querySelector("#maxPrice").value || 0);
  const balcony = document.querySelector("#balcony").checked;
  const furnished = document.querySelector("#furnished").checked;
  const transit = document.querySelector("#transit").checked;
  const smoking = document.querySelector("#smoking").value;

  if (city && !String(listing.city || "").includes(city)) return false;
  if (campus && !String(listing.campus || listing.campus_name || "").includes(campus)) return false;
  if (listingType && listing.listing_type !== listingType) return false;
  if (maxPrice && Number(listing.price || listing.monthly_rent || 0) > maxPrice) return false;
  if (balcony && !listing.balcony) return false;
  if (furnished && !listing.furnished) return false;
  if (transit && !listing.near_public_transportation) return false;
  if (smoking === "yes" && !listing.smoking_allowed) return false;
  if (smoking === "no" && listing.smoking_allowed) return false;
  return true;
}

function renderListings(listings) {
  const container = document.querySelector("#listingsGrid");
  const filtered = listings.filter(listingMatchesFilters);

  container.innerHTML = filtered
    .map(
      (listing) => `<article class="card">
        <h2>${listing.title || "דירה לסטודנטים"}</h2>
        <div class="listing-meta">
          <span>${listing.city || ""} ${listing.neighborhood ? "- " + listing.neighborhood : ""}</span>
          <span>${listing.price || listing.monthly_rent || "לא צוין"} ₪ לחודש</span>
          <span>${listing.campus || listing.campus_name || "קמפוס לא צוין"}</span>
          <span>${listing.listing_type === "room" ? "חדר בדירת שותפים" : "דירה מלאה"}</span>
          <span>מרפסת: ${formatBool(listing.balcony)} | מעלית: ${formatBool(listing.elevator)} | חניה: ${formatBool(listing.parking)}</span>
          <span>מרוהטת: ${formatBool(listing.furnished)} | מזגן: ${formatBool(listing.air_conditioning)}</span>
          <span>מרחק לקמפוס: ${listing.distance_to_campus_km ?? "לא צוין"} ק״מ</span>
          <span>אוטובוס: ${listing.nearest_bus_station || "לא צוין"} (${listing.distance_to_bus_station_m ?? "?"} מ׳)</span>
          <span>רכבת/רק״ל: ${listing.nearest_train_station || "לא צוין"} (${listing.distance_to_train_station_km ?? "?"} ק״מ)</span>
        </div>
        <p>${listing.description || ""}</p>
        <a class="button primary" href="listing-details.html?id=${encodeURIComponent(listing.id)}">פרטים</a>
      </article>`
    )
    .join("");

  if (!filtered.length) {
    container.innerHTML = `<div class="panel">לא נמצאו דירות לפי הסינון הנוכחי.</div>`;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const listings = await fetchListings();
  renderListings(listings);
  document.querySelector("#filters").addEventListener("input", () => renderListings(listings));
});
