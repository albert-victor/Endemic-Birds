(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let revealObserver = null;
  let heroKenBurnsTimer = null;

  function initReveal() {
    const revealEls = document.querySelectorAll(
      "[data-reveal], [data-reveal-stagger], [data-image-reveal], .reveal-fade-up"
    );
    if (reduceMotion) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    if (!("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -4% 0px", threshold: 0.08 }
      );
    }
    revealEls.forEach((el) => {
      if (el.dataset.revealObserved && !el.hasAttribute("data-reveal-stagger")) return;
      if (el.hasAttribute("data-reveal-stagger")) {
        el.classList.remove("is-visible");
        delete el.dataset.revealObserved;
      }
      el.dataset.revealObserved = "1";
      if (el.classList.contains("is-visible") && !el.hasAttribute("data-reveal-stagger")) return;
      revealObserver.observe(el);
      revealIfInView(el);
    });
  }

  function revealIfInView(el) {
    if (!el.getBoundingClientRect || el.classList.contains("is-visible")) return;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const rect = el.getBoundingClientRect();
    if (rect.top < vh * 0.94 && rect.bottom > vh * 0.04) {
      el.classList.add("is-visible");
      if (revealObserver) revealObserver.unobserve(el);
    }
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
      requestAnimationFrame(() => el.classList.add("is-visible"));
    });
  }

  function revealPackageDetailFlow() {
    document
      .querySelectorAll(".pkg-detail-flow .reveal, .pkg-detail-flow .reveal-stagger, .pkg-detail-body .reveal")
      .forEach((el) => el.classList.add("is-visible"));
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
})();
