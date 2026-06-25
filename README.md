# RoomieFit

Student apartment + roommate matching platform for Israel. Hebrew RTL UI with English toggle, OpenAI-powered search agent, Telegram bot mirror, and structured data pipeline.

> Local folder is still named `RealestateTWA` from the initial scaffold; the GitHub repo is `RoomieFit`.

## Monorepo layout

```
frontend/    Next.js 16 + TS + Tailwind v4 (App Router, RTL default)
backend/     FastAPI + Supabase client (Railway-deployed)
bot/         Telegram bot — Step 6 (placeholder)
scripts/     Data import — Step 7 (placeholder)
supabase/    config.toml + SQL migrations (linked to project nvpfxtsxgfvjerzfaaiw)
```

## Branches

| Branch     | Purpose                                |
|------------|----------------------------------------|
| `main`     | Production. GH Pages + Railway deploy from here. |
| `staging`  | Pre-prod integration.                  |
| `frontend` | Active frontend dev.                   |
| `backend`  | Active backend dev.                    |

Flow: `frontend` / `backend` → PR into `staging` → PR into `main`.

## Quick start

### Frontend
```powershell
cd frontend
npm install
npm run dev          # http://localhost:3000
```

### Backend
```powershell
cd backend
py -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env       # then fill in real values
uvicorn app.main:app --reload --port 8000   # http://localhost:8000/health
```

### Supabase
```powershell
supabase db push     # apply local migrations to the linked project
```

## Environment variables

| Var                            | Where                | When         |
|--------------------------------|----------------------|--------------|
| `SUPABASE_URL`                 | backend/.env         | now          |
| `SUPABASE_ANON_KEY`            | backend/.env         | now          |
| `SUPABASE_SERVICE_ROLE_KEY`    | backend/.env         | now          |
| `NEXT_PUBLIC_SUPABASE_URL`     | frontend/.env.local  | Step 3       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| frontend/.env.local  | Step 3       |
| `OPENAI_API_KEY` (or Groq)     | backend/.env         | Step 5       |
| `TELEGRAM_BOT_TOKEN`           | backend/.env or bot/.env | Step 6   |

Pull keys from Supabase dashboard → Settings → API. Never commit real values.

## Build status

- ✅ Step 1 — Monorepo + branches + rename
- ✅ Step 2 — Supabase schema (`0001_init_listings.sql`)
- ⬜ Step 3 — Listings page with filters
- ⬜ Step 4 — Map view (Leaflet)
- ⬜ Step 5 — AI search agent
- ⬜ Step 6 — Telegram bot
- ⬜ Step 7 — Data import pipeline
- ⬜ Step 8 — English toggle
