const url = process.argv[2] || "https://www.tanzaniatourism.com/destination/arusha-national-park";
const res = await fetch(url);
const html = await res.text();
const all = [...html.matchAll(/(?:https?:\/\/[^"'\s]+|\/images\/uploads\/[^"'\s]+|images\/uploads\/[^"'\s]+)/gi)].map((m) => m[0]);
const uniq = [...new Set(all)].filter((u) => u.includes("upload") || u.includes(".jpg"));
console.log(uniq.join("\n"));
