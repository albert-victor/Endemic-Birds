(function () {
  const detailType = document.body.dataset.detail;
  const slug = document.body.dataset.slug;
  if (!detailType || !slug) return;

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  const prefix = window.__ASSET_PREFIX__ || "/";
  const asset = (p) => prefix + p.replace(/^\//, "");

  async function heroUrl(key, preferred) {
    if (window.EndemicMedia?.whenReady) await window.EndemicMedia.whenReady();
    const path = window.EndemicMedia?.resolveHero(key, preferred) || preferred;
    if (window.EndemicMedia?.cssUrl) return window.EndemicMedia.cssUrl(path);
    return asset(path);
  }

  const categoryLabels = {
    birding: "Birding-focused",
    wildlife: "Wildlife-focused",
    combined: "Birding + Wildlife",
  };

  function shortTitle(title) {
    return String(title || "")
      .replace(/^\d+\s+Days?\s+/i, "")
      .replace(/^\d+-Day\s+/i, "")
      .trim();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function loadJson(file) {
    const res = await fetch(asset(`content/${file}`));
    if (!res.ok) throw new Error(`Failed to load ${file}`);
    return res.json();
  }

  async function showDetailPlacehold(variant = "not-found") {
    const main = document.getElementById("main");
    if (!main) return;
    try {
      if (window.EndemicPlacehold?.ensureLoaded) await window.EndemicPlacehold.ensureLoaded();
      else if (!window.EndemicPlacehold?.mount) {
        const prefix = window.__ASSET_PREFIX__ || "/";
        const a = (p) => prefix + String(p).replace(/^\//, "");
        if (!document.querySelector('link[href*="placehold-page.css"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = a("assets/css/placehold-page.css");
          document.head.appendChild(link);
        }
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = a("assets/js/placehold-page.js");
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("placehold load failed"));
          document.head.appendChild(s);
        });
      }
      if (window.EndemicPlacehold?.mount) window.EndemicPlacehold.mount(main, variant);
      else main.innerHTML = `<div class="container section"><h1>Page not found</h1></div>`;
    } catch (e) {
      console.error(e);
      main.innerHTML = `<div class="container section"><h1>Page not found</h1></div>`;
    }
  }

  window.showEndemicPlacehold = showDetailPlacehold;

  function breadcrumbs(items) {
    if (!items?.length) return "";
    const crumbs = items
      .map((item) => {
        if (item.href) return `<li><a href="${item.href}">${escapeHtml(item.label)}</a></li>`;
        return `<li><span aria-current="page">${escapeHtml(item.label)}</span></li>`;
      })
      .join("");
    return `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${crumbs}</ol></nav>`;
  }

  function renderItinerary(days) {
    if (!days || !days.length) {
      return `<div class="itinerary-placeholder" role="note">
        <p><strong>Day-by-day routing is being finalised for this journey.</strong> Contact us for the latest schedule and we will tailor dates and pace to your group.</p>
      </div>`;
    }
    return `<ol class="itinerary-timeline">${days
      .map(
        (d) => `<li>
          <span class="itinerary-day">Day ${d.day}</span>
          <div><h3>${escapeHtml(d.title || "")}</h3><p>${escapeHtml(d.description || "")}</p></div>
        </li>`
      )
      .join("")}</ol>`;
  }

  function relatedPackages(all, current, destMap) {
    const related = all
      .filter((p) => p.slug !== current.slug && p.category === current.category)
      .slice(0, 6);
    if (!related.length || !window.EndemicUI) return "";
    return `<section class="section section--related detail-band">
      <div class="container">
        <h2 class="detail-heading">Related journeys</h2>
        ${window.EndemicUI.renderPackageCorpGrid(related, asset)}
      </div>
    </section>`;
  }

  function resolveBirdingDests(ids, destinations) {
    const map = Object.fromEntries(destinations.map((d) => [d.id, d]));
    return (ids || []).map((id) => map[id]).filter(Boolean);
  }

  function slugFromVisitHref(href) {
    if (!href) return null;
    let m = String(href).match(/wildlife\/destinations\/([^/?#]+)/);
    if (m) return { slug: m[1], kind: "wildlife" };
    m = String(href).match(/destinations\/([^/?#]+)/);
    if (m) return { slug: m[1], kind: "birding" };
    return null;
  }

  const VISIT_FALLBACK_IMG = "assets/images/from-live-site/destinations/eastern-destination.jpg";

  function renderPackageVisitSpot(v, ctx, wDestMap) {
    const UI = window.EndemicUI;
    if (!UI) return "";
    const parsed = v.href ? slugFromVisitHref(v.href) : null;
    if (parsed?.kind === "wildlife") {
      const d = wDestMap[parsed.slug] || { slug: parsed.slug, name: v.name, heroImage: VISIT_FALLBACK_IMG };
      return UI.renderWildlifeDestSpot({ ...d, name: d.name || v.name }, asset);
    }
    if (parsed?.kind === "birding" && v.href) {
      const site = ctx.siteCatalog?.find((s) => s.slug === parsed.slug);
      if (site) return UI.renderBirdingSiteSpot(site, asset);
      const hero =
        window.EndemicMedia?.resolveHero?.(parsed.slug, VISIT_FALLBACK_IMG) || VISIT_FALLBACK_IMG;
      return UI.renderIndividualDestSpot({
        href: asset(v.href),
        imgSrc: asset(hero),
        title: v.name,
        subtitle: "Birding site",
        tag: "Birding",
      });
    }
    if (!v.href) return "";
    return UI.renderIndividualDestSpot({
      href: asset(v.href),
      imgSrc: asset(VISIT_FALLBACK_IMG),
      title: v.name,
      subtitle: "On this route",
      tag: v.kind === "wildlife" ? "Safari" : "Birding",
    });
  }

  function renderPackageVisitsSection(pkg, ctx, wDestMap) {
    const PV = window.PackageVisits;
    if (!PV) return "";
    const visits = PV.resolvePackageVisits(pkg, { ...ctx, wDestMap });
    if (!visits.length) {
      return `<section class="detail-section reveal" data-reveal>
        <h2 class="detail-heading">Destinations you&rsquo;ll visit on this safari</h2>
        <p class="meta-line">Park list and day order are confirmed when you enquire – we tailor routing to season and your target species.</p>
      </section>`;
    }
    const linked = visits.filter((v) => v.href);
    const unlinked = visits.filter((v) => !v.href);
    const grid =
      linked.length && window.EndemicUI
        ? `<div class="alt-card-grid alt-card-grid--dest-spot alt-card-grid--pkg-visits reveal-stagger" data-reveal-stagger>${linked
            .map((v) => renderPackageVisitSpot(v, ctx, wDestMap))
            .filter(Boolean)
            .join("")}</div>`
        : "";
    const extraPills = unlinked.length
      ? `<ul class="pill-list pill-list--wrap pkg-visits-extra">${unlinked
          .map((v) => `<li>${escapeHtml(v.name)}</li>`)
          .join("")}</ul>`
      : "";
    return `<section class="detail-section detail-section--wide reveal" data-reveal>
      <h2 class="detail-heading">Destinations you&rsquo;ll visit on this safari</h2>
      <p class="meta-line">Parks and places on this route – not just a circuit name. Final day order depends on season and your enquiry.</p>
      ${grid}
      ${extraPills}
    </section>`;
  }

  function finishDetailRender() {
    window.scrollTo(0, 0);
    document.dispatchEvent(new CustomEvent("site:content-rendered"));
  }

  function renderDestinationMentionsSection(title, items, options = {}) {
    if (!window.EndemicUI?.renderDestExploreGrid || !items.length) {
      return `<section class="detail-section reveal" data-reveal><h2 class="detail-heading">${escapeHtml(title)}</h2><p>Tailor-made routing on enquiry.</p></section>`;
    }
    return `<section class="detail-section detail-section--wide reveal" data-reveal>
      <h2 class="detail-heading">${escapeHtml(title)}</h2>
      ${window.EndemicUI.renderDestExploreGrid(items, asset, options)}
    </section>`;
  }

  function renderLinkedPackagesBand(packages, slugs, title = "Wildlife safaris here") {
    if (!slugs?.length || !window.EndemicUI) return "";
    const linked = packages.filter((p) => slugs.includes(p.slug));
    if (!linked.length) return "";
    return `<section class="detail-band reveal" data-reveal>
      <div class="container">
        <h2 class="detail-heading">${escapeHtml(title)}</h2>
        ${window.EndemicUI.renderPackageCorpGrid(linked, asset)}
      </div>
    </section>`;
  }

  async function renderPackage() {
    if (!window.PackageDetail) {
      console.error("PackageDetail module missing");
      return;
    }
    const [packages, destinations, wildlifeDests, details] = await Promise.all([
      loadJson("packages.json"),
      loadJson("destinations.json"),
      loadJson("wildlife-destinations.json").catch(() => []),
      loadJson("package-details.json").catch(() => ({})),
    ]);
    const pkg = packages.find((p) => p.slug === slug);
    if (!pkg) {
      await showDetailPlacehold("not-found");
      return;
    }
    const destMap = Object.fromEntries(destinations.map((d) => [d.id, d]));
    const wDestMap = Object.fromEntries((wildlifeDests || []).map((d) => [d.slug, d]));
    const visitCtx = window.PackageVisits?.loadVisitContext
      ? await window.PackageVisits.loadVisitContext(loadJson)
      : { hubSites: {}, siteCatalog: [] };
    const visits = window.PackageVisits?.resolvePackageVisits(pkg, { ...visitCtx, wDestMap }) || [];
    const destLinks = window.PackageVisits?.formatVisitLine(visits, 4) || "";
    document.body.dataset.nav = pkg.category === "wildlife" ? "wildlife" : "birding";

    const canonical = asset(`packages/${pkg.slug}/`);
    const canonEl = document.querySelector("[data-canonical]");
    if (canonEl) canonEl.setAttribute("href", new URL(canonical, location.origin).href);

    const pkgHero = await heroUrl(pkg.slug, pkg.heroImage);
    const pkgGalleryBand = renderGallerySection(pkg, "title", { placement: "top" });
    const { introColumn, prelude, afterVisits } = await window.PackageDetail.buildPackageMain(pkg, {
      details,
      asset,
      visitCtx,
      wDestMap,
      renderPackageVisitsSection,
    });
    const visitsBand = renderPackageVisitsSection(pkg, visitCtx, wDestMap);

    document.getElementById("main").innerHTML = `
      <section class="page-hero" style="--page-hero-img: url('${pkgHero}')">
        <div class="page-hero-scrim"></div>
        <div class="container page-hero-inner">
          ${breadcrumbs([
            { href: asset("index.html"), label: "Home" },
            {
              href: asset(pkg.category === "wildlife" ? "wildlife/index.html" : "packages/index.html"),
              label: pkg.category === "wildlife" ? "Wildlife safaris" : "All journeys",
            },
            { label: shortTitle(pkg.title) || pkg.title },
          ])}
          <h1 class="page-hero-title reveal" data-reveal>${escapeHtml(shortTitle(pkg.title) || pkg.title)}</h1>
          <p class="page-hero-meta reveal" data-reveal>${pkg.durationDays} days · ${escapeHtml(categoryLabels[pkg.category])}${destLinks ? ` · ${escapeHtml(destLinks)}` : ""}</p>
          <div class="hero-actions reveal" data-reveal>
            <a class="btn btn-solid" href="${asset("plan-your-trip/index.html")}?journey=${encodeURIComponent(pkg.slug)}&interest=${encodeURIComponent(pkg.category === "wildlife" ? "wildlife" : "birding")}">Plan this journey</a>
            <a class="btn btn-outline" href="#pkg-itinerary-heading">View itinerary</a>
          </div>
          <a class="scroll-cue" href="#overview" aria-label="Scroll to overview"><span></span></a>
        </div>
      </section>
      ${pkgGalleryBand}
      <article class="detail-content pkg-detail" id="overview" data-package-slug="${escapeHtml(pkg.slug)}">
        <div class="container">
          <div class="pkg-detail-intro-grid">
            <div class="pkg-detail-intro-main">${introColumn}</div>
            <aside class="detail-aside pkg-detail-aside reveal" data-reveal>
              <div class="inquiry-panel inquiry-panel--sticky">
                <p class="eyebrow">Enquire on this journey</p>
                <h3>${escapeHtml(shortTitle(pkg.title) || pkg.title)}</h3>
                <p>${pkg.durationDays} days · ${escapeHtml(categoryLabels[pkg.category])}</p>
                <div class="pkg-inquiry-actions">
                  <a class="btn btn-solid btn-block" href="${asset("plan-your-trip/index.html")}?journey=${encodeURIComponent(pkg.slug)}&interest=${encodeURIComponent(pkg.category === "wildlife" ? "wildlife" : "birding")}">Plan your trip</a>
                  <a class="btn btn-outline btn-block" href="${asset("plan-your-trip/index.html")}?journey=${encodeURIComponent(pkg.slug)}&note=${encodeURIComponent("Please send the detailed itinerary for this journey.")}">Request detailed itinerary</a>
                  <a class="btn btn-ghost btn-block" href="tel:+255627013348">Call +255 627 013 348</a>
                </div>
              </div>
            </aside>
          </div>
          <div class="pkg-detail-flow">
            ${prelude}
            ${visitsBand ? `<div class="pkg-detail-visits-band reveal" data-reveal>${visitsBand}</div>` : ""}
            <div class="pkg-detail-body">${afterVisits}</div>
          </div>
        </div>
      </article>
      ${relatedPackages(packages, pkg, destMap)}
      <section class="section section--cta-band">
        <div class="container cta-band reveal" data-reveal>
          <h2>Ready to shape this route around your list?</h2>
          <a class="btn btn-solid" href="${asset("plan-your-trip/index.html")}?journey=${encodeURIComponent(pkg.slug)}">Start planning</a>
        </div>
      </section>`;

    finishDetailRender();
  }

  function renderSpeciesSection(site) {
    if (!site.keySpecies?.length) return "";
    return `<section class="detail-section reveal" data-reveal>
      <h2>Key species</h2>
      <ul class="pill-list">${site.keySpecies.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
    </section>`;
  }

  function renderWhySection(site) {
    if (!site.whyItMatters?.length) return "";
    return `<section class="detail-section reveal" data-reveal>
      <h2>Why it matters for birders</h2>
      <ul>${site.whyItMatters.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
    </section>`;
  }

  function gatherGallerySources(record) {
    const hero = record.heroImage;
    let items = (record.gallery || []).filter(Boolean);
    if (!items.length) {
      return hero ? [hero] : [];
    }
    if (hero) {
      items = items.filter((src) => src !== hero);
    }
    return items.length ? items : hero ? [hero] : [];
  }

  function galleryCollageClass(count) {
    if (count <= 1) return "gallery-collage gallery-collage--1";
    return "gallery-collage gallery-collage--multi";
  }

  function renderGalleryCollageHtml(record, nameKey = "name") {
    const items = gatherGallerySources(record);
    if (!items.length) {
      if (record.imageStatus === "pending") return null;
      return null;
    }
    const label = record[nameKey] || record.name || "Destination";
    const collageClass = galleryCollageClass(items.length);
    const multi = items.length > 1;
    const collage = `<div class="${collageClass}" data-gallery-collage data-gallery-count="${items.length}">${items
      .map(
        (src, i) =>
          `<figure class="gallery-item${multi && i === 0 && items.length >= 4 ? " gallery-item--lead" : ""}">
            <img src="${asset(src)}" alt="${escapeHtml(label)} – photo ${i + 1}" loading="${i === 0 ? "eager" : "lazy"}" decoding="async" />
          </figure>`
      )
      .join("")}</div>`;
    return { label, collage };
  }

  function renderGallerySection(record, nameKey = "name", options = {}) {
    const block = renderGalleryCollageHtml(record, nameKey);
    if (!block) return "";
    if (options.placement === "top") {
      return `<section class="detail-gallery-top-band reveal" data-reveal aria-labelledby="gallery-top-heading">
        <div class="container detail-gallery-top-band__inner">
          <h2 id="gallery-top-heading" class="detail-gallery-top-band__title">In pictures</h2>
          ${block.collage}
        </div>
      </section>`;
    }
    return `<section class="detail-section detail-section--wide detail-section--gallery reveal" data-reveal>
      <h2>Gallery</h2>
      ${block.collage}
    </section>`;
  }

  function renderSiteGallery(site) {
    return renderGallerySection(site);
  }

  function renderRelatedSafariThemesSection(activities) {
    if (!activities?.length) return "";
    const grid = window.EndemicUI?.renderWildlifeThemeGrid
      ? window.EndemicUI.renderWildlifeThemeGrid(activities, asset)
      : `<ul>${activities.map((a) => `<li><a href="${asset(`wildlife/activities/${a.slug}/`)}">${escapeHtml(a.name)}</a></li>`).join("")}</ul>`;
    return `<section class="detail-section detail-section--wide reveal" data-reveal>
      <h2>Related safari themes</h2>
      <p class="meta-line">Safari styles we recommend for this park – explore routes built around these experiences.</p>
      ${grid}
    </section>`;
  }

  const CIRCUIT_SITE_FILES = {
    southern: "southern-sites.json",
    western: "western-sites.json",
    northern: "northern-sites.json",
  };

  async function loadCircuitSiteBundle(circuitKey) {
    const file = CIRCUIT_SITE_FILES[circuitKey];
    if (!file) return null;
    return loadJson(file).catch(() => null);
  }

  async function findCircuitSite(siteSlug) {
    for (const key of Object.keys(CIRCUIT_SITE_FILES)) {
      const data = await loadCircuitSiteBundle(key);
      const site = data?.sites?.find((s) => s.slug === siteSlug);
      if (site) return { data, site, circuitKey: key };
    }
    return null;
  }

  function renderSitePackages(site, packages) {
    const slugs = site.packageSlugs || [];
    if (!slugs.length) return "";
    const linked = packages.filter((p) => slugs.includes(p.slug));
    if (!linked.length) return "";
    return renderLinkedPackagesBand(packages, slugs, "Journeys including this site");
  }

  async function renderCircuitSite() {
    const circuitKey = document.body.dataset.circuit || "southern";
    let data = await loadCircuitSiteBundle(circuitKey);
    let site = data?.sites?.find((s) => s.slug === slug);
    if (!site) {
      const found = await findCircuitSite(slug);
      if (!found) {
        await showDetailPlacehold("not-found");
        return;
      }
      data = found.data;
      site = found.site;
    }
    const packages = await loadJson("packages.json");
    const circuitLabel = data.circuitLabel || `${data.circuit} circuit`;
    const siteHero = await heroUrl(site.slug, site.heroImage);
    const heroStyle = `--page-hero-img: url('${siteHero}')`;

    document.getElementById("main").innerHTML = `
      <section class="page-hero" style="${heroStyle}">
        <div class="page-hero-scrim"></div>
        <div class="container page-hero-inner">
          ${breadcrumbs([
            { href: asset("index.html"), label: "Home" },
            { href: asset("destinations/index.html"), label: "Destinations" },
            { href: asset(`destinations/${data.parentSlug}/`), label: circuitLabel },
            { label: site.name, current: site.name },
          ])}
          <p class="eyebrow reveal" data-reveal>${escapeHtml(circuitLabel)} · Birding site</p>
          <h1 class="page-hero-title reveal" data-reveal>${escapeHtml(site.name)}</h1>
          <p class="page-hero-lead reveal" data-reveal>${escapeHtml(site.summary)}</p>
          <a class="scroll-cue" href="#story" aria-label="Scroll"><span></span></a>
        </div>
      </section>
      ${renderGallerySection(site, "name", { placement: "top" })}
      <article class="detail-content" id="story">
        <div class="container detail-grid">
          <div class="detail-main">
            <section class="detail-section reveal" data-reveal>
              <h2>Overview</h2>
              <p class="lead">${escapeHtml(site.summary)}</p>
              <p class="meta-line">Location: ${escapeHtml(site.location || "Tanzania")}</p>
              ${site.displayNameNote ? `<p class="meta-line">${escapeHtml(site.displayNameNote)}</p>` : ""}
              ${site.generalNotes ? `<p>${escapeHtml(site.generalNotes)}</p>` : ""}
            </section>
            ${renderSpeciesSection(site)}
            ${renderWhySection(site)}
          </div>
          <aside class="detail-aside reveal" data-reveal>
            <div class="inquiry-panel">
              <p class="eyebrow">Plan a visit</p>
              <h3>${escapeHtml(site.name)}</h3>
              <a class="btn btn-solid btn-block" href="${asset("plan-your-trip/index.html")}?destination=${encodeURIComponent(data.parentSlug)}&site=${encodeURIComponent(site.slug)}">Plan Your Trip</a>
            </div>
          </aside>
        </div>
      </article>
      ${renderSitePackages(site, packages)}`;

    finishDetailRender();
  }

  async function renderSouthernSite() {
    document.body.dataset.circuit = "southern";
    return renderCircuitSite();
  }

  function circuitSitesSection(data, lead, options = {}) {
    if (!data?.sites?.length || !window.EndemicUI) return "";
    const label = data.circuitLabel || `${data.circuit} circuit`;
    const title = options.title || "Destinations in this circuit";
    const eyebrow = options.eyebrow || label;
    return `<section class="section section--paper-band" id="circuit-sites">
      <div class="container">
        <header class="section-head">
          <p class="eyebrow reveal" data-reveal>${escapeHtml(eyebrow)}</p>
          <h2 class="section-title reveal" data-reveal>${escapeHtml(title)}</h2>
          <p class="section-lead reveal" data-reveal>${escapeHtml(lead)}</p>
        </header>
        ${window.EndemicUI.renderCircuitSiteGrid(data.sites, asset, label)}
      </div>
    </section>`;
  }

  function relatedCircuitsSection(currentSlug, destinations, packages) {
    if (!window.EndemicUI?.renderDestScriptGrid) return "";
    const others = destinations.filter((d) => d.slug !== currentSlug);
    if (!others.length) return "";
    return `<section class="section" id="also-like">
      <div class="container">
        <header class="section-head">
          <p class="eyebrow reveal" data-reveal>Inspiration</p>
          <h2 class="section-title reveal" data-reveal>You may also like</h2>
          <p class="section-lead reveal" data-reveal>Other birding &amp; wildlife circuits across Tanzania.</p>
        </header>
        ${window.EndemicUI.renderDestScriptGrid(others, packages, asset)}
      </div>
    </section>`;
  }

  function circuitLandingCta(dest) {
    return `<section class="section section--cta-band">
      <div class="container cta-band reveal" data-reveal>
        <h2>Ready to plan your ${escapeHtml(dest.circuit || "safari")} route?</h2>
        <p class="section-lead">Tell us your target list, dates and pace – we tailor journeys with max six guests per vehicle.</p>
        <a class="btn btn-solid" href="${asset("plan-your-trip/index.html")}?destination=${encodeURIComponent(dest.slug)}">Plan Your Trip</a>
      </div>
    </section>`;
  }

  function packagesInCircuitSection(linked, destName) {
    if (!linked.length || !window.EndemicUI) {
      return `<section class="section" id="journeys">
        <div class="container detail-section reveal" data-reveal>
          <h2 class="detail-heading">Safari packages</h2>
          <p>Ask us for a tailor-made itinerary in ${escapeHtml(destName)}.</p>
          <a class="btn btn-solid" href="${asset("plan-your-trip/index.html")}">Enquire</a>
        </div>
      </section>`;
    }
    return `<section class="section section--paper-band" id="journeys">
      <div class="container">
        <header class="section-head">
          <p class="eyebrow reveal" data-reveal>Safari packages</p>
          <h2 class="section-title reveal" data-reveal>Journeys in this region</h2>
          <p class="section-lead reveal" data-reveal>Packaged birding &amp; wildlife routes that include ${escapeHtml(destName)}.</p>
        </header>
        ${window.EndemicUI.renderPackageCorpGrid(linked, asset)}
      </div>
    </section>`;
  }

  async function renderDestination() {
    const circuitFile =
      slug === "southern-destination"
        ? "southern-sites.json"
        : slug === "western-destination"
          ? "western-sites.json"
          : slug === "northern-destination"
            ? "northern-sites.json"
            : null;
    const [destinations, packages, circuitData] = await Promise.all([
      loadJson("destinations.json"),
      loadJson("packages.json"),
      circuitFile ? loadJson(circuitFile).catch(() => null) : Promise.resolve(null),
    ]);
    const dest = destinations.find((d) => d.slug === slug);
    if (!dest) {
      await showDetailPlacehold("not-found");
      return;
    }
    const destMap = Object.fromEntries(destinations.map((d) => [d.id, d]));
    const linked = packages.filter((p) => (p.destinations || []).includes(dest.id));
    const circuitLeads = {
      "southern-destination":
        "Forest blocks, miombo, floodplains and river wilderness – core habitats on our southern birding safaris.",
      "western-destination":
        "Lake Tanganyika forests, Katavi plains, island and lake parks – western birding and remote wilderness routes.",
      "northern-destination": "Tarangire woodlands and Serengeti savanna – core stops on northern birdwatching safaris.",
    };
    const circuitSitesBlock = circuitData ? circuitSitesSection(circuitData, circuitLeads[slug] || "") : "";
    const destHero = await heroUrl(dest.slug || slug, dest.heroImage);
    const isCircuitHub = Boolean(circuitData?.sites?.length);
    const scrollTarget = isCircuitHub ? "#circuit-sites" : "#story";
    const regionLabel = dest.name.replace(/\s+Destination$/i, "").trim() || dest.name;

    const heroBlock = `
      <section class="page-hero" style="--page-hero-img: url('${destHero}')">
        <div class="page-hero-scrim"></div>
        <div class="container page-hero-inner">
          ${breadcrumbs([
            { href: asset("index.html"), label: "Home" },
            { href: asset("destinations/index.html"), label: "Destinations" },
            { label: dest.name, current: dest.name },
          ])}
          <p class="eyebrow reveal" data-reveal>${escapeHtml(dest.circuit)} circuit</p>
          <h1 class="page-hero-title reveal" data-reveal>${escapeHtml(regionLabel)}</h1>
          <p class="page-hero-lead reveal" data-reveal>${escapeHtml(dest.summary)}</p>
          <a class="scroll-cue" href="${scrollTarget}" aria-label="Scroll"><span></span></a>
        </div>
      </section>`;

    if (isCircuitHub) {
      document.getElementById("main").innerHTML =
        heroBlock +
        circuitSitesBlock +
        packagesInCircuitSection(linked, regionLabel) +
        relatedCircuitsSection(dest.slug, destinations, packages) +
        circuitLandingCta(dest);
    } else {
      document.getElementById("main").innerHTML =
        heroBlock +
        `<article class="detail-content" id="story">
        <div class="container detail-grid">
          <div class="detail-main">
            <section class="detail-section reveal" data-reveal>
              <h2>Introduction</h2>
              <p class="lead">${escapeHtml(dest.summary)}</p>
              <p class="meta-line">Location: ${escapeHtml(dest.location || "Tanzania")}</p>
            </section>
            ${dest.birdingNotes ? `<section class="detail-section reveal" data-reveal><h2>Birding opportunities</h2><p>${escapeHtml(dest.birdingNotes)}</p></section>` : ""}
            ${dest.wildlifeNotes ? `<section class="detail-section reveal" data-reveal><h2>Wildlife opportunities</h2><p>${escapeHtml(dest.wildlifeNotes)}</p></section>` : ""}
            ${dest.activities?.length ? `<section class="detail-section reveal" data-reveal><h2>Activities</h2><ul>${dest.activities.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}</ul></section>` : ""}
          </div>
          <aside class="detail-aside reveal" data-reveal>
            <div class="inquiry-panel">
              <p class="eyebrow">Plan a visit</p>
              <h3>${escapeHtml(dest.name)}</h3>
              <a class="btn btn-solid btn-block" href="${asset("plan-your-trip/index.html")}?destination=${encodeURIComponent(dest.slug)}">Plan Your Trip</a>
            </div>
          </aside>
        </div>
      </article>` +
        packagesInCircuitSection(linked, regionLabel) +
        relatedCircuitsSection(dest.slug, destinations, packages) +
        circuitLandingCta(dest);
    }

    finishDetailRender();
  }

  function renderWildlifeGallery(record) {
    return renderGallerySection(record);
  }

  function renderLinkedPackages() {
    return "";
  }

  async function renderWildlifeDestination() {
    const [dests, packages, activities] = await Promise.all([
      loadJson("wildlife-destinations.json"),
      loadJson("packages.json"),
      loadJson("wildlife-activities.json"),
    ]);
    const dest = dests.find((d) => d.slug === slug);
    if (!dest) {
      await showDetailPlacehold("not-found");
      return;
    }
    const linkedActs = activities.filter((a) => (dest.activitySlugs || []).includes(a.slug));
    const wdHero = await heroUrl(dest.slug, dest.heroImage);
    const heroStyle = `--page-hero-img: url('${wdHero}')`;

    document.getElementById("main").innerHTML = `
      <section class="page-hero" style="${heroStyle}">
        <div class="page-hero-scrim"></div>
        <div class="container page-hero-inner">
          ${breadcrumbs([
            { href: asset("index.html"), label: "Home" },
            { href: asset("wildlife/index.html"), label: "Wildlife safaris" },
            { label: dest.name, current: dest.name },
          ])}
          <p class="eyebrow reveal" data-reveal>${escapeHtml(dest.circuit)} circuit · Wildlife</p>
          <h1 class="page-hero-title reveal" data-reveal>${escapeHtml(dest.name)}</h1>
          ${dest.displaySubtitle ? `<p class="page-hero-meta reveal" data-reveal>${escapeHtml(dest.displaySubtitle)}</p>` : ""}
          <p class="page-hero-lead reveal" data-reveal>${escapeHtml(dest.summary)}</p>
          <a class="scroll-cue" href="#story" aria-label="Scroll"><span></span></a>
        </div>
      </section>
      ${renderGallerySection(dest, "name", { placement: "top" })}
      <article class="detail-content" id="story">
        <div class="container detail-grid">
          <div class="detail-main">
            <section class="detail-section reveal" data-reveal>
              <h2>Overview</h2>
              <p class="lead">${escapeHtml(dest.overview)}</p>
              <p class="meta-line">Location: ${escapeHtml(dest.location)}</p>
            </section>
            ${
              dest.wildlifeHighlights?.length
                ? `<section class="detail-section reveal" data-reveal><h2>Wildlife highlights</h2><ul>${dest.wildlifeHighlights.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul></section>`
                : ""
            }
            ${
              dest.parkActivities?.length
                ? `<section class="detail-section reveal" data-reveal><h2>Activities</h2><ul class="pill-list">${dest.parkActivities.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}</ul></section>`
                : ""
            }
            <section class="detail-section reveal" data-reveal>
              <h2>Best time to visit</h2>
              <p>${escapeHtml(dest.bestTime || "Enquire for seasonal guidance.")}</p>
              <p>${escapeHtml(dest.practicalNotes || "")}</p>
            </section>
          </div>
          <aside class="detail-aside reveal" data-reveal>
            <div class="inquiry-panel">
              <p class="eyebrow">Plan a visit</p>
              <h3>${escapeHtml(dest.name)}</h3>
              <a class="btn btn-solid btn-block" href="${asset("plan-your-trip/index.html")}?wildlifeDestination=${encodeURIComponent(dest.slug)}">Plan Your Trip</a>
            </div>
          </aside>
          <div class="detail-grid-span reveal" data-reveal>
            ${renderRelatedSafariThemesSection(linkedActs)}
          </div>
        </div>
      </article>
      ${renderLinkedPackagesBand(packages, dest.packageSlugs)}`;
    finishDetailRender();
  }

  async function renderWildlifeActivity() {
    const [activities, packages, dests] = await Promise.all([
      loadJson("wildlife-activities.json"),
      loadJson("packages.json"),
      loadJson("wildlife-destinations.json"),
    ]);
    const act = activities.find((a) => a.slug === slug);
    if (!act) {
      await showDetailPlacehold("not-found");
      return;
    }
    const destMap = Object.fromEntries(dests.map((d) => [d.slug, d]));
    const destLinks = (act.destinationSlugs || [])
      .map((s) => {
        const d = destMap[s];
        return d ? `<a href="${asset(`wildlife/destinations/${d.slug}/`)}">${escapeHtml(d.name)}</a>` : "";
      })
      .filter(Boolean)
      .join(", ");

    const actHero = await heroUrl(act.slug, act.heroImage);
    document.getElementById("main").innerHTML = `
      <section class="page-hero" style="--page-hero-img: url('${actHero}')">
        <div class="page-hero-scrim"></div>
        <div class="container page-hero-inner">
          ${breadcrumbs([
            { href: asset("index.html"), label: "Home" },
            { href: asset("wildlife/index.html"), label: "Wildlife safaris" },
            { label: act.name, current: act.name },
          ])}
          <p class="eyebrow reveal" data-reveal>Wildlife activity</p>
          <h1 class="page-hero-title reveal" data-reveal>${escapeHtml(act.name)}</h1>
          <p class="page-hero-lead reveal" data-reveal>${escapeHtml(act.summary)}</p>
          <a class="scroll-cue" href="#story" aria-label="Scroll"><span></span></a>
        </div>
      </section>
      <article class="detail-content" id="story">
        <div class="container detail-grid">
          <div class="detail-main">
            <section class="detail-section reveal" data-reveal>
              <h2>Overview</h2>
              <p class="lead">${escapeHtml(act.overview)}</p>
            </section>
            ${
              act.wildlifeFocus?.length
                ? `<section class="detail-section reveal" data-reveal><h2>Focus</h2><ul class="pill-list">${act.wildlifeFocus.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul></section>`
                : ""
            }
            ${renderDestinationMentionsSection(
              "Key destinations",
              (act.destinationSlugs || []).map((s) => destMap[s]).filter(Boolean),
              { wildlife: true, subtitle: "Wildlife park" }
            )}
          </div>
          <aside class="detail-aside reveal" data-reveal>
            <div class="inquiry-panel">
              <p class="eyebrow">Enquire</p>
              <h3>${escapeHtml(act.name)}</h3>
              <a class="btn btn-solid btn-block" href="${asset("plan-your-trip/index.html")}?activity=${encodeURIComponent(act.slug)}">Plan Your Trip</a>
            </div>
          </aside>
        </div>
      </article>
      ${renderLinkedPackagesBand(packages, act.packageSlugs)}`;
    finishDetailRender();
  }

  if (detailType === "package") renderPackage().catch(console.error);
  if (detailType === "destination") renderDestination().catch(console.error);
  if (detailType === "southern-site") renderSouthernSite().catch(console.error);
  if (detailType === "circuit-site") renderCircuitSite().catch(console.error);
  if (detailType === "wildlife-destination") renderWildlifeDestination().catch(console.error);
  if (detailType === "wildlife-activity") renderWildlifeActivity().catch(console.error);
})();
