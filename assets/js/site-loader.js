(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function finish(loader) {
    loader.classList.add("is-done");
    document.documentElement.classList.remove("is-loading");
    document.documentElement.classList.add("is-app-ready");
    document.querySelector(".hero-push")?.classList.add("is-ready");
    document.dispatchEvent(new CustomEvent("site:app-ready"));
    window.setTimeout(() => loader.remove(), reduceMotion ? 0 : 700);
  }

  function init() {
    const loader = document.querySelector("[data-site-loader]");
    if (!loader) return;
    document.documentElement.classList.add("is-loading");

    if (reduceMotion) {
      document.documentElement.classList.add("is-app-ready");
      document.querySelector(".hero-push")?.classList.add("is-ready");
      finish(loader);
      return;
    }

    const bar = loader.querySelector("[data-loader-bar]");
    let progress = 0;
    const tick = window.setInterval(() => {
      progress = Math.min(progress + 8 + Math.random() * 12, 92);
      if (bar) bar.style.setProperty("--loader-progress", `${progress}%`);
    }, 120);

    const onReady = () => {
      window.clearInterval(tick);
      if (bar) bar.style.setProperty("--loader-progress", "100%");
      window.setTimeout(() => finish(loader), 280);
    };

    if (document.readyState === "complete") onReady();
    else window.addEventListener("load", onReady, { once: true });

    window.setTimeout(() => {
      if (document.documentElement.classList.contains("is-loading")) onReady();
    }, 8000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
