(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const BRANDED_LOADER_SCOPES = new Set(["home", "packages"]);

  function pageLoadWeight() {
    let w = 1;
    if (document.querySelector("[data-hero-push], .hero-push")) w += 2.2;
    if (document.querySelector("[data-home-why-split], [data-bird-of-day], [data-home-reviews]")) w += 1.4;
    if (document.querySelector('[data-catalog], [data-catalog-grid], [data-catalog-list]')) w += 1.1;
    if (document.querySelector("[data-about-sub-mount]")) w += 0.85;
    if (document.querySelector("[data-accommodation-catalog]")) w += 0.75;
    const deferScripts = document.querySelectorAll("script[src][defer], script[src]:not([async])").length;
    w += Math.min(deferScripts * 0.06, 1.25);
    return w;
  }

  function minDisplayMs(weight) {
    return Math.round(600 + weight * 340);
  }

  function maxWaitMs(weight) {
    return Math.round(4500 + weight * 1200);
  }

  function ensureLoaderMarkup(loader, attempt = 0) {
    const inner = loader.querySelector(".site-loader-inner");
    if (!inner) return;
    if (inner.querySelector(".eb-loader-stack")) return;
    if (!window.EndemicLoaderDots) {
      if (attempt < 25) window.setTimeout(() => ensureLoaderMarkup(loader, attempt + 1), 40);
      return;
    }
    inner.innerHTML = window.EndemicLoaderDots.stackMarkup({ sequenced: true });
    window.EndemicLoaderDots.activate(inner.querySelector(".eb-loader-stack"));
  }

  function finish(loader) {
    loader.classList.add("is-done");
    document.documentElement.classList.remove("is-loading");
    document.documentElement.classList.add("is-app-ready");
    document.querySelector(".hero-push")?.classList.add("is-ready");
    document.dispatchEvent(new CustomEvent("site:app-ready"));
    window.setTimeout(() => loader.remove(), reduceMotion ? 0 : 620);
  }

  function needsContentEvent() {
    return Boolean(
      document.querySelector(
        "[data-catalog], [data-about-sub-mount], [data-home-why-split], [data-bird-of-day], [data-accommodation-catalog], [data-hero-push]"
      )
    );
  }

  function waitUntilReady(weight) {
    const minMs = minDisplayMs(weight);
    const maxMs = maxWaitMs(weight);
    const started = Date.now();
    let windowLoaded = document.readyState === "complete";
    let contentReady = !needsContentEvent();

    return new Promise((resolve) => {
      const done = () => {
        const elapsed = Date.now() - started;
        if (windowLoaded && contentReady && elapsed >= minMs) {
          resolve();
          return true;
        }
        return false;
      };

      const tick = () => {
        if (done()) return;
        if (Date.now() - started >= maxMs) resolve();
      };

      if (!windowLoaded) {
        window.addEventListener("load", () => {
          windowLoaded = true;
          tick();
        }, { once: true });
      }

      if (!contentReady) {
        document.addEventListener(
          "site:content-rendered",
          () => {
            contentReady = true;
            tick();
          },
          { once: true }
        );
      }

      const interval = window.setInterval(tick, 90);
      window.setTimeout(() => {
        window.clearInterval(interval);
        resolve();
      }, maxMs + 50);
      tick();
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

    const weight = pageLoadWeight();
    waitUntilReady(weight).then(() => finish(loader));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();