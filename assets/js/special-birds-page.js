(function () {
  const root = document.querySelector("[data-special-birds]");
  if (!root) return;

  const prefix = window.__ASSET_PREFIX__ || "/";
  const asset = (p) => prefix + String(p).replace(/^\//, "");

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderCard(sp, labels) {
    const img = sp.images?.[0];
    const cat = labels[sp.category] || sp.category;
    return `<article class="special-bird-card" id="species-${escapeHtml(sp.slug)}">
      <a class="special-bird-card__media" href="?species=${encodeURIComponent(sp.slug)}" data-species-open="${escapeHtml(sp.slug)}">
        ${img ? `<img src="${asset(img.src)}" alt="${escapeHtml(img.alt || sp.commonName)}" loading="lazy" />` : ""}
      </a>
      <div class="special-bird-card__body">
        <p class="special-bird-card__cat">${escapeHtml(cat)}</p>
        <h2 class="special-bird-card__title">${escapeHtml(sp.commonName)}</h2>
        <p class="special-bird-card__sci"><em>${escapeHtml(sp.scientificName)}</em></p>
        <p class="special-bird-card__why">${escapeHtml(sp.whyItMatters || "")}</p>
        <p class="special-bird-card__region">${escapeHtml(sp.habitatRegion || "")}</p>
        <button type="button" class="btn btn-outline" data-species-open="${escapeHtml(sp.slug)}">View details</button>
      </div>
    </article>`;
  }

  function bindOpens(scope) {
    scope.querySelectorAll("[data-species-open]").forEach((el) => {
      el.addEventListener("click", (e) => {
        if (el.tagName === "A") e.preventDefault();
        const slug = el.getAttribute("data-species-open");
        window.EndemicSpecies?.open?.(slug);
      });
    });
  }

  fetch(asset("content/special-birds.json"))
    .then((r) => r.json())
    .then((data) => {
      const labels = data.categoryLabels || {};
      const species = data.species || [];
      const params = new URLSearchParams(location.search);
      const region = params.get("region");

      const crawlList = species
        .map(
          (sp) => `<li><a href="?species=${encodeURIComponent(sp.slug)}">${escapeHtml(sp.commonName)} (${escapeHtml(sp.scientificName)})</a> – ${escapeHtml(sp.whyItMatters || "")}</li>`
        )
        .join("");

      root.innerHTML = `
        <div class="special-birds-filters" role="group" aria-label="Filter by category">
          <button type="button" class="is-active" data-filter="all">All</button>
          <button type="button" data-filter="endemic">${escapeHtml(labels.endemic || "Endemic")}</button>
          <button type="button" data-filter="range-restricted">${escapeHtml(labels["range-restricted"] || "Range-restricted")}</button>
          <button type="button" data-filter="specialist">${escapeHtml(labels.specialist || "Specialist")}</button>
        </div>
        <div class="special-birds-grid" data-special-grid></div>
        <noscript><h2 class="about-section-heading">Species index</h2><ul>${crawlList}</ul></noscript>`;

      const grid = root.querySelector("[data-special-grid]");
      const render = (filter) => {
        const list =
          filter === "all" ? species : species.filter((s) => s.category === filter);
        grid.innerHTML = list.map((sp) => renderCard(sp, labels)).join("");
        bindOpens(grid);
      };
      render("all");

      root.querySelectorAll(".special-birds-filters button").forEach((btn) => {
        btn.addEventListener("click", () => {
          root.querySelectorAll(".special-birds-filters button").forEach((b) => b.classList.remove("is-active"));
          btn.classList.add("is-active");
          render(btn.dataset.filter);
        });
      });

      if (region === "eastern-arc") {
        const arcSlugs = new Set([
          "udzungwa-forest-partridge",
          "iringa-akalat",
          "rufous-winged-sunbird",
          "usambara-akalat",
          "kilombero-weaver",
        ]);
        const filtered = species.filter((s) => arcSlugs.has(s.slug));
        grid.innerHTML = filtered.map((sp) => renderCard(sp, labels)).join("");
        bindOpens(grid);
      }

      const open = new URLSearchParams(location.search).get("species");
      if (open) {
        const tryOpen = () => window.EndemicSpecies?.open?.(open);
        if (window.EndemicSpecies?.get?.(open)) tryOpen();
        else document.addEventListener("endemic:species-ready", tryOpen, { once: true });
      }

      document.dispatchEvent(new CustomEvent("site:content-rendered"));
    })
    .catch(console.error);
})();