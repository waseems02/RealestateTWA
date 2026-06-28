const express = require("express");
const { getOpenAIClient } = require("../services/openaiClient");
const {
  searchListings,
  getFilterParameterSchema,
} = require("../services/listingsService");

const router = express.Router();

const SYSTEM_PROMPT = `You are RoomieFit's apartment-search assistant for students in Israel.
When the user describes what they're looking for (apartment, room, roommate, budget,
city, campus, amenities, lifestyle), call the search_listings tool with structured
filters extracted from their message. Use Hebrew city names if the user wrote Hebrew.
Only call the tool when the user is searching — for general advice or questions
(e.g. "what should I check before signing a lease?"), reply directly in the user's
language without calling the tool. Replies must be in the user's language (Hebrew or English).`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "search_listings",
      description:
        "Search RoomieFit apartments and rooms using structured filters. Returns up to `limit` matching listings.",
      parameters: getFilterParameterSchema(),
    },
  },
];

/**
 * POST /api/ai/chat
 * Body: { message: string }
 *
 * Response: { mode, reply, listings?: NormalizedListing[], filters?: object, warning? }
 *   mode: 'openai' | 'mock'
 *   reply: assistant text (Hebrew or English depending on user input)
 *   listings: present when the user's message triggered a search
 *   filters: the structured filters the agent extracted (for the UI to show)
 */
router.post("/chat", async (req, res) => {
  const message = String(req.body?.message || "").trim();
  if (!message) return res.status(400).json({ error: "message is required" });

  const client = getOpenAIClient();
  if (!client) return res.json(await mockSearchReply(message));

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      tools: TOOLS,
      tool_choice: "auto",
      temperature: 0.3,
    });

    const choice = completion.choices?.[0];
    const toolCall = choice?.message?.tool_calls?.[0];

    if (toolCall?.function?.name === "search_listings") {
      let filters;
      try {
        filters = JSON.parse(toolCall.function.arguments || "{}");
      } catch {
        filters = {};
      }
      const { data, mode: searchMode } = await searchListings(filters);
      const reply = formatSearchReply(data, filters);
      return res.json({
        mode: "openai",
        reply,
        filters,
        listings: data,
        search_mode: searchMode,
      });
    }

    // No tool call — model answered conversationally.
    const text = choice?.message?.content || "לא התקבלה תשובה מה-AI.";
    return res.json({ mode: "openai", reply: text });
  } catch (error) {
    console.warn(`OpenAI request failed: ${error.message}`);
    const fallback = await mockSearchReply(message);
    return res.json({ ...fallback, warning: `OpenAI request failed: ${error.message}` });
  }
});

/**
 * Heuristic mock-mode reply. When OpenAI isn't configured we still want
 * something useful: pull a tiny set of keywords from the message, search
 * the demo data, and reply in Hebrew.
 */
async function mockSearchReply(message) {
  const filters = heuristicFilters(message);
  const { data, mode: searchMode } = await searchListings(filters);
  const reply = formatSearchReply(data, filters, { mock: true });
  return { mode: "mock", reply, filters, listings: data, search_mode: searchMode };
}

function heuristicFilters(msg) {
  const filters = {};
  const lower = msg.toLowerCase();
  const cities = [
    ["תל אביב", "tel aviv"],
    ["ירושלים", "jerusalem"],
    ["חיפה", "haifa"],
    ["באר שבע", "beer sheva"],
  ];
  for (const [he, en] of cities) {
    if (msg.includes(he) || lower.includes(en)) {
      filters.city = en === "tel aviv" ? "Tel Aviv" : en === "beer sheva" ? "Beer Sheva" : en[0].toUpperCase() + en.slice(1);
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
    const parts = [
      `${i + 1}. ${l.title}`,
      `${l.price} ₪/חודש`,
    ];
    if (l.rooms) parts.push(`${l.rooms} חדרים`);
    if (l.size_sqm) parts.push(`${l.size_sqm} מ"ר`);
    if (l.city) parts.push(l.city);
    if (l.nearest_university)
      parts.push(`${Math.round(l.nearest_university.distance_m / 100) / 10} ק"מ מ-${l.nearest_university.name}`);
    return parts.join(" · ");
  });
  return `${prefix}\n\n${lines.join("\n")}`;
}

module.exports = router;
