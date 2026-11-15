/**
 * Build content/accommodation-galleries.json from on-disk photos:
 * - accommodations/{slug}/*.{jpg,png,...} (your real uploads next to each stay page)
 * - assets/images/accommodations/{slug}/* (optional hero copies)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const accAssetsRoot = path.join(root, "assets", "images", "accommodations");
const accPagesRoot = path.join(root, "accommodations");
const jsonPath = path.join(root, "content", "accommodations.json");
const outPath = path.join(root, "content", "accommodation-galleries.json");

const IMAGE_RE = /\.(jpe?g|png|webp|gif|avif)$/i;

/** Extra folder names that belong to a canonical slug */
const SLUG_DIR_ALIASES = {
  "mullas-lodge": ["mullers-lodge"],
  /** Photos were saved under a misspelled folder (lemala vs Luala). */
  "luala-camp": ["lemala-camps"],
};

function sortFiles(files) {
  return [...files].sort((a, b) => {
    const ah = /^hero/i.test(a);
    const bh = /^hero/i.test(b);
    if (ah && !bh) return -1;
    if (bh && !ah) return 1;
    return a.localeCompare(b, undefined, { numeric: true });
  });
}

function listImagesInDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return sortFiles(fs.readdirSync(dir).filter((f) => IMAGE_RE.test(f)));
}

function relFromRoot(...parts) {
  return path.join(...parts).replace(/\\/g, "/");
}

function entryForFile(fullPath, relSrc) {
  let v = 0;
  let bytes = 0;
  try {
    const st = fs.statSync(fullPath);
    v = Math.round(st.mtimeMs);
    bytes = st.size;
  } catch {
    /* ignore */
  }
  return { src: relSrc, v, bytes };
}

/** Sharpest on-disk photo first; generic downloaded hero last. */
function orderGalleryEntries(entries) {
  return [...entries].sort((a, b) => {
    const aGenHero = a.src.includes("assets/images/accommodations/") && /\/hero\.(jpe?g|webp|png)/i.test(a.src);
    const bGenHero = b.src.includes("assets/images/accommodations/") && /\/hero\.(jpe?g|webp|png)/i.test(b.src);
    if (aGenHero !== bGenHero) return aGenHero ? 1 : -1;
    return (b.bytes || 0) - (a.bytes || 0);
  });
}

function collectForSlug(slug) {
  const seenSrc = new Set();
  const seenBase = new Set();
  const out = [];

  function push(relSrc, fullPath) {
    if (seenSrc.has(relSrc)) return;
    const baseKey = path.basename(fullPath).toLowerCase();
    if (seenBase.has(baseKey)) return;
    seenSrc.add(relSrc);
    seenBase.add(baseKey);
    out.push(entryForFile(fullPath, relSrc));
  }

  const dirs = [
    path.join(accPagesRoot, slug),
    path.join(accAssetsRoot, slug),
    ...(SLUG_DIR_ALIASES[slug] || []).flatMap((alias) => [
      path.join(accPagesRoot, alias),
      path.join(accAssetsRoot, alias),
    ]),
  ];

  for (const dir of dirs) {
    for (const file of listImagesInDir(dir)) {
      const full = path.join(dir, file);
      const underPages = full.startsWith(accPagesRoot);
      const rel = underPages
        ? relFromRoot("accommodations", path.basename(dir), file)
        : relFromRoot("assets", "images", "accommodations", path.basename(dir), file);
      push(rel, full);
    }
  }

  return orderGalleryEntries(out);
}

const accommodations = JSON.parse(fs.readFileSync(jsonPath, "utf8")).accommodations || [];
const galleries = {};

for (const item of accommodations) {
  galleries[item.slug] = collectForSlug(item.slug);
}

const meta = {
  builtAt: new Date().toISOString(),
  note: "Built from accommodations/{slug} and assets/images/accommodations/{slug}. Run: npm run build:accommodation-galleries",
};

fs.writeFileSync(outPath, `${JSON.stringify({ meta, galleries }, null, 2)}\n`);

const multi = Object.entries(galleries).filter(([, v]) => v.length > 1).length;
const empty = Object.values(galleries).filter((v) => v.length === 0).length;
console.log(
  `Wrote ${Object.keys(galleries).length} galleries (${multi} with card next/prev, ${empty} with no folder images).`
);