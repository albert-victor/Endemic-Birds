# Credibility pages – content maintenance

Edit JSON under `content/`; pages load via `assets/js/about-credibility.js`.

## Trip reports (`trip-reports.json`)

Add objects to `reports` only for owner-approved field work.

| Field | Required | Notes |
|--------|----------|--------|
| `id` | yes | URL slug (e.g. `southern-arc-jun-2025`) |
| `type` | yes | `field-report` or `sample-itinerary` |
| `title` | yes | |
| `travelDates` or `year` | yes | Display string or year |
| `circuit` | yes | For filters (e.g. Southern, Eastern Arc) |
| `destinations` | yes | Array of site names |
| `guide` | if verified | Author name |
| `summary` | yes | Plain text for SEO |
| `summaryHtml` | optional | Safe HTML: `p`, `ul`, `li`, `strong`, `em` only |
| `notableSightings` | optional | Documented only |
| `download` | if file exists | `file`, `fileType` (`pdf`/`docx`), `sizeBytes`, `label` |
| `relatedPackages` | optional | Package `slug` values |
| `relatedDestinations` | optional | Destination `slug` values |

**Assets:** Place files under `assets/downloads/trip-reports/<id>.pdf` (or path you set in `download.file`). No download button renders if the file fails a `HEAD` check.

**Filters:** Circuit/year filters appear automatically when `reports.length >= meta.filterMinReports` (default 5).

## Tour training (`tour-training.json`)

Edit `page` copy only. Do **not** add `accreditation`, `price`, `fixedDates`, or `guaranteedOutcomes` until the owner confirms – use enquiry CTA instead.

## Partners (`partners.json`)

Commercial partner entry:

```json
{
  "id": "partner-slug",
  "name": "Company name",
  "logo": "assets/images/partners/example.png",
  "website": "https://",
  "relationship": "Ground handler for Eastern Arc modules",
  "status": "current",
  "verified": true,
  "verifiedDate": "YYYY-MM-DD"
}
```

- Set `verified: true` only with signed/partner-approved logo use.
- `commercial.past` for ended relationships (optional `endedYear`).
- **Do not** import third-party scrape logos (e.g. `partners-erlg.json` from another site) as Endemic Birds partners.

## Home page partner strip

The home carousel reads `partners.json` → `commercial.current` where `verified === true`. Unverified tourism-authority logos were removed from the commercial list.