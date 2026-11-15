# Special birds & bird of the day

## Files

| File | Purpose |
|------|---------|
| `special-birds.json` | Species catalogue, categories, images, safari links |
| `bird-of-day.json` | Homepage rotation pool |
| `eastern-arc-detail.json` | Eastern Arc hub copy (same URL as `eastern-arc-mountain`) |

## Adding a species

1. Add to `special-birds.json` → `species[]`.
2. Set `category`: `endemic`, `range-restricted`, or `specialist`.
3. `images[]`: each needs `src`, `alt`, `credit`, `verifiedPhoto` (true only when species is correctly identified in the photo).
4. Use `imageRole: habitat` for forest/landscape placeholders – never imply nesting sites.
5. Link `destinationSlugs` and `packageSlugs` only where the species is a realistic target.
6. Identification notes only when owner-verified.

## Bird of the day

Edit `bird-of-day.json` → `speciesSlugs` order. Rotation uses day-of-year modulo list length.

## Shareable modal URL

`?species=<slug>` on home, special birds, or Eastern Arc pages opens the detail modal (no separate page).