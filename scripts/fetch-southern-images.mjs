import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const base = "https://www.tanzaniatourism.com/";

const downloads = [
  {
    dir: "udzungwa",
    files: [
      ["hero.jpg", "images/uploads/Udzungwa_National_Park_Sanje_Waterfalls_21.jpg"],
      ["gallery-1.jpg", "images/uploads/Udzungwa_National_Park_Udzungwa_Red_Colobus_17.jpg"],
      ["gallery-2.jpg", "images/uploads/Udzungwa_National_Park_Sonjo__Natural_Pool_28.jpg"],
      ["gallery-3.jpg", "images/uploads/Udzungwa_National_Park_Moloneys_Monkey_18.jpg"],
      ["gallery-4.jpg", "images/uploads/Udzungwa_National_Park_Sanje_Crested_Mangabey_Monkey_22.jpg"],
      ["gallery-5.jpg", "images/uploads/Udzungwa_National_Park_Sanje_Waterfalls_21.jpg"],
    ],
  },
  {
    dir: "mikumi",
    files: [
      ["hero.jpg", "images/uploads/Mikumi_National_Park_Elephants_101.jpg"],
      ["gallery-1.jpg", "images/uploads/Mikumi_National_Park_Zebras_111.jpg"],
      ["gallery-2.jpg", "images/uploads/Mikumi_National_Park_Wildlife_110.jpg"],
      ["gallery-3.jpg", "images/uploads/Mikumi_National_Park_Impalas_30.jpg"],
      ["gallery-4.jpg", "images/uploads/Mikumi_National_Park_Zebras_107.jpg"],
      ["gallery-5.jpg", "images/uploads/Mikumi_National_Park_Stocks_200.jpg"],
    ],
  },
  {
    dir: "ruaha",
    files: [
      ["hero.jpg", "images/uploads/Ruaha_National_Park_Tanzania.jpg"],
      ["gallery-1.jpg", "images/uploads/Ruaha_National_Park_Ruaha_River_85.jpg"],
      ["gallery-2.jpg", "images/uploads/Ruaha_National_Park_Baobab_Landscape_10.jpg"],
      ["gallery-3.jpg", "images/uploads/Ruaha_National_Park_Kudus_69.jpg"],
      ["gallery-4.jpg", "images/uploads/Ruaha_National_Park_Hippos_47.jpg"],
      ["gallery-5.jpg", "images/uploads/Ruaha_National_Park_Leopard_72.jpg"],
    ],
  },
  {
    dir: "uluti",
    files: [
      ["hero.jpg", "images/uploads/Uluguru_Mountains_from_Morogoro_01.jpg"],
      ["gallery-1.jpg", "images/uploads/Uluguru_Mountains_Waterfalls_03.jpg"],
      ["gallery-2.jpg", "images/uploads/Uluguru_Mountains_Hiking_to_Kinole.jpg"],
      ["gallery-3.jpg", "images/uploads/Uluguru_Mountains_view_from_Morogoro_Town.jpg"],
      ["gallery-4.jpg", "images/uploads/Uluguru_Mountains_Waterfalls_06.jpg"],
      ["gallery-5.jpg", "images/uploads/Uluguru_Mountains_02.jpg"],
    ],
  },
];

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

for (const group of downloads) {
  const outDir = path.join(root, "assets", "images", "southern-circuit", group.dir);
  fs.mkdirSync(outDir, { recursive: true });
  for (const [name, rel] of group.files) {
    const url = base + rel.replace(/^\//, "");
    const dest = path.join(outDir, name);
    process.stdout.write(`GET ${group.dir}/${name} … `);
    try {
      await download(url, dest);
      const kb = Math.round(fs.statSync(dest).size / 1024);
      console.log(`${kb} KB`);
    } catch (e) {
      console.log(`FAILED (${e.message})`);
    }
  }
}

console.log("Done.");
