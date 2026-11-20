import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const checklists = JSON.parse(
  fs.readFileSync(path.join(root, "content", "destination-checklists.json"), "utf8")
);
const special = JSON.parse(fs.readFileSync(path.join(root, "content", "special-birds.json"), "utf8"));

function slugifyScientific(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function slugifyCommon(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeKey(commonName, scientificName) {
  const sci = (scientificName || "").trim().toLowerCase();
  if (sci) return `sci:${sci}`;
  return `com:${(commonName || "").trim().toLowerCase()}`;
}

const specialBySci = new Map();
const specialByCommon = new Map();
for (const sp of special.species || []) {
  if (sp.scientificName) specialBySci.set(sp.scientificName.trim().toLowerCase(), sp.slug);
  if (sp.commonName) specialByCommon.set(sp.commonName.trim().toLowerCase(), sp.slug);
}

const speciesMap = new Map();

for (const [destinationSlug, dest] of Object.entries(checklists.bySiteSlug || {})) {
  for (const row of dest.species || []) {
    const key = normalizeKey(row.commonName, row.scientificName);
    let entry = speciesMap.get(key);
    if (!entry) {
      const sci = row.scientificName?.trim() || null;
      const slug =
        (sci && specialBySci.get(sci.toLowerCase())) ||
        specialByCommon.get(row.commonName.trim().toLowerCase()) ||
        (sci ? slugifyScientific(sci) : slugifyCommon(row.commonName));
      entry = {
        slug,
        commonName: row.commonName,
        scientificName: sci,
        destinationSlugs: [],
        sourceLabels: [],
        inSpecialCatalog: Boolean(
          specialBySci.has((sci || "").toLowerCase()) ||
            specialByCommon.has(row.commonName.trim().toLowerCase())
        ),
        specialCatalogSlug:
          (sci && specialBySci.get(sci.toLowerCase())) ||
          specialByCommon.get(row.commonName.trim().toLowerCase()) ||
          null,
      };
      speciesMap.set(key, entry);
    }
    if (!entry.destinationSlugs.includes(destinationSlug)) {
      entry.destinationSlugs.push(destinationSlug);
    }
    if (row.sourceLabel && !entry.sourceLabels.includes(row.sourceLabel)) {
      entry.sourceLabels.push(row.sourceLabel);
    }
  }
}

const species = [...speciesMap.values()].sort((a, b) =>
  a.commonName.localeCompare(b.commonName, undefined, { sensitivity: "base" })
);

const bySlug = Object.fromEntries(species.map((s) => [s.slug, s]));
const byScientific = {};
const byCommon = {};
for (const s of species) {
  if (s.scientificName) byScientific[s.scientificName.toLowerCase()] = s.slug;
  byCommon[s.commonName.toLowerCase()] = s.slug;
}

const distinctSci = new Set(
  species.filter((s) => s.scientificName).map((s) => s.scientificName.toLowerCase())
).size;

const out = {
  schemaVersion: "1.0.0",
  generatedAt: new Date().toISOString().slice(0, 10),
  generatedFrom: "content/destination-checklists.json",
  summary: {
    speciesCount: species.length,
    distinctScientificNames: distinctSci,
    inSpecialCatalog: species.filter((s) => s.inSpecialCatalog).length,
    destinationLinks: Object.keys(checklists.bySiteSlug || {}).length,
  },
  species,
  lookup: { bySlug, byScientificName: byScientific, byCommonName: byCommon },
};

const outPath = path.join(root, "content", "bird-species-index.json");
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");
console.log(
  `Wrote ${species.length} species (${distinctSci} with scientific names) → ${path.relative(root, outPath)}`
);