(function () {
  let hoverBound = false;

  function bindDropdownHover() {
    if (hoverBound) return;
    const items = document.querySelectorAll(".nav-item.has-dropdown");
    if (!items.length) return;
    hoverBound = true;

    items.forEach((item) => {
      if (item.dataset.hoverBound) return;
      item.dataset.hoverBound = "1";
      const trigger = item.querySelector(".nav-dropdown-trigger");
      const panel = item.querySelector(".nav-dropdown");
      if (!trigger || !panel) return;

      let closeTimer;
      function syncNavDropdownBody() {
        const open = document.querySelector(".nav-item.has-dropdown.is-hover, .nav-item.has-dropdown.is-open");
        document.body.classList.toggle("nav-dropdown-open", Boolean(open));
      }

      item.addEventListener("mouseenter", () => {
        clearTimeout(closeTimer);
        if (!window.matchMedia("(min-width: 900px)").matches) return;
        item.classList.remove("is-suppressed");
        item.classList.add("is-hover");
        trigger.setAttribute("aria-expanded", "true");
        syncNavDropdownBody();
      });
      item.addEventListener("mouseleave", () => {
        closeTimer = window.setTimeout(() => {
          item.classList.remove("is-hover");
          if (!item.classList.contains("is-open")) {
            trigger.setAttribute("aria-expanded", "false");
          }
          syncNavDropdownBody();
        }, 160);
      });
    });
  }

  function initNavMotion() {
    const header = document.querySelector("[data-header]");
    if (!header) return;

    header.classList.add("nav-is-ready");
    requestAnimationFrame(() => header.classList.add("nav-is-visible"));

    document.querySelectorAll(".nav-links > li > a, .nav-dropdown-trigger, .nav-book").forEach((el) => {
      el.classList.add("nav-link-animated");
    });

    hoverBound = false;
    bindDropdownHover();

    const drawer = document.getElementById("nav-drawer");
    drawer?.querySelectorAll(".nav-drawer-tile").forEach((tile, i) => {
      tile.style.setProperty("--nav-drawer-i", String(i));
    });
  }

  window.initNavMotion = initNavMotion;

  document.addEventListener("site:layout-ready", initNavMotion);
  if (document.querySelector("[data-header]")) {
    initNavMotion();
  }
})();
