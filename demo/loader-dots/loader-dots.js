(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LOGO_SRC = "../../assets/images/from-live-site/brand/bird-logo.png";

  function dotsInner(variant) {
    const mod = variant ? ` eb-loader-dots--${variant}` : "";
    return `<div class="eb-loader-dots${mod}" role="status" aria-live="polite" aria-label="Please wait">
      <span class="eb-loader-dots__dot eb-loader-dots__dot--orange" aria-hidden="true"></span>
      <span class="eb-loader-dots__dot eb-loader-dots__dot--green" aria-hidden="true"></span>
      <span class="eb-loader-dots__dot eb-loader-dots__dot--charcoal" aria-hidden="true"></span>
    </div>`;
  }

  function loaderStackMarkup(variant, options = {}) {
    const { sequenced = true } = options;
    const seqClass = sequenced ? " is-sequenced" : "";
    return `<div class="eb-loader-stack${seqClass}">
      <span class="eb-loader-logo-wrap">
        <img class="eb-loader-logo" src="${LOGO_SRC}" alt="" width="80" height="80" decoding="async" />
      </span>
      ${dotsInner(variant)}
    </div>`;
  }

  function startDotPlay(stack) {
    if (!stack) return;
    window.setTimeout(() => {
      stack.classList.add("is-playing");
    }, reduceMotion ? 0 : 480);
  }

  function ensureOverlay() {
    let el = document.querySelector("[data-ld-overlay]");
    if (el) return el;
    el = document.createElement("div");
    el.className = "eb-loader-overlay";
    el.setAttribute("data-ld-overlay", "");
    el.hidden = true;
    el.innerHTML = loaderStackMarkup("", { sequenced: true });
    document.body.appendChild(el);
    return el;
  }

  function simulateInline(preview, ms, variant) {
    preview.classList.remove("is-done");
    preview.classList.add("is-active");
    const mount = preview.querySelector("[data-ld-mount]");
    mount.innerHTML = loaderStackMarkup(variant, { sequenced: true });
    const stack = mount.querySelector(".eb-loader-stack");
    stack.classList.remove("is-playing");
    startDotPlay(stack);
    window.clearTimeout(preview._ldTimer);
    preview._ldTimer = window.setTimeout(() => {
      preview.classList.remove("is-active");
      preview.classList.add("is-done");
      mount.innerHTML = "";
    }, ms);
  }

  function simulateFullscreen(ms) {
    const overlay = ensureOverlay();
    overlay.innerHTML = loaderStackMarkup("", { sequenced: true });
    const stack = overlay.querySelector(".eb-loader-stack");
    stack.classList.remove("is-playing");
    overlay.hidden = false;
    overlay.classList.add("is-visible");
    startDotPlay(stack);
    window.clearTimeout(overlay._ldTimer);
    overlay._ldTimer = window.setTimeout(() => {
      overlay.classList.remove("is-visible");
      window.setTimeout(() => {
        overlay.hidden = true;
      }, reduceMotion ? 0 : 400);
    }, ms);
  }

  document.querySelectorAll(".eb-loader-stack--static").forEach((stack) => {
    stack.classList.add("is-playing");
  });

  document.querySelectorAll("[data-ld-fullscreen]").forEach((btn) => {
    btn.addEventListener("click", () => {
      simulateFullscreen(Number(btn.dataset.ldMs) || 2400);
    });
  });

  document.querySelectorAll("[data-ld-inline]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preview = document.querySelector(btn.dataset.ldTarget);
      if (!preview) return;
      simulateInline(preview, Number(btn.dataset.ldMs) || 1800, btn.dataset.ldVariant || "");
    });
  });
})();