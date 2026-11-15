(function () {
  const destMount = document.querySelector("[data-wildlife-destinations]");
  const actMount = document.querySelector("[data-wildlife-activities]");
  if (!destMount && !actMount) return;

  const prefix = window.__ASSET_PREFIX__ || "/";
  const asset = (p) => prefix + p.replace(/^\//, "");

  async function loadJson(file) {
    const res = await fetch(asset(`content/${file}`));
    if (!res.ok) throw new Error(file);
    return res.json();
  }

  Promise.all([
    loadJson("wildlife-destinations.json"),
    loadJson("wildlife-activities.json"),
    loadJson("wildlife-hub.json").catch(() => ({})),
  ])
    .then(([destinations, activities, hub]) => {
      if (destMount && window.EndemicUI) {
        destMount.innerHTML = window.EndemicUI.renderWildlifeDestGrid(destinations, asset);
      }
      if (actMount && window.EndemicUI) {
        const intro = hub.activitiesIntro;
        const introHtml = intro
          ? `<header class="wildlife-act-intro reveal" data-reveal>
              <p class="eyebrow">${String(intro.eyebrow || "").replace(/&/g, "&amp;")}</p>
              <h3 class="section-title wildlife-act-intro__title">${String(intro.title || "").replace(/&/g, "&amp;")}</h3>
              <p class="section-lead">${String(intro.lead || "").replace(/&/g, "&amp;")}</p>
              ${intro.note ? `<p class="meta-line">${String(intro.note).replace(/&/g, "&amp;")}</p>` : ""}
            </header>`
          : "";
        const grid =
          window.EndemicUI.renderWildlifeThemeGrid?.(activities, asset) ||
          window.EndemicUI.renderWildlifeActivityGrid(activities, asset);
        actMount.innerHTML = introHtml + grid;
      }
      document.dispatchEvent(new CustomEvent("site:content-rendered"));
    })
    .catch(console.error);
})();
