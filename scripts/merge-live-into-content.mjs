import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const URL_SLUG_ALIASES = {
  "22-days-endemic-birding-tour": "22-days-endemic-birding-tours",
  "tanzania-birding-tour": "15-days-tanzania-birding-tour",
  "20-day-itinerary-for-endemic-birds-in-tanzania-2": "20-day-endemic-birding-tanzania",
  "20-day-itinerary-for-endemic-birds-in-southern-tanzania": "20-day-endemic-birds-southern",
  "12-day-itinerary-for-endemic-birds-in-northern-tanzania": "12-day-endemic-birds-northern",
  "10-day-birding-safaris-eastern-tanzania": "10-day-birding-northern-eastern",
  "10-day-birding-safari-itinerary-in-southeast-tanzania": "10-day-birding-southeast",
  "7-days-wildebeest-migration-calving-safari-and-hadzabe": "7-days-wildebeest-migration-hadzabe",
  "8-days-great-wildebeest-calving-migration-safari": "8-days-wildebeest-calving-migration",
  "8-days-wildebeest-migration-calving-safari-and-hadzabe": "8-days-wildebeest-calving-migration",
  "9-days-tanzania-wildlife-safari-and-zanzibar-beach-holiday": "9-days-wildlife-safari-zanzibar",
  "10-days-tanzania-luxury-flying-safari": "10-days-luxury-flying-safari",
  "10-day-birdwatching-safari-in-northern-tanzania": "10-day-birdwatching-northern",
  "9-days-birding-itinerary-for-mahale-gombe-burigi-chato-and-minziro-forest":
    "9-days-mahale-gombe-burigi-minziro",
  "7-days-itinerary-from-mpanda-to-inyonga-rungwe-bitimanyanga-chunya-kituro-and-mbeya":
    "7-days-mpanda-to-mbeya",
  "15-days-birding-and-wildlife-photographic": "15-days-birding-wildlife-photographic",
  "22-days-birding-itinerary-for-north-east-south-and-pemba": "22-days-birding-itinerary-north-east-south-pemba",
  "birding-around-iringa": "8-days-birding-around-iringa",
  "6-days-tanzania-safari": "6-days-tanzania-safari",
};

const DEST_LIVE_URLS = {
  northern: "https://endemicbirds.co.tz/index.php/northern-destination/",
  southern: "https://endemicbirds.co.tz/index.php/southern-destination/",
  "eastern-arc": "https://endemicbirds.co.tz/index.php/southern-destinations/",
  western: "https://endemicbirds.co.tz/index.php/birding-in-west-tanzania/",
  "north-west": "https://endemicbirds.co.tz/index.php/birding-in-north-west-tanzania/",
  eastern: "https://endemicbirds.co.tz/index.php/eastern-destination/",
};

function slugFromLiveUrl(liveUrl) {
  if (!liveUrl) return null;
  try {
    const seg = new URL(liveUrl).pathname.split("/").filter(Boolean).pop();
    return URL_SLUG_ALIASES[seg] || seg;
  } catch {
    return null;
  }
}

function normalizeTitle(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const live = JSON.parse(fs.readFileSync(path.join(root, "content", "live-extract.json"), "utf8"));
const packages = JSON.parse(fs.readFileSync(path.join(root, "content", "packages.json"), "utf8"));
const destinations = JSON.parse(fs.readFileSync(path.join(root, "content", "destinations.json"), "utf8"));
const site = JSON.parse(fs.readFileSync(path.join(root, "content", "site.json"), "utf8"));

const bySlug = new Map(packages.map((p) => [p.slug, p]));
const byTitle = new Map(packages.map((p) => [normalizeTitle(p.title), p]));

const unmatched = [];

for (const item of live.packages) {
  if (item.kind === "destination-card") continue;
  if (!item.liveUrl) {
    unmatched.push({ ...item, reason: "no-url-on-live-card" });
    continue;
  }
  const slug = slugFromLiveUrl(item.liveUrl);
  let pkg = bySlug.get(slug);
  if (!pkg) {
    pkg = byTitle.get(normalizeTitle(item.title));
  }
  if (!pkg && item.title) {
    const days = item.title.match(/(\d+)\s*-?\s*day/i)?.[1];
    if (days) {
      pkg = packages.find(
        (p) => p.durationDays === Number(days) && normalizeTitle(p.title).includes(normalizeTitle(item.title).slice(0, 20))
      );
    }
  }
  if (pkg) {
    pkg.liveUrl = item.liveUrl;
    pkg.liveListingTitle = item.title;
  } else {
    unmatched.push(item);
  }
}

if (!bySlug.has("22-days-birding-itinerary-north-east-south-pemba")) {
  const blog = live.packages.find((p) =>
    p.liveUrl?.includes("22-days-birding-itinerary-for-north-east-south-and-pemba")
  );
  if (blog) {
    packages.push({
      id: "22-days-birding-itinerary-north-east-south-pemba",
      slug: "22-days-birding-itinerary-north-east-south-pemba",
      title: "22 Days Birding Itinerary for North, East, South and Pemba",
      category: "birding",
      durationDays: 22,
      destinations: ["northern", "eastern", "southern", "eastern"],
      circuits: ["Northern", "Eastern", "Southern"],
      summary:
        "Multi-region birding route covering north, east, south and Pemba – listed on the live site as a dedicated itinerary article.",
      heroImage: "assets/images/from-live-site/packages/22-days-endemic-birding-tours.jpg",
      featured: false,
      verified: true,
      liveUrl: blog.liveUrl,
      liveListingTitle: blog.title,
      itinerary: [],
      highlights: { birding: [], wildlife: [] },
      included: [],
      excluded: [],
      bestTime: null,
      needsOwnerReview: ["itinerary", "distinction from 22-day endemic birding tour"],
      seo: {
        title: "22 Days North, East, South & Pemba Birding | Endemic Birds",
        description: "22-day birding itinerary across Tanzania and Pemba from Endemic Birds.",
      },
    });
  }
}

if (!bySlug.get("8-days-birding-around-iringa")?.liveUrl) {
  const iringa = live.packages.find((p) => /iringa/i.test(p.title));
  if (iringa) {
    const pkg = bySlug.get("8-days-birding-around-iringa");
    if (pkg) {
      pkg.liveListingTitle = iringa.title;
      pkg.liveUrlNote = "Live card links to homepage; confirm dedicated page URL with owner.";
    }
  }
}

for (const dest of destinations) {
  if (DEST_LIVE_URLS[dest.id]) dest.liveUrl = DEST_LIVE_URLS[dest.id];
}
destinations.forEach((dest) => {
  if (dest.id === "southern") {
    dest.liveAlternateUrls = [
      "https://endemicbirds.co.tz/index.php/southern-circuit-1/",
    ];
  }
  if (dest.id === "eastern") {
    dest.liveAlternateUrls = [
      "https://endemicbirds.co.tz/index.php/south-east-birding-destination/",
    ];
  }
});

site.contact = { ...site.contact, ...live.contact };
site.about = live.about;
site.destinationPages = live.destinationPages;
site.social = {
  facebook: null,
  twitter: null,
  instagram: null,
  linkedin: null,
  youtube: null,
};
for (const s of live.social) {
  if (site.social[s.platform] !== undefined) site.social[s.platform] = s.href;
}
site.socialNote =
  "Live endemicbirds.co.tz footer uses social icons with href=\"#\" placeholders – profile URLs were not published at scrape time.";

fs.writeFileSync(path.join(root, "content", "packages.json"), JSON.stringify(packages, null, 2) + "\n", "utf8");
fs.writeFileSync(path.join(root, "content", "destinations.json"), JSON.stringify(destinations, null, 2) + "\n", "utf8");
fs.writeFileSync(path.join(root, "content", "site.json"), JSON.stringify(site, null, 2) + "\n", "utf8");

const report = {
  mergedAt: new Date().toISOString(),
  packagesWithLiveUrl: packages.filter((p) => p.liveUrl).length,
  totalPackages: packages.length,
  unmatchedLivePackages: unmatched,
};
fs.writeFileSync(path.join(root, "content", "live-merge-report.json"), JSON.stringify(report, null, 2) + "\n", "utf8");

console.log("Packages with liveUrl:", report.packagesWithLiveUrl, "/", report.totalPackages);
console.log("Unmatched:", unmatched.length);
if (unmatched.length) unmatched.forEach((u) => console.log(" -", u.title, u.liveUrl || u.reason));
