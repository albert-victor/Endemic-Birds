/**
 * Package images from the same reference URLs used for the Nov 2026 import
 * (Cisticola + Birdquest). Gallery-2 where noted from endemicbirds.co.tz live pages.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagesPath = path.join(root, "content", "packages.json");
const UA = "EndemicBirdsSiteBuild/1.0";

const PLAN = [
  {
    slug: "15-days-tanzania-birding-tour",
    referenceUrl: "https://www.cisticolatours.com/tanzania-birding-tour/",
    hero: "https://www.cisticolatours.com/wp-content/uploads/2016/08/Z62_2529.jpg",
    gallery: "https://www.cisticolatours.com/wp-content/uploads/2022/08/Z62_5103.jpg",
    endemicGallery: "https://endemicbirds.co.tz/wp-content/uploads/2025/02/MG_0092-scaled.jpg",
  },
  {
    slug: "7-days-tanzania-budget-birding",
    referenceUrl: "https://www.cisticolatours.com/tanzania-budget-birding-tour/",
    hero: "https://www.cisticolatours.com/wp-content/uploads/2022/04/Z62_8304.jpg",
    gallery: "https://www.cisticolatours.com/wp-content/uploads/2022/01/Z62_5328.jpg",
    endemicGallery: "https://endemicbirds.co.tz/wp-content/uploads/2025/02/DSC_7567-1-scaled.jpg",
  },
  {
    slug: "13-days-northern-tanzania-birding",
    referenceUrl: "https://www.birdquest-tours.com/birding-tours/tanzania-northern/",
    hero: "https://www.birdquest-tours.com/wp-content/uploads/2019/06/Fischers-Lovebird-Tanzania-Pete-Morris.jpg",
    gallery: "https://www.birdquest-tours.com/wp-content/uploads/2026/04/Sentinel-Lark-Northern-Tanzania-2026-Nik-Borrow.jpg",
    endemicGallery: "https://endemicbirds.co.tz/wp-content/uploads/2025/02/BeeslleysLark.jpg",
  },
  {
    slug: "23-days-ultimate-tanzania-birding",
    referenceUrl: "https://www.birdquest-tours.com/birding-tours/tanzania-ultimate/",
    hero: "https://www.birdquest-tours.com/wp-content/uploads/2023/01/Udzungwa-Forest-Partridge-Luala-Valley-JO.jpg",
    gallery: "https://www.birdquest-tours.com/wp-content/uploads/2023/01/Pemba-White-eye2-Pemba-Island-JO.jpg",
    endemicGallery: "https://endemicbirds.co.tz/wp-content/uploads/2025/02/Spotthroat2-1.jpg",
  },
];

async function download(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 4000) throw new Error(`${url} too small`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return { bytes: buf.length, url };
}

async function main() {
  const packages = JSON.parse(fs.readFileSync(packagesPath, "utf8"));
  const report = [];

  for (const plan of PLAN) {
    const pkg = packages.find((p) => p.slug === plan.slug);
    if (!pkg) {
      report.push({ slug: plan.slug, error: "missing package" });
      continue;
    }
    const relHero = `assets/images/packages/${plan.slug}/hero.jpg`;
    const relG1 = `assets/images/packages/${plan.slug}/gallery-1.jpg`;
    const absHero = path.join(root, relHero);
    const absG1 = path.join(root, relG1);
    const row = { slug: plan.slug, referenceUrl: plan.referenceUrl, hero: null, gallery: null };

    try {
      row.hero = await download(plan.hero, absHero);
      try {
        row.gallery = await download(plan.gallery, absG1);
      } catch {
        row.gallery = await download(plan.endemicGallery, absG1);
        row.galleryFallback = "endemicbirds.co.tz";
      }
      pkg.heroImage = relHero;
      pkg.gallery = [relHero, relG1];
      pkg.contentSource = pkg.contentSource || { type: "reference-import" };
      pkg.contentSource.referenceImageUrls = {
        hero: plan.hero,
        gallery: row.gallery?.url || plan.gallery,
        referencePage: plan.referenceUrl,
        endemicSecondary: plan.endemicGallery,
        assignedAt: new Date().toISOString(),
      };
      pkg.contentSource.imagePolicy =
        "Hero and primary gallery from import reference URLs; replace with Endemic Birds photography when owner supplies licensed files.";
      report.push(row);
    } catch (e) {
      report.push({ slug: plan.slug, error: String(e.message || e) });
    }
  }

  fs.writeFileSync(packagesPath, JSON.stringify(packages, null, 2) + "\n", "utf8");
  const out = path.join(root, "content", "reference-import-images-report.json");
  fs.writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), report }, null, 2) + "\n", "utf8");
  console.log("Wrote", out);
  report.forEach((r) => (r.error ? console.error(r.slug, r.error) : console.log(r.slug, "OK", r.hero?.bytes, r.gallery?.bytes)));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});