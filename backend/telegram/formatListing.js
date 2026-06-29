/**
 * Formats a normalized listing (see services/listingsService.js) into a
 * Telegram HTML message body. Telegram's HTML parser is restricted to a
 * small set of tags: <b>, <i>, <u>, <s>, <code>, <a>. No <br>, use \n.
 */

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatListingHtml(listing, index, publicAppUrl) {
  const num = index != null ? `${index + 1}. ` : "";
  const title = escapeHtml(listing.title || "דירה");
  const price = listing.price != null ? `${listing.price.toLocaleString("he-IL")} ₪/חודש` : "";

  const factParts = [];
  if (listing.rooms) factParts.push(`${listing.rooms} חדרים`);
  if (listing.size_sqm) factParts.push(`${listing.size_sqm} מ"ר`);
  if (listing.city) factParts.push(escapeHtml(listing.city));
  if (listing.neighborhood) factParts.push(escapeHtml(listing.neighborhood));

  const extras = [];
  if (listing.balcony) extras.push("מרפסת");
  if (listing.parking) extras.push("חניה");
  if (listing.furnished) extras.push("מרוהט");
  if (listing.air_conditioning) extras.push("מזגן");

  const uni = listing.nearest_university;
  const uniLine = uni
    ? `🎓 ${Math.round(uni.distance_m / 100) / 10} ק"מ מ-${escapeHtml(uni.name_he || uni.name_en || uni.name)}`
    : null;

  const lines = [`<b>${num}${title}</b>`];
  if (price) lines.push(`💰 ${price}`);
  if (factParts.length) lines.push(`🏠 ${factParts.join(" · ")}`);
  if (extras.length) lines.push(`✨ ${extras.join(" · ")}`);
  if (uniLine) lines.push(uniLine);

  if (publicAppUrl && listing.id) {
    const url = `${publicAppUrl.replace(/\/+$/, "")}/listing-details.html?id=${encodeURIComponent(listing.id)}`;
    lines.push(`<a href="${escapeHtml(url)}">פרטים מלאים</a>`);
  }

  return lines.join("\n");
}

function formatSearchResultsHtml(result, opts = {}) {
  const { listings = [], reply = "", mode } = result;
  const publicAppUrl = opts.publicAppUrl || process.env.PUBLIC_APP_URL;
  const max = opts.max || 5;

  if (!listings.length) {
    return (
      reply ||
      "לא נמצאו דירות תואמות. אפשר לנסות עיר אחרת, תקציב גבוה יותר, או פחות דרישות."
    );
  }

  const header =
    mode === "mock"
      ? `<b>מצב הדגמה</b> — דוגמאות מהמאגר:`
      : `מצאתי <b>${listings.length}</b> דירות:`;

  const cards = listings
    .slice(0, max)
    .map((l, i) => formatListingHtml(l, i, publicAppUrl));

  const footer =
    listings.length > max ? `\n\nועוד ${listings.length - max} תוצאות נוספות באתר.` : "";

  return [header, ...cards].join("\n\n") + footer;
}

module.exports = { formatListingHtml, formatSearchResultsHtml, escapeHtml };
