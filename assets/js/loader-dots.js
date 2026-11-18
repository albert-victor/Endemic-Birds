(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function assetLogo() {
    const prefix = window.__ASSET_PREFIX__ || "/";
    return `${prefix}assets/images/from-live-site/brand/bird-logo.png`.replace(/\/+/g, "/").replace(":/", "://");
  }

  function dotsMarkup() {
    return `<div class="eb-loader-dots" role="status" aria-live="polite" aria-label="Please wait">
      <span class="eb-loader-dots__dot eb-loader-dots__dot--orange" aria-hidden="true"></span>
      <span class="eb-loader-dots__dot eb-loader-dots__dot--green" aria-hidden="true"></span>
      <span class="eb-loader-dots__dot eb-loader-dots__dot--charcoal" aria-hidden="true"></span>
    </div>`;
  }

  function stackMarkup(options = {}) {
    const { sequenced = true, logoSize = 80 } = options;
    return `<div class="eb-loader-stack is-ready">
      <span class="eb-loader-logo-wrap">
        <img class="eb-loader-logo" src="${assetLogo()}" alt="" width="${logoSize}" height="${logoSize}" decoding="async" />
      </span>
      ${dotsMarkup()}
    </div>`;
  }

  function activate(stack) {
    if (!stack) return;
    if (stack.classList.contains("is-ready")) return;
    stack.classList.add("is-ready");
  }

  function inlineMarkup(options = {}) {
    const { compact = true } = options;
    return `<div class="eb-loader-inline">${stackMarkup({ sequenced: true, logoSize: compact ? 64 : 80 })}</div>`;
  }

  window.EndemicLoaderDots = {
    stackMarkup,
    inlineMarkup,
    activate,
    dotsMarkup,
  };
})();