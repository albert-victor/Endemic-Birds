(function () {
  const INITIAL_VISIBLE = 50;

  const CATEGORY_SORT_RANK = {
    "tanzania-endemic": 0,
    "near-endemic": 1,
    "range-restricted": 2,
    specialty: 3,
    signature: 4,
    "additional-checklist-record": 5,
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatSourceLabel(label) {
    if (!label) return "";
    if (label === "Your record") return "Additional checklist record";
    return label;
  }

  function statusSlug(label) {
    const formatted = formatSourceLabel(label);
    return formatted
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  let cache = null;
  let enrichCache = null;

  function resolveSpeciesSlug(row, lookup) {
    if (!lookup) return null;
    const sci = (row.scientificName || "").trim().toLowerCase();
    if (sci && lookup.byScientificName?.[sci]) return lookup.byScientificName[sci];
    const com = (row.commonName || "").trim().toLowerCase();
    if (com && lookup.byCommonName?.[com]) return lookup.byCommonName[com];
    return null;
  }

  function primaryImageSrc(speciesSlug, mediaBySlug, assetFn) {
    const pack = mediaBySlug?.[speciesSlug];
    if (!pack?.images?.length) return null;
    const hero = pack.images.find((im) => im.primary) || pack.images[0];
    return assetFn(hero.src);
  }

  async function loadEnrichment(asset) {
    if (enrichCache) return enrichCache;
    const [indexRes, mediaRes] = await Promise.all([
      fetch(asset("content/bird-species-index.json")),
      fetch(asset("content/bird-species-media.json")),
    ]);
    enrichCache = {
      lookup: indexRes.ok ? (await indexRes.json()).lookup : null,
      mediaBySlug: mediaRes.ok ? (await mediaRes.json()).bySlug || {} : {},
    };
    return enrichCache;
  }

  async function loadCatalog(asset) {
    if (cache) return cache;
    const res = await fetch(asset("content/destination-checklists.json"));
    if (!res.ok) throw new Error("destination-checklists.json");
    cache = await res.json();
    return cache;
  }

  async function getForSite(siteSlug, asset) {
    const catalog = await loadCatalog(asset);
    return catalog.bySiteSlug?.[siteSlug] || null;
  }

  function renderHighlightsSection(highlights) {
    if (!highlights?.length) return "";
    return `<section class="detail-section reveal dest-checklist-highlights" data-reveal>
      <div class="dest-checklist-highlights__head">
        <p class="eyebrow">Trip focus</p>
        <h2>Birdlife highlights</h2>
        <p class="meta-line">Signature species we build days around at this site – drawn from the checklist below.</p>
      </div>
      <ul class="dest-checklist-highlights__grid">
        ${highlights
          .map(
            (h) => `<li class="dest-checklist-highlights__item">
            <span class="dest-checklist-highlights__mark" aria-hidden="true"></span>
            <span class="dest-checklist-highlights__name">${escapeHtml(h)}</span>
          </li>`
          )
          .join("")}
      </ul>
    </section>`;
  }

  function renderFilterChips(counts, total) {
    const chips = [
      `<button type="button" class="dest-checklist__filter is-active" data-filter="all" aria-pressed="true">
        All<span class="dest-checklist__filter-n">${total}</span>
      </button>`,
    ];
    Object.entries(counts || {}).forEach(([key, n]) => {
      const slug = statusSlug(key);
      chips.push(
        `<button type="button" class="dest-checklist__filter dest-checklist__filter--${escapeHtml(slug)}" data-filter="${escapeHtml(slug)}" aria-pressed="false">
          ${escapeHtml(formatSourceLabel(key))}<span class="dest-checklist__filter-n">${n}</span>
        </button>`
      );
    });
    return `<div class="dest-checklist__filters" role="group" aria-label="Filter by checklist category">${chips.join("")}</div>`;
  }

  function renderChecklistSection(checklist, enrich = null, assetFn = null) {
    const rows = checklist.species || [];
    const count = rows.length;
    const lookup = enrich?.lookup;
    const mediaBySlug = enrich?.mediaBySlug || {};
    const asset = assetFn || ((p) => p);

    const prepared = rows.map((row, index) => {
      const labelSlug = statusSlug(row.sourceLabel);
      const speciesSlug = resolveSpeciesSlug(row, lookup);
      const thumbSrc = speciesSlug ? primaryImageSrc(speciesSlug, mediaBySlug, asset) : null;
      return { row, index, labelSlug, speciesSlug, thumbSrc };
    });
    const showPhotoCol = prepared.some((p) => p.thumbSrc);

    const rowHtml = prepared
      .map(({ row, index, labelSlug, speciesSlug, thumbSrc }) => {
        const sci = row.scientificName
          ? `<em class="dest-checklist__sci">${escapeHtml(row.scientificName)}</em>`
          : `<span class="dest-checklist__sci-missing" title="Scientific name not provided in source">–</span>`;
        const label = formatSourceLabel(row.sourceLabel);
        const hidden = index >= INITIAL_VISIBLE ? ' hidden data-initial-hidden="true"' : "";
        const linked = speciesSlug ? ` dest-checklist__row--linked` : "";
        const speciesAttr = speciesSlug ? ` data-species-slug="${escapeHtml(speciesSlug)}"` : "";
        const photoCell = showPhotoCol
          ? `<td class="dest-checklist__photo-cell" data-cell="photo">
            ${
              thumbSrc
                ? `<img class="dest-checklist__thumb" src="${escapeHtml(thumbSrc)}" alt="" width="48" height="48" loading="lazy" decoding="async" />`
                : '<span class="dest-checklist__thumb dest-checklist__thumb--empty" aria-hidden="true"></span>'
            }
          </td>`
          : "";

        return `<tr class="dest-checklist__row${linked}" data-label="${escapeHtml(labelSlug)}" data-order="${index}"${speciesAttr}${hidden}>
          ${photoCell}
          <th scope="row" class="dest-checklist__common" data-cell="name">${escapeHtml(row.commonName)}</th>
          <td class="dest-checklist__sci-cell" data-cell="science">${sci}</td>
          <td class="dest-checklist__label" data-cell="category">
            <span class="dest-checklist__badge dest-checklist__badge--${escapeHtml(labelSlug)}">${escapeHtml(label)}</span>
          </td>
        </tr>`;
      })
      .join("");

    const moreBtn =
      count > INITIAL_VISIBLE
        ? `<div class="dest-checklist__more-wrap">
          <button type="button" class="btn btn-outline btn-sm" data-checklist-show-all>Show all ${count} species</button>
        </div>`
        : "";

    return `<section class="detail-section detail-section--wide reveal dest-checklist" data-reveal id="listed-species" data-checklist-count="${count}">
      <div class="dest-checklist__card">
        <header class="dest-checklist__head">
          <div class="dest-checklist__head-copy">
            <p class="eyebrow">Field checklist</p>
            <h2>Bird species on our list</h2>
            <p class="dest-checklist__lede">A curated species list for specialist birding at this destination – use it to shape your target list before you travel.</p>
          </div>
          <div class="dest-checklist__metric" aria-label="${count} species listed">
            <span class="dest-checklist__metric-value">${count}</span>
            <span class="dest-checklist__metric-label">species listed</span>
          </div>
        </header>

        <p class="dest-checklist__note">
          <span class="dest-checklist__note-icon" aria-hidden="true">i</span>
          Categories group birds for itinerary planning (endemic, specialty, and similar). They are not IUCN Red List ratings, and this is not a complete census of every bird in the park.
        </p>

        <div class="dest-checklist__toolbar">
          ${renderFilterChips(checklist.sourceStatusCounts, count)}
          <div class="dest-checklist__toolbar-actions">
            <label class="dest-checklist__search-wrap">
              <span class="visually-hidden">Search species</span>
              <span class="dest-checklist__search-icon" aria-hidden="true"></span>
              <input type="search" class="dest-checklist__search" placeholder="Search English or scientific name…" autocomplete="off" enterkeyhint="search" />
            </label>
            <label class="dest-checklist__sort-wrap">
              <span class="visually-hidden">Sort</span>
              <select class="dest-checklist__sort" aria-label="Sort species list">
                <option value="source">Checklist order</option>
                <option value="name">Name (A–Z)</option>
                <option value="category">By category</option>
              </select>
            </label>
          </div>
        </div>

        <p class="dest-checklist__results" data-checklist-results aria-live="polite">Showing ${count} of ${count}</p>

        <div class="dest-checklist__table-wrap">
          <table class="dest-checklist__table">
            <caption class="visually-hidden">Bird species listed for this destination</caption>
            <thead>
              <tr>
                ${showPhotoCol ? '<th scope="col" class="dest-checklist__photo-head"><span class="visually-hidden">Photo</span></th>' : ""}
                <th scope="col">English name</th>
                <th scope="col">Scientific name</th>
                <th scope="col">Category</th>
              </tr>
            </thead>
            <tbody>${rowHtml}</tbody>
          </table>
        </div>

        <p class="dest-checklist__empty" hidden data-checklist-empty>No species match your search or filter. Try another category or clear the search.</p>
        ${moreBtn}
      </div>
    </section>`;
  }

  function wireSection(root) {
    if (!root) return;
    const tbody = root.querySelector("tbody");
    const search = root.querySelector(".dest-checklist__search");
    const sort = root.querySelector(".dest-checklist__sort");
    const empty = root.querySelector("[data-checklist-empty]");
    const results = root.querySelector("[data-checklist-results]");
    const showAll = root.querySelector("[data-checklist-show-all]");
    const total = parseInt(root.getAttribute("data-checklist-count"), 10) || 0;

    let activeFilter = "all";
    let showAllClicked = false;

    const rows = () => [...tbody.querySelectorAll("tr")];

    function applyFilters() {
      const q = (search?.value || "").trim().toLowerCase();
      const narrowed = Boolean(q) || activeFilter !== "all";
      let visible = 0;

      rows().forEach((tr) => {
        const label = tr.dataset.label;
        const catOk = activeFilter === "all" || label === activeFilter;
        const textOk = !q || tr.textContent.toLowerCase().includes(q);
        const paginated = tr.hasAttribute("data-initial-hidden") && !showAllClicked && !narrowed;
        const show = !paginated && catOk && textOk;
        tr.hidden = !show;
        if (show) visible += 1;
      });

      if (results) results.textContent = `Showing ${visible} of ${total}`;
      if (empty) empty.hidden = visible > 0;
    }

    if (showAll && tbody) {
      showAll.addEventListener("click", () => {
        tbody.querySelectorAll("[data-initial-hidden]").forEach((tr) => {
          tr.removeAttribute("hidden");
          tr.removeAttribute("data-initial-hidden");
        });
        showAllClicked = true;
        showAll.closest(".dest-checklist__more-wrap")?.remove();
        applyFilters();
      });
    }

    root.querySelectorAll(".dest-checklist__filter").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeFilter = btn.dataset.filter || "all";
        root.querySelectorAll(".dest-checklist__filter").forEach((b) => {
          const on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-pressed", on ? "true" : "false");
        });
        applyFilters();
      });
    });

    search?.addEventListener("input", applyFilters);

    sort?.addEventListener("change", () => {
      const mode = sort.value;
      const list = rows();
      const sorted = [...list].sort((a, b) => {
        if (mode === "source") {
          return Number(a.dataset.order) - Number(b.dataset.order);
        }
        if (mode === "name") {
          return (a.querySelector(".dest-checklist__common")?.textContent || "").localeCompare(
            b.querySelector(".dest-checklist__common")?.textContent || "",
            undefined,
            { sensitivity: "base" }
          );
        }
        if (mode === "category") {
          const ra = CATEGORY_SORT_RANK[a.dataset.label] ?? 99;
          const rb = CATEGORY_SORT_RANK[b.dataset.label] ?? 99;
          if (ra !== rb) return ra - rb;
          return Number(a.dataset.order) - Number(b.dataset.order);
        }
        return 0;
      });
      sorted.forEach((tr) => tbody.appendChild(tr));
      applyFilters();
    });

    applyFilters();

    tbody.querySelectorAll("tr[data-species-slug]").forEach((tr) => {
      tr.addEventListener("click", (e) => {
        if (e.target.closest("a, button")) return;
        const speciesSlug = tr.dataset.speciesSlug;
        if (!speciesSlug || !window.EndemicSpecies) return;
        const open = () => window.EndemicSpecies.open?.(speciesSlug);
        if (window.EndemicSpecies.get?.(speciesSlug)) open();
        else window.EndemicSpecies.load?.().then(open);
      });
    });
  }

  function mount(root) {
    wireSection(root);
  }

  window.EndemicDestChecklist = {
    loadCatalog,
    loadEnrichment,
    getForSite,
    renderHighlightsSection,
    renderChecklistSection,
    formatSourceLabel,
    mount,
    INITIAL_VISIBLE,
  };
})();