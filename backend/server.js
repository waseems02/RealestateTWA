require("dotenv").config();

const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/health");
const listingsRoutes = require("./routes/listings");
const aiRoutes = require("./routes/ai");
const telegramRoutes = require("./routes/telegram");
const configRoutes = require("./routes/config");
const { createTelegramBot } = require("./telegram/bot");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS — accept a comma-separated list of allowed origins from
// FRONTEND_ORIGINS (e.g. "https://roomiefit-frontend.up.railway.app,
// https://roomiefit-frontend-staging.up.railway.app"). Falls back to
// PUBLIC_APP_URL, then to allow-all so local dev keeps working.
const allowedOrigins = (process.env.FRONTEND_ORIGINS || process.env.PUBLIC_APP_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length
      ? (origin, cb) => {
          // Same-origin requests (from a curl or the frontend proxy) send no
          // Origin header — always allow those.
          if (!origin) return cb(null, true);
          if (allowedOrigins.includes(origin)) return cb(null, true);
          return cb(new Error(`CORS: origin ${origin} not allowed`));
        }
      : true,
    credentials: false,
  })
);
app.use(express.json({ limit: "1mb" }));

// API routes only — the frontend service serves the static files.
app.use("/api/health", healthRoutes);
app.use("/api/listings", listingsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/telegram", telegramRoutes);
app.use("/api", configRoutes);

// Simple landing so hitting the backend URL directly returns something useful
app.get("/", (_req, res) => {
  res.type("text/plain").send(
    "RoomieFit backend service. API routes live under /api/*. " +
      "The user-facing site is served by the frontend service."
  );
});

app.use((req, res) => {
  res.status(404).json({ error: "not found", path: req.path });
});

const server = app.listen(PORT, () => {
  console.log(`RoomieFit backend running on port ${PORT}`);
  if (allowedOrigins.length) {
    console.log(`CORS allowed origins: ${allowedOrigins.join(", ")}`);
  } else {
    console.log("CORS: allow-all (no FRONTEND_ORIGINS set — set it in production)");
  }
});

const telegramBot = createTelegramBot();
if (telegramBot) {
  const tokenPrefix = (process.env.TELEGRAM_BOT_TOKEN || "").slice(0, 12);
  console.log(`Starting Telegram bot (token prefix ${tokenPrefix}…) — long polling`);

  const initTimer = setTimeout(() => {
    console.warn(
      "Telegram bot init taking >20s — most likely api.telegram.org is unreachable from this network. " +
        "Verify with: node -e \"require('https').get('https://api.telegram.org', r => console.log(r.statusCode)).on('error', e => console.log('ERR', e.code))\""
    );
  }, 20000);

  telegramBot
    .start({
      onStart: (botInfo) => {
        clearTimeout(initTimer);
        console.log(`Telegram bot started: @${botInfo.username} (long polling)`);
      },
    })
    .catch((err) => {
      clearTimeout(initTimer);
      console.warn(`Telegram bot failed to start: ${err.message}`);
    });
}

async function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down.`);
  try {
    if (telegramBot) await telegramBot.stop();
  } catch (err) {
    console.warn(`Bot stop failed: ${err.message}`);
  }
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
