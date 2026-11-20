(function () {
  let speciesIndex = null;
  let resolveLookup = null;
  let dialogEl = null;
  let lastFocus = null;

  const prefix = window.__ASSET_PREFIX__ || "/";
  const asset = (p) => prefix + String(p).replace(/^\//, "");

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getBySlug(slug) {
    return speciesIndex?.[slug] || null;
  }

  function resolveSlug(commonName, scientificName) {
    if (!resolveLookup) return null;
    const sci = (scientificName || "").trim().toLowerCase();
    if (sci && resolveLookup.byScientificName?.[sci]) return resolveLookup.byScientificName[sci];
    const com = (commonName || "").trim().toLowerCase();
    if (com && resolveLookup.byCommonName?.[com]) return resolveLookup.byCommonName[com];
    return null;
  }

  function categoryLabel(cat, labels) {
    return labels?.[cat] || cat || "Checklist species";
  }

  function titleFromSlug(slug) {
    return String(slug)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function detailRow(label, html) {
    if (!html) return "";
    return `<div class="species-modal__row">
      <dt class="species-modal__label">${escapeHtml(label)}</dt>
      <dd class="species-modal__value">${html}</dd>
    </div>`;
  }

  function mergeMedia(species, mediaBySlug) {
    const pack = mediaBySlug?.[species.slug];
    if (!pack?.images?.length) return species;
    const habitat = (species.images || []).filter((i) => i.imageRole === "habitat");
    const fromFolder = pack.images.map((im) => ({
      ...im,
      imageRole: im.imageRole || "species",
    }));
    return { ...species, images: [...fromFolder, ...habitat] };
  }

  function minimalFromIndex(meta, mediaBySlug) {
    const merged = mergeMedia(
      {
        slug: meta.slug,
        commonName: meta.commonName,
        scientificName: meta.scientificName || "",
        category: "specialist",
        destinationSlugs: meta.destinationSlugs || [],
        overview:
          "Species on our curated destination checklists – timing and chances depend on season, route and habitat on the day.",
        whyItMatters: meta.destinationSlugs?.length
          ? `Featured on field checklists for ${meta.destinationSlugs.length} birding destination${meta.destinationSlugs.length > 1 ? "s" : ""}.`
          : "",
        images: [],
      },
      mediaBySlug
    );
    return { ...merged, _minimal: !meta.inSpecialCatalog };
  }

  function speciesPhotoBlock(sp) {
    const images = (sp.images || []).filter((im) => im.imageRole !== "habitat");
    if (!images.length) return "";
    const hero = images.find((im) => im.primary) || images[0];
    return `<figure class="species-modal__hero">
      <img src="${asset(hero.src)}" alt="${escapeHtml(hero.alt || sp.commonName)}" loading="lazy" decoding="async" />
      ${hero.credit ? `<figcaption>${escapeHtml(hero.credit)}</figcaption>` : ""}
    </figure>`;
  }

  function ensureDialog() {
    if (dialogEl) return dialogEl;
    dialogEl = document.createElement("dialog");
    dialogEl.className = "species-modal";
    dialogEl.id = "species-detail-modal";
    dialogEl.setAttribute("aria-labelledby", "species-modal-title");
    dialogEl.innerHTML = `<div class="species-modal__inner" data-species-modal-inner></div>`;
    document.body.appendChild(dialogEl);
    dialogEl.addEventListener("click", (e) => {
      if (e.target === dialogEl) closeSpeciesModal();
    });
    dialogEl.addEventListener("close", () => {
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
      const url = new URL(location.href);
      url.searchParams.delete("species");
      history.replaceState(null, "", url.pathname + url.search + url.hash);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && dialogEl.open) {
        e.preventDefault();
        closeSpeciesModal();
      }
    });
    return dialogEl;
  }

  function openSpeciesModal(slug, options = {}) {
    const sp = getBySlug(slug);
    if (!sp) return;
    const labels = options.categoryLabels || window.__SPECIAL_BIRDS__?.categoryLabels || {};
    const dlg = ensureDialog();
    const host = dlg.querySelector("[data-species-modal-inner]");
    const destPills = (sp.destinationSlugs || [])
      .slice(0, 6)
      .map(
        (s) =>
          `<a class="species-modal__pill" href="${asset(`destinations/${s}/`)}">${escapeHtml(titleFromSlug(s))}</a>`
      )
      .join("");
    const pkgPills = (sp.packageSlugs || [])
      .slice(0, 3)
      .map(
        (s) =>
          `<a class="species-modal__pill species-modal__pill--pkg" href="${asset(`packages/${s}/`)}">${escapeHtml(titleFromSlug(s))}</a>`
      )
      .join("");

    const viewing =
      sp.viewingContext || "Enquire for realistic timing on your route – no guaranteed sightings.";
    const habitat = sp.habitatDistribution || sp.habitatRegion || "";

    const facts = [
      sp.overview ? detailRow("Overview", escapeHtml(sp.overview)) : "",
      sp.identificationNotes
        ? detailRow("Identification", escapeHtml(sp.identificationNotes))
        : "",
      habitat ? detailRow("Habitat", escapeHtml(habitat)) : "",
      sp._minimal ? "" : detailRow("Viewing", escapeHtml(viewing)),
    ]
      .filter(Boolean)
      .join("");

    const linksBlock =
      destPills || pkgPills
        ? `<div class="species-modal__links">
        ${destPills ? `<div class="species-modal__link-group"><span class="species-modal__link-kicker">Destinations</span><div class="species-modal__pills">${destPills}</div></div>` : ""}
        ${pkgPills ? `<div class="species-modal__link-group"><span class="species-modal__link-kicker">Safaris</span><div class="species-modal__pills">${pkgPills}</div></div>` : ""}
      </div>`
        : "";

    host.innerHTML = `
      <article class="species-modal__card">
        <header class="species-modal__head">
          <p class="species-modal__category">${escapeHtml(categoryLabel(sp.category, labels))}</p>
          <h2 id="species-modal-title" tabindex="-1">${escapeHtml(sp.commonName)}</h2>
          ${sp.scientificName ? `<p class="species-modal__sci"><em>${escapeHtml(sp.scientificName)}</em></p>` : ""}
          <button type="button" class="species-modal__close" data-species-close aria-label="Close">×</button>
        </header>
        ${speciesPhotoBlock(sp)}
        ${sp.whyItMatters ? `<p class="species-modal__lead">${escapeHtml(sp.whyItMatters)}</p>` : ""}
        <dl class="species-modal__facts">${facts}</dl>
        ${linksBlock}
        <footer class="species-modal__foot">
          <a class="btn btn-solid btn-sm species-modal__enquire" href="${asset(`plan-your-trip/index.html?note=${encodeURIComponent(`Interested in ${sp.commonName} on a Tanzania birding safari.`)}`)}">Enquire on this species</a>
        </footer>
      </article>`;

    host.querySelector("[data-species-close]")?.addEventListener("click", closeSpeciesModal);

    lastFocus = document.activeElement;
    if (dlg.showModal) dlg.showModal();
    else dlg.setAttribute("open", "");
    const title = dlg.querySelector("#species-modal-title");
    title?.focus();

    const url = new URL(location.href);
    url.searchParams.set("species", slug);
    history.replaceState(null, "", url.pathname + url.search + url.hash);
  }

  function closeSpeciesModal() {
    if (!dialogEl) return;
    dialogEl.close?.();
    dialogEl.removeAttribute("open");
  }

  async function loadIndex() {
    if (speciesIndex) return speciesIndex;

    const [specialRes, indexRes, mediaRes] = await Promise.all([
      fetch(asset("content/special-birds.json")),
      fetch(asset("content/bird-species-index.json")).catch(() => null),
      fetch(asset("content/bird-species-media.json")).catch(() => null),
    ]);

    const data = await specialRes.json();
    const indexData = indexRes?.ok ? await indexRes.json() : null;
    const mediaData = mediaRes?.ok ? await mediaRes.json() : { bySlug: {} };
    const mediaBySlug = mediaData.bySlug || {};

    const registry = Object.fromEntries(
      (data.species || []).map((s) => [s.slug, mergeMedia({ ...s, _labels: data.categoryLabels }, mediaBySlug)])
    );

    if (indexData?.species) {
      resolveLookup = indexData.lookup || null;
      for (const meta of indexData.species) {
        if (registry[meta.slug]) {
          const existing = registry[meta.slug];
          registry[meta.slug] = {
            ...existing,
            destinationSlugs: [
              ...new Set([...(existing.destinationSlugs || []), ...(meta.destinationSlugs || [])]),
            ],
          };
          registry[meta.slug] = mergeMedia(registry[meta.slug], mediaBySlug);
        } else {
          registry[meta.slug] = minimalFromIndex(meta, mediaBySlug);
        }
      }
    }

    speciesIndex = registry;
    window.__SPECIAL_BIRDS__ = data;
    window.__BIRD_SPECIES_MEDIA__ = mediaBySlug;
    return speciesIndex;
  }

  function initFromUrl() {
    const slug = new URLSearchParams(location.search).get("species");
    if (slug) openSpeciesModal(slug, { categoryLabels: window.__SPECIAL_BIRDS__?.categoryLabels });
  }

  function openFromChecklist(commonName, scientificName) {
    const slug = resolveSlug(commonName, scientificName);
    if (slug) openSpeciesModal(slug, { categoryLabels: window.__SPECIAL_BIRDS__?.categoryLabels });
  }

  window.EndemicSpecies = {
    open: (slug) => openSpeciesModal(slug, { categoryLabels: window.__SPECIAL_BIRDS__?.categoryLabels }),
    openFromChecklist,
    resolveSlug,
    close: closeSpeciesModal,
    load: loadIndex,
    get: getBySlug,
  };

  loadIndex().then(() => {
    initFromUrl();
    document.dispatchEvent(new CustomEvent("endemic:species-ready"));
  });
})();