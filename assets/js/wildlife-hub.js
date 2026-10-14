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

  Promise.all([loadJson("wildlife-destinations.json"), loadJson("wildlife-activities.json")])
    .then(([destinations, activities]) => {
      if (destMount && window.EndemicUI) {
        destMount.innerHTML = window.EndemicUI.renderWildlifeDestGrid(destinations, asset);
      }
      if (actMount && window.EndemicUI) {
        actMount.innerHTML = window.EndemicUI.renderWildlifeActivityGrid(activities, asset);
      }
      document.dispatchEvent(new CustomEvent("site:content-rendered"));
    })
    .catch(console.error);
})();
