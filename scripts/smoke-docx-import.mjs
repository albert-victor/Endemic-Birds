/**
 * Smoke-test packages after docx import: JSON validity, pages, local HTTP.
 */
import fs from "fs";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const report = JSON.parse(fs.readFileSync(path.join(root, "content", "docx-import-report.json"), "utf8"));
const packages = JSON.parse(fs.readFileSync(path.join(root, "content", "packages.json"), "utf8"));
const port = Number(process.env.PORT || 3000);

const slugs = report.results.map((r) => r.slug);
const failures = [];

for (const slug of slugs) {
  const pkg = packages.find((p) => p.slug === slug);
  if (!pkg) failures.push(`${slug}: missing from packages.json`);
  else if (!pkg.itinerary?.length) failures.push(`${slug}: empty itinerary`);
  else if (pkg.durationDays && pkg.itinerary.length < Math.min(pkg.durationDays, 3)) {
    failures.push(`${slug}: only ${pkg.itinerary.length} itinerary rows for ${pkg.durationDays}-day trip`);
  }
  const page = path.join(root, "packages", slug, "index.html");
  if (!fs.existsSync(page)) failures.push(`${slug}: no packages/${slug}/index.html`);
  const hero = path.join(root, pkg?.heroImage || "");
  if (pkg?.heroImage && !fs.existsSync(hero)) failures.push(`${slug}: missing hero ${pkg.heroImage}`);
}

function get(pathname) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${port}${pathname}`, (res) => {
      res.resume();
      resolve(res.statusCode);
    });
    req.on("error", reject);
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error("timeout"));
    });
  });
}

const httpChecks = [];
try {
  httpChecks.push(["/", await get("/")]);
  httpChecks.push(["/packages/index.html", await get("/packages/index.html")]);
  for (const slug of slugs.slice(0, 6)) {
    httpChecks.push([`/packages/${slug}/`, await get(`/packages/${slug}/`)]);
  }
} catch (e) {
  failures.push(`HTTP smoke skipped or failed (${e.message}) – run npm start on port ${port}`);
}

const out = {
  runAt: new Date().toISOString(),
  slugsChecked: slugs.length,
  failures,
  httpChecks,
  ok: failures.length === 0,
};

fs.writeFileSync(path.join(root, "content", "docx-smoke-report.json"), JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(out.ok ? "Smoke OK" : `Smoke FAILED: ${failures.join("; ")}`);
if (!out.ok) process.exitCode = 1;