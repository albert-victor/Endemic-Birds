(function () {
  const mount = document.querySelector("[data-birding-destinations]");
  if (!mount) return;

  const prefix = window.__ASSET_PREFIX__ || "/";
  const asset = (p) => prefix + String(p).replace(/^\//, "");

  async function loadJson(file) {
    const res = await fetch(asset(`content/${file}`));
    if (!res.ok) throw new Error(file);
    return res.json();
  }

  const limit = Number(mount.dataset.birdingDestLimit) || 0;

  const loadSites = window.EndemicBirdingDests?.loadBirdingDestinationSites;
  if (!loadSites || !window.EndemicUI?.renderBirdingDestinationsGrid) return;

  loadSites()
    .then((sites) => {
      let list = sites;
      if (limit > 0) list = sites.slice(0, limit);
      mount.innerHTML = window.EndemicUI.renderBirdingDestinationsGrid(list, asset);
      document.dispatchEvent(new CustomEvent("site:content-rendered"));
    })
    .catch(console.error);
})();
