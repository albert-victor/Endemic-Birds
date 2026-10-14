const pages = [
  "https://www.tanzaniatourism.com/destination/arusha-national-park",
  "https://www.tanzaniatourism.com/destination/lake-manyara-national-park",
  "https://www.tanzaniatourism.com/destination/mikumi-national-park",
  "https://www.tanzaniatourism.com/destination/ruaha-national-park",
  "https://www.tanzaniatourism.com/destination/nyerere-national-park",
  "https://www.tanzaniatourism.com/destination/katavi-national-park",
  "https://www.tanzaniatourism.com/destination/mahale-mountains-national-park",
  "https://www.tanzaniatourism.com/destination/tarangire-national-park",
  "https://www.tanzaniatourism.com/destination/serengeti-national-park",
  "https://www.tanzaniatourism.com/destination/ngorongoro-conservation-area",
];

for (const url of pages) {
  const res = await fetch(url, { redirect: "follow" });
  const html = await res.text();
  const imgs = [...html.matchAll(/images\/uploads\/[^"'\\s>]+\.(?:jpg|jpeg|png)/gi)].map((m) => m[0]);
  const uniq = [...new Set(imgs)];
  console.log("\n===", url.split("/").pop(), res.status, uniq.length, "images ===");
  console.log(uniq.slice(0, 8).join("\n"));
}
