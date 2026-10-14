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

  Promise.all([loadJson("destinations.json"), loadJson("packages.json")])
    .then(([destinations, packages]) => {
      const birding = destinations.filter((d) => (d.experienceTypes || []).includes("birding"));
      if (window.EndemicUI?.renderDestScriptGrid) {
        mount.innerHTML = window.EndemicUI.renderDestScriptGrid(birding, packages, asset);
      }
      document.dispatchEvent(new CustomEvent("site:content-rendered"));
    })
    .catch(console.error);
})();
