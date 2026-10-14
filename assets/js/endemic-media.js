(function () {
  const prefix = window.__ASSET_PREFIX__ || "/";
  const asset = (p) => {
    const raw = String(p || "").replace(/^\//, "");
    if (!raw) return prefix;
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    return prefix + raw;
  };

  let pool = [];
  let footerPath = "endemics/FOOTER.jpg";
  let ready = null;

  /** Paths that are real photography – never replace with pool fallbacks. */
  const REAL_MEDIA_MARKERS = [
    "from-live-site/",
    "northern-circuit/",
    "southern-circuit/",
    "western-circuit/",
    "assets/images/",
  ];

  function hashString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  function pickForKey(key) {
    if (!pool.length) return null;
    return pool[hashString(key) % pool.length];
  }

  function isEndemicPath(path) {
    return path && String(path).includes("endemics/");
  }

  function isRealMediaRef(value) {
    const v = String(value || "");
    return REAL_MEDIA_MARKERS.some((m) => v.includes(m));
  }

  function resolveHero(key, preferred) {
    if (preferred && (isRealMediaRef(preferred) || isEndemicPath(preferred))) {
      return preferred;
    }
    const picked = pickForKey(key || location.pathname);
    if (picked) return picked;
    return preferred || footerPath;
  }

  /** Root-absolute URL for CSS url() – avoids double `assets/` when vars are applied from styles.css. */
  function cssUrl(path) {
    const raw = String(path || "").replace(/^\//, "");
    if (!raw) return "";
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    const stripped = raw.replace(/^(\.\.\/)+/, "");
    if (
      stripped.startsWith("assets/") ||
      stripped.startsWith("endemics/") ||
      stripped.startsWith("content/")
    ) {
      return `/${stripped}`;
    }
    return asset(raw);
  }

  function cssUrlValue(path) {
    const u = cssUrl(resolveHero("", path));
    return u ? `url('${u}')` : "none";
  }

  function mediaUrl(path) {
    if (!path) return "";
    return cssUrl(resolveHero("", path));
  }

  function shouldReplaceHeroSlideStyle(style) {
    if (!style) return false;
    if (isRealMediaRef(style)) return false;
    if (style.includes("endemics/") && !style.includes("FOOTER")) return false;
    return true;
  }

  function shouldReplacePageHeroStyle(cur) {
    if (!cur) return false;
    if (isRealMediaRef(cur)) return false;
    if (cur.includes("linear-gradient")) return false;
    if (cur.includes("endemics/") && !cur.includes("FOOTER")) return false;
    return true;
  }

  async function applyStaticHeroes() {
    await loadCatalog();
    if (!pool.length) return;

    const key = location.pathname;

    document.querySelectorAll(".hero-slide").forEach((el, i) => {
      const style = el.getAttribute("style") || "";
      if (!shouldReplaceHeroSlideStyle(style)) return;
      const path = pickForKey(`${key}-slide-${i}`);
      if (!path) return;
      el.style.setProperty("--hero-img", cssUrlValue(path));
    });

    document.querySelectorAll(".page-hero").forEach((el) => {
      const cur = el.style.getPropertyValue("--page-hero-img") || "";
      if (!shouldReplacePageHeroStyle(cur)) return;
      const path = pickForKey(`${key}-page-hero`);
      if (!path) return;
      el.style.setProperty("--page-hero-img", cssUrlValue(path));
    });

    document.querySelectorAll("[data-about-hero]").forEach((el) => {
      const cur = el.style.getPropertyValue("--page-hero-img") || "";
      if (!shouldReplacePageHeroStyle(cur)) return;
      const path = pickForKey(`${key}-about`);
      if (!path) return;
      el.style.setProperty("--page-hero-img", cssUrlValue(path));
    });

    document.querySelectorAll(".field-mosaic img, .quote-band-media img, .page-hero img").forEach((img, i) => {
      const src = img.getAttribute("src") || "";
      if (isRealMediaRef(src) || src.includes("partners/") || src.includes("brand/")) return;
      if (img.closest(".nav-pill, .site-header, .partner-marquee")) return;
      const path = pickForKey(`${key}-mosaic-${i}`);
      if (!path) return;
      img.src = asset(path);
    });

    const footer = document.querySelector(".site-footer--photo");
    if (footer) {
      footer.style.setProperty("--footer-photo", cssUrlValue(footerPath));
    }
  }

  function loadCatalog() {
    if (ready) return ready;
    ready = fetch(asset("content/endemic-images.json"))
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.pool?.length) pool = data.pool;
        if (data?.footer) footerPath = data.footer;
      })
      .catch(() => {
        pool = [];
      });
    return ready;
  }

  window.EndemicMedia = {
    asset,
    mediaUrl,
    cssUrl,
    cssUrlValue,
    resolveHero,
    pickForKey,
    isEndemicPath,
    isRealMediaRef,
    getFooterPath: () => footerPath,
    applyStaticHeroes,
    whenReady: loadCatalog,
  };

  loadCatalog().then(() => {
    applyStaticHeroes();
    document.dispatchEvent(new CustomEvent("endemic:media-ready"));
  });

  document.addEventListener("site:content-rendered", () => {
    applyStaticHeroes();
  });
})();
