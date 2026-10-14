(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initTrackCarousel(root) {
    if (root.dataset.carouselInit) return;
    const track = root.querySelector("[data-carousel-track]");
    const prev = root.querySelector("[data-carousel-prev]");
    const next = root.querySelector("[data-carousel-next]");
    if (!track) return;
    root.dataset.carouselInit = "true";

    const autoplayMs = parseInt(root.dataset.carouselAutoplay || "0", 10);
    let autoplayTimer = null;

    const step = () => {
      const card =
        track.querySelector(".pkg-ind-sheet, .pkg-card-editorial, .dest-card-editorial, .carousel-card") ||
        track.firstElementChild;
      return card ? card.offsetWidth + 20 : track.clientWidth * 0.85;
    };

    function atEnd() {
      return track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
    }

    function scrollByStep(dir) {
      const amount = step() * dir;
      if (dir > 0 && atEnd()) {
        track.scrollTo({ left: 0, behavior: reduceMotion ? "auto" : "smooth" });
      } else if (dir < 0 && track.scrollLeft <= 4) {
        track.scrollTo({ left: track.scrollWidth, behavior: reduceMotion ? "auto" : "smooth" });
      } else {
        track.scrollBy({ left: amount, behavior: reduceMotion ? "auto" : "smooth" });
      }
      root.classList.add("is-advancing");
      window.setTimeout(() => root.classList.remove("is-advancing"), 500);
    }

    prev?.addEventListener("click", () => scrollByStep(-1));
    next?.addEventListener("click", () => scrollByStep(1));

    function scheduleAutoplay() {
      clearInterval(autoplayTimer);
      if (!autoplayMs || reduceMotion) return;
      autoplayTimer = setInterval(() => scrollByStep(1), autoplayMs);
    }

    root.addEventListener("pointerenter", () => clearInterval(autoplayTimer));
    root.addEventListener("pointerleave", scheduleAutoplay);
    scheduleAutoplay();
  }

  function initDestRowCarousel(row) {
    if (row.dataset.destCarouselInit) return;
    const track = row.querySelector("[data-dest-carousel-track]");
    const prev = row.querySelector("[data-dest-carousel-prev]");
    const next = row.querySelector("[data-dest-carousel-next]");
    if (!track) return;
    row.dataset.destCarouselInit = "true";

    const step = () => {
      const card = track.querySelector(".dest-ind-spot, .dest-card-editorial") || track.firstElementChild;
      return card ? card.offsetWidth + 16 : 240;
    };

    function scrollByStep(dir) {
      if (dir > 0 && track.scrollLeft + track.clientWidth >= track.scrollWidth - 6) {
        track.scrollTo({ left: 0, behavior: reduceMotion ? "auto" : "smooth" });
      } else if (dir < 0 && track.scrollLeft <= 4) {
        track.scrollTo({ left: track.scrollWidth, behavior: reduceMotion ? "auto" : "smooth" });
      } else {
        track.scrollBy({ left: step() * dir, behavior: reduceMotion ? "auto" : "smooth" });
      }
      row.classList.add("is-advancing");
      window.setTimeout(() => row.classList.remove("is-advancing"), 450);
    }

    prev?.addEventListener("click", () => scrollByStep(-1));
    next?.addEventListener("click", () => scrollByStep(1));

    track.addEventListener(
      "wheel",
      (e) => {
        const absY = Math.abs(e.deltaY);
        const absX = Math.abs(e.deltaX);
        let consumed = false;
        if (absX > absY && absX >= 2) {
          const before = track.scrollLeft;
          track.scrollLeft += e.deltaX;
          consumed = track.scrollLeft !== before;
        } else if (e.shiftKey && absY >= 2) {
          const before = track.scrollLeft;
          track.scrollLeft += e.deltaY;
          consumed = track.scrollLeft !== before;
        }
        if (consumed) e.preventDefault();
      },
      { passive: false }
    );

    let timer = null;
    function schedule() {
      clearInterval(timer);
      if (reduceMotion) return;
      timer = setInterval(() => scrollByStep(1), 4800);
    }
    row.addEventListener("pointerenter", () => clearInterval(timer));
    row.addEventListener("pointerleave", schedule);
    schedule();
  }

  function initReviews(root) {
    if (root.dataset.reviewsInit) return;
    const stage = root.querySelector("[data-reviews-stage]") || root;
    const track = stage.querySelector("[data-reviews-track]");
    const slides = track ? [...track.querySelectorAll("[data-review-slide]")] : [...stage.querySelectorAll("[data-review-slide]")];
    const dotsHost = stage.querySelector("[data-reviews-dots]");
    const counterEl = stage.querySelector("[data-reviews-counter]");
    const prevBtn = stage.querySelector("[data-reviews-prev]");
    const nextBtn = stage.querySelector("[data-reviews-next]");
    if (slides.length < 1) return;
    root.dataset.reviewsInit = "true";

    function pageSize() {
      return window.matchMedia("(min-width: 768px)").matches ? 2 : 1;
    }

    let page = 0;

    function pageCount() {
      const size = pageSize();
      return Math.max(1, Math.ceil(slides.length / size));
    }

    function updateCounter() {
      if (!counterEl) return;
      const size = pageSize();
      const start = page * size + 1;
      const end = Math.min(slides.length, (page + 1) * size);
      counterEl.textContent = `${start}–${end} of ${slides.length}`;
    }

    function renderDots() {
      if (!dotsHost) return [];
      dotsHost.replaceChildren();
      const count = pageCount();
      return Array.from({ length: count }, (_, idx) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "reviews-dot" + (idx === page ? " is-active" : "");
        b.setAttribute("aria-label", `Show reviews page ${idx + 1}`);
        b.setAttribute("role", "tab");
        b.addEventListener("click", () => go(idx));
        dotsHost.appendChild(b);
        return b;
      });
    }

    let dots = renderDots();

    function applyPage() {
      const size = pageSize();
      const maxPage = pageCount() - 1;
      if (page > maxPage) page = maxPage;
      if (track) track.classList.add("is-sliding");
      slides.forEach((el, idx) => {
        const onPage = idx >= page * size && idx < page * size + size;
        el.hidden = !onPage;
        el.classList.remove("is-active");
        if (onPage) {
          requestAnimationFrame(() => el.classList.add("is-active"));
        }
      });
      window.setTimeout(() => track?.classList.remove("is-sliding"), 520);
      dots.forEach((d, idx) => d.classList.toggle("is-active", idx === page));
      updateCounter();
    }

    function go(idx) {
      page = (idx + pageCount()) % pageCount();
      applyPage();
    }

    prevBtn?.addEventListener("click", () => go(page - 1));
    nextBtn?.addEventListener("click", () => go(page + 1));

    window.addEventListener("resize", () => {
      dots = renderDots();
      applyPage();
    });

    applyPage();

    if (reduceMotion || slides.length < 2) return;
    let timer = setInterval(() => go(page + 1), 7000);
    stage.addEventListener("pointerenter", () => clearInterval(timer));
    stage.addEventListener("pointerleave", () => {
      timer = setInterval(() => go(page + 1), 7000);
    });
  }

  window.initCarousels = function () {
    document.querySelectorAll("[data-carousel]").forEach(initTrackCarousel);
    document.querySelectorAll("[data-dest-carousel]").forEach(initDestRowCarousel);
    document.querySelectorAll("[data-reviews-slider], [data-home-reviews]").forEach(initReviews);
  };

  document.addEventListener("DOMContentLoaded", window.initCarousels);
  document.addEventListener("site:content-rendered", window.initCarousels);
})();
