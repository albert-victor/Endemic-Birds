(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function updateHeroCopy(index) {
    const slides = window.__HERO_SLIDES;
    if (!slides?.length) return;
    const s = slides[index] || slides[0];
    const root = document.querySelector("[data-hero-copy]");
    if (!root) return;

    const eyebrow = root.querySelector("[data-hero-eyebrow-text]") || root.querySelector("[data-hero-eyebrow]");
    const titleA = root.querySelector("[data-hero-title-a]");
    const titleB = root.querySelector("[data-hero-title-b]");
    const lead = root.querySelector("[data-hero-lead]");
    const cta = root.querySelector("[data-hero-cta]");
    const ctaText = root.querySelector("[data-hero-cta-text]");

    if (eyebrow) eyebrow.textContent = s.eyebrow || "Specialist birding safaris - Tanzania";
    if (titleA) titleA.textContent = s.titleLine1 || "Discover Tanzania";
    if (titleB) titleB.textContent = s.titleLine2 || "through its birds";
    if (lead) lead.textContent = s.lead || "";
    if (cta && s.ctaHref) {
      const prefix = window.__ASSET_PREFIX__ || "";
      cta.href = s.ctaHref.startsWith("http") ? s.ctaHref : prefix + s.ctaHref.replace(/^\//, "");
    }
    if (ctaText) ctaText.textContent = s.ctaText || "Explore birding safaris";

    root.classList.remove("is-copy-fade");
    void root.offsetWidth;
    root.classList.add("is-copy-fade");
  }

  window.updateHeroCopy = updateHeroCopy;

  function initHeroPush(root) {
    if (!root) return;

    const slides = [...root.querySelectorAll("[data-hero-push-slide]")];
    if (slides.length < 1) return;

    if (root.dataset.heroPushInit === "true") return;
    root.dataset.heroPushInit = "true";

    const dotsHost = root.querySelector("[data-hero-push-dots]");
    const counterEl = root.querySelector("[data-hero-counter]");
    const prevBtn = root.querySelector("[data-hero-prev]");
    const nextBtn = root.querySelector("[data-hero-next]");
    const multi = slides.length > 1;

    let index = slides.findIndex((s) => s.classList.contains("is-active"));
    if (index < 0) index = 0;

    function slideDuration(i) {
      const ms = parseInt(slides[i]?.dataset.duration || "12000", 10);
      return Number.isFinite(ms) ? ms : 12000;
    }

    dotsHost?.replaceChildren();
    const dots = slides.map((_, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hero-push-bar";
      btn.setAttribute("aria-label", `Show slide ${i + 1}`);
      if (i === index) btn.classList.add("is-active");
      btn.addEventListener("click", () => goTo(i, true));
      dotsHost?.appendChild(btn);
      return btn;
    });

    let timer = null;
    let busy = false;

    function updateCounter() {
      if (counterEl) {
        counterEl.textContent = `${String(index + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
      }
    }

    function restartKenBurns(slide) {
      const img = slide?.querySelector("img");
      if (!img || reduceMotion) return;
      img.style.animation = "none";
      void img.offsetWidth;
      img.style.animation = "";
    }

    function setActive(i) {
      dots.forEach((d, j) => {
        d.classList.toggle("is-active", j === i);
        d.style.setProperty("--bar-duration", `${slideDuration(j)}ms`);
      });
      slides.forEach((s, j) => {
        s.classList.toggle("is-active", j === i);
        s.setAttribute("aria-hidden", j === i ? "false" : "true");
      });
      index = i;
      root.style.setProperty("--ken-duration", `${slideDuration(i)}ms`);
      updateCounter();
      updateHeroCopy(i);
      restartKenBurns(slides[i]);
    }

    function goTo(next, userTriggered) {
      if (busy && !userTriggered) return;
      if (next === index && !userTriggered) return;
      if (reduceMotion) {
        setActive(next);
        schedule();
        return;
      }
      if (busy) return;
      busy = true;
      const current = slides[index];
      const incoming = slides[next];
      const dir = next > index || (index === slides.length - 1 && next === 0) ? 1 : -1;

      incoming.classList.add("is-entering");
      incoming.style.setProperty("--push-dir", String(dir));
      current.classList.add("is-leaving");
      current.style.setProperty("--push-dir", String(dir));

      requestAnimationFrame(() => {
        incoming.classList.add("is-active");
        current.classList.remove("is-active");
      });

      const done = () => {
        current.classList.remove("is-leaving");
        incoming.classList.remove("is-entering");
        current.removeEventListener("transitionend", done);
        busy = false;
        setActive(next);
        schedule();
      };
      current.addEventListener("transitionend", done, { once: true });
      window.setTimeout(done, 850);
    }

    function schedule() {
      clearTimeout(timer);
      if (reduceMotion || !multi) return;
      timer = setTimeout(() => goTo((index + 1) % slides.length), slideDuration(index));
    }

    root._heroTimer = timer;
    if (!multi) {
      prevBtn?.setAttribute("disabled", "true");
      nextBtn?.setAttribute("disabled", "true");
    } else {
      prevBtn?.removeAttribute("disabled");
      nextBtn?.removeAttribute("disabled");
    }

    prevBtn?.addEventListener("click", () => multi && goTo((index - 1 + slides.length) % slides.length, true));
    nextBtn?.addEventListener("click", () => multi && goTo((index + 1) % slides.length, true));

    root.addEventListener("pointerenter", () => clearTimeout(timer));
    root.addEventListener("pointerleave", schedule);

    setActive(index);
    schedule();
    root.classList.add("is-ready");
  }

  window.initHeroPush = function () {
    document.querySelectorAll("[data-hero-push]").forEach(initHeroPush);
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("site:content-rendered", () => {
      window.initHeroPush();
    });
  });
})();
