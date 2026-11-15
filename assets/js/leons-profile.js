/**
 * Leons J. Mlawila – full profile + chronology table
 */
(function () {
  const MAX_STAGGER = 10;

  function orgLocationCell(entry) {
    const parts = [];
    if (entry.location) parts.push(entry.location);
    if (entry.organisation) parts.push(entry.organisation);
    return parts.join(" · ") || "–";
  }

  function renderFieldTable(chrono, escapeHtml) {
    const labels = chrono.categoryLabels || {};
    let highlightIndex = 0;
    const rows = (chrono.entries || [])
      .map((entry, index) => {
        const catLabel = labels[entry.category] || "";
        const catHtml = catLabel
          ? `<span class="leon-field-cat leon-field-cat--${escapeHtml(entry.category)}">${escapeHtml(catLabel)}</span>`
          : "";
        const highlightClass = entry.highlight ? " leon-field-row--highlight" : " leon-field-row--more";
        const laneClass = index % 2 === 0 ? " leon-field-row--lane-left" : " leon-field-row--lane-right";
        const delay =
          entry.highlight && highlightIndex < MAX_STAGGER
            ? ` style="--leon-row-delay: ${highlightIndex++ * 55}ms"`
            : entry.highlight
              ? (highlightIndex++, "")
              : "";
        return `<tr class="leon-field-row${highlightClass}${laneClass}" data-row-index="${index}"${delay}>
          <th scope="row" class="leon-field-period">${escapeHtml(entry.displayPeriod)}</th>
          <td class="leon-field-activity">${escapeHtml(entry.activity)}${catHtml}</td>
          <td class="leon-field-where">${escapeHtml(orgLocationCell(entry))}</td>
        </tr>`;
      })
      .join("");

    const meta = chrono.meta || {};
    return `<section class="leon-field-record reveal" data-reveal data-leon-field-record aria-labelledby="leon-field-heading">
      <header class="leon-field-record__head">
        <h2 id="leon-field-heading" class="about-section-heading">Professional experience</h2>
        <p class="leon-field-record__lead">${escapeHtml(meta.caption || "")}</p>
        <p class="leon-field-record__highlights-note">${escapeHtml(meta.highlightIntro || "")}</p>
      </header>
      <div class="leon-field-record__scrim">
        <div class="leon-field-record__spine" aria-hidden="true"></div>
        <div class="leon-field-record__scroll" tabindex="0" role="region" aria-label="Field chronology table">
          <table class="leon-field-table">
            <caption class="leon-field-table__caption">
              Documented field contributions for Leons J. Mlawila (${meta.entryCount || chrono.entries?.length || 0} entries on file)
            </caption>
            <thead>
              <tr>
                <th scope="col">Year / period</th>
                <th scope="col">Project or field contribution</th>
                <th scope="col">Location / organisation</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
      <noscript>
        <style>
          .leon-field-record .leon-field-row { display: table-row !important; opacity: 1 !important; transform: none !important; }
          .leon-field-record__toggle { display: none !important; }
        </style>
      </noscript>
      <button type="button" class="leon-field-record__toggle btn btn-outline" aria-expanded="false" data-leon-field-toggle>
        View full field record
      </button>
    </section>`;
  }

  function injectSchema(displayName) {
    const existing = document.getElementById("leons-profile-schema");
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "leons-profile-schema";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      mainEntity: {
        "@type": "Person",
        name: displayName,
        jobTitle: "Birding guide and tour operator",
        worksFor: {
          "@type": "Organization",
          name: "Endemic Birds Tanzania",
          url: "https://endemicbirds.co.tz/",
        },
        nationality: {
          "@type": "Country",
          name: "Tanzania",
        },
      },
    });
    document.head.appendChild(script);
  }

  function bindRowScrollReveal(section) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || section.classList.contains("leon-field-record--static")) {
      section.querySelectorAll(".leon-field-row").forEach((row) => row.classList.add("is-row-visible"));
      return;
    }

    if (!("IntersectionObserver" in window)) {
      section.querySelectorAll(".leon-field-row").forEach((row) => row.classList.add("is-row-visible"));
      return;
    }

    const visibleRows = [...section.querySelectorAll(".leon-field-row")].filter((row) => {
      if (row.classList.contains("leon-field-row--more") && !section.classList.contains("is-expanded")) {
        return false;
      }
      return !row.classList.contains("is-row-visible");
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((ent) => {
          if (ent.isIntersecting) {
            ent.target.classList.add("is-row-visible");
            io.unobserve(ent.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.2 }
    );

    visibleRows.forEach((row) => io.observe(row));
  }

  function initFieldRecord(root) {
    const section = root.querySelector("[data-leon-field-record]");
    if (!section) return;

    const toggle = section.querySelector("[data-leon-field-toggle]");
    const moreRows = section.querySelectorAll(".leon-field-row--more");
    const count = moreRows.length;

    if (toggle && count > 0) {
      toggle.textContent = `View full field record (${count} more entries)`;
      toggle.addEventListener("click", () => {
        const expanded = section.classList.toggle("is-expanded");
        toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
        toggle.textContent = expanded
          ? "Show highlights only"
          : `View full field record (${count} more entries)`;
        if (expanded) {
          requestAnimationFrame(() => bindRowScrollReveal(section));
        }
      });
    } else if (toggle) {
      toggle.hidden = true;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.classList.add("leon-field-record--static");
    }

    bindRowScrollReveal(section);
  }

  function renderProfile(page, chrono, asset, escapeHtml, renderRelated) {
    const portrait = asset(page.portrait || "endemics/leons.jpg");
    const name = page.displayName || page.title || "Leons J. Mlawila";
    const story = (page.story || []).map((p) => `<p>${escapeHtml(p)}</p>`).join("");
    const themes = (page.safariValue?.themes || [])
      .map(
        (t) => `<article class="leon-value-card">
          <h3 class="leon-value-card__title">${escapeHtml(t.heading)}</h3>
          <p>${escapeHtml(t.body)}</p>
        </article>`
      )
      .join("");

    const collab = page.collaboration || {};
    const explore = (collab.exploreLinks || [])
      .map((l) => `<li><a href="${asset(l.href)}">${escapeHtml(l.label)}</a></li>`)
      .join("");

    const avail = page.availability || {};
    const calendarBtn = `<a class="btn btn-outline about-profile-calendar" href="${asset(avail.href)}">${escapeHtml(avail.label)}</a>`;
    const enquireDates = `<a class="text-link about-profile-avail" href="${asset(avail.fallbackHref || avail.href)}">${escapeHtml(avail.fallbackLabel || "Enquire about your dates")} →</a>`;

    const ctaSafari = page.ctas?.safari;
    const ctaOp = page.ctas?.operator;

    return `<article class="about-leon-profile about-leon-profile--v2">
      <header class="leon-profile-hero">
        <div class="about-leon-profile__media leon-profile-hero__media">
          <img src="${portrait}" alt="${escapeHtml(page.portraitAlt || name)}" width="340" height="340" loading="eager" decoding="async" />
        </div>
        <div class="leon-profile-hero__copy">
          <p class="eyebrow">${escapeHtml(page.eyebrow || "Guide profile")}</p>
          <h1 class="about-sub-title">${escapeHtml(name)}</h1>
          <p class="leon-profile-role">${escapeHtml(page.roleLine || "")}</p>
          <p class="leon-profile-tagline">${escapeHtml(page.tagline || "")}</p>
          <p class="about-sub-lead">${escapeHtml(page.lead || "")}</p>
          <p class="leon-profile-intro">${escapeHtml(page.intro || "")}</p>
          ${calendarBtn}
          ${enquireDates}
        </div>
      </header>

      <section class="about-profile-block leon-profile-story" aria-labelledby="leon-story-heading">
        <h2 id="leon-story-heading" class="about-section-heading">His story</h2>
        <div class="leon-profile-story__body">${story}</div>
        ${
          page.speciesRecordNote
            ? `<p class="about-sub-note leon-species-note" role="note">${escapeHtml(page.speciesRecordNote)}</p>`
            : ""
        }
      </section>

      <section class="leon-safari-value" aria-labelledby="leon-value-heading">
        <h2 id="leon-value-heading" class="about-section-heading">${escapeHtml(page.safariValue?.title || "What his experience brings to your safari")}</h2>
        <div class="leon-safari-value__grid">${themes}</div>
      </section>

      ${renderFieldTable(chrono, escapeHtml)}

      <section class="about-profile-block leon-collaboration" aria-labelledby="leon-collab-heading">
        <h2 id="leon-collab-heading" class="about-section-heading">${escapeHtml(collab.title || "Guiding and collaboration")}</h2>
        <div class="leon-collab-grid">
          <article class="leon-collab-card">
            <h3>${escapeHtml(collab.traveller?.heading || "Travel with Leons")}</h3>
            <p>${escapeHtml(collab.traveller?.body || "")}</p>
            <a class="text-link" href="${asset(collab.traveller?.href || ctaSafari?.href)}">${escapeHtml(ctaSafari?.label || "Request Leons for your safari")} →</a>
          </article>
          <article class="leon-collab-card">
            <h3>${escapeHtml(collab.operator?.heading || "Local guiding support")}</h3>
            <p>${escapeHtml(collab.operator?.body || "")}</p>
            <a class="text-link" href="${asset(collab.operator?.href || ctaOp?.href)}">${escapeHtml(ctaOp?.label || "Operator enquiry")} →</a>
          </article>
        </div>
        <h3 class="leon-collab-explore-title">Routes and reading</h3>
        <ul class="about-profile-list leon-collab-links">${explore}</ul>
      </section>

      ${renderRelated ? renderRelated(page.related) : ""}

      <p class="about-sub-actions about-sub-actions--dual">
        <a class="btn btn-solid btn-interactive" href="${asset(ctaSafari?.href)}">${escapeHtml(ctaSafari?.label || "Request Leons for your safari")}</a>
        <a class="btn btn-outline" href="${asset(ctaOp?.href)}">${escapeHtml(ctaOp?.label || "Enquire about local guiding support")}</a>
      </p>
      <p class="about-sub-actions">
        <a class="text-link" href="${asset("about/index.html")}">← About overview</a>
      </p>
    </article>`;
  }

  function mount(page, mount, asset, escapeHtml, renderRelated) {
    const chronoUrl = asset("content/leons-mlawila-chronology.json");
    return fetch(chronoUrl)
      .then((r) => r.json())
      .then((chrono) => {
        mount.innerHTML = renderProfile(page, chrono, asset, escapeHtml, renderRelated);
        injectSchema(page.displayName || page.title);
        initFieldRecord(mount);
      });
  }

  window.LeonsProfile = { mount, initFieldRecord };
})();