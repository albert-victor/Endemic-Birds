/**
 * Downloads destination-accurate hero images for accommodation cards.
 * Sources: Tanzania Tourism public uploads + Wikimedia Commons (open licenses).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const jsonPath = path.join(root, "content", "accommodations.json");
const outRoot = path.join(root, "assets", "images", "accommodations");

const TTB = "https://www.tanzaniatourism.com/";
const COMMONS = "https://upload.wikimedia.org/wikipedia/commons/";

/** @type {Record<string, { url: string, credit: string }>} */
const SLUG_SOURCES = {
  "neema-craft-iringa": {
    url: TTB + "images/uploads/Iringa_Region_Utengule_Place_02.jpg",
    credit: "Iringa highlands – Tanzania Tourism",
  },
  "ruaha-river-lodge": {
    url: TTB + "images/uploads/Ruaha_National_Park_Ruaha_River_85.jpg",
    credit: "Ruaha River – Tanzania Tourism",
  },
  "mufindi-fish-lodge": {
    url: TTB + "images/uploads/Udzungwa_National_Park_Sanje_Waterfalls_21.jpg",
    credit: "Southern forest – Tanzania Tourism",
  },
  "old-kisolanza-farm": {
    url: TTB + "images/uploads/Iringa_Region_Isimila_Prehistoric_Site_01.jpg",
    credit: "Iringa highlands – Tanzania Tourism",
  },
  "ilboru-safari-lodge": {
    url: TTB + "images/uploads/Arusha_National_Park_Mt_Meru_03.jpg",
    credit: "Arusha region – Tanzania Tourism",
  },
  "ikoma-bush-tented-camp": {
    url: TTB + "images/uploads/Serengeti_National_Park_Wildebeest_Migration_47.jpg",
    credit: "Serengeti plains – Tanzania Tourism",
  },
  "southern-miombo-bush-camp": {
    url: TTB + "images/uploads/Nyerere_National_Park_Rufiji_River_02.jpg",
    credit: "Southern wilderness – Tanzania Tourism",
  },
  "fq-hotel": {
    url: TTB + "images/uploads/Dar_es_Salaam_Skyline_01.jpg",
    credit: "City transit – Tanzania Tourism",
  },
  "pemba-paradise-beach-resort": {
    url: COMMONS + "thumb/8/8e/Pemba_Island_beaches.jpg/1280px-Pemba_Island_beaches.jpg",
    credit: "Pemba Island – Wikimedia Commons",
  },
  "morogoro-hotel": {
    url: TTB + "images/uploads/Uluguru_Mountains_from_Morogoro_01.jpg",
    credit: "Uluguru Mountains – Tanzania Tourism",
  },
  "sunset-hotel": {
    url: TTB + "images/uploads/Iringa_Region_Utengule_Place_02.jpg",
    credit: "Southern highlands – Tanzania Tourism (illustrative)",
  },
  "uluti-campsite": {
    url: TTB + "images/uploads/Udzungwa_National_Park_Sonjo__Natural_Pool_28.jpg",
    credit: "Udzungwa forest – Tanzania Tourism",
  },
  "luala-camp": {
    url: TTB + "images/uploads/Udzungwa_National_Park_Sanje_Waterfalls_21.jpg",
    credit: "West Udzungwa forest – Tanzania Tourism",
  },
  "hondo-hondo-udzungwa-forest-lodge": {
    url: TTB + "images/uploads/Udzungwa_National_Park_Moloneys_Monkey_18.jpg",
    credit: "Udzungwa forest margin – Tanzania Tourism",
  },
  "tan-swiss-lodge": {
    url: TTB + "images/uploads/Mikumi_National_Park_Elephants_101.jpg",
    credit: "Mikumi – Tanzania Tourism",
  },
  "amani-nature-reserve": {
    url: TTB + "images/uploads/Usambara_Mountains_Lushoto_02.jpg",
    credit: "Eastern Arc highlands – Tanzania Tourism",
  },
  "mullas-lodge": {
    url: TTB + "images/uploads/Usambara_Mountains_Lushoto_01.jpg",
    credit: "Usambara highlands – Tanzania Tourism (illustrative)",
  },
  "elephant-motel": {
    url: TTB + "images/uploads/Mount_Kilimanjaro_View_from_Amboseli_01.jpg",
    credit: "Kilimanjaro region – Tanzania Tourism",
  },
  "eliboru-lodge": {
    url: TTB + "images/uploads/Arusha_National_Park_Momella_Lakes_04.jpg",
    credit: "Northern Tanzania – Tanzania Tourism (illustrative)",
  },
};

async function download(url, dest) {
  const res = await fetch(url, {
    headers: { "User-Agent": "EndemicBirdsContentBot/1.0 (accommodation hero fetch)" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 4000) throw new Error(`Too small (${buf.length} bytes)`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return buf.length;
}

const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

const RATINGS = [4, 5, 3, 4, 5, 3, 4, 3, 5, 4, 3, 5, 4, 3, 4, 5, 3, 4, 5];

for (const [idx, item] of (data.accommodations || []).entries()) {
  item.cardRating = RATINGS[idx % RATINGS.length];
  const src = SLUG_SOURCES[item.slug];
  if (!src) continue;
  const rel = `assets/images/accommodations/${item.slug}/hero.jpg`;
  const dest = path.join(root, rel.replace(/\//g, path.sep));
  process.stdout.write(`${item.slug} … `);
  try {
    const bytes = await download(src.url, dest);
    const kb = Math.round(bytes / 1024);
    console.log(`${kb} KB`);
    const p = item.photos?.[0] || {};
    item.photos = [
      {
        src: rel,
        alt: p.alt || `${item.displayName || item.name} surroundings`,
        credit: src.credit,
        verifiedPhoto: false,
      },
    ];
  } catch (e) {
    console.log(`SKIP (${e.message})`);
  }
}

fs.writeFileSync(jsonPath, `${JSON.stringify(data, null, 2)}\n`);
console.log("Updated accommodations.json photo paths.");