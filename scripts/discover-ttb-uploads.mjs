const prefixes = [
  "Lake_Manyara_National_Park_",
  "Arusha_National_Park_",
  "Arusha_NP_",
  "Momella_",
  "Serengeti_National_Park_",
  "Serengeti_",
  "Tarangire_National_Park_",
  "Mikumi_National_Park_",
  "Nyerere_National_Park_",
  "Katavi_National_Park_",
  "Mahale_Mountains_National_Park_",
  "Mahale_Mountain_National_Park_",
];

const suffixes = [
  ...Array.from({ length: 120 }, (_, i) => `${i}.jpg`),
  ...Array.from({ length: 120 }, (_, i) => `${String(i).padStart(2, "0")}.jpg`),
  "Tanzania.jpg",
  "Elephants_101.jpg",
  "Lake_View_27.jpg",
];

const base = "https://www.tanzaniatourism.com/images/uploads/";

for (const prefix of prefixes) {
  const found = [];
  for (const suf of suffixes) {
    const file = prefix + suf;
    const res = await fetch(base + encodeURIComponent(file), { method: "HEAD" });
    if (res.ok) found.push(file);
    if (found.length >= 8) break;
  }
  if (found.length) console.log(prefix, "->", found.join(", "));
}
