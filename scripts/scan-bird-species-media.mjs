import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const speciesDir = path.join(root, "assets", "images", "species");
const mediaPath = path.join(root, "content", "bird-species-media.json");
const indexPath = path.join(root, "content", "bird-species-index.json");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

function assetSrc(relFromRoot) {
  return relFromRoot.replace(/\\/g, "/");
}

let indexBySlug = {};
if (fs.existsSync(indexPath)) {
  const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  indexBySlug = index.lookup?.bySlug || Object.fromEntries((index.species || []).map((s) => [s.slug, s]));
}

function titleCase(slug) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const bySlug = {};
const unlinkedFolders = [];

if (fs.existsSync(speciesDir)) {
  for (const folder of fs.readdirSync(speciesDir, { withFileTypes: true })) {
    if (!folder.isDirectory() || folder.name.startsWith(".")) continue;
    const slug = folder.name;
    const folderPath = path.join(speciesDir, slug);
    const files = fs
      .readdirSync(folderPath)
      .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()))
      .sort((a, b) => {
        const score = (name) => (name.startsWith("hero") ? 0 : name.startsWith("01") ? 1 : 2);
        return score(a) - score(b) || a.localeCompare(b);
      });

    if (!files.length) continue;

    const meta = indexBySlug[slug];
    const commonName = meta?.commonName || titleCase(slug);

    const images = files.map((file, i) => {
      const rel = assetSrc(path.join("assets", "images", "species", slug, file));
      const isHero = file.toLowerCase().startsWith("hero");
      return {
        src: rel,
        alt: commonName,
        verifiedPhoto: true,
        primary: isHero || i === 0,
        imageRole: "species",
      };
    });
    if (images.length && !images.some((im) => im.primary)) images[0].primary = true;

    bySlug[slug] = { images };

    if (!meta) unlinkedFolders.push(slug);
  }
}

let prior = {};
if (fs.existsSync(mediaPath)) {
  try {
    prior = JSON.parse(fs.readFileSync(mediaPath, "utf8"));
  } catch {
    prior = {};
  }
}

const out = {
  schemaVersion: "1.0.0",
  updatedAt: new Date().toISOString().slice(0, 10),
  folderConvention: "assets/images/species/{slug}/",
  namingHints: [
    "Folder name must match species slug from content/bird-species-index.json",
    "Use hero.jpg (or hero.webp) as the main image; additional files become gallery slides",
    "Run npm run build:bird-index after changing checklists, then npm run scan:bird-media"
  ],
  bySlug: { ...(prior.bySlug || {}), ...bySlug },
  scan: {
    foldersScanned: Object.keys(bySlug).length,
    unlinkedFolders,
  },
};

fs.writeFileSync(mediaPath, JSON.stringify(out, null, 2), "utf8");
console.log(`Updated ${Object.keys(bySlug).length} species image sets → ${path.relative(root, mediaPath)}`);
if (unlinkedFolders.length) {
  console.warn("Folders without index slug (check spelling):", unlinkedFolders.join(", "));
}