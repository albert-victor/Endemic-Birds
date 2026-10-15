(function () {
  const categoryLabels = {
    birding: "Birding",
    wildlife: "Wildlife",
    combined: "Birding + Wildlife",
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cardMediaMarkup(imgSrc, alt = "", loading = "lazy") {
    const altAttr = alt ? ` alt="${escapeHtml(alt)}"` : ' alt=""';
    const loadAttr = loading === "eager" ? ' loading="eager" fetchpriority="low"' : ' loading="lazy"';
    return `<span class="card-media-spinner" aria-hidden="true"></span><img src="${imgSrc}"${altAttr}${loadAttr} decoding="async" />`;
  }

  function cardMediaWrap(classNames, imgSrc, alt = "", loading = "lazy") {
    return `<div class="${classNames} card-media-wrap">${cardMediaMarkup(imgSrc, alt, loading)}</div>`;
  }

  function promoteCarouselImages(scope) {
    scope.querySelectorAll(".dest-row-track--scroll img, .carousel-track img").forEach((img) => {
      if (img.loading !== "eager") img.loading = "eager";
    });
  }

  function bindCardMediaWrap(wrap) {
    if (wrap.dataset.mediaBound) return;
    wrap.dataset.mediaBound = "1";
    const img = wrap.querySelector("img");
    if (!img) return;

    const onLoad = () => {
      wrap.classList.add("is-loaded");
    };
    const onError = () => {
      const fallback = wrap.dataset.mediaFallback;
      if (fallback && !wrap.dataset.mediaRetried && window.EndemicMedia?.mediaUrl) {
        wrap.dataset.mediaRetried = "1";
        wrap.classList.remove("is-error");
        img.addEventListener("load", onLoad, { once: true });
        img.addEventListener(
          "error",
          () => {
            wrap.classList.add("is-error");
          },
          { once: true }
        );
        img.src = window.EndemicMedia.mediaUrl(fallback);
        return;
      }
      wrap.classList.add("is-error");
    };

    if (img.complete) {
      if (img.naturalWidth > 0) onLoad();
      else onError();
      return;
    }
    img.addEventListener("load", onLoad, { once: true });
    img.addEventListener("error", onError);
  }

  function initCardMedia(root) {
    const scope = root && root.querySelectorAll ? root : document;
    promoteCarouselImages(scope);
    scope.querySelectorAll(".card-media-wrap").forEach((wrap) => bindCardMediaWrap(wrap));
  }

  function packageVisitInsight(p) {
    const PV = window.PackageVisits;
    const wDestMap = window.__PACKAGE_WDEST_MAP__ || {};
    if (PV) {
      const visits = PV.resolvePackageVisits(p, { wDestMap, hubSites: {}, siteCatalog: [] });
      const line = PV.formatVisitLine(visits, 2);
      if (line) {
        const short = line.length > 42 ? `${line.slice(0, 39)}…` : line;
        return short;
      }
    }
    if (p.wildlifeDestinations?.length) {
      const labels = p.wildlifeDestinations.slice(0, 2).map((s) => PV?.slugToLabel(s) || s);
      return labels.join(" · ");
    }
    return "";
  }

  function packageTags(p) {
    const tags = [];
    tags.push(`${p.durationDays} days`);
    tags.push(categoryLabels[p.category] || p.category);
    const visitLine = packageVisitInsight(p);
    if (visitLine) tags.push(visitLine);
    if (p.featured) tags.push("Featured");
    if (p.category === "birding" && p.durationDays >= 18) tags.push("Flagship route");
    tags.push("Max 6 guests");
    return tags;
  }

  function renderTagLine(tags, max) {
    const list = tags.slice(0, max || tags.length);
    return list.map((t) => `<span class="card-tag">${escapeHtml(t)}</span>`).join("");
  }

  function journeyRating(p) {
    const label = p.featured ? "Guest favourite" : "Highly rated route";
    return `<div class="pkg-card-rating" aria-label="${label}">
      <span class="pkg-stars" aria-hidden="true">★★★★★</span>
      <span class="pkg-rating-note">${escapeHtml(label)}</span>
    </div>`;
  }

  function renderPrice() {
    return `<span class="pkg-card-price">On request</span>`;
  }

  function shortTitle(title) {
    return title.replace(/^\d+\s+Days?\s+/i, "").replace(/^\d+-Day\s+/i, "");
  }

  function destDisplayName(name) {
    return name.replace(/\s+Destination$/i, "").replace(/\s+Mountain$/i, " Mountains");
  }

  function circuitRegionTitle(name) {
    return String(name || "")
      .replace(/\s+Destination$/i, "")
      .trim();
  }

  function renderPackageBento(packages, asset, options = {}) {
    const list = packages.slice(0, 3);
    if (list.length < 3) return "";
    const [main, sideA, sideB] = list;
    const mainTags = packageTags(main).slice(0, 3);
    return `<div class="pkg-bento reveal" data-reveal>
      <a class="pkg-bento-main" href="${asset(`packages/${main.slug}/`)}">
        ${cardMediaWrap("pkg-bento-media", asset(main.heroImage))}
        <div class="pkg-bento-overlay"></div>
        <p class="pkg-bento-tags">${renderTagLine(mainTags)}</p>
        <div class="pkg-bento-cap">
          <div class="pkg-card-meta-row">${journeyRating(main)}${renderPrice()}</div>
          <h3 class="card-title-sans">${escapeHtml(shortTitle(main.title))}</h3>
          <p>${escapeHtml(main.summary)}</p>
        </div>
      </a>
      <a class="pkg-bento-side" href="${asset(`packages/${sideA.slug}/`)}">
        ${cardMediaWrap("pkg-bento-media", asset(sideA.heroImage))}
        <div class="pkg-bento-overlay"></div>
        <div class="pkg-bento-side-cap">
          <p class="pkg-bento-tags pkg-bento-tags--mini">${renderTagLine(packageTags(sideA), 2)}</p>
          <div class="pkg-card-meta-row pkg-card-meta-row--compact">${journeyRating(sideA)}${renderPrice()}</div>
          <h3 class="card-title-sans">${escapeHtml(shortTitle(sideA.title))}</h3>
        </div>
      </a>
      <a class="pkg-bento-side" href="${asset(`packages/${sideB.slug}/`)}">
        ${cardMediaWrap("pkg-bento-media", asset(sideB.heroImage))}
        <div class="pkg-bento-overlay"></div>
        <div class="pkg-bento-side-cap">
          <p class="pkg-bento-tags pkg-bento-tags--mini">${renderTagLine(packageTags(sideB), 2)}</p>
          <div class="pkg-card-meta-row pkg-card-meta-row--compact">${journeyRating(sideB)}${renderPrice()}</div>
          <h3 class="card-title-sans">${escapeHtml(shortTitle(sideB.title))}</h3>
        </div>
      </a>
    </div>`;
  }

  function renderDestScriptCard(d, asset, tourCount) {
    const types = (d.experienceTypes || [])
      .map((t) => (t === "birding" ? "Birding" : t === "wildlife" ? "Wildlife" : t))
      .join(" · ");
    const meta = tourCount ? `${tourCount} tour${tourCount > 1 ? "s" : ""}` : "Safari circuit";
    const title = circuitRegionTitle(d.name);
    const thumbPath = window.EndemicMedia?.resolveHero?.(d.slug, d.thumbnail || d.heroImage) || d.thumbnail || d.heroImage;
    return `<a class="dest-script-card reveal" data-reveal href="${asset(`destinations/${d.slug}/`)}">
      ${cardMediaWrap("dest-script-media", asset(thumbPath))}
      <div class="dest-script-overlay"></div>
      <p class="dest-script-meta">${escapeHtml(meta)}</p>
      <h3 class="card-title-sans">${escapeHtml(title)}</h3>
      <p class="dest-script-sub">${escapeHtml(types)}</p>
    </a>`;
  }

  function siteHeroSrc(site, asset) {
    const path = window.EndemicMedia?.resolveHero?.(site.slug, site.heroImage) || site.heroImage;
    return path ? asset(path) : "";
  }

  function renderCircuitSiteCard(site, asset, circuitLabel) {
    const href = asset(`destinations/${site.slug}/`);
    const heroSrc = siteHeroSrc(site, asset);
    const img = heroSrc ? cardMediaWrap("dest-script-media", heroSrc) : "";
    const noPhoto = heroSrc ? "" : " southern-site-card--no-photo";
    const status =
      site.imageStatus === "pending" ? `<p class="southern-site-card-note">Photos pending – enquire for current field images</p>` : "";
    const tourCount = (site.packageSlugs || []).length;
    const meta = tourCount ? `${tourCount} journey${tourCount > 1 ? "s" : ""}` : circuitLabel;
    return `<a class="dest-script-card southern-site-card${noPhoto} reveal" data-reveal href="${href}">
      ${img}
      <div class="dest-script-overlay"></div>
      <p class="dest-script-meta">${escapeHtml(meta)}</p>
      <h3 class="card-title-sans">${escapeHtml(site.name)}</h3>
      <p class="dest-script-sub">${escapeHtml(site.summary.slice(0, 72))}…</p>
      ${status}
    </a>`;
  }

  function renderCircuitSiteGrid(sites, asset, circuitLabel) {
    return `<div class="alt-card-grid alt-card-grid--dest-spot reveal-stagger" data-reveal-stagger>${sites
      .map((s) => renderBirdingSiteSpot(s, asset, circuitLabel))
      .join("")}</div>`;
  }

  /** @deprecated use renderCircuitSiteGrid */
  function renderSouthernSiteGrid(sites, asset) {
    return renderCircuitSiteGrid(sites, asset, "Southern circuit");
  }

  function renderDestScriptGrid(destinations, packages, asset) {
    const counts = {};
    packages.forEach((p) => {
      (p.destinations || []).forEach((id) => {
        counts[id] = (counts[id] || 0) + 1;
      });
    });
    return `<div class="dest-script-grid reveal-stagger" data-reveal-stagger>${destinations
      .map((d) => renderDestScriptCard(d, asset, counts[d.id] || 0))
      .join("")}</div>`;
  }

  function renderWildlifeDestCard(d, asset) {
    return renderWildlifeDestSpot(d, asset);
  }

  function renderWildlifeDestGrid(destinations, asset) {
    return `<div class="alt-card-grid alt-card-grid--dest-spot reveal-stagger" data-reveal-stagger>${destinations
      .map((d) => renderWildlifeDestSpot(d, asset))
      .join("")}</div>`;
  }

  function renderWildlifeActivitySpot(a, asset) {
    return renderIndividualDestSpot({
      href: asset(`wildlife/activities/${a.slug}/`),
      imgSrc: asset(a.heroImage),
      title: a.name,
      subtitle: "Wildlife experience",
      tag: "Safari",
    });
  }

  function renderWildlifeActivityCard(a, asset) {
    return renderWildlifeActivitySpot(a, asset);
  }

  function renderDestExploreCard(d, asset, options = {}) {
    if (options.wildlife) return renderWildlifeDestSpot(d, asset);
    const thumbPath = window.EndemicMedia?.resolveHero?.(d.slug, d.thumbnail || d.heroImage) || d.thumbnail || d.heroImage;
    return renderIndividualDestSpot({
      href: asset(`destinations/${d.slug}/`),
      imgSrc: asset(thumbPath),
      title: destDisplayName(d.name),
      subtitle: d.circuit ? `${d.circuit} circuit` : "Tanzania",
      tag: (d.experienceTypes || []).includes("wildlife") ? "Safari" : "Birding",
    });
  }

  function renderDestExploreGrid(items, asset, options = {}) {
    if (!items?.length) return "";
    return `<div class="alt-card-grid alt-card-grid--dest-spot reveal-stagger" data-reveal-stagger>${items
      .map((d) => renderDestExploreCard(d, asset, options))
      .join("")}</div>`;
  }

  function renderWildlifeActivityGrid(activities, asset) {
    return `<div class="alt-card-grid alt-card-grid--dest-spot reveal-stagger" data-reveal-stagger>${activities
      .map((a) => renderWildlifeActivitySpot(a, asset))
      .join("")}</div>`;
  }

  function renderWildlifeThemeRecommendCard(a, asset) {
    const href = asset(`wildlife/activities/${a.slug}/`);
    const imgPath = a.heroImage;
    const imgSrc =
      (window.EndemicMedia?.mediaUrl && imgPath && window.EndemicMedia.mediaUrl(imgPath)) || asset(imgPath || "");
    const summary = String(a.summary || a.overview || "").trim();
    const blurb = summary.length > 140 ? `${summary.slice(0, 137)}…` : summary;
    return `<a class="theme-rec-card reveal" data-reveal href="${href}">
      <div class="theme-rec-card__media card-media-wrap">${cardMediaMarkup(imgSrc)}<span class="theme-rec-card__noise" aria-hidden="true"></span></div>
      <div class="theme-rec-card__body">
        <p class="theme-rec-card__eyebrow">Recommended safari theme</p>
        <h3 class="theme-rec-card__title">${escapeHtml(a.name)}</h3>
        ${blurb ? `<p class="theme-rec-card__summary">${escapeHtml(blurb)}</p>` : ""}
        <span class="theme-rec-card__cta">Explore this theme <span aria-hidden="true">→</span></span>
      </div>
    </a>`;
  }

  function renderWildlifeThemeGrid(activities, asset) {
    if (!activities?.length) return "";
    return `<div class="theme-rec-grid reveal-stagger" data-reveal-stagger>${activities
      .map((a) => renderWildlifeThemeRecommendCard(a, asset))
      .join("")}</div>`;
  }

  function isWildlifePhotoPath(path) {
    return String(path || "").includes("assets/images/wildlife/");
  }

  function homeDestSpotImageSrc(item, slug, wildlife, asset) {
    const path = item.image;
    if (!path) return asset("");
    if (wildlife || isWildlifePhotoPath(path)) {
      return (window.EndemicMedia?.mediaUrl && window.EndemicMedia.mediaUrl(path)) || asset(path);
    }
    const imagePath = window.EndemicMedia?.resolveHero?.(slug, path) || path;
    return (window.EndemicMedia?.mediaUrl && window.EndemicMedia.mediaUrl(imagePath)) || asset(imagePath);
  }

  function renderHomeDestSpot(item, asset, options = {}) {
    const wildlife = options.wildlife;
    const slug = item.slug;
    const href = wildlife ? asset(`wildlife/destinations/${slug}/`) : asset(`destinations/${slug}/`);
    const imgSrc = homeDestSpotImageSrc(item, slug, wildlife, asset);
    return renderIndividualDestSpot({
      href,
      imgSrc,
      mediaFallback: item.image || slug,
      title: item.name,
      subtitle: options.subtitle || (wildlife ? "Wildlife Tanzania" : "Birding Tanzania"),
      tag: wildlife ? "Safari" : "Birding",
      imgLoading: "eager",
    });
  }

  function packageHeroSrc(p, asset) {
    if (window.EndemicMedia?.mediaUrl) return window.EndemicMedia.mediaUrl(p.heroImage || p.slug);
    const path = window.EndemicMedia?.resolveHero?.(p.slug, p.heroImage) || p.heroImage;
    return asset(path);
  }

  function renderPackageCorpCard(p, asset, index = 0) {
    const tags = packageTags(p);
    const mod =
      (p.featured ? " pkg-corp-card--featured" : "") + (index % 4 === 2 ? " pkg-corp-card--tall" : "");
    return `<a class="pkg-corp-card reveal${mod}" data-reveal href="${asset(`packages/${p.slug}/`)}">
      <div class="pkg-corp-media card-media-wrap">
        ${cardMediaMarkup(packageHeroSrc(p, asset))}
        <div class="pkg-corp-media-shine" aria-hidden="true"></div>
        <div class="pkg-corp-media-grade" aria-hidden="true"></div>
        <p class="pkg-corp-tags">${renderTagLine(tags, 4)}</p>
      </div>
      <div class="pkg-corp-body">
        <div class="pkg-card-meta-row pkg-card-meta-row--compact">${journeyRating(p)}${renderPrice()}</div>
        <h3 class="card-title-sans pkg-corp-title">${escapeHtml(shortTitle(p.title))}</h3>
        <p class="pkg-corp-summary">${escapeHtml(p.summary)}</p>
        <span class="pkg-corp-cta">View itinerary <span aria-hidden="true">→</span></span>
      </div>
    </a>`;
  }

  function renderPackageCorpGrid(packages, asset) {
    return renderIndividualPackageGrid(packages, asset);
  }

  function renderPackageSideCard(p, asset) {
    return renderPackageCorpCard(p, asset, 0);
  }

  function destTypesLine(d) {
    return (d.experienceTypes || [])
      .map((t) => (t === "birding" ? "Birding" : t === "wildlife" ? "Wildlife" : t))
      .join(" · ");
  }

  function renderCardV1({ href, imgSrc, kickerHtml, title, ctaLabel, mark, markVariant }) {
    const markClass = markVariant ? ` card-v1__mark--${markVariant}` : "";
    const markHtml = mark ? `<span class="card-v1__mark${markClass}">${escapeHtml(mark)}</span>` : "";
    return `<a class="card-v1" href="${href}">
      <div class="card-v1__media card-media-wrap">${markHtml}${cardMediaMarkup(imgSrc)}</div>
      <div class="card-v1__body">
        <p class="card-v1__kicker">${kickerHtml}</p>
        <h3 class="card-v1__title">${escapeHtml(title)}</h3>
        <span class="card-v1__cta">${escapeHtml(ctaLabel)} <span aria-hidden="true">→</span></span>
      </div>
    </a>`;
  }

  /** GROUP · Registry – circuit hub cards only */
  function renderGroupCircuitCard(d, asset, tourCount) {
    const href = asset(`destinations/${d.slug}/`);
    const tours = tourCount ? `${tourCount} tour${tourCount > 1 ? "s" : ""}` : "";
    const circuit = d.circuit || "Circuit";
    const types = destTypesLine(d);
    const kicker = `<em>${escapeHtml(circuit)}</em>${tours ? ` · ${escapeHtml(tours)}` : ""}${types ? ` · ${escapeHtml(types)}` : ""}`;
    const thumbPath = window.EndemicMedia?.resolveHero?.(d.slug, d.thumbnail || d.heroImage) || d.thumbnail || d.heroImage;
    return renderCardV1({
      href,
      imgSrc: asset(thumbPath),
      kickerHtml: kicker,
      title: destDisplayName(d.name),
      ctaLabel: "Explore destination",
      mark: "",
      markVariant: "",
    });
  }

  function renderGroupCircuitGrid(destinations, packages, asset) {
    const counts = {};
    packages.forEach((p) => {
      (p.destinations || []).forEach((id) => {
        counts[id] = (counts[id] || 0) + 1;
      });
    });
    return `<div class="alt-card-grid">${destinations
      .map((d) => renderGroupCircuitCard(d, asset, counts[d.id] || 0))
      .join("")}</div>`;
  }

  /** GROUP · Registry – full package catalog grids (birding / wildlife / combined hubs) */
  function renderGroupPackageCard(p, asset) {
    const cat = categoryLabels[p.category] || "Safari";
    const visitHint = packageVisitInsight(p);
    const kicker = `<em>${escapeHtml(cat)}</em> · ${p.durationDays} days${visitHint ? ` · ${escapeHtml(visitHint)}` : ""}`;
    return renderCardV1({
      href: asset(`packages/${p.slug}/`),
      imgSrc: packageHeroSrc(p, asset),
      kickerHtml: kicker,
      title: shortTitle(p.title),
      ctaLabel: "View itinerary",
      mark: "",
      markVariant: "",
    });
  }

  function renderGroupPackageGrid(packages, asset) {
    return `<div class="alt-card-grid">${packages.map((p) => renderGroupPackageCard(p, asset)).join("")}</div>`;
  }

  const SPOT_LIKE_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5l-1.1-1C5.14 13.24 2 10.28 2 6.75 2 4.13 4.13 2 6.75 2c1.57 0 3.07.74 4.01 1.92L12 5.5l1.24-1.58C14.18 2.74 15.68 2 17.25 2 19.87 2 22 4.13 22 6.75c0 3.53-3.14 6.49-8.9 12.75L12 20.5z"/></svg>`;

  function renderIndividualDestSpot({ href, imgSrc, title, subtitle, tag, imgLoading = "eager", mediaFallback = "" }) {
    const fallbackAttr = mediaFallback ? ` data-media-fallback="${escapeHtml(mediaFallback)}"` : "";
    return `<a class="dest-ind-spot" href="${href}">
      <div class="dest-ind-spot__img card-media-wrap"${fallbackAttr}>${cardMediaMarkup(imgSrc, "", imgLoading)}<span class="dest-ind-spot__noise" aria-hidden="true"></span></div>
      <div class="dest-ind-spot__shade" aria-hidden="true"></div>
      <span class="dest-ind-spot__tag">${escapeHtml(tag)}</span>
      <span class="dest-ind-spot__like" aria-hidden="true">${SPOT_LIKE_SVG}</span>
      <div class="dest-ind-spot__cap">
        <span class="dest-ind-spot__stars" aria-label="Highly rated">★★★★★</span>
        <p class="dest-ind-spot__script">${escapeHtml(subtitle)}</p>
        <h3 class="dest-ind-spot__title">${escapeHtml(title)}</h3>
        <span class="dest-ind-spot__cta">Explore destination <span aria-hidden="true">→</span></span>
      </div>
    </a>`;
  }

  function birdingSiteSpotSubtitle(site) {
    if (site.location) {
      const line = String(site.location).split("·")[0].trim();
      return line.length > 58 ? `${line.slice(0, 55)}…` : line;
    }
    return "Birding in Tanzania";
  }

  function renderBirdingSiteSpot(site, asset, circuitLabel) {
    const href = asset(`destinations/${site.slug}/`);
    const hero = window.EndemicMedia?.resolveHero?.(site.slug, site.heroImage) || site.heroImage;
    return renderIndividualDestSpot({
      href,
      imgSrc: asset(hero),
      title: site.name,
      subtitle: circuitLabel || birdingSiteSpotSubtitle(site),
      tag: "Birding",
    });
  }

  /** All individual birding parks/reserves – explore-style cards (no circuit hubs). */
  function renderBirdingDestinationsGrid(sites, asset) {
    if (!sites?.length) return "";
    return `<div class="alt-card-grid alt-card-grid--dest-spot reveal-stagger" data-reveal-stagger>${sites
      .map((s) => renderBirdingSiteSpot(s, asset))
      .join("")}</div>`;
  }

  function renderWildlifeDestSpot(d, asset) {
    return renderIndividualDestSpot({
      href: asset(`wildlife/destinations/${d.slug}/`),
      imgSrc: asset(d.heroImage),
      title: d.name,
      subtitle: d.circuit ? `${d.circuit} circuit` : "Wildlife Tanzania",
      tag: "Safari",
    });
  }

  function renderIndividualDestSpotGrid(birdingItems, wildlifeDests, asset) {
    const birdingHtml = birdingItems
      .map((item) => renderBirdingSiteSpot(item.data, asset, item.circuit))
      .join("");
    const wildHtml = wildlifeDests.map((d) => renderWildlifeDestSpot(d, asset)).join("");
    return `<div class="alt-card-grid alt-card-grid--dest-spot">${birdingHtml}${wildHtml}</div>`;
  }

  function renderIndividualDestC({ href, imgSrc, scriptLine, metaLine, title }) {
    return `<a class="dest-ind-c" href="${href}">
      <div class="dest-ind-c__media card-media-wrap">${cardMediaMarkup(imgSrc)}</div>
      <div class="dest-ind-c__body">
        <p class="dest-ind-c__line"><em>${escapeHtml(scriptLine)}</em>${metaLine ? ` · ${escapeHtml(metaLine)}` : ""}</p>
        <h3 class="dest-ind-c__title">${escapeHtml(title)}</h3>
        <span class="dest-ind-c__cta">Explore <span aria-hidden="true">→</span></span>
      </div>
    </a>`;
  }

  function renderIndividualDestB({ href, imgSrc, label, title }) {
    return `<a class="dest-ind-b" href="${href}">
      <div class="dest-ind-b__visual card-media-wrap">${cardMediaMarkup(imgSrc)}</div>
      <div class="dest-ind-b__plate">
        <p class="dest-ind-b__label">${escapeHtml(label)}</p>
        <h3 class="dest-ind-b__title">${escapeHtml(title)}</h3>
        <span class="dest-ind-b__go">View <span aria-hidden="true">→</span></span>
      </div>
    </a>`;
  }

  function renderBirdingSiteIndC(site, asset, circuitLabel) {
    const href = asset(`destinations/${site.slug}/`);
    const hero = window.EndemicMedia?.resolveHero?.(site.slug, site.heroImage) || site.heroImage;
    const journeys = (site.packageSlugs || []).length;
    return renderIndividualDestC({
      href,
      imgSrc: asset(hero),
      scriptLine: circuitLabel || "Birding",
      metaLine: journeys ? `${journeys} journeys` : "Birding site",
      title: site.name,
    });
  }

  function renderBirdingSiteIndB(site, asset, circuitLabel) {
    const href = asset(`destinations/${site.slug}/`);
    const hero = window.EndemicMedia?.resolveHero?.(site.slug, site.heroImage) || site.heroImage;
    return renderIndividualDestB({
      href,
      imgSrc: asset(hero),
      label: circuitLabel || "Birding site",
      title: site.name,
    });
  }

  function renderWildlifeDestIndC(d, asset) {
    const safaris = (d.packageSlugs || []).length;
    return renderIndividualDestC({
      href: asset(`wildlife/destinations/${d.slug}/`),
      imgSrc: asset(d.heroImage),
      scriptLine: d.circuit || "Wildlife",
      metaLine: safaris ? `${safaris} safaris` : "National park",
      title: d.name,
    });
  }

  function renderWildlifeDestIndB(d, asset) {
    return renderIndividualDestB({
      href: asset(`wildlife/destinations/${d.slug}/`),
      imgSrc: asset(d.heroImage),
      label: "Wildlife park",
      title: d.name,
    });
  }

  function renderIndividualDestCGrid(items, asset) {
    return `<div class="alt-card-grid alt-card-grid--dest-ind">${items
      .map((item) => item.renderC(item.data, asset, item.circuit))
      .join("")}</div>`;
  }

  function renderIndividualDestBGrid(items, asset) {
    return `<div class="alt-card-grid alt-card-grid--dest-ind">${items
      .map((item) => item.renderB(item.data, asset, item.circuit))
      .join("")}</div>`;
  }

  function packageServiceTag(p) {
    if (p.category === "wildlife") return "Safari";
    if (p.category === "combined") return "Birding & Safari";
    return "Birding";
  }

  function packageDetailLine(p) {
    const s = String(p.summary || "").trim();
    if (!s) return "Specialist-led journey – enquire for routing and dates.";
    if (s.length <= 100) return s;
    return `${s.slice(0, 97).trim()}…`;
  }

  function renderIndividualPackageCard(p, asset) {
    const service = packageServiceTag(p);
    const meta = `${p.durationDays} days`;
    const ratingLabel = p.featured ? "Guest favourite" : "Highly rated";
    const insightTags = packageTags(p).filter((t) => t !== "Featured").slice(0, 4);
    const insightsHtml = insightTags.length
      ? `<div class="pkg-ind-sheet__insights">${insightTags
          .map((t) => `<span class="pkg-ind-sheet__insight">${escapeHtml(t)}</span>`)
          .join("")}</div>`
      : "";
    return `<a class="pkg-ind-sheet" href="${asset(`packages/${p.slug}/`)}">
      <div class="pkg-ind-sheet__frame card-media-wrap" data-media-fallback="${escapeHtml(p.slug || p.heroImage || "")}">
        ${cardMediaMarkup(packageHeroSrc(p, asset), "", "eager")}
        <span class="pkg-ind-sheet__warm-scrim" aria-hidden="true"></span>
        ${insightsHtml}
        <span class="pkg-ind-sheet__ornament" aria-hidden="true"></span>
        <span class="pkg-ind-sheet__like" aria-hidden="true">${SPOT_LIKE_SVG}</span>
      </div>
      <div class="pkg-ind-sheet__body">
        <span class="pkg-ind-sheet__service">${escapeHtml(service)}</span>
        <div class="pkg-ind-sheet__meta">
          <span>${escapeHtml(meta)}</span>
          <span class="pkg-ind-sheet__stars" aria-label="${escapeHtml(ratingLabel)}">★★★★★</span>
        </div>
        <h3 class="pkg-ind-sheet__title">${escapeHtml(shortTitle(p.title))}</h3>
        <p class="pkg-ind-sheet__detail">${escapeHtml(packageDetailLine(p))}</p>
        <span class="pkg-ind-sheet__cta">View itinerary <span aria-hidden="true">→</span></span>
      </div>
    </a>`;
  }

  function renderIndividualPackageGrid(packages, asset) {
    if (!packages.length) return "";
    return `<div class="alt-card-grid alt-card-grid--pkg-ind reveal-stagger" data-reveal-stagger>${packages
      .map((p) => renderIndividualPackageCard(p, asset))
      .join("")}</div>`;
  }

  /** @deprecated use renderGroupCircuitCard */
  function renderCircuitDestV1Grid(destinations, packages, asset) {
    return renderGroupCircuitGrid(destinations, packages, asset);
  }

  /** @deprecated use renderGroupPackageCard */
  function renderPackageAltA(p, asset) {
    return renderGroupPackageCard(p, asset);
  }

  function renderPackageAltGrid(packages, asset) {
    return renderGroupPackageGrid(packages, asset);
  }

  window.EndemicUI = {
    renderPackageBento,
    renderPackageCorpCard,
    renderPackageCorpGrid,
    renderDestScriptCard,
    renderDestScriptGrid,
    renderCircuitSiteCard,
    renderCircuitSiteGrid,
    renderSouthernSiteGrid,
    renderPackageSideCard,
    renderWildlifeDestCard,
    renderWildlifeDestGrid,
    renderWildlifeActivityCard,
    renderWildlifeActivityGrid,
    renderWildlifeThemeRecommendCard,
    renderWildlifeThemeGrid,
    renderDestExploreCard,
    renderDestExploreGrid,
    packageTags,
    renderCardV1,
    renderGroupCircuitCard,
    renderGroupCircuitGrid,
    renderGroupPackageCard,
    renderGroupPackageGrid,
    renderIndividualDestSpot,
    renderBirdingSiteSpot,
    renderBirdingDestinationsGrid,
    birdingSiteSpotSubtitle,
    renderWildlifeDestSpot,
    renderIndividualDestSpotGrid,
    renderIndividualDestC,
    renderIndividualDestB,
    renderBirdingSiteIndC,
    renderBirdingSiteIndB,
    renderWildlifeDestIndC,
    renderWildlifeDestIndB,
    renderIndividualDestCGrid,
    renderIndividualDestBGrid,
    renderIndividualPackageCard,
    renderIndividualPackageGrid,
    renderHomeDestSpot,
    renderCircuitDestV1Grid,
    renderPackageAltA,
    renderPackageAltGrid,
    initCardMedia,
  };

  function bootCardMedia() {
    initCardMedia(document);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootCardMedia);
  } else {
    bootCardMedia();
  }

  document.addEventListener("site:content-rendered", bootCardMedia);
  document.addEventListener("endemic:media-ready", bootCardMedia);
})();
