# Yield

Yield turns the ingredients you already have into real, step-by-step recipes — with cooking timers, food-safety warnings, smart substitutions, pantry tracking, and saved history.

## What's in this repo

- `frontend/` — Next.js 14 (App Router) + TypeScript + Tailwind web app. This is the running site and UI (including a backend-free demo at `/demo`).
- `backend/` — FastAPI service for recipe generation, auth, pantry, and history, backed by Supabase. Deployable via `railway.json` / `Dockerfile`.
- `docs/` — project documentation.

## Important files

**Frontend**
- Routes: `frontend/src/app/` — `/` (landing), `/demo` (mock generator), `/generate`, `/pantry`, `/history`, `/download`, `/auth`
- Recipe types: `frontend/src/types/recipe.ts`
- API client: `frontend/src/lib/api.ts`
- Mock (backend-free) generation: `frontend/src/lib/demoMock.ts`
- Auth & providers: `frontend/src/components/AuthProvider.tsx`, `frontend/src/lib/auth.ts`
- Local recipe/pantry cache: `frontend/src/lib/recipeCache.ts`

**Backend**
- App entry: `backend/app/main.py`
- API routes: `backend/app/api/`
- Generation service: `backend/app/services/recipe_generation.py`
- Config & env: `backend/.env.example` (copy to `.env`; never commit `.env`)

## Running

Frontend:

```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

Backend (Python 3.12): see `backend/requirements.txt` and `backend/.env.example`. Deploy with `railway.json`.
