const express = require("express");
const { getOpenAIClient } = require("../services/openaiClient");

const router = express.Router();

router.post("/chat", async (req, res) => {
  const message = String(req.body?.message || "").trim();

  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  const client = getOpenAIClient();

  if (!client) {
    return res.json({
      mode: "mock",
      reply:
        "במצב הדגמה: כדאי להשוות מחיר, מרחק לקמפוס, תחבורה ציבורית, מצב הדירה, חוזה, חשבונות והעדפות שותפים לפני שמחליטים."
    });
  }

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are RoomieFit's assistant. Help students in Israel compare apartments, rooms, roommates, budgets, campus distance, transit, and practical lease questions. Reply in the user's language."
        },
        { role: "user", content: message }
      ],
      temperature: 0.4
    });

    return res.json({
      mode: "openai",
      reply: completion.choices?.[0]?.message?.content || "לא התקבלה תשובה מה-AI."
    });
  } catch (error) {
    console.warn(`OpenAI request failed: ${error.message}`);
    return res.json({
      mode: "mock",
      warning: "OpenAI request failed",
      reply: "לא הצלחתי להתחבר לשירות ה-AI כרגע. בדקו תקציב, מיקום, תחבורה ותנאי חוזה והשוו בין הדירות."
    });
  }
});

module.exports = router;
