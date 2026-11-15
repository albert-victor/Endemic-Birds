import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const skipDirs = new Set(["node_modules", ".git", "content/scrapes", "demo"]);

function shouldSkipFile(filePath) {
  const rel = path.relative(root, filePath).replace(/\\/g, "/");
  return rel.startsWith("content/scrapes/");
}

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (/\.(html|json)$/i.test(ent.name)) acc.push(p);
  }
  return acc;
}

const hrefRe = /(?:href|src)=["']([^"'#?]+)/gi;
const files = walk(root);
const missing = [];

for (const file of files.filter((f) => !shouldSkipFile(f))) {
  const text = fs.readFileSync(file, "utf8");
  let m;
  while ((m = hrefRe.exec(text))) {
    let href = m[1].trim();
    if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("data:"))
      continue;
    href = href.replace(/^\//, "");
    const fromDir = path.dirname(file);
    const target = path.normalize(path.join(fromDir, href));
    const asFile = target.endsWith(".html") || target.endsWith(".json") ? target : path.join(target, "index.html");
    if (!fs.existsSync(asFile) && !fs.existsSync(target)) {
      missing.push({ from: path.relative(root, file), href: m[1] });
    }
  }
}

if (missing.length) {
  console.error(`Found ${missing.length} possibly broken relative links:`);
  for (const row of missing.slice(0, 80)) {
    console.error(`  ${row.from} -> ${row.href}`);
  }
  if (missing.length > 80) console.error(`  ... and ${missing.length - 80} more`);
  process.exitCode = 1;
} else {
  console.log("No broken relative links detected in html/json.");
}