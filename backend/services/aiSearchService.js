/**
 * RoomieFit AI search service.
 *
 * Thin compatibility shim around the new agentService (OpenAI Agents SDK).
 * Used by:
 *   - POST /api/ai/chat            (HTTP route)
 *   - Telegram bot (in-process)
 *
 * Response shape (kept stable so the frontend and bot don't need to change):
 *   { mode: 'agent' | 'mock',
 *     reply: string,
 *     filters: object,
 *     listings: NormalizedListing[],
 *     search_mode: 'supabase' | 'mock' | null,
 *     listing_detail?: NormalizedListing | null,
 *     tool_trace?: Array<{ tool, input }>,
 *     warning?: string }
 */

const { runAgent } = require("./agentService");
const { searchListings } = require("./listingsService");

async function aiSearch(rawMessage, opts = {}) {
  const message = String(rawMessage || "").trim();
  if (!message) {
    const err = new Error("message is required");
    err.code = "EMPTY_MESSAGE";
    throw err;
  }

  if (!process.env.OPENAI_API_KEY) {
    return mockSearchReply(message);
  }

  try {
    const result = await runAgent(message, { history: opts.history });
    return {
      mode: result.mode,
      reply: result.reply,
      filters: result.filters || {},
      listings: result.listings || [],
      listing_detail: result.listing_detail || null,
      search_mode: result.search_mode,
      tool_trace: result.tool_trace,
    };
  } catch (error) {
    console.warn(`Agent run failed: ${error.message}`);
    const fallback = await mockSearchReply(message);
    return { ...fallback, warning: `Agent run failed: ${error.message}` };
  }
}

async function mockSearchReply(message) {
  const filters = heuristicFilters(message);
  const { data, mode: searchMode } = await searchListings(filters);
  const reply = formatSearchReply(data, filters, { mock: true });
  return {
    mode: "mock",
    reply,
    filters,
    listings: data,
    listing_detail: null,
    search_mode: searchMode,
    tool_trace: [],
  };
}

function heuristicFilters(msg) {
  const filters = {};
  const lower = msg.toLowerCase();
  const cities = [
    ["תל אביב", "tel aviv", "Tel Aviv"],
    ["ירושלים", "jerusalem", "Jerusalem"],
    ["חיפה", "haifa", "Haifa"],
    ["באר שבע", "beer sheva", "Beer Sheva"],
    ["רמת גן", "ramat gan", "Ramat Gan"],
    ["הרצליה", "herzliya", "Herzliya"],
  ];
  for (const [he, en, canonical] of cities) {
    if (msg.includes(he) || lower.includes(en)) {
      filters.city = canonical;
      break;
    }
  }
  const priceMatch = msg.match(/(\d{3,5})\s*(₪|nis|שקל)/i) || msg.match(/עד\s+(\d{3,5})/);
  if (priceMatch) filters.max_price = Number(priceMatch[1]);
  if (/מרפסת|balcony/i.test(msg)) filters.has_balcony = true;
  if (/חניה|parking/i.test(msg)) filters.parking_available = true;
  return filters;
}

function formatSearchReply(listings, filters, opts = {}) {
  const count = listings.length;
  if (count === 0) {
    return "לא מצאתי דירות תואמות לחיפוש שלך. אפשר להרחיב את התקציב, להחליף עיר, או לוותר על דרישה מסוימת?";
  }
  const prefix = opts.mock
    ? "במצב הדגמה — הנה דוגמאות מהמאגר:"
    : `מצאתי ${count} דירות מתאימות:`;
  const lines = listings.slice(0, 5).map((l, i) => {
    const parts = [`${i + 1}. ${l.title}`, `${l.price} ₪/חודש`];
    if (l.rooms) parts.push(`${l.rooms} חדרים`);
    if (l.size_sqm) parts.push(`${l.size_sqm} מ"ר`);
    if (l.city) parts.push(l.city);
    if (l.nearest_university)
      parts.push(
        `${Math.round(l.nearest_university.distance_m / 100) / 10} ק"מ מ-${l.nearest_university.name}`
      );
    return parts.join(" · ");
  });
  return `${prefix}\n\n${lines.join("\n")}`;
}

module.exports = { aiSearch };
