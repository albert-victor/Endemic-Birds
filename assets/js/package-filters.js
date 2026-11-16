(function () {
  const PARAM_KEYS = [
    "interest",
    "category",
    "circuit",
    "duration",
    "destination",
    "month",
    "intensity",
    "comfort",
    "accommodation",
  ];

  function formGet(fd, name) {
    const v = fd.get(name);
    return v != null && String(v).trim() !== "" ? String(v).trim() : "";
  }

  const CIRCUIT_TO_HUB = {
    Northern: "northern",
    Southern: "southern",
    Eastern: "eastern",
    Western: "western",
    "North West": "north-west",
  };

  /** Prefer slug/title + single hub over inflated multi-circuit tags from imports. */
  function inferPrimaryCircuit(pkg) {
    if (pkg.primaryCircuit) return pkg.primaryCircuit;
    const slug = String(pkg.slug || "").toLowerCase();
    const title = String(pkg.title || "").toLowerCase();
    const text = `${slug} ${title}`;

    if (/\bnorth[-\s]?west\b/.test(text)) return "North West";
    if (/\bsouthern\b/.test(text) && !/\bnorthern\b/.test(text)) return "Southern";
    if (/\bnorthern\b/.test(text) && !/\bsouthern\b/.test(text)) return "Northern";
    if (/\bwestern\b|\bmahale\b|\bgombe\b|\bkatavi\b/.test(text) && !/\bsouthern\b|\bnorthern\b/.test(text)) {
      return "Western";
    }
    if (/\beastern\b|\busambara\b|\bpemba\b|\bzanzibar\b/.test(text) && !/\bsouthern\b|\bnorthern\b|\bwestern\b/.test(text)) {
      return "Eastern";
    }

    const hubs = pkg.destinations || [];
    if (hubs.length === 1) {
      const hubToCircuit = {
        northern: "Northern",
        southern: "Southern",
        eastern: "Eastern",
        western: "Western",
        "north-west": "North West",
        "eastern-arc": "Eastern",
      };
      return hubToCircuit[hubs[0]] || null;
    }

    const circuits = pkg.circuits || [];
    if (circuits.length === 1) return circuits[0];
    return null;
  }

  function matchesCircuit(pkg, circuit) {
    if (!circuit || circuit === "all") return true;

    const primary = inferPrimaryCircuit(pkg);
    if (primary) return primary === circuit;

    const hub = CIRCUIT_TO_HUB[circuit];
    const hubs = pkg.destinations || [];
    const circuitSet = new Set(pkg.circuits || []);

    if (!circuitSet.has(circuit)) return false;
    if (!hub) return true;

    if (!hubs.includes(hub)) return false;
    if (hubs.length === 1) return true;

    /* Multi-region journeys without a clear primary: require hub in the route list. */
    return hubs.includes(hub);
  }

  function getInterest(fd) {
    return formGet(fd, "interest") || formGet(fd, "category") || "all";
  }

  function matchesMonth(meta, monthStr) {
    if (!monthStr || monthStr === "all") return true;
    const month = Number(monthStr);
    if (!month || month < 1 || month > 12) return true;
    const tagged = meta?.seasonMonths;
    if (!tagged?.length) return true;
    return tagged.includes(month);
  }

  function matchesIntensity(meta, value) {
    if (!value || value === "all") return true;
    if (!meta?.intensity) return true;
    return meta.intensity === value;
  }

  function matchesComfort(meta, value) {
    if (!value || value === "all") return true;
    if (!meta?.comfort) return true;
    return meta.comfort === value;
  }

  function matchesAccommodation(meta, value) {
    if (!value || value === "all") return true;
    const types = meta?.accommodationTypes;
    if (!types?.length) return true;
    return types.includes(value);
  }

  function filterPackage(pkg, meta, fd) {
    const interest = getInterest(fd);
    const duration = formGet(fd, "duration") || "all";
    const destination = formGet(fd, "destination") || "all";
    const circuit = formGet(fd, "circuit") || "all";
    const month = formGet(fd, "month") || "all";
    const intensity = formGet(fd, "intensity") || "all";
    const comfort = formGet(fd, "comfort") || "all";
    const accommodation = formGet(fd, "accommodation") || "all";

    if (interest !== "all" && pkg.category !== interest) return false;
    if (duration === "short" && pkg.durationDays > 10) return false;
    if (duration === "medium" && (pkg.durationDays < 11 || pkg.durationDays > 16)) return false;
    if (duration === "long" && pkg.durationDays < 17) return false;
    if (destination !== "all" && !(pkg.destinations || []).includes(destination)) return false;
    if (!matchesCircuit(pkg, circuit)) return false;

    const m = meta?.[pkg.slug] || {};
    if (!matchesMonth(m, month)) return false;
    if (!matchesIntensity(m, intensity)) return false;
    if (!matchesComfort(m, comfort)) return false;
    if (!matchesAccommodation(m, accommodation)) return false;
    return true;
  }

  function formToParams(form) {
    const fd = new FormData(form);
    const params = new URLSearchParams();
    const interest = getInterest(fd);
    if (interest && interest !== "all") params.set("interest", interest);
    const circuit = formGet(fd, "circuit");
    if (circuit && circuit !== "all") params.set("circuit", circuit);
    const duration = formGet(fd, "duration");
    if (duration && duration !== "all") params.set("duration", duration);
    const destination = formGet(fd, "destination");
    if (destination && destination !== "all") params.set("destination", destination);
    const month = formGet(fd, "month");
    if (month && month !== "all") params.set("month", month);
    const intensity = formGet(fd, "intensity");
    if (intensity && intensity !== "all") params.set("intensity", intensity);
    const comfort = formGet(fd, "comfort");
    if (comfort && comfort !== "all") params.set("comfort", comfort);
    const accommodation = formGet(fd, "accommodation");
    if (accommodation && accommodation !== "all") params.set("accommodation", accommodation);
    return params;
  }

  function applyParamsToForm(form, params) {
    const interestVal = params.get("interest") || params.get("category") || params.get("type");
    const map = {
      interest: interestVal,
      category: interestVal,
      circuit: params.get("circuit"),
      duration: params.get("duration"),
      destination: params.get("destination"),
      month: params.get("month"),
      intensity: params.get("intensity"),
      comfort: params.get("comfort"),
      accommodation: params.get("accommodation"),
    };
    for (const [name, value] of Object.entries(map)) {
      if (!value) continue;
      const el = form.elements.namedItem(name);
      if (el && "value" in el) el.value = value;
    }
  }

  function syncUrlFromForm(form, replace) {
    const params = formToParams(form);
    const qs = params.toString();
    const url = qs ? `${location.pathname}?${qs}` : location.pathname;
    if (replace) history.replaceState(null, "", url);
    else history.pushState(null, "", url);
  }

  function bindPackageFilters(form, options) {
    const { getPackages, getMeta, onResults, emptyEl, countEl, syncUrl = true } = options;
    let debounceTimer;

    function apply() {
      const fd = new FormData(form);
      const preset = options.defaultInterest;
      if (preset && !formGet(fd, "interest") && !formGet(fd, "category")) {
        fd.set("interest", preset);
        const el = form.querySelector('[name="interest"],[name="category"]');
        if (el) el.value = preset;
      }
      const meta = getMeta?.() || {};
      const filtered = getPackages().filter((p) => filterPackage(p, meta.packages || meta, fd));
      onResults(filtered, fd);
      if (emptyEl) emptyEl.hidden = filtered.length > 0;
      if (countEl) countEl.textContent = String(filtered.length);
      if (syncUrl) syncUrlFromForm(form, true);
    }

    function onChange() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(apply, 80);
    }

    form.addEventListener("change", onChange);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      apply();
    });
    form.querySelector("[data-clear-filters]")?.addEventListener("click", (e) => {
      e.preventDefault();
      form.reset();
      if (options.defaultInterest) {
        const el = form.querySelector('[name="interest"],[name="category"]');
        if (el) el.value = options.defaultInterest;
      }
      apply();
    });

    applyParamsToForm(form, new URLSearchParams(location.search));
    apply();
  }

  function buildPackagesQueryFromForm(form, packagesBase) {
    const params = formToParams(form);
    const base = (packagesBase || "packages/index.html").replace(/^\//, "");
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }

  window.EndemicPackageFilters = {
    filterPackage,
    matchesCircuit,
    inferPrimaryCircuit,
    bindPackageFilters,
    formToParams,
    applyParamsToForm,
    syncUrlFromForm,
    buildPackagesQueryFromForm,
    PARAM_KEYS,
  };
})();