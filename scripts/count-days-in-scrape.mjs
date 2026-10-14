import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { collectTextEditorHtml, parseItineraryFromBlob } from "./import-itineraries-from-live.mjs";

const slug = process.argv[2];
const html = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "content/scrapes/packages", `${slug}.html`),
  "utf8"
);
const blob = collectTextEditorHtml(html);
const days = parseItineraryFromBlob(blob);
console.log(slug, "parsed", days.length, "max day", Math.max(...days.map((d) => d.day)));
