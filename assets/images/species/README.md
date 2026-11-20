# Species photos (checklists, special catalogue, bird of the day)

## Folder layout

One folder per bird, named with the **species slug** from `content/bird-species-index.json`:

```
assets/images/species/
  usambara-akalat/
    hero.jpg          ← main image (bird of the day, checklist thumb, modal)
    gallery-2.jpg     ← optional extra slides
  pemba-scops-owl/
    hero.webp
```

## Workflow

1. **Find the slug** – run `npm run build:bird-index` and search `content/bird-species-index.json` for the English or scientific name.
2. **Add images** – create `assets/images/species/{slug}/` and drop files (jpg, png, or webp).
3. **Register paths** – run `npm run scan:bird-media` to refresh `content/bird-species-media.json`.
4. **Special catalogue** – for full modal copy and homepage rotation, add or edit the species in `content/special-birds.json` (same slug). Images from this folder merge in automatically.
5. **Bird of the day** – add the slug to `content/bird-of-day.json` → `speciesSlugs` (species must exist in `special-birds.json` with merged images).

## Filename tips

- Prefer `hero.jpg` for the primary photo.
- Use verified, correctly identified species photos only (`verifiedPhoto` is set by the scan script).
- Habitat-only shots belong in `special-birds.json` with `imageRole: "habitat"`, not in this folder.

## After checklist updates

When `REPORT/destinations.json` changes:

```bash
npm run build:bird-checklists
npm run build:bird-index
npm run scan:bird-media
```