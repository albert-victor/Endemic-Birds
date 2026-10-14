import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function exists(rel) {
  const p = path.join(root, rel.replace(/^\//, ""));
  return fs.existsSync(p);
}

function resolveOnDisk(rel) {
  const r = String(rel || "").replace(/^\//, "");
  if (!r) return false;
  if (r.startsWith("http")) return true;
  const candidates = [r];
  if (r.startsWith("endemics/")) candidates.push(r);
  else if (r.startsWith("assets/")) candidates.push(r);
  else candidates.push(`assets/images/${r}`, r);
  return candidates.some((c) => exists(c));
}

const report = {
  missingFiles: [],
  noHeroImage: [],
  landingPagesNoHero: [],
  pagesChecked: 0,
};

function recordMissing(page, name, heroImage, kind) {
  report.missingFiles.push({ page, name, heroImage, kind });
}

function auditItems(page, items, getHero, kind) {
  for (const item of items) {
    report.pagesChecked++;
    const hero = getHero(item);
    const name = item.name || item.title || item.slug;
    if (!hero) {
      report.noHeroImage.push({ page, slug: item.slug, name, kind });
      continue;
    }
    if (!resolveOnDisk(hero)) recordMissing(page, name, hero, kind);
  }
}

const destinations = JSON.parse(fs.readFileSync(path.join(root, "content/destinations.json"), "utf8"));
auditItems("destinations.json", destinations, (d) => d.heroImage || d.thumbnail, "circuit-destination");

for (const file of ["southern-sites.json", "western-sites.json", "northern-sites.json"]) {
  const data = JSON.parse(fs.readFileSync(path.join(root, "content", file), "utf8"));
  auditItems(file, data.sites || [], (s) => s.heroImage, "birding-site");
}

const packages = JSON.parse(fs.readFileSync(path.join(root, "content/packages.json"), "utf8"));
auditItems("packages.json", packages, (p) => p.heroImage, "package");

const wildlifeDest = JSON.parse(fs.readFileSync(path.join(root, "content/wildlife-destinations.json"), "utf8"));
auditItems("wildlife-destinations.json", wildlifeDest, (d) => d.heroImage, "wildlife-destination");

const wildlifeAct = JSON.parse(fs.readFileSync(path.join(root, "content/wildlife-activities.json"), "utf8"));
auditItems("wildlife-activities.json", wildlifeAct, (a) => a.heroImage, "wildlife-activity");

const landingHtml = [
  "index.html",
  "birding/index.html",
  "wildlife/index.html",
  "combined/index.html",
  "about/index.html",
  "packages/index.html",
  "destinations/index.html",
  "plan-your-trip/index.html",
];

for (const rel of landingHtml) {
  const html = fs.readFileSync(path.join(root, rel), "utf8");
  const hasHero =
    /--hero-img:\s*url\(/i.test(html) ||
    /--page-hero-img:\s*url\(/i.test(html) ||
    /class="hero-push"/.test(html) ||
    /data-about-hero/.test(html);
  if (!hasHero && !rel.includes("packages/index") && !rel.includes("destinations/index") && !rel.includes("plan-your-trip")) {
    report.landingPagesNoHero.push(rel);
  }
}

const outPath = path.join(root, "content", "media-audit-report.json");
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
console.log(`\nWrote ${outPath}`);
