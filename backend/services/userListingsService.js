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

// 12 hand-verified simple apartment interiors. Keep in sync with the
// frontend pools + migration 0009.
const APARTMENT_PHOTOS = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1522444690501-d3cdef84a8c1?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1600&q=80",
];

function placeholderImageFor(listingId) {
  const seed = String(listingId || "").split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return APARTMENT_PHOTOS[seed % APARTMENT_PHOTOS.length];
}

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
  // Capture image_urls separately — listing_images is its own table.
  const imageUrls = Array.isArray(body?.image_urls)
    ? body.image_urls.filter((u) => typeof u === "string" && /^https?:\/\//.test(u)).slice(0, 5)
    : [];

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

  // If the user didn't provide lat/lng but did pick a campus, fall back to
  // the campus location (so the listing-details map at least renders the
  // right neighbourhood instead of an empty state).
  if ((fields.latitude == null || fields.longitude == null) && fields.campus_id) {
    const { data: c } = await userClient
      .from("campuses")
      .select("latitude, longitude")
      .eq("id", fields.campus_id)
      .maybeSingle();
    if (c && c.latitude != null && c.longitude != null) {
      fields.latitude = c.latitude;
      fields.longitude = c.longitude;
    }
  }

  const row = {
    ...fields,
    owner_id: user.id,
    source_type: "manual_user",
    status: "active",
  };

  const { data: inserted, error } = await userClient
    .from("listings")
    .insert(row)
    .select()
    .single();
  if (error) {
    const err = new Error(error.message);
    err.status = 400;
    throw err;
  }

  // Attach images. Use whatever the user pasted; if none, give them one
  // picsum-seeded placeholder so the listing renders properly on the grid.
  const finalUrls = imageUrls.length ? imageUrls : [placeholderImageFor(inserted.id)];
  const imageRows = finalUrls.map((url) => ({
    listing_id: inserted.id,
    image_url: url,
    alt_text: "תמונה של הדירה",
  }));
  const { error: imgErr } = await userClient.from("listing_images").insert(imageRows);
  if (imgErr) console.warn(`listing_images insert failed: ${imgErr.message}`);

  return inserted;
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
