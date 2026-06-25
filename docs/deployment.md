# RoomieFit Deployment

Use the existing Railway project only:

```text
faithful-insight
```

Do not create a new Railway project.

## Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local `.env` from `.env.example`.

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Test:

   ```text
   http://localhost:3000
   http://localhost:3000/api/health
   http://localhost:3000/api/listings
   ```

5. Test production mode locally:

   ```bash
   npm start
   ```

The app can run in mock mode when Supabase, OpenAI, or Telegram variables are missing.

## Link Railway

Check the CLI:

```bash
railway --version
railway status
```

If the repo is not linked:

```bash
railway login
railway link
```

Choose the existing project `faithful-insight`. Do not run `railway init`.

## Railway Environments

Required environments:

- `development`
- `production`

List environments:

```bash
railway environment list
```

Create `development` if missing:

```bash
railway environment new development --duplicate production
```

Production already exists in the project. If the CLI cannot create environments, create them manually:

1. Open Railway dashboard.
2. Open project `faithful-insight`.
3. Go to Environments.
4. Create `development`.
5. Keep or verify `production`.
6. Duplicate production settings into development if Railway offers that option.

## GitHub Branch Mapping

Required GitHub branches:

- `main`
- `staging`
- `frontend`
- `backend`
- `database`
- `ai-agent`
- `telegram-bot`

Railway deployment mapping:

- `development` deploys from GitHub branch `staging`.
- `production` deploys from GitHub branch `main`.

The CLI can connect the GitHub repo source:

```bash
railway service source connect --repo waseems02/RoomieFit --branch main --service faithful-insight --environment production
```

The Railway CLI currently applies the GitHub source at service level. Verify and set per-environment branch triggers in the dashboard:

1. Open Railway project `faithful-insight`.
2. Go to Environments.
3. Select `development`.
4. Open the `faithful-insight` service.
5. Go to Settings.
6. Under Source / GitHub / Deploy triggers, set branch to `staging`.
7. Select `production`.
8. Open the `faithful-insight` service.
9. Under Source / GitHub / Deploy triggers, set branch to `main`.
10. Save changes.

## Railway Variables

Set variables in Railway, not in GitHub and not in committed files.

Development:

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

Production:

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

Safe non-secret values can be set with:

```bash
railway variable set NODE_ENV=development RAILWAY_ENVIRONMENT=development --service faithful-insight --environment development
railway variable set NODE_ENV=production RAILWAY_ENVIRONMENT=production --service faithful-insight --environment production
```

Do not set empty secret variables unless Railway requires them.

## Deploy

If GitHub auto-deploy is configured:

- Push to `main` to deploy production.
- Push to `staging` to deploy development.

Manual deploy:

```bash
railway up
```

## Public URLs

Production:

```text
https://faithful-insight-production-6465.up.railway.app
```

Development:

```text
https://faithful-insight-development.up.railway.app
```

Test health:

```text
/api/health
```
