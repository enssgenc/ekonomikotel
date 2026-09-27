import { AGENCY, DATA_CONTROLLER as CONTROLLER } from '../../src/lib/agency.js';
import { privacyTranslations } from './privacy-translations.js';
import { initSite, localizedHref } from './site.js';

// KVKK aydınlatma metni (aydinlatma.html): sağlık turizmi iletişim formu için.
// Metinler privacy-translations.js içindedir (Türkçe esas, diğerleri çeviri).
// Veri sorumlusu, telefon ve TÜRSAB bilgileri src/lib/agency.js'ten gelir.

const root = document.querySelector('#privacy-root');

const esc = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

const tokens = {
  legalName: `<bdi>${esc(CONTROLLER.legalName)}</bdi>`,
  address: `<bdi>${esc(CONTROLLER.address)}</bdi>`,
  email: `<a href="mailto:${esc(CONTROLLER.email)}"><bdi>${esc(CONTROLLER.email)}</bdi></a>`,
  phone: `<a href="tel:${esc(AGENCY.tel)}"><bdi dir="ltr">${esc(AGENCY.phoneIntl)}</bdi></a>`,
  tursabNo: `<bdi>${esc(AGENCY.tursabNo)}</bdi>`,
};

// Metin önce kaçışlanır; ardından {belirteç} ve [[bağlantı]] yerleştirilir.
function rich(text, href = '') {
  return esc(text)
    .replace(/\{(\w+)\}/g, (match, key) => tokens[key] ?? match)
    .replace(/\[\[(.+?)\]\]/g, (_, label) => (href ? `<a href="${esc(href)}">${label}</a>` : label));
}

const number = (index) => String(index + 1).padStart(2, '0');
const facts = (rows) => `<dl class="privacy-facts">${rows.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${rich(value)}</dd></div>`).join('')}</dl>`;
const paragraphs = (list = []) => list.map((text) => `<p>${rich(text)}</p>`).join('');

function renderSection(section, index, copy) {
  const id = `madde-${index + 1}`;
  const box = { controller: copy.controllerRows, channels: copy.channelRows }[section.box];
  const items = section.items ? `<dl class="privacy-items">${section.items.map(([term, text]) => `<div><dt>${esc(term)}</dt><dd>${rich(text)}</dd></div>`).join('')}</dl>` : '';
  const list = section.list ? `<ul class="privacy-list">${section.list.map((text) => `<li>${rich(text)}</li>`).join('')}</ul>` : '';
  const note = section.note ? `<p class="privacy-note">${rich(section.note)}</p>` : '';
  return `<section class="article-section privacy-section" id="${id}" aria-labelledby="${id}-title">
    <h2 id="${id}-title"><span class="privacy-number" aria-hidden="true">${number(index)}</span>${esc(section.heading)}</h2>
    ${paragraphs(section.p)}${box ? facts(box) : ''}${items}${list}${paragraphs(section.after)}${note}
  </section>`;
}

function renderPrivacy(locale) {
  const copy = privacyTranslations[locale] || privacyTranslations.tr;
  const contents = copy.sections.map((section, index) => `<a href="#madde-${index + 1}"><span>${number(index)}</span>${esc(section.heading)}</a>`).join('');
  root.innerHTML = `
    <article class="privacy">
      <header class="article-hero privacy-hero"><div class="page-shell article-hero-inner">
        <a class="article-back" href="${esc(localizedHref('index.html#iletisim', locale))}"><span aria-hidden="true">←</span>${esc(copy.back)}</a>
        <div class="article-meta"><span>${esc(copy.eyebrow)}</span><span class="meta-rule" aria-hidden="true"></span><span>${esc(copy.updated)}</span></div>
        <h1>${esc(copy.title)}</h1>
        <p>${rich(copy.intro)}</p>
        ${copy.translationNote ? `<p class="privacy-translation">${rich(copy.translationNote, localizedHref('aydinlatma.html', 'tr'))}</p>` : ''}
      </div></header>
      <div class="page-shell article-layout privacy-layout">
        <aside class="article-contents"><div class="article-contents-inner"><h2>${esc(copy.contents)}</h2><nav aria-label="${esc(copy.contents)}">${contents}</nav></div></aside>
        <div class="article-body privacy-body">
          ${copy.sections.map((section, index) => renderSection(section, index, copy)).join('')}
          <p class="privacy-updated">${esc(copy.updated)}</p>
        </div>
      </div>
    </article>`;
  document.title = copy.meta.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', copy.meta.description);
}

initSite('privacy', renderPrivacy);
