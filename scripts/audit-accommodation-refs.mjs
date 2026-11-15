import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const packages = JSON.parse(fs.readFileSync(path.join(root, "content", "packages.json"), "utf8"));

const patterns = [
  /overnight at ([^.;]+)/gi,
  /overnight in ([^.;]+)/gi,
  /stay overnight at ([^.;]+)/gi,
  /check into ([^.;]+)/gi,
  /dinner and overnight[^.]*at ([^.;(]+)/gi,
  /at ([^.;]+ Lodge[^.;]*)/gi,
  /at ([^.;]+ Camp[^.;]*)/gi,
  /bush camp/gi,
];

const byName = new Map();

for (const pkg of packages) {
  for (const day of pkg.itinerary || []) {
    const text = `${day.title || ""} ${day.description || ""}`;
    for (const re of patterns) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(text))) {
        const raw = m[1] || m[0];
        if (!raw) continue;
        const name = raw.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 120);
        if (name.length < 4) continue;
        if (!byName.has(name)) byName.set(name, { name, packageSlugs: new Set() });
        byName.get(name).packageSlugs.add(pkg.slug);
      }
    }
  }
}

const out = {
  generatedAt: new Date().toISOString(),
  notes:
    "Raw name extractions from package itinerary text – review before publishing in accommodations.json. Do not auto-publish.",
  mentions: [...byName.values()]
    .map((v) => ({ name: v.name, packageSlugs: [...v.packageSlugs].sort() }))
    .sort((a, b) => a.name.localeCompare(b.name)),
};

fs.writeFileSync(
  path.join(root, "content", "accommodation-refs-audit.json"),
  JSON.stringify(out, null, 2) + "\n",
  "utf8"
);
console.log(`Wrote ${out.mentions.length} accommodation mentions to accommodation-refs-audit.json`);