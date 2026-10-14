import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkgs = JSON.parse(fs.readFileSync(path.join(root, "content/packages.json"), "utf8"));
let live = [];
try {
  live = JSON.parse(fs.readFileSync(path.join(root, "content/live-extract.json"), "utf8")).packages || [];
} catch {
  live = [];
}

const SOURCE = "Primary import: endemicbirds.co.tz package cards merged via scripts/merge-live-into-content.mjs from content/live-extract.json (site scrape). Wildlife park copy/images partly from scripts/import-wildlife-from-ttb.mjs (Tanzania Tourism).";

function auditOne(p) {
  const itin = p.itinerary || [];
  const missing = [];
  if (!itin.length) missing.push("itinerary (day-by-day)");
  if (!(p.highlights?.birding || []).length && !(p.highlights?.wildlife || []).length) missing.push("highlights");
  if (!(p.included || []).length) missing.push("included");
  if (!(p.excluded || []).length) missing.push("excluded");
  if (!p.bestTime) missing.push("bestTime");
  if (!p.price && !p.priceFrom) missing.push("price");
  if (!(p.wildlifeDestinations || []).length && (p.category === "wildlife" || p.category === "combined")) {
    missing.push("wildlifeDestinations (park slugs)");
  }
  return {
    slug: p.slug,
    title: p.title,
    category: p.category,
    durationDays: p.durationDays,
    liveUrl: p.liveUrl || null,
    liveListingTitle: p.liveListingTitle || null,
    importSource: p.liveUrl ? "endemicbirds.co.tz" : "manual/seed",
    circuits: p.circuits || [],
    destinationHubs: p.destinations || [],
    wildlifeDestinations: p.wildlifeDestinations || [],
    itineraryDays: itin.length,
    hasIncluded: (p.included || []).length > 0,
    hasExcluded: (p.excluded || []).length > 0,
    hasBestTime: Boolean(p.bestTime),
    hasPrice: Boolean(p.price || p.priceFrom),
    needsOwnerReview: p.needsOwnerReview || [],
    missingFields: missing,
    complete: missing.length === 0,
  };
}

const packages = pkgs.map(auditOne);
const report = {
  generatedAt: new Date().toISOString(),
  totalPackages: packages.length,
  sourceNotes: SOURCE,
  liveExtractPackageCards: live.filter((x) => x.kind !== "destination-card").length,
  summary: {
    withItinerary: packages.filter((p) => p.itineraryDays > 0).length,
    withWildlifeDestSlugs: packages.filter((p) => p.wildlifeDestinations.length > 0).length,
    withPrice: packages.filter((p) => p.hasPrice).length,
    fullyComplete: packages.filter((p) => p.complete).length,
    birdingMissingItinerary: packages.filter((p) => p.category === "birding" && !p.itineraryDays).length,
  },
  incomplete: packages.filter((p) => !p.complete),
  complete: packages.filter((p) => p.complete),
  all: packages,
};

const out = path.join(root, "content/package-import-audit.json");
fs.writeFileSync(out, JSON.stringify(report, null, 2) + "\n", "utf8");
console.log(JSON.stringify(report.summary, null, 2));
console.log("Wrote", out);
