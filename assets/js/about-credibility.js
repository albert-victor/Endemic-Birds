(function () {
  const prefix = window.__ASSET_PREFIX__ || "/";
  const asset = (p) => prefix + String(p).replace(/^\//, "");

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatBytes(n) {
    const b = Number(n);
    if (!Number.isFinite(b) || b <= 0) return "";
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  }

  function sanitizeSummaryHtml(html) {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
    const allowed = new Set(["P", "UL", "OL", "LI", "STRONG", "EM", "BR"]);
    function walk(node) {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          if (!allowed.has(child.tagName)) {
            const text = document.createTextNode(child.textContent || "");
            child.replaceWith(text);
          } else {
            [...child.attributes].forEach((attr) => child.removeAttribute(attr.name));
            walk(child);
          }
        }
      });
    }
    const wrap = doc.body.firstElementChild;
    if (wrap) walk(wrap);
    return wrap ? wrap.innerHTML : "";
  }

  function renderRelated(links) {
    if (!links?.length) return "";
    const items = links.map((l) => `<li><a href="${asset(l.href)}">${escapeHtml(l.label)}</a></li>`).join("");
    return `<nav class="about-related" aria-label="Related pages"><p class="about-related__label">Continue reading</p><ul>${items}</ul></nav>`;
  }

  async function loadPackages() {
    try {
      const res = await fetch(asset("content/packages.json"));
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  async function loadDestinations() {
    try {
      const res = await fetch(asset("content/destinations.json"));
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  async function downloadAvailable(filePath) {
    if (!filePath) return false;
    try {
      const res = await fetch(asset(filePath), { method: "HEAD" });
      return res.ok;
    } catch {
      return false;
    }
  }

  function resolveRelated(report, packages, destinations) {
    const pkgLinks = (report.relatedPackages || [])
      .map((slug) => packages.find((p) => p.slug === slug))
      .filter(Boolean)
      .map((p) => `<li><a href="${asset(`packages/${p.slug}/index.html`)}">${escapeHtml(p.title)}</a></li>`);
    const destLinks = (report.relatedDestinations || [])
      .map((slug) => destinations.find((d) => d.slug === slug))
      .filter(Boolean)
      .map((d) => `<li><a href="${asset(`destinations/${d.slug}/index.html`)}">${escapeHtml(d.name)}</a></li>`);
    if (!pkgLinks.length && !destLinks.length) return "";
    return `<div class="trip-report-related">
      <p class="trip-report-related__label">Related planning</p>
      <ul>${pkgLinks.join("")}${destLinks.join("")}</ul>
    </div>`;
  }

  async function renderTripReports(mount) {
    mount.closest(".about-sub-container")?.classList.add("about-sub-container--wide");
    const [reportsRes, packages, destinations] = await Promise.all([
      fetch(asset("content/trip-reports.json")).then((r) => r.json()),
      loadPackages(),
      loadDestinations(),
    ]);
    if (reportsRes.page?.seo?.title) document.title = reportsRes.page.seo.title;
    const metaTag = document.querySelector('meta[name="description"]');
    if (metaTag && reportsRes.page?.seo?.description) metaTag.setAttribute("content", reportsRes.page.seo.description);

    const meta = reportsRes.meta || {};
    const reports = (reportsRes.reports || []).filter((r) => r.type === "field-report");
    const types = meta.types || {};

    let filtersHtml = "";
    if (reports.length >= (meta.filterMinReports || 5)) {
      const circuits = [...new Set(reports.map((r) => r.circuit).filter(Boolean))].sort();
      const years = [...new Set(reports.map((r) => r.year || String(r.travelDates || "").slice(-4)).filter(Boolean))].sort(
        (a, b) => Number(b) - Number(a)
      );
      filtersHtml = `<div class="trip-report-filters" data-trip-report-filters>
        <label class="trip-report-filters__field">
          <span>Circuit</span>
          <select data-filter-circuit aria-label="Filter by circuit">
            <option value="">All circuits</option>
            ${circuits.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("")}
          </select>
        </label>
        <label class="trip-report-filters__field">
          <span>Year</span>
          <select data-filter-year aria-label="Filter by year">
            <option value="">All years</option>
            ${years.map((y) => `<option value="${escapeHtml(y)}">${escapeHtml(y)}</option>`).join("")}
          </select>
        </label>
      </div>`;
    }

    const cards = await Promise.all(
      reports.map(async (report) => {
        const isField = report.type === "field-report";
        const typeLabel = types[report.type] || (isField ? "Field trip report" : "Sample itinerary");
        const dests = (report.destinations || []).join(" · ");
        const guide = report.guide ? `Guide: ${escapeHtml(report.guide)}` : "";
        const sightings =
          report.notableSightings?.length > 0
            ? `<div class="trip-report-card__sightings"><p class="trip-report-card__subhead">Notable sightings (documented)</p><ul>${report.notableSightings.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul></div>`
            : "";

        const summaryBlock = report.summaryHtml
          ? `<div class="trip-report-card__summary trip-report-card__summary--html">${sanitizeSummaryHtml(report.summaryHtml)}</div>`
          : `<p class="trip-report-card__summary">${escapeHtml(report.summary || "")}</p>`;

        let downloadHtml = "";
        const dl = report.download;
        if (dl?.file) {
          const ok = await downloadAvailable(dl.file);
          if (ok) {
            const type = (dl.fileType || "pdf").toUpperCase();
            const size = formatBytes(dl.sizeBytes);
            downloadHtml = `<a class="btn btn-outline trip-report-download" href="${asset(dl.file)}" download rel="noopener noreferrer">
              ${escapeHtml(dl.label || "Download report")} <span class="trip-report-download__meta">(${escapeHtml(type)}${size ? ` · ${escapeHtml(size)}` : ""})</span>
            </a>`;
          }
        }

        const yearAttr = report.year || String(report.travelDates || "").match(/\d{4}/)?.[0] || "";

        return `<article class="trip-report-card" id="report-${escapeHtml(report.id)}" data-trip-report-card data-circuit="${escapeHtml(report.circuit || "")}" data-year="${escapeHtml(yearAttr)}">
          <p class="trip-report-card__type">${escapeHtml(typeLabel)}</p>
          <h2 class="trip-report-card__title">${escapeHtml(report.title)}</h2>
          <p class="trip-report-card__meta">${[report.travelDates, report.circuit, dests].filter(Boolean).map(escapeHtml).join(" · ")}</p>
          ${guide ? `<p class="trip-report-card__guide">${guide}</p>` : ""}
          ${summaryBlock}
          ${sightings}
          ${resolveRelated(report, packages, destinations)}
          ${downloadHtml}
        </article>`;
      })
    );

    const library = reports.length
      ? `<div class="trip-report-library" data-trip-report-library>${filtersHtml}${cards.join("")}</div>`
      : `<div class="trip-report-empty" aria-live="polite">
          <h2 class="about-section-heading">${escapeHtml(meta.emptyTitle || "No reports yet")}</h2>
          <p>${escapeHtml(meta.emptyBody || "")}</p>
        </div>`;

    const sampleBlock = `<section class="trip-report-sample-note" aria-labelledby="sample-itinerary-heading">
      <h2 id="sample-itinerary-heading" class="about-section-heading">Sample itineraries (not field reports)</h2>
      <p>Published safari packages on this site are <strong>planning templates</strong> – day-by-day ideas you can tailor. They are not post-trip reports and are not presented as recent field results.</p>
      <a class="btn btn-solid" href="${asset(meta.packagesHref || "packages/index.html")}">Browse packages</a>
    </section>`;

    mount.innerHTML = `<header class="about-sub-head">
        <p class="eyebrow">Trip reports</p>
        <h1 class="about-sub-title">Field report library</h1>
        <p class="about-sub-lead">${escapeHtml(meta.disclaimer || "")}</p>
      </header>
      ${library}
      ${sampleBlock}
      <p class="about-sub-actions">
        <a class="btn btn-solid" href="${asset(meta.enquiryHref || "plan-your-trip/index.html")}">Ask for recent notes</a>
        <a class="text-link" href="${asset("about/index.html")}">← About overview</a>
      </p>`;

    bindTripReportFilters(mount);
  }

  function bindTripReportFilters(mount) {
    const library = mount.querySelector("[data-trip-report-library]");
    const filters = mount.querySelector("[data-trip-report-filters]");
    if (!library || !filters) return;
    const cards = [...library.querySelectorAll("[data-trip-report-card]")];
    const circuit = filters.querySelector("[data-filter-circuit]");
    const year = filters.querySelector("[data-filter-year]");
    function apply() {
      const c = circuit?.value || "";
      const y = year?.value || "";
      cards.forEach((card) => {
        const matchC = !c || card.dataset.circuit === c;
        const matchY = !y || card.dataset.year === y;
        card.hidden = !(matchC && matchY);
      });
    }
    circuit?.addEventListener("change", apply);
    year?.addEventListener("change", apply);
  }

  function renderTourTraining(mount, data) {
    mount.closest(".about-sub-container")?.classList.add("about-sub-container--wide");
    const page = data.page || {};
    const audiences = (page.audiences || [])
      .map(
        (a) => `<article class="about-audience-chip">
          <h3>${escapeHtml(a.title)}</h3>
          <p>${escapeHtml(a.body)}</p>
        </article>`
      )
      .join("");
    const topics = (page.topicAreas || [])
      .map(
        (t) => `<article class="about-pillar-card">
          <h2>${escapeHtml(t.title)}</h2>
          <p>${escapeHtml(t.body)}</p>
        </article>`
      )
      .join("");
    const delivery = (page.deliveryOptions || [])
      .map(
        (d) => `<article class="training-delivery-card">
          <p class="training-delivery-card__status">${escapeHtml(d.status === "by-enquiry" ? "By enquiry" : d.status || "")}</p>
          <h3>${escapeHtml(d.title)}</h3>
          <p>${escapeHtml(d.body)}</p>
        </article>`
      )
      .join("");
    const notList = (page.notPublishedUntilConfirmed || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");

    mount.innerHTML = `<header class="about-sub-head">
        <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
        <h1 class="about-sub-title">${escapeHtml(page.title)}</h1>
        <p class="about-sub-lead">${escapeHtml(page.lead)}</p>
        <p class="about-sub-note">${escapeHtml(page.enquiryNote || "")}</p>
      </header>
      <section aria-labelledby="training-audience-heading">
        <h2 id="training-audience-heading" class="about-section-heading">Who this is for</h2>
        <div class="about-audience-grid">${audiences}</div>
      </section>
      <section aria-labelledby="training-topics-heading">
        <h2 id="training-topics-heading" class="about-section-heading">Topics we can tailor (not a fixed syllabus)</h2>
        <div class="about-pillar-grid">${topics}</div>
      </section>
      <section aria-labelledby="training-delivery-heading">
        <h2 id="training-delivery-heading" class="about-section-heading">Delivery format</h2>
        <div class="training-delivery-grid">${delivery}</div>
      </section>
      <section class="training-not-listed" aria-labelledby="training-not-heading">
        <h2 id="training-not-heading" class="about-section-heading">Not published until confirmed</h2>
        <ul class="about-prep-list">${notList}</ul>
      </section>
      ${renderRelated(page.related)}
      <p class="about-sub-actions">
        <a class="btn btn-solid" href="${asset(page.cta?.href || "plan-your-trip/index.html")}">${escapeHtml(page.cta?.label || "Enquire")}</a>
        <a class="text-link" href="${asset("about/index.html")}">← About overview</a>
      </p>`;
  }

  function partnerCard(p, past) {
    const logo = p.logo
      ? `<img src="${asset(p.logo)}" alt="" width="140" height="56" loading="lazy" decoding="async" />`
      : "";
    const web = p.website
      ? `<a class="partners-page-card__link" href="${escapeHtml(p.website)}" rel="noopener noreferrer">Visit website</a>`
      : "";
    const ended = past && p.endedYear ? ` <span class="partners-page-card__ended">(collaboration ended ${escapeHtml(p.endedYear)})</span>` : "";
    return `<article class="partners-page-card${past ? " partners-page-card--past" : ""}">
      <div class="partners-page-card__logo">${logo}</div>
      <div>
        <h3 class="partners-page-card__name">${escapeHtml(p.name)}${ended}</h3>
        <p class="partners-page-card__rel">${escapeHtml(p.relationship || "")}</p>
        ${web}
      </div>
    </article>`;
  }

  function renderPartners(mount, data) {
    mount.closest(".about-sub-container")?.classList.add("about-sub-container--wide");
    const page = data.page || {};
    const current = (data.commercial?.current || []).filter((p) => p.verified === true);
    const past = (data.commercial?.past || []).filter((p) => p.verified === true);

    const currentHtml = current.length
      ? `<div class="partners-page-grid">${current.map((p) => partnerCard(p, false)).join("")}</div>`
      : `<div class="trip-report-empty">
          <h2 class="about-section-heading">${escapeHtml(page.emptyCommercialTitle || "")}</h2>
          <p>${escapeHtml(page.emptyCommercialBody || "")}</p>
        </div>`;

    const pastHtml = past.length
      ? `<section aria-labelledby="partners-past-heading">
          <h2 id="partners-past-heading" class="about-section-heading">Past collaborators</h2>
          <div class="partners-page-grid partners-page-grid--past">${past.map((p) => partnerCard(p, true)).join("")}</div>
        </section>`
      : "";

    mount.innerHTML = `<header class="about-sub-head">
        <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
        <h1 class="about-sub-title">${escapeHtml(page.title)}</h1>
        <p class="about-sub-lead">${escapeHtml(page.lead)}</p>
      </header>
      <section class="partners-ground-partner">
        <p>${escapeHtml(page.groundPartnerBlurb || "")}</p>
      </section>
      <section aria-labelledby="partners-current-heading">
        <h2 id="partners-current-heading" class="about-section-heading">Current partners</h2>
        ${currentHtml}
      </section>
      ${pastHtml}
      ${renderRelated(page.related)}
      <p class="about-sub-actions">
        <a class="btn btn-solid" href="${asset(page.cta?.href || "plan-your-trip/index.html?interest=operator")}">${escapeHtml(page.cta?.label || "Enquire")}</a>
        <a class="text-link" href="${asset("about/index.html")}">← About overview</a>
      </p>`;
  }

  window.AboutCredibility = {
    async mount(slug, mount) {
      if (!mount) return;
      if (slug === "trip-reports") {
        await renderTripReports(mount);
        return;
      }
      if (slug === "tour-training") {
        const data = await fetch(asset("content/tour-training.json")).then((r) => r.json());
        if (data.page?.seo?.title) document.title = data.page.seo.title;
        const meta = document.querySelector('meta[name="description"]');
        if (meta && data.page?.seo?.description) meta.setAttribute("content", data.page.seo.description);
        renderTourTraining(mount, data);
        return;
      }
      if (slug === "partners") {
        const data = await fetch(asset("content/partners.json")).then((r) => r.json());
        if (data.page?.seo?.title) document.title = data.page.seo.title;
        const meta = document.querySelector('meta[name="description"]');
        if (meta && data.page?.seo?.description) meta.setAttribute("content", data.page.seo.description);
        renderPartners(mount, data);
      }
    },
  };
})();