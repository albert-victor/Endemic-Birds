# Tour calendar – content & administration

## Current architecture

| Layer | Role |
|-------|------|
| `content/tour-calendar.json` | Public data contract (versioned in git) |
| `assets/js/tour-calendar.js` | Renders 3-year grid + accessible list (read-only) |
| `npm run validate:calendar` | Schema / date checks before deploy |
| Static hosting (`serve` / CDN) | No server-side CMS today |

There is **no authenticated admin UI in production** on this static site. Updates are made by editing JSON and deploying a new build.

## Data contract (`tour-calendar.json`)

### Status values (required on every published period)

| `status` | Public meaning |
|----------|----------------|
| `available` | Confirmed available (guide or company capacity) |
| `booked` | Unavailable – no client names on `visibility: private` |
| `departure-open` | Scheduled departure open to enquiries |
| `confirm-needed` | Ask before assuming availability |

Months without overlapping periods stay **`unpublished`** – never shown as available.

### Period objects

**Guide (`guides.leons.periods[]`)**

- `start`, `end` – ISO dates `YYYY-MM-DD`, inclusive
- `status` – see table
- `publicLabel` – short accessible label (colour is not sole indicator)
- `visibility` – use `private` on `booked` to suppress itinerary/client fields (public label only)

**Departures (`departures[]`)**

- `packageSlug` – links to `/packages/<slug>/` when `visibility: public`
- No passenger names or private travel detail in JSON

**Company blocks (`companyBlocks[]`)** – operational holds, same status rules

### File uploads (trip reports, itineraries)

Not handled in the browser. Pattern matches packages:

1. Owner places PDF/DOCX on server (`assets/downloads/…`)
2. JSON references path + `HEAD` check before showing download
3. **Never** commit API keys; **never** expose upload endpoints without auth

## Owner workflow today (git)

1. Edit `content/tour-calendar.json` (or run audit tools).
2. `npm run validate:calendar`
3. `npm run build`
4. Deploy static output (same as rest of site).
5. Set `updatedAt` to the publish date.

## Proposed authenticated CMS (not implemented)

Choose one integration; all keep **secrets off the static site**:

### Option A – Git-based editorial (lowest ops)

- [Decap CMS](https://decapcms.org/) or TinaCMS on GitHub
- OAuth via GitHub; editors commit `tour-calendar.json`
- CI runs `validate:calendar` + `build` on PR

**External setup:** GitHub repo, OAuth app, Netlify/Cloudflare build hook.

### Option B – Cloudflare Worker + Access + R2

- **Cloudflare Access** – email OTP or SSO for `@endemicbirds.co.tz`
- **Worker API** – `PUT /v1/calendar` validates JSON server-side, writes to R2
- **Build** – cron or webhook regenerates static JSON from R2 canonical copy (or Worker serves JSON with cache headers)

**Uploads (reports):**

- `POST /v1/uploads` – Access JWT required; allowlist `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`; max 8 MB; virus scan hook; store `r2://reports/<uuid>.pdf`; return path for `trip-reports.json`

**Secrets:** `UPLOAD_SIGNING_KEY`, R2 credentials – Worker env only.

### Option C – Headless (Sanity / Contentful)

- Calendar as document type; webhook triggers static rebuild

**Cost:** SaaS fees; good for non-technical editors.

## Validation

```bash
npm run validate:calendar
```

Fails on: unknown status, `end` before `start`, invalid dates, `departure-open` without `publicLabel`, `booked` with forbidden public fields.

## Public admin page

`admin/calendar/index.html` documents this file for staff – **no** upload form, **no** localStorage editor.