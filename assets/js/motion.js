(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -4% 0px", threshold: 0.08 }
    );
    revealEls.forEach((el) => observer.observe(el));
  }

  function initHeroKenBurns() {
    const heroSlides = document.querySelectorAll(".hero-slide");
    if (heroSlides.length <= 1 || reduceMotion) return;
    let index = 0;
    setInterval(() => {
      heroSlides[index].classList.remove("is-active");
      index = (index + 1) % heroSlides.length;
      heroSlides[index].classList.add("is-active");
    }, 8000);
  }

  function initPageHero() {
    document.querySelectorAll(".page-hero").forEach((el) => {
      if (reduceMotion) {
        el.classList.add("is-visible");
        return;
      }
      requestAnimationFrame(() => el.classList.add("is-visible"));
    });
  }

  window.initPageMotion = function () {
    initReveal();
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
