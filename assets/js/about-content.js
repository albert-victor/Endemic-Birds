(function () {
  const root = document.querySelector("[data-about-page]");
  if (!root) return;

  const prefix = window.__ASSET_PREFIX__ || "/";
  const asset = (p) => prefix + String(p).replace(/^\//, "");

  const STORY_IMAGE = "assets/images/about-page/great-migration.jpg";

  const galleryImages = [
    { src: "assets/images/about-page/great-migration.jpg", alt: "Wildebeest migration in Tanzania" },
    { src: "assets/images/about-page/golden hours.jpg", alt: "Golden hour on safari" },
    { src: "assets/images/about-page/savana.jpg", alt: "Tanzania savanna landscape" },
    { src: "assets/images/about-page/wildlife.jpg", alt: "Wildlife on safari" },
    { src: "assets/images/about-page/sky.jpg", alt: "Sky over the plains" },
    { src: "assets/images/about-page/predators.jpg", alt: "Predators in the wild" },
    { src: "assets/images/about-page/suset.jpg", alt: "Sunset on safari" },
    { src: "assets/images/about-page/23bf7b75-1fc2-4091-bfae-8a9882218030.jpg", alt: "Safari field moment" },
    { src: "assets/images/about-page/45de6f40-94db-4fa0-b46a-bfdb6d439fee.jpg", alt: "Birding and wildlife" },
    { src: "assets/images/about-page/580211fd-78eb-4ac3-84ac-fc5f0054b6f6.jpg", alt: "Tanzania nature tour" },
  ];

  const INITIAL_GALLERY = 6;

  function renderGalleryCells(items) {
    return items
      .map(
        (item) =>
          `<figure class="about-gallery__cell"><img src="${asset(item.src)}" alt="${escapeHtml(item.alt)}" loading="lazy" decoding="async" /></figure>`
      )
      .join("");
  }

  fetch(asset("content/site.json"))
    .then((r) => r.json())
    .then((site) => {
      const about = site.about || {};
      const introEl = root.querySelector("[data-about-intro]");
      if (introEl && about.intro) introEl.textContent = about.intro;

      const storyBg = root.querySelector("[data-about-story-bg]");
      if (storyBg) {
        storyBg.style.backgroundImage = `url('${asset(STORY_IMAGE)}')`;
      }

      const quoteEl = root.querySelector("[data-about-story-quote]");
      const citeEl = root.querySelector("[data-about-story-cite]");
      if (quoteEl) {
        quoteEl.textContent =
          about.storyQuote ||
          "We connect birders and safari guests with Tanzania's landscapes through indigenous guides, sustainable pacing and routes built around real field time.";
      }
      if (citeEl) {
        citeEl.textContent = about.storyCite || "Endemic Birds Tanzania · Iringa, East Africa";
      }

      const fullHost = root.querySelector("[data-about-gallery-full]");
      const toggleBtn = root.querySelector("[data-about-gallery-toggle]");
      if (fullHost) {
        const initial = galleryImages.slice(0, INITIAL_GALLERY);
        const rest = galleryImages.slice(INITIAL_GALLERY);
        fullHost.innerHTML = renderGalleryCells(initial);
        if (rest.length && toggleBtn) {
          toggleBtn.hidden = false;
          toggleBtn.addEventListener("click", () => {
            fullHost.insertAdjacentHTML("beforeend", renderGalleryCells(rest));
            fullHost.classList.add("is-expanded");
            root.querySelector(".about-gallery-viewport")?.classList.add("is-expanded");
            toggleBtn.hidden = true;
          });
        } else if (galleryImages.length > initial.length) {
          fullHost.innerHTML = renderGalleryCells(galleryImages);
        }
      }

      const valuesHost = root.querySelector("[data-about-values]");
      if (valuesHost && about.sections?.length) {
        valuesHost.innerHTML = about.sections
          .map(
            (s) => `<article class="about-value-card">
              <h3>${escapeHtml(s.title)}</h3>
              <p>${escapeHtml(s.body)}</p>
            </article>`
          )
          .join("");
      }
      document.dispatchEvent(new CustomEvent("site:content-rendered"));
    })
    .catch(console.error);

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
