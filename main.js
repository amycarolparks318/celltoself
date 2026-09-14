const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');

toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  toggle.setAttribute('aria-label', open ? 'Open navigation menu' : 'Close navigation menu');
  const label = toggle.querySelector('b');
  if (label) label.textContent = open ? 'Menu' : 'Close';
  nav.classList.toggle('open', !open);
});

nav?.addEventListener('click', (event) => {
  if (!event.target.closest('a')) return;
  nav.classList.remove('open');
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.setAttribute('aria-label', 'Open navigation menu');
  const label = toggle?.querySelector('b');
  if (label) label.textContent = 'Menu';
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || !nav?.classList.contains('open')) return;
  nav.classList.remove('open');
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.setAttribute('aria-label', 'Open navigation menu');
  const label = toggle?.querySelector('b');
  if (label) label.textContent = 'Menu';
  toggle?.focus();
});

const filterButtons = [...document.querySelectorAll('[data-filter]')];
const archiveCards = [...document.querySelectorAll('.archive-card[data-category]')];
const noResults = document.querySelector('.no-results');
const archiveGrid = document.querySelector('.archive-grid');
const archiveNote = document.querySelector('[data-archive-note]');

filterButtons.forEach((button) => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  filterButtons.forEach((item) => {
    const active = item === button;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  const readingInOrder = filter === 'reading-order';
  const sortedCards = [...archiveCards].sort((a, b) => {
    const aOrder = Number(readingInOrder ? a.dataset.readingOrder : a.dataset.defaultOrder);
    const bOrder = Number(readingInOrder ? b.dataset.readingOrder : b.dataset.defaultOrder);
    return aOrder - bOrder;
  });
  sortedCards.forEach((card) => archiveGrid?.append(card));
  let visible = 0;
  archiveCards.forEach((card) => {
    const show = filter === 'all' || (readingInOrder ? card.dataset.readingOrder !== '' : card.dataset.category === filter);
    card.hidden = !show;
    if (show) visible += 1;
  });
  if (archiveNote) archiveNote.textContent = readingInOrder
    ? `${visible} connected stories, beginning with the first post.`
    : filter === 'all' ? 'Newest stories first.' : `${visible} stories in this category.`;
  if (noResults) noResults.hidden = visible > 0;
}));

document.querySelector('[data-load-more]')?.addEventListener('click', (event) => {
  document.querySelectorAll('.is-older-story').forEach((card) => { card.hidden = false; });
  event.currentTarget.remove();
});

const contactForm = document.querySelector('[data-contact-form]');
const formSuccess = document.querySelector('[data-form-success]');
if (contactForm && formSuccess && new URLSearchParams(window.location.search).get('sent') === '1') {
  formSuccess.hidden = false;
  contactForm.hidden = true;
  formSuccess.focus?.();
  window.history.replaceState({}, '', window.location.pathname);
}
