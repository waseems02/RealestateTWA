const express = require("express");
const { searchListings } = require("../services/listingsService");

const router = express.Router();

/**
 * GET /api/listings
 *
 * Query params (all optional, see listingsService.getFilterParameterSchema):
 *   city, min_price, max_price, min_rooms, min_sqm, furnished,
 *   has_balcony, parking_available, air_conditioning, accessible,
 *   pets_allowed, smoking_allowed, roommates_status, religious,
 *   gender_preference, max_bus_distance_m, max_train_distance_m,
 *   university_name, max_university_distance_m, limit
 *
 * Booleans accept "1"/"true"/"yes" as truthy, "0"/"false"/"no" as falsy.
 * Missing booleans are treated as "don't care" (not filtered).
 */
router.get("/", async (req, res) => {
  try {
    const filters = parseFilters(req.query);
    const { mode, data, warning } = await searchListings(filters);
    const payload = { mode, data };
    if (warning) payload.warning = warning;
    return res.json(payload);
  } catch (err) {
    console.warn(`/api/listings failed: ${err.message}`);
    return res.status(500).json({ error: "listings query failed" });
  }
});

function parseFilters(q) {
  const f = {};
  if (q.city) f.city = String(q.city);
  if (q.min_price) f.min_price = num(q.min_price);
  if (q.max_price) f.max_price = num(q.max_price);
  if (q.min_rooms) f.min_rooms = num(q.min_rooms);
  if (q.min_sqm) f.min_sqm = num(q.min_sqm);
  if (q.furnished && ["none", "partial", "full"].includes(q.furnished)) {
    f.furnished = q.furnished;
  }
  if (q.has_balcony != null) f.has_balcony = bool(q.has_balcony);
  if (q.parking_available != null) f.parking_available = bool(q.parking_available);
  if (q.air_conditioning != null) f.air_conditioning = bool(q.air_conditioning);
  if (q.accessible != null) f.accessible = bool(q.accessible);
  if (q.pets_allowed != null) f.pets_allowed = bool(q.pets_allowed);
  if (q.smoking_allowed != null) f.smoking_allowed = bool(q.smoking_allowed);
  if (q.roommates_status && ["student", "professional", "mixed"].includes(q.roommates_status)) {
    f.roommates_status = q.roommates_status;
  }
  if (q.religious && ["secular", "traditional", "religious", "mixed"].includes(q.religious)) {
    f.religious = q.religious;
  }
  if (q.gender_preference && ["any", "male", "female"].includes(q.gender_preference)) {
    f.gender_preference = q.gender_preference;
  }
  if (q.max_bus_distance_m) f.max_bus_distance_m = num(q.max_bus_distance_m);
  if (q.max_train_distance_m) f.max_train_distance_m = num(q.max_train_distance_m);
  if (q.university_name) f.university_name = String(q.university_name);
  if (q.max_university_distance_m)
    f.max_university_distance_m = num(q.max_university_distance_m);
  if (q.limit) f.limit = num(q.limit);
  return f;
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function bool(v) {
  const s = String(v).toLowerCase().trim();
  if (["1", "true", "yes", "on"].includes(s)) return true;
  if (["0", "false", "no", "off"].includes(s)) return false;
  return undefined;
}

module.exports = router;
