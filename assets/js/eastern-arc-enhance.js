(function () {
  if (document.body.dataset.slug !== "eastern-arc-mountain") return;

  function runWhenReady(fn) {
    if (document.querySelector("#story .detail-main")) fn();
    else document.addEventListener("site:content-rendered", fn, { once: true });
  }

  const prefix = window.__ASSET_PREFIX__ || "/";
  const asset = (p) => prefix + String(p).replace(/^\//, "");

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderSpeciesChips(slugs, labels) {
    return slugs
      .map(
        (slug) =>
          `<button type="button" class="eastern-arc-chip" data-species-open="${escapeHtml(slug)}">${escapeHtml(
            window.EndemicSpecies?.get?.(slug)?.commonName || slug.replace(/-/g, " ")
          )}</button>`
      )
      .join("");
  }

  runWhenReady(() => {
    Promise.all([
      fetch(asset("content/eastern-arc-detail.json")).then((r) => r.json()),
      window.EndemicSpecies?.load?.() || Promise.resolve(),
    ])
      .then(([arc]) => {
      const main = document.querySelector("#story .detail-main");
      if (!main) return;

      const blocks = (arc.blocks || [])
        .map(
          (b) => `<article class="eastern-arc-block">
            <h3>${escapeHtml(b.name)}</h3>
            <p><strong>Habitats:</strong> ${escapeHtml(b.habitats)}</p>
            <p>${escapeHtml(b.routeNote)}</p>
            <ul>${(b.destinationSlugs || []).map((s) => `<li><a href="${asset(`destinations/${s}/`)}">${escapeHtml(s.replace(/-/g, " "))}</a></li>`).join("")}</ul>
          </article>`
        )
        .join("");

      const practical = (arc.routePractical || []).map((p) => `<li>${escapeHtml(p)}</li>`).join("");
      const significance = arc.significance || "";

      main.insertAdjacentHTML(
        "afterbegin",
        `<section class="detail-section reveal eastern-arc-intro" data-reveal>
          <h2>Why the Eastern Arc matters</h2>
          <p>${escapeHtml(significance)}</p>
        </section>
        <section class="detail-section reveal" data-reveal>
          <h2>Mountain blocks & habitats</h2>
          <div class="eastern-arc-blocks">${blocks}</div>
        </section>
        <section class="detail-section reveal" data-reveal>
          <h2>How routes differ</h2>
          <ul>${practical}</ul>
        </section>
        <section class="detail-section reveal" data-reveal>
          <h2>Target species</h2>
          <p class="meta-line">Open a species card for habitat and safari links – no guaranteed sightings.</p>
          <div class="eastern-arc-species">${renderSpeciesChips(arc.speciesSlugs || [])}</div>
          <a class="text-link" href="${asset("birding/special-birds/index.html?region=eastern-arc")}">Full Eastern Arc species list →</a>
        </section>`
      );

      main.querySelectorAll("[data-species-open]").forEach((btn) => {
        btn.addEventListener("click", () => window.EndemicSpecies?.open?.(btn.getAttribute("data-species-open")));
      });

      const sticky = arc.stickyInvite;
      if (sticky && !sessionStorage.getItem(sticky.dismissKey)) {
        const el = document.createElement("aside");
        el.className = "eastern-arc-sticky";
        el.setAttribute("role", "complementary");
        el.innerHTML = `<p class="eastern-arc-sticky__label">${escapeHtml(sticky.label)}</p>
          <p class="eastern-arc-sticky__short">${escapeHtml(sticky.short)}</p>
          <a class="btn btn-solid btn-sm" href="${asset(sticky.href)}">Explore</a>
          <button type="button" class="eastern-arc-sticky__dismiss" aria-label="Dismiss">×</button>`;
        document.body.appendChild(el);
        el.querySelector(".eastern-arc-sticky__dismiss")?.addEventListener("click", () => {
          sessionStorage.setItem(sticky.dismissKey, "1");
          el.remove();
        });
      }
      })
      .catch(console.error);
  });
})();