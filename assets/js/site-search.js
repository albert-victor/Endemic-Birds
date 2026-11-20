(function () {
  const prefix = () => window.__ASSET_PREFIX__ || "/";
  const asset = (p) => prefix() + p.replace(/^\//, "");

  let index = null;
  let loadPromise = null;

  function normalize(str) {
    return String(str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "");
  }

  function tokens(q) {
    return normalize(q).split(/\s+/).filter(Boolean);
  }

  function scoreItem(item, toks) {
    const hay = normalize([item.title, item.summary, item.type, item.keywords].filter(Boolean).join(" "));
    if (!toks.length) return 0;
    let score = 0;
    for (const t of toks) {
      if (hay.includes(t)) score += t.length > 3 ? 3 : 2;
      if (item.title && normalize(item.title).startsWith(t)) score += 4;
    }
    return score;
  }

  async function fetchJson(path) {
    try {
      const res = await fetch(asset(path));
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  function titleFromSlug(slug) {
    return String(slug || "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function formatChecklistDestinations(slugs, nameBySlug, maxShown = 4) {
    if (!slugs?.length) return "On our destination field checklists.";
    const names = slugs.map((s) => nameBySlug.get(s) || titleFromSlug(s));
    const visible = names.slice(0, maxShown);
    const tail =
      names.length > maxShown ? ` and ${names.length - maxShown} more site${names.length - maxShown > 1 ? "s" : ""}` : "";
    return `Checklisted at ${visible.join(", ")}${tail}. Planning reference only – not live records.`;
  }

  async function buildIndex() {
    const [
      packages,
      destinations,
      wildlifeDest,
      wildlifeAct,
      southern,
      western,
      northern,
      birdingExtra,
      birdIndex,
      specialBirds,
    ] = await Promise.all([
      fetchJson("content/packages.json"),
      fetchJson("content/destinations.json"),
      fetchJson("content/wildlife-destinations.json"),
      fetchJson("content/wildlife-activities.json"),
      fetchJson("content/southern-sites.json"),
      fetchJson("content/western-sites.json"),
      fetchJson("content/northern-sites.json"),
      fetchJson("content/birding-sites-extra.json"),
      fetchJson("content/bird-species-index.json"),
      fetchJson("content/special-birds.json"),
    ]);

    const destNameBySlug = new Map();
    for (const blob of [southern, western, northern, birdingExtra]) {
      (blob?.sites || []).forEach((s) => {
        if (s.slug && s.name) destNameBySlug.set(s.slug, s.name);
      });
    }

    const items = [];

    (packages || []).forEach((p) => {
      const itinText = (p.itinerary || []).map((d) => `${d.title} ${d.description || ""}`).join(" ");
      items.push({
        title: p.title,
        summary: p.summary,
        type: "Safari package",
        href: asset(`packages/${p.slug}/index.html`),
        keywords: [p.category, p.slug, ...(p.circuits || []), ...(p.destinations || []), itinText].join(" "),
      });
    });

    (destinations || []).forEach((d) => {
      items.push({
        title: d.name,
        summary: d.summary,
        type: "Birding circuit",
        href: asset(`destinations/${d.slug}/index.html`),
        keywords: [d.circuit, d.id, d.location, d.birdingNotes].filter(Boolean).join(" "),
      });
    });

    for (const blob of [southern, western, northern, birdingExtra]) {
      const circuit = blob?.circuit || blob?.circuitLabel || "";
      (blob?.sites || []).forEach((s) => {
        items.push({
          title: s.name,
          summary: s.summary,
          type: "Birding site",
          href: asset(`destinations/${s.slug}/index.html`),
          keywords: [circuit, ...(s.keySpecies || []), s.location].filter(Boolean).join(" "),
        });
      });
    }

    const indexedSlugs = new Set();
    (birdIndex?.species || []).forEach((sp) => {
      if (!sp.commonName) return;
      indexedSlugs.add(sp.slug);
      const destSlugs = sp.destinationSlugs || [];
      const summary = formatChecklistDestinations(destSlugs, destNameBySlug);
      const primaryDest = destSlugs[0];
      const href = sp.inSpecialCatalog
        ? asset(`birding/special-birds/index.html?species=${encodeURIComponent(sp.slug)}`)
        : primaryDest
          ? asset(`destinations/${primaryDest}/index.html#listed-species`)
          : asset("birding/special-birds/index.html");
      const destKeywords = destSlugs.flatMap((s) => [s, destNameBySlug.get(s)]).filter(Boolean);
      items.push({
        title: sp.commonName,
        summary,
        type: "Bird species",
        href,
        keywords: [sp.commonName, sp.scientificName, sp.slug, ...destKeywords, ...(sp.sourceLabels || [])]
          .filter(Boolean)
          .join(" "),
      });
    });

    (specialBirds?.species || []).forEach((sp) => {
      if (!sp.commonName || indexedSlugs.has(sp.slug)) return;
      const destSlugs = sp.destinationSlugs || [];
      const routeHint = destSlugs.length
        ? ` ${formatChecklistDestinations(destSlugs, destNameBySlug, 3)}`
        : "";
      items.push({
        title: sp.commonName,
        summary: `${sp.whyItMatters || "Featured in our special birds catalogue."}${routeHint}`,
        type: "Bird species",
        href: asset(`birding/special-birds/index.html?species=${encodeURIComponent(sp.slug)}`),
        keywords: [sp.commonName, sp.scientificName, sp.slug, ...destSlugs].filter(Boolean).join(" "),
      });
    });

    (wildlifeDest || []).forEach((d) => {
      items.push({
        title: d.name,
        summary: d.overview || d.summary,
        type: "Wildlife park",
        href: asset(`wildlife/destinations/${d.slug}/index.html`),
        keywords: [d.slug, "wildlife safari", d.region].filter(Boolean).join(" "),
      });
    });

    (wildlifeAct || []).forEach((a) => {
      items.push({
        title: a.name,
        summary: a.overview || a.summary,
        type: "Safari experience",
        href: asset(`wildlife/activities/${a.slug}/index.html`),
        keywords: "wildlife",
      });
    });

    [
      { title: "Birding safaris", href: "birding/index.html", type: "Hub", summary: "Specialist birding routes" },
      { title: "Wildlife safaris", href: "wildlife/index.html", type: "Hub", summary: "National parks and plains" },
      { title: "All packages", href: "packages/index.html", type: "Hub", summary: "Curated itineraries" },
      { title: "Plan your trip", href: "plan-your-trip/index.html", type: "Enquiry", summary: "Book a tailor-made safari" },
      { title: "About Us", href: "about/index.html", type: "About", summary: "Southern Tanzania birding company based in Iringa" },
      { title: "Why Choose Us", href: "about/why-choose-us/index.html", type: "About", summary: "Private guiding and how a trip is run" },
      { title: "Our Team", href: "about/team/index.html", type: "About", summary: "Who is in the field with you" },
      {
        title: "Leons J. Mlawila",
        href: "about/leons-mlawila/index.html",
        type: "About",
        summary: "Tanzania birding guide – documented field chronology",
      },
      { title: "Trip Reports", href: "about/trip-reports/index.html", type: "About", summary: "Owner-approved field reports – sample packages listed separately" },
      { title: "Gallery", href: "about/gallery/index.html", type: "About", summary: "Safari, habitat and birding photography from our routes" },
      { title: "Tour Training", href: "about/tour-training/index.html", type: "About", summary: "Enquiry-led guide and operator familiarisation" },
      { title: "Our Partners", href: "about/partners/index.html", type: "About", summary: "Verified commercial partners only" },
      { title: "Terms and policies", href: "about/policies/index.html", type: "About", summary: "Privacy and how bookings are agreed" },
      { title: "Tour calendar", href: "about/tour-calendar/index.html", type: "About", summary: "Seasonal planning for forests, miombo and plains" },
      {
        title: "Special birds",
        href: "birding/special-birds/index.html",
        type: "Birding",
        summary: "Specialty checklist species – highlights from our field lists",
      },
    ].forEach((h) => items.push({ ...h, href: asset(h.href), keywords: h.title }));

    return items;
  }

  function ensureIndex() {
    if (!loadPromise) {
      loadPromise = buildIndex().then((data) => {
        index = data;
        return data;
      });
    }
    return loadPromise;
  }

  function search(q, limit = 10) {
    if (!index) return [];
    const toks = tokens(q);
    if (!toks.length) return defaultSuggestions(limit);
    return index
      .map((item) => ({ item, score: scoreItem(item, toks) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => x.item);
  }

  function defaultSuggestions(limit = 8) {
    if (!index?.length) return [];
    const picks = [];
    const want = (type, n) => {
      index.filter((i) => i.type === type).slice(0, n).forEach((i) => picks.push(i));
    };
    want("Safari package", 4);
    want("Wildlife park", 2);
    want("Birding site", 2);
    return picks.slice(0, limit);
  }

  function getShell() {
    return document.getElementById("site-search");
  }

  function openSearch() {
    const shell = getShell();
    if (!shell) return;
    shell.classList.add("is-open");
    shell.setAttribute("aria-hidden", "false");
    document.body.classList.add("site-search-open");
    const input = shell.querySelector("[data-site-search-input]");
    ensureIndex().then(() => {
      requestAnimationFrame(() => {
        input?.focus();
        if (input && !input.value.trim()) renderIdleSearch();
      });
    });
  }

  function closeSearch() {
    const shell = getShell();
    if (!shell) return;
    shell.classList.remove("is-open");
    shell.setAttribute("aria-hidden", "true");
    document.body.classList.remove("site-search-open");
  }

  function renderResults(list, hintHtml = "") {
    const ul = getShell()?.querySelector("[data-site-search-results]");
    if (!ul) return;
    if (!list.length) {
      ul.innerHTML = `${hintHtml}<li class="site-search-empty">No matches – try a bird name, “Serengeti”, or “Ruaha”.</li>`;
      return;
    }
    ul.innerHTML =
      hintHtml +
      list
        .map(
          (r) => `<li><a href="${r.href}">
          <span class="site-search-type">${escapeHtml(r.type)}</span>
          <span class="site-search-title">${escapeHtml(r.title)}</span>
          <span class="site-search-summary">${escapeHtml(String(r.summary || "").slice(0, 90))}${r.summary && r.summary.length > 90 ? "…" : ""}</span>
        </a></li>`
        )
        .join("");
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function runQuery(input) {
    const q = input.value.trim();
    ensureIndex().then(() => {
      if (!q.length) {
        renderIdleSearch();
        return;
      }
      if (q.length < 1) return;
      renderResults(search(q));
    });
  }

  function renderIdleSearch() {
    const ul = getShell()?.querySelector("[data-site-search-results]");
    if (!ul) return;
    ul.innerHTML = `<li class="site-search-hint site-search-hint--idle">Search birds, parks, or packages – bird results show checklist destinations, not sightings.</li>`;
  }

  function bindSearchShell() {
    const shell = getShell();
    if (!shell || shell.dataset.bound) return;
    shell.dataset.bound = "true";

    const input = shell.querySelector("[data-site-search-input]");
    const backdrop = shell.querySelector("[data-site-search-backdrop]");
    let timer;

    shell.querySelector("[data-site-search-close]")?.addEventListener("click", closeSearch);
    backdrop?.addEventListener("click", closeSearch);

    input?.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => runQuery(input), 70);
    });

    input?.addEventListener("focus", () => {
      if (!input.value.trim()) renderIdleSearch();
    });
  }

  function bindSearchGlobals() {
    if (document.documentElement.dataset.searchGlobalsBound) return;
    document.documentElement.dataset.searchGlobalsBound = "true";

    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-site-search-open]")) {
        e.preventDefault();
        openSearch();
      }
    });

    document.addEventListener("keydown", (e) => {
      const shell = getShell();
      if (e.key === "Escape" && shell?.classList.contains("is-open")) closeSearch();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
    });
  }

  function initSearch() {
    bindSearchGlobals();
    bindSearchShell();
    ensureIndex();
  }

  document.addEventListener("site:layout-ready", initSearch);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSearch);
  } else {
    initSearch();
  }

  window.EndemicSearch = { search, ensureIndex, openSearch, closeSearch, initSearch };
})();
