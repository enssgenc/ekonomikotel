import { blogPosts } from './blogs.js';
import { renderBlogCard } from './blog-ui.js';
import { initSite, message } from './site.js';

initSite('blog', (locale) => {
  const count = message('blog.articleCount', { count: blogPosts.length }, locale);
  document.querySelector('#journal-hero-count').textContent = count;
  document.querySelector('#journal-count').textContent = count;
  document.querySelector('#journal-grid').innerHTML = blogPosts.map((post, index) => renderBlogCard(post, locale, index === 0)).join('');
  document.title = `${message('blog.navTitle', {}, locale)} | Cappadocia Health`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', message('blog.listIntro', {}, locale));
});
