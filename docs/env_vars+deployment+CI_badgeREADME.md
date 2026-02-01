#Environment Variables

This project uses Supabase for authentication and data storage.

##Frontend (Vite)

Create a .env file inside the frontend/ directory for local development:

VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>


These variables are required for the frontend to run correctly.
In production, they are configured securely via Azure Static Web Apps → Environment Variables.

#Deployment (Azure)
##Frontend
- Deployed using Azure Static Web Apps
- Connected directly to the main branch of this GitHub repository
- Automatic deployment is triggered on every push to main

##Configuration:
- App location: ./frontend
- Build tool: Vite
- Output directory: dist

##CI/CD
- Deployment is handled via GitHub Actions
- Azure Static Web Apps workflow is auto-generated and customized
- Pull Request deployments are isolated from production

#Continuous Integration
This repository enforces CI quality gates using GitHub Actions:
- Install & build
- ESLint / static analysis
- Backend tests
- Frontend build validation

CI Status Badge
![CI](https://github.com/nellitarkka/SmallBusinessDirectory/actions/workflows/ci.yml/badge.svg)
Rendered badge

#Branch Protection
- Direct pushes to main are restricted
- Pull Requests are required
- CI checks must pass before merge
- At least one reviewer approval is required
