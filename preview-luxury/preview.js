const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let revealObserver = null;

function isStaggerItem(el) {
  return Boolean(el.parentElement?.hasAttribute("data-reveal-stagger"));
}

function revealMirrors(el) {
  if (el.hasAttribute("data-reveal-once")) return false;
  if (isStaggerItem(el)) return true;
  return el.hasAttribute("data-reveal") || el.classList.contains("reveal-fade-up");
}

function staggerItemOverlap(child) {
  const parent = child.parentElement;
  if (!parent) return { inView: false, gone: true };
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const bandY = vh * 0.08;
  const pr = parent.getBoundingClientRect();
  const cr = child.getBoundingClientRect();
  const parentVisible = Math.min(pr.bottom, vh - bandY) - Math.max(pr.top, bandY);
  const parentOnScreen = parentVisible > vh * 0.12;
  const overlapX = Math.min(cr.right, pr.right) - Math.max(cr.left, pr.left);
  const overlapY = Math.min(cr.bottom, pr.bottom) - Math.max(cr.top, pr.top);
  const inView =
    parentOnScreen &&
    overlapX > Math.max(12, Math.min(cr.width, pr.width) * 0.18) &&
    overlapY > Math.max(12, Math.min(cr.height, pr.height) * 0.12);
  const parentGone = pr.bottom < -bandY || pr.top > vh + bandY;
  const gone = parentGone || (!inView && overlapX < 4 && overlapY < 4);
  return { inView, gone };
}

function syncRevealVisibility(el) {
  if (!el.getBoundingClientRect) return;
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const vw = window.innerWidth || document.documentElement.clientWidth;
  const rect = el.getBoundingClientRect();
  const bandY = vh * 0.08;
  const bandX = vw * 0.04;

  if (el.hasAttribute("data-reveal-once")) {
    if (!el.classList.contains("is-visible") && rect.top < vh * 0.94 && rect.bottom > vh * 0.04) {
      el.classList.add("is-visible");
    }
    return;
  }

  if (isStaggerItem(el)) {
    const { inView, gone } = staggerItemOverlap(el);
    if (inView) el.classList.add("is-visible");
    else if (gone) el.classList.remove("is-visible");
    return;
  }

  if (!revealMirrors(el)) return;

  const inView =
    rect.top < vh - bandY &&
    rect.bottom > bandY &&
    rect.left < vw - bandX &&
    rect.right > bandX;
  const gone =
    rect.bottom < -bandY || rect.top > vh + bandY || rect.right < -bandX || rect.left > vw + bandX;

  if (inView) el.classList.add("is-visible");
  else if (gone) el.classList.remove("is-visible");
}

function setupStaggerChildren(parent) {
  if (parent.dataset.revealScrollBound !== "1") {
    parent.dataset.revealScrollBound = "1";
    parent.addEventListener("scroll", () => requestAnimationFrame(flushRevealPending), { passive: true });
  }
  [...parent.children].forEach((child, i) => {
    child.style.setProperty("--reveal-i", String(i));
    child.classList.add("reveal-item");
    if (child.dataset.revealItemBound !== "1") {
      child.dataset.revealItemBound = "1";
      if (revealObserver) revealObserver.observe(child);
    }
    syncRevealVisibility(child);
  });
}

function flushRevealPending() {
  document.querySelectorAll("[data-reveal], .reveal-fade-up, [data-reveal-stagger] > *").forEach((el) => {
    if (el.hasAttribute("data-reveal-stagger")) return;
    syncRevealVisibility(el);
  });
}

function initScrollReveal() {
  const allItems = document.querySelectorAll("[data-reveal], .reveal-fade-up, [data-reveal-stagger] > *");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    allItems.forEach((el) => el.classList.add("is-visible"));
    document.querySelectorAll("[data-reveal-stagger]").forEach(setupStaggerChildren);
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => syncRevealVisibility(entry.target)),
      { rootMargin: "-6% 0px -6% 0px", threshold: [0, 0.05, 0.12, 0.25] }
    );
  }
  document.querySelectorAll("[data-reveal-stagger]").forEach(setupStaggerChildren);
  document.querySelectorAll("[data-reveal], .reveal-fade-up").forEach((el) => {
    if (isStaggerItem(el)) return;
    if (el.dataset.revealObserved !== "1") {
      el.dataset.revealObserved = "1";
      revealObserver.observe(el);
    }
    syncRevealVisibility(el);
  });
  requestAnimationFrame(() => requestAnimationFrame(flushRevealPending));
}

function initHeroMotion() {
  document.querySelectorAll(".hero").forEach((el) => {
    el.classList.add("is-visible");
    el.querySelectorAll("[data-reveal], .reveal-fade-up").forEach((child) => {
      child.setAttribute("data-reveal-once", "");
      child.classList.add("is-visible");
    });
  });
}

initHeroMotion();
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initScrollReveal);
} else {
  initScrollReveal();
}

if (!window.__previewRevealScroll) {
  window.__previewRevealScroll = true;
  let scrollPending = false;
  window.addEventListener(
    "scroll",
    () => {
      if (scrollPending || reduceMotion) return;
      scrollPending = true;
      requestAnimationFrame(() => {
        scrollPending = false;
        flushRevealPending();
      });
    },
    { passive: true }
  );
}

const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() { menu.setAttribute('aria-expanded', 'false'); navigation.classList.remove('is-open'); }
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); navigation.classList.toggle('is-open', open); });
navigation.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
document.querySelectorAll('[data-journey]').forEach(button => button.addEventListener('click', () => { document.querySelector('#journey').value = button.dataset.journey; document.querySelector('#plan').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}); document.querySelector('#journey').focus({preventScroll:true}); }));
document.querySelector('#preview-form').addEventListener('submit', e => { e.preventDefault(); const data = new FormData(e.currentTarget); const status = document.querySelector('#form-status'); status.hidden = false; status.textContent = `Your preview brief: ${document.querySelector('#journey').selectedOptions[0].textContent} · ${data.get('travellers')} · ${data.get('travel') || 'Dates flexible'}.${data.get('wish') ? ' Your interests: ' + data.get('wish') : ''} This is a design demonstration; no enquiry has been sent.`; });