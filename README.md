# RoomieFit / CampusNest Israel

Hebrew-first student housing and roommate matching MVP for Israel. The app helps students find apartments, rooms, and roommates near universities and colleges, with Supabase-ready data, an AI assistant endpoint, and a Telegram webhook placeholder.

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

## Local Run

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
http://localhost:3000/api/health
http://localhost:3000/api/listings
```

Production mode locally:

```bash
npm start
```

The app works in mock mode if Supabase, OpenAI, or Telegram variables are missing.

## Scripts

```json
{
  "dev": "nodemon backend/server.js",
  "start": "node backend/server.js"
}
```

## Git Branch Workflow

- `main`: production-ready branch.
- `staging`: development/testing branch before production.
- `frontend`: frontend work.
- `backend`: backend/API work.
- `database`: Supabase database work.
- `ai-agent`: OpenAI AI assistant work.
- `telegram-bot`: Telegram bot work.

Railway branch mapping:

- Railway `production` environment deploys from GitHub branch `main`.
- Railway `development` environment deploys from GitHub branch `staging`.

## Railway

Use the existing Railway project only:

```text
faithful-insight
```

Do not create a new Railway project.

Railway runs:

```bash
npm start
```

Link locally:

```bash
railway link
```

Choose `faithful-insight`, then choose the environment you need.

Manual deploy:

```bash
railway up
```

If GitHub auto-deploy is enabled, pushing to `main` deploys production and pushing to `staging` deploys development.

## Railway Variables

Set these in the Railway dashboard. Do not commit real values.

Development environment:

```text
NODE_ENV=development
RAILWAY_ENVIRONMENT=development
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
TELEGRAM_BOT_TOKEN=
PUBLIC_APP_URL=
```

Production environment:

```text
NODE_ENV=production
RAILWAY_ENVIRONMENT=production
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
TELEGRAM_BOT_TOKEN=
PUBLIC_APP_URL=
```

## API Routes

- `GET /api/health`
- `GET /api/listings`
- `POST /api/ai/chat`
- `POST /api/telegram/webhook`

## Safety Notes

- Do not commit `.env` files.
- Do not expose service role, OpenAI, or Telegram keys in frontend code.
- Use demo data unless a legal API is available.
- Do not scrape Yad2 or Facebook.
