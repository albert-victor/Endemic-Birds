(function (global) {
  const HUB_SITE_FILES = {
    southern: "southern-sites.json",
    western: "western-sites.json",
    northern: "northern-sites.json",
    "eastern-arc": "southern-sites.json",
    eastern: "southern-sites.json",
    "north-west": "western-sites.json",
  };

  function slugToLabel(slug) {
    return String(slug || "")
      .replace(/-conservation-area$/i, "")
      .replace(/-national-park$/i, " National Park")
      .split("-")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
      .join(" ")
      .trim();
  }

  function parseTitlePlaces(title) {
    const raw = String(title || "").trim();
    if (!raw) return [];
    let tail = raw.replace(/^\d+[\s-]*(?:day|days)\b[\s––:-]*/i, "").trim();
    const dashParts = raw.split(/[––]/);
    if (dashParts.length > 1) {
      tail = dashParts.slice(1).join(" ").trim();
    }
    if (!tail || tail.length < 3) return [];
    if (/^endemic|^birding|^tanzania|^safari/i.test(tail) && !tail.includes(",")) {
      return [];
    }
    return tail
      .split(/\s*,\s*|\s+&\s+|\s+and\s+/i)
      .map((s) => s.replace(/\s+/g, " ").trim())
      .filter((s) => s.length > 2 && !/^(tanzania|safari|birding|wildlife)$/i.test(s));
  }

  function matchSitesInText(text, siteCatalog) {
    if (!text || !siteCatalog?.length) return [];
    const lower = text.toLowerCase();
    const hits = [];
    siteCatalog.forEach((site) => {
      const name = site.name || "";
      const token = name.split(/[\s(/]/)[0];
      if (token.length >= 5 && lower.includes(token.toLowerCase())) {
        hits.push(site);
      }
    });
    return hits;
  }

  function resolvePackageVisits(pkg, ctx = {}) {
    const wDestMap = ctx.wDestMap || {};
    const siteCatalog = ctx.siteCatalog || [];
    const hubSites = ctx.hubSites || {};
    const visits = [];
    const seen = new Set();

    const add = (name, href, kind) => {
      const label = String(name || "").trim();
      if (!label) return;
      const key = label.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      visits.push({ name: label, href: href || null, kind: kind || "place" });
    };

    (pkg.wildlifeDestinations || []).forEach((slug) => {
      const d = wDestMap[slug];
      if (d) {
        add(d.name, `wildlife/destinations/${d.slug}/`, "wildlife");
      } else {
        add(slugToLabel(slug), `wildlife/destinations/${slug}/`, "wildlife");
      }
    });

    (pkg.itinerary || []).forEach((day) => {
      const blob = `${day.title || ""} ${day.description || ""}`;
      matchSitesInText(blob, siteCatalog).forEach((site) => {
        add(site.name, `destinations/${site.slug}/`, "birding");
      });
      matchWildlifeInText(blob, wDestMap).forEach((d) => {
        add(d.name, `wildlife/destinations/${d.slug}/`, "wildlife");
      });
    });

    parseTitlePlaces(pkg.title).forEach((place) => add(place, null, "place"));

    if (!visits.length) {
      (pkg.destinations || []).forEach((hubId) => {
        const sites = hubSites[hubId] || [];
        sites.slice(0, 6).forEach((site) => {
          add(site.name, `destinations/${site.slug}/`, "birding");
        });
      });
    }

    return visits;
  }

  function matchWildlifeInText(text, wDestMap) {
    const lower = text.toLowerCase();
    return Object.values(wDestMap).filter((d) => {
      const n = (d.name || "").toLowerCase();
      const short = n.split(" national")[0];
      return short.length >= 5 && lower.includes(short);
    });
  }

  function formatVisitLine(visits, max = 5) {
    if (!visits?.length) return "";
    const names = visits.map((v) => v.name);
    if (names.length <= max) return names.join(" · ");
    return `${names.slice(0, max).join(" · ")} +${names.length - max} more`;
  }

  async function loadVisitContext(loadJson) {
    const fileToSites = {};
    for (const file of new Set(Object.values(HUB_SITE_FILES))) {
      try {
        const data = await loadJson(file);
        fileToSites[file] = data?.sites || [];
      } catch {
        fileToSites[file] = [];
      }
    }
    const hubSites = {};
    Object.entries(HUB_SITE_FILES).forEach(([hubId, file]) => {
      hubSites[hubId] = fileToSites[file] || [];
    });
    const siteCatalog = Object.values(fileToSites).flat();
    return { hubSites, siteCatalog };
  }

  global.PackageVisits = {
    resolvePackageVisits,
    parseTitlePlaces,
    formatVisitLine,
    loadVisitContext,
    slugToLabel,
  };
})(typeof window !== "undefined" ? window : globalThis);
