(function () {
  const root = document.querySelector("[data-hero-safari-search]");
  if (!root) return;

  const prefix = window.__ASSET_PREFIX__ || "/";
  const packagesUrl = prefix + "packages/index.html";

  const monthOptions = [
    ["all", "Any month"],
    ["1", "January"],
    ["2", "February"],
    ["3", "March"],
    ["4", "April"],
    ["5", "May"],
    ["6", "June"],
    ["7", "July"],
    ["8", "August"],
    ["9", "September"],
    ["10", "October"],
    ["11", "November"],
    ["12", "December"],
  ]
    .map(([v, label]) => `<option value="${v}">${label}</option>`)
    .join("");

  const fieldsHtml = `
    <label class="hero-safari-dock__field">
      <span class="hero-safari-dock__label">Safari interest</span>
      <select name="interest" class="hero-safari-select">
        <option value="all">Any</option>
        <option value="birding">Birding</option>
        <option value="wildlife">Wildlife</option>
        <option value="combined">Birding + wildlife</option>
      </select>
    </label>
    <label class="hero-safari-dock__field">
      <span class="hero-safari-dock__label">Circuit</span>
      <select name="circuit" class="hero-safari-select">
        <option value="all">Any</option>
        <option value="Northern">Northern</option>
        <option value="Southern">Southern</option>
        <option value="Eastern">Eastern</option>
        <option value="Western">Western</option>
        <option value="North West">North West</option>
      </select>
    </label>
    <label class="hero-safari-dock__field">
      <span class="hero-safari-dock__label">Travel month</span>
      <select name="month" class="hero-safari-select">${monthOptions}</select>
    </label>`;

  root.innerHTML = `
    <button type="button" class="hero-safari-dock__trigger" data-hero-safari-open aria-haspopup="dialog">
      Find your safari
    </button>
    <form class="hero-safari-dock__bar" data-hero-safari-form aria-label="Find a safari">
      ${fieldsHtml}
      <button type="submit" class="hero-safari-dock__submit btn btn-solid">Find a safari</button>
      <a class="hero-safari-dock__more" href="${packagesUrl}">More filters</a>
      <p class="hero-safari-dock__hint">Travel month suggests typical season – enquire to confirm lodges and permits.</p>
    </form>
    <dialog class="hero-safari-panel" data-hero-safari-dialog aria-label="Find your safari">
      <form class="hero-safari-panel__inner" data-hero-safari-mobile-form>
        <header class="hero-safari-panel__head">
          <h2 class="hero-safari-panel__title">Find your safari</h2>
          <button type="button" class="hero-safari-panel__close" data-hero-safari-close aria-label="Close">×</button>
        </header>
        ${fieldsHtml}
        <p class="hero-safari-dock__hint">Month filters suggest season timing only – enquire for live availability.</p>
        <button type="submit" class="btn btn-solid hero-safari-panel__go">Find a safari</button>
        <p class="hero-safari-panel__advanced">
          <a href="${packagesUrl}">Duration, comfort &amp; field intensity →</a>
        </p>
      </form>
    </dialog>
  `;

  const form = root.querySelector("[data-hero-safari-form]");
  const dialog = root.querySelector("[data-hero-safari-dialog]");
  const openBtn = root.querySelector("[data-hero-safari-open]");
  const mobileForm = root.querySelector("[data-hero-safari-mobile-form]");

  function syncCustomSelects(container) {
    container?.querySelectorAll(".hero-custom-select").forEach((wrap) => {
      const select = wrap.querySelector("select");
      const selected = wrap.querySelector('[role="option"][aria-selected="true"]');
      if (select && selected?.dataset?.value != null) select.value = selected.dataset.value;
    });
  }

  function pulseSubmit(btn) {
    if (!btn) return;
    btn.classList.add("is-searching");
    window.setTimeout(() => btn.classList.remove("is-searching"), 520);
  }

  function goToCatalog(fromForm, submitBtn) {
    syncCustomSelects(fromForm);
    pulseSubmit(submitBtn);
    const href =
      window.EndemicPackageFilters?.buildPackagesQueryFromForm(fromForm, packagesUrl) || packagesUrl;
    window.setTimeout(() => {
      location.href = href;
    }, 220);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    goToCatalog(form, form.querySelector(".hero-safari-dock__submit"));
  });

  mobileForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    goToCatalog(mobileForm, mobileForm.querySelector(".hero-safari-panel__go"));
    dialog?.close();
  });

  openBtn?.addEventListener("click", () => {
    root.classList.add("hero-safari-dock--open");
    if (dialog?.showModal) dialog.showModal();
    else dialog?.setAttribute("open", "");
  });

  dialog?.addEventListener("close", () => {
    root.classList.remove("hero-safari-dock--open");
  });
  root.querySelector("[data-hero-safari-close]")?.addEventListener("click", () => dialog?.close());

  function mountCustomSelect(field) {
    const select = field.querySelector("select");
    if (!select || select.dataset.customSelect) return;
    select.dataset.customSelect = "1";

    const wrap = document.createElement("div");
    wrap.className = "hero-custom-select";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "hero-custom-select__trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");

    const list = document.createElement("ul");
    list.className = "hero-custom-select__menu";
    list.setAttribute("role", "listbox");
    list.hidden = true;

    const syncTrigger = () => {
      const opt = select.options[select.selectedIndex];
      trigger.textContent = opt ? opt.textContent : "Choose";
    };
    syncTrigger();

    [...select.options].forEach((opt) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.dataset.value = opt.value;
      li.textContent = opt.textContent;
      if (opt.selected) li.setAttribute("aria-selected", "true");
      li.addEventListener("click", (e) => {
        e.stopPropagation();
        select.value = opt.value;
        syncTrigger();
        list.querySelectorAll('[role="option"]').forEach((o) => o.setAttribute("aria-selected", "false"));
        li.setAttribute("aria-selected", "true");
        list.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });
      list.appendChild(li);
    });

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = list.hidden;
      root.querySelectorAll(".hero-custom-select__menu").forEach((m) => {
        if (m !== list) m.hidden = true;
      });
      root.querySelectorAll(".hero-custom-select__trigger").forEach((t) => {
        if (t !== trigger) t.setAttribute("aria-expanded", "false");
      });
      list.hidden = !open;
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
    });

    select.classList.add("hero-custom-select__native");
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");

    field.insertBefore(wrap, select);
    wrap.append(trigger, list, select);
  }

  root.querySelectorAll(".hero-safari-dock__field").forEach(mountCustomSelect);

  document.addEventListener("click", (e) => {
    if (e.target.closest(".hero-custom-select")) return;
    root.querySelectorAll(".hero-custom-select__menu").forEach((m) => {
      m.hidden = true;
    });
    root.querySelectorAll(".hero-custom-select__trigger").forEach((t) => t.setAttribute("aria-expanded", "false"));
  });
})();