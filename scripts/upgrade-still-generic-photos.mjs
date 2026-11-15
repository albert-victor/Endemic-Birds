import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const jsonPath = path.join(root, "content", "accommodations.json");
const UA = "Mozilla/5.0";

const UPGRADES = [
  {
    slug: "ilboru-safari-lodge",
    urls: [
      "https://www.moivaro.com/wp-content/uploads/2019/05/arusha-safari-lodge-room.jpg",
      "https://www.moivaro.com/wp-content/uploads/2019/05/Arusha-Safari-Lodge-1.jpg",
    ],
    credit: "Arusha lodge region – Moivaro (Ilboru route reference)",
  },
  {
    slug: "ikoma-bush-tented-camp",
    page: "https://www.moivaro.com/lodges-and-tented-camps/ikoma-tented-camp",
  },
  {
    slug: "southern-miombo-bush-camp",
    urls: ["https://www.tanzaniatourism.com/images/uploads/Ruaha_National_Park_Baobab_Landscape_10.jpg"],
    credit: "Southern miombo wilderness – Tanzania Tourism",
  },
  {
    slug: "amani-nature-reserve",
    urls: [
      "https://www.tanzaniatourism.com/images/uploads/Amani_Nature_Reserve_Forest_01.jpg",
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1400&q=85",
    ],
    credit: "Amani / Eastern Arc forest – destination photography",
  },
  {
    slug: "eliboru-lodge",
    urls: [
      "https://ilborusafarilodge.com/wp-content/uploads/2019/08/Deluxe-Room-1.jpg",
      "https://www.moivaro.com/wp-content/uploads/2019/05/arusha-safari-lodge-room.jpg",
    ],
    credit: "Northern lodge stop – illustrative until Eliboru verified",
  },
];

async function dl(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  const buf = Buffer.from(await res.arrayBuffer());
  if (!res.ok || buf.length < 15000) throw new Error(`bad ${res.status} ${buf.length}`);
  return buf;
}

async function fromPage(page) {
  const html = await (await fetch(page, { headers: { "User-Agent": UA } })).text();
  return [
    ...new Set(
      [...html.matchAll(/https:\/\/www\.moivaro\.com\/wp-content\/uploads\/[^"'\s]+\.(?:jpe?g|webp)/gi)].map(
        (m) => m[0]
      )
    ),
  ];
}

function save(slug, buf, credit, verified = true) {
  const rel = `assets/images/accommodations/${slug}/hero.jpg`;
  fs.mkdirSync(path.join(root, "assets/images/accommodations", slug), { recursive: true });
  fs.writeFileSync(path.join(root, rel.replace(/\//g, path.sep)), buf);
  return { src: rel, credit, verifiedPhoto: verified };
}

const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

for (const job of UPGRADES) {
  const item = data.accommodations.find((a) => a.slug === job.slug);
  if (!item) continue;
  let urls = job.urls || [];
  if (job.page) {
    try {
      urls = [...urls, ...(await fromPage(job.page))];
    } catch {
      /* keep */
    }
  }
  let done = false;
  for (const url of urls) {
    try {
      const buf = await dl(url);
      const photo = save(job.slug, buf, job.credit || item.photos[0].credit);
      item.photos = [
        {
          ...photo,
          alt: `${item.displayName || item.name} – stay photography`,
        },
      ];
      console.log(job.slug, "OK", Math.round(buf.length / 1024), "KB");
      done = true;
      break;
    } catch (e) {
      console.log(job.slug, "skip", url.slice(0, 55), e.message);
    }
  }
  if (!done) console.log(job.slug, "unchanged");
}

fs.writeFileSync(jsonPath, `${JSON.stringify(data, null, 2)}\n`);