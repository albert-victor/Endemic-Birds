(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const BRANDED_LOADER_SCOPES = new Set(["home", "packages"]);
  let siteContentRendered = false;

  /* defer scripts (catalog, home-content) can fire before DOMContentLoaded / init */
  document.addEventListener("site:content-rendered", () => {
    siteContentRendered = true;
  });

  function pageLoadWeight(scope) {
    let w = 0.6;
    if (scope === "home") {
      if (document.querySelector("[data-hero-push], .hero-push")) w += 1.2;
      if (document.querySelector("[data-home-why-split], [data-bird-of-day], [data-home-reviews]")) w += 0.9;
    }
    if (scope === "packages" || document.querySelector("[data-catalog]")) w += 0.65;
    return w;
  }

  function timingForScope(scope, weight) {
    const caps =
      scope === "packages"
        ? { minBase: 520, minPerW: 90, maxBase: 2400, maxPerW: 380, maxCap: 3400 }
        : { minBase: 420, minPerW: 90, maxBase: 2600, maxPerW: 450, maxCap: 4000 };
    return {
      minMs: Math.min(Math.round(caps.minBase + weight * caps.minPerW), scope === "packages" ? 720 : 980),
      maxMs: Math.min(Math.round(caps.maxBase + weight * caps.maxPerW), caps.maxCap),
    };
  }

  function ensureLoaderMarkup(loader, attempt = 0) {
    const inner = loader.querySelector(".site-loader-inner");
    if (!inner) return;
    const existing = inner.querySelector(".eb-loader-stack");
    if (existing) return;
    if (!window.EndemicLoaderDots) {
      if (attempt < 25) window.setTimeout(() => ensureLoaderMarkup(loader, attempt + 1), 40);
      return;
    }
    inner.innerHTML = window.EndemicLoaderDots.stackMarkup({ sequenced: true });
    window.EndemicLoaderDots.activate(inner.querySelector(".eb-loader-stack"));
  }

  function finish(loader) {
    loader.classList.add("is-done");
    document.documentElement.classList.remove("is-loading", "is-branded-entry");
    document.documentElement.classList.add("is-app-ready");
    document.querySelector(".hero-push")?.classList.add("is-ready");
    document.dispatchEvent(new CustomEvent("site:app-ready"));
    window.setTimeout(() => loader.remove(), reduceMotion ? 0 : 480);
  }

  function needsContentEvent(scope) {
    if (scope === "packages") return true;
    if (scope === "home") {
      return Boolean(
        document.querySelector("[data-home-why-split], [data-bird-of-day], [data-home-reviews], [data-hero-push]")
      );
    }
    return Boolean(document.querySelector("[data-catalog], [data-about-sub-mount]"));
  }

  function packagesCatalogPopulated() {
    const root = document.querySelector('[data-catalog="packages"]');
    if (!root) return false;
    const list = root.querySelector("[data-catalog-list]");
    const bento = root.querySelector("[data-catalog-bento]");
    return Boolean((list && list.children.length > 0) || (bento && bento.children.length > 0));
  }

  function scopeContentReady(scope) {
    if (!needsContentEvent(scope)) return true;
    if (scope === "packages") {
      return siteContentRendered && packagesCatalogPopulated();
    }
    return siteContentRendered;
  }

  function waitUntilReady(scope, weight) {
    const { minMs, maxMs } = timingForScope(scope, weight);
    const started = Date.now();
    let domReady = document.readyState !== "loading";
    let contentReady = scopeContentReady(scope);

    return new Promise((resolve) => {
      let settled = false;
      const settle = () => {
        if (settled) return;
        settled = true;
        resolve();
      };

      const tryDone = () => {
        if (settled) return;
        if (!contentReady) contentReady = scopeContentReady(scope);
        const elapsed = Date.now() - started;
        if (domReady && contentReady && elapsed >= minMs) settle();
        else if (elapsed >= maxMs) settle();
      };

      if (!domReady) {
        document.addEventListener(
          "DOMContentLoaded",
          () => {
            domReady = true;
            tryDone();
          },
          { once: true }
        );
      }

      if (!contentReady) {
        document.addEventListener(
          "site:content-rendered",
          () => {
            contentReady = true;
            tryDone();
          },
          { once: true }
        );
      }

      const onFrame = () => {
        tryDone();
        if (!settled) window.requestAnimationFrame(onFrame);
      };
      window.requestAnimationFrame(onFrame);
      window.setTimeout(settle, maxMs + 80);
    });
  }

  function init() {
    if (document.documentElement.classList.contains("is-app-ready")) return;
    const loader = document.querySelector("[data-site-loader]");
    if (!loader) return;
    if (loader.classList.contains("is-done")) return;
    const scope = loader.dataset.loaderScope || "";
    if (!BRANDED_LOADER_SCOPES.has(scope)) return;

    document.documentElement.classList.add("is-loading", "is-branded-entry");
    ensureLoaderMarkup(loader);

    if (reduceMotion) {
      document.documentElement.classList.add("is-app-ready");
      document.querySelector(".hero-push")?.classList.add("is-ready");
      finish(loader);
      return;
    }

    const weight = pageLoadWeight(scope);
    waitUntilReady(scope, weight).then(() => finish(loader));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();