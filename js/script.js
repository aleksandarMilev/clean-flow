
// Mobile navigation, active state and small UX enhancements
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const header = document.querySelector('.site-header');
const yearNodes = document.querySelectorAll('[data-current-year]');

const closeMenu = () => {
  if (!navToggle || !siteNav) return;
  siteNav.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
};

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    siteNav.classList.toggle('is-open');
    document.body.classList.toggle('menu-open');
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', (event) => {
    const isOpen = siteNav.classList.contains('is-open');
    if (!isOpen) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (!siteNav.contains(target) && !navToggle.contains(target)) closeMenu();
  });
}

const currentPath = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav__list a, .footer-links a').forEach((link) => {
  const href = link.getAttribute('href');
  if (href === currentPath) {
    link.classList.add('is-active');
    if (link.closest('.nav__list')) {
      link.setAttribute('aria-current', 'page');
    }
  }
});

window.addEventListener('scroll', () => {
  if (!header) return;
  header.classList.toggle('site-header--scrolled', window.scrollY > 8);
}, { passive: true });

yearNodes.forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const cookieKey = 'cleanflow_cookie_notice_ack';
if (!localStorage.getItem(cookieKey)) {
  const banner = document.createElement('section');
  banner.className = 'cookie-banner';
  banner.setAttribute('aria-label', 'Съобщение за бисквитки');
  banner.innerHTML = `
    <p>Използваме само необходими бисквитки за сигурност и функционалност. Вижте <a href="cookies.html">Политика за бисквитки</a>.</p>
    <div class="cookie-banner__actions">
      <button type="button" class="btn btn--primary" data-cookie-accept>Разбрах</button>
      <a class="btn btn--secondary" href="privacy-policy.html">Поверителност</a>
    </div>
  `;
  document.body.appendChild(banner);
  const acceptBtn = banner.querySelector('[data-cookie-accept]');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem(cookieKey, '1');
      banner.remove();
    });
  }
}
