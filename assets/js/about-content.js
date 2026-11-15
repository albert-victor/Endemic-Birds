(function () {
  const root = document.querySelector("[data-about-page]");
  if (!root) return;

  const prefix = window.__ASSET_PREFIX__ || "/";
  const asset = (p) => prefix + String(p).replace(/^\//, "");

  const STORY_IMAGE = "assets/images/about-page/great-migration.jpg";

  const galleryImages = [
    { src: "assets/images/about-page/great-migration.jpg", alt: "Wildebeest migration in Tanzania" },
    { src: "assets/images/about-page/golden hours.jpg", alt: "Golden hour on safari" },
    { src: "assets/images/about-page/savana.jpg", alt: "Tanzania savanna landscape" },
    { src: "assets/images/about-page/wildlife.jpg", alt: "Wildlife on safari" },
    { src: "assets/images/about-page/sky.jpg", alt: "Sky over the plains" },
    { src: "assets/images/about-page/predators.jpg", alt: "Predators in the wild" },
    { src: "assets/images/about-page/suset.jpg", alt: "Sunset on safari" },
    { src: "assets/images/about-page/23bf7b75-1fc2-4091-bfae-8a9882218030.jpg", alt: "Safari field moment" },
    { src: "assets/images/about-page/45de6f40-94db-4fa0-b46a-bfdb6d439fee.jpg", alt: "Birding and wildlife" },
    { src: "assets/images/about-page/580211fd-78eb-4ac3-84ac-fc5f0054b6f6.jpg", alt: "Tanzania nature tour" },
  ];

  const INITIAL_GALLERY = 6;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderGalleryCells(items) {
    return items
      .map(
        (item) =>
          `<figure class="about-gallery__cell"><img src="${asset(item.src)}" alt="${escapeHtml(item.alt)}" loading="lazy" decoding="async" /></figure>`
      )
      .join("");
  }

  fetch(asset("content/about.json"))
    .then((r) => r.json())
    .then((data) => {
      const o = data.overview || {};

      if (o.seo?.title) document.title = o.seo.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && o.seo?.description) metaDesc.setAttribute("content", o.seo.description);

      const leadEl = root.querySelector("[data-about-intro-lead]");
      if (leadEl && o.heroLead) leadEl.textContent = o.heroLead;

      const introEl = root.querySelector("[data-about-intro]");
      if (introEl && o.intro) introEl.textContent = o.intro;

      const storyBg = root.querySelector("[data-about-story-bg]");
      if (storyBg) storyBg.style.backgroundImage = `url('${asset(STORY_IMAGE)}')`;

      const quoteEl = root.querySelector("[data-about-story-quote]");
      const citeEl = root.querySelector("[data-about-story-cite]");
      if (quoteEl) quoteEl.textContent = o.storyQuote || "";
      if (citeEl) citeEl.textContent = o.storyCite || "";

      const approachHost = root.querySelector("[data-about-approach]");
      if (approachHost && o.approach) {
        const pts = (o.approach.points || [])
          .map(
            (p) => `<article class="about-approach-card">
              <h3>${escapeHtml(p.title)}</h3>
              <p>${escapeHtml(p.body)}</p>
            </article>`
          )
          .join("");
        approachHost.innerHTML = `<header class="about-approach-head">
          <h2 class="section-title">${escapeHtml(o.approach.title)}</h2>
          <p class="section-lead">${escapeHtml(o.approach.lead)}</p>
        </header>
        <div class="about-approach-grid">${pts}</div>`;
      }

      const wildlifeEl = root.querySelector("[data-about-wildlife-band]");
      if (wildlifeEl && o.wildlifeBand) {
        wildlifeEl.innerHTML = `<div class="about-wildlife-band__inner">
          <h2 class="section-title">${escapeHtml(o.wildlifeBand.title)}</h2>
          <p class="section-lead">${escapeHtml(o.wildlifeBand.body)}</p>
          <a class="text-link" href="${asset("combined/index.html")}">Birding + wildlife combinations →</a>
        </div>`;
      }

      const leon = o.leonTeaser || {};
      const leonHost = root.querySelector("[data-about-leon-teaser]");
      if (leonHost) {
        leonHost.innerHTML = `<div class="about-leon-spotlight__media">
            <span class="about-leon-spotlight__ring" aria-hidden="true"></span>
            <img src="${asset("endemics/leons.jpg")}" alt="${escapeHtml(leon.heading || "Leons Mlawila")}" width="280" height="280" loading="lazy" />
          </div>
          <div class="about-leon-spotlight__copy">
            <p class="eyebrow">${escapeHtml(leon.eyebrow || "")}</p>
            <h2 id="about-leon-heading">${escapeHtml(leon.heading || "")}</h2>
            <p class="about-leon-spotlight__lead">${escapeHtml(leon.lead || "")}</p>
            <ul class="about-leon-spotlight__points">
              ${(leon.points || []).map((pt) => `<li>${escapeHtml(pt)}</li>`).join("")}
            </ul>
            <p class="about-leon-spotlight__actions">
              <a class="btn btn-solid btn-interactive" href="${asset(leon.profileHref || "about/leons-mlawila/index.html")}">Full profile</a>
              <a class="btn btn-outline" href="${asset(leon.calendarHref || "about/tour-calendar/index.html")}">Tour calendar</a>
            </p>
          </div>`;
      }

      const hubHost = root.querySelector("[data-about-explore-hub]");
      if (hubHost && o.exploreHub) {
        const cards = (o.exploreHub.cards || [])
          .map(
            (c) => `<a class="about-hub-card" href="${asset(c.href)}">
              <h3>${escapeHtml(c.title)}</h3>
              <p>${escapeHtml(c.desc)}</p>
              <span class="about-hub-card__arrow" aria-hidden="true">→</span>
            </a>`
          )
          .join("");
        hubHost.innerHTML = `<header class="about-explore-head">
          <h2 class="section-title">${escapeHtml(o.exploreHub.title)}</h2>
          <p class="section-lead">${escapeHtml(o.exploreHub.lead)}</p>
        </header>
        <div class="about-hub-grid">${cards}</div>
        <p class="about-explore-more"><a class="text-link" href="${asset("about/why-choose-us/index.html")}">Why choose Endemic Birds →</a></p>`;
      }

      const calHost = root.querySelector("[data-about-calendar-teaser]");
      if (calHost && o.calendarTeaser) {
        const highlights = (o.calendarTeaser.highlights || [])
          .map(
            (h) => `<div class="about-cal-teaser__item">
              <span class="about-cal-teaser__season">${escapeHtml(h.season)}</span>
              <p>${escapeHtml(h.note)}</p>
            </div>`
          )
          .join("");
        const baseHtml = `<div class="about-cal-teaser about-cal-teaser--rich">
          <div class="about-cal-teaser__copy">
            <h2 class="section-title">${escapeHtml(o.calendarTeaser.title)}</h2>
            <p class="section-lead">${escapeHtml(o.calendarTeaser.lead)}</p>
            <div data-about-cal-next></div>
            <div class="about-cal-teaser__actions">
              <a class="btn btn-solid" href="${asset(o.calendarTeaser.href)}">Open tour calendar</a>
              <a class="btn btn-outline" href="${asset("plan-your-trip/index.html")}">Enquire on dates</a>
            </div>
          </div>
          <div class="about-cal-teaser__highlights">${highlights}</div>
        </div>`;
        calHost.innerHTML = baseHtml;
        fetch(asset("content/tour-calendar.json"))
          .then((r) => r.json())
          .then((cal) => {
            const today = new Date().toISOString().slice(0, 10);
            const next = (cal.departures || [])
              .filter((d) => d.status === "departure-open" && d.start >= today)
              .sort((a, b) => a.start.localeCompare(b.start))[0];
            const nextHost = calHost.querySelector("[data-about-cal-next]");
            if (nextHost && next) {
              nextHost.innerHTML = `<p class="about-cal-teaser__next" role="status"><strong>Next open departure:</strong> ${escapeHtml(next.publicLabel || next.title)} (${escapeHtml(next.start)} – ${escapeHtml(next.end)}). Enquire – not instant booking.</p>`;
            } else if (nextHost) {
              nextHost.innerHTML = `<p class="about-cal-teaser__next meta-line">No departures dated ahead – use the calendar for guide availability or enquire for a private route.</p>`;
            }
          })
          .catch(() => {});
      }

      const enqHost = root.querySelector("[data-about-enquiries]");
      if (enqHost && o.enquiries) {
        const t = o.enquiries.traveller || {};
        const op = o.enquiries.operator || {};
        enqHost.innerHTML = `<div class="container cta-band about-enquiries-band">
          <h2 class="section-title">${escapeHtml(o.enquiries.title)}</h2>
          <div class="about-enquiry-grid">
            <article class="about-enquiry-card">
              <h3>${escapeHtml(t.heading)}</h3>
              <p>${escapeHtml(t.body)}</p>
              <a class="btn btn-solid" href="${asset(t.href)}">${escapeHtml(t.label)}</a>
            </article>
            <article class="about-enquiry-card about-enquiry-card--operator">
              <h3>${escapeHtml(op.heading)}</h3>
              <p>${escapeHtml(op.body)}</p>
              <a class="btn btn-outline" href="${asset(op.href)}">${escapeHtml(op.label)}</a>
            </article>
          </div>
        </div>`;
      }

      const fullHost = root.querySelector("[data-about-gallery-full]");
      const toggleBtn = root.querySelector("[data-about-gallery-toggle]");
      if (fullHost) {
        const initial = galleryImages.slice(0, INITIAL_GALLERY);
        const rest = galleryImages.slice(INITIAL_GALLERY);
        fullHost.innerHTML = renderGalleryCells(initial);
        if (rest.length && toggleBtn) {
          toggleBtn.hidden = false;
          toggleBtn.addEventListener("click", () => {
            fullHost.insertAdjacentHTML("beforeend", renderGalleryCells(rest));
            fullHost.classList.add("is-expanded");
            root.querySelector(".about-gallery-viewport")?.classList.add("is-expanded");
            toggleBtn.hidden = true;
          });
        } else if (galleryImages.length > initial.length) {
          fullHost.innerHTML = renderGalleryCells(galleryImages);
        }
      }

      document.dispatchEvent(new CustomEvent("site:content-rendered"));
    })
    .catch(console.error);
})();