import { AGENCY, whatsappUrl } from '../../src/lib/agency.js';
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

const escapeText = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

// TÜRSAB satırı: numara ve grup kodu AGENCY'den gelir, yalnızca çevresindeki metin çevrilir.
export function licenseLink(locale = currentLocale) {
  const text = escapeText(message('footer.license', {
    no: '{no}',
    group: AGENCY.tursabGroup,
    groupCode: AGENCY.tursabGroup.split(' ')[0],
  }, locale)).replace('{no}', `<bdi>${escapeText(AGENCY.tursabNo)}</bdi>`);
  return `<a class="license-link" href="${escapeText(AGENCY.tursabVerifyUrl)}" target="_blank" rel="noopener noreferrer"><svg class="license-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M12 3 5 6v5.2c0 4.3 2.9 8.2 7 9.8 4.1-1.6 7-5.5 7-9.8V6l-7-3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m8.8 12.2 2.2 2.2 4.3-4.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>${text}</span><span class="sr-only"> ${escapeText(message('footer.licenseVerify', {}, locale))}</span></a>`;
}

const phoneIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M6.6 3.5h2.6l1.5 4-2 1.3a11.5 11.5 0 0 0 6.5 6.5l1.3-2 4 1.5v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const chatIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.4 18.6l-3.9.9Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';

// Telefon ve WhatsApp bağlantıları: numara AGENCY'den gelir, yurt dışından aranabilir biçimde gösterilir.
export function phoneLink(className = 'phone-link', locale = currentLocale) {
  return `<a class="${className}" href="tel:${AGENCY.tel}">${phoneIcon}<span class="sr-only">${escapeText(message('contact.direct.call', {}, locale))}: </span><bdi dir="ltr">${escapeText(AGENCY.phoneIntl)}</bdi></a>`;
}

export function whatsappLink(className = 'whatsapp-link', locale = currentLocale) {
  return `<a class="${className}" href="${escapeText(whatsappUrl(message('contact.direct.whatsappText', {}, locale)))}" target="_blank" rel="noopener noreferrer">${chatIcon}<span>${escapeText(message('contact.direct.whatsapp', {}, locale))}</span></a>`;
}

function renderDirectContact() {
  const box = document.querySelector('#contact-direct');
  if (!box) return;
  box.innerHTML = `<h3>${escapeText(message('contact.direct.title'))}</h3><p>${escapeText(message('contact.direct.body'))}</p><div class="contact-direct-actions">${phoneLink('button button-primary direct-call')}${whatsappLink('button-link direct-whatsapp')}</div>`;
}

function renderHeader(page) {
  const home = page === 'home';
  const anchor = (id) => localizedHref(`${home ? '' : 'index.html'}#${id}`);
  const blogHref = localizedHref('blog.html');
  document.querySelector('#site-header').innerHTML = `
    <a class="skip-link" href="#main">${message('site.skip')}</a>
    <div class="ekonomikotel-return"><a href="/">← Ekonomikotel</a><span class="return-phone"><span class="return-phone-label">${message('contact.direct.lineLabel')}</span>${phoneLink('return-phone-link')}</span></div><header class="site-header" id="top">
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
          <a class="nav-contact" href="${anchor('iletisim')}">${message('nav.contact')}</a>
        </nav>
        <div class="header-tools">
          <label class="language-switcher" for="language-select">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 12h17M12 3c2.3 2.4 3.5 5.4 3.5 9S14.3 18.6 12 21M12 3C9.7 5.4 8.5 8.4 8.5 12S9.7 18.6 12 21" stroke="currentColor" stroke-width="1.5"/></svg>
            <span class="sr-only">${message('site.languageLabel')}</span>
            <select id="language-select" aria-label="${message('site.languageLabel')}">${supportedLocales.map((code) => `<option value="${code}" ${code === currentLocale ? 'selected' : ''}>${localeNames[code]}</option>`).join('')}</select>
          </label>
          <a class="header-action" href="${anchor('iletisim')}">${message('nav.contactAction')} <span class="arrow-icon" aria-hidden="true">↗</span></a>
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
          <p class="footer-phone">${phoneLink('footer-phone-link')}${whatsappLink('footer-whatsapp-link')}</p>
          <p class="footer-license">${licenseLink()}</p>
        </div>
        <nav aria-label="${message('nav.menuAria') || message('nav.treatments')}">
          <a href="${anchor('tedaviler')}">${message('nav.treatments')}</a>
          <a href="${anchor('yaklasim')}">${message('nav.process')}</a>
          <a href="${anchor('kapadokya')}">${message('nav.cappadocia')}</a>
          <a href="${localizedHref('blog.html')}">${message('nav.blog')}</a>
          <a href="${anchor('sorular')}">${message('nav.faq')}</a>
          <a href="${anchor('iletisim')}">${message('nav.contact')}</a>
        </nav>
      </div>
      <div class="page-shell footer-bottom">
        <p>${message('footer.disclaimer')}</p>
        <div class="source-links"><a class="footer-privacy" href="${localizedHref('aydinlatma.html')}"${page === 'privacy' ? ' aria-current="page"' : ''}>${message('footer.privacy')}</a><a href="https://healthturkiye.gov.tr/tr/branches" target="_blank" rel="noopener noreferrer">${message('footer.healthTurkiye')}</a><a href="https://kapadokyaalan.ktb.gov.tr/cappadokia/visit-points" target="_blank" rel="noopener noreferrer">${message('footer.heritageAuthority')}</a></div>
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
  renderDirectContact();
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
