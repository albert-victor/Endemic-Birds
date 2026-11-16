(function () {
  const mount = document.querySelector("[data-home-mount]");
  if (!mount) return;

  const prefix = window.__ASSET_PREFIX__ || "/";
  const asset = (p) => prefix + String(p).replace(/^\//, "");

  function mediaAsset(path) {
    if (window.EndemicMedia?.mediaUrl && path) {
      const url = window.EndemicMedia.mediaUrl(path);
      if (url) return url;
    }
    return asset(path);
  }

  const iconMap = {
    binoculars: "fa-binoculars",
    users: "fa-people-group",
    map: "fa-route",
    leaf: "fa-leaf",
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderHeroSlides(slides, mediaHost, heroRoot) {
    if (!mediaHost) return;
    mediaHost.innerHTML = slides
      .map((s, i) => {
        const pos = s.objectPosition || "72% 42%";
        const fetch = i === 0 ? ' fetchpriority="high"' : "";
        return `<div class="hero-push-slide${i === 0 ? " is-active" : ""}" data-hero-push-slide data-duration="${s.durationMs || 12000}" data-slide-index="${i}" aria-hidden="${i === 0 ? "false" : "true"}">
        <img src="${asset(s.image)}" alt="${escapeHtml(s.alt || "")}" decoding="${i === 0 ? "sync" : "async"}"${fetch} style="object-position: ${pos}" />
      </div>`;
      })
      .join("");
    if (heroRoot) {
      heroRoot.dataset.heroSlideCount = String(slides.length);
      delete heroRoot.dataset.heroPushInit;
    }
    window.__HERO_SLIDES = slides;
    if (window.updateHeroCopy) window.updateHeroCopy(0);
  }

  function renderWhySplit(split) {
    const slotClass = {
      top: "why-diamond--top",
      left: "why-diamond--left",
      right: "why-diamond--right",
      bottom: "why-diamond--bottom",
    };
    const collageItems = (split?.collage || []).filter((item) => item.slot && slotClass[item.slot]).slice(0, 4);
    const collage = collageItems
      .map(
        (item, i) =>
          `<figure class="why-diamond ${slotClass[item.slot]} reveal-fade-up" data-reveal style="--gem-i:${i}">
          <div class="why-diamond-shape">
            <img src="${asset(item.src)}" alt="${escapeHtml(item.alt || "")}" loading="lazy" decoding="async"${
            item.objectPosition ? ` style="object-position:${item.objectPosition}"` : ""
          } />
          </div>
        </figure>`
      )
      .join("");

    const ctaPrimary = split?.ctaPrimary;
    const ctaSecondary = split?.ctaSecondary;
    const actions =
      ctaPrimary || ctaSecondary
        ? `<div class="why-split-actions reveal-fade-up" data-reveal data-reveal-delay="160">
        ${ctaPrimary ? `<a class="btn btn-solid why-cta-primary" href="${asset(ctaPrimary.href)}">${escapeHtml(ctaPrimary.label)}</a>` : ""}
        ${ctaSecondary ? `<a class="why-split-link" href="${asset(ctaSecondary.href)}"><span class="why-split-link-icon" aria-hidden="true">▶</span><span>${escapeHtml(ctaSecondary.label)}</span></a>` : ""}
      </div>`
        : "";

    return `<div class="why-split">
      <div class="why-split-copy">
        <h2 class="why-split-title reveal-fade-up" data-reveal id="why-us-heading">
          <span class="why-split-title-script">${escapeHtml(split?.titleScript || "Specialist routes")}</span>
          <span class="why-split-title-bold">${escapeHtml(split?.titleBold || "in Tanzania")}</span>
        </h2>
        <p class="why-split-lead reveal-fade-up" data-reveal data-reveal-delay="80">${escapeHtml(split?.lead || "")}</p>
        ${actions}
      </div>
      <div class="why-diamond-stage reveal-fade-up" data-reveal data-reveal-delay="120" aria-hidden="false">
        <div class="why-diamond-grid">${collage}</div>
      </div>
    </div>`;
  }

  function reviewFlagUrl(countryCode) {
    const map = { UK: "gb", EL: "gr" };
    const raw = String(countryCode || "tz").trim();
    const code = (map[raw.toUpperCase()] || raw).toLowerCase();
    return `https://flagcdn.com/w80/${code}.png`;
  }

  const REVIEW_PROFILE_ICONS = ["fa-solid fa-circle-user", "fa-solid fa-user", "fa-solid fa-user-large"];

  function reviewProfileIcon(index) {
    return REVIEW_PROFILE_ICONS[index % REVIEW_PROFILE_ICONS.length];
  }

  function reviewSourceMeta(source) {
    const s = String(source || "TripAdvisor").toLowerCase();
    if (s.includes("booking")) {
      return { label: "Booking.com", icon: "fa-solid fa-bed", mod: "review-source--booking" };
    }
    if (s.includes("google")) {
      return { label: "Google", icon: "fa-brands fa-google", mod: "review-source--google" };
    }
    if (s.includes("facebook")) {
      return { label: "Facebook", icon: "fa-brands fa-facebook", mod: "review-source--facebook" };
    }
    return { label: "TripAdvisor", icon: "fa-brands fa-tripadvisor", mod: "review-source--tripadvisor" };
  }

  const ACC_LABELS = {
    typeLabels: {
      lodge: "Lodge",
      "tented-camp": "Tented camp",
      campsite: "Campsite",
      villa: "Villa",
      "bush-retreat": "Bush retreat",
    },
  };

  const WILDLIFE_HOME_SLUG_ALIASES = {
    "ngorongoro-crater": "ngorongoro-conservation-area",
  };

  function mergeWildlifeHomeDestinations(homeItems, catalog) {
    const bySlug = new Map((catalog || []).map((d) => [d.slug, d]));
    return (homeItems || []).map((item) => {
      const lookupSlug = WILDLIFE_HOME_SLUG_ALIASES[item.slug] || item.slug;
      const dest = bySlug.get(lookupSlug) || bySlug.get(item.slug);
      if (!dest) return item;
      return {
        ...item,
        slug: dest.slug || item.slug,
        name: dest.name || item.name,
        image: dest.heroImage || item.image,
      };
    });
  }

  function wrapScrollRevealSlot(html) {
    if (!html) return "";
    return `<div class="scroll-reveal-slot">${html}</div>`;
  }

  function renderDestRow(label, items, options = {}) {
    const wildlife = options.wildlife;
    const tiles = items
      .map((d, i) => {
        if (!window.EndemicUI?.renderHomeDestSpot) return "";
        return wrapScrollRevealSlot(window.EndemicUI.renderHomeDestSpot(d, asset, { wildlife, revealIndex: i }));
      })
      .join("");
    return `<div class="dest-row" data-dest-carousel>
      <div class="dest-row-head">
        <p class="dest-row-label">${escapeHtml(label)}</p>
        <div class="carousel-nav carousel-nav--pill" aria-label="${escapeHtml(label)} carousel">
          <button type="button" data-dest-carousel-prev aria-label="Previous"><span aria-hidden="true">‹</span></button>
          <button type="button" data-dest-carousel-next aria-label="Next"><span aria-hidden="true">›</span></button>
        </div>
      </div>
      <div class="dest-row-track dest-row-track--scroll reveal-stagger" data-dest-carousel-track data-reveal-stagger>${tiles}</div>
    </div>`;
  }

  function renderPackageCarousel(packages) {
    if (!window.EndemicUI?.renderIndividualPackageCard) return "";
    return packages
      .map((p, i) => wrapScrollRevealSlot(window.EndemicUI.renderIndividualPackageCard(p, asset, i)))
      .join("");
  }

  function renderPartners(partners) {
    if (!partners?.length) return "";
    const oneSet = partners
      .map(
        (p) =>
          `<div class="partners-flow__item" data-partners-item>
            <img src="${asset(p.logo)}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async" />
          </div>`
      )
      .join("");
    const trackHtml = oneSet + oneSet + oneSet;
    return `<div class="partners-flow" data-partners-flow data-partners-interval="2000" data-partners-count="${partners.length}" aria-label="Our partners">
      <div class="partners-flow__viewport">
        <div class="partners-flow__track">${trackHtml}</div>
      </div>
    </div>`;
  }

  function renderReviews(reviews) {
    const cards = reviews
      .map((r, i) => {
        const code = r.countryCode || r.country?.slice(0, 2)?.toUpperCase() || "TZ";
        const stars = "★".repeat(r.rating || 5);
        const meta = [r.tour, r.date].filter(Boolean).join(" · ");
        const flagSrc = reviewFlagUrl(code);
        const profileIcon = reviewProfileIcon(i);
        const src = reviewSourceMeta(r.source);
        return `<article class="review-card reveal-fade-up" data-reveal data-review-slide data-review-index="${i}">
          <div class="review-card-top">
            <span class="review-card-profile">
              <span class="review-card-avatar" aria-hidden="true"><i class="${profileIcon}"></i></span>
            </span>
            <span class="review-card-stars" aria-label="${r.rating || 5} out of 5">${stars}</span>
          </div>
          <blockquote class="review-card-quote">“${escapeHtml(r.text)}”</blockquote>
          <footer class="review-card-foot">
            <div class="review-card-foot-main">
              <img class="review-card-flag-img review-card-flag-img--foot" src="${flagSrc}" alt="" width="28" height="21" loading="lazy" decoding="async" />
              <div>
                <span class="review-card-name">${escapeHtml(r.name)}</span>
                <span class="review-card-meta">${escapeHtml(r.country)}${meta ? ` · ${escapeHtml(meta)}` : ""}</span>
              </div>
            </div>
            <span class="review-card-source ${src.mod}"><i class="${src.icon}" aria-hidden="true"></i> ${escapeHtml(src.label)}</span>
          </footer>
        </article>`;
      })
      .join("");

    return `<div class="reviews-shell-inner" data-reviews-stage>
      <div class="reviews-shell-bar">
        <span class="reviews-shell-brand" aria-hidden="true">
          <svg class="reviews-ta-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.12"/><path fill="currentColor" d="M12 4.5c-3.2 0-5.8 2.4-5.8 5.4 0 4.1 5.8 9.6 5.8 9.6s5.8-5.5 5.8-9.6c0-3-2.6-5.4-5.8-5.4zm0 7.4a2 2 0 110-4 2 2 0 010 4z"/></svg>
          Guest reviews · TripAdvisor, Booking &amp; more
        </span>
        <a class="reviews-shell-cta" href="https://www.tripadvisor.com/Search?q=Endemic+Birds+Tanzania" target="_blank" rel="noopener noreferrer">See all reviews</a>
      </div>
      <div class="reviews-carousel">
        <button type="button" class="reviews-nav reviews-nav--prev" data-reviews-prev aria-label="Previous reviews"><span aria-hidden="true">‹</span></button>
        <div class="reviews-track" data-reviews-track>${cards}</div>
        <button type="button" class="reviews-nav reviews-nav--next" data-reviews-next aria-label="Next reviews"><span aria-hidden="true">›</span></button>
      </div>
      <div class="reviews-shell-foot">
        <div class="reviews-dots" data-reviews-dots role="tablist" aria-label="Review pages"></div>
        <p class="reviews-counter" data-reviews-counter aria-live="polite"></p>
      </div>
    </div>`;
  }

  function renderQuoteBand(quote, mediaHost, quoteEl, citeEl) {
    if (!quote) return;
    if (mediaHost) {
      mediaHost.style.backgroundImage = `url('${asset(quote.image)}')`;
    }
    if (quoteEl) quoteEl.textContent = quote.quote;
    if (citeEl) citeEl.textContent = quote.cite;
  }

  Promise.all([
    fetch(asset("content/home.json")).then((r) => r.json()),
    fetch(asset("content/packages.json")).then((r) => r.json()),
    fetch(asset("content/wildlife-destinations.json"))
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => []),
    fetch(asset("content/accommodations.json"))
      .then((r) => (r.ok ? r.json() : { accommodations: [] }))
      .catch(() => ({ accommodations: [] })),
    fetch(asset("content/accommodation-galleries.json"))
      .then((r) => (r.ok ? r.json() : { galleries: {} }))
      .catch(() => ({ galleries: {} })),
  ])
    .then(([home, packages, wildlifeCatalog, accData, accGalleries]) => {
      window.__PACKAGE_WDEST_MAP__ = Object.fromEntries((wildlifeCatalog || []).map((d) => [d.slug, d]));
      const heroRoot = mount.querySelector("[data-hero-push]");
      renderHeroSlides(home.heroSlides || [], mount.querySelector("[data-hero-push-media]"), heroRoot);

      const whyHost = mount.querySelector("[data-home-why-split]");
      if (whyHost) whyHost.innerHTML = renderWhySplit(home.whySplit);

      const destHost = mount.querySelector("[data-home-dest-rows]");
      if (destHost) {
        const wildlifeHome = mergeWildlifeHomeDestinations(home.wildlifeDestinations, wildlifeCatalog);
        destHost.innerHTML =
          renderDestRow("Birding destinations", home.birdingDestinations || []) +
          renderDestRow("Wildlife destinations", wildlifeHome, { wildlife: true });
      }

      const featured = packages.filter((p) => p.featured);
      const birdingHost = mount.querySelector("[data-home-packages-birding]");
      const wildlifeHost = mount.querySelector("[data-home-packages-wildlife]");
      if (birdingHost) {
        const birding = featured.filter((p) => p.category === "birding" || p.category === "combined");
        birdingHost.innerHTML = renderPackageCarousel(birding.length ? birding : featured.slice(0, 6));
      }
      if (wildlifeHost) {
        const wildlife = featured.filter((p) => p.category === "wildlife");
        wildlifeHost.innerHTML = renderPackageCarousel(wildlife.length ? wildlife : packages.filter((p) => p.category === "wildlife").slice(0, 8));
      }

      const accHost = mount.querySelector("[data-home-accommodations]");
      if (accHost && window.EndemicUI?.renderAccommodationGrid) {
        const slugs = home.featuredAccommodations || [];
        const bySlug = new Map((accData.accommodations || []).filter((a) => a.verified).map((a) => [a.slug, a]));
        const featured = slugs.map((s) => bySlug.get(s)).filter(Boolean);
        const fallback = (accData.accommodations || []).filter((a) => a.verified).slice(0, 4);
        const list = featured.length ? featured : fallback;
        accHost.innerHTML = window.EndemicUI.renderAccommodationGrid(list, asset, ACC_LABELS, accGalleries.galleries || {});
      }

      renderQuoteBand(
        home.stickyQuote,
        mount.querySelector("[data-quote-media]"),
        mount.querySelector("[data-sticky-quote-text]"),
        mount.querySelector("[data-sticky-quote-cite]")
      );

      const partnersHost = mount.querySelector("[data-home-partners]");
      const partnersSection = document.querySelector("[data-home-partners-section]");
      fetch(asset("content/partners.json"))
        .then((r) => (r.ok ? r.json() : { commercial: { current: [] } }))
        .then((pdata) => {
          const verified = (pdata.commercial?.current || []).filter((p) => p.verified === true);
          const html = renderPartners(
            verified.map((p) => ({
              name: p.name,
              logo: p.logo,
            }))
          );
          if (partnersHost) partnersHost.innerHTML = html;
          if (partnersSection) partnersSection.hidden = !verified.length;
        })
        .catch(() => {
          if (partnersSection) partnersSection.hidden = true;
        });

      const reviewsHost = mount.querySelector("[data-home-reviews]");
      if (reviewsHost) reviewsHost.innerHTML = renderReviews(home.reviews || []);

      if (window.initHeroPush) window.initHeroPush();
      if (window.EndemicUI?.initCardMedia) window.EndemicUI.initCardMedia(mount);

      document.dispatchEvent(new CustomEvent("site:content-rendered"));
    })
    .catch(console.error);
})();
