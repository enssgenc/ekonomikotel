import { blogPosts } from './blogs.js';
import { escapeHtml, renderBlogCard } from './blog-ui.js';
import { getTreatmentCategories } from './i18n.js';
import { initSite, localizedHref, message } from './site.js';

const tabs = document.querySelector('#category-tabs');
const categorySelect = document.querySelector('#category-select');
const search = document.querySelector('#treatment-search');
const side = document.querySelector('#catalog-side');
const list = document.querySelector('#treatment-list');
const total = document.querySelector('#catalog-total');
const showMore = document.querySelector('#show-more');
const featuredCategories = document.querySelector('#featured-categories');
const blogPreview = document.querySelector('#blog-preview-grid');

const featuredIds = ['dis', 'estetik', 'sac', 'goz'];
const featuredImages = {
  dis: '/saglik-turizmi/images/treatment-dental.webp',
  estetik: '/saglik-turizmi/images/treatment-aesthetic.webp',
  sac: '/saglik-turizmi/images/treatment-hair.webp',
  goz: '/saglik-turizmi/images/treatment-eye.webp',
};

let locale = 'tr';
let categories = [];
let activeCategory = 'all';
let expanded = false;

const normalize = (value) => String(value)
  .toLocaleLowerCase(locale)
  .replaceAll('ı', 'i')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const treatmentCount = () => categories.reduce((count, group) => count + group.items.length, 0);

function renderFeatured() {
  featuredCategories.innerHTML = featuredIds.map((id) => {
    const category = categories.find((entry) => entry.id === id);
    return `<button class="feature-category" type="button" data-feature-category="${id}">
      <span class="feature-photo"><img src="${featuredImages[id]}" alt="" loading="lazy" /></span>
      <span class="feature-body"><span class="feature-top"><span>${escapeHtml(message('treatments.categoryCount', { count: category.items.length }))}</span><span class="arrow-icon" aria-hidden="true">↗</span></span><strong>${escapeHtml(category.label)}</strong><small>${escapeHtml(message('treatments.exploreProcedures'))}</small></span>
    </button>`;
  }).join('');
}

function renderFilters() {
  const options = [{ id: 'all', label: message('treatments.all') }, ...categories];
  tabs.innerHTML = options.map(({ id, label }) => `<button type="button" class="category-tab" data-category="${id}" aria-pressed="${activeCategory === id}">${escapeHtml(label)}</button>`).join('');
  categorySelect.innerHTML = options.map(({ id, label }) => `<option value="${id}" ${activeCategory === id ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('');
}

function renderCatalog() {
  const query = normalize(search.value.trim());
  const selected = categories.find((entry) => entry.id === activeCategory);
  const results = categories.flatMap((group) => group.items
    .filter((item) => (activeCategory === 'all' || activeCategory === group.id) &&
      (!query || normalize(`${item.name} ${item.summary} ${item.detail} ${group.label}`).includes(query)))
    .map((item) => ({ ...item, category: group.label })));
  const visible = activeCategory === 'all' && !query && !expanded ? results.slice(0, 8) : results;

  total.textContent = message('treatments.resultCount', { count: results.length });
  const sideTitle = query ? message('treatments.searchSideTitle') : selected?.label || message('treatments.defaultSideTitle');
  const sideBody = query ? message('treatments.searchSideBody') : selected?.description || message('treatments.defaultSideBody', { count: treatmentCount() });
  side.hidden = !selected || Boolean(query);
  side.innerHTML = `<h4>${escapeHtml(sideTitle)}</h4><p>${escapeHtml(sideBody)}</p>`;

  if (results.length === 0) {
    list.innerHTML = `<div class="catalog-empty"><h4>${escapeHtml(message('treatments.noResultsTitle'))}</h4><p>${escapeHtml(message('treatments.noResultsBody'))}</p><button type="button" id="clear-search">${escapeHtml(message('treatments.clearSearch'))}</button></div>`;
    showMore.hidden = true;
    return;
  }

  list.innerHTML = visible.map((item) => `<details class="treatment-item"><summary><span class="treatment-row"><span class="treatment-category">${escapeHtml(item.category)}</span><strong>${escapeHtml(item.name)}</strong><span class="treatment-summary">${escapeHtml(item.summary)}</span></span><span class="plus-icon" aria-hidden="true"></span></summary><div class="treatment-detail"><p>${escapeHtml(item.detail)}</p><p>${escapeHtml(message('treatments.detailNote'))}</p></div></details>`).join('');
  showMore.hidden = !(activeCategory === 'all' && !query && results.length > 8);
  showMore.innerHTML = expanded
    ? `${escapeHtml(message('treatments.showLess'))}<span class="arrow-line arrow-up" aria-hidden="true"></span>`
    : `${escapeHtml(message('treatments.showAll', { count: results.length }))}<span class="arrow-line" aria-hidden="true"></span>`;
}

function renderBlogPreview() {
  blogPreview.innerHTML = blogPosts.slice(0, 3).map((post, index) => renderBlogCard(post, locale, index === 0)).join('');
  document.querySelector('#blog-all-link').href = localizedHref('blog.html');
}

function selectCategory(categoryId, shouldScroll = false) {
  activeCategory = categoryId;
  expanded = false;
  search.value = '';
  renderFilters();
  renderCatalog();
  if (shouldScroll) {
    document.querySelector('.catalog-area').scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
    const target = matchMedia('(max-width: 700px)').matches ? categorySelect : tabs.querySelector(`[data-category="${activeCategory}"]`);
    target?.focus({ preventScroll: true });
  }
}

tabs.addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (button) {
    selectCategory(button.dataset.category);
    tabs.querySelector(`[data-category="${activeCategory}"]`)?.focus({ preventScroll: true });
  }
});
categorySelect.addEventListener('change', (event) => selectCategory(event.target.value));
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-jump-category], [data-feature-category]');
  if (button) selectCategory(button.dataset.jumpCategory || button.dataset.featureCategory, true);
});
search.addEventListener('input', () => {
  activeCategory = 'all';
  expanded = false;
  renderFilters();
  renderCatalog();
});
showMore.addEventListener('click', () => {
  expanded = !expanded;
  renderCatalog();
});
list.addEventListener('click', (event) => {
  if (event.target.id !== 'clear-search') return;
  search.value = '';
  activeCategory = 'all';
  renderFilters();
  renderCatalog();
  search.focus();
});

document.querySelectorAll('.faq-list details').forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    document.querySelectorAll('.faq-list details').forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

initSite('home', (nextLocale) => {
  locale = nextLocale;
  categories = getTreatmentCategories(locale);
  renderFeatured();
  renderFilters();
  renderCatalog();
  renderBlogPreview();
});
