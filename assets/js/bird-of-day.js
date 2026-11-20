(function () {
  const mount = document.querySelector("[data-bird-of-day]");
  if (!mount) return;

  const prefix = window.__ASSET_PREFIX__ || "/";
  const asset = (p) => prefix + String(p).replace(/^\//, "");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function dayOfYear(d) {
    const start = new Date(Date.UTC(d.getFullYear(), 0, 0));
    const diff = d - start;
    return Math.floor(diff / 86400000);
  }

  function pickSlug(config, species) {
    const pool = config.speciesSlugs || [];
    if (!pool.length) return species[0]?.slug;
    const idx = dayOfYear(new Date()) % pool.length;
    return pool[idx];
  }

  function whenSpeciesReady() {
    if (window.EndemicSpecies?.load) return window.EndemicSpecies.load();
    return new Promise((resolve) => {
      document.addEventListener("endemic:species-ready", () => resolve(), { once: true });
    });
  }

  Promise.all([fetch(asset("content/bird-of-day.json")).then((r) => r.json()), whenSpeciesReady()])
    .then(([botd]) => {
      const birdsData = window.__SPECIAL_BIRDS__ || { species: [], categoryLabels: {} };
      const labels = birdsData.categoryLabels || {};
      const species = birdsData.species || [];
      const slug = pickSlug(botd, species);
      const sp = window.EndemicSpecies?.get?.(slug);
      if (!sp) return;

      const images = (sp.images || []).filter((im) => im.imageRole !== "habitat");
      const cat = labels[sp.category] || sp.category;
      const primary = images[0];
      const extra = images.slice(1);
      const autoplay = !reduceMotion && extra.length > 0;

      const thumbs =
        images.length > 1
          ? `<div class="bird-day__thumbs" role="tablist" aria-label="Species images">
        ${images
          .map(
            (im, i) =>
              `<button type="button" role="tab" class="bird-day__thumb${i === 0 ? " is-active" : ""}" data-index="${i}" aria-selected="${i === 0 ? "true" : "false"}">
            <img src="${asset(im.src)}" alt="" loading="lazy" />
          </button>`
          )
          .join("")}
      </div>`
          : "";

      const specialLinks = species
        .slice(0, 5)
        .map(
          (s) =>
            `<a class="home-special-chip" href="${asset("birding/special-birds/index.html")}?species=${encodeURIComponent(s.slug)}">${escapeHtml(s.commonName)}</a>`
        )
        .join("");

      mount.innerHTML = `<div class="bird-of-day container is-visible" data-bird-day data-autoplay="${autoplay ? "1" : "0"}">
        <div class="bird-of-day__copy">
          <p class="eyebrow">${escapeHtml(botd.sectionTitle || "Bird of the day")}</p>
          <p class="bird-day__category">${escapeHtml(cat)}</p>
          <h2 class="section-title">${escapeHtml(sp.commonName)}</h2>
          <p class="bird-day__sci"><em>${escapeHtml(sp.scientificName)}</em></p>
          <p class="section-lead">${escapeHtml(sp.whyItMatters || "")}</p>
          <p class="bird-day__region">${escapeHtml(sp.habitatRegion || "")}</p>
          <div class="bird-day__actions">
            <button type="button" class="btn btn-solid" data-bird-day-more>View details</button>
            <a class="btn btn-outline" href="${asset("birding/special-birds/index.html")}">Special birds</a>
          </div>
        </div>
        <div class="bird-of-day__media">
          <figure class="bird-day__figure">
            <img data-bird-day-img src="${asset(primary.src)}" alt="${escapeHtml(primary.alt || sp.commonName)}" loading="lazy" decoding="async" />
            <figcaption>${escapeHtml(primary.credit || "")}</figcaption>
          </figure>
          ${thumbs}
          ${
            autoplay
              ? `<button type="button" class="bird-day__pause" data-bird-day-pause aria-pressed="false">Pause slideshow</button>`
              : ""
          }
        </div>
      </div>
      <aside class="home-special-strip container" aria-labelledby="home-special-heading">
        <div class="home-special-strip__head">
          <h3 id="home-special-heading" class="home-special-strip__title">Special birds catalogue</h3>
          <a class="text-link" href="${asset("birding/special-birds/index.html")}">View all →</a>
        </div>
        <div class="home-special-strip__chips">${specialLinks}</div>
      </aside>`;

      mount.querySelector("[data-bird-day-more]")?.addEventListener("click", () => {
        window.EndemicSpecies?.open?.(sp.slug);
      });

      const root = mount.querySelector("[data-bird-day]");
      const mainImg = root.querySelector("[data-bird-day-img]");
      let slide = 0;
      let timer = null;
      const pauseBtn = root.querySelector("[data-bird-day-pause]");

      function showSlide(i) {
        slide = i;
        const im = images[i];
        if (!mainImg || !im) return;
        mainImg.src = asset(im.src);
        mainImg.alt = im.alt || sp.commonName;
        root.querySelectorAll(".bird-day__thumb").forEach((btn, j) => {
          btn.classList.toggle("is-active", j === i);
          btn.setAttribute("aria-selected", j === i ? "true" : "false");
        });
      }

      root.querySelectorAll(".bird-day__thumb").forEach((btn) => {
        btn.addEventListener("click", () => {
          clearInterval(timer);
          showSlide(Number(btn.dataset.index));
        });
      });

      document.dispatchEvent(new CustomEvent("site:content-rendered"));

      if (autoplay) {
        timer = setInterval(() => showSlide((slide + 1) % images.length), 6500);
        pauseBtn?.addEventListener("click", () => {
          const paused = pauseBtn.getAttribute("aria-pressed") === "true";
          if (paused) {
            pauseBtn.setAttribute("aria-pressed", "false");
            pauseBtn.textContent = "Pause slideshow";
            timer = setInterval(() => showSlide((slide + 1) % images.length), 6500);
          } else {
            pauseBtn.setAttribute("aria-pressed", "true");
            pauseBtn.textContent = "Resume slideshow";
            clearInterval(timer);
          }
        });
      }
    })
    .catch(console.error);
})();