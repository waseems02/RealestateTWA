const express = require("express");
const { getTelegramStatus, handleTelegramUpdate } = require("../telegram/bot");

const router = express.Router();

router.get("/status", (_req, res) => {
  return res.json(getTelegramStatus());
});

router.post("/webhook", async (req, res) => {
  try {
    const result = await handleTelegramUpdate(req.body);
    return res.json(result);
  } catch (error) {
    console.error(`Telegram webhook failed: ${error.message}`);
    return res.status(500).json({
      enabled: Boolean(process.env.TELEGRAM_BOT_TOKEN),
      mode: process.env.TELEGRAM_BOT_TOKEN ? "webhook" : "mock",
      ok: false,
      message: "Telegram webhook failed"
    });
  }
});

module.exports = router;
