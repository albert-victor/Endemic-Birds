import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const base = "https://www.tanzaniatourism.com/images/uploads/";

/** @type {{ baseDir: string, folder: string, files: [string, string][] }[]} */
const downloads = [
  {
    baseDir: "southern-circuit",
    folder: "nyerere",
    files: [
      ["hero.jpg", "Selous_Game_Reserve_Aeroview.jpg"],
      ["gallery-1.jpg", "Nyerere_National_Park_Elephants_61.jpg"],
      ["gallery-2.jpg", "Nyerere_National_Park_Wildebeests_20.jpg"],
      ["gallery-3.jpg", "Nyerere_National_Park_Giraffes_104.jpg"],
      ["gallery-4.jpg", "Nyerere_National_Park_Wild_Dogs_100.jpg"],
      ["gallery-5.jpg", "Nyerere_National_Park_Elephants_25.jpg"],
    ],
  },
  {
    baseDir: "western-circuit",
    folder: "mahale",
    files: [
      ["hero.jpg", "Mahale_Mountain_National_Park.jpg"],
      ["gallery-1.jpg", "Mahale_Mountains_National_Park_Shore_of_Lake_Tanganyika_40.jpg"],
      ["gallery-2.jpg", "Mahale_Mountains_National_Park_Shoreline_73.jpg"],
      ["gallery-3.jpg", "Mahale_Mountains_National_Park_Chimp_44.jpg"],
      ["gallery-4.jpg", "Mahale_Mountains_National_Park_x_49.jpg"],
      ["gallery-5.jpg", "Mahale_Mountains_National_Park_x_61.jpg"],
    ],
  },
  {
    baseDir: "western-circuit",
    folder: "gombe",
    files: [
      ["hero.jpg", "Gombe_Stream_National_Park_Mountain_Forest_24.jpg"],
      ["gallery-1.jpg", "Gombe_Stream_National_Park_Boating_71.jpg"],
      ["gallery-2.jpg", "Gombe_Stream_National_Park_Kakombe_Waterfalls_39.jpg"],
      ["gallery-3.jpg", "Gombe_Stream_National_Park_Entrance_34.jpg"],
      ["gallery-4.jpg", "Gombe_Stream_National_Park_Boating_70.jpg"],
      ["gallery-5.jpg", "Gombe_Stream_National_Park_Chimp_15.jpg"],
    ],
  },
  {
    baseDir: "western-circuit",
    folder: "katavi",
    files: [
      ["hero.jpg", "Katavi_National_Park_x_70.jpg"],
      ["gallery-1.jpg", "Katavi_National_Park_Sunset_62.jpg"],
      ["gallery-2.jpg", "Katavi_National_Park_Waterbucks_21.jpg"],
      ["gallery-3.jpg", "Katavi_National_Park_Giraffes_55.jpg"],
      ["gallery-4.jpg", "Katavi_National_Park_Hippos_28.jpg"],
      ["gallery-5.jpg", "Katavi_National_Park_x_42.jpg"],
    ],
  },
  {
    baseDir: "western-circuit",
    folder: "rubondo",
    files: [
      ["hero.jpg", "Rubondo_Island_National_Park_x_13.jpg"],
      ["gallery-1.jpg", "Rubondo_Island_National_Park_x_32.jpg"],
      ["gallery-2.jpg", "Rubondo_Island_National_Park_x_21.jpg"],
      ["gallery-3.jpg", "Rubondo_Island_National_Park_Chimp_17.jpg"],
      ["gallery-4.jpg", "Rubondo_Island_National_Park_x_25.jpg"],
      ["gallery-5.jpg", "Rubondo_Island_National_Park_x_15.jpg"],
    ],
  },
  {
    baseDir: "western-circuit",
    folder: "burigi-chato",
    files: [
      ["hero.jpg", "Lake_Burigi_in_Chato_National_Park_08.jpg"],
      ["gallery-1.jpg", "Burigi_Chato_National_Park_Giraffes_07.jpg"],
      ["gallery-2.jpg", "Burigi_Chato_National_Park_Zebras_08.jpg"],
      ["gallery-3.jpg", "Burigi_Chato_National_Park_Impala_04.jpg"],
      ["gallery-4.jpg", "Burigi_Chato_National_Park_Impalas_02.jpg"],
      ["gallery-5.jpg", "Burigi_Chato_National_Park_Entrace_03.jpg"],
    ],
  },
  {
    baseDir: "northern-circuit",
    folder: "tarangire",
    files: [
      ["hero.jpg", "Tarangire_National_Park_20.jpg"],
      ["gallery-1.jpg", "Tarangire_National_Park_Baobab_Trees_20.jpg"],
      ["gallery-2.jpg", "Tarangire_National_Park_Elephants_in_Trangire_River_42.jpg"],
      ["gallery-3.jpg", "Tarangire_National_Park_Elephants_in_Trangire_River_35.jpg"],
      ["gallery-4.jpg", "Tarangire_National_Park_Baobab_Trees_21.jpg"],
      ["gallery-5.jpg", "Tarangire_National_Park_Elephants_20.jpg"],
    ],
  },
  {
    baseDir: "northern-circuit",
    folder: "serengeti",
    files: [
      ["hero.jpg", "Serengeti_Gnus_7765.jpg"],
      ["gallery-1.jpg", "Serengeti_Migration_P103.jpg"],
      ["gallery-2.jpg", "Serengeti_National_Park_Birdslife_20.jpg"],
      ["gallery-3.jpg", "Serengeti_National_Park_Zebras_20.jpg"],
      ["gallery-4.jpg", "Serengeti_National_Park_Lions_24.jpg"],
      ["gallery-5.jpg", "Serengeti_National_Park_Leopard_23.jpg"],
    ],
  },
];

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

for (const group of downloads) {
  const outDir = path.join(root, "assets", "images", group.baseDir, group.folder);
  fs.mkdirSync(outDir, { recursive: true });
  for (const [name, file] of group.files) {
    const url = base + file;
    const dest = path.join(outDir, name);
    process.stdout.write(`GET ${group.baseDir}/${group.folder}/${name} … `);
    try {
      await download(url, dest);
      console.log(`${Math.round(fs.statSync(dest).size / 1024)} KB`);
    } catch (e) {
      console.log(`FAILED (${e.message})`);
    }
  }
}

console.log("Circuit images done. Run fetch-southern-images.mjs for original southern set if needed.");
