const express = require("express");
const { getSupabaseClient } = require("../services/supabaseClient");
const { demoListings } = require("../utils/demoData");

const router = express.Router();

function toPositiveInt(value, fallback, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function filterMockListings(listings, query) {
  const city = String(query.city || "").trim();
  const listingType = String(query.listing_type || "").trim();
  const maxPrice = Number.parseInt(query.max_price, 10);

  return listings.filter((listing) => {
    if (city && ![listing.city, listing.city_en].some((v) => String(v || "").includes(city))) {
      return false;
    }
    if (listingType && listing.listing_type !== listingType) return false;
    if (Number.isFinite(maxPrice) && Number(listing.price || 0) > maxPrice) return false;
    return listing.status === "active";
  });
}

router.get("/", async (req, res) => {
  const page = toPositiveInt(req.query.page, 1, 1000);
  const limit = toPositiveInt(req.query.limit, 100, 200);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const supabase = getSupabaseClient();

  if (!supabase) {
    const filtered = filterMockListings(demoListings, req.query);
    return res.json({
      mode: "mock",
      data: filtered.slice(from, from + limit),
      pagination: { page, limit, total: filtered.length }
    });
  }

  let query = supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (req.query.city) query = query.eq("city", String(req.query.city));
  if (req.query.listing_type) query = query.eq("listing_type", String(req.query.listing_type));
  if (req.query.max_price) query = query.lte("price", Number(req.query.max_price));

  const { data, count, error } = await query.range(from, to);

  if (error) {
    console.warn(`Supabase listings query failed: ${error.message}`);
    const filtered = filterMockListings(demoListings, req.query);
    return res.json({
      mode: "mock",
      warning: "Supabase query failed",
      data: filtered.slice(from, from + limit),
      pagination: { page, limit, total: filtered.length }
    });
  }

  return res.json({
    mode: "supabase",
    data,
    pagination: { page, limit, total: count ?? data.length }
  });
});

module.exports = router;
