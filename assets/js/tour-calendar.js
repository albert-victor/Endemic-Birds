(function () {
  const mount = document.querySelector("[data-tour-calendar-app]");
  if (!mount) return;

  const prefix = window.__ASSET_PREFIX__ || "/";
  const asset = (p) => prefix + String(p).replace(/^\//, "");

  const STATUS_CLASS = {
    available: "tcal-status--available",
    booked: "tcal-status--booked",
    "departure-open": "tcal-status--departure",
    "confirm-needed": "tcal-status--confirm",
    unpublished: "tcal-status--unpublished",
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function parseDay(s) {
    return new Date(`${s}T12:00:00Z`);
  }

  function daysInMonth(year, monthIndex) {
    return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  }

  function monthOverlaps(period, year, monthIndex) {
    const start = parseDay(period.start);
    const end = parseDay(period.end);
    const mStart = new Date(Date.UTC(year, monthIndex, 1));
    const mEnd = new Date(Date.UTC(year, monthIndex, daysInMonth(year, monthIndex)));
    return start <= mEnd && end >= mStart;
  }

  const PRIORITY = {
    booked: 4,
    "departure-open": 3,
    "confirm-needed": 2,
    available: 1,
    unpublished: 0,
  };

  function flattenPeriods(data) {
    const out = [];
    for (const p of data.guides?.leons?.periods || []) {
      out.push({ ...p, kind: "guide", guide: "leons" });
    }
    for (const p of data.departures || []) {
      out.push({ ...p, kind: "departure" });
    }
    for (const p of data.companyBlocks || []) {
      out.push({ ...p, kind: "company" });
    }
    return out;
  }

  function monthStatus(periods, year, monthIndex) {
    const hits = periods.filter((p) => monthOverlaps(p, year, monthIndex));
    if (!hits.length) return { status: "unpublished", items: [] };
    hits.sort((a, b) => (PRIORITY[b.status] || 0) - (PRIORITY[a.status] || 0));
    return { status: hits[0].status, items: hits };
  }

  function labelFor(status, labels) {
    return labels?.[status] || labels?.unpublished || "No dates published";
  }

  function formatRange(period) {
    return `${period.start} – ${period.end}`;
  }

  function renderLeonsCta(data, year, monthIndex, monthInfo, labels) {
    const leonsHits = monthInfo.items.filter((p) => p.kind === "guide");
    const booked = leonsHits.some((p) => p.status === "booked");
    const available = leonsHits.some((p) => p.status === "available");
    const monthStart = new Date(Date.UTC(year, monthIndex, 1)).toISOString().slice(0, 10);
    const monthEnd = new Date(Date.UTC(year, monthIndex, daysInMonth(year, monthIndex)))
      .toISOString()
      .slice(0, 10);

    if (booked) {
      return `<div class="tcal-leons-cta tcal-leons-cta--alt">
        <p><strong>${escapeHtml(data.guides.leons.name)}</strong> is not available in this month.</p>
        <a class="btn btn-outline" href="${asset(`plan-your-trip/index.html?guide=alternate&arrival=${monthStart}&departure=${monthEnd}&note=${encodeURIComponent("Please suggest a suitable local guide for these dates.")}`)}">Request another local guide</a>
      </div>`;
    }
    if (available) {
      return `<div class="tcal-leons-cta">
        <p><strong>${escapeHtml(data.guides.leons.name)}</strong> has published availability this month – enquire to hold dates.</p>
        <a class="btn btn-solid" href="${asset(`plan-your-trip/index.html?guide=leons&arrival=${monthStart}&departure=${monthEnd}&interest=birding`)}">Enquire with Leons</a>
      </div>`;
    }
    return `<p class="tcal-leons-cta tcal-leons-cta--neutral meta-line">No Leons availability published for this month – ${escapeHtml(labelFor("unpublished", labels)).toLowerCase()}.</p>`;
  }

  function renderListItem(period, labels) {
    const statusLabel = labelFor(period.status, labels);
    const pkg =
      period.kind === "departure" && period.packageSlug && period.visibility === "public"
        ? ` <a href="${asset(`packages/${period.packageSlug}/`)}">View itinerary</a>`
        : "";
    return `<li class="tcal-list__item ${STATUS_CLASS[period.status] || ""}">
      <span class="tcal-list__status">${escapeHtml(statusLabel)}</span>
      <strong>${escapeHtml(period.publicLabel || period.title || period.id)}</strong>
      <span class="tcal-list__dates">${escapeHtml(formatRange(period))}</span>${pkg}
    </li>`;
  }

  function render(data) {
    const labels = data.statusLabels;
    const periods = flattenPeriods(data);
    const nowYear = new Date().getFullYear();
    const years = [nowYear, nowYear + 1, nowYear + 2];
    const MONTHS = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const legend = Object.entries(labels)
      .filter(([k]) => k !== "unpublished" || labels.unpublished)
      .map(
        ([key, text]) =>
          `<li class="tcal-legend__item ${STATUS_CLASS[key] || ""}"><span class="tcal-legend__swatch" aria-hidden="true"></span>${escapeHtml(text)}</li>`
      )
      .join("");

    const yearSections = years
      .map((year) => {
        const months = MONTHS.map((name, mi) => {
          const info = monthStatus(periods, year, mi);
          const statusLabel = labelFor(info.status, labels);
          const panelId = `tcal-panel-${year}-${mi}`;
          const detail =
            info.items.length > 0
              ? `<ul class="tcal-month__detail">${info.items.map((p) => `<li>${escapeHtml(p.publicLabel || p.title || "")}</li>`).join("")}</ul>`
              : "";
          return `<button type="button" class="tcal-month ${STATUS_CLASS[info.status]}" data-tcal-month data-year="${year}" data-month="${mi}" aria-expanded="false" aria-controls="${panelId}">
            <span class="tcal-month__name">${escapeHtml(name)}</span>
            <span class="tcal-month__status">${escapeHtml(statusLabel)}</span>
            ${detail}
          </button>`;
        }).join("");
        return `<section class="tcal-year" aria-labelledby="tcal-year-${year}">
          <h2 class="tcal-year__title" id="tcal-year-${year}">${year}</h2>
          <div class="tcal-grid" role="list">${months}</div>
        </section>`;
      })
      .join("");

    const sorted = [...periods].sort((a, b) => String(a.start).localeCompare(String(b.start)));
    const listHtml = sorted.length
      ? `<ul class="tcal-list">${sorted.map((p) => renderListItem(p, labels)).join("")}</ul>`
      : `<p class="meta-line" role="status">No dated entries published yet – use seasonal notes below, then enquire.</p>`;

    const seasonRows = (data.seasonReference || [])
      .map(
        (row) => `<tr>
          <th scope="row">${escapeHtml(row.region)}</th>
          <td>${escapeHtml(row.months)}</td>
          <td>${escapeHtml(row.focus)}</td>
        </tr>`
      )
      .join("");

    mount.innerHTML = `
      <p class="tcal-updated meta-line" role="status">Last updated ${escapeHtml(data.updatedAt || "–")}. ${escapeHtml(data.publisherNote || "")}</p>
      <div class="tcal-toolbar">
        <h2 class="visually-hidden">Status key</h2>
        <ul class="tcal-legend" aria-label="Calendar status labels">${legend}</ul>
      </div>
      ${yearSections}
      <div class="tcal-panel-host" data-tcal-panel-host hidden></div>
      <section class="tcal-list-section" aria-labelledby="tcal-list-heading">
        <h2 class="about-section-heading" id="tcal-list-heading">List view (all published periods)</h2>
        <p class="meta-line">Accessible alternative to the month grid – every published period with text labels.</p>
        ${listHtml}
      </section>
      <section class="about-calendar-wrap" aria-labelledby="tcal-season-heading">
        <h2 class="about-section-heading" id="tcal-season-heading">Season by habitat</h2>
        <table class="about-calendar-table">
          <caption class="visually-hidden">Seasonal planning notes by region</caption>
          <thead><tr><th scope="col">Region / habitat</th><th scope="col">Typical months</th><th scope="col">Planning focus</th></tr></thead>
          <tbody>${seasonRows}</tbody>
        </table>
        <p class="about-sub-note">${escapeHtml(data.page?.disclaimer || "")}</p>
      </section>
    `;

    const panelHost = mount.querySelector("[data-tcal-panel-host]");
    mount.querySelectorAll("[data-tcal-month]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const year = Number(btn.dataset.year);
        const mi = Number(btn.dataset.month);
        const info = monthStatus(periods, year, mi);
        mount.querySelectorAll("[data-tcal-month]").forEach((b) => {
          b.setAttribute("aria-expanded", "false");
        });
        btn.setAttribute("aria-expanded", "true");
        panelHost.hidden = false;
        panelHost.innerHTML = `<div class="tcal-detail reveal" data-reveal>
          <h3 class="tcal-detail__title">${escapeHtml(MONTHS[mi])} ${year}</h3>
          <p class="tcal-detail__status"><strong>${escapeHtml(labelFor(info.status, labels))}</strong></p>
          ${
            info.items.length
              ? `<ul class="tcal-detail__list">${info.items
                  .map((p) => {
                    const link =
                      p.kind === "departure" && p.packageSlug && p.visibility === "public"
                        ? ` <a href="${asset(`packages/${p.packageSlug}/`)}">Itinerary</a>`
                        : "";
                    return `<li>${escapeHtml(p.publicLabel || p.title || "")} (${escapeHtml(formatRange(p))})${link}</li>`;
                  })
                  .join("")}</ul>`
              : `<p>No published periods – do not assume availability.</p>`
          }
          ${renderLeonsCta(data, year, mi, info, labels)}
          <a class="btn btn-outline" href="${asset("plan-your-trip/index.html")}">General enquiry</a>
        </div>`;
      });
    });
  }

  fetch(asset("content/tour-calendar.json"))
    .then((r) => r.json())
    .then(render)
    .catch((err) => {
      mount.innerHTML = `<p class="about-sub-note" role="alert">Calendar could not be loaded. Please enquire by email or phone.</p>`;
      console.error(err);
    });
})();