(function () {
  const roots = document.querySelectorAll("[data-catalog]");
  if (!roots.length) return;

  const prefix = window.__ASSET_PREFIX__ || "/";
  const asset = (p) => prefix + p.replace(/^\//, "");

  function getParams() {
    return new URLSearchParams(location.search);
  }

  async function loadJson(file) {
    const res = await fetch(asset(`content/${file}`));
    return res.json();
  }

  async function loadBirdingDestinationSites() {
    const [southern, western, northern, extra] = await Promise.all([
      loadJson("southern-sites.json"),
      loadJson("western-sites.json"),
      loadJson("northern-sites.json"),
      loadJson("birding-sites-extra.json").catch(() => ({ sites: [] })),
    ]);
    const sites = [
      ...(southern.sites || []).map((s) => ({ ...s, circuit: s.circuit || southern.circuit })),
      ...(western.sites || []).map((s) => ({ ...s, circuit: s.circuit || western.circuit })),
      ...(northern.sites || []).map((s) => ({ ...s, circuit: s.circuit || northern.circuit })),
      ...(extra.sites || []).map((s) => ({ ...s, circuit: s.circuit || "Eastern" })),
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

  function filterBirdingSite(site, fd) {
    const circuit = fd.get("circuit") || "all";
    const interest = fd.get("interest") || "all";
    if (interest === "wildlife") return false;
    if (circuit !== "all" && site.circuit !== circuit) return false;
    return true;
  }

  function catalogScope(root) {
    return root.closest("[data-catalog-scope]") || root.parentElement || document;
  }

  function packagePoolForRoot(root, packages) {
    const include = (root.dataset.includeCategories || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const exclude = (root.dataset.excludeCategories || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (include.length) return packages.filter((p) => include.includes(p.category));
    if (exclude.length) return packages.filter((p) => !exclude.includes(p.category));
    const preset = root.dataset.defaultCategory;
    if (preset) return packages.filter((p) => p.category === preset);
    return packages;
  }

  async function initPackages(root) {
    const [packages, wildlifeDests, metaDoc] = await Promise.all([
      loadJson("packages.json"),
      loadJson("wildlife-destinations.json").catch(() => []),
      loadJson("package-meta.json").catch(() => ({ packages: {} })),
    ]);
    window.__PACKAGE_WDEST_MAP__ = Object.fromEntries((wildlifeDests || []).map((d) => [d.slug, d]));
    const pool = packagePoolForRoot(root, packages);
    const bentoHost = root.querySelector("[data-catalog-bento]");
    const grid = root.querySelector("[data-catalog-grid]");
    const listHost = root.querySelector("[data-catalog-list]");
    const emptyEl = root.querySelector("[data-empty]");
    const countEl = root.querySelector("[data-count]");
    const form = catalogScope(root).querySelector("[data-filters]");
    const syncUrl = root.dataset.syncUrl !== "false" && !listHost?.dataset?.packageTeaserLimit;

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
      window.EndemicUI?.initCardMedia?.(root);
      document.dispatchEvent(new CustomEvent("site:content-rendered"));
    }

    if (form && window.EndemicPackageFilters) {
      window.EndemicPackageFilters.bindPackageFilters(form, {
        getPackages: () => pool,
        getMeta: () => metaDoc,
        defaultInterest: root.dataset.defaultCategory || form.dataset.defaultInterest || "all",
        onResults: renderFiltered,
        emptyEl,
        countEl,
        syncUrl,
      });
    } else {
      let filtered = pool;
      filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      renderFiltered(filtered);
      if (countEl) countEl.textContent = String(filtered.length);
    }
    document.dispatchEvent(new CustomEvent("site:content-rendered"));
  }

  async function initDestinations(root) {
    const grid = root.querySelector("[data-catalog-grid]");
    const emptyEl = root.querySelector("[data-empty]");
    const countEl = root.querySelector("[data-count]");
    const form = catalogScope(root).querySelector("[data-filters]");
    const typeParam =
      getParams().get("type") ||
      root.dataset.destinationsPreset ||
      document.body.dataset.destinationsPreset;

    if (typeParam === "birding" && window.EndemicUI?.renderBirdingDestinationsGrid) {
      document.body.classList.add("destinations-mode-birding");
      const unique = await loadBirdingDestinationSites();

      function renderBirdingList(list) {
        if (!grid) return;
        grid.innerHTML = window.EndemicUI.renderBirdingDestinationsGrid(list, asset);
        grid.className = "";
        if (countEl) countEl.textContent = String(list.length);
        if (emptyEl) {
          emptyEl.hidden = list.length > 0;
          emptyEl.textContent =
            list.length === 0
              ? "No destinations match – try another circuit or reset filters."
              : emptyEl.textContent;
        }
      }

      if (form) {
        form.removeAttribute("hidden");
        const syncUrl = root.dataset.syncUrl === "true";
        const apply = () => {
          const fd = new FormData(form);
          fd.set("interest", "birding");
          if (syncUrl) {
            const params = new URLSearchParams();
            const circuit = fd.get("circuit");
            if (circuit && circuit !== "all") params.set("circuit", circuit);
            const qs = params.toString();
            history.replaceState(null, "", qs ? `${location.pathname}?${qs}` : location.pathname);
          }
          renderBirdingList(unique.filter((s) => filterBirdingSite(s, fd)));
        };
        form.addEventListener("change", apply);
        form.querySelector("[data-clear-filters]")?.addEventListener("click", (e) => {
          e.preventDefault();
          form.reset();
          apply();
        });
        if (syncUrl) {
          const params = getParams();
          if (params.get("circuit")) {
            const sel = form.querySelector('[name="circuit"]');
            if (sel) sel.value = params.get("circuit");
          }
        }
        apply();
      } else {
        renderBirdingList(unique);
      }
      document.dispatchEvent(new CustomEvent("site:content-rendered"));
      return;
    }

    const [destinations, packages] = await Promise.all([loadJson("destinations.json"), loadJson("packages.json")]);

    function renderList(list) {
      if (!grid) return;
      if (window.EndemicUI) {
        grid.innerHTML = window.EndemicUI.renderDestScriptGrid(list, packages, asset);
        grid.className = "";
      }
      if (countEl) countEl.textContent = String(list.length);
      if (emptyEl) emptyEl.hidden = list.length > 0;
    }

    function filterDest(d, fd) {
      const type = fd.get("type") || fd.get("interest") || "all";
      const circuit = fd.get("circuit") || "all";
      if (type !== "all" && !(d.experienceTypes || []).includes(type)) return false;
      if (circuit !== "all" && d.circuit !== circuit) return false;
      return true;
    }

    if (form) {
      const apply = () => {
        const fd = new FormData(form);
        const params = getParams();
        if (params.get("type") && fd.get("type") === "all") fd.set("type", params.get("type"));
        const list = destinations.filter((d) => filterDest(d, fd));
        renderList(list);
        if (root.dataset.syncUrl === "true") {
          const urlParams = new URLSearchParams();
          const type = fd.get("type");
          const circuit = fd.get("circuit");
          if (type && type !== "all") urlParams.set("type", type);
          if (circuit && circuit !== "all") urlParams.set("circuit", circuit);
          const qs = urlParams.toString();
          history.replaceState(null, "", qs ? `${location.pathname}?${qs}` : location.pathname);
        }
      };
      form.addEventListener("change", apply);
      form.querySelector("[data-clear-filters]")?.addEventListener("click", (e) => {
        e.preventDefault();
        form.reset();
        renderList(destinations);
      });
      apply();
    } else {
      renderList(destinations);
    }
    document.dispatchEvent(new CustomEvent("site:content-rendered"));
  }

  roots.forEach((root) => {
    const catalogType = root.dataset.catalog;
    if (catalogType === "packages") initPackages(root).catch(console.error);
    if (catalogType === "destinations") initDestinations(root).catch(console.error);
  });
})();