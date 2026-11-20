(function () {
  const PREFIX = "../../";
  const LIKE_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.1 21.35l-1.1-1.02C5.14 15.24 2 12.36 2 8.98 2 6.02 4.24 3.78 7.2 3.78c1.68 0 3.29.79 4.3 2.05.42.52 1 .52 1.42 0 1.01-1.26 2.62-2.05 4.3-2.05 2.96 0 5.2 2.24 5.2 5.2 0 3.38-3.14 6.26-8.9 11.35l-1.32 1.22z"/></svg>`;

  const PLATE_TAGLINES = {
    "serengeti-national-park": "The legendary plains of the Great Migration",
    "ruaha-national-park": "Raw wilderness in southern Tanzania",
    "tarangire-national-park": "Land of giants and ancient baobabs",
    "ngorongoro-conservation-area": "Volcanic cradle of African wildlife",
  };

  const BIRDING_KIND_LABELS = {
    "national-park": "National park",
    "forest-reserve": "Forest reserve",
    "conservation-area": "Conservation area",
    forest: "Forest site",
    mountain: "Mountain site",
    island: "Island site",
  };

  function asset(path) {
    if (!path) return "";
    return `${PREFIX}${String(path).replace(/^\//, "")}`;
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function plateTagline(item, kind) {
    if (item.tagline) return item.tagline;
    const fromMap = PLATE_TAGLINES[item.slug];
    if (fromMap) return fromMap;
    const highlight = item.wildlifeHighlights?.[0] || item.birdingNotes;
    if (highlight) {
      const t = String(highlight).trim();
      return t.length > 78 ? `${t.slice(0, 75)}…` : t;
    }
    const summary = String(item.summary || "").trim();
    if (summary) return summary.length > 78 ? `${summary.slice(0, 75)}…` : summary;
    return kind === "birding" ? "Specialist birding in Tanzania" : "Explore with Endemic Birds";
  }

  function destinationTypeLabel(item, kind) {
    if (kind === "wildlife") {
      const name = String(item.name || "");
      if (/conservation/i.test(name)) return "Conservation area";
      if (/national park/i.test(name)) return "Safari";
      if (/game reserve/i.test(name)) return "Game reserve";
      return "Wildlife park";
    }
    if (kind === "birding") {
      if (item.siteKind && BIRDING_KIND_LABELS[item.siteKind]) return BIRDING_KIND_LABELS[item.siteKind];
      if (/forest/i.test(item.name)) return "Forest site";
      if (/mountain/i.test(item.name)) return "Mountain site";
      return "Birding site";
    }
    if (kind === "circuit") {
      const types = item.experienceTypes || [];
      const hasBird = types.includes("birding");
      const hasWild = types.includes("wildlife");
      if (hasBird && hasWild) return "Birding · Safari";
      if (hasBird) return "Birding circuit";
      if (hasWild) return "Safari circuit";
      return "Circuit";
    }
    return "Destination";
  }

  function titleUpper(name) {
    return String(name || "")
      .replace(/\s+Destination$/i, "")
      .trim()
      .toUpperCase();
  }

  function renderPlateCard({ href, imgSrc, tag, script, title, alt = "" }) {
    return `<a class="dest-plate-card" href="${href}">
      <div class="dest-plate-card__media">
        <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(alt || title)}" loading="lazy" decoding="async" />
      </div>
      <span class="dest-plate-card__tag">${escapeHtml(tag)}</span>
      <span class="dest-plate-card__like" aria-hidden="true">${LIKE_SVG}</span>
      <div class="dest-plate-card__panel">
        <p class="dest-plate-card__script">${escapeHtml(script)}</p>
        <h3 class="dest-plate-card__name">${escapeHtml(titleUpper(title))}</h3>
        <span class="dest-plate-card__cta">Explore destination <span aria-hidden="true">→</span></span>
      </div>
    </a>`;
  }

  function renderWildlifeCard(d) {
    return renderPlateCard({
      href: asset(`wildlife/destinations/${d.slug}/`),
      imgSrc: asset(d.heroImage),
      tag: destinationTypeLabel(d, "wildlife"),
      script: plateTagline(d, "wildlife"),
      title: d.name,
    });
  }

  function renderBirdingCard(site) {
    const hero = site.heroImage || site.thumbnail;
    return renderPlateCard({
      href: asset(`destinations/${site.slug}/`),
      imgSrc: asset(hero),
      tag: destinationTypeLabel(site, "birding"),
      script: plateTagline(site, "birding"),
      title: site.name,
    });
  }

  function renderCircuitCard(d) {
    const thumb = d.thumbnail || d.heroImage;
    return renderPlateCard({
      href: asset(`destinations/${d.slug}/`),
      imgSrc: asset(thumb),
      tag: destinationTypeLabel(d, "circuit"),
      script: plateTagline(d, "circuit"),
      title: d.name,
    });
  }

  async function loadJson(file) {
    const res = await fetch(asset(`content/${file}`));
    if (!res.ok) throw new Error(file);
    return res.json();
  }

  async function boot() {
    const wildlifeHost = document.querySelector("[data-plate-wildlife]");
    const birdingHost = document.querySelector("[data-plate-birding]");
    const circuitHost = document.querySelector("[data-plate-circuits]");
    const err = document.querySelector("[data-plate-error]");

    try {
      const [wildlife, southern, destinations] = await Promise.all([
        loadJson("wildlife-destinations.json"),
        loadJson("southern-sites.json"),
        loadJson("destinations.json"),
      ]);

      const showcaseSlugs = new Set([
        "serengeti-national-park",
        "ruaha-national-park",
        "tarangire-national-park",
        "ngorongoro-conservation-area",
      ]);
      const showcase = wildlife.filter((d) => showcaseSlugs.has(d.slug));

      wildlifeHost.innerHTML = showcase.map(renderWildlifeCard).join("");

      const birdingSites = (southern.sites || []).slice(0, 4);
      birdingHost.innerHTML = birdingSites.map(renderBirdingCard).join("");

      const circuits = (destinations || []).slice(0, 4);
      circuitHost.innerHTML = circuits.map(renderCircuitCard).join("");
    } catch (e) {
      console.error(e);
      if (err) {
        err.hidden = false;
        err.textContent =
          "Could not load live JSON – open this page via npm start (http://localhost:3000/demo/destination-cards/).";
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.DestPlateCardDemo = {
    destinationTypeLabel,
    plateTagline,
    renderPlateCard,
  };
})();