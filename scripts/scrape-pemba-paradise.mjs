const UA = "Mozilla/5.0";
const html = await (await fetch("https://pembaparadise.com/", { headers: { "User-Agent": UA } })).text();
const imgs = [
  ...new Set(
    [...html.matchAll(/(?:src|data-src|data-lazy-src)=["']([^"']+)["']/gi)]
      .map((m) => m[1])
      .filter((u) => /.(jpe?g|webp)/i.test(u))
  ),
];
console.log(imgs.slice(0, 20));