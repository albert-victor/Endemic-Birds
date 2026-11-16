(function () {
  if (document.body.dataset.detail !== "accommodation") return;

  const slug = document.body.dataset.slug;
  const prefix = window.__ASSET_PREFIX__ || "/";
  const asset = (p) => prefix + String(p).replace(/^\//, "");
  const main = document.querySelector("#main");

  const COMFORT_LABELS = {
    budget: "Budget",
    "mid-range": "Mid-range / premium",
    luxury: "Luxury",
  };

  const TYPE_LABELS = {
    lodge: "Lodge",
    "tented-camp": "Tented camp",
    campsite: "Campsite",
    villa: "Villa",
    "bush-retreat": "Bush retreat",
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function loadJson(file) {
    const res = await fetch(asset(`content/${file}`));
    if (!res.ok) throw new Error(file);
    return res.json();
  }

  async function heroUrl(preferred) {
    if (window.EndemicMedia?.whenReady) await window.EndemicMedia.whenReady();
    const path = window.EndemicMedia?.resolveHero?.(slug, preferred) || preferred;
    if (window.EndemicMedia?.cssUrl) return window.EndemicMedia.cssUrl(path);
    return asset(path);
  }

  function metaChips(item) {
    const chips = [];
    if (item.circuit) chips.push(`<span class="acc-chip">${escapeHtml(item.circuit)} circuit</span>`);
    if (item.propertyType)
      chips.push(`<span class="acc-chip">${escapeHtml(TYPE_LABELS[item.propertyType] || item.propertyType)}</span>`);
    if (item.comfortLevel)
      chips.push(`<span class="acc-chip">${escapeHtml(COMFORT_LABELS[item.comfortLevel] || item.comfortLevel)}</span>`);
    return chips.join("");
  }

  function photoBlock(photos) {
    const p = (photos || [])[0];
    if (!p) return "";
    const note = p.verifiedPhoto
      ? ""
      : `<p class="acc-photo-note" role="note">Illustrative image – ${escapeHtml(p.credit || "photo pending")}</p>`;
    return `<figure class="acc-hero-figure">
      <img class="acc-hero-img" src="${asset(p.src)}" alt="${escapeHtml(p.alt || "")}" loading="eager" />
      <figcaption class="acc-photo-credit">${escapeHtml(p.credit || "")}</figcaption>
      ${note}
    </figure>`;
  }

  function linkList(title, links) {
    if (!links.length) return "";
    return `<section class="detail-section reveal" data-reveal>
      <h2 class="detail-heading">${escapeHtml(title)}</h2>
      <ul class="acc-link-list">${links
        .map((l) => `<li><a href="${l.href}">${escapeHtml(l.label)}</a></li>`)
        .join("")}</ul>
    </section>`;
  }

  Promise.all([loadJson("accommodations.json"), loadJson("packages.json")])
    .then(async ([data, packages]) => {
      const item = (data.accommodations || []).find((a) => a.slug === slug && a.verified);
      if (!main) return;
      if (!item) {
        const show = window.showEndemicPlacehold;
        if (typeof show === "function") {
          await show("not-found");
        } else if (window.EndemicPlacehold?.ensureLoaded && window.EndemicPlacehold?.mount) {
          await window.EndemicPlacehold.ensureLoaded();
          window.EndemicPlacehold.mount(main, "not-found");
        }
        return;
      }

      const hero = await heroUrl(item.photos?.[0]?.src);
      const related = (item.packageSlugs || [])
        .map((s) => packages.find((p) => p.slug === s))
        .filter(Boolean)
        .slice(0, 6);

      const destLinks = (item.nearbyDestinationSlugs || []).map((s) => ({
        href: asset(`destinations/${s}/`),
        label: s.replace(/-/g, " "),
      }));
      const wildLinks = (item.nearbyWildlifeSlugs || []).map((s) => ({
        href: asset(`wildlife/destinations/${s}/`),
        label: s.replace(/-/g, " "),
      }));

      const facilities = item.facilities?.length
        ? `<ul>${item.facilities.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>`
        : `<p class="meta-line">Facilities are confirmed in your written proposal – not listed here.</p>`;

      const accessibility = item.accessibility
        ? `<p>${escapeHtml(item.accessibility)}</p>`
        : `<p class="meta-line">Accessibility varies by room and season – ask when you enquire.</p>`;

      const enquiryHref = `${asset("plan-your-trip/index.html")}?accommodation=${encodeURIComponent(item.slug)}&note=${encodeURIComponent(`Interested in lodge style similar to: ${item.name}`)}`;
      const pendingNote = item.confirmationPending
        ? `<p class="acc-disclaimer acc-disclaimer--pending" role="note">Property details or location are pending owner confirmation – treat this page as a planning note, not a live inventory listing.</p>`
        : "";
      const websiteLink =
        item.website && /^https?:\/\//i.test(item.website)
          ? `<p class="meta-line">Official site: <a href="${String(item.website).replace(/"/g, "&quot;")}" rel="noopener noreferrer" target="_blank">${escapeHtml(item.website.replace(/^https?:\/\//, ""))}</a></p>`
          : "";
      const taglineBlock = item.tagline
        ? `<p class="detail-lead detail-lead--italic"><em>${escapeHtml(item.tagline)}</em></p>`
        : "";

      main.innerHTML = `<article class="detail-article acc-detail">
        <header class="detail-hero acc-detail-hero" style="--detail-hero-url: url('${hero}')">
          <div class="container detail-hero-inner">
            <nav class="breadcrumbs" aria-label="Breadcrumb"><ol>
              <li><a href="${asset("index.html")}">Home</a></li>
              <li><a href="${asset("accommodations/index.html")}">Accommodation</a></li>
              <li><span aria-current="page">${escapeHtml(item.name)}</span></li>
            </ol></nav>
            <div class="acc-meta-row">${metaChips(item)}</div>
            <h1 class="detail-title">${escapeHtml(item.displayName || item.name)}</h1>
            <p class="detail-lead">${escapeHtml(item.location || "")}</p>
            ${taglineBlock}
            ${pendingNote}
            <p class="acc-disclaimer" role="note">Planning reference from published itineraries – not a live booking listing. Equivalent properties may apply on your confirmed proposal.</p>
            ${websiteLink}
          </div>
        </header>
        <div class="container detail-body-grid acc-detail-body">
          <div class="detail-main">
            ${photoBlock(item.photos)}
            <section class="detail-section reveal" data-reveal>
              <h2 class="detail-heading">Overview</h2>
              <p>${escapeHtml(item.summary || "")}</p>
            </section>
            <section class="detail-section reveal" data-reveal>
              <h2 class="detail-heading">Birding setting</h2>
              <p>${escapeHtml(item.birdingSetting || "Ask how this base fits your target habitats.")}</p>
            </section>
            <section class="detail-section reveal" data-reveal>
              <h2 class="detail-heading">Facilities</h2>
              ${facilities}
            </section>
            <section class="detail-section reveal" data-reveal>
              <h2 class="detail-heading">Accessibility</h2>
              ${accessibility}
            </section>
            ${linkList("Nearby destinations", [...destLinks, ...wildLinks])}
            ${
              related.length && window.EndemicUI
                ? `<section class="detail-section reveal" data-reveal>
              <h2 class="detail-heading">Journeys that name this stay</h2>
              <p class="meta-line">These packages mention this property – routing and lodge order may still change by season.</p>
              ${window.EndemicUI.renderPackageCorpGrid(related, asset)}
            </section>`
                : ""
            }
          </div>
          <aside class="detail-aside acc-detail-aside">
            <div class="detail-cta-card reveal" data-reveal>
              <p class="eyebrow">Enquire</p>
              <h2 class="detail-cta-title">${escapeHtml(item.name)}</h2>
              <p class="meta-line">Tell us dates and pace – we reply with lodge style and a route outline.</p>
              <a class="btn btn-solid btn-block" href="${enquiryHref}">Enquire on this property</a>
              <a class="btn btn-outline btn-block" href="${asset("packages/index.html")}">Browse all journeys</a>
            </div>
          </aside>
        </div>
      </article>`;

      document.title = item.seo?.title || `${item.name} | Endemic Birds`;
      document.dispatchEvent(new CustomEvent("site:content-rendered"));
    })
    .catch(console.error);
})();