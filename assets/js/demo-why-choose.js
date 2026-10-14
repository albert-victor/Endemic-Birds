(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const points = [
    {
      icon: "fa-binoculars",
      title: "Birding-first routes",
      short: "Habitats & targets first",
      body: "Itineraries built around habitats and target species – not wildlife loops with a bird list attached.",
      img: "../endemics/perfect-moment-bird-watching-1536x872.jpg",
    },
    {
      icon: "fa-people-group",
      title: "Max six guests",
      short: "Window seats always",
      body: "Window seats for everyone; second guide when the group needs more attention in the field.",
      img: "../assets/images/from-live-site/destinations/eastern-arc-mountain.jpg",
    },
    {
      icon: "fa-route",
      title: "Field-tested circuits",
      short: "Routes we walk first",
      body: "We walk routes before we sell them – pace adapts to listers, photographers and first-time birders.",
      img: "../assets/images/from-live-site/destinations/northern-destination.jpg",
    },
    {
      icon: "fa-leaf",
      title: "Indigenous guides",
      short: "Calls, culture, field craft",
      body: "East African leaders who know calls, culture and the less-known stops that make a safari memorable.",
      img: "../assets/images/from-live-site/destinations/southern-destination.jpg",
    },
  ];

  document.querySelectorAll("[data-why-w1]").forEach((root) => {
    const lines = [...root.querySelectorAll("[data-why-w1-line]")];
    lines.forEach((li, i) => {
      li.addEventListener("mouseenter", () => {
        lines.forEach((l, j) => l.classList.toggle("is-highlight", j === i));
      });
      li.addEventListener("mouseleave", () => {
        lines.forEach((l) => l.classList.remove("is-highlight"));
      });
      li.addEventListener("focusin", () => {
        lines.forEach((l, j) => l.classList.toggle("is-highlight", j === i));
      });
    });
  });

  document.querySelectorAll("[data-why-w2]").forEach((root) => {
    const chips = [...root.querySelectorAll("[data-why-w2-chip]")];
    const detail = root.querySelector("[data-why-w2-detail]");
    function go(i) {
      chips.forEach((c, j) => c.classList.toggle("is-active", j === i));
      if (detail && points[i]) detail.textContent = points[i].body;
    }
    chips.forEach((c, i) => c.addEventListener("click", () => go(i)));
    go(0);
  });

  document.querySelectorAll("[data-why-w3]").forEach((root) => {
    const btns = [...root.querySelectorAll("[data-why-w3-rail]")];
    btns.forEach((btn, i) => {
      btn.addEventListener("click", () => {
        btns.forEach((b, j) => b.classList.toggle("is-active", j === i));
      });
    });
    if (btns[0]) btns[0].classList.add("is-active");
  });

  document.querySelectorAll("[data-why-w4]").forEach((root) => {
    const stack = root.querySelector("[data-why-w4-stack]");
    const items = [...root.querySelectorAll("[data-why-w4-rotate]")];
    const dots = [...root.querySelectorAll("[data-why-w4-dot]")];
    let index = 0;
    let timer;

    function setBg(i) {
      if (!stack) return;
      stack.querySelectorAll(".why-bg-media").forEach((el, j) => {
        el.classList.toggle("is-active", j === i);
      });
    }

    function go(i, user) {
      index = i;
      items.forEach((el, j) => el.classList.toggle("is-active", j === i));
      dots.forEach((d, j) => d.classList.toggle("is-active", j === i));
      setBg(i);
      if (user) resetTimer();
    }

    function resetTimer() {
      clearInterval(timer);
      if (reduce) return;
      timer = setInterval(() => go((index + 1) % points.length, false), 5000);
    }

    dots.forEach((d, i) => d.addEventListener("click", () => go(i, true)));
    go(0, false);
    resetTimer();
    root.addEventListener("mouseenter", () => clearInterval(timer));
    root.addEventListener("mouseleave", resetTimer);
  });
})();
