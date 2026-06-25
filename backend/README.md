# RoomieFit Backend

FastAPI service for RoomieFit. Talks to Supabase (`nvpfxtsxgfvjerzfaaiw`) and will host the OpenAI search agent (Step 5).

## Local development

```powershell
cd backend
py -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env       # then fill in real values
uvicorn app.main:app --reload --port 8000
```

Health check: http://localhost:8000/health

## Deploy

Railway picks up `railway.json` automatically when this folder is the root of a Railway service.
