/**
 * RoomieFit listings service (new schema, post 0004 migration).
 *
 * Single source of truth for searching listings. Used by both
 * /api/listings (REST) and the AI agent (NL → structured filters via
 * @openai/agents). Falls back to demoData when Supabase is not configured
 * so the app stays usable in mock mode.
 *
 * The Supabase schema changed in migration 0004_adopt_new_schema.sql:
 *   listings.price_nis        → listings.price
 *   listings.has_balcony      → listings.balcony
 *   listings.parking_available→ listings.parking
 *   listings.num_roommates    → listings.current_roommates_count
 *   listings.source           → listings.source_type (with _demo suffixes)
 *   listings.is_active        → listings.status = 'active'
 *   listing_universities join → listings.campus_id → campuses.university_id
 *   (new) listings.listing_type ('apartment' | 'room')
 *   (new) listings.contact_*   contact fields
 *   (new) listing_images       one-to-many image URLs
 *
 * This service translates the new columns back into the existing normalised
 * shape the frontend and the AI agent expect, so neither needs to know the
 * schema changed:
 *   { id, title, description, price, city, neighborhood, rooms, size_sqm,
 *     floor, balcony, parking, air_conditioning, accessible (always null
 *     post-migration), furnished (boolean), furnished_level
 *     ('full'|'none'), pets_allowed, smoking_allowed,
 *     listing_type, street, elevator, contact, images[],
 *     roommates: { count, status (null), religious_tag, gender_preference (null) },
 *     distance_to_bus_m, distance_to_train_m, distance_to_supermarket_m (null),
 *     nearest_university: { name, name_he, name_en, distance_m } | null,
 *     available_from, source, source_url (null), mode_source ('supabase'|'demo') }
 */

const { getSupabaseClient } = require("./supabaseClient");
const { demoListings } = require("../utils/demoData");

const CITY_ALIASES = {
  // user-facing Hebrew → canonical English (matches DB rows)
  "תל אביב": "Tel Aviv",
  "ירושלים": "Jerusalem",
  "חיפה": "Haifa",
  "באר שבע": "Be'er Sheva",
  "באר שבע ": "Be'er Sheva",
  "רמת גן": "Ramat Gan",
  "הרצליה": "Herzliya",
  "אריאל": "Ariel",
  "שדרות": "Sderot",
  "רעננה": "Raanana",
  "חולון": "Holon",
  "נתניה": "Netanya",
  "רחובות": "Rehovot",
  // English aliases for the apostrophe variant
  "Beer Sheva": "Be'er Sheva",
};

// Tareq's schema uses "Be'er Sheva" (with apostrophe) in the city text.
const CANONICAL_CITY_TO_DEMO_CITY = {
  "Tel Aviv": "תל אביב",
  Jerusalem: "ירושלים",
  Haifa: "חיפה",
  "Be'er Sheva": "באר שבע",
};

// SELECT joins:
//   - campus (one) → its university (one)
//   - listing_images (many)
const SELECT =
  "*, campuses ( id, name_he, name_en, city, latitude, longitude, universities ( id, name_he, name_en ) ), listing_images ( image_url, alt_text )";

/**
 * @typedef {Object} Filters
 * @property {string=} city
 * @property {number=} min_price
 * @property {number=} max_price
 * @property {number=} min_rooms
 * @property {number=} min_sqm
 * @property {boolean=} furnished
 * @property {boolean=} has_balcony
 * @property {boolean=} parking_available
 * @property {boolean=} air_conditioning
 * @property {boolean=} elevator
 * @property {boolean=} pets_allowed
 * @property {boolean=} smoking_allowed
 * @property {('apartment'|'room')=} listing_type
 * @property {number=} max_bus_distance_m
 * @property {number=} max_train_distance_m
 * @property {string=} university_name
 * @property {number=} max_university_distance_m
 * @property {number=} limit
 */

function canonicalCity(input) {
  if (!input) return null;
  return CITY_ALIASES[input] || input;
}

// Bidirectional substring match — works whether the agent passes the canonical
// "Technion - Israel Institute of Technology" or the bare "Technion".
function universityNameMatches(target, uni) {
  const candidates = [uni?.name_he, uni?.name_en].filter(Boolean).map((s) => s.toLowerCase().trim());
  return candidates.some((name) => name.includes(target) || target.includes(name));
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
      .eq("status", "active")
      .order("created_at", { ascending: false });

    const city = canonicalCity(filters.city);
    if (city) query = query.eq("city", city);
    if (filters.min_price != null) query = query.gte("price", filters.min_price);
    if (filters.max_price != null) query = query.lte("price", filters.max_price);
    if (filters.min_rooms != null) query = query.gte("rooms", filters.min_rooms);
    if (filters.min_sqm != null) query = query.gte("size_sqm", filters.min_sqm);
    if (filters.furnished === true) query = query.eq("furnished", true);
    if (filters.furnished === false) query = query.eq("furnished", false);
    if (filters.has_balcony === true) query = query.eq("balcony", true);
    if (filters.parking_available === true) query = query.eq("parking", true);
    if (filters.air_conditioning === true) query = query.eq("air_conditioning", true);
    if (filters.elevator === true) query = query.eq("elevator", true);
    if (filters.pets_allowed === true) query = query.eq("pets_allowed", true);
    if (filters.smoking_allowed === true) query = query.eq("smoking_allowed", true);
    if (filters.smoking_allowed === false) query = query.eq("smoking_allowed", false);
    if (filters.listing_type) query = query.eq("listing_type", filters.listing_type);
    if (filters.max_bus_distance_m != null)
      query = query.lte("distance_to_bus_station_m", filters.max_bus_distance_m);
    if (filters.max_train_distance_m != null)
      query = query.lte("distance_to_train_station_km", filters.max_train_distance_m / 1000);

    const limit = clampLimit(filters.limit);
    query = query.limit(limit + 50); // overshoot for university post-filter

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
        return (r.nearest_university.distance_m ?? Infinity) <= maxDist;
      });
    } else if (filters.max_university_distance_m != null) {
      rows = rows.filter(
        (r) =>
          r.nearest_university != null &&
          (r.nearest_university.distance_m ?? Infinity) <= filters.max_university_distance_m
      );
    }

    return { mode: "supabase", data: rows.slice(0, limit) };
  } catch (err) {
    console.warn(`Listings service error: ${err.message}`);
    return searchDemo(filters, { warning: err.message });
  }
}

function normalizeSupabaseRow(row) {
  const campus = row.campuses;
  const uni = campus?.universities;
  // distance_to_campus_km lives on the listing row itself (post-migration);
  // we treat it as the nearest_university distance for back-compat.
  const nearestDistanceM =
    row.distance_to_campus_km != null ? Math.round(row.distance_to_campus_km * 1000) : null;

  const nearest_university = uni
    ? {
        name_he: uni.name_he,
        name_en: uni.name_en,
        name: uni.name_he,
        distance_m: nearestDistanceM,
      }
    : null;

  const images = (row.listing_images || []).map((img) => img.image_url).filter(Boolean);

  // Source: strip the "_demo" suffix so the frontend pill renders the same
  // values it did under the old schema (manual / yad2 / facebook / other).
  const source = row.source_type ? row.source_type.replace(/_demo$/, "") : null;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    city: row.city,
    neighborhood: row.neighborhood,
    rooms: row.rooms,
    size_sqm: row.size_sqm,
    floor: row.floor,
    // Geo data — needed for the listing-details map and the listings map view
    latitude: row.latitude != null ? Number(row.latitude) : null,
    longitude: row.longitude != null ? Number(row.longitude) : null,
    campus: campus
      ? {
          id: campus.id,
          name_he: campus.name_he,
          name_en: campus.name_en,
          city: campus.city,
          latitude: campus.latitude != null ? Number(campus.latitude) : null,
          longitude: campus.longitude != null ? Number(campus.longitude) : null,
        }
      : null,
    balcony: row.balcony,
    parking: row.parking,
    air_conditioning: row.air_conditioning,
    accessible: null, // not in new schema
    furnished: row.furnished === true,
    furnished_level: row.furnished ? "full" : "none",
    pets_allowed: row.pets_allowed,
    smoking_allowed: row.smoking_allowed,
    // New fields surfaced through the existing API:
    listing_type: row.listing_type,
    street: row.street,
    elevator: row.elevator,
    suitable_for_roommates: row.suitable_for_roommates,
    lifestyle_tradition_preference: row.lifestyle_tradition_preference,
    nearest_bus_station: row.nearest_bus_station,
    nearest_train_station: row.nearest_train_station,
    contact: {
      name: row.contact_name,
      phone: row.contact_phone,
      email: row.contact_email,
    },
    images,
    image_url: images[0] || null,
    created_at: row.created_at,
    roommates: {
      count: row.current_roommates_count,
      status: null, // not in new schema
      religious_tag: row.lifestyle_tradition_preference || null,
      gender_preference: null, // not in new schema
    },
    distance_to_bus_m: row.distance_to_bus_station_m,
    distance_to_train_m:
      row.distance_to_train_station_km != null
        ? Math.round(row.distance_to_train_station_km * 1000)
        : null,
    distance_to_supermarket_m: null,
    nearest_university,
    available_from: row.available_from,
    source,
    source_url: null,
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
  if (filters.listing_type) rows = rows.filter((r) => r.listing_type === filters.listing_type);

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
    city: d.city,
    neighborhood: d.neighborhood,
    rooms: estimateRoomsFromDemo(d),
    size_sqm: d.size_sqm,
    floor: d.floor,
    balcony: d.balcony,
    parking: d.parking,
    air_conditioning: null,
    accessible: null,
    furnished: d.furnished === true,
    furnished_level: d.furnished ? "full" : "none",
    pets_allowed: null,
    smoking_allowed: d.smoking_allowed,
    listing_type: d.title?.includes("חדר") ? "room" : "apartment",
    street: null,
    elevator: null,
    suitable_for_roommates: null,
    lifestyle_tradition_preference: null,
    contact: { name: null, phone: null, email: null },
    images: [],
    image_url: null,
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
  if (d.title?.includes("חדר")) return 1;
  if (typeof d.roommates === "number") return d.roommates + 1;
  return null;
}

function minutesToMetres(min) {
  if (min == null) return null;
  return Math.round(min * 80);
}

function clampLimit(n) {
  const parsed = Number(n);
  if (!Number.isFinite(parsed) || parsed <= 0) return 10;
  // Cap at 500 — the DB has 164 listings and growing. 50 was too low and
  // hid rows on /listings.html even when the client asked for more.
  return Math.min(parsed, 500);
}

/**
 * JSON-Schema-ish parameter spec for OpenAI function calling. Single source
 * of truth so REST and AI agent stay in sync. Reflects the post-0004 schema:
 *  - `furnished` is now a boolean (was an enum)
 *  - `listing_type` ('apartment'|'room') replaces the old roommates_status
 *  - `roommates_status`, `religious`, `gender_preference`, `accessible` are
 *    no longer in the schema and have been removed from the filter set.
 */
function getFilterParameterSchema() {
  return {
    type: "object",
    properties: {
      city: {
        type: "string",
        description:
          "City name in English (Tel Aviv, Jerusalem, Haifa, Be'er Sheva, Ramat Gan, Herzliya, Ariel, Holon, Netanya, Rehovot) or Hebrew (תל אביב, ירושלים, חיפה, באר שבע, רמת גן, הרצליה, אריאל, חולון, נתניה, רחובות)",
      },
      min_price: { type: "integer", description: "Minimum monthly rent in NIS" },
      max_price: { type: "integer", description: "Maximum monthly rent in NIS" },
      min_rooms: {
        type: "number",
        description: "Minimum number of rooms (can be fractional, e.g. 2.5)",
      },
      min_sqm: { type: "integer", description: "Minimum apartment size in square metres" },
      furnished: {
        type: "boolean",
        description: "true = must be furnished, false = must be unfurnished. Only set if user asked.",
      },
      has_balcony: { type: "boolean" },
      parking_available: { type: "boolean" },
      air_conditioning: { type: "boolean" },
      elevator: { type: "boolean" },
      pets_allowed: { type: "boolean" },
      smoking_allowed: { type: "boolean" },
      listing_type: {
        type: "string",
        enum: ["apartment", "room"],
        description:
          "Whether the user wants a full apartment ('apartment') or a single room in a shared apartment ('room' — חדר בדירת שותפים)",
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
        description: "Max distance to the named university in metres (1500 = walking, 3000 = close)",
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
