import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const scrapeDir = path.join(root, "content", "scrapes");

const PAGE_URLS = {
  home: "https://endemicbirds.co.tz/",
  birding: "https://endemicbirds.co.tz/index.php/tanzania-birding-tours/",
  safaris: "https://endemicbirds.co.tz/index.php/tanzania-birding-safaris/",
  about: "https://endemicbirds.co.tz/index.php/about-endemic-birds-tanzania/",
};

async function ensureScrapes() {
  fs.mkdirSync(scrapeDir, { recursive: true });
  for (const [key, url] of Object.entries(PAGE_URLS)) {
    const file = path.join(scrapeDir, `${key}.html`);
    if (!fs.existsSync(file) || fs.statSync(file).size < 1000) {
      const res = await fetch(url);
      fs.writeFileSync(file, await res.text(), "utf8");
    }
  }
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** Elementor image cards inside wp-caption figures */
function extractFigcaptionPackages(html, source) {
  const items = [];
  const figureRe = /<figure[^>]*class="[^"]*wp-caption[^"]*"[^>]*>([\s\S]*?)<\/figure>/gi;
  let fig;
  while ((fig = figureRe.exec(html))) {
    const block = fig[1];
    const cap = block.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
    if (!cap) continue;
    const title = stripTags(cap[1]);
    if (!title || title.length < 6) continue;
    const link = block.match(/<a[^>]+href=["'](https:\/\/endemicbirds\.co\.tz[^"']+)["']/i);
    let liveUrl = link ? link[1].replace(/\/?$/, "/") : null;
    if (
      liveUrl === "https://endemicbirds.co.tz/" ||
      liveUrl === "https://endemicbirds.co.tz"
    ) {
      liveUrl = null;
    }
    const isDestination =
      /^(Northern|Southern|Eastern|Western|North West|Eastern Arc)/i.test(title) &&
      /destination|mountain|tanzania$/i.test(title);
    items.push({
      title,
      liveUrl,
      source,
      kind: isDestination ? "destination-card" : "package-card",
    });
  }
  return items;
}

function extractBlogTourLinks(html, source) {
  const items = [];
  const re = /href=["'](https:\/\/endemicbirds\.co\.tz\/index\.php\/\d{4}\/\d{2}\/\d{2}\/[^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    const liveUrl = m[1];
    const slug = liveUrl.split("/").filter(Boolean).pop();
    const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    items.push({ title, liveUrl, source, kind: "blog-post" });
  }
  return items;
}

function extractDestinationPages(html) {
  const pages = [];
  const menuBlock = html.match(/menu-quick-link-container[\s\S]{0,4000}/i)?.[0] || "";
  const quickRe =
    /<a[^>]+href=["'](https:\/\/endemicbirds\.co\.tz\/index\.php\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = quickRe.exec(menuBlock))) {
    const liveUrl = m[1].replace(/\/?$/, "/");
    if (/travel-insurance/i.test(liveUrl)) continue;
    pages.push({ title: stripTags(m[2]), liveUrl });
  }
  const homeNames = [
    "Northern Destination",
    "Southern Destination",
    "Eastern Arc Mountain",
    "Western Destination",
    "North West Tanzania",
    "Eastern Destination",
  ];
  const circuits = homeNames.map((name) => ({
    name,
    verifiedOnHome: html.includes(name),
  }));
  return { quickLinks: pages, circuits };
}

function extractSocialPlatforms(html) {
  const platforms = [];
  const iconRe = /<a[^>]+href=["']([^"']*)["'][^>]*>\s*<i class="fa fa-(facebook|twitter|instagram|linkedin|youtube)[^"]*"/gi;
  let m;
  while ((m = iconRe.exec(html))) {
    const href = m[1].trim();
    const platform = m[2] === "twitter" ? "twitter" : m[2];
    platforms.push({
      platform,
      href: href === "#" || href === "# " || href.startsWith("#") ? null : href,
      placeholderOnLiveSite: href === "#" || href === "# " || href.startsWith("#"),
    });
  }
  const byPlatform = new Map();
  for (const p of platforms) {
    if (!byPlatform.has(p.platform)) byPlatform.set(p.platform, p);
  }
  return [...byPlatform.values()];
}

function extractEmails(html) {
  return [...new Set([...html.matchAll(/[\w.+-]+@endemicbirds\.co\.tz/gi)].map((x) => x[0].toLowerCase()))];
}

function extractAboutFromPage(html) {
  const introMatch = html.match(
    /ABOUT ENDEMIC BIRDS TAZANIA[\s\S]{0,4000}?<p[^>]*>([\s\S]*?)<\/p>/i
  );
  const intro = introMatch ? stripTags(introMatch[1]) : "";

  const sections = [];
  const block = html.match(/Indigenous knowledge[\s\S]{0,25000}/i)?.[0] || html;
  const headingRe = /<h2[^>]*class="[^"]*elementor-heading-title[^"]*"[^>]*>([\s\S]*?)<\/h2>/gi;
  let h;
  while ((h = headingRe.exec(block))) {
    const title = stripTags(h[1]);
    if (!title || title.length > 100) continue;
    if (/achieved|e-waste|water conservation|community/i.test(title)) continue;
    const idx = h.index + h[0].length;
    const chunk = block.slice(idx, idx + 3000);
    const pMatch = chunk.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const body = pMatch ? stripTags(pMatch[1]) : "";
    if (body.length > 50) sections.push({ title, body: body.slice(0, 1200) });
  }

  if (sections.length === 0) {
    const headings = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
    for (const item of headings) {
      const title = stripTags(item[1]);
      if (!title || /achieved|e-waste|water|community foresty/i.test(title)) continue;
      const idx = item.index + item[0].length;
      const chunk = html.slice(idx, idx + 2500);
      const p = stripTags(chunk.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] || "");
      if (p.length > 40) sections.push({ title, body: p.slice(0, 1200) });
    }
  }

  return {
    liveUrl: PAGE_URLS.about,
    intro: intro.slice(0, 1500),
    sections,
  };
}

function dedupePackages(list) {
  const map = new Map();
  for (const item of list) {
    const key = item.title.toLowerCase().replace(/\s+/g, " ");
    const prev = map.get(key);
    if (!prev) {
      map.set(key, item);
      continue;
    }
    if (!prev.liveUrl && item.liveUrl) map.set(key, item);
    else if (prev.liveUrl && item.liveUrl && item.liveUrl.length > prev.liveUrl.length) map.set(key, item);
  }
  return [...map.values()].sort((a, b) => a.title.localeCompare(b.title));
}

await ensureScrapes();

const combined = {
  extractedAt: new Date().toISOString(),
  sourcePages: PAGE_URLS,
  packages: [],
  destinationPages: { quickLinks: [], circuits: [] },
  social: [],
  emails: [],
  about: { liveUrl: PAGE_URLS.about, intro: "", sections: [] },
  contact: {},
};

for (const [key, fileName] of Object.entries({
  home: "home.html",
  birding: "birding.html",
  safaris: "safaris.html",
  about: "about.html",
})) {
  const html = fs.readFileSync(path.join(scrapeDir, fileName), "utf8");
  if (key === "home" || key === "birding" || key === "safaris") {
    combined.packages.push(...extractFigcaptionPackages(html, key));
    if (key === "home") combined.packages.push(...extractBlogTourLinks(html, key));
  }
  if (key === "home" || key === "birding" || key === "safaris") {
    const dest = extractDestinationPages(html);
    for (const link of dest.quickLinks) {
      if (!combined.destinationPages.quickLinks.some((x) => x.liveUrl === link.liveUrl)) {
        combined.destinationPages.quickLinks.push(link);
      }
    }
    if (key === "home") combined.destinationPages.circuits = dest.circuits;
  }
  combined.social.push(...extractSocialPlatforms(html));
  combined.emails.push(...extractEmails(html));
  if (key === "about" || key === "home") {
    const about = extractAboutFromPage(html);
    if (about.intro && !combined.about.intro) combined.about.intro = about.intro;
    if (about.sections.length > combined.about.sections.length) {
      combined.about.sections = about.sections;
    }
  }
}

combined.packages = dedupePackages(combined.packages);

const socialMap = new Map();
for (const s of combined.social) socialMap.set(s.platform, s);
combined.social = [...socialMap.values()];

combined.emails = [...new Set(combined.emails)];

combined.contact = {
  location: "Iringa, Tanzania",
  phone: "+255 627 013 348",
  phoneTel: "+255627013348",
  whatsapp: "https://wa.me/255627013348",
  email: combined.emails[0] || "info@endemicbirds.co.tz",
  emails: combined.emails,
};

const outPath = path.join(root, "content", "live-extract.json");
fs.writeFileSync(outPath, JSON.stringify(combined, null, 2), "utf8");
console.log("Wrote", outPath);
console.log("Packages:", combined.packages.length);
console.log("Destination quick links:", combined.destinationPages.quickLinks.length);
console.log("Social platforms:", combined.social.map((s) => s.platform).join(", ") || "(none)");
console.log("About sections:", combined.about.sections.length);
