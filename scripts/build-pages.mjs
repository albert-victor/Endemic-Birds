import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(root, "content", name), "utf8"));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function detailShell({ title, description, bodyAttrs, mainExtra = "", depth = 2 }) {
  const assetPrefix = "../".repeat(depth);
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="" data-canonical />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Marck+Script&display=swap"
      rel="stylesheet"
    />
    <link rel="icon" href="${assetPrefix}assets/images/from-live-site/brand/bird-logo.png" />
    <link rel="stylesheet" href="${assetPrefix}assets/css/styles.css" />
  </head>
  <body class="has-grain" ${bodyAttrs}>
    <a class="skip-link" href="#main">Skip to main content</a>
    <div id="site-header"></div>
    <main id="main">${mainExtra}</main>
    <div id="site-footer"></div>
    <a class="fab-whatsapp" href="https://wa.me/255627013348" aria-label="Chat on WhatsApp">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.511-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    </a>
    <script>window.__ASSET_PREFIX__ = ${JSON.stringify(assetPrefix)};</script>
    <script src="${assetPrefix}assets/js/package-visits.js" defer></script>
    <script src="${assetPrefix}assets/js/ui-cards.js" defer></script>
    <script src="${assetPrefix}assets/js/layout.js" defer></script>
    <script src="${assetPrefix}assets/js/site-search.js" defer></script>
    <script src="${assetPrefix}assets/js/motion.js" defer></script>
    <script src="${assetPrefix}assets/js/scroll-gallery.js" defer></script>
    <script src="${assetPrefix}assets/js/detail.js" defer></script>
    <script src="${assetPrefix}assets/js/main.js" defer></script>
  </body>
</html>
`;
}

const packages = readJson("packages.json");
const destinations = readJson("destinations.json");
const wildlifeDestinations = readJson("wildlife-destinations.json");
const wildlifeActivities = readJson("wildlife-activities.json");
const circuitSiteSources = [
  { file: "southern-sites.json", circuit: "southern" },
  { file: "western-sites.json", circuit: "western" },
  { file: "northern-sites.json", circuit: "northern" },
];
const allCircuitSites = circuitSiteSources.flatMap(({ file, circuit }) => {
  const data = readJson(file);
  return (data.sites || []).map((site) => ({ site, data, circuit }));
});

for (const pkg of packages) {
  const dir = path.join(root, "packages", pkg.slug);
  ensureDir(dir);
  const html = detailShell({
    title: pkg.seo.title,
    description: pkg.seo.description,
    bodyAttrs: `data-nav="" data-detail="package" data-slug="${pkg.slug}"`,
    depth: 2,
  });
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
}

for (const dest of destinations) {
  const dir = path.join(root, "destinations", dest.slug);
  ensureDir(dir);
  const html = detailShell({
    title: dest.seo.title,
    description: dest.seo.description,
    bodyAttrs: `data-nav="destinations" data-detail="destination" data-slug="${dest.slug}"`,
    depth: 2,
  });
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
}

for (const { site, data, circuit } of allCircuitSites) {
  const dir = path.join(root, "destinations", site.slug);
  ensureDir(dir);
  const title = `${site.name} Birding | ${data.circuit} Tanzania | Endemic Birds`;
  const description = site.summary.slice(0, 155);
  const detailType = circuit === "southern" ? "southern-site" : "circuit-site";
  const html = detailShell({
    title,
    description,
    bodyAttrs: `data-nav="destinations" data-detail="${detailType}" data-circuit="${circuit}" data-slug="${site.slug}"`,
    depth: 2,
  });
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
}

for (const dest of wildlifeDestinations) {
  const dir = path.join(root, "wildlife", "destinations", dest.slug);
  ensureDir(dir);
  const html = detailShell({
    title: dest.seo.title,
    description: dest.seo.description,
    bodyAttrs: `data-nav="wildlife" data-detail="wildlife-destination" data-slug="${dest.slug}"`,
    depth: 3,
  });
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
}

for (const act of wildlifeActivities) {
  const dir = path.join(root, "wildlife", "activities", act.slug);
  ensureDir(dir);
  const html = detailShell({
    title: act.seo.title,
    description: act.seo.description,
    bodyAttrs: `data-nav="wildlife" data-detail="wildlife-activity" data-slug="${act.slug}"`,
    depth: 3,
  });
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
}

const sitemapUrls = [
  "/index.html",
  "/birding/index.html",
  "/wildlife/index.html",
  "/combined/index.html",
  "/packages/index.html",
  "/destinations/index.html",
  "/destinations/birding/index.html",
  "/about/index.html",
  "/plan-your-trip/index.html",
  ...packages.map((p) => `/packages/${p.slug}/`),
  ...destinations.map((d) => `/destinations/${d.slug}/`),
  ...allCircuitSites.map(({ site }) => `/destinations/${site.slug}/`),
  ...wildlifeDestinations.map((d) => `/wildlife/destinations/${d.slug}/`),
  ...wildlifeActivities.map((a) => `/wildlife/activities/${a.slug}/`),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((loc) => `  <url><loc>${loc}</loc></url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap, "utf8");

console.log(
  `Generated ${packages.length} package pages, ${destinations.length} destination pages, ${allCircuitSites.length} circuit site pages, ${wildlifeDestinations.length} wildlife destinations, ${wildlifeActivities.length} wildlife activities.`
);
