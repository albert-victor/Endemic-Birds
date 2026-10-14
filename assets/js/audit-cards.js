(function () {
  const shell = document.querySelector(".audit-shell");
  if (!shell) return;

  const prefix = window.__ASSET_PREFIX__ || "/";
  const asset = (p) => prefix + String(p).replace(/^\//, "");

  async function loadJson(file) {
    const res = await fetch(asset(`content/${file}`));
    if (!res.ok) throw new Error(file);
    return res.json();
  }

  async function loadCircuitSites() {
    const files = ["southern-sites.json", "western-sites.json", "northern-sites.json"];
    const bundles = await Promise.all(files.map((f) => loadJson(f).catch(() => null)));
    return bundles.filter(Boolean);
  }

  function block(tierClass, title, note, inner) {
    return `<div class="audit-tier ${tierClass}">
      <header class="audit-tier__head"><h2>${title}</h2><p>${note}</p></header>
      ${inner}
    </div>`;
  }

  Promise.all([loadJson("packages.json"), loadJson("destinations.json"), loadJson("wildlife-destinations.json"), loadCircuitSites()])
    .then(([packages, circuits, wildlifeDests, siteBundles]) => {
      const UI = window.EndemicUI;
      if (!UI) return;

      const birdingItems = siteBundles.flatMap((b) => {
        const circuit = b.circuitLabel || `${b.circuit} circuit`;
        return (b.sites || []).map((site) => ({ data: site, circuit }));
      });

      const pkgFeatured = packages.filter((p) => p.featured);
      const pkgShow = pkgFeatured.length >= 8 ? pkgFeatured.slice(0, 12) : packages.slice(0, 12);

      const host = document.createElement("div");
      host.innerHTML =
        block(
          "audit-tier--group",
          "Group cards · Registry",
          "Circuits + package catalog tu.",
          `<p class="audit-sub">Circuits (${circuits.length})</p>${UI.renderGroupCircuitGrid(circuits, packages, asset)}
          <p class="audit-sub">Package catalog (${packages.length})</p>${UI.renderGroupPackageGrid(packages, asset)}`
        ) +
        block(
          "audit-tier--individual",
          "Individual destinations · Spotlight",
          "Overlay ya warm taupe/gold (kama inspire band, si nyeusi). Tag, subtitle script, ★★★★★, like na wash nyepesi.",
          `<p class="audit-sub">${birdingItems.length + wildlifeDests.length} destinations</p>
          ${UI.renderIndividualDestSpotGrid(birdingItems, wildlifeDests, asset)}`
        ) +
        block(
          "audit-tier--individual",
          "Individual packages · Long sheet",
          "Container ndefu, tag ya huduma, sentensi moja kutoka summary, like + warm overlay kwenye picha, CTA.",
          `<p class="audit-sub">Sample (${pkgShow.length})</p>${UI.renderIndividualPackageGrid(pkgShow, asset)}`
        );

      const chosen = shell.querySelector(".audit-chosen");
      if (chosen) chosen.after(host);
    })
    .catch(console.error);
})();
