import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "assets", "images", "partners", "erlg");
const base = "https://erlgsafaris.co.tz";

const res = await fetch(base + "/", { headers: { "User-Agent": "Mozilla/5.0" } });
const html = await res.text();
fs.writeFileSync(path.join(root, "content", "scrapes", "erlg-home.html"), html, "utf8");

const urls = new Set();
for (const m of html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)) {
  let u = m[1];
  if (u.startsWith("//")) u = "https:" + u;
  else if (u.startsWith("/")) u = base + u;
  if (!u.includes("erlgsafaris") && !u.includes("wp-content")) continue;
  if (/\.(png|jpe?g|webp|svg)(\?|$)/i.test(u)) urls.add(u.split("&")[0]);
}

fs.mkdirSync(outDir, { recursive: true });
const manifest = [];
let i = 0;
for (const url of [...urls].slice(0, 40)) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) continue;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 600) continue;
    const ext = url.match(/\.(svg|png|webp|jpe?g)/i)?.[1]?.replace("jpeg", "jpg") || "png";
    const name = `logo-${String(++i).padStart(2, "0")}.${ext.split("?")[0]}`;
    fs.writeFileSync(path.join(outDir, name), buf);
    manifest.push({ name, file: `assets/images/partners/erlg/${name}`, sourceUrl: url });
  } catch {
    /* skip */
  }
}

fs.writeFileSync(path.join(root, "content", "partners-erlg.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log("URLs found", urls.size, "saved", manifest.length);
