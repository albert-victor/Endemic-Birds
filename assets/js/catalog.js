(function () {
  const root = document.querySelector("[data-catalog]");
  if (!root) return;

  const catalogType = root.dataset.catalog;
  const prefix = window.__ASSET_PREFIX__ || "/";
  const asset = (p) => prefix + p.replace(/^\//, "");
  const useBento = root.dataset.layout === "bento" || document.querySelector("[data-catalog-bento]");

  const categoryLabels = {
    birding: "Birding-focused",
    wildlife: "Wildlife-focused",
    combined: "Birding + Wildlife",
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function loadJson(file) {
    const res = await fetch(asset(`content/${file}`));
    return res.json();
  }

  function getParams() {
    return new URLSearchParams(location.search);
  }

  function filterPackage(p, fd) {
    const category = fd.get("category") || "all";
    const duration = fd.get("duration") || "all";
    const destination = fd.get("destination") || "all";
    const circuit = fd.get("circuit") || "all";
    if (category !== "all" && p.category !== category) return false;
    if (duration === "short" && p.durationDays > 10) return false;
    if (duration === "medium" && (p.durationDays < 11 || p.durationDays > 16)) return false;
    if (duration === "long" && p.durationDays < 17) return false;
    if (destination !== "all" && !(p.destinations || []).includes(destination)) return false;
    if (circuit !== "all" && !(p.circuits || []).includes(circuit)) return false;
    return true;
  }

  function bindFilters(getItems, render, emptyEl, countEl) {
    const form = document.querySelector("[data-filters]");
    if (!form) return;

    function apply() {
      const fd = new FormData(form);
      const preset = root.dataset.defaultCategory;
      if (preset && !getParams().get("category")) fd.set("category", preset);
      const items = getItems().filter((p) => filterPackage(p, fd));
      render(items);
      if (emptyEl) emptyEl.hidden = items.length > 0;
      if (countEl) countEl.textContent = String(items.length);
    }

    form.addEventListener("change", apply);
    form.querySelector("[data-clear-filters]")?.addEventListener("click", (e) => {
      e.preventDefault();
      form.reset();
      apply();
    });

    const params = getParams();
    if (params.get("category")) {
      const sel = form.querySelector('[name="category"]');
      if (sel) sel.value = params.get("category");
    }
    if (params.get("type") === "birding") {
      const sel = form.querySelector('[name="category"]');
      if (sel) sel.value = "birding";
    }
    apply();
  }

  async function initPackages() {
    const [packages, wildlifeDests] = await Promise.all([
      loadJson("packages.json"),
      loadJson("wildlife-destinations.json").catch(() => []),
    ]);
    window.__PACKAGE_WDEST_MAP__ = Object.fromEntries((wildlifeDests || []).map((d) => [d.slug, d]));
    const bentoHost = document.querySelector("[data-catalog-bento]");
    const grid = root.querySelector("[data-catalog-grid]");
    const listHost = root.querySelector("[data-catalog-list]");
    const emptyEl = root.querySelector("[data-empty]") || document.querySelector("[data-empty]");
    const countEl = root.querySelector("[data-count]") || document.querySelector("[data-count]");

    function renderFiltered(filtered) {
      const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      const teaserLimit = listHost?.dataset?.packageTeaserLimit
        ? Number(listHost.dataset.packageTeaserLimit)
        : 0;
      const show = teaserLimit > 0 ? sorted.slice(0, teaserLimit) : sorted;
      if (bentoHost && window.EndemicUI?.renderPackageBento && !teaserLimit) {
        bentoHost.innerHTML = window.EndemicUI.renderPackageBento(sorted, asset);
      } else if (bentoHost) {
        bentoHost.innerHTML = "";
      }
      const html = window.EndemicUI?.renderPackageCorpGrid(show, asset) || "";
      if (listHost) listHost.innerHTML = html;
      else if (grid) grid.innerHTML = html;
    }

    const form = document.querySelector("[data-filters]");
    if (form) {
      bindFilters(
        () => packages,
        renderFiltered,
        emptyEl,
        countEl
      );
    } else {
      let filtered = packages;
      const preset = root.dataset.defaultCategory;
      if (preset) filtered = packages.filter((p) => p.category === preset);
      filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      renderFiltered(filtered);
      if (countEl) countEl.textContent = String(filtered.length);
    }
    document.dispatchEvent(new CustomEvent("site:content-rendered"));
  }

  async function loadBirdingDestinationSites() {
    const [southern, western, northern] = await Promise.all([
      loadJson("southern-sites.json"),
      loadJson("western-sites.json"),
      loadJson("northern-sites.json"),
    ]);
    const sites = [
      ...(southern.sites || []).map((s) => ({ ...s, circuit: southern.circuit })),
      ...(western.sites || []).map((s) => ({ ...s, circuit: western.circuit })),
      ...(northern.sites || []).map((s) => ({ ...s, circuit: northern.circuit })),
    ];
    const seen = new Set();
    const unique = sites.filter((s) => {
      if (seen.has(s.slug)) return false;
      seen.add(s.slug);
      return true;
    });
    unique.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    return unique;
  }

  window.EndemicBirdingDests = { loadBirdingDestinationSites };

  async function initDestinations() {
    const grid = root.querySelector("[data-catalog-grid]");
    const emptyEl = root.querySelector("[data-empty]") || document.querySelector("[data-empty]");
    const countEl = root.querySelector("[data-count]") || document.querySelector("[data-count]");
    const typeParam =
      getParams().get("type") ||
      root.dataset.destinationsPreset ||
      document.body.dataset.destinationsPreset;

    if (typeParam === "birding" && window.EndemicUI?.renderBirdingDestinationsGrid) {
      document.body.classList.add("destinations-mode-birding");
      document.querySelector("[data-filters]")?.setAttribute("hidden", "");
      const unique = await loadBirdingDestinationSites();
      grid.innerHTML = window.EndemicUI.renderBirdingDestinationsGrid(unique, asset);
      grid.className = "";
      if (countEl) countEl.textContent = String(unique.length);
      if (emptyEl) emptyEl.hidden = unique.length > 0;
      document.dispatchEvent(new CustomEvent("site:content-rendered"));
      return;
    }

    const [destinations, packages] = await Promise.all([loadJson("destinations.json"), loadJson("packages.json")]);

    function renderList(list) {
      if (window.EndemicUI) {
        grid.innerHTML = window.EndemicUI.renderDestScriptGrid(list, packages, asset);
        grid.className = "";
      }
      if (countEl) countEl.textContent = String(list.length);
      if (emptyEl) emptyEl.hidden = list.length > 0;
    }

    function filterDest(d, fd) {
      const type = fd.get("type") || "all";
      const circuit = fd.get("circuit") || "all";
      if (type !== "all" && !(d.experienceTypes || []).includes(type)) return false;
      if (circuit !== "all" && d.circuit !== circuit) return false;
      return true;
    }

    const form = document.querySelector("[data-filters]");
    if (form) {
      form.addEventListener("change", () => {
        const fd = new FormData(form);
        const params = getParams();
        if (params.get("type") && fd.get("type") === "all") fd.set("type", params.get("type"));
        renderList(destinations.filter((d) => filterDest(d, fd)));
      });
      form.querySelector("[data-clear-filters]")?.addEventListener("click", (e) => {
        e.preventDefault();
        form.reset();
        renderList(destinations);
      });
      const fd = new FormData(form);
      if (getParams().get("type")) fd.set("type", getParams().get("type"));
      renderList(destinations.filter((d) => filterDest(d, fd)));
    } else {
      renderList(destinations);
    }
    document.dispatchEvent(new CustomEvent("site:content-rendered"));
  }

  if (catalogType === "packages") initPackages().catch(console.error);
  if (catalogType === "destinations") initDestinations().catch(console.error);
})();
