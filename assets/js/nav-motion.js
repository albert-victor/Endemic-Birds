(function () {
  function initNavMotion() {
    const header = document.querySelector("[data-header]");
    if (header) {
      header.classList.add("nav-is-ready");
      requestAnimationFrame(() => {
        header.classList.add("nav-is-visible");
      });
    }

    document.querySelectorAll(".nav-links > li > a, .nav-dropdown-trigger, .nav-book").forEach((el) => {
      el.classList.add("nav-link-animated");
    });

    document.querySelectorAll(".nav-item.has-dropdown").forEach((item) => {
      const trigger = item.querySelector(".nav-dropdown-trigger");
      const panel = item.querySelector(".nav-dropdown");
      if (!trigger || !panel) return;

      let closeTimer;
      item.addEventListener("mouseenter", () => {
        clearTimeout(closeTimer);
        if (window.matchMedia("(min-width: 900px)").matches) {
          item.classList.add("is-hover");
          trigger.setAttribute("aria-expanded", "true");
        }
      });
      item.addEventListener("mouseleave", () => {
        closeTimer = window.setTimeout(() => {
          item.classList.remove("is-hover");
          trigger.setAttribute("aria-expanded", "false");
        }, 140);
      });
    });

    const drawer = document.getElementById("nav-drawer");
    drawer?.querySelectorAll(".nav-drawer-tile").forEach((tile, i) => {
      tile.style.setProperty("--nav-drawer-i", String(i));
    });
  }

  document.addEventListener("site:layout-ready", initNavMotion);
})();
