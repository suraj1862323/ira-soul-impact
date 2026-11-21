# IRA SOUL backend deployment (Cloudflare Worker + D1)

**Not live until the Worker is deployed and secrets are set.**

## 1. Create D1 database
Cloudflare Dashboard → Workers & Pages → D1 → Create database: `ira-soul-db`.
Apply `schema.sql` in the database console.

## 2. Worker setup
Create a Worker (or replace the existing Worker code) with `worker.js`.
Bind the D1 database as variable `DB`.
Set Worker variables:
- `SITE_ORIGIN`: `https://irasoul.in`

Add secrets (never commit these):
- `ADMIN_PASSWORD`: a long unique admin password
- `SESSION_SECRET`: random 32+ character secret

## 3. Route/API
The backend endpoints are:
- `POST /api/requests` public form submission
- `POST /api/admin/login` password login
- `GET /api/admin/requests` authenticated list
- `PATCH /api/admin/requests/:id` status update
- `DELETE /api/admin/requests/:id` authenticated deletion
- `POST /api/admin/logout`

## Important
Before launch, add rate limiting to login and enquiry submissions (Cloudflare Turnstile or rate-limit rules). Configure the static asset routing for the Worker so API requests are handled by this Worker and website assets remain served. This worker file is a backend core, not a complete deploy-ready production security review.
