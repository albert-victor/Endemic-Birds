(function () {
  const WA_URL = "https://wa.me/255627013348";
  const LEON_PHOTO = () => {
    const p = window.__ASSET_PREFIX__ || "/";
    return p + "endemics/leons.jpg";
  };

  function ensureWidget() {
    if (document.getElementById("leon-chat-widget")) return;
    const html = `<div class="leon-chat" id="leon-chat-widget" aria-hidden="true">
      <button type="button" class="leon-chat__backdrop" data-leon-chat-close aria-label="Close chat" tabindex="-1"></button>
      <div class="leon-chat__panel" role="dialog" aria-label="Chat with Leon">
        <header class="leon-chat__head">
          <img class="leon-chat__avatar" src="" alt="Leon" width="44" height="44" data-leon-avatar />
          <div>
            <p class="leon-chat__name">Leon</p>
            <p class="leon-chat__status"><span class="leon-chat__dot" aria-hidden="true"></span> Usually replies soon</p>
          </div>
          <button type="button" class="leon-chat__close" data-leon-chat-close aria-label="Close chat">×</button>
        </header>
        <p class="leon-chat__day">Today</p>
        <div class="leon-chat__body">
          <div class="leon-chat__bubble leon-chat__bubble--in">
            <p>Hello &ndash; I'm Leon. I lead birding and wildlife safaris with Endemic Birds Tanzania.</p>
          </div>
          <div class="leon-chat__bubble leon-chat__bubble--in">
            <p>Share your dates and what you are hoping to see &ndash; forests, migration, endemics or coast &ndash; and I'll reply with an honest route we would take our own guests on.</p>
            <p class="leon-chat__services">Birding safaris · wildlife safaris · combined routes</p>
          </div>
        </div>
        <footer class="leon-chat__foot">
          <a class="leon-chat__send" href="${WA_URL}" target="_blank" rel="noopener noreferrer">
            <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
            <span>Continue on WhatsApp</span>
            <i class="fa-solid fa-arrow-up-right-from-square leon-chat__send-icon" aria-hidden="true"></i>
          </a>
        </footer>
      </div>
    </div>`;
    document.body.insertAdjacentHTML("beforeend", html);
    const img = document.querySelector("[data-leon-avatar]");
    if (img) img.src = LEON_PHOTO();
  }

  function openChat() {
    ensureWidget();
    const w = document.getElementById("leon-chat-widget");
    if (!w || w.classList.contains("is-open")) return;
    w.classList.add("is-open", "is-animating-in");
    w.setAttribute("aria-hidden", "false");
    document.body.classList.add("leon-chat-open");
    window.clearTimeout(w._leonAnimTimer);
    w._leonAnimTimer = window.setTimeout(() => {
      w.classList.remove("is-animating-in");
    }, 520);
  }

  function closeChat() {
    const w = document.getElementById("leon-chat-widget");
    if (!w || !w.classList.contains("is-open")) return;
    w.classList.add("is-animating-out");
    w.classList.remove("is-animating-in");
    window.clearTimeout(w._leonAnimTimer);
    w._leonAnimTimer = window.setTimeout(() => {
      w.classList.remove("is-open", "is-animating-out");
      w.setAttribute("aria-hidden", "true");
      document.body.classList.remove("leon-chat-open");
    }, 320);
  }

  function bindFab() {
    document.querySelectorAll(".fab-whatsapp").forEach((fab) => {
      if (fab.dataset.leonBound) return;
      fab.dataset.leonBound = "true";
      fab.addEventListener("click", (e) => {
        e.preventDefault();
        openChat();
      });
    });
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-leon-chat-close]")) {
      e.preventDefault();
      closeChat();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeChat();
  });

  document.addEventListener("site:layout-ready", bindFab);
  bindFab();

  const fabObserver = new MutationObserver(() => bindFab());
  if (document.body) {
    fabObserver.observe(document.body, { childList: true, subtree: true });
  }

  window.LeonChat = { open: openChat, close: closeChat };
})();
