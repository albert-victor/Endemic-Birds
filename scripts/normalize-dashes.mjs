#!/usr/bin/env node
/**
 * Replace em dash (U+2014) with en dash (U+2013) across site text sources.
 * Also normalizes &ndash; → &ndash; in HTML/text. Writes UTF-8 (no BOM).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EM = "\u2014";
const EN = "\u2013";

const exts = new Set([".html", ".json", ".js", ".css", ".md", ".mjs"]);
const skipDirs = new Set(["node_modules", ".git", "endemics", "assets/images"]);

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(name.name)) continue;
    const full = path.join(dir, name.name);
    if (name.isDirectory()) walk(full, files);
    else if (exts.has(path.extname(name.name).toLowerCase())) files.push(full);
  }
  return files;
}

function normalizeDashes(text) {
  let next = text.split(EM).join(EN);
  next = next.replace(/&ndash;/g, "&ndash;");
  next = next.replace(/&#8211;/g, "&#8211;");
  return next;
}

let charTotal = 0;
let entityTotal = 0;
let filesChanged = 0;

for (const file of walk(root)) {
  const text = fs.readFileSync(file, "utf8");
  if (!text.includes(EM) && !text.includes("&ndash;") && !text.includes("&#8211;")) continue;
  const beforeEm = (text.match(/\u2014/g) || []).length;
  const beforeEnt =
    (text.match(/&ndash;/g) || []).length + (text.match(/&#8211;/g) || []).length;
  const next = normalizeDashes(text);
  if (next !== text) {
    fs.writeFileSync(file, next, { encoding: "utf8" });
    filesChanged++;
    charTotal += beforeEm;
    entityTotal += beforeEnt;
    console.log(`${path.relative(root, file)}: ${beforeEm} em, ${beforeEnt} entities`);
  }
}

console.log(
  `Done. ${filesChanged} file(s); ${charTotal} U+2014 → U+2013; ${entityTotal} entity(ies) normalized.`
);
