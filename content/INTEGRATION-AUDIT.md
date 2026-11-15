# Integration audit – upgraded site

**Date:** 15 November 2026  
**Scope:** Static site build, shared chrome, major user journeys, SEO shell, policies hub.

## Summary

| Area | Status | Notes |
|------|--------|-------|
| Terms & policies hub | OK | `policies-hub.json` drives hub; privacy published; three legal pages draft + noindex |
| About mega menu / mobile nav | OK | About column includes Tour calendar, Policies; mobile sheet mirrors |
| Shared header / footer | OK | `layout.js`; footer links Terms & policies + Privacy |
| Hero search & package filters | OK | Home hero + `/packages/` URL params; verify with live JSON |
| Destinations / packages / accommodation | Partial | Relations in JSON; owner must keep refs in sync (`audit:accommodations`) |
| Leon profile & enquiry paths | OK | Guide modals, `guide=` / `accommodation=` query prefill on plan-your-trip |
| Tour calendar | Partial | Git CMS only – no live booking; empty months hidden by design |
| Trip reports / itinerary PDFs | Partial | Library empty until owner adds verified PDFs + manifest |
| Species modals / bird of day | OK | `special-birds.json`, Eastern Arc sticky (session dismiss) |
| Eastern Arc sticky | OK | Respects `prefers-reduced-motion` via shared motion patterns |
| Image loading / performance | Review | Large hero imagery; no GA; third-party fonts/maps on demand |
| Accessibility | Review | Skip links, landmarks, modal focus – manual screen-reader pass advised |
| SEO / sitemap | Partial | Privacy in sitemap; many generated pages still have empty canonical in build shell |
| Broken links / CTAs | Review | Run `npm run audit:links` after content edits |

---

## Policies & privacy

- **Hub:** `/about/policies/index.html` loads `content/policies-hub.json` with draft/published badges and owner checklist.
- **Privacy:** `/privacy/index.html` reflects FormSubmit, WhatsApp, Leaflet/OSM, Google Fonts, Font Awesome, no current GA, static hosting, session sticky preference.
- **Drafts:** `booking-terms`, `cancellation-refund`, `terms-of-service` – placeholders only; **not production legal text**.
- **Build:** `npm run build` runs `build-legal-pages.mjs`.

**Owner:** Complete [POLICY-OWNER-CHECKLIST.md](./POLICY-OWNER-CHECKLIST.md); legal review required before indexing drafts.

---

## Navigation

- **Primary:** Home, Packages, Destinations, Accommodation, Wildlife, About (mega), Plan your trip.
- **About mega:** Story, Leon, Tour calendar, Policies, FAQ paths from `layout.js`.
- **Drawer:** Terms & policies primary; Privacy shortcut retained for familiarity.

**Manual check:** Open mega menu on desktop and mobile sheet; confirm active states on `data-nav` pages.

---

## Catalogues & relationships

- **Packages:** Filters from `package-meta.json`; hero search redirects with query.
- **Destinations:** Birding filters include extra sites JSON; Gombe on wildlife destinations.
- **Wildlife hub:** Editorial intro from `wildlife-hub.json` + theme activity grid (`renderWildlifeThemeGrid`).
- **Accommodation:** Catalogue + detail; not a booking engine – enquiries via main form.

**Scripts:** `npm run audit:accommodations`, `npm run audit:packages`.

---

## Calendar & Leon

- **Public calendar:** Three-year JSON; validated at build.
- **CTAs:** Enquiry with guide alternate and optional date prefill – depends on FormSubmit/email, not automated booking.

---

## Downloads & modals

- **Species:** Modal detail from JSON; bird-of-day on home.
- **Reports:** Download links only where JSON references real files – do not link placeholder PDFs.

---

## Performance & motion

- Static assets; Leaflet/maps load on package pages that include map mount.
- `motion.js` + CSS transitions; reduced-motion media queries on key animations.

---

## SEO gaps (remaining)

1. **Canonical URLs:** `build-pages.mjs` shell often emits empty `data-canonical` – set per route when production base URL is confirmed.
2. **Draft policies:** Correctly excluded from sitemap (noindex).
3. **Duplicate titles:** Spot-check generated package/destination pages after bulk imports.

---

## Misleading CTAs

- Draft policy pages state they are not contractual.
- Plan your trip does not imply instant confirmation.
- Calendar months without entries are not shown as “available seats.”

---

## Verification commands

```bash
npm run build
npm run validate:calendar
npm run audit:accommodations
npm run audit:packages
npm run audit:links
```

Functional smoke (local): `npm start`, then spot-check hub, privacy, wildlife hub intro, packages filters, special birds modal, Eastern Arc sticky dismiss.