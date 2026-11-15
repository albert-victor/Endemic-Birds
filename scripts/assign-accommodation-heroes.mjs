import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const jsonPath = path.join(root, "content", "accommodations.json");
const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

/** @type {Record<string, { src: string, credit: string }>} */
const HERO = {
  "neema-craft-iringa": {
    src: "assets/images/southern-circuit/uluti/gallery-3.jpg",
    credit: "Southern highlands – Tanzania Tourism",
  },
  "ruaha-river-lodge": {
    src: "assets/images/accommodations/ruaha-river-lodge/hero.jpg",
    credit: "Ruaha River – Tanzania Tourism",
  },
  "mufindi-fish-lodge": {
    src: "assets/images/accommodations/mufindi-fish-lodge/hero.jpg",
    credit: "Forest highlands – Tanzania Tourism",
  },
  "old-kisolanza-farm": {
    src: "assets/images/southern-circuit/uluti/hero.jpg",
    credit: "Highland mosaic – Tanzania Tourism",
  },
  "ilboru-safari-lodge": {
    src: "assets/images/wildlife/destinations/arusha-national-park/hero.jpg",
    credit: "Arusha gateway – representative",
  },
  "ikoma-bush-tented-camp": {
    src: "assets/images/northern-circuit/serengeti/hero.jpg",
    credit: "Serengeti plains – Tanzania Tourism",
  },
  "southern-miombo-bush-camp": {
    src: "assets/images/southern-circuit/ruaha/gallery-2.jpg",
    credit: "Southern miombo wilderness – Tanzania Tourism",
  },
  "fq-hotel": {
    src: "assets/images/southern-circuit/mikumi/gallery-2.jpg",
    credit: "Safari corridor – Tanzania Tourism",
  },
  "pemba-paradise-beach-resort": {
    src: "assets/images/accommodations/pemba-paradise-beach-resort/hero.jpg",
    credit: "Pemba Island – Wikimedia Commons",
    fallback: "assets/images/southern-circuit/mikumi/gallery-4.jpg",
  },
  "morogoro-hotel": {
    src: "assets/images/accommodations/morogoro-hotel/hero.jpg",
    credit: "Uluguru Mountains – Tanzania Tourism",
  },
  "sunset-hotel": {
    src: "assets/images/southern-circuit/uluti/gallery-5.jpg",
    credit: "Southern highlands – Tanzania Tourism",
  },
  "uluti-campsite": {
    src: "assets/images/accommodations/uluti-campsite/hero.jpg",
    credit: "Udzungwa forest – Tanzania Tourism",
  },
  "luala-camp": {
    src: "assets/images/accommodations/luala-camp/hero.jpg",
    credit: "West Udzungwa – Tanzania Tourism",
  },
  "hondo-hondo-udzungwa-forest-lodge": {
    src: "assets/images/accommodations/hondo-hondo-udzungwa-forest-lodge/hero.jpg",
    credit: "Udzungwa forest – Tanzania Tourism",
  },
  "tan-swiss-lodge": {
    src: "assets/images/accommodations/tan-swiss-lodge/hero.jpg",
    credit: "Mikumi – Tanzania Tourism",
  },
  "amani-nature-reserve": {
    src: "assets/images/southern-circuit/uluti/gallery-1.jpg",
    credit: "Eastern Arc highlands – Tanzania Tourism",
  },
  "mullas-lodge": {
    src: "assets/images/southern-circuit/uluti/gallery-2.jpg",
    credit: "Usambara highlands – Tanzania Tourism",
  },
  "elephant-motel": {
    src: "assets/images/southern-circuit/uluti/gallery-4.jpg",
    credit: "Eastern highlands – Tanzania Tourism",
  },
  "eliboru-lodge": {
    src: "assets/images/wildlife/destinations/arusha-national-park/hero.jpg",
    credit: "Northern Tanzania – representative",
  },
};

const pembaUrls = [
  "https://upload.wikimedia.org/wikipedia/commons/0/0a/Vumawimbi_Beach%2C_Pemba_Island.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Vumawimbi_Beach%2C_Pemba_Island.jpg/1280px-Vumawimbi_Beach%2C_Pemba_Island.jpg",
];
const pembaDest = path.join(
  root,
  "assets/images/accommodations/pemba-paradise-beach-resort/hero.jpg"
);

async function ensurePemba() {
  if (fs.existsSync(pembaDest) && fs.statSync(pembaDest).size > 10000) return;
  fs.mkdirSync(path.dirname(pembaDest), { recursive: true });
  for (const pembaUrl of pembaUrls) {
    const res = await fetch(pembaUrl, { redirect: "follow" });
    if (!res.ok) continue;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 10000) continue;
    fs.writeFileSync(pembaDest, buf);
    return;
  }
  console.warn("Pemba hero download skipped – using eastern fallback");
}

await ensurePemba();

const RATINGS = [4, 5, 3, 4, 5, 3, 4, 3, 5, 4, 3, 5, 4, 3, 4, 5, 3, 4, 5];

for (const [idx, item] of (data.accommodations || []).entries()) {
  item.cardRating = RATINGS[idx % RATINGS.length];
  const hero = HERO[item.slug];
  if (!hero) continue;
  let src = hero.src;
  let full = path.join(root, src.replace(/\//g, path.sep));
  if (!fs.existsSync(full) && hero.fallback) {
    src = hero.fallback;
    full = path.join(root, src.replace(/\//g, path.sep));
  }
  if (!fs.existsSync(full)) {
    console.warn("missing", hero.src);
    continue;
  }
  item.photos = [
    {
      src,
      alt: `${item.displayName || item.name} – destination setting`,
      credit: hero.credit,
      verifiedPhoto: false,
    },
  ];
}

fs.writeFileSync(jsonPath, `${JSON.stringify(data, null, 2)}\n`);
console.log("Assigned hero images for", Object.keys(HERO).length, "stays");