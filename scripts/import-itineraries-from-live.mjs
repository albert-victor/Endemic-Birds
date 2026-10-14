import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagesPath = path.join(root, "content", "packages.json");
const scrapeDir = path.join(root, "content", "scrapes", "packages");
const reportPath = path.join(root, "content", "itinerary-import-report.json");

const packages = JSON.parse(fs.readFileSync(packagesPath, "utf8"));

function decodeEntities(s) {
  return String(s || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&ndash;/g, "–")
    .replace(/&ndash;/g, "\u2013");
}

function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function collectTextEditorHtml(html) {
  const chunks = [];
  const re =
    /<div class="[^"]*elementor-widget-text-editor[^"]*"[\s\S]*?<div class="elementor-widget-container">\s*([\s\S]*?)\s*<\/div>\s*<\/div>/gi;
  let m;
  while ((m = re.exec(html))) chunks.push(m[1]);
  return chunks.join("\n");
}

function dayNumberFromLabel(label) {
  const m = String(label).match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

/** Day N title + body inside the same <p> */
function parseDayInlineParagraphs(blob) {
  const days = [];
  const re =
    /<p>\s*<strong>\s*(?:<b>\s*)?(Days?\s+[\d\sand]+)\s*[:\.––-]\s*([\s\S]*?)(?:<\/b>\s*)?<\/strong>\s*([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = re.exec(blob))) {
    const day = dayNumberFromLabel(m[1]);
    if (!day) continue;
    let title = stripTags(m[2]);
    if (!title) title = stripTags(m[1]);
    const desc = stripTags(m[3]);
    days.push({ day, title, description: desc || title });
  }
  return days;
}

/** Day N in one <p>, following <p> blocks until the next day header */
function parseDayBlockSections(blob) {
  const headerRe =
    /<p>\s*<strong>\s*(?:<b>\s*)?(Days?\s+[\d\sand]+)\s*[:\.––-]\s*([\s\S]*?)(?:<\/b>\s*)?<\/strong>\s*<\/p>/gi;
  const headers = [];
  let hm;
  while ((hm = headerRe.exec(blob))) {
    const day = dayNumberFromLabel(hm[1]);
    if (!day) continue;
    headers.push({
      index: hm.index,
      end: headerRe.lastIndex,
      day,
      title: stripTags(hm[2]) || stripTags(hm[1]),
    });
  }
  const days = [];
  for (let i = 0; i < headers.length; i++) {
    const start = headers[i].end;
    const end = i + 1 < headers.length ? headers[i + 1].index : blob.length;
    const section = blob.slice(start, end);
    const parts = [];
    const pRe = /<p>([\s\S]*?)<\/p>/gi;
    let pm;
    while ((pm = pRe.exec(section))) {
      const t = stripTags(pm[1]);
      if (t) parts.push(t);
    }
    const bullets = [];
    const liRe = /<li>([\s\S]*?)<\/li>/gi;
    let li;
    while ((li = liRe.exec(section))) bullets.push(stripTags(li[1]));
    const description = [...bullets, ...parts].join(" ").trim();
    days.push({
      day: headers[i].day,
      title: headers[i].title,
      description: description || headers[i].title,
    });
  }
  return days;
}

/** Numbered <ol><li> day-by-day (Southern circuit pages) */
function parseOrderedListDays(blob) {
  const days = [];
  const olRe = /<ol(?:\s+start="(\d+)")?[^>]*>([\s\S]*?)<\/ol>/gi;
  let ol;
  while ((ol = olRe.exec(blob))) {
    let dayNum = ol[1] ? Number(ol[1]) : 1;
    const inner = ol[2];
    const liRe = /<li>([\s\S]*?)<\/li>/gi;
    let li;
    while ((li = liRe.exec(inner))) {
      const raw = li[1];
      const strong = raw.match(/<strong>\s*([^<]+?)\s*<\/strong>/i);
      let title = strong ? stripTags(strong[1]).replace(/[-––]\s*$/, "").trim() : `Day ${dayNum}`;
      let desc = stripTags(raw);
      if (strong) {
        const st = stripTags(strong[1]);
        desc = desc.replace(st, "").replace(/^[-––\s]+/, "").trim();
      }
      days.push({ day: dayNum, title, description: desc || title });
      dayNum++;
    }
  }
  return days;
}

function parseOverview(blob) {
  const m = blob.match(
    /<p>\s*<strong>\s*<b>\s*Overview\s*<\/b>\s*<\/strong>\s*([\s\S]*?)<\/p>/i
  );
  if (m) return stripTags(m[1]);
  const m2 = blob.match(/<strong>\s*<b>\s*Overview\s*<\/b>\s*<\/strong>\s*([^<]+)/i);
  if (m2) return stripTags(m2[1]);
  return null;
}

function parseItineraryFromBlob(blob) {
  const candidates = [
    parseDayInlineParagraphs(blob),
    parseDayBlockSections(blob),
    parseOrderedListDays(blob),
  ];
  let best = [];
  for (const list of candidates) {
    if (list.length > best.length) best = list;
  }
  if (!best.length) {
    const plain = stripTags(blob);
    const alt = [];
    const re = /Days?\s+(\d+(?:\s+and\s+\d+)?)\s*[:\.––-]\s*/gi;
    let m;
    const indices = [];
    while ((m = re.exec(plain))) indices.push({ day: dayNumberFromLabel(m[1]), start: m.index + m[0].length, header: m.index });
    for (let i = 0; i < indices.length; i++) {
      const end = i + 1 < indices.length ? indices[i + 1].header : plain.length;
      const chunk = plain.slice(indices[i].start, end).trim();
      const title = chunk.slice(0, 80).trim();
      alt.push({ day: indices[i].day, title, description: chunk });
    }
    best = alt.filter((d) => d.day);
  }
  return best.sort((a, b) => a.day - b.day);
}

function parseListSection(blob, labelPattern) {
  const re = new RegExp(
    `<(?:p|h[2-4])[^>]*>\\s*(?:<strong>\\s*)?(?:<b>\\s*)?(?:${labelPattern})\\s*(?:<\\/b>\\s*)?(?:<\\/strong>)?\\s*<\\/(?:p|h[2-4])>([\\s\\S]*?)(?=<(?:p|h[2-4])[^>]*>\\s*(?:<strong>)?(?:<b>)?(?:Overview|Day\\s+\\d+|Included|Excluded|Highlights|Best\\s+time)|$)`,
    "i"
  );
  const m = blob.match(re);
  if (!m) return [];
  const section = m[1];
  const items = [];
  const liRe = /<li>([\s\S]*?)<\/li>/gi;
  let li;
  while ((li = liRe.exec(section))) {
    const t = stripTags(li[1]);
    if (t) items.push(t);
  }
  return items;
}

function parsePage(html) {
  const blob = collectTextEditorHtml(html);
  if (!blob) return { days: [], overview: null, included: [], excluded: [] };
  const overview = parseOverview(blob);
  const days = parseItineraryFromBlob(blob);
  const included = parseListSection(blob, "Included|What(?:'s| is) included|Package includes");
  const excluded = parseListSection(blob, "Excluded|Not included|Package excludes");
  return { days, overview, included, excluded, blobLength: blob.length };
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "EndemicBirdsImport/1.0 (migration)" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function main() {
  fs.mkdirSync(scrapeDir, { recursive: true });
  const urlCache = new Map();
  const results = [];
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  const force = process.argv.includes("--force");
  const shouldImport = (pkg) => {
    if (!pkg.liveUrl) return false;
    const n = pkg.itinerary?.length || 0;
    if (n === 0) return true;
    if (force) return n < pkg.durationDays;
    return n < Math.max(3, Math.floor(pkg.durationDays * 0.45));
  };

  const targets = packages.filter(shouldImport);

  for (const pkg of targets) {
    const url = pkg.liveUrl;
    let parsed;
    try {
      if (!urlCache.has(url)) {
        const scrapeFile = path.join(scrapeDir, `${pkg.slug}.html`);
        let html;
        if (fs.existsSync(scrapeFile) && !process.argv.includes("--refetch")) {
          html = fs.readFileSync(scrapeFile, "utf8");
        } else {
          html = await fetchHtml(url);
          fs.writeFileSync(scrapeFile, html, "utf8");
          await new Promise((r) => setTimeout(r, 400));
        }
        urlCache.set(url, parsePage(html));
      }
      parsed = urlCache.get(url);
    } catch (e) {
      failed++;
      results.push({ slug: pkg.slug, liveUrl: url, status: "fetch_failed", error: String(e.message || e) });
      continue;
    }

    if (!parsed.days.length) {
      failed++;
      results.push({
        slug: pkg.slug,
        liveUrl: url,
        status: "no_itinerary_on_page",
        blobLength: parsed.blobLength,
      });
      continue;
    }

    pkg.itinerary = parsed.days;
    if (parsed.overview && (!pkg.summary || pkg.summary.length < 40)) {
      pkg.summary = parsed.overview.slice(0, 500);
    }
    if (parsed.included.length && !(pkg.included?.length > 0)) pkg.included = parsed.included;
    if (parsed.excluded.length && !(pkg.excluded?.length > 0)) pkg.excluded = parsed.excluded;
    if (Array.isArray(pkg.needsOwnerReview)) {
      pkg.needsOwnerReview = pkg.needsOwnerReview.filter((x) => x !== "itinerary");
      if (!pkg.needsOwnerReview.length) delete pkg.needsOwnerReview;
    }
    passed++;
    results.push({
      slug: pkg.slug,
      liveUrl: url,
      status: "imported",
      days: parsed.days.length,
      expectedDays: pkg.durationDays,
      included: parsed.included.length,
      excluded: parsed.excluded.length,
    });
  }

  const stillEmpty = packages.filter((p) => !(p.itinerary?.length > 0));
  skipped = packages.filter((p) => p.itinerary?.length > 0).length;

  fs.writeFileSync(packagesPath, JSON.stringify(packages, null, 2) + "\n", "utf8");

  const report = {
    runAt: new Date().toISOString(),
    targetCount: targets.length,
    imported: passed,
    failed,
    alreadyHadItinerary: skipped,
    stillMissingItinerary: stillEmpty.map((p) => ({
      slug: p.slug,
      liveUrl: p.liveUrl || null,
      reason: p.liveUrl ? "see results" : "no liveUrl",
    })),
    results,
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");

  console.log("Import complete");
  console.log("  Targets:", targets.length);
  console.log("  Imported:", passed);
  console.log("  Failed:", failed);
  console.log("  Already had itinerary:", skipped);
  console.log("  Still empty:", stillEmpty.length);
  console.log("Report:", reportPath);
}

const isCli =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isCli) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { collectTextEditorHtml, parsePage, parseItineraryFromBlob };
