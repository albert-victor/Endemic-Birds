# Bird checklists & species images

## What was built

| File | Role |
|------|------|
| `content/destination-checklists.json` | All **27** birding destinations, **1,727** checklist rows (rebuild from REPORT) |
| `content/destination-checklist-slug-map.json` | Report id → live `destinations/{slug}/` |
| `content/bird-species-index.json` | **652** unique species: slugs, names, which destinations list them |
| `content/bird-species-media.json` | Image paths (auto-filled by scan) |
| `assets/images/species/{slug}/` | Drop photos here |

Every **circuit-site** destination page that has an entry in `bySiteSlug` shows the full field checklist UI.

Site search (`site-search.js`) indexes every species in `bird-species-index.json` with **checklist destinations** in the summary (planning reference, not sightings).

## Rebuild after Excel / REPORT changes

```bash
npm run build:bird-data
```

Or step by step: `build:bird-checklists` → `build:bird-index` → `scan:bird-media`.

## Add photos (checklists + special catalogue + bird of the day)

1. Find **slug** in `bird-species-index.json` (search common or scientific name).
2. Create folder `assets/images/species/{slug}/` and add `hero.jpg` (and optional extras).
3. Run `npm run scan:bird-media`.
4. **Checklist**: thumbnails and row click → species modal appear automatically.
5. **Special catalogue**: keep editorial copy in `special-birds.json` (same slug). Folder images merge over or supplement `images` in JSON.
6. **Bird of the day**: add slug to `bird-of-day.json` → `speciesSlugs`. Species should exist in `special-birds.json`; photos can come from the species folder via merge.

See also `assets/images/species/README.md`.

## Promote a checklist bird to “special”

Copy an entry pattern from `special-birds.json`, use the **slug from the index**, add `destinationSlugs` from the index, then add the slug to `bird-of-day.json` if you want it on the homepage rotation.