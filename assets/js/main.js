(function () {
  let headerBound = false;

  function bindHeader() {
    const header = document.querySelector("[data-header]");
    if (!header) return;
    if (headerBound) {
      window.__refreshHeaderState?.();
      return;
    }
    headerBound = true;
    const navPanel = document.getElementById("nav-panel");
    const menuBtn = document.querySelector("[data-nav-menu-btn]");
    const drawer = document.getElementById("nav-drawer");
    const drawerBackdrop = document.querySelector("[data-nav-drawer-backdrop]");
    const mobileMq = window.matchMedia("(max-width: 899px)");
    let lastScrollY = window.scrollY;
    let ticking = false;

    function isDrawerOpen() {
      return Boolean(drawer?.classList.contains("is-open"));
    }

    function setHeaderState() {
      if (!header) return;
      const hero = document.querySelector(".hero-push, .hero--landing, .hero, .page-hero");
      const heroEnd = hero ? hero.offsetTop + hero.offsetHeight : 0;
      const y = window.scrollY;
      const desktop = window.matchMedia("(min-width: 900px)").matches;
      const revealNav = Boolean(document.querySelector(".hero-push"));

      header.dataset.scrolled = y > 24 ? "true" : "false";
      header.classList.toggle("is-compact", y > 48);

      if (revealNav) {
        document.body.classList.add("has-reveal-nav");
        const revealThreshold = Math.min(heroEnd * 0.08, 88);
        const showBar = y > revealThreshold;
        header.classList.remove("is-nav-reveal-hidden");
        header.classList.toggle("is-nav-reveal-visible", showBar);
      } else {
        document.body.classList.remove("has-reveal-nav");
        header.classList.remove("is-nav-reveal-hidden", "is-nav-reveal-visible");
      }

      if (y > Math.min(heroEnd * 0.35, 420)) {
        header.classList.add("is-clear-of-hero");
      } else {
        header.classList.remove("is-clear-of-hero");
      }

      const navHiddenForReveal = header.classList.contains("is-nav-reveal-hidden");
      if (navHiddenForReveal || isDrawerOpen()) {
        header.classList.remove("is-hidden");
      } else if (y > 120 && y > lastScrollY + 6) {
        header.classList.add("is-hidden");
      } else if (y < lastScrollY - 6 || y < 80) {
        header.classList.remove("is-hidden");
      }
      lastScrollY = y;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        setHeaderState();
      });
    }

    window.__refreshHeaderState = setHeaderState;
    setHeaderState();
    window.addEventListener("scroll", onScroll, { passive: true });

    function closeDropdowns(except) {
      document.querySelectorAll(".nav-item.has-dropdown").forEach((item) => {
        if (except && item === except) return;
        item.classList.remove("is-open");
        item.querySelector(".nav-dropdown-trigger")?.setAttribute("aria-expanded", "false");
      });
    }

    document.querySelectorAll(".nav-dropdown-trigger").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (mobileMq.matches) return;
        e.preventDefault();
        e.stopPropagation();
        const item = btn.closest(".nav-item");
        if (!item) return;
        const open = !item.classList.contains("is-open");
        closeDropdowns();
        if (open) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
        header?.classList.remove("is-hidden");
      });
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".nav-item.has-dropdown")) closeDropdowns();
    });

    function setDrawer(open) {
      drawer?.classList.toggle("is-open", open);
      drawerBackdrop?.classList.toggle("is-open", open);
      header?.classList.toggle("nav-is-open", open);
      menuBtn?.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      drawer?.setAttribute("aria-hidden", open ? "false" : "true");
      drawerBackdrop?.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.classList.toggle("nav-drawer-open", open);
      if (open) {
        header?.classList.remove("is-hidden");
        drawer?.classList.remove("nav-drawer-stagger");
        void drawer?.offsetWidth;
        drawer?.classList.add("nav-drawer-stagger");
      } else {
        drawer?.classList.remove("nav-drawer-stagger");
        setHeaderState();
      }
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeDropdowns();
        setDrawer(false);
      }
    });

    menuBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      setDrawer(!isDrawerOpen());
    });

    drawerBackdrop?.addEventListener("click", () => setDrawer(false));
    document.querySelector("[data-nav-drawer-close]")?.addEventListener("click", () => setDrawer(false));
    drawer?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setDrawer(false)));

    drawer?.querySelectorAll("[data-drawer-accordion]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const group = btn.closest(".nav-drawer-group");
        if (!group) return;
        const open = !group.classList.contains("is-open");
        drawer.querySelectorAll(".nav-drawer-group.is-open").forEach((g) => {
          if (g === group) return;
          g.classList.remove("is-open");
          g.querySelector("[data-drawer-accordion]")?.setAttribute("aria-expanded", "false");
        });
        group.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });

    navPanel?.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeDropdowns());
    });

    mobileMq.addEventListener("change", () => {
      setDrawer(false);
      closeDropdowns();
    });

    setDrawer(false);
  }

  function bindForms() {
    document.querySelectorAll("[data-inquiry-form]").forEach((form) => {
      const useFormSubmit = form.dataset.formSubmit === "true";
      form.addEventListener("submit", (e) => {
        if (!useFormSubmit) {
          e.preventDefault();
          const prefix = window.__ASSET_PREFIX__ || "/";
          window.location.href = prefix + "plan-your-trip/index.html";
        }
      });
    });
  }

  function prefillInquiry() {
    const form = document.querySelector("[data-inquiry-form]");
    const params = new URLSearchParams(location.search);
    const journey = params.get("journey");
    const destination = params.get("destination");
    const interest = params.get("interest");
    if (!form) return;
    if (interest) {
      const field = form.querySelector(`[name=interest][value="${interest}"]`);
      if (field) field.checked = true;
    }
    const messageField = form.querySelector("[name=message]");
    if (messageField && (journey || destination)) {
      const parts = [];
      if (journey) parts.push(`Interested in journey: ${journey}`);
      if (destination) parts.push(`Preferred destination: ${destination}`);
      messageField.value = parts.join("\n");
    }
  }

  function applySiteMedia(event) {
    const media = event?.detail?.media;
    if (!media) return;

    const cssUrl = window.EndemicMedia?.cssUrl;
    const url = (path) =>
      cssUrl ? cssUrl(path) : (window.__ASSET_PREFIX__ || "/") + String(path).replace(/^\//, "");

    const aboutHero = document.querySelector("[data-about-hero]");
    if (aboutHero && media.aboutHero) {
      aboutHero.style.setProperty("--page-hero-img", `url('${url(media.aboutHero)}')`);
    }
    const aboutInline = document.querySelector("[data-about-inline-img]");
    if (aboutInline && media.aboutInline) {
      aboutInline.src = url(media.aboutInline);
    }
  }

  function onLayoutReady(e) {
    bindHeader();
    bindForms();
    prefillInquiry();
    applySiteMedia(e);
    window.__refreshHeaderState?.();
  }

  document.addEventListener("site:layout-ready", onLayoutReady);

  document.addEventListener("site:content-rendered", () => {
    window.__refreshHeaderState?.();
    window.EndemicMedia?.applyStaticHeroes?.();
  });

  queueMicrotask(() => {
    if (document.querySelector("[data-header]") && !window.__refreshHeaderState) {
      onLayoutReady({ detail: {} });
    }
  });
})();
