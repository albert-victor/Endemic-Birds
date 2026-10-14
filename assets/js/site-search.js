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

  async function buildIndex() {
    const [packages, destinations, wildlifeDest, wildlifeAct, southern, western, northern] = await Promise.all([
      fetchJson("content/packages.json"),
      fetchJson("content/destinations.json"),
      fetchJson("content/wildlife-destinations.json"),
      fetchJson("content/wildlife-activities.json"),
      fetchJson("content/southern-sites.json"),
      fetchJson("content/western-sites.json"),
      fetchJson("content/northern-sites.json"),
    ]);

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

    for (const blob of [southern, western, northern]) {
      const circuit = blob?.circuit || "";
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
        if (input && !input.value.trim()) renderDefaultHints();
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
      ul.innerHTML = `${hintHtml}<li class="site-search-empty">No matches – try “Serengeti”, “endemic”, or “Ruaha”.</li>`;
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
        renderDefaultHints();
        return;
      }
      if (q.length < 1) return;
      renderResults(search(q));
    });
  }

  function renderDefaultHints() {
    ensureIndex().then(() => {
      const picks = defaultSuggestions(8);
      const hint = picks.length
        ? `<li class="site-search-hint">Popular journeys &amp; places – keep typing for more</li>`
        : `<li class="site-search-hint">Start typing to search all packages and destinations</li>`;
      renderResults(picks, hint);
    });
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
      if (!input.value.trim()) renderDefaultHints();
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
