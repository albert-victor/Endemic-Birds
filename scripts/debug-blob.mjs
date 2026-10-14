import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const slug = process.argv[2] || "12-day-endemic-birds-northern";
const html = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "content/scrapes/packages", `${slug}.html`),
  "utf8"
);

const re =
  /<div class="[^"]*elementor-widget-text-editor[^"]*"[\s\S]*?<div class="elementor-widget-container">\s*([\s\S]*?)\s*<\/div>\s*<\/div>/gi;
const m = re.exec(html);
if (!m) {
  console.log("no match");
  process.exit(1);
}
console.log("capture len", m[1].length);
console.log("has Day 2", /Day 2/i.test(m[1]));
console.log(m[1].slice(0, 300));
