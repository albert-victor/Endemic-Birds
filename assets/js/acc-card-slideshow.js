/**
 * Accommodation card gallery – manual next only (no autoplay, no counters).
 */
(function () {
  /** @type {Map<Element, { urls: string[], index: number, img: HTMLImageElement }>} */
  const states = new Map();

  function parseSlides(el) {
    const raw = el.getAttribute("data-slides");
    if (!raw) return [];
    try {
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list.filter((u) => typeof u === "string" && u.length > 3) : [];
    } catch {
      return [];
    }
  }

  function setIndex(state, index) {
    const i = ((index % state.urls.length) + state.urls.length) % state.urls.length;
    state.index = i;
    state.img.src = state.urls[i];
  }

  function bindGallery(el) {
    if (el.dataset.galleryBound === "1") return;
    const urls = parseSlides(el);
    if (urls.length < 2) return;

    const img = el.querySelector("[data-acc-gallery-img]");
    const nextBtn = el.querySelector("[data-acc-gallery-next]");
    if (!img || !nextBtn) return;

    el.dataset.galleryBound = "1";
    states.set(el, { urls, index: 0, img });

    if (img.src !== urls[0]) img.src = urls[0];

    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const state = states.get(el);
      if (!state) return;
      setIndex(state, state.index + 1);
    });
  }

  function teardown() {
    states.clear();
    document.querySelectorAll("[data-acc-gallery]").forEach((el) => {
      delete el.dataset.galleryBound;
    });
  }

  function init(scope) {
    const root = scope && scope.querySelectorAll ? scope : document;
    root.querySelectorAll("[data-acc-gallery]").forEach(bindGallery);
  }

  function boot(scope) {
    teardown();
    init(scope || document);
  }

  document.addEventListener("site:content-rendered", () => boot(document));

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => boot(document));
  } else {
    boot(document);
  }
})();