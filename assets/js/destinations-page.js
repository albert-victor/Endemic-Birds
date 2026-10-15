(function () {
  if (!document.body.hasAttribute("data-destinations-page")) return;

  const params = new URLSearchParams(location.search);
  const type = params.get("type") || document.body.dataset.destinationsPreset;
  const prefix = window.__ASSET_PREFIX__ || "/";
  const asset = (p) => prefix + String(p).replace(/^\//, "");

  if (type === "birding") {
    document.body.classList.add("destinations-mode-birding");
    const title = document.querySelector("[data-dest-title]");
    const lead = document.querySelector("[data-dest-lead]");
    if (title) title.textContent = "Birding destinations";
    if (lead) {
      lead.textContent = "Every park and forest site we bird in Tanzania – pick a destination to open its field notes and linked safaris.";
    }
    document.querySelector("[data-filters]")?.setAttribute("hidden", "");
    document.querySelector("[data-destinations-packages]")?.setAttribute("hidden", "");
  }

  const pkgSection = document.querySelector("[data-destinations-packages]");
  const pkgRow = document.querySelector("[data-destinations-package-row]");
  if (type === "birding" || !pkgSection || !pkgRow) return;

  fetch(asset("content/packages.json"))
    .then((r) => r.json())
    .then((packages) => {
      let list = packages;
      if (type === "birding") list = packages.filter((p) => p.category === "birding");
      else if (type === "wildlife") list = packages.filter((p) => p.category === "wildlife");
      list = list.filter((p) => p.featured).slice(0, 4);
      if (!list.length) list = packages.slice(0, 4);
      if (!window.EndemicUI?.renderPackageCorpGrid) return;
      pkgRow.innerHTML = window.EndemicUI.renderPackageCorpGrid(list, asset);
      pkgSection.hidden = false;
      document.dispatchEvent(new CustomEvent("site:content-rendered"));
    })
    .catch(console.error);
})();
