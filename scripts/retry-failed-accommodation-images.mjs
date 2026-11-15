import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const jsonPath = path.join(root, "content", "accommodations.json");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/** @type {Record<string, { urls: string[], credit: string, ext?: string }>} */
const FIX = {
  "fq-hotel": {
    credit: "FQ Hotel – fqhotel.co.tz",
    urls: [
      "https://fqhotel.co.tz/wp-content/uploads/2026/09/Outside-Building-17-scaled.webp",
      "https://fqhotel.co.tz/wp-content/uploads/2026/09/Room-14-scaled.webp",
    ],
    ext: "webp",
  },
  "morogoro-hotel": {
    credit: "Morogoro Hotel – morogorohotel.com",
    urls: [
      "http://www.morogorohotel.com/uploads/2/2/5/0/22506786/dsc-0479_orig.jpg",
      "http://www.morogorohotel.com/uploads/2/2/5/0/22506786/published/dsc-0406.jpg?1622060293",
    ],
  },
  "hondo-hondo-udzungwa-forest-lodge": {
    credit: "Hondo Hondo Udzungwa Forest Lodge – official site",
    urls: [
      "https://udzungwaforestlodge.com/static/images/udzungwaforestlodge.com/Home/Accommodation-1_002.jpg",
      "https://www.udzungwaforestlodge.com/static/images/udzungwaforestlodge.com/Home/Accommodation-1_002.jpg",
    ],
  },
  "tan-swiss-lodge": {
    credit: "Tan-Swiss Lodge – tan-swiss.com",
    urls: [
      "https://tan-swiss.com/wp-content/uploads/2020/11/63734109-1.jpg",
      "https://tan-swiss.com/wp-content/uploads/2022/04/2022_03_TAN_IMMO_TANSWISS_LODGE_MIKUMI_GALLERY_01.jpg",
    ],
  },
  "elephant-motel": {
    credit: "Elephant Motel – elephantmotel.com",
    urls: [
      "https://elephantmotel.com/wp-content/uploads/2025/02/Mkomazi.png",
      "https://elephantmotel.com/wp-content/uploads/2025/02/Rooms.png",
    ],
  },
};

async function download(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*" },
    redirect: "follow",
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 5000) throw new Error(`small ${buf.length}`);
  return buf;
}

const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const results = [];

for (const [slug, plan] of Object.entries(FIX)) {
  const item = data.accommodations.find((a) => a.slug === slug);
  if (!item) continue;
  const ext = plan.ext || (plan.urls[0]?.includes(".webp") ? "webp" : "jpg");
  const rel = `assets/images/accommodations/${slug}/hero.${ext}`;
  const dest = path.join(root, rel.replace(/\//g, path.sep));
  fs.mkdirSync(path.dirname(dest), { recursive: true });

  let ok = false;
  for (const url of plan.urls) {
    try {
      const buf = await download(url);
      fs.writeFileSync(dest, buf);
      item.photos = [
        {
          src: rel,
          alt: `${item.displayName || item.name} – property photo`,
          credit: plan.credit,
          verifiedPhoto: true,
        },
      ];
      results.push({ slug, ok: true, kb: Math.round(buf.length / 1024), url });
      console.log(`${slug}: OK ${Math.round(buf.length / 1024)} KB`);
      ok = true;
      break;
    } catch (e) {
      console.log(`${slug}: fail ${url.slice(0, 60)} – ${e.message}`);
    }
  }
  if (!ok) results.push({ slug, ok: false });
}

// Elephant: scrape larger JPG from site if PNG failed
if (!results.find((r) => r.slug === "elephant-motel" && r.ok)) {
  try {
    const html = await (await fetch("https://www.elephantmotel.com/", { headers: { "User-Agent": UA } })).text();
    const hits = [...html.matchAll(/https:\/\/elephantmotel\.com\/wp-content\/uploads\/[^"'\s]+\.(?:jpe?g|webp)/gi)].map(
      (m) => m[0]
    );
    const slug = "elephant-motel";
    const item = data.accommodations.find((a) => a.slug === slug);
    for (const url of hits) {
      try {
        const buf = await download(url);
        const rel = `assets/images/accommodations/${slug}/hero.jpg`;
        fs.writeFileSync(path.join(root, rel.replace(/\//g, path.sep)), buf);
        item.photos = [
          {
            src: rel,
            alt: "Elephant Motel – property photo",
            credit: "Elephant Motel – elephantmotel.com",
            verifiedPhoto: true,
          },
        ];
        console.log(`elephant-motel: OK scraped ${Math.round(buf.length / 1024)} KB`);
        results.push({ slug, ok: true });
        break;
      } catch {
        /* next */
      }
    }
  } catch (e) {
    console.log("elephant scrape", e.message);
  }
}

// Tan-swiss: scrape gallery from HTML
if (!results.find((r) => r.slug === "tan-swiss-lodge" && r.ok)) {
  try {
    const html = await (await fetch("https://tan-swiss.com/", { headers: { "User-Agent": UA } })).text();
    const hits = [...html.matchAll(/https:\/\/tan-swiss\.com\/wp-content\/uploads\/[^"'\s]+\.(?:jpe?g)/gi)].map(
      (m) => m[0]
    );
    const best = hits.find((u) => !u.includes("logo") && !u.includes("flags") && !u.includes("elementor/thumbs"));
    if (best) {
      const buf = await download(best);
      const slug = "tan-swiss-lodge";
      const rel = `assets/images/accommodations/${slug}/hero.jpg`;
      fs.mkdirSync(path.join(root, "assets/images/accommodations", slug), { recursive: true });
      fs.writeFileSync(path.join(root, rel.replace(/\//g, path.sep)), buf);
      const item = data.accommodations.find((a) => a.slug === slug);
      item.photos = [
        {
          src: rel,
          alt: "Tan-Swiss Lodge – property photo",
          credit: "Tan-Swiss Lodge – tan-swiss.com",
          verifiedPhoto: true,
        },
      ];
      console.log(`tan-swiss-lodge: OK scraped`);
      results.push({ slug, ok: true });
    }
  } catch (e) {
    console.log("tan-swiss scrape", e.message);
  }
}

fs.writeFileSync(jsonPath, `${JSON.stringify(data, null, 2)}\n`);
const failed = Object.keys(FIX).filter((slug) => !results.find((r) => r.slug === slug && r.ok));
console.log(failed.length ? `Still missing: ${failed.join(", ")}` : "All 5 retries OK");