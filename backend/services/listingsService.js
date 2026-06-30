/**
 * RoomieFit listings service.
 *
 * Single source of truth for searching listings. Used by both
 * /api/listings (REST) and /api/ai/chat (NL → structured filters via
 * OpenAI tool calling). Falls back to demoData when Supabase is not
 * configured so the app stays usable in mock mode.
 *
 * Normalized listing shape (returned regardless of source):
 *   { id, title, description, price, city, neighborhood, rooms, size_sqm,
 *     floor, balcony, parking, air_conditioning, accessible, furnished
 *     (boolean — true if 'partial' or 'full'), furnished_level
 *     ('none'|'partial'|'full'), pets_allowed, smoking_allowed,
 *     roommates: { count, status, religious_tag, gender_preference },
 *     distance_to_bus_m, distance_to_train_m, distance_to_supermarket_m,
 *     nearest_university: { name, distance_m } | null,
 *     available_from, source, source_url, mode_source ('supabase'|'demo') }
 */

const { getSupabaseClient } = require("./supabaseClient");
const { demoListings } = require("../utils/demoData");

const CITY_ALIASES = {
  // user-facing Hebrew → canonical English (matches DB rows)
  "תל אביב": "Tel Aviv",
  "ירושלים": "Jerusalem",
  "חיפה": "Haifa",
  "באר שבע": "Beer Sheva",
  "רמת גן": "Ramat Gan",
  "הרצליה": "Herzliya",
  "אריאל": "Ariel",
  "שדרות": "Sderot",
  "רעננה": "Raanana",
  "חולון": "Holon",
};

const CANONICAL_CITY_TO_DEMO_CITY = {
  // canonical English → demoData's Hebrew city values
  "Tel Aviv": "תל אביב",
  Jerusalem: "ירושלים",
  Haifa: "חיפה",
  "Beer Sheva": "באר שבע",
};

const SELECT =
  "*, listing_universities ( distance_m, universities ( id, name_en, name_he, city ) )";

/**
 * @typedef {Object} Filters
 * @property {string=} city
 * @property {number=} min_price
 * @property {number=} max_price
 * @property {number=} min_rooms
 * @property {number=} min_sqm
 * @property {('none'|'partial'|'full')=} furnished
 * @property {boolean=} has_balcony
 * @property {boolean=} parking_available
 * @property {boolean=} air_conditioning
 * @property {boolean=} accessible
 * @property {boolean=} pets_allowed
 * @property {boolean=} smoking_allowed
 * @property {('student'|'professional'|'mixed')=} roommates_status
 * @property {('secular'|'traditional'|'religious'|'mixed')=} religious
 * @property {('any'|'male'|'female')=} gender_preference
 * @property {number=} max_bus_distance_m
 * @property {number=} max_train_distance_m
 * @property {string=} university_name
 * @property {number=} max_university_distance_m
 * @property {number=} limit
 */

// Bidirectional substring match so e.g. user-given "Technion - Israel Institute of Technology"
// still matches a row whose name_en is just "Technion", and vice versa.
function universityNameMatches(target, uni) {
  const candidates = [uni.name_he, uni.name_en].filter(Boolean).map((s) => s.toLowerCase().trim());
  return candidates.some((name) => name.includes(target) || target.includes(name));
}

function canonicalCity(input) {
  if (!input) return null;
  return CITY_ALIASES[input] || input;
}

async function searchListings(filters = {}) {
  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (err) {
    console.warn(`Supabase client init failed: ${err.message}`);
    return searchDemo(filters, { warning: `Supabase init failed: ${err.message}` });
  }
  if (!supabase) return searchDemo(filters);

  try {
    let query = supabase
      .from("listings")
      .select(SELECT)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    const city = canonicalCity(filters.city);
    if (city) query = query.eq("city", city);
    if (filters.min_price != null) query = query.gte("price_nis", filters.min_price);
    if (filters.max_price != null) query = query.lte("price_nis", filters.max_price);
    if (filters.min_rooms != null) query = query.gte("rooms", filters.min_rooms);
    if (filters.min_sqm != null) query = query.gte("size_sqm", filters.min_sqm);
    if (filters.furnished) query = query.eq("furnished", filters.furnished);
    if (filters.has_balcony === true) query = query.eq("has_balcony", true);
    if (filters.parking_available === true) query = query.eq("parking_available", true);
    if (filters.air_conditioning === true) query = query.eq("air_conditioning", true);
    if (filters.accessible === true) query = query.eq("accessible", true);
    if (filters.pets_allowed === true) query = query.eq("pets_allowed", true);
    if (filters.smoking_allowed === true) query = query.eq("smoking_allowed", true);
    if (filters.roommates_status) query = query.eq("roommates_status", filters.roommates_status);
    if (filters.religious) query = query.eq("roommates_religious_tag", filters.religious);
    if (filters.gender_preference) query = query.eq("gender_preference", filters.gender_preference);
    if (filters.max_bus_distance_m != null)
      query = query.lte("bus_stop_distance_m", filters.max_bus_distance_m);
    if (filters.max_train_distance_m != null)
      query = query.lte("train_station_distance_m", filters.max_train_distance_m);

    const limit = clampLimit(filters.limit);
    query = query.limit(limit + 50); // slight overshoot for university post-filter

    const { data, error } = await query;
    if (error) {
      console.warn(`Supabase listings query failed: ${error.message}`);
      return searchDemo(filters, { warning: error.message });
    }

    let rows = (data || []).map(normalizeSupabaseRow);

    if (filters.university_name) {
      const target = filters.university_name.toLowerCase().trim();
      const maxDist = filters.max_university_distance_m ?? Infinity;
      rows = rows.filter((r) => {
        if (!r.nearest_university) return false;
        if (!universityNameMatches(target, r.nearest_university)) return false;
        return r.nearest_university.distance_m <= maxDist;
      });
    } else if (filters.max_university_distance_m != null) {
      rows = rows.filter(
        (r) =>
          r.nearest_university != null &&
          r.nearest_university.distance_m <= filters.max_university_distance_m
      );
    }

    return { mode: "supabase", data: rows.slice(0, limit) };
  } catch (err) {
    console.warn(`Listings service error: ${err.message}`);
    return searchDemo(filters, { warning: err.message });
  }
}

function normalizeSupabaseRow(row) {
  const unis = (row.listing_universities || [])
    .filter((j) => j.universities)
    .sort((a, b) => a.distance_m - b.distance_m);
  const nearest = unis[0]
    ? {
        name_he: unis[0].universities.name_he,
        name_en: unis[0].universities.name_en,
        distance_m: unis[0].distance_m,
        // backwards-compat single 'name' field for templates
        name: unis[0].universities.name_he,
      }
    : null;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price_nis,
    city: row.city,
    neighborhood: row.neighborhood,
    rooms: row.rooms,
    size_sqm: row.size_sqm,
    floor: row.floor,
    balcony: row.has_balcony,
    parking: row.parking_available,
    air_conditioning: row.air_conditioning,
    accessible: row.accessible,
    furnished: row.furnished !== "none",
    furnished_level: row.furnished,
    pets_allowed: row.pets_allowed,
    smoking_allowed: row.smoking_allowed,
    roommates: {
      count: row.num_roommates,
      status: row.roommates_status,
      religious_tag: row.roommates_religious_tag,
      gender_preference: row.gender_preference,
    },
    distance_to_bus_m: row.bus_stop_distance_m,
    distance_to_train_m: row.train_station_distance_m,
    distance_to_supermarket_m: row.nearest_supermarket_m,
    nearest_university: nearest,
    available_from: row.available_from,
    source: row.source,
    source_url: row.source_url,
    mode_source: "supabase",
  };
}

function searchDemo(filters, meta = {}) {
  let rows = demoListings.map(normalizeDemoRow);

  const cityHe = filters.city ? CANONICAL_CITY_TO_DEMO_CITY[canonicalCity(filters.city)] : null;
  if (cityHe) rows = rows.filter((r) => r.city === cityHe);

  if (filters.max_price != null) rows = rows.filter((r) => r.price <= filters.max_price);
  if (filters.min_price != null) rows = rows.filter((r) => r.price >= filters.min_price);
  if (filters.min_rooms != null)
    rows = rows.filter((r) => (r.rooms || 0) >= filters.min_rooms);
  if (filters.min_sqm != null)
    rows = rows.filter((r) => (r.size_sqm || 0) >= filters.min_sqm);
  if (filters.has_balcony === true) rows = rows.filter((r) => r.balcony === true);
  if (filters.parking_available === true) rows = rows.filter((r) => r.parking === true);
  if (filters.smoking_allowed === true) rows = rows.filter((r) => r.smoking_allowed === true);
  if (filters.smoking_allowed === false) rows = rows.filter((r) => r.smoking_allowed === false);
  // demo data has no fields for: AC, accessible, pets, roommate status enums,
  // gender, religious — those filters degrade to no-op in mock mode.

  if (filters.university_name) {
    const t = filters.university_name.toLowerCase();
    rows = rows.filter((r) =>
      r.nearest_university?.name?.toLowerCase().includes(t)
    );
  }

  const limit = clampLimit(filters.limit);
  return { mode: "mock", ...meta, data: rows.slice(0, limit) };
}

function normalizeDemoRow(d) {
  return {
    id: d.id,
    title: d.title,
    description: d.description,
    price: d.price,
    city: d.city, // already Hebrew in demoData
    neighborhood: d.neighborhood,
    rooms: estimateRoomsFromDemo(d),
    size_sqm: d.size_sqm,
    floor: d.floor,
    balcony: d.balcony,
    parking: d.parking,
    air_conditioning: null, // not in demo schema
    accessible: null,
    furnished: d.furnished === true,
    furnished_level: d.furnished ? "full" : "none",
    pets_allowed: null,
    smoking_allowed: d.smoking_allowed,
    roommates: {
      count: d.roommates,
      status: null,
      religious_tag: null,
      gender_preference: null,
    },
    distance_to_bus_m: minutesToMetres(d.distance_to_bus_minutes),
    distance_to_train_m: minutesToMetres(d.distance_to_train_minutes),
    distance_to_supermarket_m: null,
    nearest_university: d.campus
      ? {
          name: d.campus,
          name_he: d.campus,
          name_en: d.campus,
          distance_m: minutesToMetres(d.distance_to_campus_minutes),
        }
      : null,
    available_from: null,
    source: "demo",
    source_url: null,
    mode_source: "demo",
  };
}

function estimateRoomsFromDemo(d) {
  // demoData has roommates count but not rooms — rough estimate
  if (d.title?.includes("חדר")) return 1;
  if (typeof d.roommates === "number") return d.roommates + 1;
  return null;
}

function minutesToMetres(min) {
  if (min == null) return null;
  return Math.round(min * 80); // ~80m / min walking
}

function clampLimit(n) {
  const parsed = Number(n);
  if (!Number.isFinite(parsed) || parsed <= 0) return 10;
  return Math.min(parsed, 50);
}

/**
 * JSON-Schema-ish parameter spec for OpenAI function calling. Single
 * source of truth so REST and AI agent stay in sync.
 */
function getFilterParameterSchema() {
  return {
    type: "object",
    properties: {
      city: {
        type: "string",
        description:
          "City name in English (Tel Aviv, Jerusalem, Haifa, Beer Sheva, Ramat Gan, Herzliya, Ariel, Sderot, Raanana, Holon) or Hebrew (תל אביב, ירושלים, חיפה, באר שבע, רמת גן, הרצליה, אריאל, שדרות, רעננה, חולון)",
      },
      min_price: { type: "integer", description: "Minimum monthly rent in NIS" },
      max_price: { type: "integer", description: "Maximum monthly rent in NIS" },
      min_rooms: {
        type: "number",
        description: "Minimum number of rooms (can be fractional, e.g. 2.5)",
      },
      min_sqm: { type: "integer", description: "Minimum apartment size in square metres" },
      furnished: {
        type: "string",
        enum: ["none", "partial", "full"],
        description: "Furnishing level requested",
      },
      has_balcony: { type: "boolean" },
      parking_available: { type: "boolean" },
      air_conditioning: { type: "boolean" },
      accessible: { type: "boolean", description: "Wheelchair/elevator accessible" },
      pets_allowed: { type: "boolean" },
      smoking_allowed: { type: "boolean" },
      roommates_status: {
        type: "string",
        enum: ["student", "professional", "mixed"],
        description: "Whether existing roommates are students, working professionals, or mixed",
      },
      religious: {
        type: "string",
        enum: ["secular", "traditional", "religious", "mixed"],
        description: "Religious observance level of roommates",
      },
      gender_preference: {
        type: "string",
        enum: ["any", "male", "female"],
        description: "Gender restriction on the apartment (e.g. female-only)",
      },
      max_bus_distance_m: {
        type: "integer",
        description: "Max distance to nearest bus stop in metres",
      },
      max_train_distance_m: {
        type: "integer",
        description: "Max distance to nearest train station in metres",
      },
      university_name: {
        type: "string",
        description:
          "Name of a nearby university/college, e.g. 'Tel Aviv University', 'Technion', 'אוניברסיטת בן-גוריון'",
      },
      max_university_distance_m: {
        type: "integer",
        description: "Max distance to the named university in metres",
      },
      limit: {
        type: "integer",
        description: "Maximum number of results to return (1-50, default 10)",
      },
    },
    additionalProperties: false,
  };
}

module.exports = {
  searchListings,
  getFilterParameterSchema,
  canonicalCity,
};
