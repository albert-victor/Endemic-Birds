# Accommodation discovery content

## Purpose

The accommodation section supports **safari planning** with our team. It is **not** a booking marketplace: no live prices, star ratings, room counts or availability claims.

## Files

| File | Purpose |
|------|---------|
| `accommodations.json` | Verified properties, planning copy, filters |
| `accommodation-refs-audit.json` | Generated raw lodge names from itineraries (`npm run audit:accommodations`) |

## Adding a property

1. Confirm the name matches what you use on proposals and invoices.
2. Add an object to `accommodations[]` with `verified: true` only when signed off.
3. Set **comfort level** and **property type** independently (`comfortLevel`, `propertyType`).
4. Link **package slugs** only where the property is actually named in `packages.json` itinerary text.
5. Link **nearby** birding (`nearbyDestinationSlugs`) or wildlife (`nearbyWildlifeSlugs`) slugs – do not imply every safari uses this lodge.
6. **Photos**: each entry needs `photos[]` with `src`, `alt`, `credit`, and `verifiedPhoto: true` only when you hold publication rights. Until then keep `verifiedPhoto: false` and habitat/illustrative images.
7. **Facilities / accessibility / family**: use string arrays or short notes only when verified – leave `null` otherwise (no specialist filters appear).
8. Run `npm run build` to regenerate detail pages and sitemap.

### Schema (required fields)

```json
{
  "id": "unique-id",
  "slug": "url-slug",
  "name": "Display name",
  "verified": true,
  "comfortLevel": "budget | mid-range | luxury | null",
  "propertyType": "lodge | tented-camp | campsite | villa | bush-retreat",
  "circuit": "Northern | Southern | …",
  "location": "Region · area",
  "summary": "One or two sentences",
  "birdingSetting": "Habitat proximity in plain language",
  "nearbyDestinationSlugs": [],
  "nearbyWildlifeSlugs": [],
  "packageSlugs": [],
  "facilities": [],
  "accessibility": null,
  "familySuitability": null,
  "photos": [{ "src": "assets/…", "alt": "…", "credit": "…", "verifiedPhoto": false }],
  "seo": { "title": "…", "description": "…" }
}
```

## Unverified inventory

Do **not** add placeholder lodges to fill the grid. When the list is short, the index page shows the **planning** block from `accommodations.json` → `planning`.

## Enquiry links

Detail CTAs use `plan-your-trip/index.html?accommodation=<slug>`. The form prefill adds the property name to the message field.

## Audit

```bash
npm run audit:accommodations
```

Review `accommodation-refs-audit.json` for itinerary mentions before creating new verified entries.