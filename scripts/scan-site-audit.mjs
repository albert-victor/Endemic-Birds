import fs from "fs";
import path from "path";

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory() && !["node_modules", "content", "scripts"].includes(e.name)) walk(p, acc);
    else if (e.name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

const files = walk(".");
const font = { figtree: 0, jakarta: 0, marck: 0 };
const css = { styles: 0, home: 0, clean: 0 };
const catalog = { packages: 0, destinations: 0 };
const detail = {};
let homePage = 0;

for (const f of files) {
  const t = fs.readFileSync(f, "utf8");
  if (t.includes("Figtree")) font.figtree++;
  if (t.includes("Plus Jakarta")) font.jakarta++;
  if (t.includes("Marck Script")) font.marck++;
  if (t.includes("styles.css")) css.styles++;
  if (t.includes("home-v2.css")) css.home++;
  if (t.includes("clean-depth.css")) css.clean++;
  if (t.includes('data-catalog="packages"')) catalog.packages++;
  if (t.includes('data-catalog="destinations"')) catalog.destinations++;
  if (t.includes("data-home-mount")) homePage++;
  const m = t.match(/data-detail="([^"]+)"/);
  if (m) detail[m[1]] = (detail[m[1]] || 0) + 1;
}

console.log(JSON.stringify({ htmlFiles: files.length, font, css, catalog, homePage, detail }, null, 2));
