const UA = "Mozilla/5.0";
const h = await (await fetch("https://tan-swiss.com/", { headers: { "User-Agent": UA } })).text();
const u = [
  ...new Set([...h.matchAll(/https:\/\/tan-swiss\.com\/wp-content\/uploads\/[^"'\s]+/g)].map((m) => m[0])),
];
const sizes = [];
for (const url of u) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    const b = Buffer.from(await r.arrayBuffer());
    sizes.push({ url, size: b.length });
  } catch {
    /* skip */
  }
}
sizes.sort((a, b) => b.size - a.size);
console.log(sizes.slice(0, 15));