# Railway setup — 2 services × 2 environments

This walk-through creates the Railway project with:

- **backend** service running the Express API (root directory `/`, i.e. repo root — uses root `package.json` + root `railway.json`).
- **frontend** service running the tiny static server + `/api/*` proxy (root directory `/frontend`, uses `frontend/package.json` + `frontend/railway.json`).
- **staging** environment auto-deploying from the `dev` branch.
- **production** environment auto-deploying from `main`.

Because `railway login` opens a browser, you'll run the commands yourself. Nothing here needs any secrets in Claude's session.

## 0. One-time prep

```powershell
# Install the CLI (any of these — pick one)
npm i -g @railway/cli          # portable, works on Windows/macOS/Linux
# scoop install railway         # scoop
# winget install Railway.Railway# winget

# Log in (opens your browser)
railway login

# Optional but recommended: set the workspace if you have >1
railway workspace list
railway workspace select <name>
```

## 1. Create the project

You can either do this via the CLI or the dashboard. The dashboard is easier for the initial "create project + connect to GitHub" step.

**Dashboard path (recommended):**

1. https://railway.com/new
2. **Deploy from GitHub repo** → pick `waseems02/RoomieFit`
3. Railway will offer to deploy one service. Cancel or let it deploy with defaults — we'll rename it in a second.
4. Rename the auto-created service to **backend**.

Then from your terminal:

```powershell
# From the repo root
cd C:\Users\wasee\Desktop\RealestateTWA

# Link this checkout to the project you just created
railway link
# Pick the project and 'production' environment when prompted.
```

## 2. Add the frontend service

```powershell
# Still in the repo root
railway add
# Prompts: choose 'Empty Service', name it 'frontend'.
```

Then in the dashboard for the **frontend** service → **Settings**:

- **Source Repo**: `waseems02/RoomieFit`
- **Root Directory**: `/frontend`   ← important
- **Build Command**: leave empty (Nixpacks reads `frontend/package.json`)
- **Start Command**: leave empty (uses `npm start` from `frontend/railway.json`)

## 3. Create the staging environment

```powershell
railway environment new staging
railway environment staging     # switch to it
```

In the dashboard, on the **staging** environment:

- **backend service** → Settings → **Deployment Trigger** → auto-deploy from `dev` branch.
- **frontend service** → Settings → **Deployment Trigger** → auto-deploy from `dev` branch.

Do the same on **production** to lock it to `main`:

```powershell
railway environment production
```

- backend → auto-deploy from `main`
- frontend → auto-deploy from `main`

## 4. Environment variables

You need to set these **per environment × per service** — 4 combinations. The values differ only for `BACKEND_URL` / `FRONTEND_ORIGINS` (which reference each other's public URLs and therefore change per environment).

### On the **backend** service (both staging + production):

```
NODE_ENV=production
SUPABASE_URL=https://nvpfxtsxgfvjerzfaaiw.supabase.co
SUPABASE_ANON_KEY=<from Supabase → Settings → API>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase → Settings → API>
OPENAI_API_KEY=<your key>
OPENAI_AGENT_MODEL=gpt-4o
TELEGRAM_BOT_TOKEN=<optional — from @BotFather>
FRONTEND_ORIGINS=<the frontend service's public URL for this env>
```

CLI shortcut for one variable:

```powershell
railway variables set NODE_ENV=production
railway variables set OPENAI_API_KEY=sk-proj-...
# …etc
```

Or paste the whole block in the dashboard → Variables → **Raw Editor**.

### On the **frontend** service (both staging + production):

```
NODE_ENV=production
BACKEND_URL=<the backend service's internal or public URL for this env>
```

**Tip about `BACKEND_URL`**: prefer Railway's private-network URL if both services are in the same project (something like `roomiefit-backend.railway.internal:PORT`). Fall back to the public URL if the CLI or dashboard doesn't offer it.

## 5. Verify the deploy

Watch the logs in the dashboard for each service. Expected startup:

**backend:**
```
RoomieFit backend running on port XXXX
CORS allowed origins: https://frontend-XXX.up.railway.app
Starting Telegram bot (token prefix …) — long polling
Telegram bot started: @YourBotName (long polling)
```

**frontend:**
```
RoomieFit frontend: proxying /api/* → https://backend-XXX.up.railway.app
RoomieFit frontend running on port XXXX
```

Hit the frontend's public URL — the site should render, and clicking around (search, add-listing, chat widget) should all work because the proxy forwards `/api/*` transparently.

## 6. Day-to-day workflow

- Push to `dev` → Railway auto-deploys **staging** (both services).
- PR from `dev` → `main`, merge → Railway auto-deploys **production**.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Frontend loads but `/api/*` returns 502 | `BACKEND_URL` is wrong on the frontend service — set to the backend's public or private URL. |
| Browser shows CORS errors | `FRONTEND_ORIGINS` on the backend must include the exact frontend origin (protocol + host, no trailing slash). Comma-separated for multiple. |
| Deploy fails with `ERESOLVE` | Someone re-added a conflicting dep. Delete `node_modules` + `package-lock.json` locally, `npm install`, commit the new lockfile. |
| Frontend service builds Next.js | You still have Next.js leftovers in `frontend/`. Remove `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `src/`, `next-env.d.ts`, `tsconfig.json` — they're not used by our proxy server. |
| Telegram bot log says "init taking >20s" | Railway's network is fine for Telegram — this only fires when a local dev environment blocks it. In Railway logs you should see `Telegram bot started: @…` within a few seconds. |
