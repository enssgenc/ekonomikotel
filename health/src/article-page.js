import { blogPosts } from './blogs.js';
import { escapeHtml, getPostCopy, renderBlogCard } from './blog-ui.js';
import { initSite, localizedHref, message } from './site.js';

const slug = new URLSearchParams(location.search).get('slug');
const post = blogPosts.find((entry) => entry.slug === slug);
const root = document.querySelector('#article-root');

function renderNotFound(locale) {
  root.innerHTML = `<section class="article-not-found"><div class="page-shell"><h1>${escapeHtml(message('blog.notFoundTitle', {}, locale))}</h1><p>${escapeHtml(message('blog.notFoundBody', {}, locale))}</p><a class="button button-primary" href="${localizedHref('blog.html', locale)}">${escapeHtml(message('blog.backToBlog', {}, locale))}<span class="arrow-icon" aria-hidden="true">↗</span></a></div></section>`;
  document.title = `${message('blog.notFoundTitle', {}, locale)} | Cappadocia Health`;
}

function renderArticle(locale) {
  if (!post) return renderNotFound(locale);

  const copy = getPostCopy(post, locale);
  const category = message(`blog.categories.${post.category}`, {}, locale) || message('nav.blog', {}, locale);
  const currentIndex = blogPosts.indexOf(post);
  const related = [blogPosts[(currentIndex + 1) % blogPosts.length], blogPosts[(currentIndex + 2) % blogPosts.length]];
  const treatmentImages = {
    dental: '/saglik-turizmi/images/treatment-dental.webp',
    aesthetic: '/saglik-turizmi/images/treatment-aesthetic.webp',
    hair: '/saglik-turizmi/images/treatment-hair.webp',
    eye: '/saglik-turizmi/images/treatment-eye.webp',
    travel: '/saglik-turizmi/images/blog-inline-valley.webp',
    guide: '/saglik-turizmi/images/blog-inline-valley.webp',
  };
  const inlineImage = ['travel', 'guide'].includes(post.category) ? '/saglik-turizmi/images/blog-inline-stay.webp' : '/saglik-turizmi/images/blog-inline-valley.webp';
  const inlineAltKey = ['travel', 'guide'].includes(post.category) ? 'image.inlineStayAlt' : 'image.inlineValleyAlt';
  const sections = copy.sections.map((section, index) => `
    <section class="article-section" id="section-${index + 1}"><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</section>
    ${index === 0 ? `<figure class="article-inline-photo is-compact"><img src="${treatmentImages[post.category]}" alt="" loading="lazy" /></figure>` : ''}
    ${index === 1 ? `<figure class="article-inline-photo"><img src="${inlineImage}" alt="${escapeHtml(message(inlineAltKey, {}, locale))}" loading="lazy" /></figure>` : ''}
  `).join('');
  const tableOfContents = copy.sections.map((section, index) => `<a href="#section-${index + 1}"><span>${String(index + 1).padStart(2, '0')}</span>${escapeHtml(section.heading)}</a>`).join('');
  const sources = post.sources.map((source) => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.name)}<span class="arrow-icon" aria-hidden="true">↗</span></a></li>`).join('');

  root.innerHTML = `
    <article>
      <header class="article-hero"><div class="page-shell article-hero-inner">
        <a class="article-back" href="${localizedHref('blog.html', locale)}"><span aria-hidden="true">←</span>${escapeHtml(message('blog.backToBlog', {}, locale))}</a>
        <div class="article-meta"><span>${escapeHtml(category)}</span><span class="meta-rule" aria-hidden="true"></span><span>${escapeHtml(message('blog.readTime', { count: post.readTime }, locale))}</span></div>
        <h1>${escapeHtml(copy.title)}</h1><p>${escapeHtml(copy.excerpt)}</p>
      </div></header>
      <div class="article-lead-image"><img src="${post.image}" alt="${escapeHtml(copy.imageAlt)}" /></div>
      <div class="page-shell article-layout">
        <aside class="article-contents"><div class="article-contents-inner"><h2>${escapeHtml(message('blog.contents', {}, locale))}</h2><nav aria-label="${escapeHtml(message('blog.contents', {}, locale))}">${tableOfContents}</nav></div></aside>
        <div class="article-body">${sections}<div class="article-medical-note"><span class="care-symbol" aria-hidden="true">+</span><p>${escapeHtml(message('blog.medicalNote', {}, locale))}</p></div><div class="article-sources"><h2>${escapeHtml(message('blog.sources', {}, locale))}</h2><ul>${sources}</ul></div></div>
      </div>
    </article>
    <section class="article-related"><div class="page-shell"><div class="article-related-heading"><h2>${escapeHtml(message('blog.relatedTitle', {}, locale))}</h2><a class="button-link" href="${localizedHref('blog.html', locale)}">${escapeHtml(message('blog.moreArticles', {}, locale))}<span class="arrow-line" aria-hidden="true"></span></a></div><div class="article-related-grid">${related.map((entry) => renderBlogCard(entry, locale)).join('')}</div></div></section>`;

  document.title = `${copy.title} | Cappadocia Health`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', copy.excerpt);
}

initSite('article', renderArticle);
