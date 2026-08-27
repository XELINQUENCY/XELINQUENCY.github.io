'use strict';

(function () {
  const htmlEscape = value => String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const pickIndex = length => {
    if (length < 2) return 0;

    if (window.crypto && window.crypto.getRandomValues) {
      const max = 0x100000000;
      const limit = max - (max % length);
      const buffer = new Uint32Array(1);

      do {
        window.crypto.getRandomValues(buffer);
      } while (buffer[0] >= limit);

      return buffer[0] % length;
    }

    return Math.floor(Math.random() * length);
  };

  const choosePost = posts => posts[pickIndex(posts.length)];

  const isHomePage = () => {
    const pageType = window.GLOBAL_CONFIG_SITE && window.GLOBAL_CONFIG_SITE.pageType;
    if (pageType && pageType !== 'home') return false;

    const root = (window.GLOBAL_CONFIG && window.GLOBAL_CONFIG.root) || '/';
    const rootPath = new URL(root, window.location.origin).pathname.replace(/\/?$/, '/');
    const currentPath = window.location.pathname.replace(/\/?$/, '/');

    return currentPath === rootPath;
  };

  const createCard = data => {
    const cover = data.cover || '';
    const hasImageCover = cover && data.coverType === 'img';
    const hasBackgroundCover = cover && data.coverType !== 'img';
    const coverSide = data.coverSide ? ` ${htmlEscape(data.coverSide)}` : '';
    const coverMarkup = cover
      ? `<div class="post_cover random-post-cover${coverSide}">
          <a class="post-bg random-post-trigger" href="#" data-random-post-link aria-label="随机进入一篇文章"${hasBackgroundCover ? ` style="background: ${htmlEscape(cover)}"` : ''}>${hasImageCover ? `<img src="${htmlEscape(cover)}" alt="随机文章封面">` : ''}</a>
        </div>`
      : '';
    const noCoverClass = cover ? '' : ' no-cover';

    return `<div class="recent-post-item random-post-item" data-random-post-item>
      ${coverMarkup}
      <div class="recent-post-info${noCoverClass}">
        <a class="article-title random-post-trigger" href="#" data-random-post-link>
          <i class="fas fa-random random-post-icon" aria-hidden="true"></i>${htmlEscape(data.title || '随机文章')}
        </a>
        <div class="article-meta-wrap">
          <span class="article-meta">
            <i class="fas fa-dice" aria-hidden="true"></i>
            <span class="article-meta-label">${htmlEscape(data.label || '随机')}</span>
            <span class="article-meta-separator">|</span>
            <span>${data.count} 篇文章可被抽取</span>
          </span>
        </div>
        <div class="content">${htmlEscape(data.description || '点击后等概率进入站内任意一篇文章')}</div>
      </div>
    </div>`;
  };

  const bindCard = (card, posts) => {
    const links = card.querySelectorAll('[data-random-post-link]');

    const setRandomHref = () => {
      const post = choosePost(posts);
      if (!post || !post.url) return;

      links.forEach(link => {
        link.href = post.url;
      });
    };

    const openRandomPost = event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      event.preventDefault();
      const post = choosePost(posts);
      if (post && post.url) window.location.href = post.url;
    };

    setRandomHref();
    links.forEach(item => {
      item.addEventListener('pointerdown', setRandomHref);
      item.addEventListener('focus', setRandomHref);
      item.addEventListener('click', openRandomPost);
    });
  };

  const renderRandomPostCard = () => {
    const data = window.BLOG_RANDOM_POSTS;
    if (!isHomePage()) return;
    if (!data || data.enable === false || !Array.isArray(data.posts) || data.posts.length === 0) return;

    const recentPostItems = document.querySelector('#recent-posts > .recent-post-items');
    if (!recentPostItems || recentPostItems.querySelector('[data-random-post-item]')) return;

    recentPostItems.insertAdjacentHTML('afterbegin', createCard(data));
    bindCard(recentPostItems.querySelector('[data-random-post-item]'), data.posts);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderRandomPostCard);
  } else {
    renderRandomPostCard();
  }

  document.addEventListener('pjax:complete', renderRandomPostCard);
})();
