import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const report = JSON.parse(fs.readFileSync(path.join(root, "REPORT", "destinations.json"), "utf8"));
const slugMap = JSON.parse(
  fs.readFileSync(path.join(root, "content", "destination-checklist-slug-map.json"), "utf8")
);

function compactDestination(d) {
  return {
    reportId: d.id,
    reportSlug: d.slug,
    location: d.location.text,
    habitat: d.habitat,
    birdingHighlights: d.birdingHighlights.rawNames,
    sourceStatusCounts: d.sourceStatusCounts,
    speciesCountListed: d.species.length,
    species: d.species.map((s) => ({
      commonName: s.commonName,
      scientificName: s.scientificName,
      sourceLabel: s.sourceLabel,
    })),
  };
}

const bySiteSlug = {};
const unmatched = [];

for (const dest of report.destinations) {
  const siteSlug = slugMap.byReportId[dest.id];
  if (!siteSlug) {
    unmatched.push(dest.id);
    continue;
  }
  if (bySiteSlug[siteSlug]) {
    throw new Error(`Duplicate site slug ${siteSlug} for ${dest.id}`);
  }
  bySiteSlug[siteSlug] = compactDestination(dest);
}

const listedEntries = Object.values(bySiteSlug).reduce((n, d) => n + d.species.length, 0);

const out = {
  schemaVersion: "1.0.0",
  phase: "full-27",
  builtAt: new Date().toISOString().slice(0, 10),
  source: report.source,
  extractionPolicy: "Source-preserving; workbook labels are not IUCN statuses",
  summary: {
    destinationCount: Object.keys(bySiteSlug).length,
    listedSpeciesEntries: listedEntries,
    reportDestinationCount: report.destinations.length,
    unmatchedReportIds: unmatched,
  },
  bySiteSlug,
};

const outPath = path.join(root, "content", "destination-checklists.json");
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");

console.log(
  `Wrote ${out.summary.destinationCount} destinations, ${listedEntries} species rows → ${path.relative(root, outPath)}`
);
if (unmatched.length) {
  console.warn("Unmatched report ids:", unmatched.join(", "));
  process.exitCode = 1;
}