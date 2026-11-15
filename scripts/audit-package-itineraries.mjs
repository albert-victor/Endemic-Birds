import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const packages = JSON.parse(fs.readFileSync(path.join(root, "content", "packages.json"), "utf8"));

function itineraryFingerprint(itin) {
  const norm = (itin || []).map((d) => `${d.day}|${(d.title || "").trim()}|${(d.description || "").trim()}`).join("\n");
  return crypto.createHash("sha256").update(norm).digest("hex").slice(0, 16);
}

function missingDays(itin, durationDays) {
  const days = new Set((itin || []).map((d) => Number(d.day)));
  const missing = [];
  for (let i = 1; i <= durationDays; i++) {
    if (!days.has(i)) missing.push(i);
  }
  return missing;
}

const byHash = new Map();
const issues = [];

for (const pkg of packages) {
  const fp = itineraryFingerprint(pkg.itinerary);
  if (!byHash.has(fp)) byHash.set(fp, []);
  byHash.get(fp).push(pkg.slug);

  const missing = missingDays(pkg.itinerary, pkg.durationDays);
  const entry = {
    slug: pkg.slug,
    title: pkg.title,
    durationDays: pkg.durationDays,
    itineraryEntryCount: pkg.itinerary?.length || 0,
    missingDayNumbers: missing,
    itineraryFingerprint: fp,
    needsOwnerReview: pkg.needsOwnerReview || [],
    liveUrl: pkg.liveUrl || null,
  };

  if (missing.length) {
    issues.push({
      type: "missing-days",
      slug: pkg.slug,
      missing,
      message: `${pkg.slug}: missing day numbers ${missing.join(", ")} (duration ${pkg.durationDays})`,
    });
  }
  if ((pkg.itinerary?.length || 0) < pkg.durationDays) {
    issues.push({
      type: "sparse-itinerary",
      slug: pkg.slug,
      message: `${pkg.slug}: only ${pkg.itinerary?.length || 0} itinerary entries for ${pkg.durationDays}-day package`,
    });
  }
}

for (const [fp, slugs] of byHash) {
  if (slugs.length > 1) {
    issues.push({
      type: "duplicate-itinerary",
      slugs,
      fingerprint: fp,
      message: `Identical itinerary on: ${slugs.join(", ")}`,
    });
  }
}

const knownPairs = [
  ["19-days-southern-tanzania-birding-trip", "19-days-southern-endemic-birding"],
  ["20-day-endemic-birds-southern", "20-day-endemic-birding-tanzania"],
  ["22-days-endemic-birding-tours", "22-days-birding-itinerary-north-east-south-pemba"],
];

for (const [a, b] of knownPairs) {
  const pa = packages.find((p) => p.slug === a);
  const pb = packages.find((p) => p.slug === b);
  if (pa && pb) {
    const same = itineraryFingerprint(pa.itinerary) === itineraryFingerprint(pb.itinerary);
    issues.push({
      type: "editorial-distinction-needed",
      slugs: [a, b],
      identicalItinerary: same,
      message: same
        ? `${a} and ${b} share identical itinerary text – owner must clarify positioning or merge.`
        : `${a} and ${b} differ in itinerary – owner should confirm marketing distinction on package pages.`,
    });
  }
}

const out = {
  generatedAt: new Date().toISOString(),
  packageCount: packages.length,
  duplicateGroups: [...byHash.entries()].filter(([, slugs]) => slugs.length > 1).map(([fp, slugs]) => ({ fingerprint: fp, slugs })),
  packages: packages.map((p) => ({
    slug: p.slug,
    durationDays: p.durationDays,
    itineraryEntryCount: p.itinerary?.length || 0,
    missingDayNumbers: missingDays(p.itinerary, p.durationDays),
    fingerprint: itineraryFingerprint(p.itinerary),
  })),
  issues,
};

const outPath = path.join(root, "content", "package-editorial-audit.json");
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`Wrote ${issues.length} issues to content/package-editorial-audit.json`);
issues.forEach((i) => console.log(" -", i.message));