# Telegram Bot Setup

RoomieFit uses the Telegram Bot API through `grammy`. The bot token must only be stored in local `.env` for development or Railway Variables for deployed environments.

## Create The Bot

1. Open Telegram and search for `@BotFather`.
2. Send `/newbot`.
3. Choose a display name and username for the bot.
4. Copy the bot token that BotFather returns.

Do not commit the token and do not paste it into frontend files.

## Local Development

Add the token to `.env`:

```text
TELEGRAM_BOT_TOKEN=
PUBLIC_APP_URL=http://localhost:3000
```

The app still runs in mock mode when `TELEGRAM_BOT_TOKEN` is empty.

## Railway Variables

In Railway project `faithful-insight`, add:

```text
TELEGRAM_BOT_TOKEN=
PUBLIC_APP_URL=https://faithful-insight-production-6465.up.railway.app
```

Also set the Supabase variables documented in `docs/deployment.md` so Telegram user/message logging can use the backend service-role client.

## Webhook

After deployment, set the Telegram webhook with the production app URL:

```text
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=<PUBLIC_APP_URL>/api/telegram/webhook
```

For production:

```text
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://faithful-insight-production-6465.up.railway.app/api/telegram/webhook
```

Use your real token only in the browser or terminal command you run locally. Do not place it in docs or committed code.

## Status Check

The backend exposes:

```text
GET /api/telegram/status
```

Expected shape:

```json
{
  "enabled": true,
  "mode": "webhook",
  "hasToken": true
}
```
