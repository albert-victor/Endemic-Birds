(function () {
  const categoryLabels = {
    birding: "Specialist birding",
    wildlife: "Wildlife safari",
    combined: "Birding + wildlife",
  };

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function decodeEntities(str) {
    return String(str || "")
      .replace(/&#8211;/g, "–")
      .replace(/&ndash;/g, "–")
      .replace(/&#8212;/g, "–");
  }

  function formatBytes(n) {
    const b = Number(n);
    if (!Number.isFinite(b) || b <= 0) return "";
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  }

  function missingDays(itinerary, durationDays) {
    const set = new Set((itinerary || []).map((d) => Number(d.day)));
    const missing = [];
    for (let i = 1; i <= durationDays; i++) {
      if (!set.has(i)) missing.push(i);
    }
    return missing;
  }

  function mergeDetail(pkg, detailsRoot) {
    const defs = detailsRoot?.defaults || {};
    const extra = detailsRoot?.bySlug?.[pkg.slug] || {};
    return { defs, extra };
  }

  function renderAtAGlance(pkg, extra, defs) {
    const circuits = (pkg.circuits || []).join(", ") || "Tailor-made";
    return `<section class="detail-section pkg-glance reveal" data-reveal aria-labelledby="pkg-glance-heading">
      <h2 id="pkg-glance-heading" class="detail-heading">At a glance</h2>
      <dl class="pkg-glance-grid">
        <div><dt>Duration</dt><dd>${pkg.durationDays} days</dd></div>
        <div><dt>Circuits</dt><dd>${escapeHtml(circuits)}</dd></div>
        <div><dt>Safari type</dt><dd>${escapeHtml(categoryLabels[pkg.category] || pkg.category)}</dd></div>
        <div><dt>Travel style</dt><dd>${escapeHtml(extra.travelStyle || defs.travelStyle)}</dd></div>
      </dl>
    </section>`;
  }

  function renderListSection(title, items, id) {
    if (!items?.length) return "";
    return `<section class="detail-section reveal" data-reveal aria-labelledby="${id}">
      <h2 id="${id}" class="detail-heading">${escapeHtml(title)}</h2>
      <ul class="pill-list pill-list--wrap">${items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>
    </section>`;
  }

  function renderItinerary(pkg) {
    const days = pkg.itinerary || [];
    const missing = missingDays(days, pkg.durationDays);
    const warn =
      missing.length || days.length < pkg.durationDays
        ? `<p class="pkg-itinerary-warn" role="note">This page shows a route summary. Request the full ${pkg.durationDays}-day schedule when you enquire – we confirm day order and timings for your dates.</p>`
        : "";

  if (!days.length) {
      return `<div class="itinerary-placeholder" role="note">
        <p><strong>Day-by-day routing is being finalised for this journey.</strong> Contact us for the latest schedule and we will tailor dates and pace to your group.</p>
      </div>`;
    }

    return `${warn}<ol class="itinerary-timeline pkg-itinerary">${days
      .map(
        (d) => `<li id="pkg-day-${d.day}">
          <span class="itinerary-day">Day ${d.day}</span>
          <div><h3>${escapeHtml(decodeEntities(d.title || ""))}</h3><p>${escapeHtml(decodeEntities(d.description || ""))}</p></div>
        </li>`
      )
      .join("")}</ol>`;
  }

  function renderRouteDiagram(stops, mapNote) {
    if (!stops?.length) return "";
    return `<div class="pkg-route-diagram" role="list" aria-label="Route stops">
      ${stops
        .map(
          (s) => `<div class="pkg-route-diagram__item" role="listitem">
            <span class="pkg-route-diagram__n">${s.stop}</span>
            <div class="pkg-route-diagram__body"><strong>${escapeHtml(s.name)}</strong>
              <span class="pkg-route-diagram__days">Days ${s.dayFrom}${s.dayTo && s.dayTo !== s.dayFrom ? `–${s.dayTo}` : ""}</span>
              ${s.approximate ? `<span class="pkg-route-diagram__approx">Approximate location</span>` : ""}
              <a class="pkg-route-diagram__jump" href="#pkg-day-${s.dayFrom}">Itinerary day ${s.dayFrom}</a>
            </div>
          </div>`
        )
        .join("")}
      ${mapNote ? `<p class="pkg-map-note pkg-route-diagram__note">${escapeHtml(mapNote)}</p>` : ""}
    </div>`;
  }

  // fix motion typo -> span in template above

  function renderRouteSection(pkg, extra, defs) {
    const stops = extra.routeStops || pkg.routeStops;
    const mapNote = extra.mapNote || defs.mapNote || "Approximate corridor for planning – final routing confirmed on enquiry.";
    const showMap = extra.showRouteMap === true;
    const hasMapPoints = showMap && stops?.some((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng));
    const mapHost = hasMapPoints
      ? `<div class="pkg-route-map-host" data-package-route-map data-map-note="${escapeHtml(mapNote)}"></div>`
      : "";

    if (!stops?.length) {
      return `<section class="detail-section pkg-detail-block pkg-detail-route reveal" data-reveal aria-labelledby="pkg-route-heading">
        <h2 id="pkg-route-heading" class="detail-heading">Route overview</h2>
        <p class="meta-line">Stop order and drives are in the day-by-day plan below. We send a sketch map with your confirmed proposal.</p>
      </section>`;
    }

    return `<section class="detail-section pkg-detail-block pkg-detail-route reveal" data-reveal aria-labelledby="pkg-route-heading">
      <h2 id="pkg-route-heading" class="detail-heading">Route overview</h2>
      ${renderRouteDiagram(stops, showMap ? mapNote : "")}
      ${mapHost}
    </section>`;
  }

  async function renderDownload(pkg, asset) {
    const dl = pkg.download || pkg.itineraryDownload;
    if (!dl?.file) {
      return `<section class="detail-section reveal" data-reveal aria-labelledby="pkg-download-heading">
        <h2 id="pkg-download-heading" class="detail-heading">Full itinerary document</h2>
        <p>No PDF or Word file is published for this journey yet. Essential routing is on this page; request the detailed dossier when you enquire.</p>
        <a class="btn btn-outline" href="${asset(`plan-your-trip/index.html?journey=${encodeURIComponent(pkg.slug)}&note=${encodeURIComponent("Please send the detailed itinerary for this journey.")}`)}">Request the detailed itinerary</a>
      </section>`;
    }
    try {
      const res = await fetch(asset(dl.file), { method: "HEAD" });
      if (!res.ok) throw new Error("missing");
      const size = dl.sizeBytes || Number(res.headers.get("content-length")) || 0;
      const type = (dl.fileType || "pdf").toUpperCase();
      const date = dl.versionDate ? ` · updated ${escapeHtml(dl.versionDate)}` : "";
      return `<section class="detail-section reveal" data-reveal aria-labelledby="pkg-download-heading">
        <h2 id="pkg-download-heading" class="detail-heading">Full itinerary document</h2>
        <p>The download may include lodge names, timings and contacts not repeated here. This page remains the summary for search and quick planning.</p>
        <a class="btn btn-solid pkg-download-btn" href="${asset(dl.file)}" download rel="noopener noreferrer">
          ${escapeHtml(dl.label || "Download itinerary")} <span class="pkg-download-meta">(${type}${size ? ` · ${formatBytes(size)}` : ""}${date})</span>
        </a>
      </section>`;
    } catch {
      return `<section class="detail-section reveal" data-reveal><p class="pkg-itinerary-warn">Document link pending upload – use <a href="${asset(`plan-your-trip/index.html?journey=${encodeURIComponent(pkg.slug)}`)}">enquiry</a> for the latest file.</p></section>`;
    }
  }

  function renderInclusions(pkg) {
    const inc = pkg.included?.length
      ? `<ul>${pkg.included.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`
      : `<p class="itinerary-placeholder">Confirmed inclusions are listed in your proposal after dates are fixed. Typical items: vehicle, guide, park fees when quoted – ask for your departure.</p>`;
    const exc = pkg.excluded?.length
      ? `<h3 class="pkg-subheading">Not included</h3><ul>${pkg.excluded.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`
      : "";
    return `<section class="detail-section pkg-detail-block reveal" data-reveal aria-labelledby="pkg-included-heading">
      <h2 id="pkg-included-heading" class="detail-heading">Inclusions</h2>
      ${inc}
      ${exc}
    </section>`;
  }

  async function buildPackageMain(pkg, ctx) {
    const { defs, extra } = mergeDetail(pkg, ctx.details);
    const why = extra.whyChoose || defs.whyChooseFallback;
    const traveller = extra.travellerProfile || defs.travellerFallback;
    const habitats = extra.habitats || [];
    const birds = extra.targetBirds?.length ? extra.targetBirds : pkg.highlights?.birding?.length ? pkg.highlights.birding : [];
    const wildlife =
      extra.wildlifePhoto || (pkg.highlights?.wildlife?.length ? pkg.highlights.wildlife.join("; ") : defs.wildlifePhotoFallback);
    const season = pkg.bestTime || extra.seasonality || defs.seasonalityFallback;
    const accommodation = extra.accommodation || (extra.accommodationConfirmed ? extra.accommodationList : defs.accommodationUnconfirmed);
    const logistics = extra.logistics || defs.logisticsNote;
    const physical = extra.physicalDemands || defs.physicalDemands;

    const download = await renderDownload(pkg, ctx.asset);

    const introColumn = `
      <section class="detail-section pkg-detail-brief reveal" data-reveal>
        <h2 class="detail-heading">About this journey</h2>
        <p class="lead">${escapeHtml(pkg.summary)}</p>
        <div class="pkg-detail-facts">
          <div class="pkg-detail-fact">
            <h3>Why choose it</h3>
            <p>${escapeHtml(why)}</p>
          </div>
          <div class="pkg-detail-fact">
            <h3>Who it suits</h3>
            <p>${escapeHtml(traveller)}</p>
          </div>
        </div>
      </section>
      ${renderAtAGlance(pkg, extra, defs)}`;

    const birdsBlock =
      pkg.category !== "wildlife"
        ? birds.length
          ? renderListSection("Target birds (representative)", birds, "pkg-birds")
          : `<section class="detail-section reveal" data-reveal"><h2 class="detail-heading">Target birds</h2><p class="meta-line">Ask us for a month-specific target list for this route – we do not publish guaranteed species.</p></section>`
        : "";

    const wildlifeBlock =
      pkg.category === "wildlife" || pkg.category === "combined"
        ? `<section class="detail-section reveal" data-reveal"><h2 class="detail-heading">Wildlife &amp; photography</h2><p>${escapeHtml(typeof wildlife === "string" ? wildlife : "")}</p></section>`
        : `<section class="detail-section reveal" data-reveal"><h2 class="detail-heading">Photography notes</h2><p>${escapeHtml(defs.wildlifePhotoFallback)}</p></section>`;

    const prelude = `<div class="pkg-detail-prelude reveal-stagger" data-reveal-stagger>
      ${renderListSection("Key habitats", habitats, "pkg-habitats")}
      ${birdsBlock}
      ${wildlifeBlock}
      <section class="detail-section reveal" data-reveal">
        <h2 class="detail-heading">Seasonality</h2>
        <p>${escapeHtml(season)}</p>
      </section>
    </div>`;

    const afterVisits = `
      ${renderRouteSection(pkg, extra, defs)}
      <section class="detail-section pkg-detail-block reveal" data-reveal" aria-labelledby="pkg-itinerary-heading">
        <h2 id="pkg-itinerary-heading" class="detail-heading">Day-by-day itinerary</h2>
        ${renderItinerary(pkg)}
      </section>
      <section class="detail-section pkg-detail-block pkg-detail-logistics reveal" data-reveal">
        <h2 class="detail-heading">Accommodation &amp; logistics</h2>
        <p>${escapeHtml(typeof accommodation === "string" ? accommodation : "")}</p>
        ${Array.isArray(extra.accommodationList) ? `<ul>${extra.accommodationList.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}</ul>` : ""}
        <p class="pkg-detail-logistics__line"><strong>Pace &amp; walking:</strong> ${escapeHtml(physical)}</p>
        <p class="pkg-detail-logistics__line"><strong>Logistics:</strong> ${escapeHtml(logistics)}</p>
      </section>
      ${renderInclusions(pkg)}
      ${download}`;

    return { introColumn, prelude, afterVisits };
  }

  window.PackageDetail = {
    buildPackageMain,
    escapeHtml,
    missingDays,
  };
})();