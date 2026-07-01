/**
 * RoomieFit AI agent (OpenAI Agents SDK).
 *
 * One `RoomieFit` Agent with three tools:
 *   1. search_listings        — structured filter search against Supabase
 *   2. get_listing_details    — pull one listing's full details by id
 *      (used when the user asks follow-up questions about a specific apartment,
 *       e.g. "do these roommates sleep early?")
 *   3. list_universities      — list the universities we know about, so the
 *      agent can resolve "close to my campus" without hallucinating names.
 *
 * Each tool writes structured results into a per-run context object so the
 * HTTP/Telegram caller can render listing cards alongside the model's reply
 * without having to re-parse the text.
 *
 * Returns:
 *   { mode: 'agent',
 *     reply: string,            // final assistant text
 *     listings: NormalizedListing[],   // most-recent search hits (if any)
 *     listing_detail: NormalizedListing | null,
 *     filters: object,                  // most-recent filters the agent used
 *     search_mode: 'supabase' | 'mock' | null,
 *     tool_trace: Array<{ tool: string, input: object }> }
 */

const { Agent, run, tool } = require("@openai/agents");
const { z } = require("zod");

const { searchListings, getFilterParameterSchema } = require("./listingsService");
const { getSupabaseClient } = require("./supabaseClient");

const MODEL = process.env.OPENAI_AGENT_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";

const INSTRUCTIONS = `You are RoomieFit's apartment-search assistant for university students in Israel.

LANGUAGE RULE: Detect the language of the user's most recent message and reply in that exact language. Hebrew → Hebrew. English → English. Never switch.

FILTER RULE — CRITICAL: When you call \`search_listings\`, only set fields the user explicitly mentioned. Do NOT invent values for fields the user didn't talk about. Leave them out entirely. Do not default \`furnished\`, \`gender_preference\`, \`roommates_status\`, \`religious\`, \`min_rooms\`, \`min_sqm\`, etc. unless the user actually said so. Over-filtering returns zero results — under-filtering is always better.

CITY RULE: Copy the city name from the user's message exactly. If they wrote "באר שבע", pass "באר שבע". If they wrote "Tel Aviv", pass "Tel Aviv". Do NOT substitute one city for another.

When the user describes what they want (city, budget, university, lifestyle, amenities), call \`search_listings\` with the minimal set of filters they actually mentioned.

When the user mentions "my campus" or a university and you need the canonical name, call \`list_universities\` first to get the official name and city, THEN call \`search_listings\` with \`university_name\` set and \`max_university_distance_m\` chosen sensibly:
  • "walking distance" / "ליד הקמפוס" → 1500
  • "close" / "קרוב" → 3000
  • "by bus" → 5000

When the user asks a follow-up about a specific apartment from the most recent results — e.g. "tell me more about #2", "what are the roommates like there", "do they sleep early?" — call \`get_listing_details\` with that listing's id, then answer using the description, roommates and rental fields. For subjective lifestyle questions ("do they sleep early?", "are they quiet?"), say honestly that you can only infer from the listing text, then quote/paraphrase the relevant clue.

RENTAL FAQ — common Israeli-market questions students ask (usually about ONE specific apartment from the previous results). Always answer these by calling \`get_listing_details\` first, then reading the \`rental\` object plus the description:
  • "האם ארנונה כלולה?" / "is arnona included?" → rental.includes_arnona
  • "חשמל כלול?" → rental.includes_electricity
  • "מים כלולים?" → rental.includes_water
  • "אינטרנט כלול?" → rental.includes_internet
  • "יש ועד בית?" → rental.includes_building_fee
  • "יש ממ״ד?" / "is there a safe room?" → rental.has_mamad
  • "יש מקלט בבניין?" / "is there a bomb shelter?" → rental.has_shelter
  • "כמה פיקדון?" → rental.deposit_months
  • "יש דמי תיווך?" → rental.agent_fee_months (0 = private landlord, no agent fee)
When the answer is boolean, quote the fact plainly (e.g. "ארנונה כלולה במחיר" or "ארנונה לא כלולה — על השוכר"). Never guess — if a field is null, say "לא צוין במודעה" and suggest the user contact the owner via the contact info.

For general advice ("what should I check before signing a lease?", "what's a typical arnona in Tel Aviv?"), reply directly without any tool call — you're a knowledgeable Israeli-rentals assistant.

Keep replies short — 1–3 sentences. The listing cards speak for themselves.`;

// We use a raw JSON Schema (not Zod) for search_listings because:
//   - The Agents SDK forces strict mode on Zod schemas.
//   - Strict mode requires every property to be present, which makes the model
//     fill defaults instead of leaving fields out. That over-filters every
//     query into zero results.
// With strict:false + a raw JSON Schema, the model can omit unmentioned fields.
const searchListingsTool = tool({
  name: "search_listings",
  description:
    "Search RoomieFit apartments and rooms with structured filters. CRITICAL: only set fields the user EXPLICITLY mentioned — leave everything else out. Do not invent defaults. Returns up to `limit` matching listings (default 10).",
  strict: false,
  parameters: getFilterParameterSchema(),
  execute: async (rawInput, ctx) => {
    const input = stripNulls(rawInput);
    const { data, mode } = await searchListings(input);
    if (ctx?.context) {
      ctx.context.listings = data;
      ctx.context.filters = input;
      ctx.context.search_mode = mode;
      ctx.context.tool_trace.push({ tool: "search_listings", input });
    }
    return JSON.stringify({
      mode,
      count: data.length,
      results: data.slice(0, 10).map(listingForModel),
    });
  },
});

const getListingDetailsTool = tool({
  name: "get_listing_details",
  description:
    "Fetch the full details of one listing by its id. Use this when the user asks a follow-up question about a specific apartment from the most recent search results (e.g. 'tell me more about #2', 'do these roommates sleep early?').",
  parameters: z.object({
    id: z.string().describe("Listing id from a previous search_listings result"),
  }),
  execute: async ({ id }, ctx) => {
    const detail = await fetchListingById(id, ctx?.context);
    if (ctx?.context) {
      ctx.context.listing_detail = detail;
      ctx.context.tool_trace.push({ tool: "get_listing_details", input: { id } });
    }
    if (!detail) return JSON.stringify({ found: false, id });
    return JSON.stringify({ found: true, listing: listingForModel(detail, { full: true }) });
  },
});

const listUniversitiesTool = tool({
  name: "list_universities",
  description:
    "List the universities and colleges that RoomieFit has location data for. Use this when the user mentions 'my campus' or a university name and you need to resolve the canonical name before calling search_listings.",
  parameters: z.object({}),
  execute: async (_input, ctx) => {
    const universities = await fetchUniversities();
    if (ctx?.context) {
      ctx.context.tool_trace.push({ tool: "list_universities", input: {} });
    }
    return JSON.stringify({ universities });
  },
});

const agent = new Agent({
  name: "RoomieFit Assistant",
  instructions: INSTRUCTIONS,
  model: MODEL,
  tools: [searchListingsTool, getListingDetailsTool, listUniversitiesTool],
});

async function runAgent(userMessage, { history = [] } = {}) {
  const context = {
    listings: [],
    listing_detail: null,
    filters: {},
    search_mode: null,
    tool_trace: [],
  };

  // The Agents SDK accepts a string or a structured AgentInputItem[]. To keep
  // things simple across the HTTP boundary we inline the recent history into
  // the user message as a short "previous conversation" preamble. Good enough
  // for follow-up questions like "tell me more about #2" or "do they sleep
  // early?" without needing the frontend to format SDK-specific items.
  const input = history.length
    ? formatWithHistory(userMessage, history)
    : userMessage;

  const result = await run(agent, input, { context });

  return {
    mode: "agent",
    reply: result.finalOutput || "",
    listings: context.listings,
    listing_detail: context.listing_detail,
    filters: context.filters,
    search_mode: context.search_mode,
    tool_trace: context.tool_trace,
    model: MODEL,
  };
}

function formatWithHistory(userMessage, history) {
  const recent = history.slice(-6); // last 3 turns
  const lines = recent
    .filter((h) => h && (h.role === "user" || h.role === "assistant") && h.content)
    .map((h) => {
      const tag = h.role === "user" ? "User" : "Assistant";
      return `${tag}: ${String(h.content).trim()}`;
    });
  if (!lines.length) return userMessage;
  return `Previous conversation:\n${lines.join("\n")}\n\nCurrent message:\n${userMessage}`;
}

function stripNulls(obj) {
  if (!obj || typeof obj !== "object") return {};
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v != null) out[k] = v;
  }
  return out;
}

function listingForModel(l, { full = false } = {}) {
  const base = {
    id: l.id,
    title: l.title,
    price_nis: l.price,
    city: l.city,
    neighborhood: l.neighborhood,
    rooms: l.rooms,
    size_sqm: l.size_sqm,
    nearest_university: l.nearest_university
      ? {
          name: l.nearest_university.name_he || l.nearest_university.name_en || l.nearest_university.name,
          distance_m: l.nearest_university.distance_m,
        }
      : null,
    smoking_allowed: l.smoking_allowed,
    pets_allowed: l.pets_allowed,
    has_balcony: l.balcony,
    parking_available: l.parking,
    air_conditioning: l.air_conditioning,
  };
  if (!full) return base;
  return {
    ...base,
    description: l.description,
    floor: l.floor,
    accessible: l.accessible,
    furnished: l.furnished_level,
    elevator: l.elevator,
    street: l.street,
    roommates: l.roommates,
    distance_to_bus_m: l.distance_to_bus_m,
    distance_to_train_m: l.distance_to_train_m,
    nearest_bus_station: l.nearest_bus_station,
    nearest_train_station: l.nearest_train_station,
    available_from: l.available_from,
    source: l.source,
    // Israeli rental facts — the AI uses these to answer FAQs like
    // "האם ארנונה כלולה?", "יש ממ״ד?", "כמה פיקדון?", etc.
    rental: l.rental || null,
    contact: l.contact || null,
  };
}

async function fetchListingById(id, ctx) {
  // 1) Hit Supabase directly if available.
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("listings")
        .select("*, listing_universities ( distance_m, universities ( id, name_en, name_he, city ) )")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) {
        const { searchListings } = require("./listingsService");
        // Reuse the same normalisation path as search by querying for the id.
        // Simpler: call searchListings with a hidden id filter — but the service
        // doesn't expose that. Instead, fall back to a focused search by city.
        const cityHits = await searchListings({ city: data.city, limit: 50 });
        const match = cityHits.data.find((r) => String(r.id) === String(id));
        if (match) return match;
      }
    }
  } catch (err) {
    console.warn(`get_listing_details supabase lookup failed: ${err.message}`);
  }

  // 2) Fallback: scan the last context.listings (covers mock mode too).
  if (ctx && Array.isArray(ctx.listings)) {
    const hit = ctx.listings.find((r) => String(r.id) === String(id));
    if (hit) return hit;
  }
  return null;
}

async function fetchUniversities() {
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("universities")
        .select("id, name_en, name_he, city")
        .order("name_en");
      if (!error && data) {
        return data.map((u) => ({
          name_en: u.name_en,
          name_he: u.name_he,
          city: u.city,
        }));
      }
    }
  } catch (err) {
    console.warn(`list_universities supabase lookup failed: ${err.message}`);
  }
  return STATIC_UNIVERSITIES;
}

const STATIC_UNIVERSITIES = [
  { name_en: "Tel Aviv University", name_he: "אוניברסיטת תל אביב", city: "Tel Aviv" },
  { name_en: "Hebrew University of Jerusalem", name_he: "האוניברסיטה העברית בירושלים", city: "Jerusalem" },
  { name_en: "Technion", name_he: "הטכניון", city: "Haifa" },
  { name_en: "Ben-Gurion University", name_he: "אוניברסיטת בן-גוריון", city: "Beer Sheva" },
  { name_en: "Bar-Ilan University", name_he: "אוניברסיטת בר-אילן", city: "Ramat Gan" },
  { name_en: "Reichman University (IDC)", name_he: "אוניברסיטת רייכמן", city: "Herzliya" },
];

module.exports = { runAgent };
