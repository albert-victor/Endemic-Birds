(function () {
  const prefix = window.__ASSET_PREFIX__ || "/";
  const asset = (p) => (p.startsWith("http") ? p : prefix + p.replace(/^\//, ""));

  function rootMediaUrl(path) {
    const raw = String(path || "").replace(/^\//, "");
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    const stripped = raw.replace(/^(\.\.\/)+/, "");
    if (stripped.startsWith("assets/") || stripped.startsWith("endemics/")) return `/${stripped}`;
    return asset(raw);
  }

  const DEFAULT_MEDIA = {
    brandLogo: "assets/images/from-live-site/brand/bird-logo.png",
    brandLogoLight: "assets/images/from-live-site/brand/endemic-birds-logo-light.png",
    footerBackground: "endemics/FOOTER.jpg",
  };

  if (!document.querySelector('link[href*="clean-depth.css"]')) {
    const clean = document.createElement("link");
    clean.rel = "stylesheet";
    clean.href = asset("assets/css/clean-depth.css");
    document.head.appendChild(clean);
  }

  if (!document.querySelector('link[href*="site-enhancements.css"]')) {
    const enh = document.createElement("link");
    enh.rel = "stylesheet";
    enh.href = asset("assets/css/site-enhancements.css");
    document.head.appendChild(enh);
  }

  if (!document.querySelector('link[href*="preview-luxury/fonts.css"]')) {
    const playfairDm = document.createElement("link");
    playfairDm.rel = "stylesheet";
    playfairDm.href = asset("preview-luxury/fonts.css");
    document.head.appendChild(playfairDm);
  }

  if (!document.querySelector('link[href*="futura-pt.css"]')) {
    const futura = document.createElement("link");
    futura.rel = "stylesheet";
    futura.href = asset("preview-luxury/fonts/futura-pt.css");
    document.head.appendChild(futura);
  }

  if (!document.querySelector('link[href*="typography-site.css"]')) {
    const typo = document.createElement("link");
    typo.rel = "stylesheet";
    typo.href = asset("assets/css/typography-site.css");
    document.head.appendChild(typo);
  }

  if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Marck')) {
    const marck = document.createElement("link");
    marck.rel = "stylesheet";
    marck.href = "https://fonts.googleapis.com/css2?family=Marck+Script&display=swap";
    document.head.appendChild(marck);
  }

  if (!document.querySelector('link[href*="font-awesome"]')) {
    const fa = document.createElement("link");
    fa.rel = "stylesheet";
    fa.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
    fa.crossOrigin = "anonymous";
    document.head.appendChild(fa);
  }

  if (!document.querySelector('link[href*="pattern-accent.css"]')) {
    const pat = document.createElement("link");
    pat.rel = "stylesheet";
    pat.href = asset("assets/css/pattern-accent.css");
    document.head.appendChild(pat);
  }

  if (!document.querySelector('link[href*="placehold-page.css"]')) {
    const ph = document.createElement("link");
    ph.rel = "stylesheet";
    ph.href = asset("assets/css/placehold-page.css");
    document.head.appendChild(ph);
  }

  const destinationHubLinks = [
    {
      href: "destinations/birding/index.html#destinations-grid",
      label: "Birding destinations",
      desc: "Forests, miombo & endemics – Tanzania birding circuits",
      image: "endemics/perfect-moment-bird-watching-1536x872.jpg",
    },
    {
      href: "wildlife/index.html#destinations",
      label: "Wildlife destinations",
      desc: "Iconic parks & conservation areas on tailor-made safaris",
      image: "assets/images/wildlife/destinations/serengeti-national-park/hero.jpg",
    },
  ];

  const wildlifeActivities = [
    { href: "wildlife/activities/great-migration-plains/", label: "Great Migration" },
    { href: "wildlife/activities/ngorongoro-northern-icons/", label: "Northern Icons" },
    { href: "wildlife/activities/chimps-lake-forests/", label: "Chimps & Lakes" },
    { href: "wildlife/activities/southern-western-wilderness/", label: "Southern Wilderness" },
    { href: "wildlife/activities/bush-beach-luxury/", label: "Bush & Beach" },
    { href: "wildlife/index.html#activities", label: "All activities" },
  ];

  const drawerLinks = [
    { href: "plan-your-trip/index.html", label: "Booking & Enquiries" },
    { href: "accommodations/index.html", label: "Accommodation" },
    { href: "birding/special-birds/index.html", label: "Special birds" },
    { href: "packages/index.html", label: "All Safari Packages" },
    { href: "destinations/index.html", label: "All destinations" },
    { href: "combined/index.html", label: "Birding + Wildlife" },
    { href: "about/policies/index.html", label: "Terms & policies" },
    { href: "about/index.html#contact", label: "Contact" },
  ];

  const navItems = [
    { href: asset("index.html"), label: "Home", id: "home" },
    { href: asset("birding/index.html"), label: "Birding", id: "birding" },
    {
      label: "Destinations",
      id: "destinations",
      dropdown: destinationHubLinks,
    },
    { href: asset("accommodations/index.html"), label: "Accommodation", id: "accommodations" },
    {
      label: "Wildlife",
      id: "wildlife",
      mega: true,
      columns: [{ title: "Experiences", links: wildlifeActivities }],
      megaCta: { href: "wildlife/index.html", label: "View wildlife safaris →" },
    },
    {
      label: "About",
      id: "about",
      groups: [
        {
          title: "The company",
          links: [
            {
              href: "about/index.html",
              label: "About Us",
              desc: "Southern Tanzania birding, from Iringa",
            },
            {
              href: "about/why-choose-us/index.html",
              label: "Why Choose Us",
              desc: "Private guiding and how a trip is run",
            },
            {
              href: "about/team/index.html",
              label: "Our Team",
              desc: "Who is in the field with you",
            },
          ],
        },
        {
          title: "Field and planning",
          links: [
            {
              href: "about/trip-reports/index.html",
              label: "Trip Reports",
              desc: "Field notes, published when they are ready",
            },
            {
              href: "about/gallery/index.html",
              label: "Gallery",
              desc: "Field, habitat and wildlife moments from our routes",
            },
            {
              href: "about/tour-training/index.html",
              label: "Tour Training",
              desc: "Familiarisation for guides and operators",
            },
          ],
        },
        {
          title: "Working with us",
          links: [
            {
              href: "about/partners/index.html",
              label: "Our Partners",
              desc: "Ground support for overseas operators",
            },
            {
              href: "about/policies/index.html",
              label: "Terms & Policies",
              desc: "Published privacy, draft booking terms, owner checklist",
            },
          ],
        },
      ],
      secondary: [
        {
          href: "about/leons-mlawila/index.html",
          label: "Leons J. Mlawila",
          desc: "Guide and tour operator",
        },
        {
          href: "about/tour-calendar/index.html",
          label: "Tour Calendar",
          desc: "When forests, woodland and plains are at their best",
        },
      ],
    },
  ];

  function isActive(item) {
    const current = document.body.dataset.nav || "";
    return item.id && current === item.id;
  }

  function renderNavLink(item) {
    const active = isActive(item) ? ' aria-current="page"' : "";
    return `<a class="nav-rail-link nav-link-animated" href="${item.href}"${active}>${item.label}</a>`;
  }

  function renderMegaColumn(col) {
    const links = col.links
      .map((l) => `<li><a href="${asset(l.href)}">${l.label}</a></li>`)
      .join("");
    return `<div class="nav-mega-col"><h3>${col.title}</h3><ul>${links}</ul></div>`;
  }

  function renderAboutLink(link) {
    return `<a class="nav-about-link" href="${asset(link.href)}">
      <span class="nav-about-link-title">${link.label}</span>
      ${link.desc ? `<span class="nav-about-link-desc">${link.desc}</span>` : ""}
    </a>`;
  }

  function renderAboutPanel(item) {
    const groups = item.groups
      .map((group) => {
        const links = group.links.map((link) => `<li>${renderAboutLink(link)}</li>`).join("");
        return `<div class="nav-about-group"><h3>${group.title}</h3><ul>${links}</ul></div>`;
      })
      .join("");
    const secondary = (item.secondary || []).map((link) => renderAboutLink(link)).join("");
    return `<div class="nav-about-groups">${groups}</div><div class="nav-about-secondary">${secondary}</div>`;
  }

  function renderDrawerAbout(item) {
    const subs = item.groups
      .map((group) => {
        const links = group.links
          .map(
            (link) =>
              `<li><a href="${asset(link.href)}"><span class="nav-drawer-sub-title">${link.label}</span>${link.desc ? `<span class="nav-drawer-sub-desc">${link.desc}</span>` : ""}</a></li>`
          )
          .join("");
        return `<li class="nav-drawer-kicker">${group.title}</li>${links}`;
      })
      .join("");
    const secondary = (item.secondary || [])
      .map(
        (link) =>
          `<li><a class="nav-drawer-sub-cta" href="${asset(link.href)}"><span class="nav-drawer-sub-title">${link.label}</span>${link.desc ? `<span class="nav-drawer-sub-desc">${link.desc}</span>` : ""}</a></li>`
      )
      .join("");
    return `<li class="nav-drawer-group">
      <button type="button" class="nav-drawer-accordion nav-drawer-tile" aria-expanded="false" aria-controls="nav-drawer-about" data-drawer-accordion>${item.label}</button>
      <ul class="nav-drawer-sub" id="nav-drawer-about">${subs}${secondary}</ul>
    </li>`;
  }

  function buildNav(logos) {
    const logoOnLight = logos.onLight || DEFAULT_MEDIA.brandLogo;
    const logoOnDark = logos.onDark || DEFAULT_MEDIA.brandLogoLight;
    const links = navItems
      .map((item) => {
        if (item.groups) {
          const activeParent = item.id === document.body.dataset.nav ? " is-active" : "";
          return `<li class="nav-item has-dropdown has-mega nav-about${activeParent}">
            <button type="button" class="nav-dropdown-trigger nav-rail-link nav-link-animated" aria-expanded="false" aria-haspopup="true" aria-controls="nav-about-menu">
              <span>${item.label}</span>
              <svg class="nav-chevron" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
            </button>
            <div class="nav-dropdown nav-mega nav-about-panel" id="nav-about-menu">${renderAboutPanel(item)}</div>
          </li>`;
        }
        if (item.dropdown) {
          const menuLinks = item.dropdown
            .map((l) => {
              const thumb = l.image
                ? `<span class="nav-hub-thumb"><img src="${asset(l.image)}" alt="" width="80" height="60" loading="lazy" decoding="async" /></span>`
                : "";
              return `<li><a class="nav-hub-link" href="${asset(l.href)}" role="menuitem">
                  ${thumb}
                  <span class="nav-hub-text">
                    <span class="nav-hub-link-title">${l.label}</span>
                    ${l.desc ? `<span class="nav-hub-link-desc">${l.desc}</span>` : ""}
                  </span>
                  <span class="nav-hub-arrow" aria-hidden="true">→</span>
                </a></li>`;
            })
            .join("");
          const activeParent = item.id === document.body.dataset.nav ? " is-active" : "";
          return `<li class="nav-item has-dropdown nav-dest-hub${activeParent}">
            <button type="button" class="nav-dropdown-trigger nav-rail-link nav-link-animated" aria-expanded="false" aria-haspopup="true">
              <span>${item.label}</span>
              <svg class="nav-chevron" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
            </button>
            <div class="nav-dropdown nav-dropdown--hub" role="menu"><ul>${menuLinks}</ul></div>
          </li>`;
        }
        if (item.mega) {
          const cols = item.columns.map(renderMegaColumn).join("");
          const cta = item.megaCta
            ? `<a class="nav-mega-cta" href="${asset(item.megaCta.href)}">${item.megaCta.label}</a>`
            : "";
          const megaClass = item.id === "wildlife" ? " nav-wildlife-mega" : "";
          const activeParent = item.id === document.body.dataset.nav ? " is-active" : "";
          return `<li class="nav-item has-dropdown has-mega${megaClass}${activeParent}">
            <button type="button" class="nav-dropdown-trigger nav-rail-link nav-link-animated" aria-expanded="false" aria-haspopup="true">
              <span>${item.label}</span>
              <svg class="nav-chevron" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
            </button>
            <div class="nav-dropdown nav-mega" role="menu">${cols}${cta}</div>
          </li>`;
        }
        if (item.href) {
          const active = isActive(item) ? ' class="is-active"' : "";
          return `<li${active}>${renderNavLink(item)}</li>`;
        }
        return "";
      })
      .join("");

    function buildDrawerNav() {
      const primary = navItems
        .map((item) => {
          if (item.groups) return renderDrawerAbout(item);
          if (item.href && !item.dropdown && !item.mega) {
            const active = isActive(item) ? ' aria-current="page"' : "";
            return `<li><a class="nav-drawer-tile" href="${item.href}"${active}>${item.label}</a></li>`;
          }
          if (item.dropdown) {
            const subs = item.dropdown
              .map(
                (l) =>
                  `<li><a href="${asset(l.href)}"><span class="nav-drawer-sub-title">${l.label}</span>${l.desc ? `<span class="nav-drawer-sub-desc">${l.desc}</span>` : ""}</a></li>`
              )
              .join("");
            return `<li class="nav-drawer-group">
              <button type="button" class="nav-drawer-accordion nav-drawer-tile" aria-expanded="false" data-drawer-accordion>${item.label}</button>
              <ul class="nav-drawer-sub">${subs}</ul>
            </li>`;
          }
          if (item.mega) {
            const subs = item.columns
              .flatMap((col) => col.links)
              .map((l) => `<li><a href="${asset(l.href)}">${l.label}</a></li>`)
              .join("");
            const cta = item.megaCta
              ? `<li><a class="nav-drawer-sub-cta" href="${asset(item.megaCta.href)}">${item.megaCta.label}</a></li>`
              : "";
            return `<li class="nav-drawer-group">
              <button type="button" class="nav-drawer-accordion nav-drawer-tile" aria-expanded="false" data-drawer-accordion>${item.label}</button>
              <ul class="nav-drawer-sub">${subs}${cta}</ul>
            </li>`;
          }
          return "";
        })
        .join("");

      const secondary = drawerLinks
        .map((l) => `<li class="nav-drawer-secondary"><a class="nav-drawer-tile" href="${asset(l.href)}">${l.label}</a></li>`)
        .join("");

      return `${primary}
        <li class="nav-drawer-divider" aria-hidden="true"></li>
        ${secondary}`;
    }

    const drawer = buildDrawerNav();

    return `<header class="site-header site-header--rail" data-header>
      <nav class="nav-pill nav-rail" aria-label="Primary">
        <a class="nav-brand" href="${asset("index.html")}" aria-label="Endemic Birds Tanzania home">
          <img class="nav-brand-logo nav-brand-logo--on-light" src="${asset(logoOnLight)}" alt="Endemic Birds Tanzania" width="240" height="56" decoding="async" />
          <img class="nav-brand-logo nav-brand-logo--on-dark" src="${asset(logoOnDark)}" alt="" width="240" height="56" decoding="async" aria-hidden="true" />
        </a>
        <div class="nav-panel" id="nav-panel">
          <ul class="nav-links nav-rail-links">${links}</ul>
        </div>
        <div class="nav-rail-actions">
          <button type="button" class="nav-search" data-site-search-open aria-label="Search site">
            <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          </button>
          <a class="nav-book nav-book--safari" href="${asset("plan-your-trip/index.html")}" aria-label="Book a safari">
            <i class="fa-solid fa-plane-departure nav-book-icon" aria-hidden="true"></i>
            <span class="nav-book-label">Book a safari</span>
          </a>
          <button type="button" class="nav-menu-btn" aria-expanded="false" aria-controls="nav-drawer" data-nav-menu-btn aria-label="Open menu">
            <span class="nav-menu-btn-lines" aria-hidden="true"></span>
          </button>
        </div>
      </nav>
    </header>
    <div class="nav-drawer-backdrop" data-nav-drawer-backdrop aria-hidden="true"></div>
    <aside class="nav-drawer" id="nav-drawer" aria-label="Site menu" aria-hidden="true">
      <div class="nav-drawer-head">
        <button type="button" class="nav-drawer-close" data-nav-drawer-close aria-label="Close menu">×</button>
        <h2>Menu</h2>
      </div>
      <ul class="nav-drawer-links">${drawer}</ul>
      <div class="nav-drawer-foot">
        <a class="nav-drawer-book btn btn-solid" href="${asset("plan-your-trip/index.html")}"><i class="fa-solid fa-plane-departure" aria-hidden="true"></i> Book a safari</a>
        <p class="nav-drawer-note">Specialist birding safaris · Iringa, Tanzania</p>
      </div>
    </aside>`;
  }

  function buildSearchPanel() {
    return `<div class="site-search" id="site-search" aria-hidden="true" role="dialog" aria-label="Search the site">
      <div class="site-search-backdrop" data-site-search-backdrop aria-hidden="true"></div>
      <div class="site-search-panel">
        <div class="site-search-head">
          <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <input type="search" data-site-search-input placeholder="Packages, parks, destinations…" autocomplete="off" spellcheck="false" />
          <button type="button" class="site-search-close" data-site-search-close aria-label="Close search">×</button>
        </div>
        <ul class="site-search-results" data-site-search-results>
          <li class="site-search-hint">Start typing to search all packages and destinations</li>
        </ul>
      </div>
    </div>`;
  }

  function mountWhatsAppFab() {
    if (!document.querySelector(".fab-whatsapp")) {
      document.body.insertAdjacentHTML(
        "beforeend",
        `<a class="fab-whatsapp" href="https://wa.me/255627013348" rel="noopener noreferrer"></a>`
      );
    }
    document.querySelectorAll(".fab-whatsapp").forEach((fab) => {
      if (fab.dataset.fabReady) return;
      fab.dataset.fabReady = "true";
      fab.classList.add("fab-whatsapp--enriched");
      fab.setAttribute("aria-label", "Plan your safari with Leons on WhatsApp");
      const href = fab.getAttribute("href") || "https://wa.me/255627013348";
      fab.setAttribute("href", href);
      fab.innerHTML = `<span class="fab-whatsapp-pulse" aria-hidden="true"></span>
        <span class="fab-whatsapp-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.511-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </span>
        <span class="fab-whatsapp-label">Plan with Leons</span>`;
    });
  }

  function footerLink(href, label) {
    return `<li><a href="${href}">${label}</a></li>`;
  }

  const FOOTER_SOCIAL_FALLBACK = {
    facebook: "https://www.facebook.com/search/top?q=endemic%20birds%20tanzania",
    instagram: "https://www.instagram.com/explore/tags/tanzaniabirding/",
    tripadvisor: "https://www.tripadvisor.com/Search?q=Endemic+Birds+Tanzania",
    youtube: "https://www.youtube.com/results?search_query=Endemic+Birds+Tanzania+birding",
  };

  function resolveSocialUrl(social, key) {
    const raw = social?.[key];
    if (raw && String(raw).trim() && raw !== "#") return String(raw).trim();
    return FOOTER_SOCIAL_FALLBACK[key] || "";
  }

  function buildFooterSocial(site) {
    const contact = site?.contact || {};
    const social = site?.social || {};
    const email = contact.email || "info@endemicbirds.co.tz";
    const wa = contact.whatsapp || "https://wa.me/255627013348";

    const items = [
      { brand: "email", href: `mailto:${email}`, icon: "fa-solid fa-envelope", label: "Email us" },
      { brand: "facebook", href: resolveSocialUrl(social, "facebook"), icon: "fa-brands fa-facebook-f", label: "Facebook" },
      { brand: "instagram", href: resolveSocialUrl(social, "instagram"), icon: "fa-brands fa-instagram", label: "Instagram" },
      { brand: "tripadvisor", href: resolveSocialUrl(social, "tripadvisor"), icon: "fa-brands fa-tripadvisor", label: "TripAdvisor" },
      { brand: "youtube", href: resolveSocialUrl(social, "youtube"), icon: "fa-brands fa-youtube", label: "YouTube" },
      { brand: "whatsapp", href: wa, icon: "fa-brands fa-whatsapp", label: "WhatsApp" },
    ].filter((item) => item.href);

    const tripadvisorMark = `<svg class="footer-social-ta" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 64" width="22" height="15" aria-hidden="true" focusable="false"><g fill="currentColor"><path d="M10 20 18 6 22 24Z M86 20 78 6 74 24Z"/><path d="M15 23.5Q48 9 81 23.5V29Q48 17 15 29Z"/><path fill-rule="evenodd" d="M30 36m-15 0a15 15 0 1 0 30 0a15 15 0 1 0 -30 0M30 36m-8.5 0a8.5 8.5 0 1 1 17 0a8.5 8.5 0 1 1 -17 0"/><path fill-rule="evenodd" d="M66 36m-15 0a15 15 0 1 0 30 0a15 15 0 1 0 -30 0M66 36m-8.5 0a8.5 8.5 0 1 1 17 0a8.5 8.5 0 1 1 -17 0"/><circle cx="30" cy="36" r="5.25"/><circle cx="66" cy="36" r="5.25"/><path d="M48 41.5 43.2 50.5h9.6Z"/></g></svg>`;

    return items
      .map((item, i) => {
        const iconInner =
          item.brand === "tripadvisor"
            ? tripadvisorMark
            : `<i class="${item.icon}" aria-hidden="true"></i>`;
        return `<a class="footer-social-link footer-social-link--${item.brand}" href="${item.href}"${
          item.brand === "email" ? "" : ' target="_blank" rel="noopener noreferrer"'
        } aria-label="${item.label}"><span class="footer-social-link__icon" aria-hidden="true">${iconInner}</span></a>`;
      })
      .join("");
  }

  function buildFooter(site, logoOnDark, footerBg) {
    const year = new Date().getFullYear();
    const footerPhoto = rootMediaUrl(footerBg);
    const contact = site?.contact || {};
    const location = contact.location || "Iringa, Tanzania";
    const phone = contact.phone || "+255 627 013 348";
    const phoneTel = contact.phoneTel || "+255627013348";
    const email = contact.email || "info@endemicbirds.co.tz";
    const blurb =
      site?.footerBlurb ||
      "Specialist birding and wildlife safaris from Tanzania – tailor-made routes across East Africa.";
    const plan = asset("plan-your-trip/index.html");

    const exploreLinks = [
      footerLink(asset("birding/index.html"), "Birding safaris"),
      footerLink(asset("wildlife/index.html"), "Wildlife safaris"),
      footerLink(asset("combined/index.html"), "Birding + wildlife"),
      footerLink(asset("packages/index.html"), "Safari packages"),
      footerLink(asset("destinations/index.html"), "All destinations"),
      footerLink(asset("destinations/birding/index.html"), "Birding circuits"),
      footerLink(asset("about/index.html"), "About us"),
    ].join("");

    const quickLinks = [
      footerLink(asset("plan-your-trip/index.html"), "Plan your trip"),
      footerLink(asset("accommodations/index.html"), "Safari stays"),
      footerLink(asset("birding/special-birds/index.html"), "Special birds"),
      footerLink(asset("about/trip-reports/index.html"), "Trip reports"),
      footerLink(asset("about/gallery/index.html"), "Gallery"),
      footerLink(asset("about/team/index.html"), "Our team"),
      footerLink(asset("about/why-choose-us/index.html"), "Why choose us"),
      footerLink(asset("about/partners/index.html"), "Our partners"),
      footerLink(asset("about/tour-training/index.html"), "Tour training"),
      footerLink(asset("birding/index.html#journeys"), "Birding journeys"),
      footerLink(asset("wildlife/index.html#activities"), "Safari experiences"),
      footerLink(`${asset("index.html")}#packages`, "Featured packages"),
      footerLink(`${asset("index.html")}#reviews`, "Guest reviews"),
      footerLink(asset("privacy/index.html"), "Privacy policy"),
      footerLink(asset("about/policies/booking-terms/index.html"), "Booking terms"),
    ].join("");

    return `<footer class="site-footer site-footer--photo" style="--footer-photo: url('${footerPhoto}')">
      <div class="site-footer-scrim" aria-hidden="true"></div>
      <div class="container footer-grid footer-grid--rich reveal-stagger" data-reveal-stagger>
        <div class="footer-brand footer-brand-col">
          <a class="footer-brand-lockup" href="${asset("index.html")}">
            <img class="footer-brand-logo-full" src="${asset(logoOnDark)}" alt="Endemic Birds Tanzania" width="300" height="72" decoding="async" />
          </a>
          <p class="footer-tagline footer-tagline--soft">Birding &amp; wildlife · East Africa</p>
          <p class="footer-blurb">${blurb}</p>
          <div class="footer-cta-row">
            <a class="footer-cta footer-cta--primary" href="${plan}"><i class="fa-solid fa-plane-departure" aria-hidden="true"></i> Book a safari</a>
            <a class="footer-cta footer-cta--ghost" href="${contact.whatsapp || "https://wa.me/255627013348"}" rel="noopener noreferrer"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i> WhatsApp Leons</a>
          </div>
          <div class="footer-social footer-social--calm" aria-label="Social media">${buildFooterSocial(site)}</div>
        </div>
        <div class="footer-links-row">
          <div class="footer-col footer-col--links">
            <p class="footer-col-title">Explore</p>
            <ul class="footer-link-list">${exploreLinks}</ul>
          </div>
          <div class="footer-col footer-col--links">
            <p class="footer-col-title">Quick links</p>
            <ul class="footer-link-list footer-link-list--dense footer-link-list--two-col">${quickLinks}</ul>
          </div>
        </div>
        <div class="footer-col footer-contact">
          <p class="footer-col-title">Contact</p>
          <ul class="footer-contact-list">
            <li><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${location}</li>
            <li><a href="tel:${phoneTel}"><i class="fa-solid fa-phone" aria-hidden="true"></i> ${phone}</a></li>
            <li><a href="mailto:${email}"><i class="fa-solid fa-envelope" aria-hidden="true"></i> ${email}</a></li>
          </ul>
        </div>
      </div>
      <div class="container footer-bottom footer-bottom--rich reveal-fade-up" data-reveal data-reveal-mirror>
        <p>© ${year} Endemic Birds &amp; Wildlife Experiences Ltd.</p>
        <nav class="footer-bottom-links" aria-label="Footer legal">
          <a href="${asset("about/index.html")}">About</a>
          <a href="${asset("about/index.html#contact")}">Contact</a>
          <a href="${asset("privacy/index.html")}">Privacy</a>
          <a href="${plan}">Enquire</a>
        </nav>
      </div>
    </footer>`;
  }

  function usesCompactFooter() {
    return Boolean(document.body.dataset.detail);
  }

  function buildFooterCompact(site) {
    const year = new Date().getFullYear();
    const contact = site?.contact || {};
    const location = contact.location || "Iringa, Tanzania";
    const phone = contact.phone || "+255 627 013 348";
    const phoneTel = contact.phoneTel || "+255627013348";
    const email = contact.email || "info@endemicbirds.co.tz";
    const plan = asset("plan-your-trip/index.html");

    return `<footer class="site-footer site-footer--compact" role="contentinfo">
      <div class="container site-footer-compact">
        <div class="site-footer-compact__top">
          <a class="site-footer-compact__brand" href="${asset("index.html")}">Endemic Birds Tanzania</a>
          <p class="site-footer-compact__tagline">Specialist birding &amp; wildlife safaris · ${location}</p>
        </div>
        <ul class="site-footer-compact__contact">
          <li><a href="tel:${phoneTel}"><i class="fa-solid fa-phone" aria-hidden="true"></i> ${phone}</a></li>
          <li><a href="mailto:${email}"><i class="fa-solid fa-envelope" aria-hidden="true"></i> ${email}</a></li>
          <li><a href="${contact.whatsapp || "https://wa.me/255627013348"}" rel="noopener noreferrer"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i> WhatsApp</a></li>
        </ul>
        <div class="footer-social footer-social--calm site-footer-compact__social" aria-label="Social media">${buildFooterSocial(site)}</div>
        <nav class="site-footer-compact__legal" aria-label="Footer legal">
          <a href="${asset("about/index.html")}">About</a>
          <a href="${asset("about/index.html#contact")}">Contact</a>
          <a href="${asset("privacy/index.html")}">Privacy</a>
          <a href="${asset("about/policies/booking-terms/index.html")}">Booking terms</a>
          <a href="${plan}">Enquire</a>
        </nav>
        <p class="site-footer-compact__copy">© ${year} Endemic Birds &amp; Wildlife Experiences Ltd.</p>
      </div>
    </footer>`;
  }

  async function ensureSiteSearchScript() {
    if (window.EndemicSearch) return;
    let el = document.querySelector('script[src*="site-search.js"]');
    if (!el) {
      el = document.createElement("script");
      el.src = asset("assets/js/site-search.js");
      document.body.appendChild(el);
    }
    await new Promise((resolve) => {
      if (window.EndemicSearch) return resolve();
      el.addEventListener("load", () => resolve(), { once: true });
      el.addEventListener("error", () => resolve(), { once: true });
      setTimeout(resolve, 150);
    });
  }

  async function loadSite() {
    try {
      const res = await fetch(asset("content/site.json"));
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async function mountLayout() {
    const site = (await loadSite()) || {};
    const media = { ...DEFAULT_MEDIA, ...(site.media || {}) };
    const logoOnLight = media.brandLogo || DEFAULT_MEDIA.brandLogo;
    const logoOnDark = media.brandLogoLight || DEFAULT_MEDIA.brandLogoLight;
    const footerBg = media.footerBackground || DEFAULT_MEDIA.footerBackground;

    const headerEl = document.getElementById("site-header");
    const footerEl = document.getElementById("site-footer");
    if (headerEl) headerEl.outerHTML = buildNav({ onLight: logoOnLight, onDark: logoOnDark });
    if (footerEl) {
      if (usesCompactFooter()) {
        document.body.classList.add("has-footer-compact");
        footerEl.outerHTML = buildFooterCompact(site);
      } else {
        footerEl.outerHTML = buildFooter(site, logoOnDark, footerBg);
      }
    }

    const header = document.querySelector("[data-header]");
    if (header && !document.getElementById("site-search")) {
      header.insertAdjacentHTML("afterend", buildSearchPanel());
    }
    header?.classList.add("nav-is-ready");
    requestAnimationFrame(() => header?.classList.add("nav-is-visible"));

    mountWhatsAppFab();

    await ensureSiteSearchScript();

    if (!document.querySelector('script[src*="whatsapp-chat.js"]')) {
      const wa = document.createElement("script");
      wa.src = asset("assets/js/whatsapp-chat.js");
      wa.defer = true;
      document.body.appendChild(wa);
    }

    if (!document.querySelector('script[src*="endemic-media.js"]')) {
      const em = document.createElement("script");
      em.src = asset("assets/js/endemic-media.js");
      em.defer = true;
      document.head.appendChild(em);
    }

    if (!document.querySelector('script[src*="nav-motion.js"]')) {
      const navScript = document.createElement("script");
      navScript.src = asset("assets/js/nav-motion.js");
      navScript.defer = true;
      document.body.appendChild(navScript);
    }

    if (!document.querySelector('script[src*="motion.js"]')) {
      const motionScript = document.createElement("script");
      motionScript.src = asset("assets/js/motion.js");
      motionScript.defer = true;
      document.body.appendChild(motionScript);
    }

    const footerBgResolved =
      media.footerBackground && !media.footerBackground.includes("sticky section")
        ? media.footerBackground
        : DEFAULT_MEDIA.footerBackground;

    const layoutDetail = { media: { ...media, footerBackground: footerBgResolved } };
    queueMicrotask(() => {
      document.dispatchEvent(new CustomEvent("site:layout-ready", { detail: layoutDetail }));
      window.initNavMotion?.();
      window.initPageMotion?.();
      window.EndemicSearch?.initSearch?.();
    });
  }

  document.addEventListener("endemic:media-ready", () => {
    if (window.EndemicMedia?.applyStaticHeroes) window.EndemicMedia.applyStaticHeroes();
  });

  mountLayout();
})();
