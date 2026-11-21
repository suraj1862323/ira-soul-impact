# IRA SOUL — Fresh website prototype

A clean standalone front-end for the occasion-based kindness concept. This project is intentionally separate from the existing `ira-soul-corporate` website/repository.

## Files
- `index.html` — landing page, activity cards, occasions, process and request form.
- `styles.css` — responsive visual design.
- `script.js` — demo form storage and admin preview.

## Preview locally
Open `index.html` in a browser. For best results use a local static server.

## Demo admin
Click **Admin preview** in the footer. Request entries are stored in browser `localStorage` only; the preview has no authentication and is not secure.

## Before production
- Connect a backend/API and database for enquiry persistence.
- Implement secure admin authentication and server-side authorization.
- Connect the enquiry form to email/WhatsApp/CRM workflow.
- Add proper donation/activity budget transparency and completion evidence workflow.
- Replace demo images with licensed/consented assets and check image attribution/availability.
- Test responsive layouts, accessibility, and form validation.
- Deploy on Cloudflare Pages, then attach `irasoul.in` and `www.irasoul.in` after the new site is verified.
