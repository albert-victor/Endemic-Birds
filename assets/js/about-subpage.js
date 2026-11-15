(function () {
  const slug = document.body.dataset.aboutSub;
  if (!slug) return;

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

  function renderRelated(links) {
    if (!links?.length) return "";
    const items = links
      .map((l) => `<li><a href="${asset(l.href)}">${escapeHtml(l.label)}</a></li>`)
      .join("");
    return `<nav class="about-related" aria-label="Related pages"><p class="about-related__label">Continue reading</p><ul>${items}</ul></nav>`;
  }

  function renderSections(sections) {
    if (!sections?.length) return "";
    return sections
      .map(
        (s) => `<section class="about-sub-block">
          <h2>${escapeHtml(s.heading)}</h2>
          <p>${escapeHtml(s.body)}</p>
        </section>`
      )
      .join("");
  }

  function renderWhyChoose(page) {
    const pillars = (page.pillars || [])
      .map(
        (p) => `<article class="about-pillar-card">
          <h2>${escapeHtml(p.title)}</h2>
          <p>${escapeHtml(p.body)}</p>
          ${p.example ? `<p class="about-pillar-example"><strong>Example:</strong> ${escapeHtml(p.example)}</p>` : ""}
        </article>`
      )
      .join("");
    const audiences = (page.audiences || [])
      .map(
        (a) => `<article class="about-audience-chip">
          <h3>${escapeHtml(a.title)}</h3>
          <p>${escapeHtml(a.body)}</p>
        </article>`
      )
      .join("");
    const prep = page.preparation;
    const prepList = prep?.points?.length
      ? `<ul class="about-prep-list">${prep.points.map((pt) => `<li>${escapeHtml(pt)}</li>`).join("")}</ul>`
      : "";
    return `<header class="about-sub-head">
        <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
        <h1 class="about-sub-title">${escapeHtml(page.title)}</h1>
        <p class="about-sub-lead">${escapeHtml(page.lead)}</p>
      </header>
      <div class="about-pillar-grid">${pillars}</div>
      <section class="about-audience-section" aria-labelledby="about-audience-heading">
        <h2 id="about-audience-heading" class="about-section-heading">Guests we plan for</h2>
        <div class="about-audience-grid">${audiences}</div>
      </section>
      ${
        prep
          ? `<section class="about-prep-section" aria-labelledby="about-prep-heading">
        <h2 id="about-prep-heading" class="about-section-heading">${escapeHtml(prep.title)}</h2>
        ${prepList}
      </section>`
          : ""
      }
      ${renderRelated(page.related)}
      <p class="about-sub-actions">
        <a class="btn btn-solid" href="${asset(page.cta?.href || "plan-your-trip/index.html")}">${escapeHtml(page.cta?.label || "Enquire")}</a>
        <a class="text-link" href="${asset("about/index.html")}">← About overview</a>
      </p>`;
  }

  function renderTeamCard(member) {
    const langs =
      member.languages?.length > 0
        ? `<p class="about-team-card__meta"><strong>Languages:</strong> ${escapeHtml(member.languages.join(", "))}</p>`
        : "";
    const regions = member.regions
      ? `<p class="about-team-card__meta"><strong>Regions:</strong> ${escapeHtml(member.regions)}</p>`
      : "";
    const profile = member.profileHref
      ? `<a class="about-team-card__link" href="${asset(member.profileHref)}">View profile</a>`
      : "";
    return `<article class="about-team-card" data-team-id="${escapeHtml(member.id)}">
      <div class="about-team-card__media">
        <img src="${asset(member.photo)}" alt="${escapeHtml(member.photoAlt || member.name)}" width="160" height="160" loading="lazy" decoding="async" />
      </div>
      <div class="about-team-card__body">
        <p class="about-team-card__role">${escapeHtml(member.role)}</p>
        <h2 class="about-team-card__name">${escapeHtml(member.name)}</h2>
        <p class="about-team-card__specialty">${escapeHtml(member.specialty)}</p>
        <p class="about-team-card__bio">${escapeHtml(member.bio)}</p>
        ${langs}
        ${regions}
        ${profile}
      </div>
    </article>`;
  }

  function renderTeam(page, team) {
    const staff = (team.members || []).filter((m) => m.category === "staff").map(renderTeamCard).join("");
    const associates = (team.associates || []).map(renderTeamCard).join("");
    return `<header class="about-sub-head">
        <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
        <h1 class="about-sub-title">${escapeHtml(page.title)}</h1>
        <p class="about-sub-lead">${escapeHtml(page.lead)}</p>
      </header>
      <section aria-labelledby="team-staff-heading">
        <h2 id="team-staff-heading" class="about-section-heading">${escapeHtml(team.staffLabel || "Company leadership")}</h2>
        <div class="about-team-grid">${staff || `<p class="about-sub-note">No published staff profiles yet.</p>`}</div>
      </section>
      ${
        associates
          ? `<section aria-labelledby="team-assoc-heading">
        <h2 id="team-assoc-heading" class="about-section-heading">${escapeHtml(team.associatesLabel || "Associate guides")}</h2>
        <div class="about-team-grid">${associates}</div>
      </section>`
          : `<p class="about-sub-note">${escapeHtml(team.associateNote || "")}</p>`
      }
      <p class="about-sub-note about-sub-note--soft">${escapeHtml(team.driversNote || "")}</p>
      ${renderRelated(page.related)}
      <p class="about-sub-actions">
        <a class="btn btn-solid" href="${asset("about/leons-mlawila/index.html")}">Leons J. Mlawila</a>
        <a class="btn btn-outline" href="${asset("plan-your-trip/index.html?interest=operator")}">Operator enquiry</a>
      </p>`;
  }

  function renderLeonsProfile(page) {
    const portrait = asset(page.portrait || "endemics/leons.jpg");
    const specs = (page.specialties || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("");
    const regions = (page.regions || []).map((r) => `<li>${escapeHtml(r)}</li>`).join("");
    const approachPts = (page.approach?.points || []).map((pt) => `<li>${escapeHtml(pt)}</li>`).join("");
    const reports = (page.tripReports || [])
      .map(
        (r) => `<li><a href="${asset(r.href)}">${escapeHtml(r.title)}</a>${r.date ? ` <span class="about-report-meta">(${escapeHtml(r.date)})</span>` : ""}</li>`
      )
      .join("");
    const testimonials = (page.testimonials || [])
      .map(
        (t) => `<blockquote class="about-testimonial">
          <p>${escapeHtml(t.quote)}</p>
          ${t.attribution ? `<cite>${escapeHtml(t.attribution)}</cite>` : ""}
        </blockquote>`
      )
      .join("");

    const credBlock = page.credentials
      ? `<section class="about-profile-block"><h2>Credentials</h2><p>${escapeHtml(page.credentials)}</p></section>`
      : "";
    const langBlock =
      page.languages?.length > 0
        ? `<p class="about-profile-meta"><strong>Languages:</strong> ${escapeHtml(page.languages.join(", "))}</p>`
        : "";

    const reportsBlock = reports
      ? `<section class="about-profile-block"><h2>Related trip reports</h2><ul class="about-profile-list">${reports}</ul></section>`
      : "";
    const testimonialBlock = testimonials
      ? `<section class="about-profile-block"><h2>Guest notes</h2>${testimonials}</section>`
      : "";

    const avail = page.availability
      ? `<a class="text-link about-profile-avail" href="${asset(page.availability.href)}">${escapeHtml(page.availability.label)} →</a>`
      : "";

    const ctaSafari = page.ctas?.safari;
    const ctaOp = page.ctas?.operator;

    const calendarBtn = `<a class="btn btn-outline about-profile-calendar" href="${asset("about/tour-calendar/index.html")}">Tour calendar &amp; availability</a>`;

    return `<article class="about-leon-profile about-leon-profile--full">
      <div class="about-leon-profile__media">
        <img src="${portrait}" alt="${escapeHtml(page.portraitAlt || page.title)}" width="320" height="320" loading="lazy" decoding="async" />
        ${avail}
        ${calendarBtn}
      </div>
      <div class="about-leon-profile__copy">
        <p class="eyebrow">${escapeHtml(page.eyebrow || "")}</p>
        <h1 class="about-sub-title">${escapeHtml(page.title)}</h1>
        <p class="about-sub-lead">${escapeHtml(page.lead)}</p>
        <section class="about-profile-block">
          <h2>Biography</h2>
          <p>${escapeHtml(page.biography)}</p>
          ${langBlock}
        </section>
        <section class="about-profile-block">
          <h2>Birding specialties</h2>
          <ul class="about-profile-list">${specs}</ul>
        </section>
        <section class="about-profile-block">
          <h2>Regions and operating scope</h2>
          <ul class="about-profile-list">${regions}</ul>
        </section>
        <section class="about-profile-block">
          <h2>${escapeHtml(page.approach?.title || "Guiding approach")}</h2>
          <ul class="about-profile-list">${approachPts}</ul>
        </section>
        ${credBlock}
        ${reportsBlock}
        ${testimonialBlock}
        ${renderRelated(page.related)}
        <p class="about-sub-actions about-sub-actions--dual">
          <a class="btn btn-solid btn-interactive" href="${asset(ctaSafari?.href || "plan-your-trip/index.html?guide=leons")}">${escapeHtml(ctaSafari?.label || "Request Leons for your safari")}</a>
          <a class="btn btn-outline" href="${asset(ctaOp?.href || "plan-your-trip/index.html?interest=operator")}">${escapeHtml(ctaOp?.label || "Enquire about local guiding support")}</a>
        </p>
        <p class="about-sub-actions">
          <a class="text-link" href="${asset("about/index.html")}">← About overview</a>
        </p>
      </div>
    </article>`;
  }

  const mount = document.querySelector("[data-about-sub-mount]");
  if (!mount) return;

  const credibilitySlugs = ["trip-reports", "tour-training", "partners"];
  if (credibilitySlugs.includes(slug) && window.AboutCredibility) {
    window.AboutCredibility.mount(slug, mount).then(() => {
      mount.removeAttribute("aria-busy");
      document.dispatchEvent(new CustomEvent("site:content-rendered"));
    });
    return;
  }

  fetch(asset("content/about.json"))
    .then((r) => r.json())
    .then((data) => {
      const page = data.pages?.[slug];
      if (!page) return;

      if (page.seo?.title) document.title = page.seo.title;
      const meta = document.querySelector('meta[name="description"]');
      if (meta && page.seo?.description) meta.setAttribute("content", page.seo.description);

      if (slug === "why-choose-us" || slug === "team" || slug === "leons-mlawila") {
        mount.closest(".about-sub-container")?.classList.add("about-sub-container--wide");
      }

      let body = "";

      if (slug === "why-choose-us" && page.layout === "why-choose") {
        body = renderWhyChoose(page);
      } else if (slug === "team" && page.layout === "team") {
        body = renderTeam(page, data.team || {});
      } else if (slug === "leons-mlawila" && window.LeonsProfile?.mount) {
        window.LeonsProfile.mount(page, mount, asset, escapeHtml, renderRelated)
          .then(() => {
            mount.removeAttribute("aria-busy");
            document.dispatchEvent(new CustomEvent("site:content-rendered"));
          })
          .catch(console.error);
        return;
      } else if (slug === "leons-mlawila") {
        body = renderLeonsProfile(page);
      } else if (slug === "trip-reports") {
        const list = (page.reports || [])
          .map(
            (r) => `<article class="about-report-card">
              <h2><a href="${asset(r.href)}">${escapeHtml(r.title)}</a></h2>
              <p class="about-report-meta">${escapeHtml(r.date || "")} · ${escapeHtml(r.route || "")}</p>
              <p>${escapeHtml(r.summary || "")}</p>
            </article>`
          )
          .join("");
        body = `<header class="about-sub-head">
          <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
          <h1 class="about-sub-title">${escapeHtml(page.title)}</h1>
          <p class="about-sub-lead">${escapeHtml(page.lead)}</p>
        </header>
        ${list || `<p class="about-sub-note" role="status">${escapeHtml(page.emptyMessage)}</p>`}
        <p class="about-sub-actions">
          <a class="btn btn-solid" href="${asset("plan-your-trip/index.html")}">Ask for recent notes</a>
          <a class="text-link" href="${asset("about/index.html")}">← About overview</a>
        </p>`;
      } else if (slug === "tour-calendar") {
        body = `<header class="about-sub-head">
          <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
          <h1 class="about-sub-title">${escapeHtml(page.title)}</h1>
          <p class="about-sub-lead">${escapeHtml(page.lead)}</p>
        </header>
        <div data-tour-calendar-app aria-busy="true">Loading calendar…</div>
        <p class="about-sub-actions">
          <a class="btn btn-solid" href="${asset("plan-your-trip/index.html")}">Enquire on your dates</a>
          <a class="text-link" href="${asset("about/leons-mlawila/index.html")}">Leons J. Mlawila</a>
        </p>`;
      } else if (slug === "policies") {
        fetch(asset("content/policies-hub.json"))
          .then((r) => r.json())
          .then((hub) => {
            const h = hub.hub || {};
            const links = (hub.policies || [])
              .map((l) => {
                const status =
                  l.status === "draft"
                    ? `<span class="policy-status policy-status--draft">Draft – not final</span>`
                    : `<span class="policy-status policy-status--published">Published</span>`;
                return `<article class="about-policy-card">
              <h2><a href="${asset(l.href)}">${escapeHtml(l.title)}</a></h2>
              ${status}
              <p>${escapeHtml(l.desc)}</p>
            </article>`;
              })
              .join("");
            const checklist = (hub.ownerChecklist || [])
              .map((c) => `<li>${escapeHtml(c)}</li>`)
              .join("");
            const mount = document.querySelector("[data-about-sub-mount]");
            if (!mount) return;
            mount.innerHTML = `<header class="about-sub-head">
          <p class="eyebrow">${escapeHtml(h.eyebrow || page.eyebrow)}</p>
          <h1 class="about-sub-title">${escapeHtml(h.title || page.title)}</h1>
          <p class="about-sub-lead">${escapeHtml(h.lead || page.lead)}</p>
        </header>
        <div class="about-policy-grid">${links}</div>
        <p class="about-sub-note">${escapeHtml(h.professionalReviewNote || page.note || "")}</p>
        <section class="about-policy-checklist" aria-labelledby="policy-checklist-heading">
          <h2 id="policy-checklist-heading" class="about-section-heading">Owner information checklist</h2>
          <ul>${checklist}</ul>
        </section>
        <p class="about-sub-actions">
          <a class="text-link" href="${asset("about/index.html")}">← About overview</a>
        </p>`;
            mount.removeAttribute("aria-busy");
            document.dispatchEvent(new CustomEvent("site:content-rendered"));
          })
          .catch(console.error);
        body = null;
      } else {
        const cta = page.cta
          ? `<p class="about-sub-actions">
              <a class="btn btn-solid" href="${asset(page.cta.href)}">${escapeHtml(page.cta.label)}</a>
              <a class="text-link" href="${asset("about/index.html")}">← About overview</a>
            </p>`
          : `<p class="about-sub-actions"><a class="text-link" href="${asset("about/index.html")}">← About overview</a></p>`;
        body = `<header class="about-sub-head">
          <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
          <h1 class="about-sub-title">${escapeHtml(page.title)}</h1>
          <p class="about-sub-lead">${escapeHtml(page.lead)}</p>
        </header>
        ${renderSections(page.sections)}
        ${cta}`;
      }

      if (body !== null) {
        mount.innerHTML = body;
        mount.removeAttribute("aria-busy");
        document.dispatchEvent(new CustomEvent("site:content-rendered"));
      }
    })
    .catch(console.error);
})();