/**
 * Scrape tanzaniatourism.com destination pages, download 6+ images each.
 * Never write Tanzania Tourism / tanzaniatourism.com attribution into public content
 * (no imageCredits, sourceUrl, or on-page source links – internal scrape only).
 * and write content/wildlife-destinations.json with complete records.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const TTB = "https://www.tanzaniatourism.com";

const DESTINATIONS = [
  {
    slug: "serengeti-national-park",
    name: "Serengeti National Park",
    circuit: "Northern",
    path: "/destination/serengeti-national-park",
    fallbackUploads: [
      "Serengeti_Gnus_7765.jpg",
      "Serengeti_Migration_P103.jpg",
      "Serengeti_National_Park_Zebras_20.jpg",
      "Serengeti_National_Park_Lions_24.jpg",
      "Serengeti_National_Park_Leopard_23.jpg",
      "Serengeti_National_Park_Birdslife_20.jpg",
    ],
  },
  {
    slug: "ngorongoro-conservation-area",
    name: "Ngorongoro Conservation Area",
    circuit: "Northern",
    path: "/destination/ngorongoro-conservation-area",
    fallbackUploads: [
      "Ngorongoro_Crater_View_NCA.jpg",
      "Ngorongoro_Crater_Floor_NCA.jpg",
      "Ngorongoro_Crater_Wildlife_24.jpg",
      "Ngorongoro_Crater_Swamps_NCA.jpg",
      "Wildlife_in_Ndutu.jpg",
      "Empakai_Crater_Lake_NCA_5.jpg",
    ],
  },
  {
    slug: "tarangire-national-park",
    name: "Tarangire National Park",
    circuit: "Northern",
    path: "/destination/tarangire-national-park",
    fallbackUploads: [
      "Tarangire_National_Park_20.jpg",
      "Tarangire_National_Park_Baobab_Trees_20.jpg",
      "Tarangire_National_Park_Elephants_in_Trangire_River_42.jpg",
      "Tarangire_National_Park_Elephants_in_Trangire_River_35.jpg",
      "Tarangire_National_Park_Baobab_Trees_21.jpg",
      "Tarangire_National_Park_Elephants_20.jpg",
    ],
  },
  {
    slug: "lake-manyara-national-park",
    name: "Lake Manyara National Park",
    circuit: "Northern",
    path: "/destination/lake-manyara-national-park",
    fallbackUploads: [
      "Lake_Manyara_National_Park_Lake_View_27.jpg",
      "Lake_Manyara_National_Park_Giraffes_24.jpg",
      "Lake_Manyara_National_Park_Elephants_24.jpg",
      "Lake_Manyara_National_Park_Baboons_29.jpg",
      "Lake_Manyara_National_Park_Velvet_Monkey_26.jpg",
      "Lake_Manyara_National_Park_Kingfisher_60.jpg",
    ],
  },
  {
    slug: "arusha-national-park",
    name: "Arusha National Park",
    circuit: "Northern",
    path: "/destination/arusha-national-park",
    displaySubtitle: "Momella Lakes & Mount Meru foothills",
    fallbackUploads: [
      "Arusha_National_Park_Tanzania.jpg",
      "Arusha_National_Park_Momella_Lake_Flamingos_83.jpg",
      "Arusha_National_Park_Momella_Lake_81.jpg",
      "Arusha_National_Park_Giraffes_102.jpg",
      "Arusha_National_Park_Ngurdoto_Crater_167.jpg",
      "Arusha_National_Park_Mount_Meru_01.jpg",
    ],
  },
  {
    slug: "ruaha-national-park",
    name: "Ruaha National Park",
    circuit: "Southern",
    path: "/destination/ruaha-national-park",
    fallbackUploads: [
      "Ruaha_National_Park_Tanzania.jpg",
      "Ruaha_National_Park_Ruaha_River_85.jpg",
      "Ruaha_National_Park_Baobab_Landscape_10.jpg",
      "Ruaha_National_Park_Kudus_69.jpg",
      "Ruaha_National_Park_Hippos_47.jpg",
      "Ruaha_National_Park_Leopard_72.jpg",
    ],
  },
  {
    slug: "mikumi-national-park",
    name: "Mikumi National Park",
    circuit: "Southern",
    path: "/destination/mikumi-national-park",
    fallbackUploads: [
      "Mikumi_National_Park_Elephants_101.jpg",
      "Mikumi_National_Park_Zebras_111.jpg",
      "Mikumi_National_Park_Wildlife_110.jpg",
      "Mikumi_National_Park_Impalas_30.jpg",
      "Mikumi_National_Park_Zebras_107.jpg",
      "Mikumi_National_Park_Gate_112.jpg",
    ],
  },
  {
    slug: "nyerere-national-park",
    name: "Nyerere National Park",
    circuit: "Southern",
    path: "/destination/nyerere-national-park",
    fallbackUploads: [
      "Selous_Game_Reserve_Aeroview.jpg",
      "Nyerere_National_Park_Elephants_61.jpg",
      "Nyerere_National_Park_Wildebeests_20.jpg",
      "Nyerere_National_Park_Giraffes_104.jpg",
      "Nyerere_National_Park_Wild_Dogs_100.jpg",
      "Nyerere_National_Park_Rufiji_River_219.jpg",
    ],
  },
  {
    slug: "katavi-national-park",
    name: "Katavi National Park",
    circuit: "Western",
    path: "/destination/katavi-national-park",
    fallbackUploads: [
      "Katavi_National_Park_x_70.jpg",
      "Katavi_National_Park_Sunset_62.jpg",
      "Katavi_National_Park_Waterbucks_21.jpg",
      "Katavi_National_Park_Giraffes_55.jpg",
      "Katavi_National_Park_Hippos_28.jpg",
      "Katavi_National_Park_x_42.jpg",
    ],
  },
  {
    slug: "mahale-mountains-national-park",
    name: "Mahale Mountains National Park",
    circuit: "Western",
    path: "/destination/mahale-mountains-national-park",
    fallbackUploads: [
      "Mahale_Mountain_National_Park.jpg",
      "Mahale_Mountains_National_Park_Shore_of_Lake_Tanganyika_40.jpg",
      "Mahale_Mountains_National_Park_Shoreline_73.jpg",
      "Mahale_Mountains_National_Park_Chimp_44.jpg",
      "Mahale_Mountains_National_Park_x_49.jpg",
      "Mahale_Mountains_National_Park_x_61.jpg",
    ],
  },
];

function extractUploads(html) {
  const found = new Set();
  for (const m of html.matchAll(/images\/uploads\/([A-Za-z0-9_./-]+\.(?:jpg|jpeg|png))/gi)) {
    let file = m[1].replace(/\\/g, "");
    if (file.includes("_750_") || file.includes("_550_") || file.includes("_286_") || file.includes("_190_"))
      continue;
    if (file.includes("/")) continue;
    found.add(file);
  }
  return [...found];
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractDescription(html) {
  const og = html.match(/property="og:description"\s+content="([^"]+)"/i);
  if (og) return og[1].trim();
  const meta = html.match(/name="description"\s+content="([^"]+)"/i);
  if (meta) return meta[1].trim();
  return "";
}

async function downloadUpload(filename, destPath) {
  const url = `${TTB}/images/uploads/${encodeURIComponent(filename).replace(/%2F/g, "/")}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${filename}`);
  fs.writeFileSync(destPath, Buffer.from(await res.arrayBuffer()));
}

async function processDestination(def) {
  const pageUrl = `${TTB}${def.path}`;
  let html = "";
  let scraped = [];
  try {
    const res = await fetch(pageUrl, { redirect: "follow" });
    html = await res.text();
    scraped = extractUploads(html);
  } catch (e) {
    console.warn(`  scrape failed: ${e.message}`);
  }

  const uploadNames = [];
  for (const f of [...scraped, ...def.fallbackUploads]) {
    if (!uploadNames.includes(f)) uploadNames.push(f);
    if (uploadNames.length >= 6) break;
  }

  const relBase = `assets/images/wildlife/destinations/${def.slug}`;
  const outDir = path.join(root, relBase);
  fs.mkdirSync(outDir, { recursive: true });

  const localFiles = [];
  for (let i = 0; i < uploadNames.length; i++) {
    const upload = uploadNames[i];
    const localName = i === 0 ? "hero.jpg" : `gallery-${i}.jpg`;
    const destPath = path.join(outDir, localName);
    process.stdout.write(`  ${def.slug}/${localName} <- ${upload} … `);
    try {
      await downloadUpload(upload, destPath);
      const kb = Math.round(fs.statSync(destPath).size / 1024);
      console.log(`${kb} KB`);
      localFiles.push(`${relBase}/${localName}`);
    } catch (e) {
      console.log(`FAILED (${e.message})`);
    }
  }

  while (localFiles.length < 6) {
    const idx = localFiles.length;
    const localName = idx === 0 ? "hero.jpg" : `gallery-${idx}.jpg`;
    const tryUpload = def.fallbackUploads[idx] || def.fallbackUploads[0];
    const destPath = path.join(outDir, localName);
    if (!fs.existsSync(destPath)) {
      try {
        await downloadUpload(tryUpload, destPath);
        localFiles.push(`${relBase}/${localName}`);
      } catch {
        break;
      }
    } else {
      localFiles.push(`${relBase}/${localName}`);
    }
  }

  const description = extractDescription(html);
  const bodyText = stripHtml(html).slice(0, 8000);

  return {
    id: def.slug.replace(/-national-park$/, "").replace(/-conservation-area$/, "-nca"),
    slug: def.slug,
    name: def.name,
    displaySubtitle: def.displaySubtitle || null,
    circuit: def.circuit,
    location: `${def.circuit} Tanzania`,
    summary:
      description ||
      `${def.name} is among Tanzania’s most celebrated wildlife destinations – big-game viewing, scenic landscapes and classic safari photography.`,
    overview: description
      ? `${description} This page summarises why safari travellers include ${def.name} on northern, southern or western circuits with Endemic Birds – small groups, max six guests per vehicle.`
      : `${def.name} ranks among Tanzania’s headline parks for big-game viewing, scenic landscapes and classic safari photography. Endemic Birds leads wildlife journeys here with the same field standards as our specialist birding routes.`,
    wildlifeHighlights: defaultHighlights(def.slug),
    parkActivities: defaultActivities(def.slug),
    bestTime: defaultBestTime(def.circuit),
    practicalNotes:
      "Park fees, lodge availability and drive times vary by season. We confirm routing, guides and vehicle allocation when you enquire – maximum six guests per vehicle with window seats.",
    heroImage: localFiles[0] || null,
    gallery: localFiles.slice(1),
    packageSlugs: [],
    activitySlugs: [],
    seo: {
      title: `${def.name} Wildlife Safari | Endemic Birds Tanzania`,
      description: (description || `${def.name} wildlife safaris with Endemic Birds Tanzania.`).slice(0, 155),
    },
    _scrapeNote: bodyText.length > 200 ? "Description synced from public destination page metadata." : null,
  };
}

function defaultHighlights(slug) {
  const map = {
    "serengeti-national-park": [
      "Great Migration river crossings and endless plains",
      "Lion, leopard and cheetah on open savanna",
      "Kopje cats and golden-hour photography",
    ],
    "ngorongoro-conservation-area": [
      "Ngorongoro Crater floor – dense big-game viewing",
      "Black rhino, flamingo lakes and crater rim scenery",
      "Ndutu calving season (Dec–Mar) on the same conservation area",
    ],
    "tarangire-national-park": [
      "Elephant herds along the Tarangire River",
      "Iconic baobab landscapes",
      "Dry-season wildlife concentrations",
    ],
    "lake-manyara-national-park": [
      "Groundwater forest and lake viewpoints",
      "Flamingo flocks and hippo pools",
      "Classic northern circuit in a compact park",
    ],
    "arusha-national-park": [
      "Momella Lakes – flamingos and waterbirds",
      "Ngurdoto Crater viewpoints",
      "Mount Meru foothills and fig-tree arch walks",
    ],
    "ruaha-national-park": [
      "Remote miombo wilderness with low visitor numbers",
      "Ruaha River elephant and predator action",
      "Greater kudu, wild dog and baobab-studded hills",
    ],
    "mikumi-national-park": [
      "Mkata floodplain – zebra, wildebeest and giraffe",
      "Easy access from Dar es Salaam / Morogoro corridor",
      "Gateway to southern Tanzania safaris",
    ],
    "nyerere-national-park": [
      "Rufiji River boat safaris and oxbow lakes",
      "Wild dog, elephant and hippo on river circuits",
      "Vast wilderness – former Selous heartlands",
    ],
    "katavi-national-park": [
      "Hippo pools and crocodile congregations in dry season",
      "Buffalo herds on floodplains",
      "Among Tanzania’s least crowded big-game parks",
    ],
    "mahale-mountains-national-park": [
      "Chimpanzee trekking in montane forest",
      "Lake Tanganyika beaches and dhow sunsets",
      "Forest trails with primate and bird life",
    ],
  };
  return map[slug] || ["Classic Tanzania wildlife viewing with specialist guides."];
}

function defaultActivities(slug) {
  const base = ["Game drives", "Photography"];
  if (slug.includes("arusha") || slug.includes("manyara")) base.push("Walking (where permitted)", "Canoeing at Momella (Arusha)");
  if (slug.includes("nyerere")) base.push("Boat safaris on the Rufiji");
  if (slug.includes("mahale")) base.push("Chimpanzee tracking", "Lake swimming & beach time");
  if (slug.includes("ngorongoro")) base.push("Crater floor drives", "Cultural visits on NCA");
  return base;
}

function defaultBestTime(circuit) {
  if (circuit === "Northern") return "Dry season (June–October) for general wildlife; calving migration Dec–Mar in Ndutu/Serengeti south.";
  if (circuit === "Southern") return "Dry season (June–November) for Ruaha and Nyerere river viewing; Mikumi accessible year-round.";
  return "Dry season (May–October) for Katavi hippo pools; Mahale chimps best in dry months with clearer forest trails.";
}

const records = [];
for (const def of DESTINATIONS) {
  console.log(`\n${def.name}`);
  records.push(await processDestination(def));
}

const outPath = path.join(root, "content", "wildlife-destinations.json");
fs.writeFileSync(outPath, JSON.stringify(records, null, 2), "utf8");
console.log(`\nWrote ${records.length} destinations to content/wildlife-destinations.json`);
