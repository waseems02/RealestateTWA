# RoomieFit / CampusNest Israel

Student apartment and roommate matching platform for Israel. The project has a Hebrew RTL frontend, Supabase database setup, AI and Telegram placeholders, and a Railway-ready Node/Express deployment server.

## Monorepo Layout

```text
frontend/    Next.js 16 + TypeScript + Tailwind v4
backend/     Node/Express deployment server plus legacy FastAPI app
bot/         Telegram bot placeholder
scripts/     Data import placeholder
supabase/    Supabase config, migrations, and full SQL setup file
```

## Branches

| Branch | Purpose |
| --- | --- |
| `main` | Production |
| `staging` | Pre-production integration |
| `frontend` | Frontend development |
| `backend` | Backend development |
| `Data-Base` | Database development |

Flow: feature branches -> pull request into `staging` -> pull request into `main`.

## Quick Start

Run the full local app from the repository root:

```powershell
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/api/health
```

## Production Mode

From the repository root:

```powershell
npm run build
npm start
```

`npm run build` exports the Next.js frontend into `frontend/out`. `npm start` runs `backend/server.js`, which serves the frontend and API routes from one Node/Express app.

## Frontend Only

```powershell
cd frontend
npm install
npm run dev
```

## Legacy Python Backend

The older FastAPI backend is still present and was not deleted:

```powershell
cd backend
py -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

## Supabase

For a one-file setup, run:

```text
supabase/full_database_setup.sql
```

Copy the full SQL file into the Supabase SQL Editor and run it once. It replaces separate schema, seed, and RLS setup files for initial setup.

## Environment Variables

Use `.env.example` as the template. Do not commit a real `.env` file.

| Variable | Where |
| --- | --- |
| `SUPABASE_URL` | Root `.env` locally, Railway variables in production |
| `SUPABASE_ANON_KEY` | Root `.env` locally, Railway variables in production |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend only; root `.env` locally, Railway variables in production |
| `OPENAI_API_KEY` | Backend only |
| `TELEGRAM_BOT_TOKEN` | Backend only |
| `PORT` | Local only; Railway provides this automatically |
| `NODE_ENV` | `development` locally, `production` on Railway |

Never expose service role keys, OpenAI keys, or Telegram tokens in frontend code.

## Deployment to Railway

Step 1: Push the project to GitHub.

Step 2: Open Railway.

Step 3: Create New Project.

Step 4: Choose Deploy from GitHub repo.

Step 5: Select this repository.

Step 6: Add environment variables:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `NODE_ENV=production`

Step 7: Deploy.

Step 8: Open the Railway public domain.

The homepage should load from `/`. The health check should respond at:

```text
/api/health
```

Railway install command:

```bash
npm install
```

Railway build command:

```bash
npm run build
```

Railway start command:

```bash
npm start
```

The root `railway.json` sets `npm start` as the start command and `/api/health` as the health check path.
