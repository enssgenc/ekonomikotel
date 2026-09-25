import { localizedHref, message } from './site.js';

export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

export function getPostCopy(post, locale) {
  return post.translations[locale] || post.translations.tr;
}

export function renderBlogCard(post, locale, featured = false) {
  const copy = getPostCopy(post, locale);
  const href = localizedHref(`article.html?slug=${post.slug}`, locale);
  const category = message(`blog.categories.${post.category}`, {}, locale) || message('nav.blog', {}, locale);
  return `<article class="blog-card${featured ? ' is-featured' : ''}">
    <a class="blog-card-image" href="${href}" aria-label="${escapeHtml(copy.title)}"><img src="${post.image}" alt="${escapeHtml(copy.imageAlt)}" loading="lazy" /></a>
    <div class="blog-card-body">
      <div class="blog-card-meta"><span>${escapeHtml(category)}</span><span class="meta-rule" aria-hidden="true"></span><span>${escapeHtml(message('blog.readTime', { count: post.readTime }, locale))}</span></div>
      <h3><a href="${href}">${escapeHtml(copy.title)}</a></h3>
      <p>${escapeHtml(copy.excerpt)}</p>
      <a class="blog-card-link" href="${href}">${escapeHtml(message('blog.readArticle', {}, locale))}<span class="arrow-icon" aria-hidden="true">↗</span></a>
    </div>
  </article>`;
}
