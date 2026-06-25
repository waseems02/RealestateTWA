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

If the Railway CLI cannot create or link the project automatically:

1. Go to the Railway dashboard.
2. Click New Project.
3. Choose Deploy from GitHub repo.
4. Select `waseems02/RoomieFit`.
5. Name the project `RealestateTMA`.
6. Add variables from `.env.example`.
7. Deploy.

## CLI Setup

Check the CLI:

```bash
railway --version
```

If missing:

```bash
npm install -g @railway/cli
```

Then authenticate and create or link the project:

```bash
railway login
railway init
```

Use `RealestateTMA` when prompted for the project name.
