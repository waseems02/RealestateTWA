const express = require("express");
const { aiSearch } = require("../services/aiSearchService");

const router = express.Router();

/**
 * POST /api/ai/chat
 * Body: { message: string }
 *
 * Response: { mode, reply, listings?, filters?, search_mode?, warning? }
 *   mode: 'openai' | 'mock'
 *   reply: assistant text (Hebrew or English depending on user input)
 *   listings: present when the user's message triggered a search
 *   filters: the structured filters the agent extracted (for the UI to show)
 */
router.post("/chat", async (req, res) => {
  try {
    const result = await aiSearch(req.body?.message);
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
