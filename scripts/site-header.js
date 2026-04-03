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

  /* ── 2. Detect current section ── */
  var cur = '';
  if (path.indexOf('gallery') !== -1) cur = 'gallery';
  else if (path.indexOf('about') !== -1) cur = 'about';
  else if (path.indexOf('vancouver') !== -1 || path.indexOf('project') !== -1) cur = 'vancouver';
  else if (path.indexOf('hoshii') !== -1) cur = 'hoshii';
  else if (path.indexOf('resume') !== -1) cur = 'resume';
  else if (path.indexOf('archives') !== -1) cur = 'archives';
  else if (path.indexOf('darkroom') !== -1) cur = 'darkroom';

  /* ── 3. Inject styles into <head> synchronously ── */
  var style = document.createElement('style');
  style.id = 'jh-header-styles';
  style.textContent = [
    /* ── Base header ── */
    '.jh-header {',
    '  position: fixed;',
    '  top: 0; left: 0; right: 0;',
    '  z-index: 9999;',
    '  display: flex;',
    '  flex-direction: column;',
    '  align-items: center;',
    '  padding-top: 40px;',
    '  padding-bottom: 1.5rem;',
    '  pointer-events: none;',
    '  transition: background 0.3s ease, backdrop-filter 0.3s ease;',
    '}',
    '',
    '.jh-header-top {',
    '  display: flex;',
    '  flex-direction: row;',
    '  align-items: center;',
    '  justify-content: center;',
    '  gap: 2.5rem;',
    '  width: 100%;',
    '}',
    '',
    '.jh-header.jh-scrolled {',
    '  pointer-events: none;',
    '  background: rgba(7, 16, 33, 0.45);',
    '  backdrop-filter: blur(12px);',
    '  -webkit-backdrop-filter: blur(12px);',
    '  mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);',
    '  -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);',
    '}',
    '',
    /* ── Logo ── */
    '.jh-logo {',
    '  pointer-events: auto;',
    '  text-decoration: none;',
    '  display: inline-flex;',
    '  align-items: center;',
    '  gap: 0.45rem;',
    '  font-size: 1.45rem;',
    '  font-weight: 700;',
    '  letter-spacing: -0.06em;',
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
    '  gap: 1.2rem;',
    '  pointer-events: auto;',
    '}',
    '',
    '.jh-nav a {',
    '  font-size: 0.7rem;',
    '  font-weight: 500;',
    '  letter-spacing: 0.1em;',
    '  color: rgba(230,238,246,0.5);',
    '  text-decoration: none;',
    '  transition: color 0.18s;',
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
    '  cursor: pointer;',
    '  padding: 0.25rem 0.5rem;',
    '  line-height: 1;',
    '  transition: transform 0.2s ease;',
    '  -webkit-tap-highlight-color: transparent;',
    '}',
    '',
    '.jh-hamburger:hover { transform: scale(1.1); }',
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
    '    padding-top: 24px;',
    '    padding-bottom: 0.75rem;',
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
    '  .jh-hamburger { display: block; }',
    '',
    '  /* Mobile dropdown */',
    '  .jh-mobile-dropdown {',
    '    display: block;',
    '    width: 100%;',
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
    '',
    '  .jh-mobile-dropdown-inner a {',
    '    display: block;',
    '    width: 100%;',
    '    text-align: center;',
    '    padding: 0.7rem 1rem;',
    '    font-size: 0.75rem;',
    '    font-weight: 500;',
    '    letter-spacing: 0.1em;',
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
    { key: 'gallery', label: 'GALLERY', href: base + 'gallery' },
    { key: 'archives', label: 'ARCHIVES', href: base + 'archives' },
    { key: 'hoshii', label: 'HSOH', href: base + 'hoshii' },
    { key: 'vancouver', label: 'VANCOUVER', href: base + 'projects/vancouver' },
    { key: 'darkroom', label: 'DARKROOM', href: base + 'darkroom' },
    { key: 'resume', label: 'RESUME', href: base + 'resume' },
    { key: 'about', label: 'ABOUT', href: base + 'about' }
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
  header.innerHTML =
    '<div class="jh-header-top">' +
    '<a class="jh-logo" href="' + base + '.">' +
    '<img src="' + base + 'favicon.ico" alt="" ' +
    'onerror="this.style.display=\'none\'">' +
    'johostudio' +
    '</a>' +
    '<nav class="jh-nav">' + navLinks + '</nav>' +
    '<button class="jh-hamburger" aria-label="Menu" aria-expanded="false">☰</button>' +
    '</div>' +
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
  function updateScroll() {
    if (window.scrollY > 15) {
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
