# Azure Deployment Guide

## Architecture
- Frontend: Azure Static Web Apps (Vite + React)
- Backend: Azure App Service (Node.js / Express)
- Database & Auth: Supabase
- CI: GitHub Actions

## Deployment
### Frontend
- Automatically deployed on merge to `main`
- Hosted via Azure Static Web Apps

### Backend
- Automatically deployed on merge to `main`
- Hosted via Azure App Service

## Environment Variables
### Frontend
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_BACKEND_URL

### Backend
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- NODE_ENV

All variables are configured in Azure and not committed to GitHub.

## CI Pipeline
The CI pipeline enforces:
- Dependency installation
- Linting
- Automated tests
- Production build

CI must pass before code can be merged into `main`.

## Local Development
```bash
# frontend
cd frontend
npm install
npm run dev

# backend
cd vendor-backend
npm install
npm start
