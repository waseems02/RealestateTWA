const express = require("express");

const router = express.Router();

router.post("/webhook", (req, res) => {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return res.json({
      mode: "mock",
      ok: true,
      message: "Telegram webhook received in mock mode",
      updateType: req.body?.message ? "message" : "unknown"
    });
  }

  return res.json({
    mode: "telegram",
    ok: true,
    message: "Telegram webhook endpoint is ready"
  });
});

module.exports = router;
