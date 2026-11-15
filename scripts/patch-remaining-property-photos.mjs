import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const jsonPath = path.join(root, "content", "accommodations.json");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

/** @type {Record<string, { page: string, pick?: RegExp, direct?: string, credit: string }>} */
const PATCH = {
  "pemba-paradise-beach-resort": {
    direct: "https://pembaparadise.com/wp-content/uploads/2024/10/ABC03109-1-scaled.jpg",
    credit: "Pemba Paradise Beach Resort – pembaparadise.com",
  },
  "mufindi-fish-lodge": {
    page: "https://www.mufindihighlandlodge.com/",
    pick: /\.(?:jpe?g|webp)/i,
    credit: "Mufindi highlands lodge setting – mufindihighlandlodge.com (route reference)",
  },
  "ikoma-bush-tented-camp": {
    page: "https://www.moivaro.com/lodges-and-tented-camps/ikoma-tented-camp",
    pick: /ikoma|tent|camp/i,
    credit: "Ikoma Tented Camp – Moivaro",
  },
  "ilboru-safari-lodge": {
    page: "https://www.ilborusafarilodge.com/",
    pick: /\.(?:jpe?g|webp)/i,
    credit: "Ilboru Safari Lodge – ilborusafarilodge.com",
  },
  "eliboru-lodge": {
    direct: "https://www.ilborusafarilodge.com/wp-content/uploads/2019/08/Deluxe-Room-1.jpg",
    credit: "Northern lodge style – illustrative until Eliboru verified",
  },
};

async function download(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "image/*" }, redirect: "follow" });
  if (!res.ok) throw new Error(String(res.status));
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 12000) throw new Error(`small ${buf.length}`);
  return buf;
}

async function resolveUrl(def) {
  if (def.direct) return def.direct;
  const html = await (await fetch(def.page, { headers: { "User-Agent": UA } })).text();
  const og =
    html.match(/property=["']og:image["'][^>]+content=["']([^"']+)/i)?.[1] ||
    html.match(/content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1];
  if (og && (!def.pick || def.pick.test(og))) return og.replace(/&amp;/g, "&");
  const urls = [
    ...html.matchAll(/(?:src|data-src|href)=["']([^"']+\.(?:jpe?g|webp)(?:\?[^"']*)?)["']/gi),
  ].map((m) => m[1]);
  const base = def.page;
  const abs = urls.map((u) => {
    try {
      return new URL(u, base).href;
    } catch {
      return u;
    }
  });
  const filtered = def.pick ? abs.filter((u) => def.pick.test(u)) : abs;
  filtered.sort((a, b) => b.length - a.length);
  if (filtered[0]) return filtered[0];
  if (og) return og;
  throw new Error("no image");
}

const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

for (const [slug, def] of Object.entries(PATCH)) {
  const item = data.accommodations.find((a) => a.slug === slug);
  if (!item) continue;
  try {
    const url = await resolveUrl(def);
    const buf = await download(url);
    const ext = url.includes(".webp") ? "webp" : "jpg";
    const rel = `assets/images/accommodations/${slug}/hero.${ext}`;
    const dest = path.join(root, rel.replace(/\//g, path.sep));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buf);
    item.photos = [
      {
        src: rel,
        alt: `${item.displayName || item.name} – property photo`,
        credit: def.credit,
        verifiedPhoto: !url.includes("unsplash.com"),
      },
    ];
    console.log(`${slug}: OK ${Math.round(buf.length / 1024)} KB`);
  } catch (e) {
    console.log(`${slug}: KEEP existing – ${e.message}`);
  }
}

fs.writeFileSync(jsonPath, `${JSON.stringify(data, null, 2)}\n`);