# Owner content checklist

Items below are not invented on the public site. Supply or approve when ready.

## Credibility pages (see `content/CONTENT-CREDIBILITY.md` for schemas)

### Trip reports (`content/trip-reports.json`)
- Approved report titles, dates, circuits, destinations, guide name
- Plain `summary` and optional `summaryHtml`
- Documented `notableSightings` only
- PDF/DOCX file on server + `download.file`, `fileType`, `sizeBytes`
- Related package/destination slugs
- Do not add `sample-itinerary` entries to the reports list – use packages page

### Tour training (`content/tour-training.json`)
- Confirmed delivery format, duration, fees, certificates (only after approval)
- Replace “by enquiry” blocks with dated programmes if you launch public training

### Partners (`content/partners.json`)
- Partner name, logo file, website URL, relationship text
- Set `verified: true` only with logo permission
- `commercial.past` for ended collaborations (optional `endedYear`)
- Do not use scraped logos from other websites (e.g. ERLG fetch) as Endemic Birds partners

## About & company

1. **Booking terms** – full legal text for draft pages under `about/policies/`; see [POLICY-OWNER-CHECKLIST.md](./POLICY-OWNER-CHECKLIST.md).
2. **Team** – associate guides in `content/about.json` → `team.associates`.
3. **Social URLs** – `content/site.json` → `social`.
4. **Leons J. Mlawila** – verify chronology against source screenshots ([LEONS-PROFILE-OWNER-NOTES.md](./LEONS-PROFILE-OWNER-NOTES.md)); languages, testimonials, trip report links when approved.

## Safari packages

See `content/PACKAGE-CONTENT.md` and `npm run audit:packages`. Supply: missing itinerary days, distinction between duplicate listings, `package-details.json` copy, route stops, confirmed inclusions/exclusions, accommodation names, and PDF/DOCX under `assets/downloads/packages/`.

## Accommodation (`content/accommodations.json`)

See `content/ACCOMMODATION-CONTENT.md`. Supply: `verified: true` only after sign-off, licensed property photos with credits (`verifiedPhoto: true`), comfort level and property type, facilities/accessibility/family only when confirmed. Run `npm run audit:accommodations` to review raw itinerary lodge names before adding listings.

## Special birds (`content/special-birds.json`)

See `content/SPECIAL-BIRDS-CONTENT.md`. Supply verified species photos (`verifiedPhoto: true`), credits, and ID notes before replacing habitat placeholders.

## Tour calendar (`content/tour-calendar.json`)

See `content/TOUR-CALENDAR-CMS.md`. Publish guide blocks, departures and company holds with correct `status` and `publicLabel` only – never client names on booked private periods. Run `npm run validate:calendar` before deploy.

## Home partner strip

Shows only `partners.json` → `commercial.current` with `verified: true`. Section stays hidden until at least one verified partner exists.

Update this list as items are completed.