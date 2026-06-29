# RoomieFit Architecture

RoomieFit / CampusNest Israel is a database course MVP for student housing and roommate matching.

## Frontend

The MVP frontend is plain HTML, CSS, and JavaScript in `frontend/`.

- Hebrew-first and RTL by default.
- Language toggle uses a small JavaScript translations object.
- API calls use relative URLs such as `/api/listings`.
- No Supabase, OpenAI, or Telegram secrets are exposed in browser code.

## Backend

The backend is a Node.js Express app in `backend/`.

- `backend/server.js` configures Express, JSON middleware, CORS, static frontend hosting, and API route mounting.
- `backend/routes/health.js` exposes `/api/health`.
- `backend/routes/listings.js` exposes `/api/listings`.
- `backend/routes/ai.js` exposes `/api/ai/chat`.
- `backend/routes/telegram.js` exposes `/api/telegram/webhook`.
- `backend/services/supabaseClient.js` creates a server-side Supabase client when variables exist.
- `backend/services/openaiClient.js` creates a server-side OpenAI client when `OPENAI_API_KEY` exists.
- `backend/telegram/bot.js` is a grammY bot that starts via long polling alongside the Express server. It handles `/start`, `/help`, `/search`, and free-text messages by calling the in-process AI search service.
- `backend/telegram/formatListing.js` renders normalized listings into Telegram HTML messages with deep links to `listing-details.html`.
- `backend/services/aiSearchService.js` is the single entry point for natural-language → structured filters → listings. Used by both `POST /api/ai/chat` and the Telegram bot, so they stay in sync.

## Data

Supabase schema setup is kept in `supabase/full_database_setup.sql`. Demo data in the app is mock academic data only and is not scraped from Yad2, Facebook, or private sources.

## Runtime Modes

Development:

- Local machine.
- `npm run dev`.
- Reads local `.env`.
- Missing external service keys fall back to mock mode.

Production:

- Railway.
- `npm start`.
- Reads Railway Variables.
- `NODE_ENV=production`.
