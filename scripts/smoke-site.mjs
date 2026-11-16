/**
 * Site smoke test – links, detail/JSON integrity, HTTP sanity on local server.
 * Usage: node scripts/smoke-site.mjs [baseUrl]
 * Default: http://127.0.0.1:3000
 */
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = (process.argv[2] || process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

function runNodeScript(rel) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(root, rel)], {
      cwd: root,
      stdio: "inherit",
      shell: false,
    });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${rel} exited ${code}`))));
  });
}

async function fetchText(urlPath) {
  const res = await fetch(`${base}${urlPath}`);
  const text = await res.text();
  return { status: res.status, text, url: urlPath };
}

async function smokeHttp() {
  const checks = [
    { path: "/index.html", status: 200, includes: ["Endemic Birds", 'id="main"'] },
    { path: "/packages/6-days-tanzania-safari/", status: 200, includes: ["data-detail=", "detail.js", "layout.js"] },
    { path: "/destinations/southern-destination/", status: 200, includes: ["data-detail=", "detail.js"] },
    { path: "/wildlife/destinations/serengeti-national-park/", status: 200, includes: ["wildlife-destination", "detail.js"] },
    { path: "/accommodations/tan-swiss-lodge/", status: 200, includes: ["accommodation", "accommodation-detail.js"] },
    { path: "/destinations/amani-nature-reserve/", status: 200, includes: ["data-slug=\"amani-nature-reserve\"", "detail.js"] },
    { path: "/assets/js/detail.js", status: 200, includes: ["showDetailPlacehold", "showEndemicPlacehold"] },
    { path: "/this-path-does-not-exist-404-smoke/", status: 404, includes: ["placehold-page"] },
    { path: "/404.html", status: 200, includes: ["placehold-page.js", "EndemicPlacehold"] },
    { path: "/assets/js/placehold-page.js", status: 200, includes: ["EndemicPlacehold"] },
    { path: "/endemics/slideshow-main.jpg", status: 200, includes: [] },
  ];

  const failures = [];
  for (const c of checks) {
    let result;
    try {
      result = await fetchText(c.path);
    } catch (e) {
      failures.push(`${c.path}: fetch failed – ${e.message}`);
      continue;
    }
    if (result.status !== c.status) {
      failures.push(`${c.path}: expected HTTP ${c.status}, got ${result.status}`);
    }
    for (const needle of c.includes) {
      if (!result.text.includes(needle)) {
        failures.push(`${c.path}: missing "${needle}" in response`);
      }
    }
  }
  return failures;
}

async function main() {
  console.log("Smoke: audit links (static)…");
  await runNodeScript("scripts/audit-links.mjs");

  console.log("Smoke: detail / JSON scope…");
  await runNodeScript("scripts/count-placehold-scope.mjs");

  console.log(`Smoke: HTTP at ${base}…`);
  let httpFailures = [];
  try {
    httpFailures = await smokeHttp();
  } catch (e) {
    console.error(`HTTP smoke skipped or failed: ${e.message}`);
    console.error("Start server: npm start");
    process.exitCode = 1;
    return;
  }

  if (httpFailures.length) {
    console.error(`HTTP smoke failures (${httpFailures.length}):`);
    for (const f of httpFailures) console.error(`  - ${f}`);
    process.exitCode = 1;
  } else {
    console.log("HTTP smoke: all checks passed.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});