(function () {
  const root = document.querySelector("[data-special-birds]");
  if (!root) return;

  const prefix = window.__ASSET_PREFIX__ || "/";
  const asset = (p) => prefix + String(p).replace(/^\//, "");
  const PAGE_SIZE = 48;
  const SPECIALTY_LABEL = "Specialty";

  const EASTERN_ARC_SLUGS = new Set([
    "amani-nature-reserve",
    "west-usambara-magamba",
    "udzungwa-mountains",
    "kilombero-plains",
    "rubeho-mountains",
    "ukaguru-mountains",
    "uluti-mountain",
    "mufindi-forest",
    "rondo-plateau",
    "south-pare-chome",
  ]);

  let species = [];
  let checklistsBySite = {};
  let destNameBySlug = new Map();
  let page = 1;
  let searchQuery = "";
  let activeDest = "";

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function titleFromSlug(slug) {
    return String(slug || "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function initials(name) {
    return String(name || "?")
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }

  function isSpecialtyGlobally(meta) {
    return (meta.sourceLabels || []).includes(SPECIALTY_LABEL);
  }

  function speciesKey(meta) {
    const sci = (meta.scientificName || "").trim().toLowerCase();
    if (sci) return `sci:${sci}`;
    return `com:${(meta.commonName || "").trim().toLowerCase()}`;
  }

  function isSpecialtyAtDestination(meta, destSlug) {
    if (!destSlug) return true;
    const rows = checklistsBySite[destSlug]?.species;
    if (!rows?.length) return false;
    const key = speciesKey(meta);
    return rows.some((row) => {
      if (row.sourceLabel !== SPECIALTY_LABEL) return false;
      const rowKey = speciesKey({
        commonName: row.commonName,
        scientificName: row.scientificName,
      });
      return rowKey === key;
    });
  }

  function normalizeSearch(str) {
    return String(str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "");
  }

  function matchesSearch(meta, q) {
    if (!q) return true;
    const hay = normalizeSearch([meta.commonName, meta.scientificName].join(" "));
    const toks = q.split(/\s+/).filter(Boolean);
    return toks.every((t) => hay.includes(t));
  }

  function speciesPhoto(meta) {
    const sp = window.EndemicSpecies?.get?.(meta.slug);
    const images = (sp?.images || []).filter((im) => im.imageRole !== "habitat");
    return images.find((im) => im.primary) || images[0] || null;
  }

  function filteredList() {
    return species
      .filter((s) => matchesSearch(s, searchQuery) && isSpecialtyAtDestination(s, activeDest))
      .sort((a, b) => a.commonName.localeCompare(b.commonName, undefined, { sensitivity: "base" }));
  }

  /** Same stagger grid shell as EndemicUI birding destination catalog (`ui-cards.js`). */
  function renderSpeciesStaggerGrid(items) {
    if (!items.length) return "";
    return `<div class="alt-card-grid alt-card-grid--dest-spot reveal-stagger" data-reveal-stagger>${items
      .map((meta, i) => renderCard(meta, i))
      .join("")}</div>`;
  }

  function renderCard(meta, revealIndex) {
    const photo = speciesPhoto(meta);
    const n = meta.destinationSlugs?.length || 0;
    const metaLine = n ? `Recorded at ${n} birding site${n === 1 ? "" : "s"}` : "";
    const revealStyle = typeof revealIndex === "number" ? ` style="--reveal-i:${revealIndex}"` : "";

    const media = photo
      ? `<img src="${asset(photo.src)}" alt="${escapeHtml(photo.alt || meta.commonName)}" loading="lazy" decoding="async" width="400" height="300" />`
      : `<span class="special-bird-card__placeholder" aria-hidden="true"><span class="special-bird-card__initials">${escapeHtml(initials(meta.commonName))}</span><span class="special-bird-card__placeholder-label">Image on the way</span></span>`;

    return `<article class="special-bird-card special-bird-card--catalog"${revealStyle}>
      <button type="button" class="special-bird-card__media special-bird-card__media--btn${photo ? "" : " is-empty"}" data-species-open="${escapeHtml(meta.slug)}">
        ${media}
      </button>
      <div class="special-bird-card__caption">
        <h2 class="special-bird-card__title">${escapeHtml(meta.commonName)}</h2>
        ${
          meta.scientificName
            ? `<p class="special-bird-card__sci"><em>${escapeHtml(meta.scientificName)}</em></p>`
            : `<p class="special-bird-card__sci special-bird-card__sci--missing">Scientific name on checklist review</p>`
        }
        ${metaLine ? `<p class="special-bird-card__meta">${escapeHtml(metaLine)}</p>` : ""}
      </div>
    </article>`;
  }

  function bindOpens(scope) {
    scope.querySelectorAll("[data-species-open]").forEach((el) => {
      el.addEventListener("click", () => {
        const slug = el.getAttribute("data-species-open");
        const open = () => window.EndemicSpecies?.open?.(slug);
        if (window.EndemicSpecies?.get?.(slug)) open();
        else window.EndemicSpecies?.load?.().then(open);
      });
    });
  }

  function afterCatalogRender(scope) {
    window.EndemicUI?.initCardMedia?.(scope || root);
    document.dispatchEvent(new CustomEvent("site:content-rendered"));
  }

  function scrollToCatalog() {
    const anchor = root.querySelector("[data-catalog-anchor]");
    if (!anchor) return;
    const top = anchor.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: "smooth" });
  }

  function renderPagination(totalPages, totalFiltered) {
    if (totalPages <= 1) {
      return `<div class="catalog-pagination catalog-pagination--compact"><span class="catalog-pagination__status">${totalFiltered} specialty species in this list</span></div>`;
    }

    const prevDisabled = page <= 1;
    const nextDisabled = page >= totalPages;
    const windowSize = 5;
    let start = Math.max(1, page - Math.floor(windowSize / 2));
    let end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);

    const pageButtons = [];
    for (let i = start; i <= end; i += 1) {
      pageButtons.push(
        `<button type="button" class="catalog-pagination__page${i === page ? " is-current" : ""}" data-page="${i}" aria-label="Page ${i}"${i === page ? ' aria-current="page"' : ""}>${i}</button>`
      );
    }

    return `<nav class="catalog-pagination" aria-label="Catalogue pages">
      <button type="button" class="catalog-pagination__nav" data-page-prev ${prevDisabled ? "disabled" : ""}>Previous</button>
      <div class="catalog-pagination__pages">${pageButtons.join("")}</div>
      <span class="catalog-pagination__status">Page ${page} of ${totalPages}</span>
      <button type="button" class="catalog-pagination__nav" data-page-next ${nextDisabled ? "disabled" : ""}>Next</button>
    </nav>`;
  }

  function bindPagination() {
    root.querySelectorAll("[data-page-prev]").forEach((btn) => {
      btn.onclick = () => {
        if (page > 1) {
          page -= 1;
          renderGrid();
          scrollToCatalog();
        }
      };
    });
    root.querySelectorAll("[data-page-next]").forEach((btn) => {
      btn.onclick = () => {
        const totalPages = Math.ceil(filteredList().length / PAGE_SIZE);
        if (page < totalPages) {
          page += 1;
          renderGrid();
          scrollToCatalog();
        }
      };
    });
    root.querySelectorAll("[data-page]").forEach((btn) => {
      btn.onclick = () => {
        const next = parseInt(btn.getAttribute("data-page"), 10);
        if (!Number.isNaN(next) && next !== page) {
          page = next;
          renderGrid();
          scrollToCatalog();
        }
      };
    });
  }

  function renderGrid() {
    const list = filteredList();
    const totalFiltered = list.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
    if (page > totalPages) page = totalPages;

    const start = (page - 1) * PAGE_SIZE;
    const pageItems = list.slice(start, start + PAGE_SIZE);

    const gridHost = root.querySelector("[data-catalog-grid]");
    const emptyEl = root.querySelector("[data-empty]");
    const countEl = root.querySelector("[data-catalog-count]");
    const paginationTop = root.querySelector("[data-pagination-top]");
    const paginationBottom = root.querySelector("[data-pagination-bottom]");

    if (gridHost) {
      gridHost.innerHTML = renderSpeciesStaggerGrid(pageItems);
      gridHost.className = "";
      const stagger = gridHost.querySelector("[data-reveal-stagger]");
      if (stagger) bindOpens(stagger);
    }
    if (emptyEl) emptyEl.hidden = pageItems.length > 0;

    if (countEl) {
      const from = totalFiltered ? start + 1 : 0;
      const to = Math.min(start + PAGE_SIZE, totalFiltered);
      countEl.textContent =
        totalFiltered === 0
          ? "No specialty species to show"
          : `Showing ${from}–${to} of ${totalFiltered} specialty species`;
    }

    const paginationHtml = renderPagination(totalPages, totalFiltered);
    if (paginationTop) paginationTop.innerHTML = paginationHtml;
    if (paginationBottom) paginationBottom.innerHTML = paginationHtml;

    bindPagination();
    afterCatalogRender(root);
  }

  async function loadDestNames() {
    const files = [
      "content/southern-sites.json",
      "content/western-sites.json",
      "content/northern-sites.json",
      "content/birding-sites-extra.json",
    ];
    const maps = await Promise.all(
      files.map((f) => fetch(asset(f)).then((r) => (r.ok ? r.json() : { sites: [] })))
    );
    maps.forEach((blob) => {
      (blob.sites || []).forEach((s) => {
        if (s.slug && s.name) destNameBySlug.set(s.slug, s.name);
      });
    });
  }

  function destinationOptions() {
    const slugs = Object.keys(checklistsBySite).filter((siteSlug) =>
      checklistsBySite[siteSlug]?.species?.some((row) => row.sourceLabel === SPECIALTY_LABEL)
    );
    return slugs
      .sort((a, b) =>
        (destNameBySlug.get(a) || a).localeCompare(destNameBySlug.get(b) || b, undefined, {
          sensitivity: "base",
        })
      )
      .map(
        (slug) =>
          `<option value="${escapeHtml(slug)}">${escapeHtml(destNameBySlug.get(slug) || titleFromSlug(slug))}</option>`
      )
      .join("");
  }

  function whenSpeciesReady() {
    if (window.EndemicSpecies?.load) return window.EndemicSpecies.load();
    return new Promise((resolve) => {
      document.addEventListener("endemic:species-ready", () => resolve(), { once: true });
    });
  }

  Promise.all([
    fetch(asset("content/bird-species-index.json")).then((r) => r.json()),
    fetch(asset("content/destination-checklists.json")).then((r) => r.json()),
    whenSpeciesReady(),
    loadDestNames(),
  ])
    .then(([indexData, checklists]) => {
      checklistsBySite = checklists.bySiteSlug || {};
      species = (indexData.species || []).filter(isSpecialtyGlobally);

      const params = new URLSearchParams(location.search);
      if (params.get("region") === "eastern-arc") {
        species = species.filter((s) =>
          (s.destinationSlugs || []).some((slug) => EASTERN_ARC_SLUGS.has(slug))
        );
      }

      const total = species.length;

      root.innerHTML = `
        <div data-catalog-anchor>
          <form class="filters-bar filters-bar--species" data-special-filters>
            <label class="filters-bar__grow">
              Species
              <input type="search" name="q" placeholder="e.g. Usambara eagle-owl" autocomplete="off" />
            </label>
            <label>
              Birding site
              <select name="destination" data-dest-filter>
                <option value="">All birding sites</option>
                ${destinationOptions()}
              </select>
            </label>
            <button type="button" class="btn btn-outline btn-sm" data-clear-filters>Clear</button>
          </form>
          <p class="catalog-meta"><span data-catalog-count aria-live="polite">${total} specialty species on our checklists</span></p>
          <div data-pagination-top></div>
          <div data-catalog-grid></div>
          <p class="catalog-empty" data-empty hidden>No specialty birds match this site and name – try another birding site or clear your filters.</p>
          <div data-pagination-bottom></div>
        </div>
        <noscript><p>${total} specialty species on our Tanzania checklists. Open this page in a full browser to search and filter the list.</p></noscript>`;

      const searchInput = root.querySelector('input[name="q"]');
      const destSelect = root.querySelector("[data-dest-filter]");
      const clearBtn = root.querySelector("[data-clear-filters]");

      let searchTimer;
      searchInput?.addEventListener("input", () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          searchQuery = searchInput.value.trim();
          page = 1;
          renderGrid();
        }, 120);
      });

      destSelect?.addEventListener("change", () => {
        activeDest = destSelect.value;
        page = 1;
        renderGrid();
      });

      clearBtn?.addEventListener("click", () => {
        searchQuery = "";
        activeDest = "";
        page = 1;
        if (searchInput) searchInput.value = "";
        if (destSelect) destSelect.value = "";
        renderGrid();
      });

      renderGrid();

      const open = params.get("species");
      if (open) {
        const tryOpen = () => window.EndemicSpecies?.open?.(open);
        if (window.EndemicSpecies?.get?.(open)) tryOpen();
        else document.addEventListener("endemic:species-ready", tryOpen, { once: true });
      }
    })
    .catch(console.error);
})();