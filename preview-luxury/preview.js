const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() { menu.setAttribute('aria-expanded', 'false'); navigation.classList.remove('is-open'); }
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); navigation.classList.toggle('is-open', open); });
navigation.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
document.querySelectorAll('[data-journey]').forEach(button => button.addEventListener('click', () => { document.querySelector('#journey').value = button.dataset.journey; document.querySelector('#plan').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}); document.querySelector('#journey').focus({preventScroll:true}); }));
document.querySelector('#preview-form').addEventListener('submit', e => { e.preventDefault(); const data = new FormData(e.currentTarget); const status = document.querySelector('#form-status'); status.hidden = false; status.textContent = `Your preview brief: ${document.querySelector('#journey').selectedOptions[0].textContent} · ${data.get('travellers')} · ${data.get('travel') || 'Dates flexible'}.${data.get('wish') ? ' Your interests: ' + data.get('wish') : ''} This is a design demonstration; no enquiry has been sent.`; });
