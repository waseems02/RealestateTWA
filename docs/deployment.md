# RoomieFit Deployment

## Local Development

1. Install dependencies from the repository root:

   ```bash
   npm install
   ```

2. Create a local `.env` file from `.env.example`.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open:

   ```text
   http://localhost:3000
   http://localhost:3000/api/health
   http://localhost:3000/api/listings
   ```

The app can run in mock mode when Supabase, OpenAI, or Telegram variables are missing.

## Production on Railway

Use the existing Railway project:

```text
faithful-insight
```

Production runs with:

```bash
npm start
```

Railway provides the public URL and runtime port. Set `NODE_ENV=production` in Railway Variables.

## Railway Variables

Add these variables in Railway instead of committing secrets:

```text
NODE_ENV=production
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
TELEGRAM_BOT_TOKEN=
RAILWAY_ENVIRONMENT=production
PUBLIC_APP_URL=https://your-railway-domain
```

`SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, and `TELEGRAM_BOT_TOKEN` must stay server-side only.

## Railway Environments

Create separate Railway environments:

- `development`: test variables and mock-safe experiments.
- `production`: production Supabase/OpenAI/Telegram values and public domain.

Each Railway environment has its own variables and deployments. Keep `NODE_ENV=production` for the production environment.

## Connect GitHub Branches

Recommended branch mapping:

- `main`: production Railway deployment.
- `staging`: pre-production Railway environment.
- `frontend`, `backend`, `database`, `ai-agent`, `telegram-bot`: focused development branches.

In Railway:

1. Open the project.
2. Select the service.
3. Connect the GitHub repository `waseems02/RoomieFit`.
4. Set the production deployment branch to `main`.
5. Add a staging environment and connect it to `staging`.

## Manual Railway Project Setup

Do not create a new Railway project for this app. Use the existing project `faithful-insight`.

If the CLI cannot link automatically:

1. Go to the Railway dashboard.
2. Open the existing project `faithful-insight`.
3. Connect or verify the GitHub repo `waseems02/RoomieFit`.
4. Add variables from `.env.example`.
5. Deploy the existing service.

## CLI Setup

Check the CLI:

```bash
railway --version
```

If missing:

```bash
npm install -g @railway/cli
```

Then authenticate and link the existing project:

```bash
railway login
railway link
```

Choose `faithful-insight` when prompted for the project. Choose `production` if Railway asks for an environment. If a `development` environment also exists, switch to it with:

```bash
railway environment
```

or select it from the Railway dashboard before deploying test changes.

## Manual Deploy

If GitHub deployment is not configured, deploy the linked project manually:

```bash
railway up
```
