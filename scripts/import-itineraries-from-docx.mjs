/**
 * Import safari itineraries verbatim from itineraries/*.docx into content/packages.json.
 * Writes content/docx-import-report.json and copies sources to assets/downloads/packages/.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import JSZip from "jszip";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const itinerariesDir = path.join(root, "itineraries");
const packagesPath = path.join(root, "content", "packages.json");
const detailsPath = path.join(root, "content", "package-details.json");
const reportPath = path.join(root, "content", "docx-import-report.json");
const downloadsDir = path.join(root, "assets", "downloads", "packages");
const imgRoot = path.join(root, "assets", "images", "packages");

const SKIP_FILES = new Set(["8 Day Amazing Tanzania Safari Itinerary..docx"]);

/** @type {Array<{ file: string, slug: string, titleFromDoc?: boolean, imageTemplate?: string }>} */
const FILE_TO_SLUG = [
  { file: "14 SOUTHERN TANZANIA BIRDING TOUR (2).docx", slug: "14-days-southern-tanzania-birding-tour" },
  { file: "9 Days Wildlife Safari and Zanzibar Beach Holiday.docx", slug: "9-days-wildlife-safari-zanzibar" },
  { file: "8 Days Wildebeest Migration Safari.docx", slug: "8-days-wildebeest-calving-migration" },
  {
    file: "SAFARIS TANZANIA.docx",
    slug: "8-days-northern-tarangire-manyara-ngorongoro-serengeti",
    supplementaryFiles: ["8 day northern tanzania safari.docx"],
  },
  {
    file: "5 Days Wildebeest Migration Calving Safari.docx",
    slug: "5-days-serengeti-migration-focus",
  },
  {
    file: "5 Days Tanzania Safari to Tarangire, Serengeti & Ngorongoro.docx",
    slug: "5-days-tarangire-serengeti-ngorongoro",
    imageTemplate: "5-days-serengeti-migration-focus",
  },
  {
    file: "14 Days Ultimate Tanzania Safari.docx",
    slug: "14-days-ultimate-tanzania-safari",
    imageTemplate: "8-days-northern-tarangire-manyara-ngorongoro-serengeti",
  },
  {
    file: "13 days Northern Tanzania Birding Trip.docx",
    slug: "13-days-northern-tanzania-birding",
    imageTemplate: "10-day-birdwatching-northern",
  },
  { file: "15 Northern Tanzania birding tour.docx", slug: "15-days-tanzania-birding-tour" },
  {
    file: "Itinerary of Tanzania itinerary 10 days.docx",
    slug: "10-days-northern-lake-victoria-safari",
    imageTemplate: "8-days-northern-tarangire-manyara-ngorongoro-serengeti",
  },
];

const META_LINE =
  /^(duration|availability|number of people|starts\/ends|places to visit|quick tour|tour overview|wildebeest migration calving|ndutu area|highlight|habitats covered|cost for|trip inclusions|exclusions|other information)/i;

function normalizeDashes(s) {
  return String(s || "")
    .replace(/\u2014/g, "\u2013")
    .replace(/â€“/g, "\u2013")
    .replace(/â€"/g, "\u2013");
}

function decodeXml(s) {
  return normalizeDashes(
    s
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
  );
}

async function docxParagraphs(filePath) {
  const buf = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(buf);
  const xml = await zip.file("word/document.xml")?.async("string");
  if (!xml) return [];
  const paras = xml.match(/<w:p[\s>][\s\S]*?<\/w:p>/gi) || [];
  const lines = [];
  for (const p of paras) {
    const runs = [...p.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/gi)].map((m) => decodeXml(m[1]));
    const t = runs.join("").replace(/\s+/g, " ").trim();
    if (t) lines.push(t);
  }
  return lines;
}

function parseDayHeader(line) {
  if (/^\d+\s+days?\s+/i.test(line)) return null;

  let m = line.match(/^Days?\s*0*(\d+)\s*[–\-]\s*0*(\d+)\s*[:.\-–]?\s*(.*)$/i);
  if (m) return { from: Number(m[1]), to: Number(m[2]), title: m[3].trim() };

  m = line.match(/^(?:DAY|Day)\s*0*(\d+)\s*[–\-]\s*0*(\d+)\s*[:.\-–]?\s*(.*)$/i);
  if (m) return { from: Number(m[1]), to: Number(m[2]), title: m[3].trim() };

  m = line.match(/^(?:DAY|Day)\s*0*(\d+)\s*[:.\-–]\s*(.*)$/i);
  if (m) return { from: Number(m[1]), to: Number(m[1]), title: m[2].trim() };

  m = line.match(/^Day\s*0*(\d+)\s*-\s*(.+)$/i);
  if (m) return { from: Number(m[1]), to: Number(m[1]), title: m[2].trim() };

  m = line.match(/^(?:DAY|Day)\s*0*(\d+)\s+(.{4,})$/i);
  if (m && !META_LINE.test(m[2])) return { from: Number(m[1]), to: Number(m[1]), title: m[2].trim() };

  return null;
}

function isDayHeaderLine(line) {
  return Boolean(parseDayHeader(line));
}

function extractTitle(lines, fileName) {
  const fromFile = fileName.replace(/\.docx$/i, "").trim();
  if (/^\d+\s+days?\s+/i.test(fromFile)) return fromFile;
  for (const l of lines) {
    if (/^tour overview$/i.test(l)) continue;
    if (/^\d+\s+days?\s+/i.test(l) && l.length < 140) return l;
    if (
      l.length < 100 &&
      !isDayHeaderLine(l) &&
      !META_LINE.test(l) &&
      !/^(highlight|habitats|safari includes|exclusions|trip inclusions)/i.test(l)
    ) {
      return l;
    }
  }
  return fromFile;
}

function expandInlineDayParagraphs(lines) {
  const out = [];
  for (const line of lines) {
    const m = line.match(/^(DAY|Day)\s*0*(\d+)(?:\s*[–\-]\s*0*(\d+))?\s*[:.\-–]\s*(.+)$/i);
    if (!m) {
      out.push(line);
      continue;
    }
    const from = Number(m[2]);
    const to = m[3] ? Number(m[3]) : from;
    const rest = m[4].trim();
    const split = rest.match(/^(.+?)\s*[-–]\s*(.+)$/);
    if (split && split[2].length > 25) {
      const title = split[1].trim();
      const body = split[2].trim();
      if (from === to) {
        out.push(`Day ${from}: ${title}`);
        out.push(body);
      } else {
        out.push(`Day ${from} – ${to}: ${title}`);
        out.push(body);
      }
      continue;
    }
    out.push(line);
  }
  return out;
}

function prepareItineraryLines(lines) {
  let sliced = lines;
  const detailIdx = lines.findIndex((l) => /day by day itinerary/i.test(l));
  if (detailIdx >= 0) sliced = lines.slice(detailIdx + 1);
  sliced = expandInlineDayParagraphs(sliced);
  const stop = sliced.findIndex((l) => /^safari inclusions|^trip inclusions|^safari exclusions/i.test(l));
  if (stop >= 0) sliced = sliced.slice(0, stop);
  return sliced;
}

function extractSummary(lines, firstDayIdx) {
  const chunk = lines
    .slice(0, firstDayIdx >= 0 ? firstDayIdx : lines.length)
    .filter(
      (l) =>
        !META_LINE.test(l) &&
        l.length > 40 &&
        !/^tour overview/i.test(l) &&
        !/^day by day/i.test(l) &&
        !isDayHeaderLine(l)
    );
  if (!chunk.length) return lines[0] || "";
  return chunk.join(" ").slice(0, 480);
}

function parseInclusions(lines) {
  const included = [];
  const excluded = [];
  let mode = null;
  for (const line of lines) {
    if (/^(trip|safari) inclusions|^what'?s included/i.test(line)) mode = "in";
    else if (/^(trip|safari) exclusions|^what'?s not included|^exclusions$/i.test(line)) mode = "out";
    else if (/^highlight mammals|^habitats covered|^cost for|^pace:/i.test(line)) mode = null;
    else if (mode === "in" && line.length > 2 && line.length < 200) included.push(line);
    else if (mode === "out" && line.length > 2) excluded.push(line);
  }
  return { included, excluded };
}

function parseItinerary(lines) {
  let firstDay = -1;
  for (let i = 0; i < lines.length; i++) {
    if (isDayHeaderLine(lines[i])) {
      firstDay = i;
      break;
    }
  }
  if (firstDay < 0) return { days: [], firstDayIdx: -1 };

  const days = [];
  let i = firstDay;
  while (i < lines.length) {
    if (/^safari inclusions|^trip inclusions|^safari exclusions/i.test(lines[i])) break;
    const hdr = parseDayHeader(lines[i]);
    if (!hdr) {
      i++;
      continue;
    }
    i++;
    const body = [];
    while (i < lines.length && !isDayHeaderLine(lines[i])) {
      if (!META_LINE.test(lines[i])) body.push(lines[i]);
      i++;
    }
    const description = body.join(" ").trim();
    for (let d = hdr.from; d <= hdr.to; d++) {
      const title =
        hdr.from === hdr.to
          ? hdr.title || `Day ${d}`
          : hdr.title
            ? `Day ${d}: ${hdr.title}`
            : `Day ${d}`;
      days.push({
        day: d,
        title: title || `Day ${d}`,
        description: description || title,
      });
    }
  }
  const byDay = new Map();
  for (const d of days) {
    byDay.set(d.day, d);
  }
  const merged = [...byDay.values()].sort((a, b) => a.day - b.day);
  return { days: merged, firstDayIdx: firstDay };
}

function inferCategory(title, summary, fileName) {
  const text = `${title} ${summary} ${fileName}`.toLowerCase();
  const bird = /\bbird(ing|watch)|endemic|ornithol/i.test(text);
  const wild = /\bsafari|wildlife|wildebeest|migration|big five|game drive/i.test(text);
  const beach = /\bzanzibar|beach|bush2beach/i.test(text);
  if (bird && wild) return beach ? "wildlife" : "combined";
  if (bird) return "birding";
  return "wildlife";
}

function inferActivitySlugs(text, category) {
  const slugs = [];
  const t = text.toLowerCase();
  const migrationFocus =
    /wildebeest migration|great migration|calving safari|migration safari|migration focus|river crossing/i.test(t);
  if (migrationFocus || (category !== "birding" && /ndutu|calving season/i.test(t))) {
    slugs.push("great-migration-plains");
  }
  if (category !== "birding" && /zanzibar|beach holiday|bush2beach|bush.?beach/i.test(t)) {
    slugs.push("bush-beach-luxury");
  }
  if (/ngorongoro|tarangire|manyara|serengeti/i.test(t) && !slugs.includes("ngorongoro-northern-icons")) {
    if (!/great migration|calving/i.test(t) || /crater|tarangire|manyara/i.test(t)) {
      slugs.push("ngorongoro-northern-icons");
    }
  }
  return [...new Set(slugs)];
}

function inferDestinations(text) {
  const dests = new Set();
  const t = text.toLowerCase();
  if (/northern|arusha|serengeti|ngorongoro|tarangire|manyara|kilimanjaro/i.test(t)) dests.add("northern");
  if (/southern|ruaha|udzungwa|iringa|mikumi|selous|nyerere|kitulo/i.test(t)) dests.add("southern");
  if (/eastern|usambara|zanzibar|dar es salaam|pemba/i.test(t)) dests.add("eastern");
  if (/western|mahale|gombe|katavi/i.test(t)) dests.add("western");
  if (/eastern arc|uluguru|ukaguru|udzungwa/i.test(t)) dests.add("eastern-arc");
  return [...dests];
}

function inferCircuits(destinations) {
  const map = {
    northern: "Northern",
    southern: "Southern",
    eastern: "Eastern",
    western: "Western",
    "eastern-arc": "Eastern",
  };
  return [...new Set(destinations.map((d) => map[d]).filter(Boolean))];
}

function wildlifeDestinationsFromText(text) {
  const slugs = [];
  const t = text.toLowerCase();
  if (/tarangire/i.test(t)) slugs.push("tarangire-national-park");
  if (/manyara/i.test(t)) slugs.push("lake-manyara-national-park");
  if (/ngorongoro|crater/i.test(t)) slugs.push("ngorongoro-conservation-area");
  if (/serengeti|ndutu/i.test(t)) slugs.push("serengeti-national-park");
  return [...new Set(slugs)];
}

function ensureImages(slug, templateSlug) {
  const dir = path.join(imgRoot, slug);
  fs.mkdirSync(dir, { recursive: true });
  const tpl = path.join(imgRoot, templateSlug);
  for (const name of ["hero.jpg", "gallery-1.jpg"]) {
    const dest = path.join(dir, name);
    const src = path.join(tpl, name);
    if (!fs.existsSync(dest) && fs.existsSync(src)) fs.copyFileSync(src, dest);
  }
}

function copyDownload(slug, sourceFile) {
  fs.mkdirSync(downloadsDir, { recursive: true });
  const dest = path.join(downloadsDir, `${slug}.docx`);
  fs.copyFileSync(sourceFile, dest);
  const size = fs.statSync(dest).size;
  return {
    file: `assets/downloads/packages/${slug}.docx`,
    fileType: "docx",
    sizeBytes: size,
    versionDate: new Date().toISOString().slice(0, 10),
    label: "Download full itinerary (Word)",
  };
}

function defaultIncluded(category) {
  if (category === "birding") {
    return [
      "Specialist birding guide (English; other languages on request)",
      "Safari vehicle suited to the route – small group sizes",
      "Park and reserve fees as per confirmed itinerary",
      "Accommodation as proposed for your dates",
      "Meals on the published meal plan while in the field",
      "Bottled drinking water in the vehicle on drive days",
    ];
  }
  return [
    "Professional safari guide (English; other languages on request)",
    "Safari vehicle with pop-up roof – maximum six guests, window seats",
    "Park fees as per confirmed itinerary",
    "Accommodation as listed per day",
    "Meals on full-board basis while on safari unless noted",
    "Bottled drinking water in the vehicle",
  ];
}

function defaultExcluded(category) {
  if (category === "birding") {
    return [
      "International flights, visas and airport taxes",
      "Travel and medical insurance",
      "Tips for guides, drivers and lodge staff",
      "Personal expenses, alcoholic drinks and laundry",
      "Optional extensions or activities not listed in the itinerary",
    ];
  }
  return [
    "International flights and visas",
    "Travel insurance",
    "Tips for guides and camp staff",
    "Personal expenses, drinks and laundry",
    "Optional activities not listed in the itinerary",
  ];
}

function createPackageSkeleton(slug, title, category, durationDays, template) {
  return {
    ...JSON.parse(JSON.stringify(template)),
    id: slug,
    slug,
    title,
    category,
    durationDays,
    summary: title,
    heroImage: `assets/images/packages/${slug}/hero.jpg`,
    gallery: [
      `assets/images/packages/${slug}/hero.jpg`,
      `assets/images/packages/${slug}/gallery-1.jpg`,
    ],
    featured: false,
    verified: true,
    seo: {
      title: `${title} | Endemic Birds`,
      description: title.slice(0, 155),
    },
    contentSource: { type: "docx", fidelity: "verbatim-itinerary" },
  };
}

const packages = JSON.parse(fs.readFileSync(packagesPath, "utf8"));
const details = JSON.parse(fs.readFileSync(detailsPath, "utf8"));
const wildlifeTpl = packages.find((p) => p.slug === "6-days-tanzania-safari");
const report = {
  runAt: new Date().toISOString(),
  assurance:
    "Itinerary day titles and descriptions are taken verbatim from Word paragraphs under each Day header. Summaries use the document overview text (not rewritten). Packages without day headers in Word are flagged in results.",
  results: [],
  skipped: [],
};

for (const map of FILE_TO_SLUG) {
  const sourcePath = path.join(itinerariesDir, map.file);
  if (!fs.existsSync(sourcePath)) {
    report.results.push({ file: map.file, slug: map.slug, status: "missing_file" });
    continue;
  }

  const rawLines = await docxParagraphs(sourcePath);
  const itineraryLines = prepareItineraryLines(rawLines);
  const title = extractTitle(rawLines, map.file);
  const { days, firstDayIdx } = parseItinerary(itineraryLines);
  const overviewEnd = rawLines.findIndex((l) => /day by day itinerary/i.test(l));
  const summary = extractSummary(rawLines, overviewEnd > 0 ? overviewEnd : firstDayIdx);
  const { included, excluded } = parseInclusions(rawLines);
  const fullText = rawLines.join(" ");
  const category = inferCategory(title, summary, map.file);
  const durationDays = days.length
    ? Math.max(...days.map((d) => d.day))
    : Number(fullText.match(/(\d+)\s*days?/i)?.[1]) || 0;

  let pkg = packages.find((p) => p.slug === map.slug);
  const isNew = !pkg;
  if (isNew) {
    const template = wildlifeTpl || packages[0];
    pkg = createPackageSkeleton(map.slug, title, category, durationDays || template.durationDays, template);
    packages.push(pkg);
    ensureImages(map.slug, map.imageTemplate || template.slug);
  }

  if (title) pkg.title = title;
  if (summary) pkg.summary = summary.slice(0, 500);
  pkg.category = category;
  if (days.length) {
    pkg.itinerary = days;
    pkg.durationDays = Math.max(...days.map((d) => d.day));
  } else if (durationDays) pkg.durationDays = durationDays;

  pkg.destinations = inferDestinations(fullText);
  pkg.circuits = inferCircuits(pkg.destinations);
  pkg.activitySlugs = inferActivitySlugs(fullText, category);
  if (category === "wildlife" || category === "combined") {
    pkg.wildlifeDestinations = wildlifeDestinationsFromText(fullText);
  }

  if (included.length) {
    pkg.included = included.map((l) => normalizeDashes(l));
  } else if (!pkg.included?.length) {
    pkg.included = defaultIncluded(category);
  }
  if (excluded.length) {
    pkg.excluded = excluded.map((l) => normalizeDashes(l));
  } else if (!pkg.excluded?.length) {
    pkg.excluded = defaultExcluded(category);
  }

  pkg.contentSource = {
    type: "docx",
    sourceFile: `itineraries/${map.file}`,
    supplementaryFiles: (map.supplementaryFiles || []).map((f) => `itineraries/${f}`),
    importedAt: report.runAt,
    fidelity: "verbatim-itinerary",
    dayCountFromDoc: days.length,
  };
  pkg.download = copyDownload(map.slug, sourcePath);
  const expectedDays = pkg.durationDays || 0;
  const missingDaysInWord =
    days.length > 0 && expectedDays > 0 && new Set(days.map((d) => d.day)).size < expectedDays;
  pkg.verified = days.length > 0 && !missingDaysInWord;
  const review = new Set(pkg.needsOwnerReview || []);
  if (!days.length) {
    review.add("daily route detail");
    review.add("missing day headers in Word source");
  } else {
    review.delete("daily route detail");
    if (missingDaysInWord) review.add("compressed day ranges in Word (e.g. Days 4–6)");
  }
  pkg.needsOwnerReview = [...review];

  if (pkg.seo) {
    pkg.seo.title = `${pkg.title} | Endemic Birds`;
    pkg.seo.description = (pkg.summary || pkg.title).slice(0, 155);
  }

  report.results.push({
    file: map.file,
    slug: map.slug,
    status: isNew ? "created" : "updated",
    category,
    durationDays: pkg.durationDays,
    itineraryDays: days.length,
    activitySlugs: pkg.activitySlugs,
  });
}

for (const f of SKIP_FILES) {
  report.skipped.push({ file: f, reason: "Superseded by SAFARIS TANZANIA.docx for the 8-day northern package" });
}
report.skipped.push({
  file: "8 day northern tanzania safari.docx",
  reason: "Supplementary copy; canonical import is SAFARIS TANZANIA.docx",
});

const tripConsiderPath = path.join(itinerariesDir, "Trip Considerations.docx");
if (fs.existsSync(tripConsiderPath)) {
  const lines = await docxParagraphs(tripConsiderPath);
  details.bySlug = details.bySlug || {};
  details.bySlug["13-days-northern-tanzania-birding"] = {
    ...(details.bySlug["13-days-northern-tanzania-birding"] || {}),
    tripConsiderations: lines.join("\n\n"),
  };
  report.tripConsiderationsLinkedTo = "13-days-northern-tanzania-birding";
}

fs.writeFileSync(packagesPath, JSON.stringify(packages, null, 2) + "\n", "utf8");
fs.writeFileSync(detailsPath, JSON.stringify(details, null, 2) + "\n", "utf8");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");

console.log(`Docx import: ${report.results.length} packages, report → content/docx-import-report.json`);