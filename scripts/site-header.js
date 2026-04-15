/**
 * site-header.js
 * Self-injecting site header. Drop ONE script tag at the top of <body> on every page.
 * Automatically detects root vs projects/ and marks the current page active.
 *
 * Usage (root pages):      <script src="scripts/site-header.js"></script>
 * Usage (projects/ pages): <script src="../scripts/site-header.js"></script>
 */
; (function () {
  /* ── 1. Detect location ── */
  var path = window.location.pathname;
  var inSub = path.indexOf('/projects/') !== -1;
  var base = inSub ? '../' : '';
  var isArchivePage = path.indexOf('archives') !== -1 || path.indexOf('atlas') !== -1 || path.indexOf('bookshelf') !== -1 || path.indexOf('scrambled') !== -1;
  var isDarkroomPage = path.indexOf('darkroom') !== -1;
  
  var isHome = (path === '/' || path.endsWith('/index.html') || path.endsWith('/index') || path === '' || path.indexOf('index') !== -1);

  /* ── 2. Detect current section ── */
  var cur = '';
  if (path.indexOf('links') !== -1) cur = 'links';
  else if (path.indexOf('gallery') !== -1 || path.indexOf('writeups') !== -1) cur = 'gallery';
  else if (path.indexOf('about') !== -1) cur = 'about';
  else if (path.indexOf('vancouver') !== -1 || path.indexOf('project') !== -1) cur = 'vancouver';
  else if (path.indexOf('hoshii') !== -1) cur = 'hoshii';
  else if (path.indexOf('resume') !== -1) cur = 'resume';
  else if (isArchivePage) cur = 'archives';
  else if (isDarkroomPage) cur = 'darkroom';

  /* ── 3. Inject styles into <head> synchronously ── */
  var style = document.createElement('style');
  style.id = 'jh-header-styles';
  style.textContent = [
    /* ── Base header ── */
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
    '  background: rgba(7, 16, 33, 0.65);',
    '  backdrop-filter: blur(16px);',
    '  -webkit-backdrop-filter: blur(16px);',
    '  mask-image: linear-gradient(to bottom, black 62%, transparent 100%);',
    '  -webkit-mask-image: linear-gradient(to bottom, black 62%, transparent 100%);',
    '}',
    '',
    '    /* ── Home Page Black Text ── */',
    '.jh-home-header .jh-logo { color: #000 !important; }',
    '.jh-home-header .jh-nav { background: rgba(208, 208, 208, 0.56); border: 1px solid rgba(0, 0, 0, 0.14); border-radius: 999px; padding: 0.44rem 1.05rem; }',
    '.jh-home-header .jh-nav a { color: rgba(0, 0, 0, 0.68) !important; }',
    '.jh-home-header .jh-nav a:hover, .jh-home-header .jh-nav a.jh-cur { color: #000 !important; }',
    '.jh-home-header .jh-hamburger { color: #000 !important; }',
    '.jh-home-header.jh-scrolled { background: rgba(214, 214, 214, 0.62) !important; transition: background 0.42s cubic-bezier(0.22, 1, 0.36, 1), backdrop-filter 0.42s cubic-bezier(0.22, 1, 0.36, 1); }',
    '.jh-archives-header.jh-scrolled { background: rgba(0, 0, 0, 0.78) !important; }',
    '.jh-archives-header .jh-nav { background: rgba(0, 0, 0, 0.7); border: 1px solid rgba(255, 255, 255, 0.14); }',
    '.jh-archives-header .jh-nav a:hover, .jh-archives-header .jh-nav a.jh-cur { color: #fff !important; }',
    '.jh-darkroom-header.jh-scrolled { background: rgba(24, 17, 11, 0.84) !important; }',
    '.jh-darkroom-header .jh-nav { background: rgba(31, 22, 14, 0.82); border: 1px solid rgba(200, 169, 110, 0.26); }',
    '.jh-darkroom-header .jh-nav a { color: rgba(230, 210, 176, 0.64); }',
    '.jh-darkroom-header .jh-nav a:hover, .jh-darkroom-header .jh-nav a.jh-cur { color: #e6c98a !important; }',
    '',
    '/* Home page: black clocks */',
    '.home-dark-clocks .clock-container { color: rgba(0, 0, 0, 0.5) !important; }',
    '.home-dark-clocks .clock-label { color: rgba(0, 0, 0, 0.4) !important; }',
    '.home-dark-clocks .clock-time { color: rgba(0, 0, 0, 0.6) !important; }',
    '.home-dark-clocks .clock-date { color: rgba(0, 0, 0, 0.4) !important; }',
    '',
    /* ── Logo ── */
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
    /* ── Desktop nav (horizontal) ── */
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
    /* ── Hamburger button (hidden on desktop) ── */
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
    /* ── Mobile dropdown wrapper (hidden on desktop) ── */
    '.jh-mobile-dropdown {',
    '  display: none;',
    '  pointer-events: auto;',
    '}',
    '',
    /* ── Mobile styles ── */
    '@media (max-width: 768px) {',
    '',
    '  .jh-header {',
    '    padding-top: 20px;',
    '    padding-bottom: 1rem;',
    '  }',
    '',
    '  .jh-header.jh-scrolled {',
    '    mask-image: none;',
    '    -webkit-mask-image: none;',
    '  }',
    '',
    '  /* Hide horizontal nav on mobile */',
    '  .jh-nav { display: none !important; }',
    '',
    '  /* Show hamburger button */',
    '  .jh-hamburger { display: block; right: 0.65rem; }',
    '',
    '  /* Mobile dropdown */',
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

    '  .jh-darkroom-header .jh-mobile-dropdown-inner {',
    '    background: rgba(23, 15, 9, 0.96);',
    '    border-bottom: 1px solid rgba(200, 169, 110, 0.24);',
    '  }',

    '  .jh-darkroom-header .jh-mobile-dropdown-inner a {',
    '    color: rgba(230, 210, 176, 0.64);',
    '  }',

    '  .jh-darkroom-header .jh-mobile-dropdown-inner a:hover,',
    '  .jh-darkroom-header .jh-mobile-dropdown-inner a:active,',
    '  .jh-darkroom-header .jh-mobile-dropdown-inner a.jh-cur {',
    '    color: #e6c98a;',
    '    background: rgba(200, 169, 110, 0.12);',
    '  }',
    '',
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

  /* ── 4. Build nav HTML ── */
  var items = [
    { key: 'gallery', label: 'gallery', href: base + 'gallery' },
    { key: 'archives', label: 'archives', href: base + 'archives' },
    { key: 'hoshii', label: 'hsoh', href: base + 'hoshii' },
    { key: 'darkroom', label: 'darkroom', href: base + 'darkroom' },
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

  /* ── 5. Build & insert header element ── */
  var header = document.createElement('header');
  header.className = 'jh-header';
  if (isHome) {
    header.className += ' jh-home-header';
  }
  if (isArchivePage && !isHome) {
    header.className += ' jh-archives-header';
  }
  if (isDarkroomPage) {
    header.className += ' jh-darkroom-header';
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

  /* ── 6. Hamburger toggle ── */
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

  /* Close dropdown when a link is tapped */
  dropdown.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      isOpen = false;
      dropdown.classList.remove('jh-open');
      hamburger.textContent = '☰';
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  /* Close dropdown when clicking outside */
  document.addEventListener('click', function (e) {
    if (isOpen && !header.contains(e.target)) {
      isOpen = false;
      dropdown.classList.remove('jh-open');
      hamburger.textContent = '☰';
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  /* ── 7. Scroll Listener ── */
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

  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll(); // Initial check

  /* Insert as very first child of <body> */
  if (document.body) {
    document.body.insertBefore(header, document.body.firstChild);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      document.body.insertBefore(header, document.body.firstChild);
    });
  }
})();
