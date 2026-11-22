# IRA SOUL backend deployment (Cloudflare Worker + D1)

**The backend is code-complete only as a foundation. It is not live until Cloudflare D1, secrets, bindings, assets, and a Worker deployment are configured and tested.**

## Files added
- `backend/worker.js`: API routes and signed, HttpOnly admin session cookie.
- `backend/schema.sql`: D1 enquiries table and indexes.
- `admin.html`: login and enquiry management UI.
- `wrangler.toml`: Worker + static-assets deployment configuration.
- `.assetsignore`: keeps backend source/config files out of the public assets upload.

## 1. Create D1 database
Cloudflare Dashboard → Workers & Pages → D1 → Create database: `ira-soul-db`.
Open the database's console and execute `backend/schema.sql`.

## 2. Worker configuration and binding
Deploy the Worker using this repo's `wrangler.toml`. It defines `backend/worker.js` as the Worker entrypoint and publishes website files as static assets while prioritizing `/api/*` through the Worker.

In Cloudflare, bind the D1 database as binding name `DB` and select `ira-soul-db`.

Set Worker variable:
- `SITE_ORIGIN`: `https://irasoul.in`

Add secrets (never commit them):
- `ADMIN_PASSWORD`: a unique, long admin password (prefer 20+ characters)
- `SESSION_SECRET`: random 32+ characters; use a cryptographically secure random value

## 3. API routes
- `POST /api/requests` public enquiry form
- `POST /api/admin/login` password login
- `GET /api/admin/requests` authenticated list
- `PATCH /api/admin/requests/:id` update status to Pending / Contacted / Completed
- `DELETE /api/admin/requests/:id` delete enquiry
- `POST /api/admin/logout` clear session cookie

## 4. Before launch — REQUIRED security checklist
- Add Cloudflare rate limiting to login and public enquiry endpoint; rate limiting is not implemented in Worker code yet.
- Consider Cloudflare Turnstile on the public form to reduce spam.
- Review logs, test wrong-password behavior, session expiration, logout, status changes, and delete.
- Confirm `https://irasoul.in/admin.html` is served and all HTML/CSS/JS pages load.
- Test form submission from a second device and verify the enquiry appears in the same admin dashboard.
- Redirect `www.irasoul.in` to the canonical root domain or set `SITE_ORIGIN` consistently if www is also used.
- This code has not undergone a professional security audit. Do not treat it as production-ready until the above checks are complete.

## Access limitation
ChatGPT currently has no verified Cloudflare account connection for this project, so it cannot create the D1 database, set account secrets/bindings, or deploy the Worker. Those actions require Cloudflare account authorization. No live deployment is claimed.
