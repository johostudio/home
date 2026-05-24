; (function () {
  var path = window.location.pathname;
  var inSub = path.indexOf('/projects/') !== -1;
  var base = inSub ? '../' : '';
  var isArchivePage = path.indexOf('archives') !== -1 || path.indexOf('atlas') !== -1 || path.indexOf('bookshelf') !== -1 || path.indexOf('scrambled') !== -1;
  
  var isHome = (path === '/' || path.endsWith('/index.html') || path.endsWith('/index') || path === '' || path.indexOf('index') !== -1);

  var cur = '';
  if (path.indexOf('links') !== -1) cur = 'links';
  else if (path.indexOf('gallery') !== -1 || path.indexOf('writeups') !== -1) cur = 'gallery';
  else if (path.indexOf('about') !== -1) cur = 'about';
  else if (path.indexOf('vancouver') !== -1 || path.indexOf('project') !== -1) cur = 'vancouver';
  else if (path.indexOf('hoshii') !== -1) cur = 'hoshii';
  else if (path.indexOf('resume') !== -1) cur = 'resume';
  else if (isArchivePage) cur = 'archives';
  var galleryFilterStorageKey = 'jh_gallery_filter';

  function normalizeGalleryFilter(raw) {
    var value = String(raw || '').trim().toLowerCase();
    if (!value) return 'all';
    return /^[a-z0-9_-]+$/.test(value) ? value : 'all';
  }

  function readGalleryFilterFromUrl(urlLike) {
    var url;
    try {
      url = new URL(urlLike || window.location.href, window.location.href);
    } catch (err) {
      return 'all';
    }
    return normalizeGalleryFilter(url.searchParams.get('category') || url.searchParams.get('galleryCategory'));
  }

  function readStoredGalleryFilter() {
    try {
      return normalizeGalleryFilter(window.sessionStorage.getItem(galleryFilterStorageKey));
    } catch (err) {
      return 'all';
    }
  }

  function storeGalleryFilter(filter) {
    try {
      window.sessionStorage.setItem(galleryFilterStorageKey, normalizeGalleryFilter(filter));
    } catch (err) {
    }
  }

  function resolveGalleryReturnFilter() {
    var fromCurrent = readGalleryFilterFromUrl(window.location.href);
    if (fromCurrent !== 'all') return fromCurrent;

    var fromReferrer = 'all';
    try {
      if (document.referrer) {
        fromReferrer = readGalleryFilterFromUrl(document.referrer);
      }
    } catch (err) {
    }
    if (fromReferrer !== 'all') return fromReferrer;

    return readStoredGalleryFilter();
  }

  function applyGalleryBackLinkState() {
    var filter = resolveGalleryReturnFilter();
    if (filter !== 'all') {
      storeGalleryFilter(filter);
    }

    var backLinks = document.querySelectorAll('a[href]');
    for (var i = 0; i < backLinks.length; i++) {
      var link = backLinks[i];
      var text = String(link.textContent || '').toLowerCase();
      var cls = String(link.className || '');
      if (text.indexOf('back to gallery') === -1 && cls.indexOf('writeup-back') === -1) continue;

      var href = link.getAttribute('href') || '';
      if (href.indexOf('gallery') === -1) continue;
      var targetUrl;
      try {
        targetUrl = new URL(href, window.location.href);
      } catch (err) {
        continue;
      }
      targetUrl.searchParams.delete('galleryCategory');
      if (filter === 'all') {
        targetUrl.searchParams.delete('category');
      } else {
        targetUrl.searchParams.set('category', filter);
      }
      link.setAttribute('href', targetUrl.pathname + targetUrl.search + targetUrl.hash);
    }
  }

  if (path.indexOf('gallery') !== -1 || path.indexOf('writeups') !== -1 || path.indexOf('/projects/') !== -1) {
    var pageFilter = readGalleryFilterFromUrl(window.location.href);
    if (pageFilter !== 'all') {
      storeGalleryFilter(pageFilter);
    }
  }

  var style = document.createElement('style');
  style.id = 'jh-header-styles';
  style.textContent = [
    '* { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important; }',
    '.jh-header {',
    '  position: fixed;',
    '  top: 0; left: 0; right: 0;',
    '  z-index: 9999;',
    '  display: flex;',
    '  flex-direction: column;',
    '  align-items: center;',
    '  padding-top: 26px;',
    '  padding-bottom: 1.75rem;',
    '  pointer-events: none;',
    '  transition: background 0.42s cubic-bezier(0.22, 1, 0.36, 1), backdrop-filter 0.42s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.32s ease;',
    '  will-change: background, backdrop-filter;',
    '  --jh-fade-color: rgba(7, 16, 33, 0.66);',
    '  --jh-fade-mid: rgba(7, 16, 33, 0.26);',
    '  overflow: visible;',
    '}',
    '',
    '.jh-header-top {',
    '  position: relative;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  width: 100%;',
    '  padding: 0 1rem;',
    '}',
    '',
    '.jh-header.jh-scrolled {',
    '  pointer-events: none;',
    '  background: transparent;',
    '}',

    '.jh-header.jh-scrolled::before {',
    '  content: "";',
    '  position: absolute;',
    '  left: 0;',
    '  right: 0;',
    '  top: -2px;',
    '  height: 148px;',
    '  pointer-events: none;',
    '  background: linear-gradient(to bottom, var(--jh-fade-color) 0%, var(--jh-fade-mid) 52%, rgba(0, 0, 0, 0.05) 82%, rgba(0, 0, 0, 0) 100%);',
    '  backdrop-filter: blur(16px);',
    '  -webkit-backdrop-filter: blur(16px);',
    '  mask-image: linear-gradient(to bottom, black 0%, black 62%, transparent 100%);',
    '  -webkit-mask-image: linear-gradient(to bottom, black 0%, black 62%, transparent 100%);',
    '  box-shadow: 0 24px 34px -30px var(--jh-fade-color);',
    '}',
    '',
    '.jh-home-header .jh-logo { color: #000 !important; }',
    '.jh-home-header .jh-nav { background: rgba(208, 208, 208, 0.56); border: 1px solid rgba(0, 0, 0, 0.14); border-radius: 999px; padding: 0.44rem 1.05rem; }',
    '.jh-home-header .jh-nav a { color: rgba(0, 0, 0, 0.68) !important; }',
    '.jh-home-header .jh-nav a:hover, .jh-home-header .jh-nav a.jh-cur { color: #000 !important; }',
    '.jh-home-header .jh-hamburger { color: #000 !important; }',
    '.jh-home-header.jh-scrolled { background: rgba(214, 214, 214, 0.62) !important; transition: background 0.42s cubic-bezier(0.22, 1, 0.36, 1), backdrop-filter 0.42s cubic-bezier(0.22, 1, 0.36, 1); }',
    '.jh-home-header { --jh-fade-color: rgba(214, 214, 214, 0.66); --jh-fade-mid: rgba(214, 214, 214, 0.24); }',
    '.jh-archives-header.jh-scrolled { background: rgba(0, 0, 0, 0.78) !important; }',
    '.jh-archives-header { --jh-fade-color: rgba(0, 0, 0, 0.84); --jh-fade-mid: rgba(0, 0, 0, 0.3); }',
    '.jh-archives-header .jh-nav { background: rgba(0, 0, 0, 0.7); border: 1px solid rgba(255, 255, 255, 0.14); }',
    '.jh-archives-header .jh-nav a:hover, .jh-archives-header .jh-nav a.jh-cur { color: #fff !important; }',
    '',
    '.home-dark-clocks .clock-container { color: rgba(0, 0, 0, 0.5) !important; }',
    '.home-dark-clocks .clock-label { color: rgba(0, 0, 0, 0.4) !important; }',
    '.home-dark-clocks .clock-time { color: rgba(0, 0, 0, 0.6) !important; }',
    '.home-dark-clocks .clock-date { color: rgba(0, 0, 0, 0.4) !important; }',
    '',
    '.jh-logo {',
    '  pointer-events: auto;',
    '  text-decoration: none;',
    '  display: inline-flex;',
    '  align-items: center;',
    '  gap: 0.45rem;',
    '  font-size: 1.65rem;',
    '  font-weight: normal;',
    '  letter-spacing: -0.09em;',
    '  text-transform: lowercase;',
    '  color: #e6eef6;',
    '  line-height: 1;',
    '}',
    '',
    '.jh-logo img {',
    '  height: 1.4em;',
    '  width: auto;',
    '  display: inline-block;',
    '  image-rendering: auto;',
    '}',
    '',
    '.jh-nav {',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  gap: 1.45rem;',
    '  margin-top: 0.55rem;',
    '  pointer-events: auto;',
    '  background: rgba(10, 16, 28, 0.52);',
    '  border: 1px solid rgba(255, 255, 255, 0.14);',
    '  border-radius: 999px;',
    '  padding: 0.44rem 1.05rem;',
    '}',
    '',
    '.jh-nav a {',
    '  font-size: 0.84rem;',
    '  font-weight: 400;',
    '  letter-spacing: -0.015em;',
    '  text-transform: lowercase;',
    '  color: rgba(230,238,246,0.5);',
    '  text-decoration: none;',
    '  transition: color 0.18s;',
    '}',

    'main h1, section h1, .writeup-header h1, .gallery-header h1, .archives-title h1, .photo-header h1 {',
    '  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important;',
    '  font-weight: 400 !important;',
    '  text-transform: lowercase !important;',
    '  letter-spacing: -0.09em !important;',
    '  font-size: clamp(2.45rem, 5.1vw, 3.85rem) !important;',
    '  line-height: 0.94 !important;',
    '}',
    'main h2, section h2, .writeup-header h2, .gallery-header h2 {',
    '  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important;',
    '  font-weight: 400 !important;',
    '  text-transform: lowercase !important;',
    '  letter-spacing: -0.06em !important;',
    '}',
    'main h3, section h3 {',
    '  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important;',
    '  font-weight: 400 !important;',
    '  text-transform: lowercase !important;',
    '  letter-spacing: -0.05em !important;',
    '}',
    '',
    '.jh-nav a:hover { color: #e6eef6; }',
    '.jh-nav a.jh-cur { color: #e6eef6; }',
    '',
    '.jh-hamburger {',
    '  display: none;',
    '  pointer-events: auto;',
    '  background: none;',
    '  border: none;',
    '  color: #e6eef6;',
    '  font-size: 1.5rem;',
    '  position: absolute;',
    '  right: 1rem;',
    '  top: 50%;',
    '  transform: translateY(-50%);',
    '  cursor: pointer;',
    '  padding: 0.25rem 0.5rem;',
    '  line-height: 1;',
    '  transition: transform 0.2s ease;',
    '  -webkit-tap-highlight-color: transparent;',
    '}',
    '',
    '.jh-hamburger:hover { transform: translateY(-50%) scale(1.1); }',
    '',
    '.jh-mobile-dropdown {',
    '  display: none;',
    '  pointer-events: auto;',
    '}',
    '',
    '@media (max-width: 768px) {',
    '',
    '  .jh-header {',
    '    padding-top: 20px;',
    '    padding-bottom: 1rem;',
    '  }',
    '',
    '  .jh-header.jh-scrolled::before {',
    '    top: -2px;',
    '    height: 124px;',
    '  }',
    '',
    '  .jh-nav { display: none !important; }',
    '',
    '  .jh-hamburger { display: block; right: 0.65rem; }',
    '',
    '  .jh-mobile-dropdown {',
    '    display: block;',
    '    width: 100%;',
    '    margin-top: 0.5rem;',
    '    max-height: 0;',
    '    overflow: hidden;',
    '    transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;',
    '    opacity: 0;',
    '  }',
    '',
    '  .jh-mobile-dropdown.jh-open {',
    '    max-height: 400px;',
    '    opacity: 1;',
    '  }',
    '',
    '  .jh-mobile-dropdown-inner {',
    '    display: flex;',
    '    flex-direction: column;',
    '    align-items: center;',
    '    gap: 0;',
    '    padding: 0.75rem 0 0.5rem;',
    '    background: rgba(7, 16, 33, 0.92);',
    '    backdrop-filter: blur(16px);',
    '    -webkit-backdrop-filter: blur(16px);',
    '    border-bottom: 1px solid rgba(192, 132, 252, 0.1);',
    '  }',

    '  .jh-home-header .jh-mobile-dropdown-inner {',
    '    background: rgba(218, 218, 218, 0.95);',
    '    border-bottom: 1px solid rgba(0, 0, 0, 0.12);',
    '  }',

    '  .jh-home-header .jh-mobile-dropdown-inner a {',
    '    color: rgba(0,0,0,0.66);',
    '  }',

    '  .jh-home-header .jh-mobile-dropdown-inner a:hover,',
    '  .jh-home-header .jh-mobile-dropdown-inner a:active,',
    '  .jh-home-header .jh-mobile-dropdown-inner a.jh-cur {',
    '    color: #000;',
    '    background: rgba(0, 0, 0, 0.07);',
    '  }',

    '  .jh-archives-header .jh-mobile-dropdown-inner {',
    '    background: rgba(0, 0, 0, 0.95);',
    '    border-bottom: 1px solid rgba(255, 255, 255, 0.14);',
    '  }',

    '  .jh-archives-header .jh-mobile-dropdown-inner a:hover,',
    '  .jh-archives-header .jh-mobile-dropdown-inner a:active,',
    '  .jh-archives-header .jh-mobile-dropdown-inner a.jh-cur {',
    '    color: #fff;',
    '    background: rgba(255, 255, 255, 0.08);',
    '  }',

    '  .jh-mobile-dropdown-inner a {',
    '    display: block;',
    '    width: 100%;',
    '    text-align: center;',
    '    padding: 0.7rem 1rem;',
    '    font-size: 0.75rem;',
    '    font-weight: 400;',
    '    letter-spacing: 0.1em;',
    '    text-transform: lowercase;',
    '    color: rgba(230,238,246,0.55);',
    '    text-decoration: none;',
    '    transition: color 0.18s, background 0.18s;',
    '  }',
    '',
    '  .jh-mobile-dropdown-inner a:hover,',
    '  .jh-mobile-dropdown-inner a:active {',
    '    color: #e6eef6;',
    '    background: rgba(192, 132, 252, 0.08);',
    '  }',
    '',
    '  .jh-mobile-dropdown-inner a.jh-cur {',
    '    color: #e6eef6;',
    '  }',
    '',
    '}',
  ].join('\n');

  document.head.appendChild(style);

  var items = [
    { key: 'gallery', label: 'gallery', href: base + 'gallery' },
    { key: 'archives', label: 'archives', href: base + 'archives' },
    { key: 'hoshii', label: 'hsoh', href: base + 'hoshii' },
    { key: 'resume', label: 'resume', href: base + 'resume' },
    { key: 'about', label: 'about', href: base + 'about' }
  ];

  var navLinks = items.map(function (item) {
    var cls = item.key === cur ? ' class="jh-cur"' : '';
    return '<a href="' + item.href + '"' + cls + '>' + item.label + '</a>';
  }).join('');

  var mobileNavLinks = items.map(function (item) {
    var cls = item.key === cur ? ' class="jh-cur"' : '';
    return '<a href="' + item.href + '"' + cls + '>' + item.label + '</a>';
  }).join('');

  var header = document.createElement('header');
  header.className = 'jh-header';
  if (isHome) {
    header.className += ' jh-home-header';
  }
  if (isArchivePage && !isHome) {
    header.className += ' jh-archives-header';
  }
  header.innerHTML =
    '<div class="jh-header-top">' +
    '<a class="jh-logo" href="' + base + '.">' +
    '<img src="' + base + 'favicon.ico" alt="" ' +
    'onerror="this.style.display=\'none\'">' +
    'johostudio' +
    '</a>' +
    '<button class="jh-hamburger" aria-label="Menu" aria-expanded="false">☰</button>' +
    '</div>' +
    '<nav class="jh-nav">' + navLinks + '</nav>' +
    '<div class="jh-mobile-dropdown">' +
    '<div class="jh-mobile-dropdown-inner">' + mobileNavLinks + '</div>' +
    '</div>';

  var hamburger = header.querySelector('.jh-hamburger');
  var dropdown = header.querySelector('.jh-mobile-dropdown');
  var isOpen = false;

  hamburger.addEventListener('click', function (e) {
    e.stopPropagation();
    isOpen = !isOpen;
    if (isOpen) {
      dropdown.classList.add('jh-open');
      hamburger.textContent = '✕';
      hamburger.setAttribute('aria-expanded', 'true');
    } else {
      dropdown.classList.remove('jh-open');
      hamburger.textContent = '☰';
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  dropdown.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      isOpen = false;
      dropdown.classList.remove('jh-open');
      hamburger.textContent = '☰';
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('click', function (e) {
    if (isOpen && !header.contains(e.target)) {
      isOpen = false;
      dropdown.classList.remove('jh-open');
      hamburger.textContent = '☰';
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  if (!window.__jhImageLightboxInit) {
    window.__jhImageLightboxInit = true;

    var imageLightbox = null;
    var imageLightboxImg = null;

    function ensureImageLightbox() {
      if (imageLightbox) return;

      if (!document.getElementById('jh-image-lightbox-style')) {
        var lightboxStyle = document.createElement('style');
        lightboxStyle.id = 'jh-image-lightbox-style';
        lightboxStyle.textContent = [
          'body.jh-image-lightbox-open { overflow: hidden !important; touch-action: none; }',
          '#jh-image-lightbox {',
          '  position: fixed;',
          '  inset: 0;',
          '  z-index: 20000;',
          '  display: flex;',
          '  align-items: center;',
          '  justify-content: center;',
          '  padding: clamp(14px, 4vw, 34px);',
          '  background: rgba(3, 7, 12, 0.92);',
          '  backdrop-filter: blur(8px);',
          '  -webkit-backdrop-filter: blur(8px);',
          '  opacity: 0;',
          '  pointer-events: none;',
          '  transition: opacity 0.2s ease;',
          '}',
          '#jh-image-lightbox.open { opacity: 1; pointer-events: auto; }',
          '#jh-image-lightbox img {',
          '  max-width: min(96vw, 1800px);',
          '  max-height: 90vh;',
          '  width: auto;',
          '  height: auto;',
          '  border-radius: 10px;',
          '  box-shadow: 0 28px 54px rgba(0, 0, 0, 0.5);',
          '  cursor: zoom-out;',
          '}',
          '#jh-image-lightbox .jh-image-lightbox-close {',
          '  position: absolute;',
          '  right: clamp(10px, 2vw, 22px);',
          '  top: clamp(10px, 2vw, 22px);',
          '  border: 1px solid rgba(255, 255, 255, 0.2);',
          '  background: rgba(8, 13, 20, 0.78);',
          '  color: rgba(230, 238, 246, 0.95);',
          '  border-radius: 999px;',
          '  padding: 8px 12px;',
          '  font-size: 12px;',
          '  letter-spacing: 0.06em;',
          '  text-transform: uppercase;',
          '  cursor: pointer;',
          '}',
          '.jh-logo img { cursor: default !important; }',
          'img:not([data-no-lightbox]) { cursor: zoom-in; }',
          '#jh-image-lightbox img { cursor: zoom-out !important; }'
        ].join('\n');
        document.head.appendChild(lightboxStyle);
      }

      imageLightbox = document.createElement('div');
      imageLightbox.id = 'jh-image-lightbox';
      imageLightbox.setAttribute('role', 'dialog');
      imageLightbox.setAttribute('aria-modal', 'true');
      imageLightbox.setAttribute('aria-label', 'Expanded image view');
      imageLightbox.innerHTML =
        '<button class="jh-image-lightbox-close" type="button" aria-label="Close image">close</button>' +
        '<img src="" alt="Expanded image" loading="eager">';

      if (document.body) {
        document.body.appendChild(imageLightbox);
      } else {
        document.addEventListener('DOMContentLoaded', function () {
          document.body.appendChild(imageLightbox);
        });
      }

      imageLightboxImg = imageLightbox.querySelector('img');

      imageLightbox.addEventListener('click', function (event) {
        if (!imageLightbox.classList.contains('open')) return;
        if (event.target === imageLightbox || event.target === imageLightboxImg || event.target.closest('.jh-image-lightbox-close')) {
          closeImageLightbox();
        }
      });
    }

    function openImageLightbox(src, alt) {
      if (!src) return;
      ensureImageLightbox();
      imageLightboxImg.src = src;
      imageLightboxImg.alt = alt || 'Expanded image';
      imageLightbox.classList.add('open');
      document.body.classList.add('jh-image-lightbox-open');
    }

    function closeImageLightbox() {
      if (!imageLightbox || !imageLightbox.classList.contains('open')) return;
      imageLightbox.classList.remove('open');
      document.body.classList.remove('jh-image-lightbox-open');
      setTimeout(function () {
        if (imageLightbox && !imageLightbox.classList.contains('open') && imageLightboxImg) {
          imageLightboxImg.removeAttribute('src');
        }
      }, 220);
    }

    document.addEventListener('click', function (event) {
      var target = event.target;
      if (!target || !target.closest) return;

      var img = target.closest('img');
      if (!img) return;
      if (img.closest('#jh-image-lightbox')) return;
      if (img.closest('.jh-logo')) return;
      if (img.closest('#lb') || img.closest('#gallery-modal')) return;
      if (img.closest('button, [role="button"], label, input, textarea, select')) return;
      if (img.closest('[data-no-lightbox]')) return;
      if (img.getAttribute('data-no-lightbox') === 'true') return;

      var src = img.currentSrc || img.getAttribute('src') || '';
      if (!src) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openImageLightbox(src, img.getAttribute('alt') || 'Expanded image');
    }, true);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeImageLightbox();
      }
    });

    ensureImageLightbox();
  }

  var isScrolled = false;
  function updateScroll() {
    var y = window.scrollY || 0;
    var next = isScrolled ? y > 8 : y > 18;
    if (next === isScrolled) return;
    isScrolled = next;
    if (isScrolled) {
      header.classList.add('jh-scrolled');
    } else {
      header.classList.remove('jh-scrolled');
    }
  }

  var headerScrollTick = false;
  window.addEventListener('scroll', function () {
    if (headerScrollTick) return;
    headerScrollTick = true;
    requestAnimationFrame(function () {
      headerScrollTick = false;
      updateScroll();
    });
  }, { passive: true });
  updateScroll();

  if (document.body) {
    document.body.insertBefore(header, document.body.firstChild);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      document.body.insertBefore(header, document.body.firstChild);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyGalleryBackLinkState);
  } else {
    applyGalleryBackLinkState();
  }
})();
