const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
const sites = [
  "https://fqhotel.co.tz/",
  "https://fqhotel.co.tz/our-hotels/",
  "https://tan-swiss.com/",
  "https://www.elephantmotel.com/",
  "https://udzungwaforestlodge.com/",
  "https://www.morogorohotel.com/",
];

for (const url of sites) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
    const h = await r.text();
    const imgs = [...h.matchAll(/(?:src|data-src)=["']([^"']+\.(?:jpe?g|png|webp)[^"']*)["']/gi)].map(
      (m) => m[1]
    );
    const og =
      h.match(/property=["']og:image["'][^>]+content=["']([^"']+)/i)?.[1] ||
      h.match(/content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1];
    console.log("\n" + url, "status", r.status);
    if (og) console.log(" og:", og);
    const uniq = [...new Set(imgs)].slice(0, 12);
    for (const i of uniq) console.log(" ", i.slice(0, 100));
  } catch (e) {
    console.log(url, e.message);
  }
}