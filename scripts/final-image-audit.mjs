import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const jsonPath = path.join(root, "content", "accommodations.json");
const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const rows = [];

for (const a of data.accommodations) {
  const src = a.photos?.[0]?.src;
  const full = path.join(root, src?.replace(/^\//, "").replace(/\//g, path.sep) || "");
  const exists = src && fs.existsSync(full);
  const size = exists ? fs.statSync(full).size : 0;
  rows.push({
    slug: a.slug,
    exists,
    kb: Math.round(size / 1024),
    verifiedPhoto: a.photos?.[0]?.verifiedPhoto,
    src,
    credit: a.photos?.[0]?.credit,
  });
}

const missing = rows.filter((r) => !r.exists || r.kb < 12);
console.table(rows);
console.log(`\n${rows.filter((r) => r.exists && r.kb >= 12).length}/${rows.length} complete`);
if (missing.length) console.log("Needs work:", missing.map((m) => m.slug).join(", "));

fs.writeFileSync(
  path.join(root, "content", "accommodation-images-audit.json"),
  JSON.stringify({ at: new Date().toISOString(), rows }, null, 2)
);