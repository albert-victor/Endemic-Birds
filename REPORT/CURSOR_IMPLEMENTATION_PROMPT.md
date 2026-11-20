# Cursor Agent Task — Integrate 27 birding destination checklists

You are modifying an **existing** Endemic Birds and Wildlife Experiences website. Treat design continuity and source accuracy as more important than adding new UI.

## Source files you must read
- `destinations.json` (authoritative source for this task)
- `qa_findings.json` (data limitations and exceptions)
- `DESTINATIONS_OVERVIEW.md` (summary/reference)
- Review existing routing, destination components, content models, UI typography, image system, breakpoint rules, and relevant CMS/data fetch logic before changing code.

## Goal
Integrate location, habitat, **listed species count**, relevant birding highlights, and bird species checklists (common name, scientific name, and original workbook label) into the corresponding existing destination detail pages. Avoid duplicating destinations or creating new destinations for records that already have pages.

## Workflow — follow in order
1. Inspect the project to identify framework, site structure, routes, content models, and existing birding vs wildlife destination categories. Make an internal mapping from each `destinations[].name` to the actual existing site destination page/slug. Do not blindly overwrite slugs with the suggested `slug` values.
2. Identify which of the 27 source areas have matching existing detail pages. If any do not, report unmatched areas and **do not manufacture routes or pages** without project convention support.
3. Create or adapt a single typed data adapter from `destinations.json` to existing frontend components. Do not duplicate species arrays by manually copying them into pages.
4. Preserve current page visuals (fonts, color palette, spacing, button patterns, headers, animations, cards, navigation and responsive behavior); introduce only minimal components required to display bird data cleanly.
5. For each matched birding destination page, show the location text, habitat description, count with explicit label **“Bird species listed”** or **“Species in this checklist”**, and a subset of birding highlights. Display species in a clean table/list with common names, *italic scientific names* where non-null, and an optional small plain-text source label.
6. Ensure the list works on mobile: search and/or filter if list is long, readable scientific names, no horizontal overflow. Use existing components and styles; collapse lengthy checklists progressively if that is already the site's behavior.
7. Preserve source order by default: workbook groups endemic, near-endemic, range-restricted, specialty, signature, and personal record entries. If sorting or filtering, preserve original `sourceLabel` values.
8. Handle `scientificName: null` gracefully: display common name without fabricated taxonomy; optionally show a subtle “Scientific name not provided” indication in admin-only contexts, not an alarming public-facing badge.
9. Do not treat `Your record` as official status; if displayed, label the category as **“Additional checklist record”** instead of conservation status. Do not interpret `seenInPersonalRecords` as a visitor sighting.
10. Add data-level checks/tests verifying 27 source destinations, 1,727 entries, 650 unique nonblank scientific names and two missing names. Ensure actual destination counts equal `species.length` for each page.
11. Report changed files, matched destinations, unmatched destinations, checks performed, and any taxonomy/region/source issues requiring human review.

## Strict content rules
- Never change a common or scientific name by guessing, auto-correcting, translating, or invoking external taxonomies implicitly.
- Never convert `sourceLabel` into IUCN categories such as Least Concern, Vulnerable, Endangered, or Critically Endangered. Source has no verified IUCN field.
- Avoid headings like “Total birds in this park” or phrases claiming the checklist represents all birds in the protected area. Use **“Listed bird species”**.
- Do not assert sightings/seasonality/abundance, habitat range, GPS coordinates, visitor access, fees or best months unless supported by pre-existing verified site content. Source gives mainly location-region, broad habitat and checklist labels.
- If the index's highlighted bird phrase cannot be found as an exact common name in the species list (`unmatchedHighlightText`), it can be used as verbatim descriptive highlight copy, but must not be counted or injected as a new species entry.
- Do not invent birds for the small datasets (e.g. Pemba's five listed species). This is an intentionally selective workbook, not exhaustive inventories.
- Do not touch wildlife-only destination pages or global layout except what is necessary to connect the existing shared destination content model.
- Do not use all 1,727 items in the initial DOM on the homepage; load checklist only where relevant.

## UI structure suggested (adapt to the existing design)
1. Existing destination hero (keep unchanged).
2. Existing destination overview, with small metadata for location and habitat.
3. Calm “Birdlife highlights” row/list (max 4–6 highlights, avoid invented adjectives).
4. A count caption: `{{species.length}} bird species listed in this checklist`.
5. Responsive checklist with search/filter on common name, scientific name, and source category (especially for 100+ rows).
6. Optional editorial note: “This is a selected checklist, not a complete inventory of species found in the area.”

## Source JSON example usage (pseudocode)
```ts
const source = destinationsData.destinations.find(x => x.slug === requestedSlug);
const rows = source?.species ?? [];
const count = rows.length;
const matches = rows.filter(bird =>
  [bird.commonName, bird.scientificName ?? '', bird.sourceLabel ?? '']
    .some(value => value.toLowerCase().includes(query.toLowerCase()))
);
```
Use an existing route-to-source mapping instead of direct slug equality when the website already uses different URLs. Integrate in the framework's existing conventions.

## Acceptance criteria
- No duplicated destination pages or species entries caused by import.
- All 27 areas are accounted for (matched or clearly reported unmatched).
- All 1,727 source rows remain accessible in the canonical JSON.
- No invented scientific names or IUCN classifications.
- Counts are consistent and correctly labeled as checklist counts.
- Birding/wildlife destination designs remain premium, minimal, and mobile-friendly.
- Build/lint/tests pass where available.

## Deliverables in your final agent response
Summarize matched pages, files changed, routes untouched, any unmatched source areas, QA warnings still open, and brief test results. Do not claim external scientific verification unless performed and documented with authoritative references separately.
