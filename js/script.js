
// Mobile navigation, active state and simple UI enhancements
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const header = document.querySelector('.site-header');
const yearNode = document.querySelector('[data-current-year]');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    siteNav.classList.toggle('is-open');
    document.body.classList.toggle('menu-open');
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    });
  });
}

const currentPath = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav__list a, .footer-links a').forEach((link) => {
  const href = link.getAttribute('href');
  if (href === currentPath) {
    link.classList.add('is-active');
  }
});

window.addEventListener('scroll', () => {
  if (!header) return;
  header.classList.toggle('site-header--scrolled', window.scrollY > 8);
}, { passive: true });

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}
