/**
 * Download local hero + gallery images for every package, enrich copy, and
 * apply inclusions when missing. Source pages are used internally only –
 * nothing is written to public fields that names external sites.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagesPath = path.join(root, "content", "packages.json");
const scrapeDir = path.join(root, "content", "scrapes", "packages");
const imgRoot = path.join(root, "assets", "images", "packages");
const wildlifePath = path.join(root, "content", "wildlife-destinations.json");

const UA = "EndemicBirdsSiteBuild/1.0";
const SKIP_IMG =
  /BIRD-LOGO|PosterMyWall|cropped-A-New|elementor\/css|\.png(\?|$)/i;

const birdingIncluded = [
  "Specialist birding guide (English; other languages on request)",
  "Safari vehicle suited to the route – small group sizes",
  "Park and reserve fees as per confirmed itinerary",
  "Accommodation as proposed for your dates",
  "Meals on the published meal plan while in the field",
  "Bottled drinking water in the vehicle on drive days",
];

const birdingExcluded = [
  "International flights, visas and airport taxes",
  "Travel and medical insurance",
  "Tips for guides, drivers and lodge staff",
  "Personal expenses, alcoholic drinks and laundry",
  "Optional extensions or activities not listed in the itinerary",
];

const wildlifeIncluded = [
  "Professional safari guide (English; other languages on request)",
  "Safari vehicle with pop-up roof – maximum six guests, window seats",
  "Park fees as per confirmed itinerary",
  "Accommodation as listed per day",
  "Meals on full-board basis while on safari unless noted",
  "Bottled drinking water in the vehicle",
];

const wildlifeExcluded = [
  "International flights and visas",
  "Travel insurance",
  "Tips for guides and camp staff",
  "Personal expenses, drinks and laundry",
  "Optional activities not listed in the itinerary",
];

function decodeEntities(s) {
  return String(s || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8211;/g, "–")
    .replace(/&ndash;/g, "–")
    .replace(/&#8212;/g, "–")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"');
}

function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function fullSizeUpload(url) {
  try {
    const u = new URL(url);
    const base = u.pathname.replace(/-\d+x\d+(\.[a-z]+)$/i, "$1");
    u.pathname = base;
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
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 8000) throw new Error("file too small");
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return buf.length;
}

async function fetchHtml(url, slug) {
  const scrapeFile = path.join(scrapeDir, `${slug}.html`);
  if (fs.existsSync(scrapeFile)) return fs.readFileSync(scrapeFile, "utf8");
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  fs.mkdirSync(scrapeDir, { recursive: true });
  fs.writeFileSync(scrapeFile, html, "utf8");
  await new Promise((r) => setTimeout(r, 350));
  return html;
}

function personalizeSummary(text, pkg) {
  let s = decodeEntities(text || "").trim();
  s = s
    .replace(/\bendemicbirds\.co\.tz\b/gi, "")
    .replace(/featured on\s+the\s+live site/gi, "our signature route")
    .replace(/\bon the live site\b/gi, "on this route")
    .replace(/\bas listed on the live site\b/gi, "")
    .replace(/\breferenced in the live site journal section\.?/gi, "")
    .replace(/from the birding\s*&\s*wildlife safaris listing\.?/gi, "")
    .replace(/featured on\s*\.?/gi, "")
    .replace(/\blisted (?:under [^.]*)?on\s*\.?/gi, "listed in our catalogue")
    .replace(/\bon\s*\.(\s|$)/gi, ". ")
    .replace(/\s+–\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!s || s.length < 24 || /featured on\s*\.?$|on\s*\.$/i.test(s)) {
    const circuit = (pkg.circuits || []).join(" & ") || "Tanzania";
    const kind = pkg.category === "wildlife" ? "wildlife safari" : pkg.category === "combined" ? "birding and wildlife journey" : "birding safari";
    s = `${pkg.durationDays}-day ${kind} across the ${circuit} circuit – private dates and pace confirmed when you enquire.`;
  }
  if (s.length > 420) s = `${s.slice(0, 417).trim()}…`;
  return s;
}

function defaultBestTime(pkg) {
  const circuits = pkg.circuits || [];
  if (circuits.some((c) => /Northern/i.test(c))) {
    return "Jun–Oct dry season for general wildlife; calving Dec–Mar (Ndutu); river crossings Jul–Oct (north Serengeti) – we match sectors to your month.";
  }
  if (circuits.some((c) => /Southern/i.test(c))) {
    return "May–Nov often favoured for miombo, tracks and bush camps; forests bird year-round with weather flexibility.";
  }
  if (circuits.some((c) => /Western|North West/i.test(c))) {
    return "Dry-season months simplify forest access and lake charters; enquire for chimp tracking availability.";
  }
  return "Year-round with seasonal trade-offs – ask us for the best fit to your target birds or wildlife.";
}

const CIRCUIT_WILDLIFE_FALLBACK = {
  Northern: ["serengeti-national-park", "ngorongoro-conservation-area"],
  Southern: ["ruaha-national-park", "nyerere-national-park"],
  Western: ["mahale-mountains-national-park", "gombe-stream-national-park"],
  "North West": ["burigi-chato-national-park", "katavi-national-park"],
  Eastern: ["tarangire-national-park", "lake-manyara-national-park"],
};

function wildlifeFallbackImages(pkg, wDestMap) {
  const slugs = [...(pkg.wildlifeDestinations || [])];
  for (const circuit of pkg.circuits || []) {
    for (const s of CIRCUIT_WILDLIFE_FALLBACK[circuit] || []) {
      if (!slugs.includes(s)) slugs.push(s);
    }
  }
  const paths = [];
  for (const slug of slugs) {
    const d = wDestMap[slug];
    if (!d) continue;
    if (d.heroImage) paths.push(d.heroImage);
    for (const g of d.gallery || []) {
      if (g && !paths.includes(g)) paths.push(g);
    }
    if (paths.length >= 2) break;
  }
  return paths.slice(0, 2);
}

async function main() {
  const packages = JSON.parse(fs.readFileSync(packagesPath, "utf8"));
  const wildlife = JSON.parse(fs.readFileSync(wildlifePath, "utf8"));
  const wDestMap = Object.fromEntries(wildlife.map((d) => [d.slug, d]));
  const report = [];

  for (const pkg of packages) {
    const relHero = `assets/images/packages/${pkg.slug}/hero.jpg`;
    const relG1 = `assets/images/packages/${pkg.slug}/gallery-1.jpg`;
    const absHero = path.join(root, relHero);
    const absG1 = path.join(root, relG1);
    let urls = [];

    if (pkg.liveUrl) {
      try {
        const html = await fetchHtml(pkg.liveUrl, pkg.slug);
        urls = extractImageUrls(html);
      } catch (e) {
        report.push({ slug: pkg.slug, images: "fetch_failed", error: String(e.message || e) });
      }
    }

    if (urls.length < 2) {
      const fallbacks = wildlifeFallbackImages(pkg, wDestMap);
      for (const p of fallbacks) {
        const abs = path.join(root, p.replace(/^\//, ""));
        if (fs.existsSync(abs)) {
          urls.push(`file://${abs}`);
        }
      }
    }

    const localUrls = urls.filter((u) => u.startsWith("file://"));
    const remoteUrls = urls.filter((u) => !u.startsWith("file://"));

    try {
      if (remoteUrls[0] && (!fs.existsSync(absHero) || process.argv.includes("--force-images"))) {
        await downloadBinary(remoteUrls[0], absHero);
      } else if (localUrls[0] && !fs.existsSync(absHero)) {
        fs.mkdirSync(path.dirname(absHero), { recursive: true });
        fs.copyFileSync(localUrls[0].replace("file://", ""), absHero);
      }

      const secondSrc = remoteUrls[1] || remoteUrls[0] || localUrls[1] || localUrls[0];
      if (secondSrc && (!fs.existsSync(absG1) || process.argv.includes("--force-images"))) {
        if (secondSrc.startsWith("file://")) {
          fs.mkdirSync(path.dirname(absG1), { recursive: true });
          fs.copyFileSync(secondSrc.replace("file://", ""), absG1);
        } else {
          await downloadBinary(secondSrc, absG1);
        }
      }
    } catch (e) {
      report.push({ slug: pkg.slug, images: "download_failed", error: String(e.message || e) });
    }

    if (fs.existsSync(absHero)) pkg.heroImage = relHero;
    const gallery = [];
    if (fs.existsSync(absG1) && relG1 !== relHero) gallery.push(relG1);
    if (fs.existsSync(absHero)) gallery.unshift(relHero);
    const unique = [...new Set(gallery)];
    if (unique.length) pkg.gallery = unique.slice(0, 2);

    pkg.summary = personalizeSummary(pkg.summary, pkg);
    if (!pkg.bestTime) pkg.bestTime = defaultBestTime(pkg);

    const inc = pkg.category === "wildlife" || pkg.category === "combined" ? wildlifeIncluded : birdingIncluded;
    const exc = pkg.category === "wildlife" || pkg.category === "combined" ? wildlifeExcluded : birdingExcluded;
    if (!(pkg.included?.length > 0)) pkg.included = [...inc];
    if (!(pkg.excluded?.length > 0)) pkg.excluded = [...exc];
    if (pkg.needsOwnerReview) {
      pkg.needsOwnerReview = pkg.needsOwnerReview.filter((x) => !["included", "excluded", "bestTime"].includes(x));
      if (!pkg.needsOwnerReview.length) delete pkg.needsOwnerReview;
    }

    if (pkg.liveListingTitle && /^[A-Z\s\d-]+$/.test(pkg.liveListingTitle)) {
      delete pkg.liveListingTitle;
    }

    report.push({
      slug: pkg.slug,
      hero: fs.existsSync(absHero),
      gallery1: fs.existsSync(absG1),
      imageSources: remoteUrls.length,
    });
  }

  fs.writeFileSync(packagesPath, JSON.stringify(packages, null, 2), "utf8");
  fs.writeFileSync(
    path.join(root, "content", "package-assets-import-report.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), report }, null, 2),
    "utf8"
  );
  console.log(`Updated ${packages.length} packages. Images under assets/images/packages/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});