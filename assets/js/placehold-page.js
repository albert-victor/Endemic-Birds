/**
 * Editorial placeholder for empty mains, missing slugs, and soft 404s.
 * Preview: demo/placehold-page.html
 */
(function () {
  const prefix = window.__ASSET_PREFIX__ || "/";
  const asset = (p) => (p.startsWith("http") ? p : prefix + p.replace(/^\//, ""));

  const DEFAULT_PHOTO = {
    src: "endemics/slideshow-main.jpg",
    alt: "Malachite kingfisher, Tanzania birding",
    position: "72% 42%",
  };

  const VARIANTS = {
    preparing: {
      eyebrow: "New routes & pages · In preparation",
      title: "This page is still <em>taking shape</em>",
      lead:
        "We are building this part of the site – field notes, lodges and the detail you need before you travel. The wild is patient; so are we.",
    },
    "not-found": {
      eyebrow: "Path not found",
      title: "We have not <em>mapped this stop</em> yet",
      lead:
        "The link may be old or this journey is still being written up. Nothing is wrong on your side – we are simply not ready to show this page yet.",
    },
    empty: {
      eyebrow: "Section in curation",
      title: "Content for this <em>chapter</em> is on the way",
      lead:
        "Some stories stay offline until they are checked against the season, permits and how we guide in the field.",
    },
  };

  function renderPlacehold(variant = "preparing", options = {}) {
    const v = VARIANTS[variant] || VARIANTS.preparing;
    const photo = { ...DEFAULT_PHOTO, ...options.photo };
    const imgSrc = asset(photo.src);

    return `<section class="placehold-page placehold-page--splash reveal-fade-up is-visible" data-placehold-variant="${variant}" aria-labelledby="placehold-title">
      <div class="placehold-page__bg" aria-hidden="true">
        <img class="placehold-page__photo" src="${imgSrc}" alt="" width="1920" height="1080" decoding="async" style="object-position: ${photo.position}" />
        <div class="placehold-page__scrim"></div>
        <div class="placehold-page__vignette"></div>
      </div>
      <div class="placehold-page__inner">
        <p class="placehold-page__code" aria-hidden="true">404</p>
        <p class="placehold-page__eyebrow">${v.eyebrow}</p>
        <h1 class="placehold-page__title" id="placehold-title">${v.title}</h1>
        <p class="placehold-page__lead">${v.lead}</p>
        <div class="placehold-page__actions">
          <a class="btn btn-solid placehold-page__btn-primary" href="${asset("plan-your-trip/index.html")}">Start a safari enquiry</a>
          <a class="btn btn-ghost placehold-page__btn-secondary" href="${asset("index.html")}">Back to home</a>
          <a class="btn btn-ghost placehold-page__btn-secondary" href="https://wa.me/255627013348" rel="noopener noreferrer">WhatsApp Leons</a>
        </div>
      </div>
    </section>`;
  }

  function mount(mainEl, variant) {
    if (!mainEl) return;
    document.body.classList.add("has-placehold-splash");
    mainEl.innerHTML = renderPlacehold(variant);
    document.title = "Page in preparation | Endemic Birds Tanzania";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "This page is being prepared. Enquire for tailor-made birding and wildlife safaris in Tanzania."
      );
    }
  }

  function ensureLoaded() {
    if (window.EndemicPlacehold?.mount) return Promise.resolve();
    const prefix = window.__ASSET_PREFIX__ || "/";
    const a = (p) => (p.startsWith("http") ? p : prefix + p.replace(/^\//, ""));

    if (!document.querySelector('link[href*="placehold-page.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = a("assets/css/placehold-page.css");
      document.head.appendChild(link);
    }

    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src*="placehold-page.js"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("placehold-page.js failed")), { once: true });
        if (window.EndemicPlacehold?.mount) resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = a("assets/js/placehold-page.js");
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("placehold-page.js failed"));
      document.head.appendChild(script);
    });
  }

  window.EndemicPlacehold = {
    VARIANTS,
    DEFAULT_PHOTO,
    renderPlacehold,
    mount,
    ensureLoaded,
  };
})();