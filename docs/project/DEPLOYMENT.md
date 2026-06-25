# ClipForge — Deployment

## Ön Koşullar

Organizasyon düzeyinde GitHub Actions secrets (repo-level YASAK):
- `GH_PAT` — GitHub repo sync
- `RAILWAY_API_TOKEN` — Railway provisioning
- `VERCEL_TOKEN` — Vercel frontend deploy

## Railway (Backend)

1. `scripts/provision-railway.sh backend/.railway/config.json`
2. Backend root: `backend/`
3. Start command: `web: npm run deploy` (Procfile)
4. Env: DATABASE_URL, JWT_SECRET, PORT=8080, FRONTEND_URL

## Vercel (Frontend)

1. `npx ts-node scripts/provision-vercel.ts clipforge`
2. Root directory: `frontend`
3. NEXT_PUBLIC_API_URL=https://clipforge-backend-production.up.railway.app/api

## Demo URL'ler

- Frontend: https://clipforge.vercel.app
- Backend: https://clipforge-backend-production.up.railway.app/api
