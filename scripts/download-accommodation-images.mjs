/**
 * Download hero images for every accommodation (property or accurate setting).
 * Tries: official og:image → curated Unsplash (license) → Wikimedia.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const jsonPath = path.join(root, "content", "accommodations.json");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/** @type {Record<string, { name: string, sources: string[], credit: string, alt?: string }>} */
const PLAN = {
  "neema-craft-iringa": {
    name: "Neema Craft Iringa",
    credit: "Neema Crafts – community guest house setting",
    sources: [
      "https://www.neemacrafts.com/",
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=85",
    ],
  },
  "ruaha-river-lodge": {
    name: "Ruaha River Lodge",
    credit: "Ruaha riverine lodge setting – Unsplash",
    sources: [
      "https://ruahariverlodge.com/",
      "https://images.unsplash.com/photo-1549366021-9f761d450615?w=1200&q=85",
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=85",
    ],
  },
  "mufindi-fish-lodge": {
    name: "Mufindi Fish Lodge",
    credit: "Highland forest lodge – Unsplash",
    sources: [
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=85",
      "https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&q=85",
    ],
  },
  "old-kisolanza-farm": {
    name: "Old Kisolanza Farm",
    credit: "Tanzania highland farm stay – Unsplash",
    sources: [
      "https://www.kisolanza.com/",
      "https://images.unsplash.com/photo-1500386465869-1e667964a360?w=1200&q=85",
    ],
  },
  "ilboru-safari-lodge": {
    name: "Ilboru Safari Lodge",
    credit: "Arusha safari lodge – property / Unsplash",
    sources: [
      "https://www.ilborulodge.com/",
      "https://ilborusafarilodge.com/",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=85",
    ],
  },
  "ikoma-bush-tented-camp": {
    name: "Ikoma Bush Tented Camp",
    credit: "Serengeti tented camp – Unsplash",
    sources: [
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=85",
      "https://images.unsplash.com/photo-1506927766675-84b77911004a?w=1200&q=85",
    ],
  },
  "southern-miombo-bush-camp": {
    name: "Southern miombo bush camp",
    credit: "Miombo bush camp – Unsplash",
    sources: [
      "https://images.unsplash.com/photo-1478131337063-46baa650a3e0?w=1200&q=85",
      "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=1200&q=85",
    ],
  },
  "fq-hotel": {
    name: "FQ Hotel",
    credit: "FQ Hotel – official site",
    sources: ["https://fqhotel.co.tz/our-hotels/", "https://fqhotel.co.tz/"],
  },
  "pemba-paradise-beach-resort": {
    name: "Pemba Paradise Beach Resort",
    credit: "Pemba Paradise – official site",
    sources: [
      "https://pembaparadise.com/",
      "https://upload.wikimedia.org/wikipedia/commons/0/0a/Vumawimbi_Beach%2C_Pemba_Island.jpg",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=85",
    ],
  },
  "morogoro-hotel": {
    name: "Morogoro Hotel",
    credit: "Morogoro Hotel – official site",
    sources: ["https://www.morogorohotel.com/", "https://morogorohotel.com/"],
  },
  "sunset-hotel": {
    name: "Sunset Hotel",
    credit: "Southern highlands town hotel – Unsplash",
    sources: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=85",
    ],
  },
  "uluti-campsite": {
    name: "Uluti Campsite",
    credit: "Udzungwa forest camp – Tanzania Tourism / Unsplash",
    sources: [
      "https://www.tanzaniatourism.com/images/uploads/Udzungwa_National_Park_Sonjo__Natural_Pool_28.jpg",
      "https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&q=85",
    ],
  },
  "luala-camp": {
    name: "Luala Camp",
    credit: "Udzungwa mountain forest – Tanzania Tourism",
    sources: [
      "https://www.tanzaniatourism.com/images/uploads/Udzungwa_National_Park_Sanje_Waterfalls_21.jpg",
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=85",
    ],
  },
  "hondo-hondo-udzungwa-forest-lodge": {
    name: "Hondo Hondo Forest Lodge",
    credit: "Hondo Hondo – official site",
    sources: [
      "https://udzungwaforestlodge.com/",
      "https://www.udzungwaforestlodge.com/",
    ],
  },
  "tan-swiss-lodge": {
    name: "Tan-Swiss Lodge",
    credit: "Tan-Swiss Lodge – official site",
    sources: ["https://tan-swiss.com/", "https://www.tan-swiss.com/"],
  },
  "amani-nature-reserve": {
    name: "Amani Nature Reserve",
    credit: "Eastern Arc rainforest – Unsplash",
    sources: [
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&q=85",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=85",
    ],
  },
  "mullas-lodge": {
    name: "Mulla's Lodge",
    credit: "Usambara highlands lodge – Unsplash",
    sources: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=85",
    ],
  },
  "elephant-motel": {
    name: "Elephant Motel",
    credit: "Elephant Motel – official site",
    sources: ["https://elephantmotel.com/", "https://www.elephantmotel.com/"],
  },
  "eliboru-lodge": {
    name: "Eliboru Lodge",
    credit: "Northern Tanzania lodge base – Unsplash",
    sources: [
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=85",
    ],
  },
};

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    redirect: "follow",
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function extractOgImage(html, baseUrl) {
  const patterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) {
      try {
        return new URL(m[1].replace(/&amp;/g, "&"), baseUrl).href;
      } catch {
        return m[1];
      }
    }
  }
  return null;
}

async function downloadBinary(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*,*/*" },
    redirect: "follow",
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("text/html")) throw new Error("Got HTML not image");
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 8000) throw new Error(`Too small (${buf.length} bytes)`);
  return { buf, ct };
}

async function resolveImageUrl(source) {
  if (/\.(jpe?g|png|webp)(\?|$)/i.test(source) || source.includes("images.unsplash.com") || source.includes("upload.wikimedia.org") || source.includes("tanzaniatourism.com/images/")) {
    return source;
  }
  const html = await fetchHtml(source);
  const og = extractOgImage(html, source);
  if (!og) throw new Error("No og:image");
  return og;
}

async function downloadForSlug(slug, plan) {
  const destDir = path.join(root, "assets", "images", "accommodations", slug);
  const dest = path.join(destDir, "hero.jpg");
  fs.mkdirSync(destDir, { recursive: true });

  let lastErr = "";
  for (const source of plan.sources) {
    try {
      const imgUrl = await resolveImageUrl(source);
      const { buf } = await downloadBinary(imgUrl);
      fs.writeFileSync(dest, buf);
      return { ok: true, bytes: buf.length, from: imgUrl, via: source };
    } catch (e) {
      lastErr = e.message;
      process.stdout.write(`  try failed (${source.slice(0, 48)}…): ${e.message}\n`);
    }
  }
  return { ok: false, error: lastErr };
}

const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const slugs = (data.accommodations || []).map((a) => a.slug);
const report = [];

for (const slug of slugs) {
  const plan = PLAN[slug];
  if (!plan) {
    report.push({ slug, ok: false, error: "No plan entry" });
    console.log(`\n[${slug}] SKIP – no plan`);
    continue;
  }
  console.log(`\n[${slug}] ${plan.name}`);
  const result = await downloadForSlug(slug, plan);
  const item = data.accommodations.find((a) => a.slug === slug);
  if (result.ok && item) {
    const rel = `assets/images/accommodations/${slug}/hero.jpg`;
    item.photos = [
      {
        src: rel,
        alt: `${plan.name} – stay photography`,
        credit: plan.credit,
        verifiedPhoto: sourceIndicatesProperty(result.from),
      },
    ];
    report.push({ slug, ok: true, kb: Math.round(result.bytes / 1024), from: result.from });
    console.log(`  OK ${Math.round(result.bytes / 1024)} KB ← ${result.from.slice(0, 72)}…`);
  } else {
    report.push({ slug, ok: false, error: result.error });
    console.log(`  FAILED: ${result.error}`);
  }
}

function sourceIndicatesProperty(url) {
  return !url.includes("unsplash.com") && !url.includes("wikimedia.org") && !url.includes("tanzaniatourism.com");
}

fs.writeFileSync(jsonPath, `${JSON.stringify(data, null, 2)}\n`);

const ok = report.filter((r) => r.ok).length;
const failed = report.filter((r) => !r.ok);
const auditPath = path.join(root, "content", "accommodation-images-audit.json");
fs.writeFileSync(
  auditPath,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), total: report.length, ok, failed: failed.map((f) => f) }, null, 2)}\n`
);

console.log(`\n=== DONE: ${ok}/${report.length} images saved ===`);
if (failed.length) {
  console.log("Missing:");
  failed.forEach((f) => console.log(` - ${f.slug}: ${f.error}`));
  process.exitCode = 1;
}