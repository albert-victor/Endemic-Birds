import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(root, "content", name), "utf8"));
}

const dests = readJson("wildlife-destinations.json");
const activities = readJson("wildlife-activities.json");
const packages = readJson("packages.json").filter((p) => p.category === "wildlife");

let missing = 0;
let ok = 0;

for (const d of dests) {
  const paths = [d.heroImage, ...(d.gallery || [])].filter(Boolean);
  if (paths.length < 6) {
    console.error(`WARN ${d.slug}: only ${paths.length} image paths in JSON`);
    missing++;
  }
  for (const rel of paths) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) {
      console.error(`MISSING file ${rel}`);
      missing++;
    } else {
      ok++;
    }
  }
  const html = path.join(root, "wildlife", "destinations", d.slug, "index.html");
  if (!fs.existsSync(html)) {
    console.error(`MISSING page wildlife/destinations/${d.slug}/`);
    missing++;
  }
}

for (const a of activities) {
  if (!a.packageSlugs || a.packageSlugs.length < 2) {
    console.error(`WARN activity ${a.slug}: needs 2+ packages, has ${a.packageSlugs?.length || 0}`);
    missing++;
  }
  for (const slug of a.packageSlugs || []) {
    if (!packages.find((p) => p.slug === slug)) {
      console.error(`MISSING wildlife package ${slug} for activity ${a.slug}`);
      missing++;
    }
  }
  const html = path.join(root, "wildlife", "activities", a.slug, "index.html");
  if (!fs.existsSync(html)) {
    console.error(`MISSING page wildlife/activities/${a.slug}/`);
    missing++;
  }
  if (a.heroImage && !fs.existsSync(path.join(root, a.heroImage))) {
    console.error(`MISSING activity hero ${a.heroImage}`);
    missing++;
  }
}

for (const p of packages) {
  const html = path.join(root, "packages", p.slug, "index.html");
  if (!fs.existsSync(html)) {
    console.error(`MISSING package page ${p.slug}`);
    missing++;
  }
  if (!p.itinerary?.length) {
    console.error(`WARN package ${p.slug}: empty itinerary`);
    missing++;
  }
  if (p.heroImage && !fs.existsSync(path.join(root, p.heroImage))) {
    console.error(`MISSING package hero ${p.heroImage}`);
    missing++;
  }
}

console.log(`\nImages OK: ${ok}. Issues: ${missing}. Wildlife packages: ${packages.length}. Destinations: ${dests.length}. Activities: ${activities.length}.`);
process.exit(missing > 0 ? 1 : 0);
