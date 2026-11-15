import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "content", "tour-calendar.json");

const ALLOWED = new Set(["available", "booked", "departure-open", "confirm-needed"]);
const ISO = /^\d{4}-\d{2}-\d{2}$/;

function parseDay(s) {
  if (!ISO.test(s)) return null;
  const d = new Date(`${s}T12:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function checkPeriod(arr, ctx, requireLabel = true) {
  const errors = [];
  for (const p of arr || []) {
    const start = parseDay(p.start);
    const end = parseDay(p.end);
    if (!start || !end) errors.push(`${ctx} ${p.id || "?"}: invalid start/end`);
    else if (end < start) errors.push(`${ctx} ${p.id || "?"}: end before start`);
    if (!ALLOWED.has(p.status)) errors.push(`${ctx} ${p.id || "?"}: bad status ${p.status}`);
    if (requireLabel && !String(p.publicLabel || "").trim()) {
      errors.push(`${ctx} ${p.id || "?"}: missing publicLabel`);
    }
    if (p.status === "booked" && p.clientName) {
      errors.push(`${ctx} ${p.id || "?"}: clientName must not be published`);
    }
    if (p.status === "departure-open" && p.visibility === "public" && !p.packageSlug) {
      errors.push(`${ctx} ${p.id || "?"}: departure-open should link packageSlug when public`);
    }
  }
  return errors;
}

const data = JSON.parse(fs.readFileSync(file, "utf8"));
const errors = [];

if (data.schemaVersion !== 1) errors.push("schemaVersion must be 1");

errors.push(
  ...checkPeriod(data.guides?.leons?.periods, "leons"),
  ...checkPeriod(data.departures, "departure"),
  ...checkPeriod(data.companyBlocks, "companyBlock")
);

if (errors.length) {
  console.error("tour-calendar.json validation failed:\n" + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}
console.log("tour-calendar.json OK");