/**
 * Assign hero + gallery from Endemic Birds live scrapes / owned assets
 * for reference-imported packages (no third-party operator images).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagesPath = path.join(root, "content", "packages.json");
const scrapeDir = path.join(root, "content", "scrapes", "packages");
const UA = "EndemicBirdsSiteBuild/1.0";
const SKIP_IMG =
  /BIRD-LOGO|PosterMyWall|cropped-A-New|elementor\/css|\.png(\?|$)/i;

function fullSizeUpload(url) {
  try {
    const u = new URL(url);
    u.pathname = u.pathname.replace(/-\d+x\d+(\.[a-z]+)$/i, "$1");
    return u.href;
  } catch {
    return url.replace(/-\d+x\d+(\.[a-z]+)(\?|$)/i, "$1$2");
  }
}

function extractImageUrls(html) {
  const found = [];
  const re =
    /(?:src|href)=["'](https:\/\/endemicbirds\.co\.tz\/wp-content\/uploads\/[^"']+\.(?:jpe?g|webp)(?:\?[^"']*)?)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    const url = fullSizeUpload(m[1]);
    if (SKIP_IMG.test(url)) continue;
    if (!found.includes(url)) found.push(url);
  }
  return found;
}

async function downloadBinary(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 6000) throw new Error(`file too small ${url}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return buf.length;
}

function readScrapeImages(scrapeSlug) {
  const file = path.join(scrapeDir, `${scrapeSlug}.html`);
  if (!fs.existsSync(file)) return [];
  return extractImageUrls(fs.readFileSync(file, "utf8"));
}

function copyLocal(relSrc, relDest) {
  const absSrc = path.join(root, relSrc);
  const absDest = path.join(root, relDest);
  if (!fs.existsSync(absSrc)) throw new Error(`missing ${relSrc}`);
  fs.mkdirSync(path.dirname(absDest), { recursive: true });
  fs.copyFileSync(absSrc, absDest);
}

/** @type {Record<string, { scrapeSlug?: string, liveUrl?: string, localHero?: string, localGallery?: string, preferUrls?: string[] }>} */
const PLAN = {
  "15-days-tanzania-birding-tour": {
    scrapeSlug: "15-days-tanzania-birding-tour",
    liveUrl: "https://endemicbirds.co.tz/index.php/tanzania-birding-tour/",
  },
  "13-days-northern-tanzania-birding": {
    scrapeSlug: "12-day-endemic-birds-northern",
    liveUrl: "https://endemicbirds.co.tz/index.php/12-day-itinerary-for-endemic-birds-in-northern-tanzania/",
    preferUrls: ["BeeslleysLark", "MG_0822"],
  },
  "7-days-tanzania-budget-birding": {
    scrapeSlug: "10-day-birding-northern-eastern",
    liveUrl: "https://endemicbirds.co.tz/index.php/10-day-birding-safaris-eastern-tanzania/",
    preferUrls: ["Spotthroat", "Greenbul", "Usambara", "Amani"],
    localGallery: "assets/images/accommodations/amani-nature-reserve/hero.jpg",
  },
  "23-days-ultimate-tanzania-birding": {
    scrapeSlug: "22-days-birding-itinerary-north-east-south-pemba",
    liveUrl: "https://endemicbirds.co.tz/index.php/2023/09/23/22-days-birding-itinerary-for-north-east-south-and-pemba/",
    preferUrls: ["Pemba", "Udzungwa", "Spotthroat", "BeeslleysLark"],
    localGallery: "assets/images/southern-circuit/udzungwa/hero.jpg",
  },
};

function pickUrls(urls, prefer) {
  if (!prefer?.length) return urls;
  const scored = urls.map((u, i) => {
    const hit = prefer.some((p) => u.includes(p)) ? 0 : 1;
    return { u, i, hit };
  });
  scored.sort((a, b) => a.hit - b.hit || a.i - b.i);
  return scored.map((s) => s.u);
}

async function fetchLiveHtml(liveUrl, slug) {
  const dest = path.join(scrapeDir, `${slug}-live-refresh.html`);
  const res = await fetch(liveUrl, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  fs.writeFileSync(dest, html, "utf8");
  return extractImageUrls(html);
}

async function assignOne(slug, plan) {
  let urls = plan.scrapeSlug ? readScrapeImages(plan.scrapeSlug) : [];
  if (plan.liveUrl) {
    try {
      const liveUrls = await fetchLiveHtml(plan.liveUrl, slug);
      urls = [...new Set([...liveUrls, ...urls])];
    } catch (e) {
      console.warn(`${slug}: live fetch failed:`, e.message);
    }
  }
  urls = pickUrls(urls, plan.preferUrls);

  const relHero = `assets/images/packages/${slug}/hero.jpg`;
  const relG1 = `assets/images/packages/${slug}/gallery-1.jpg`;
  const absHero = path.join(root, relHero);
  const absG1 = path.join(root, relG1);

  if (urls[0]) await downloadBinary(urls[0], absHero);
  else if (plan.localHero) copyLocal(plan.localHero, relHero);
  else throw new Error(`${slug}: no hero source`);

  const secondRemote = urls.find((u) => u !== urls[0]);
  if (secondRemote) await downloadBinary(secondRemote, absG1);
  else if (plan.localGallery) copyLocal(plan.localGallery, relG1);
  else if (urls[0]) await downloadBinary(urls[0], absG1);

  return {
    slug,
    hero: relHero,
    gallery: [relHero, relG1].filter((p, i, a) => a.indexOf(p) === i),
    remoteCount: urls.length,
    sources: urls.slice(0, 3),
  };
}

async function main() {
  const packages = JSON.parse(fs.readFileSync(packagesPath, "utf8"));
  const report = [];

  for (const [slug, plan] of Object.entries(PLAN)) {
    const pkg = packages.find((p) => p.slug === slug);
    if (!pkg) {
      report.push({ slug, error: "package not found" });
      continue;
    }
    if (plan.liveUrl) pkg.liveUrl = plan.liveUrl;
    try {
      const result = await assignOne(slug, plan);
      pkg.heroImage = result.hero;
      pkg.gallery = result.gallery;
      if (pkg.contentSource) {
        pkg.contentSource.imagesAssignedAt = new Date().toISOString();
        pkg.contentSource.imagePolicy = "endemicbirds.co.tz uploads and owned site assets only";
      }
      report.push(result);
    } catch (e) {
      report.push({ slug, error: String(e.message || e) });
    }
  }

  fs.writeFileSync(packagesPath, JSON.stringify(packages, null, 2) + "\n", "utf8");
  const reportPath = path.join(root, "content", "package-images-assign-report.json");
  fs.writeFileSync(
    reportPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), report }, null, 2) + "\n",
    "utf8"
  );
  console.log("Assigned images for", report.filter((r) => !r.error).length, "packages →", reportPath);
  for (const r of report) {
    if (r.error) console.error(r.slug, r.error);
    else console.log(r.slug, "←", r.sources?.[0] || r.hero);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});