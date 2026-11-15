(function () {
  const mount = document.querySelector("[data-bird-of-day]");
  if (!mount) return;

  const prefix = window.__ASSET_PREFIX__ || "/";
  const asset = (p) => prefix + String(p).replace(/^\//, "");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FALLBACK_SLIDE_IMG = "assets/images/from-live-site/destinations/eastern-arc-mountain.jpg";

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function dayOfYear(d) {
    const start = new Date(Date.UTC(d.getFullYear(), 0, 0));
    return Math.floor((d - start) / 86400000);
  }

  function pickDailySlug(config, species) {
    const pool = config.speciesSlugs || [];
    if (!pool.length) return species[0]?.slug;
    return pool[dayOfYear(new Date()) % pool.length];
  }

  function titleFromSlug(slug) {
    return String(slug).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function buildDetailHtml(sp, labels, { isDaily = false } = {}) {
    const cat = labels[sp.category] || sp.category;
    const destPills = (sp.destinationSlugs || [])
      .slice(0, 3)
      .map((s) => `<a class="birds-showcase__pill" href="${asset(`destinations/${s}/`)}">${escapeHtml(titleFromSlug(s))}</a>`)
      .join("");
    const pkgPills = (sp.packageSlugs || [])
      .slice(0, 2)
      .map((s) => `<a class="birds-showcase__pill" href="${asset(`packages/${s}/`)}">${escapeHtml(titleFromSlug(s))}</a>`)
      .join("");

    return `
      <div class="birds-showcase__detail-card birds-showcase__detail-card--compact${isDaily ? " birds-showcase__detail-card--daily" : ""}">
        <button type="button" class="birds-showcase__detail-close" data-showcase-detail-close aria-label="Close details">
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
        ${isDaily ? `<p class="birds-showcase__detail-ribbon"><i class="fa-solid fa-sun" aria-hidden="true"></i> Bird of the day</p>` : ""}
        <p class="birds-showcase__detail-cat">${escapeHtml(cat)}</p>
        <h3 id="birds-showcase-detail-title">${escapeHtml(sp.commonName)}</h3>
        <p class="birds-showcase__detail-sci"><em>${escapeHtml(sp.scientificName)}</em></p>
        ${sp.whyItMatters ? `<p class="birds-showcase__detail-lead">${escapeHtml(sp.whyItMatters)}</p>` : ""}
        <dl class="birds-showcase__detail-facts birds-showcase__detail-facts--compact">
          <div><dt>Habitat</dt><dd>${escapeHtml(sp.habitatDistribution || sp.habitatRegion || "")}</dd></div>
          <div><dt>Viewing</dt><dd>${escapeHtml(sp.viewingContext || "Enquire for realistic timing on your route.")}</dd></div>
        </dl>
        ${destPills ? `<div class="birds-showcase__pills birds-showcase__pills--compact">${destPills}</div>` : ""}
        ${pkgPills ? `<div class="birds-showcase__pills birds-showcase__pills--compact">${pkgPills}</div>` : ""}
        <a class="btn btn-solid btn-sm birds-showcase__enquire" href="${asset(`plan-your-trip/index.html?note=${encodeURIComponent(`Interested in ${sp.commonName} on a Tanzania birding safari.`)}`)}">Enquire</a>
      </div>`;
  }

  Promise.all([
    fetch(asset("content/bird-of-day.json")).then((r) => r.json()),
    fetch(asset("content/special-birds.json")).then((r) => r.json()),
  ])
    .then(([botd, birdsData]) => {
      const labels = birdsData.categoryLabels || {};
      const allSpecies = birdsData.species || [];
      if (!allSpecies.length) return;

      const bySlug = Object.fromEntries(allSpecies.map((s) => [s.slug, s]));
      const carouselSlugs = botd.speciesSlugs?.length ? botd.speciesSlugs : allSpecies.map((s) => s.slug);
      const carouselSpecies = carouselSlugs.map((slug) => bySlug[slug]).filter(Boolean);
      if (!carouselSpecies.length) return;

      const dailySlug = pickDailySlug(botd, allSpecies);
      const dailySp = bySlug[dailySlug] || carouselSpecies[0];

      const slidesHtml = carouselSpecies
        .map((sp, i) => {
          const im = sp.images?.[0];
          const imgSrc = im ? asset(im.src) : "";
          const cat = labels[sp.category] || sp.category;
          const isDailySlide = sp.slug === dailySlug;
          return `<article class="birds-showcase__slide${i === 0 ? " is-active" : ""}${isDailySlide ? " birds-showcase__slide--matches-daily" : ""}" data-slide-index="${i}" data-species-slug="${escapeHtml(sp.slug)}" aria-hidden="${i === 0 ? "false" : "true"}">
            <div class="birds-showcase__slide-bg">
              ${imgSrc ? `<img src="${imgSrc}" alt="${escapeHtml(im.alt || sp.commonName)}" loading="${i < 2 ? "eager" : "lazy"}" decoding="async" data-showcase-slide-img />` : ""}
            </div>
            <div class="birds-showcase__slide-scrim" aria-hidden="true"></div>
            <div class="birds-showcase__slide-caption">
              <p class="birds-showcase__slide-cat">${escapeHtml(cat)}</p>
              <h3 class="birds-showcase__slide-title">${escapeHtml(sp.commonName)}</h3>
              <p class="birds-showcase__slide-sci"><em>${escapeHtml(sp.scientificName)}</em></p>
              <p class="birds-showcase__slide-tease">${escapeHtml(sp.whyItMatters || "")}</p>
              <button type="button" class="birds-showcase__info" data-showcase-info="${escapeHtml(sp.slug)}" aria-label="Details for ${escapeHtml(sp.commonName)}">
                <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
              </button>
            </div>
          </article>`;
        })
        .join("");

      const dotsHtml = carouselSpecies.map((_, i) => `<button type="button" class="birds-showcase__dot${i === 0 ? " is-active" : ""}" data-goto-slide="${i}" aria-label="Slide ${i + 1}"></button>`).join("");

      const dailyImgs = dailySp.images?.length ? dailySp.images : [];
      const dailyCat = labels[dailySp.category] || dailySp.category;
      const dailyMediaSlides = dailyImgs
        .map(
          (im, i) =>
            `<img class="birds-showcase__daily-slide${i === 0 ? " is-active" : ""}" src="${asset(im.src)}" alt="${escapeHtml(im.alt || dailySp.commonName)}" loading="${i === 0 ? "eager" : "lazy"}" decoding="async" data-showcase-daily-img data-daily-slide="${i}" />`
        )
        .join("");
      const dailyMediaDots =
        dailyImgs.length > 1
          ? `<div class="birds-showcase__daily-dots" role="tablist" aria-label="Daily species photos">${dailyImgs
              .map(
                (_, i) =>
                  `<button type="button" class="birds-showcase__daily-dot${i === 0 ? " is-active" : ""}" data-daily-goto="${i}" aria-label="Photo ${i + 1}"></button>`
              )
              .join("")}</div>`
          : "";

      const head = mount.closest("section")?.querySelector(".birds-showcase-head");
      if (head) {
        const eyebrow = head.querySelector(".eyebrow");
        const lead = head.querySelector(".section-lead");
        if (eyebrow && botd.sectionTitle) eyebrow.textContent = botd.sectionTitle;
        if (lead && botd.sectionLead) {
          lead.innerHTML = `${escapeHtml(botd.sectionLead)} <a class="section-lead-link" href="${asset("birding/special-birds/index.html")}">full catalogue</a>.`;
        }
      }

      mount.innerHTML = `<div class="birds-showcase is-visible" data-birds-showcase>
        <div class="birds-showcase__viewport">
          <div class="birds-showcase__stage container">
            <div class="birds-showcase__carousel" data-showcase-carousel aria-roledescription="carousel" aria-label="Special birds slideshow">
              <div class="birds-showcase__track" data-showcase-track>${slidesHtml}</div>
              <div class="birds-showcase__controls">
                <button type="button" class="birds-showcase__arrow" data-showcase-prev aria-label="Previous bird"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>
                <div class="birds-showcase__dots" role="tablist" aria-label="Choose species">${dotsHtml}</div>
                <button type="button" class="birds-showcase__arrow" data-showcase-next aria-label="Next bird"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>
              </div>
            </div>

            <aside class="birds-showcase__daily" data-showcase-daily aria-label="Bird of the day">
              <div class="birds-showcase__daily-glow" aria-hidden="true"></div>
              <p class="birds-showcase__daily-badge"><i class="fa-solid fa-sun" aria-hidden="true"></i> Bird of the day</p>
              ${
                dailyMediaSlides
                  ? `<figure class="birds-showcase__daily-media" data-daily-media>
                <div class="birds-showcase__daily-track">${dailyMediaSlides}</div>
                ${dailyMediaDots}
              </figure>`
                  : ""
              }
              <div class="birds-showcase__daily-body">
                <p class="birds-showcase__daily-cat">${escapeHtml(dailyCat)}</p>
                <p class="birds-showcase__daily-name">${escapeHtml(dailySp.commonName)}</p>
                <p class="birds-showcase__daily-sci"><em>${escapeHtml(dailySp.scientificName)}</em></p>
                ${dailySp.whyItMatters ? `<p class="birds-showcase__daily-tease">${escapeHtml(dailySp.whyItMatters)}</p>` : ""}
              </div>
              <button type="button" class="birds-showcase__info birds-showcase__info--daily" data-showcase-info="${escapeHtml(dailySp.slug)}" data-daily="1" aria-label="Bird of the day details for ${escapeHtml(dailySp.commonName)}">
                <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
              </button>
            </aside>
          </div>

          <div class="birds-showcase__detail" data-showcase-detail hidden aria-hidden="true" aria-labelledby="birds-showcase-detail-title"></div>
        </div>
      </div>`;

      mount.closest("section")?.classList.add("is-visible");

      const root = mount.querySelector("[data-birds-showcase]");
      const fallbackSrc = asset(FALLBACK_SLIDE_IMG);
      root.querySelectorAll("[data-showcase-slide-img], [data-showcase-daily-img]").forEach((img) => {
        img.addEventListener("error", () => {
          if (img.dataset.fallbackApplied) return;
          img.dataset.fallbackApplied = "1";
          img.src = fallbackSrc;
          img.closest(".birds-showcase__slide")?.classList.add("is-fallback-img");
        });
      });
      const slides = [...root.querySelectorAll(".birds-showcase__slide")];
      const detail = root.querySelector("[data-showcase-detail]");
      let index = 0;
      let timer = null;
      let imageTimers = new Map();
      let dailyImgTimer = null;
      let dailyImgIndex = 0;

      function goTo(i) {
        index = (i + slides.length) % slides.length;
        slides.forEach((s, j) => {
          const on = j === index;
          s.classList.toggle("is-active", on);
          s.setAttribute("aria-hidden", on ? "false" : "true");
        });
        root.querySelectorAll(".birds-showcase__dot").forEach((d, j) => {
          d.classList.toggle("is-active", j === index);
          d.setAttribute("aria-selected", j === index ? "true" : "false");
        });
        const activeSlug = slides[index]?.dataset.speciesSlug;
        root.querySelector(".birds-showcase__daily")?.classList.toggle("birds-showcase__daily--synced", activeSlug === dailySlug);
      }

      function openDetail(slug, isDaily) {
        const sp = bySlug[slug];
        if (!sp || !detail) return;
        detail.innerHTML = buildDetailHtml(sp, labels, { isDaily });
        detail.hidden = false;
        detail.setAttribute("aria-hidden", "false");
        root.classList.add("birds-showcase--detail-open");
        pauseAutoplay();
        detail.querySelector("[data-showcase-detail-close]")?.focus();
      }

      function setDailyPhoto(i) {
        const media = root.querySelector("[data-daily-media]");
        if (!media) return;
        const frames = [...media.querySelectorAll("[data-daily-slide]")];
        const dots = [...media.querySelectorAll("[data-daily-goto]")];
        if (!frames.length) return;
        dailyImgIndex = (i + frames.length) % frames.length;
        frames.forEach((f, j) => f.classList.toggle("is-active", j === dailyImgIndex));
        dots.forEach((d, j) => d.classList.toggle("is-active", j === dailyImgIndex));
      }

      function startDailyPhotoSlideshow() {
        const media = root.querySelector("[data-daily-media]");
        const frames = media ? [...media.querySelectorAll("[data-daily-slide]")] : [];
        if (frames.length <= 1 || reduceMotion) return;
        if (dailyImgTimer) clearInterval(dailyImgTimer);
        dailyImgTimer = setInterval(() => setDailyPhoto(dailyImgIndex + 1), 4500);
      }

      root.querySelectorAll("[data-daily-goto]").forEach((btn) => {
        btn.addEventListener("click", () => {
          setDailyPhoto(Number(btn.dataset.dailyGoto));
          if (dailyImgTimer) clearInterval(dailyImgTimer);
          startDailyPhotoSlideshow();
        });
      });

      function closeDetail() {
        if (!detail) return;
        detail.hidden = true;
        detail.setAttribute("aria-hidden", "true");
        detail.innerHTML = "";
        root.classList.remove("birds-showcase--detail-open");
        resumeAutoplay();
      }

      function pauseAutoplay() {
        if (timer) clearInterval(timer);
        timer = null;
      }

      function resumeAutoplay() {
        if (reduceMotion || root.classList.contains("birds-showcase--detail-open")) return;
        timer = setInterval(() => goTo(index + 1), 7000);
      }

      root.querySelector("[data-showcase-prev]")?.addEventListener("click", () => {
        pauseAutoplay();
        goTo(index - 1);
        resumeAutoplay();
      });
      root.querySelector("[data-showcase-next]")?.addEventListener("click", () => {
        pauseAutoplay();
        goTo(index + 1);
        resumeAutoplay();
      });
      root.querySelectorAll("[data-goto-slide]").forEach((btn) => {
        btn.addEventListener("click", () => {
          pauseAutoplay();
          goTo(Number(btn.dataset.gotoSlide));
          resumeAutoplay();
        });
      });

      root.querySelectorAll("[data-showcase-info]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          openDetail(btn.getAttribute("data-showcase-info"), btn.hasAttribute("data-daily"));
        });
      });

      detail?.addEventListener("click", (e) => {
        if (e.target === detail) closeDetail();
      });
      root.addEventListener("click", (e) => {
        if (e.target.closest("[data-showcase-detail-close]")) closeDetail();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && root.classList.contains("birds-showcase--detail-open")) closeDetail();
      });

      slides.forEach((slide) => {
        const slug = slide.dataset.speciesSlug;
        const sp = bySlug[slug];
        const imgs = sp?.images || [];
        if (imgs.length <= 1) return;
        const imgEl = slide.querySelector("img");
        let sub = 0;
        imageTimers.set(
          slug,
          setInterval(() => {
            if (!slide.classList.contains("is-active")) return;
            sub = (sub + 1) % imgs.length;
            const im = imgs[sub];
            if (imgEl && im) {
              imgEl.src = asset(im.src);
              imgEl.alt = im.alt || sp.commonName;
            }
          }, 4500)
        );
      });

      goTo(carouselSpecies.findIndex((s) => s.slug === dailySlug) >= 0 ? carouselSpecies.findIndex((s) => s.slug === dailySlug) : 0);
      resumeAutoplay();
      startDailyPhotoSlideshow();
      document.dispatchEvent(new CustomEvent("site:content-rendered"));
    })
    .catch(console.error);
})();