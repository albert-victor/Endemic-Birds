import fs from "fs";
import path from "path";

const root = process.cwd();

function walkHtml(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkHtml(p, acc);
    else if (e.name === "index.html") acc.push(p);
  }
  return acc;
}

const allHtml = walkHtml(root).filter(
  (p) => !p.includes("node_modules") && !p.includes(`${path.sep}content${path.sep}scrapes`)
);

const emptyMain = allHtml.filter((p) => {
  const t = fs.readFileSync(p, "utf8");
  return /<main[^>]*id=["']main["'][^>]*>\s*<\/main>/s.test(t);
});

function loadJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, "content", rel), "utf8"));
}

const packages = loadJson("packages.json");
const destinations = loadJson("destinations.json");
const wildlifeDests = loadJson("wildlife-destinations.json");
const wildlifeActs = loadJson("wildlife-activities.json");
const accData = loadJson("accommodations.json");
const accList = accData.accommodations || [];

const northern = loadJson("northern-sites.json");
const southern = loadJson("southern-sites.json");
const western = loadJson("western-sites.json");
const circuitSites = new Map();
for (const [key, data] of [
  ["northern", northern],
  ["southern", southern],
  ["western", western],
]) {
  for (const s of data.sites || []) circuitSites.set(s.slug, key);
}

const pkgSlugs = new Set(packages.map((p) => p.slug));
const destSlugs = new Set(destinations.map((d) => d.slug));
const wDestSlugs = new Set(wildlifeDests.map((d) => d.slug));
const wActSlugs = new Set(wildlifeActs.map((a) => a.slug));
const accVerified = new Set(accList.filter((a) => a.verified).map((a) => a.slug));

const detailPages = [];
for (const file of allHtml) {
  const t = fs.readFileSync(file, "utf8");
  const mType = t.match(/data-detail=["']([^"']+)["']/);
  const mSlug = t.match(/data-slug=["']([^"']+)["']/);
  if (!mType || !mSlug) continue;
  detailPages.push({
    file: path.relative(root, file).replace(/\\/g, "/"),
    type: mType[1],
    slug: mSlug[1],
  });
}

const byType = {};
for (const p of detailPages) {
  byType[p.type] = (byType[p.type] || 0) + 1;
}

const wouldFail = [];
const wouldWork = [];
const accEmptyMain = [];

for (const p of detailPages) {
  let ok = false;
  switch (p.type) {
    case "package":
      ok = pkgSlugs.has(p.slug);
      break;
    case "destination":
      ok = destSlugs.has(p.slug);
      break;
    case "circuit-site":
    case "southern-site":
      ok = circuitSites.has(p.slug);
      break;
    case "wildlife-destination":
      ok = wDestSlugs.has(p.slug);
      break;
    case "wildlife-activity":
      ok = wActSlugs.has(p.slug);
      break;
    case "accommodation":
      ok = accVerified.has(p.slug);
      if (!ok) accEmptyMain.push(p);
      break;
    default:
      ok = true;
  }
  if (ok) wouldWork.push(p);
  else wouldFail.push(p);
}

const hubPages = allHtml.length - detailPages.length - (allHtml.some((p) => p.includes("demo\\placehold")) ? 0 : 0);
const hubWithContent = allHtml.filter((p) => {
  const t = fs.readFileSync(p, "utf8");
  return /<main[^>]*id=["']main["'][^>]*>[\s\S]{20,}<\/main>/s.test(t);
});

const result = {
  placeholderSasaHivi: {
    liveOnPublicSite: "detail.js + accommodation-detail.js (not-found) + 404.html",
    previewDemo: ["demo/placehold-page.html"],
    note: "Zaidi ya kurasa 92 zenye JSON hazionyeshi placeholder – tu slug missing (≈10) au URL isiyopo",
  },
  whatVisitorsSeeTodayWhenBad: {
    cinematicPlaceholderInsteadOfPlainHeading: wouldFail.filter((p) => p.type !== "accommodation").length,
    accommodationMainStaysEmpty: accEmptyMain.length,
    examplesPlainHeading: wouldFail.filter((p) => p.type !== "accommodation").slice(0, 8).map((p) => `${p.file} → “${p.type} not found” style`),
    examplesEmptyMain: accEmptyMain.map((p) => p.file),
  },
  ifWeApplyPlaceholderOnlyToThoseFailures: {
    count: wouldFail.length,
    urls: wouldFail.map((p) => p.file),
    breakdown: Object.fromEntries(
      Object.keys(byType).map((k) => [
        k,
        {
          totalPages: byType[k],
          wouldUsePlaceholder: wouldFail.filter((p) => p.type === k).length,
        },
      ])
    ),
  },
  healthyDetailPagesWithRealContent: {
    count: wouldWork.length,
    byType: Object.fromEntries(
      Object.keys(byType).map((k) => [k, wouldWork.filter((p) => p.type === k).length])
    ),
  },
  siteTotals: {
    indexHtmlFiles: allHtml.length,
    hubPagesWithContentInMain: hubWithContent.length,
    detailShellPages: detailPages.length,
    detailShellWithEmptyMainAtLoad: emptyMain.length,
  },
  notPlaceholder: [
    "Home, birding hub, packages list, about, plan-your-trip, n.k. – maudhui tayari",
    "catalog-empty – mstari ndani ya grid, si ukurasa mzima",
    "URL totally wrong (e.g. /foo) → 404.html (serve static)",
  ],
};

console.log(JSON.stringify(result, null, 2));