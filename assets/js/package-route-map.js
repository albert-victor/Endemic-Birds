(function () {
  const prefix = () => window.__ASSET_PREFIX__ || "/";
  const asset = (p) => prefix() + String(p).replace(/^\//, "");

  let leafletReady;

  function loadLeaflet() {
    if (leafletReady) return leafletReady;
    leafletReady = new Promise((resolve, reject) => {
      if (window.L) {
        resolve(window.L);
        return;
      }
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      script.crossOrigin = "";
      script.onload = () => resolve(window.L);
      script.onerror = () => reject(new Error("Leaflet failed to load"));
      document.head.appendChild(script);
    });
    return leafletReady;
  }

  function staticFallback(host, stops, note) {
    host.innerHTML = `<p class="pkg-map-fallback" role="note">Interactive map unavailable – use the numbered route list above. ${note ? note : ""}</p>`;
  }

  async function initMap(host, stops, note) {
    if (!stops?.length) return;
    const points = stops.filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng));
    if (!points.length) {
      staticFallback(host, stops, note);
      return;
    }
    try {
      const L = await loadLeaflet();
      host.innerHTML = `<div class="pkg-map-canvas" tabindex="0" aria-label="Approximate route map"></div>
        <p class="pkg-map-attribution">© <a href="https://www.openstreetmap.org/copyright" rel="noopener noreferrer">OpenStreetMap</a> contributors · ${note ? note : "Approximate route only"}</p>`;
      const canvas = host.querySelector(".pkg-map-canvas");
      const map = L.map(canvas, { scrollWheelZoom: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 12,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);
      const bounds = [];
      points.forEach((s) => {
        const m = L.circleMarker([s.lat, s.lng], {
          radius: 8,
          color: "#2d4a3e",
          fillColor: "#c4a062",
          fillOpacity: 0.9,
          weight: 2,
        }).addTo(map);
        m.bindPopup(`<strong>${s.stop}. ${s.name}</strong><br>Days ${s.dayFrom}${s.dayTo && s.dayTo !== s.dayFrom ? `–${s.dayTo}` : ""}`);
        bounds.push([s.lat, s.lng]);
      });
      if (bounds.length > 1) {
        L.polyline(
          bounds,
          { color: "#3a5246", weight: 2, dashArray: "6 8", opacity: 0.65 }
        )
          .addTo(map)
          .bindTooltip("Approximate corridor – not surveyed GPS track", { permanent: false, sticky: true });
      }
      map.fitBounds(bounds, { padding: [24, 24] });
    } catch {
      staticFallback(host, stops, note);
    }
  }

  async function mountAll() {
    const slug = document.body.dataset.slug;
    if (!slug) return;
    const host = document.querySelector("[data-package-route-map]");
    if (!host || host.dataset.mapInit) return;

    const res = await fetch(asset("content/package-details.json"));
    if (!res.ok) return;
    const details = await res.json();
    const extra = details.bySlug?.[slug] || {};
    const stops = extra.routeStops;
    const note = host.dataset.mapNote || extra.mapNote || "";
    if (extra.showRouteMap !== true) return;

    if (!stops?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          host.dataset.mapInit = "true";
          initMap(host, stops, note);
        });
      },
      { rootMargin: "120px" }
    );
    observer.observe(host);
  }

  document.addEventListener("site:content-rendered", mountAll);
  queueMicrotask(mountAll);
})();