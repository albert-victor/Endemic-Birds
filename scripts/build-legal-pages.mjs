import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function legalShell({ title, description, depth, bodyHtml, robots }) {
  const prefix = "../".repeat(depth);
  const robotsMeta = robots ? `    <meta name="robots" content="${robots}" />\n` : "";
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
${robotsMeta}    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Marck+Script&display=swap" rel="stylesheet" />
    <link rel="icon" href="${prefix}assets/images/from-live-site/brand/bird-logo.png" />
    <link rel="stylesheet" href="${prefix}assets/css/styles.css" />
    <link rel="stylesheet" href="${prefix}assets/css/site-enhancements.css" />
  </head>
  <body class="has-grain" data-nav="about">
    <a class="skip-link" href="#main">Skip to main content</a>
    <div id="site-header"></div>
    <main id="main">
      <section class="section" style="padding-top: 7rem">
        <div class="container legal-prose">
          ${bodyHtml}
        </div>
      </section>
    </main>
    <div id="site-footer"></div>
    <script>window.__ASSET_PREFIX__ = "${prefix}";</script>
    <script src="${prefix}assets/js/layout.js" defer></script>
    <script src="${prefix}assets/js/motion.js" defer></script>
    <script src="${prefix}assets/js/main.js" defer></script>
  </body>
</html>`;
}

const drafts = [
  {
    dir: "about/policies/booking-terms",
    depth: 3,
    title: "Booking & payment terms (draft) | Endemic Birds",
    description: "Owner draft – booking and payment terms for Endemic Birds Tanzania safaris; not final legal text.",
    body: `<div class="legal-draft-banner" role="alert">
        <strong>Internal draft – not final policy.</strong> Do not rely on this page for contractual terms. Booking rules are confirmed in writing on your itinerary.
      </div>
      <p class="legal-updated"><strong>Status:</strong> Awaiting owner / legal approval</p>
      <h1>Booking &amp; payment terms</h1>
      <p>Placeholder sections for owner completion:</p>
      <h2>1. How a booking is formed</h2>
      <p>[Owner: describe when an enquiry becomes a confirmed booking – written proposal, signed agreement, deposit received.]</p>
      <h2>2. Deposits</h2>
      <p>[Owner: deposit amount or formula – do not publish until approved.]</p>
      <h2>3. Balance payments</h2>
      <p>[Owner: due dates, currencies accepted, bank details reference in private documents only.]</p>
      <h2>4. Changes before travel</h2>
      <p>[Owner: how itinerary changes are agreed and priced.]</p>
      <h2>5. Third-party costs</h2>
      <p>Park fees, permits, flights and lodge charges may pass through from suppliers – itemise on the confirmed proposal.</p>
      <p><a href="../../../about/policies/index.html">← Terms &amp; policies hub</a></p>`,
  },
  {
    dir: "about/policies/cancellation-refund",
    depth: 3,
    title: "Cancellation & refunds (draft) | Endemic Birds",
    description: "Owner draft – cancellation and refund policy; not final legal text.",
    body: `<div class="legal-draft-banner" role="alert">
        <strong>Internal draft – not final policy.</strong> No cancellation percentages or refund promises appear here until the owner approves final text.
      </div>
      <p class="legal-updated"><strong>Status:</strong> Awaiting owner / legal approval</p>
      <h1>Cancellation &amp; refund policy</h1>
      <h2>1. Guest-initiated cancellation</h2>
      <p>[Owner: tiered notice periods and any non-refundable components.]</p>
      <h2>2. Changes by Endemic Birds</h2>
      <p>[Owner: force majeure, park closures, safety – alternatives offered.]</p>
      <h2>3. Refunds</h2>
      <p>[Owner: method and timing of refunds when due.]</p>
      <h2>4. Insurance</h2>
      <p>Guests are advised to carry travel insurance covering cancellation and medical evacuation – policy selection is the traveller's responsibility.</p>
      <p><a href="../../../about/policies/index.html">← Terms &amp; policies hub</a></p>`,
  },
  {
    dir: "about/policies/terms-of-service",
    depth: 3,
    title: "Website terms of service (draft) | Endemic Birds",
    description: "Owner draft – website terms of service for endemicbirds.co.tz; not final legal text.",
    body: `<div class="legal-draft-banner" role="alert">
        <strong>Internal draft – not final policy.</strong> For use of the website and enquiries only – safari contracts are separate confirmed documents.
      </div>
      <p class="legal-updated"><strong>Status:</strong> Awaiting owner / legal approval</p>
      <h1>Terms of service (website)</h1>
      <h2>1. About this site</h2>
      <p>Information on journeys, destinations and species is for planning – availability and pricing are confirmed when you enquire.</p>
      <h2>2. Acceptable use</h2>
      <p>[Owner: prohibited conduct, scraping, misuse of enquiry forms.]</p>
      <h2>3. Intellectual property</h2>
      <p>Text, photos and branding belong to Endemic Birds or licensors – do not reuse without permission.</p>
      <h2>4. Third-party links</h2>
      <p>WhatsApp, map tiles, form processors and lodge sites have their own terms.</p>
      <h2>5. Limitation of liability</h2>
      <p>[Owner: lawyer-reviewed limitation for website content accuracy – especially calendar and species information.]</p>
      <h2>6. Governing law</h2>
      <p>[Owner: specify jurisdiction – not stated until legal review.]</p>
      <p><a href="../../../about/policies/index.html">← Terms &amp; policies hub</a></p>`,
  },
];

for (const d of drafts) {
  const dir = path.join(root, d.dir);
  fs.mkdirSync(dir, { recursive: true });
  const html = legalShell({
    title: d.title,
    description: d.description,
    depth: d.depth,
    bodyHtml: d.body,
    robots: "noindex, follow",
  });
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
}

console.log(`Generated ${drafts.length} draft policy pages.`);