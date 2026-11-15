import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const packages = JSON.parse(fs.readFileSync(path.join(root, "content", "packages.json"), "utf8"));

const MONTH_MAP = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

function itineraryText(pkg) {
  return (pkg.itinerary || [])
    .map((d) => `${d.title} ${d.description}`)
    .join(" ")
    .toLowerCase();
}

function inferIntensity(pkg, text) {
  if (/\bbush camp|bush camping|tent camp\b/.test(text)) return "demanding";
  if (pkg.durationDays >= 18 && /\bforest|miombo|rondo|udzungwa\b/.test(text)) return "demanding";
  if (pkg.category === "wildlife" && pkg.durationDays <= 6 && !/\bbush camp\b/.test(text)) return "relaxed";
  if (pkg.durationDays >= 11 && pkg.durationDays <= 16) return "moderate";
  if (pkg.durationDays >= 17) return "moderate";
  return null;
}

function inferComfort(pkg, text) {
  if (/\bluxury|flying safari|flying\b/.test(text) || /luxury/i.test(pkg.title)) return "luxury";
  if (/\blodge|hotel|heritage cottage\b/.test(text) && !/\bbush camp\b/.test(text)) return "mid-range";
  if (/\bbush camp|camping\b/.test(text)) return "mid-range";
  return null;
}

function inferAccommodation(text) {
  const types = new Set();
  if (/\blodge|hotel|cottage|guest house\b/.test(text)) types.add("lodge");
  if (/\btented camp|tent camp\b/.test(text)) types.add("tented-camp");
  if (/\bbush camp|camping\b/.test(text)) types.add("camping");
  if (/\bvilla\b/.test(text)) types.add("villa");
  return [...types];
}

function inferSeasonMonths(pkg, text) {
  const months = new Set();
  const bt = String(pkg.bestTime || "").toLowerCase();
  for (const [key, num] of Object.entries(MONTH_MAP)) {
    if (bt.includes(key) || text.includes(key)) months.add(num);
  }
  if (/\bjun[e–-]?oct|june.?october|dry season|may.?nov\b/.test(bt + text)) {
    [5, 6, 7, 8, 9, 10].forEach((m) => months.add(m));
  }
  return [...months].sort((a, b) => a - b);
}

const out = {
  generatedAt: new Date().toISOString(),
  notes:
    "Safari interest, intensity, comfort and accommodation are inferred conservatively from package copy. Empty values mean do not filter-match on that axis. Re-run: npm run build:package-meta",
  packages: {},
};

for (const pkg of packages) {
  const text = itineraryText(pkg);
  out.packages[pkg.slug] = {
    safariInterest: pkg.category || null,
    intensity: inferIntensity(pkg, text),
    comfort: inferComfort(pkg, text),
    accommodationTypes: inferAccommodation(text),
    seasonMonths: inferSeasonMonths(pkg, text),
    circuits: pkg.circuits || [],
    destinationHubs: pkg.destinations || [],
    durationDays: pkg.durationDays,
  };
}

fs.writeFileSync(path.join(root, "content", "package-meta.json"), JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`Wrote package-meta.json for ${packages.length} packages.`);