const express = require("express");
const { aiSearch } = require("../services/aiSearchService");

const router = express.Router();

/**
 * POST /api/ai/chat
 * Body: { message: string, history?: Array<{role, content}> }
 *
 * Response: { mode, reply, listings?, listing_detail?, filters?, search_mode?, tool_trace?, warning? }
 *   mode: 'agent' | 'mock'
 *   reply: assistant text (Hebrew or English, matching the user's input)
 *   listings: most-recent search results (if a search was performed this turn)
 *   listing_detail: full detail object if the agent asked about a specific listing
 *   filters: structured filters the agent extracted (for debugging / UI tags)
 *   tool_trace: ordered list of which tools the agent called (debugging)
 */
router.post("/chat", async (req, res) => {
  try {
    const history = Array.isArray(req.body?.history) ? req.body.history : [];
    const result = await aiSearch(req.body?.message, { history });
    return res.json(result);
  } catch (err) {
    if (err.code === "EMPTY_MESSAGE") {
      return res.status(400).json({ error: "message is required" });
    }
    console.warn(`/api/ai/chat failed: ${err.message}`);
    return res.status(500).json({ error: "AI chat failed", detail: err.message });
  }
});

module.exports = router;
