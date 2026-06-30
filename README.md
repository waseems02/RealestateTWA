# RoomieFit / CampusNest Israel

Hebrew-first student housing and roommate matching MVP for Israel. The app helps students find apartments, rooms, and roommates near universities and colleges, with Supabase-backed listings, an AI assistant endpoint, Telegram bot integration, and Leaflet/OpenStreetMap listing maps.

## Project Structure

```text
frontend/                 Plain HTML, CSS, and JavaScript MVP
backend/                  Node.js Express API and static file server
backend/routes/           Health, listings, AI, and Telegram routes
backend/services/         Supabase and OpenAI server-side clients
backend/telegram/         Grammy bot setup
supabase/                 Database setup SQL
docs/                     Deployment and architecture notes
railway.json              Railway deployment config
.env.example              Safe environment template
```

Legacy Next.js and Python files may still exist in the repository for reference, but the root `npm` scripts run the Express/static MVP.

## Quick Start

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
http://localhost:3000/api/health
http://localhost:3000/api/listings
http://localhost:3000/api/telegram/status
```

The app works in mock mode if Supabase, OpenAI, or Telegram variables are missing.

## Scripts

```json
{
  "dev": "nodemon backend/server.js",
  "start": "node backend/server.js"
}
```

## Environment Variables

Copy `.env.example` to `.env` locally. Do not commit `.env`.

```text
NODE_ENV=development
PORT=3000
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
TELEGRAM_BOT_TOKEN=
RAILWAY_ENVIRONMENT=
PUBLIC_APP_URL=
```

In production, set secrets as Railway Variables only.

## API Routes

- `GET /api/health`
- `GET /api/listings`
- `GET /api/listings/:id`
- `POST /api/ai/chat`
- `GET /api/telegram/status`
- `POST /api/telegram/webhook`

`GET /api/listings` supports `city`, `maxPrice`, `listingType`, `campusId`, `hasBalcony`, `furnished`, `nearTransport`, `limit`, and `page`. When Supabase variables are missing or a query fails, it returns demo listings with `source: "mock"`.

## Telegram Bot

The Telegram bot uses `TELEGRAM_BOT_TOKEN` and the same listings service as the web API. It supports `/start`, `/help`, and simple Hebrew search messages such as `חפש חדר בתל אביב עד 3500`.

See [docs/telegram-bot.md](docs/telegram-bot.md) for BotFather setup, Railway Variables, and webhook configuration.

## Maps

The static listings and listing details pages use Leaflet with OpenStreetMap tiles. No Google Maps key or billing account is required. Listings without coordinates are skipped on the map and handled without crashing.

## Git Branch Strategy

- `main`: production-ready version
- `staging`: testing before production
- `frontend`: frontend work
- `backend`: backend work
- `database`: Supabase database work
- `ai-agent`: OpenAI agent work
- `telegram-bot`: Telegram bot work

## Railway

The Railway project name is `faithful-insight`.

Railway uses:

```bash
npm start
```

See [docs/deployment.md](docs/deployment.md) for deployment steps, environment strategy, and manual setup instructions.

## Safety Notes

- Do not commit `.env` files.
- Do not expose service role, OpenAI, or Telegram keys in frontend code.
- Use demo data unless a legal API is available.
- Do not scrape Yad2 or Facebook.
