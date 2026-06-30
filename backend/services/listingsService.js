const { getSupabaseClient } = require("./supabaseClient");
const { demoListings } = require("../utils/demoData");

function parseBoolean(value) {
  if (value === true || value === "true" || value === "1" || value === "yes") return true;
  if (value === false || value === "false" || value === "0" || value === "no") return false;
  return undefined;
}

function getPrice(listing) {
  return Number(listing.price ?? listing.price_nis ?? listing.monthly_rent ?? 0);
}

function normalizeListing(listing) {
  const images = listing.listing_images || listing.images || [];
  const listingType =
    listing.listing_type ||
    (String(listing.title || "").includes("חדר") || Number(listing.current_roommates_count ?? listing.num_roommates ?? 0) > 0
      ? "room"
      : "apartment");
  const price = getPrice(listing);
  const furnished =
    typeof listing.furnished === "boolean" ? listing.furnished : ["partial", "full", "true"].includes(String(listing.furnished));

  return {
    ...listing,
    price,
    listing_type: listingType,
    balcony: Boolean(listing.balcony ?? listing.has_balcony),
    parking: Boolean(listing.parking ?? listing.parking_available),
    elevator: Boolean(listing.elevator),
    furnished,
    current_roommates_count: Number(listing.current_roommates_count ?? listing.num_roommates ?? listing.roommates ?? 0),
    distance_to_bus_station_m: listing.distance_to_bus_station_m ?? listing.bus_stop_distance_m ?? null,
    distance_to_train_station_km:
      listing.distance_to_train_station_km ??
      (listing.train_station_distance_m != null ? Number(listing.train_station_distance_m) / 1000 : null),
    distance_to_campus_km:
      listing.distance_to_campus_km ??
      (listing.listing_universities?.[0]?.distance_m != null ? Number(listing.listing_universities[0].distance_m) / 1000 : null),
    nearest_bus_station: listing.nearest_bus_station || "לא צוין",
    nearest_train_station: listing.nearest_train_station || "לא צוין",
    images
  };
}

function filterListings(listings, filters = {}) {
  const city = String(filters.city || "").trim().toLowerCase();
  const maxPrice = Number(filters.maxPrice || 0);
  const listingType = String(filters.listingType || "").trim();
  const campusId = String(filters.campusId || "").trim();
  const hasBalcony = parseBoolean(filters.hasBalcony);
  const furnished = parseBoolean(filters.furnished);
  const nearTransport = parseBoolean(filters.nearTransport);

  return listings.filter((listing) => {
    const normalized = normalizeListing(listing);
    if (city && !String(normalized.city || "").toLowerCase().includes(city)) return false;
    if (maxPrice && getPrice(normalized) > maxPrice) return false;
    if (listingType && normalized.listing_type !== listingType) return false;
    if (campusId && String(normalized.campus_id || "") !== campusId) return false;
    if (hasBalcony !== undefined && Boolean(normalized.balcony) !== hasBalcony) return false;
    if (furnished !== undefined && Boolean(normalized.furnished) !== furnished) return false;
    if (nearTransport !== undefined) {
      const busDistance = Number(normalized.distance_to_bus_station_m ?? 999999);
      const trainDistance = Number(normalized.distance_to_train_station_km ?? 999999);
      const isNear = busDistance <= 500 || trainDistance <= 1.5 || Boolean(normalized.near_public_transportation);
      if (isNear !== nearTransport) return false;
    }
    return true;
  });
}

function paginate(listings, filters = {}) {
  const limit = Math.min(Math.max(Number(filters.limit || 50), 1), 100);
  const page = Math.max(Number(filters.page || 1), 1);
  const start = (page - 1) * limit;
  return listings.slice(start, start + limit);
}

function mockResult(filters = {}) {
  const filtered = filterListings(demoListings.map(normalizeListing), filters);
  return {
    success: true,
    source: "mock",
    count: filtered.length,
    listings: paginate(filtered, filters)
  };
}

function applySupabaseFilters(query, filters = {}) {
  const city = String(filters.city || "").trim();
  const maxPrice = Number(filters.maxPrice || 0);
  const listingType = String(filters.listingType || "").trim();
  const campusId = String(filters.campusId || "").trim();
  const hasBalcony = parseBoolean(filters.hasBalcony);
  const furnished = parseBoolean(filters.furnished);
  const nearTransport = parseBoolean(filters.nearTransport);
  const limit = Math.min(Math.max(Number(filters.limit || 50), 1), 100);
  const page = Math.max(Number(filters.page || 1), 1);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let next = query.eq("status", "active");
  if (city) next = next.ilike("city", `%${city}%`);
  if (maxPrice) next = next.lte("price", maxPrice);
  if (listingType) next = next.eq("listing_type", listingType);
  if (campusId) next = next.eq("campus_id", campusId);
  if (hasBalcony !== undefined) next = next.eq("balcony", hasBalcony);
  if (furnished !== undefined) next = next.eq("furnished", furnished);
  if (nearTransport === true) next = next.lte("distance_to_bus_station_m", 500);
  if (nearTransport === false) next = next.gt("distance_to_bus_station_m", 500);
  return next.order("created_at", { ascending: false }).range(from, to);
}

async function querySupabaseListings(filters = {}) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const baseSelect = "*, listing_images(id, image_url, alt_text)";
  let { data, error, count } = await applySupabaseFilters(
    supabase.from("listings").select(baseSelect, { count: "exact" }),
    filters
  );

  if (error && /listing_images|relationship|schema cache/i.test(error.message)) {
    ({ data, error, count } = await applySupabaseFilters(supabase.from("listings").select("*", { count: "exact" }), filters));
  }

  if (error) {
    console.warn(`Supabase listings query failed: ${error.message}`);
    return null;
  }

  return {
    success: true,
    source: "supabase",
    count: count ?? data.length,
    listings: data.map(normalizeListing)
  };
}

async function listListings(filters = {}) {
  const result = await querySupabaseListings(filters);
  return result || mockResult(filters);
}

async function getListingById(id) {
  const supabase = getSupabaseClient();
  if (supabase) {
    let { data, error } = await supabase
      .from("listings")
      .select("*, listing_images(id, image_url, alt_text)")
      .eq("id", id)
      .maybeSingle();

    if (error && /listing_images|relationship|schema cache/i.test(error.message)) {
      ({ data, error } = await supabase.from("listings").select("*").eq("id", id).maybeSingle());
    }

    if (!error && data) {
      return { success: true, source: "supabase", listing: normalizeListing(data) };
    }

    if (error) console.warn(`Supabase listing detail query failed: ${error.message}`);
  }

  const listing = demoListings.map(normalizeListing).find((item) => String(item.id) === String(id));
  return {
    success: Boolean(listing),
    source: "mock",
    listing: listing || null
  };
}

module.exports = {
  listListings,
  getListingById,
  filterListings,
  normalizeListing
};
