(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let revealObserver = null;
  let heroKenBurnsTimer = null;

  function isStaggerItem(el) {
    const parent = el.parentElement;
    return Boolean(parent?.hasAttribute("data-reveal-stagger"));
  }

  function revealMirrors(el) {
    if (el.hasAttribute("data-reveal-once")) return false;
    if (isStaggerItem(el)) return true;
    if (el.hasAttribute("data-reveal-mirror")) return true;
    return el.hasAttribute("data-reveal") || el.classList.contains("reveal-fade-up");
  }

  function syncStaggerItem(el) {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const rect = el.getBoundingClientRect();
    const bandY = vh * 0.07;
    const bandX = vw * 0.03;
    const inView =
      rect.top < vh - bandY &&
      rect.bottom > bandY &&
      rect.left < vw - bandX &&
      rect.right > bandX;
    const gone =
      rect.bottom < -bandY || rect.top > vh + bandY || rect.right < -bandX || rect.left > vw + bandX;
    if (inView) el.classList.add("is-visible");
    else if (gone) el.classList.remove("is-visible");
  }

  function syncRevealVisibility(el) {
    if (!el.getBoundingClientRect) return;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const rect = el.getBoundingClientRect();
    const bandY = vh * 0.08;
    const bandX = vw * 0.04;

    if (el.hasAttribute("data-reveal-once")) {
      if (!el.classList.contains("is-visible") && rect.top < vh * 0.94 && rect.bottom > vh * 0.04) {
        el.classList.add("is-visible");
      }
      return;
    }

    if (isStaggerItem(el) || el.classList.contains("reveal-item")) {
      syncStaggerItem(el);
      return;
    }

    if (!revealMirrors(el)) {
      if (!el.classList.contains("is-visible") && rect.top < vh * 0.94 && rect.bottom > vh * 0.04) {
        el.classList.add("is-visible");
        if (revealObserver) revealObserver.unobserve(el);
      }
      return;
    }

    const inView =
      rect.top < vh - bandY &&
      rect.bottom > bandY &&
      rect.left < vw - bandX &&
      rect.right > bandX;
    const gone =
      rect.bottom < -bandY || rect.top > vh + bandY || rect.right < -bandX || rect.left > vw + bandX;

    if (inView) el.classList.add("is-visible");
    else if (gone) el.classList.remove("is-visible");
  }

  function bindStaggerScroll(parent) {
    if (parent.dataset.revealScrollBound === "1") return;
    parent.dataset.revealScrollBound = "1";
    parent.addEventListener(
      "scroll",
      () => {
        requestAnimationFrame(flushRevealPending);
      },
      { passive: true }
    );
  }

  function setupStaggerChildren(parent) {
    bindStaggerScroll(parent);
    const freeze =
      parent.hasAttribute("data-reveal-once") || Boolean(parent.closest(".pkg-detail-flow, .pkg-detail-body"));
    const kids = [...parent.children];
    kids.forEach((child, i) => {
      child.style.setProperty("--reveal-i", String(i));
      child.classList.add("reveal-item");
      if (freeze) {
        child.setAttribute("data-reveal-once", "");
        child.classList.add("is-visible");
        return;
      }
      if (revealObserver) revealObserver.observe(child);
      syncStaggerItem(child);
    });
  }

  function flushRevealPending() {
    document
      .querySelectorAll("[data-reveal], [data-image-reveal], .reveal-fade-up, [data-reveal-stagger] > *")
      .forEach((el) => {
        if (el.hasAttribute("data-reveal-stagger")) return;
        syncRevealVisibility(el);
      });
  }

  function initReveal() {
    if (reduceMotion) {
      document
        .querySelectorAll("[data-reveal], [data-image-reveal], .reveal-fade-up, [data-reveal-stagger] > *")
        .forEach((el) => el.classList.add("is-visible"));
      document.querySelectorAll("[data-reveal-stagger]").forEach(setupStaggerChildren);
      return;
    }
    if (!("IntersectionObserver" in window)) {
      document
        .querySelectorAll("[data-reveal], [data-image-reveal], .reveal-fade-up, [data-reveal-stagger] > *")
        .forEach((el) => el.classList.add("is-visible"));
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const el = entry.target;
            if (el.classList.contains("reveal-item") || isStaggerItem(el)) {
              if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
                el.classList.add("is-visible");
              } else if (!entry.isIntersecting || entry.intersectionRatio <= 0.02) {
                el.classList.remove("is-visible");
              }
              return;
            }
            syncRevealVisibility(el);
          });
        },
        { rootMargin: "-5% 0px -5% 0px", threshold: [0, 0.08, 0.15, 0.35, 0.55] }
      );
    }

    document.querySelectorAll("[data-reveal-stagger]").forEach((parent) => setupStaggerChildren(parent));

    document
      .querySelectorAll("[data-reveal], [data-image-reveal], .reveal-fade-up")
      .forEach((el) => {
        if (isStaggerItem(el)) return;
        if (el.dataset.revealObserved === "1" && el.classList.contains("is-visible") && el.hasAttribute("data-reveal-once")) {
          return;
        }
        if (el.dataset.revealObserved !== "1") {
          el.dataset.revealObserved = "1";
          revealObserver.observe(el);
        }
        syncRevealVisibility(el);
      });

    requestAnimationFrame(() => requestAnimationFrame(flushRevealPending));
  }

  function initHeroKenBurns() {
    if (heroKenBurnsTimer) {
      clearInterval(heroKenBurnsTimer);
      heroKenBurnsTimer = null;
    }
    const heroSlides = document.querySelectorAll(".hero-slide");
    if (heroSlides.length <= 1 || reduceMotion) return;
    let index = heroSlides.length
      ? [...heroSlides].findIndex((s) => s.classList.contains("is-active"))
      : 0;
    if (index < 0) index = 0;
    heroKenBurnsTimer = setInterval(() => {
      heroSlides[index].classList.remove("is-active");
      index = (index + 1) % heroSlides.length;
      heroSlides[index].classList.add("is-active");
    }, 8000);
  }

  function initPageHero() {
    document.querySelectorAll(".page-hero, .hero--landing, .hero").forEach((el) => {
      if (reduceMotion) {
        el.classList.add("is-visible");
        return;
      }
      el.classList.add("is-visible");
      el.querySelectorAll("[data-reveal], .reveal, .reveal-fade-up").forEach((child) => {
        child.setAttribute("data-reveal-once", "");
        child.classList.add("is-visible");
      });
    });
  }

  function revealPackageDetailFlow() {
    document
      .querySelectorAll(
        ".pkg-detail-flow [data-reveal-stagger], .pkg-detail-body [data-reveal-stagger]"
      )
      .forEach((parent) => {
        parent.setAttribute("data-reveal-once", "");
        setupStaggerChildren(parent);
      });
    document
      .querySelectorAll(".pkg-detail-flow .reveal, .pkg-detail-body .reveal")
      .forEach((el) => {
        el.setAttribute("data-reveal-once", "");
        el.classList.add("is-visible");
      });
  }

  window.initPageMotion = function () {
    initReveal();
    revealPackageDetailFlow();
    initHeroKenBurns();
    initPageHero();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.initPageMotion());
  } else {
    window.initPageMotion();
  }

  document.addEventListener("site:content-rendered", () => window.initPageMotion());
  document.addEventListener("site:layout-ready", () => window.initPageMotion());

  if (!window.__revealScrollCheck) {
    window.__revealScrollCheck = true;
    let scrollPending = false;
    window.addEventListener(
      "scroll",
      () => {
        if (scrollPending || reduceMotion) return;
        scrollPending = true;
        requestAnimationFrame(() => {
          scrollPending = false;
          flushRevealPending();
        });
      },
      { passive: true }
    );
  }

  if (!window.__revealResizeCheck) {
    window.__revealResizeCheck = true;
    let resizePending = false;
    window.addEventListener(
      "resize",
      () => {
        if (resizePending || reduceMotion) return;
        resizePending = true;
        requestAnimationFrame(() => {
          resizePending = false;
          flushRevealPending();
        });
      },
      { passive: true }
    );
  }
})();