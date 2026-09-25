import { getLocaleDirection, getMessages } from './i18n.js';

const supportedLocales = ['tr', 'en', 'de', 'ru', 'ar', 'fr'];
const localeNames = {
  tr: 'Türkçe',
  en: 'English',
  de: 'Deutsch',
  ru: 'Русский',
  ar: 'العربية',
  fr: 'Français',
};

let currentLocale = 'tr';
let localeChangeHandler = () => {};

function savedLocale() {
  try {
    return localStorage.getItem('cappadocia-health-locale');
  } catch {
    return null;
  }
}

function rememberLocale(locale) {
  try {
    localStorage.setItem('cappadocia-health-locale', locale);
  } catch {
    // The URL still preserves the selected language when storage is unavailable.
  }
}

export function getCurrentLocale() {
  return currentLocale;
}

export function localizedHref(path, locale = currentLocale) {
  const [base, hash = ''] = path.split('#');
  const [pathname, query = ''] = base.split('?');
  const params = new URLSearchParams(query);
  params.set('lang', locale);
  return `${pathname}?${params.toString()}${hash ? `#${hash}` : ''}`;
}

export function message(key, values = {}, locale = currentLocale) {
  const value = key.split('.').reduce((part, segment) => part?.[segment], getMessages(locale));
  if (typeof value !== 'string') return '';
  return value.replace(/\{(\w+)\}/g, (_, token) => String(values[token] ?? ''));
}

function renderHeader(page) {
  const home = page === 'home';
  const anchor = (id) => localizedHref(`${home ? '' : 'index.html'}#${id}`);
  const blogHref = localizedHref('blog.html');
  document.querySelector('#site-header').innerHTML = `
    <a class="skip-link" href="#main">${message('site.skip')}</a>
    <div class="ekonomikotel-return"><a href="/">← Ekonomikotel</a></div><header class="site-header" id="top">
      <div class="page-shell header-inner">
        <a class="brand" href="${localizedHref('index.html')}" aria-label="${message('site.brandAria')}">
          <span class="brand-mark" aria-hidden="true">c<span>+</span></span>
          <span class="brand-text"><strong>cappadocia</strong><span>HEALTH</span></span>
        </a>
        <nav class="site-nav" id="site-nav" aria-label="${message('nav.menuAria') || message('site.menuOpen')}">
          <a href="${anchor('tedaviler')}">${message('nav.treatments')}</a>
          <a href="${anchor('yaklasim')}">${message('nav.process')}</a>
          <a href="${anchor('kapadokya')}">${message('nav.cappadocia')}</a>
          <a href="${blogHref}" ${page === 'blog' || page === 'article' ? 'aria-current="page"' : ''}>${message('nav.blog')}</a>
          <a href="${anchor('sorular')}">${message('nav.faq')}</a>
        </nav>
        <div class="header-tools">
          <label class="language-switcher" for="language-select">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 12h17M12 3c2.3 2.4 3.5 5.4 3.5 9S14.3 18.6 12 21M12 3C9.7 5.4 8.5 8.4 8.5 12S9.7 18.6 12 21" stroke="currentColor" stroke-width="1.5"/></svg>
            <span class="sr-only">${message('site.languageLabel')}</span>
            <select id="language-select" aria-label="${message('site.languageLabel')}">${supportedLocales.map((code) => `<option value="${code}" ${code === currentLocale ? 'selected' : ''}>${localeNames[code]}</option>`).join('')}</select>
          </label>
          <a class="header-action" href="${anchor('tedaviler')}">${message('nav.exploreTreatments')} <span class="arrow-icon" aria-hidden="true">↗</span></a>
          <button class="menu-toggle" type="button" aria-label="${message('site.menuOpen')}" aria-controls="site-nav" aria-expanded="false"><span></span><span></span></button>
        </div>
      </div>
    </header>`;

  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('#site-nav');
  const closeMenu = () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', message('site.menuOpen'));
    siteNav.classList.remove('is-open');
  };

  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', message(open ? 'site.menuClose' : 'site.menuOpen'));
    siteNav.classList.toggle('is-open', open);
  });
  siteNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });
  document.querySelector('#language-select').addEventListener('change', (event) => setLocale(event.target.value, page));
}

function renderFooter(page) {
  const home = page === 'home';
  const anchor = (id) => localizedHref(`${home ? '' : 'index.html'}#${id}`);
  document.querySelector('#site-footer').innerHTML = `
    <footer class="site-footer">
      <div class="page-shell footer-main">
        <div class="footer-brand-area">
          <a class="brand footer-brand" href="${localizedHref('index.html')}" aria-label="${message('site.backToTopAria')}"><span class="brand-mark" aria-hidden="true">c<span>+</span></span><span class="brand-text"><strong>cappadocia</strong><span>HEALTH</span></span></a>
          <p>${message('footer.tagline')}</p>
        </div>
        <nav aria-label="${message('nav.menuAria') || message('nav.treatments')}">
          <a href="${anchor('tedaviler')}">${message('nav.treatments')}</a>
          <a href="${anchor('yaklasim')}">${message('nav.process')}</a>
          <a href="${anchor('kapadokya')}">${message('nav.cappadocia')}</a>
          <a href="${localizedHref('blog.html')}">${message('nav.blog')}</a>
          <a href="${anchor('sorular')}">${message('nav.faq')}</a>
        </nav>
      </div>
      <div class="page-shell footer-bottom">
        <p>${message('footer.disclaimer')}</p>
        <div class="source-links"><a href="https://healthturkiye.gov.tr/tr/branches" target="_blank" rel="noopener noreferrer">${message('footer.healthTurkiye')}</a><a href="https://kapadokyaalan.ktb.gov.tr/cappadokia/visit-points" target="_blank" rel="noopener noreferrer">${message('footer.heritageAuthority')}</a></div>
      </div>
    </footer>`;
}

function translateStatic() {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = message(element.dataset.i18n);
  });
  for (const [attribute, dataKey] of [['alt', 'i18nAlt'], ['placeholder', 'i18nPlaceholder'], ['aria-label', 'i18nAriaLabel']]) {
    document.querySelectorAll(`[data-${dataKey.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}]`).forEach((element) => {
      element.setAttribute(attribute, message(element.dataset[dataKey]));
    });
  }
}

function setLocale(locale, page, updateUrl = true) {
  currentLocale = supportedLocales.includes(locale) ? locale : 'tr';
  document.documentElement.lang = currentLocale;
  document.documentElement.dir = getLocaleDirection(currentLocale);
  rememberLocale(currentLocale);
  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.set('lang', currentLocale);
    history.replaceState(null, '', url);
  }
  renderHeader(page);
  renderFooter(page);
  translateStatic();
  document.title = message('site.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', message('site.description'));
  localeChangeHandler(currentLocale);
}

export function initSite(page, onLocaleChange = () => {}) {
  localeChangeHandler = onLocaleChange;
  document.addEventListener('keydown', (event) => {
    const menuToggle = document.querySelector('.menu-toggle');
    if (event.key !== 'Escape' || menuToggle?.getAttribute('aria-expanded') !== 'true') return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', message('site.menuOpen'));
    document.querySelector('#site-nav')?.classList.remove('is-open');
    menuToggle.focus();
  });
  const fromUrl = new URLSearchParams(location.search).get('lang');
  setLocale(supportedLocales.includes(fromUrl) ? fromUrl : savedLocale() || 'tr', page, false);
  return currentLocale;
}
