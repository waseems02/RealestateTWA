document.addEventListener("DOMContentLoaded", async () => {
  const listings = await fetchListings();
  const id = new URLSearchParams(location.search).get("id");
  const listing = listings.find((item) => String(item.id) === String(id)) || listings[0];
  const container = document.querySelector("#listingDetails");

  if (!listing) {
    container.innerHTML = `<div class="panel">לא נמצאה דירה להצגה.</div>`;
    return;
  }

  container.innerHTML = `<section class="panel">
    <h1 class="page-title">${listing.title || "פרטי דירה"}</h1>
    <p class="lead">${listing.description || ""}</p>
    <div class="detail-list">
      <span>מחיר: ${listing.price || listing.monthly_rent || "לא צוין"} ₪</span>
      <span>עיר: ${listing.city || "לא צוין"}</span>
      <span>שכונה: ${listing.neighborhood || "לא צוין"}</span>
      <span>גודל: ${listing.size_sqm || listing.size || "לא צוין"} מ"ר</span>
      <span>מרפסת: ${formatBool(listing.balcony)}</span>
      <span>קומה: ${listing.floor ?? "לא צוין"}</span>
      <span>חניה: ${formatBool(listing.parking)}</span>
      <span>מעלית: ${formatBool(listing.elevator)}</span>
      <span>מרוהטת: ${formatBool(listing.furnished)}</span>
      <span>שותפים: ${listing.roommates ?? "לא צוין"}</span>
      <span>עישון: ${listing.smoking_allowed ? "מותר" : "לא מותר"}</span>
      <span>מרחק לקמפוס: ${listing.distance_to_campus_minutes || "לא צוין"} דקות</span>
      <span>מרחק לאוטובוס: ${listing.distance_to_bus_minutes || "לא צוין"} דקות</span>
      <span>מרחק לרכבת/רכבת קלה: ${listing.distance_to_train_minutes || "לא צוין"} דקות</span>
    </div>
  </section>
  <section class="section">
    <div class="map-placeholder">מפת אזור הדירה - Placeholder</div>
  </section>`;
});
