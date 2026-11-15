/** Dev helper: print static subpage HTML. Run: node assets/js/about-subpage-shell.mjs */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");

const slugs = [
  "why-choose-us",
  "team",
  "leons-mlawila",
  "trip-reports",
  "tour-training",
  "partners",
  "policies",
  "tour-calendar",
];

const titles = {
  "why-choose-us": "Why Choose Us",
  team: "Our Team",
  "leons-mlawila": "Leons Mlawila",
  "trip-reports": "Trip Reports",
  "tour-training": "Tour Training",
  partners: "Our Partners",
  policies: "Terms & Policies",
  "tour-calendar": "Tour Calendar",
};

function shell(slug, title) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} | Endemic Birds Tanzania</title>
    <meta name="description" content="${title} – Endemic Birds Tanzania, specialist birding safaris from Iringa." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Marck+Script&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
      rel="stylesheet"
    />
    <link rel="icon" href="../../assets/images/from-live-site/brand/bird-logo.png" />
    <link rel="stylesheet" href="../../assets/css/styles.css" />
    <link rel="stylesheet" href="../../assets/css/about-page.css" />
  </head>
  <body class="has-grain about-subpage" data-nav="about" data-about-sub="${slug}">
    <a class="skip-link" href="#main">Skip to main content</a>
    <div id="site-header"></div>
    <main id="main">
      <section class="section about-sub-section" style="padding-top: 7rem">
        <div class="container about-sub-container" data-about-sub-mount aria-busy="true">
          <p class="about-sub-loading">Loading…</p>
        </div>
      </section>
    </main>
    <div id="site-footer"></div>
    <script>window.__ASSET_PREFIX__ = "../../";</script>
    <script src="../../assets/js/layout.js" defer></script>
    <script src="../../assets/js/site-search.js" defer></script>
    <script src="../../assets/js/motion.js" defer></script>
    <script src="../../assets/js/about-credibility.js" defer></script>
    <script src="../../assets/js/about-subpage.js" defer></script>
    <script src="../../assets/js/main.js" defer></script>
  </body>
</html>
`;
}

for (const slug of slugs) {
  const dir = path.join(root, "about", slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), shell(slug, titles[slug]), "utf8");
}
console.log(`Wrote ${slugs.length} about subpages.`);