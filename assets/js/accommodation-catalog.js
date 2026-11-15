(function () {
  const root = document.querySelector("[data-accommodation-catalog]");
  if (!root) return;

  const prefix = window.__ASSET_PREFIX__ || "/";
  const asset = (p) => prefix + p.replace(/^\//, "");
  const grid = root.querySelector("[data-accommodation-grid]");
  const emptyEl = root.querySelector("[data-empty]");
  const countEl = root.querySelector("[data-count]");
  const planningHost = document.querySelector("[data-accommodation-planning]");

  const COMFORT_LABELS = {
    budget: "Budget",
    "mid-range": "Mid-range",
    luxury: "Luxury",
  };

  const TYPE_LABELS = {
    lodge: "Lodge",
    "tented-camp": "Tented camp",
    campsite: "Campsite",
    villa: "Villa",
    "bush-retreat": "Bush retreat",
  };

  function getParams() {
    return new URLSearchParams(location.search);
  }

  async function loadJson(file) {
    const res = await fetch(asset(`content/${file}`));
    return res.json();
  }

  function filterItem(item, fd) {
    if (!item.verified) return false;
    const circuit = fd.get("circuit") || "all";
    const comfort = fd.get("comfort") || "all";
    const propertyType = fd.get("propertyType") || "all";
    if (circuit !== "all" && item.circuit !== circuit) return false;
    if (comfort !== "all") {
      if (!item.comfortLevel) return false;
      if (item.comfortLevel !== comfort) return false;
    }
    if (propertyType !== "all" && item.propertyType !== propertyType) return false;
    return true;
  }

  function renderPlanning(planning) {
    if (!planningHost || !planning) return;
    const points = (planning.points || [])
      .map((p) => `<li>${String(p).replace(/&/g, "&amp;").replace(/</g, "&lt;")}</li>`)
      .join("");
    const ctas = (planning.ctas || [])
      .map(
        (c) =>
          `<a class="btn btn-outline" href="${asset(c.href)}">${String(c.label).replace(/&/g, "&amp;")}</a>`
      )
      .join("");
    planningHost.innerHTML = `<div class="accommodation-planning reveal" data-reveal>
      <h2 class="section-title">${planning.title}</h2>
      <p class="section-lead">${planning.lead}</p>
      <ul class="accommodation-planning__list">${points}</ul>
      <div class="accommodation-planning__ctas">${ctas}</div>
    </div>`;
  }

  function syncUrl(form) {
    const fd = new FormData(form);
    const params = new URLSearchParams();
    for (const key of ["circuit", "comfort", "propertyType"]) {
      const v = fd.get(key);
      if (v && v !== "all") params.set(key, v);
    }
    const qs = params.toString();
    history.replaceState(null, "", qs ? `${location.pathname}?${qs}` : location.pathname);
  }

  function bindFilters(items, render) {
    const form = document.querySelector("[data-accommodation-filters]");
    if (!form) {
      render(items);
      return;
    }

    const statusEl = document.querySelector("[data-filter-status]");

    function apply() {
      const fd = new FormData(form);
      const list = items.filter((item) => filterItem(item, fd));
      render(list);
      if (countEl) countEl.textContent = String(list.length);
      if (emptyEl) emptyEl.hidden = list.length > 0;
      syncUrl(form);

      if (statusEl) {
        const bits = [];
        const circuit = fd.get("circuit");
        const comfort = fd.get("comfort");
        const propertyType = fd.get("propertyType");
        if (circuit && circuit !== "all") bits.push(circuit);
        if (comfort && comfort !== "all") {
          bits.push(COMFORT_LABELS[comfort] || comfort);
        }
        if (propertyType && propertyType !== "all") {
          bits.push(TYPE_LABELS[propertyType] || propertyType);
        }
        statusEl.textContent = bits.length
          ? `Showing ${list.length} stays · ${bits.join(" · ")}`
          : `${list.length} safari stays – use filters to narrow the list`;
      }
    }

    form.addEventListener("change", apply);
    form.addEventListener("input", apply);
    form.querySelectorAll("select").forEach((sel) => {
      sel.addEventListener("change", apply);
    });
    form.querySelector("[data-clear-filters]")?.addEventListener("click", (e) => {
      e.preventDefault();
      form.reset();
      apply();
    });

    const params = getParams();
    for (const key of ["circuit", "comfort", "propertyType"]) {
      const v = params.get(key);
      if (!v) continue;
      const el = form.elements.namedItem(key);
      if (el && "value" in el) el.value = v;
    }
    apply();
  }

  Promise.all([loadJson("accommodations.json"), loadJson("accommodation-galleries.json").catch(() => ({ galleries: {} }))])
    .then(([data, galleryData]) => {
      const items = (data.accommodations || []).filter((a) => a.verified);
      const galleries = galleryData.galleries || {};
      renderPlanning(data.planning);

      function render(list) {
        if (!window.EndemicUI?.renderAccommodationGrid) return;
        grid.innerHTML = window.EndemicUI.renderAccommodationGrid(list, asset, {
          comfortLabels: COMFORT_LABELS,
          typeLabels: TYPE_LABELS,
        }, galleries);
        root.classList.toggle("is-filtered", list.length !== items.length);
        document.dispatchEvent(new CustomEvent("site:content-rendered"));
      }

      bindFilters(items, render);
      document.dispatchEvent(new CustomEvent("site:content-rendered"));
    })
    .catch(console.error);
})();