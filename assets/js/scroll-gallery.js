(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mosaics = document.querySelectorAll("[data-field-mosaic]");
  if (!mosaics.length) return;

  mosaics.forEach((mosaic) => {
    const items = mosaic.querySelectorAll(".field-mosaic-item");
    if (!items.length) return;

    if (reduceMotion) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -4% 0px" }
    );
    items.forEach((el) => io.observe(el));
  });
})();
