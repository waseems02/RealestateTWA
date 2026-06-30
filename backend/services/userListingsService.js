/**
 * RoomieFit user-listings service.
 *
 * Owns the create/read paths that require a logged-in user. The pattern:
 *   1. Receive the user's Supabase access token (JWT) from the route handler.
 *   2. Use the service-role client to call auth.getUser(token), which both
 *      verifies the JWT signature/expiry and returns the user.
 *   3. Create a one-shot supabase-js client *configured with that user's
 *      token* so that any subsequent INSERT/SELECT runs as the user — that
 *      way RLS policies from 0004_adopt_new_schema.sql actually apply.
 *
 * Keeping this in a separate file from listingsService keeps the unauth'd
 * read path simple and avoids accidentally leaking service-role power.
 */

const { createClient } = require("@supabase/supabase-js");
const ws = require("ws");
const { getSupabaseClient } = require("./supabaseClient");

let cachedAdmin = null;

function getAdminClient() {
  if (cachedAdmin) return cachedAdmin;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    const err = new Error("Supabase service role credentials are not configured");
    err.status = 503;
    throw err;
  }
  cachedAdmin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: ws },
  });
  return cachedAdmin;
}

function clientForUserToken(accessToken) {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) {
    const err = new Error("Supabase anon credentials are not configured");
    err.status = 503;
    throw err;
  }
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: ws },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

async function getUserFromToken(token) {
  const admin = getAdminClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) {
    const err = new Error(error?.message || "invalid or expired session");
    err.status = 401;
    throw err;
  }
  return data.user;
}

/** Whitelist of columns a user is allowed to set on their own listing. */
const ALLOWED_FIELDS = new Set([
  "title", "description", "listing_type", "city", "neighborhood", "street",
  "latitude", "longitude", "price", "rooms", "floor", "size_sqm",
  "balcony", "elevator", "parking", "air_conditioning", "furnished",
  "pets_allowed", "smoking_allowed", "suitable_for_roommates",
  "current_roommates_count", "lifestyle_tradition_preference",
  "campus_id", "distance_to_campus_km", "distance_to_bus_station_m",
  "distance_to_train_station_km", "nearest_bus_station",
  "nearest_train_station", "available_from", "contact_name",
  "contact_phone", "contact_email",
]);

function sanitizeInput(body) {
  const out = {};
  for (const [k, v] of Object.entries(body || {})) {
    if (!ALLOWED_FIELDS.has(k)) continue;
    if (v === "" || v === null || typeof v === "undefined") continue;
    out[k] = v;
  }
  return out;
}

async function createListingForUser(token, body) {
  const user = await getUserFromToken(token);
  const fields = sanitizeInput(body);

  // Required fields per migration 0004 schema check constraints
  if (!fields.title || !fields.listing_type || !fields.city || fields.price == null) {
    const err = new Error("title, listing_type, city and price are required");
    err.status = 400;
    throw err;
  }
  if (!["apartment", "room"].includes(fields.listing_type)) {
    const err = new Error("listing_type must be 'apartment' or 'room'");
    err.status = 400;
    throw err;
  }
  if (Number(fields.price) < 0) {
    const err = new Error("price must be >= 0");
    err.status = 400;
    throw err;
  }

  const userClient = clientForUserToken(token);

  // Lazily upsert profile so the FK on listings.owner_id is satisfied even
  // if the user signed up before our profile-bootstrap landed.
  await userClient.from("profiles").upsert(
    {
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "סטודנט",
      email: user.email,
      role: "student",
      preferred_language: "he",
    },
    { onConflict: "id", ignoreDuplicates: false }
  );

  const row = {
    ...fields,
    owner_id: user.id,
    source_type: "manual_user",
    status: "active",
  };

  const { data, error } = await userClient.from("listings").insert(row).select().single();
  if (error) {
    const err = new Error(error.message);
    err.status = 400;
    throw err;
  }
  return data;
}

async function getListingsForUser(token) {
  const user = await getUserFromToken(token);
  const userClient = clientForUserToken(token);

  const { data, error } = await userClient
    .from("listings")
    .select("*, campuses ( id, name_he, name_en, city ), listing_images ( image_url )")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    const err = new Error(error.message);
    err.status = 400;
    throw err;
  }
  return { data: data || [] };
}

module.exports = {
  createListingForUser,
  getListingsForUser,
};
