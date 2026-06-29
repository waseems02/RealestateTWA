# RoomieFit Telegram Bot

Built in **Step 6**. Lives in the Node.js backend, not here.

The bot is a thin [grammY](https://grammy.dev) wrapper at
`backend/telegram/bot.js`. It starts via long polling alongside the
Express server in `backend/server.js`, calls the in-process AI search
service (same logic as `POST /api/ai/chat`), and renders results as
Telegram HTML messages with deep links back to `listing-details.html`.

This folder is kept as a placeholder so the original repo layout from
the brief stays recognizable. No code lives here.

## Run it locally

1. Get a bot token from [@BotFather](https://t.me/BotFather).
2. Add `TELEGRAM_BOT_TOKEN=...` to `.env`.
3. `npm run dev` — the bot starts polling automatically. Without a
   token the server still boots; the bot just stays off (mock mode).
4. (optional) Set `PUBLIC_APP_URL=https://your-railway-url` so the
   bot's "פרטים מלאים" link points at your deployed listing pages.

## Commands

- `/start` — Hebrew welcome with examples
- `/help` — usage hints
- `/search <text>` — explicit structured search
- Any free-text message — also treated as a search query
