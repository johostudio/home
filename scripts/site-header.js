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
    '.jh-header {',
    '  position: fixed;',
    '  top: 40px; left: 0; right: 0;',
    '  z-index: 9999;',
    '  display: flex;',
    '  flex-direction: column;',
    '  align-items: center;',
    '  padding: 1rem 0 0.6rem;',
    '  pointer-events: none;',
    '}',

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

    '.jh-logo img {',
    '  height: 1.4em;',
    '  width: auto;',
    '  display: inline-block;',
    '  image-rendering: auto;',
    '}',

    '.jh-nav {',
    '  margin-top: 0.4rem;',
    '  display: flex;',
    '  gap: 1.2rem;',
    '  pointer-events: auto;',
    '}',

    '.jh-nav a {',
    '  font-size: 0.7rem;',
    '  font-weight: 500;',
    '  letter-spacing: 0.1em;',
    '  color: rgba(230,238,246,0.5);',
    '  text-decoration: none;',
    '  transition: color 0.18s;',
    '}',

    '.jh-nav a:hover { color: #e6eef6; }',
    '.jh-nav a.jh-cur { color: #e6eef6; }'
  ].join('\n');

  document.head.appendChild(style);

  /* ── 4. Build nav HTML ── */
  var items = [
    { key: 'gallery', label: 'GALLERY', href: base + 'gallery.html' },
    { key: 'about', label: 'ABOUT', href: base + 'about.html' },
    { key: 'vancouver', label: 'VANCOUVER', href: base + 'projects/vancouver.html' },
    { key: 'hoshii', label: 'HSOH', href: base + 'hoshii.html' },
    { key: 'resume', label: 'RESUME', href: base + 'resume.html' },
    { key: 'archives', label: 'ARCHIVES', href: base + 'archives.html' },
    { key: 'darkroom', label: 'DARKROOM', href: base + 'darkroom.html' }
  ];

  var navLinks = items.map(function (item) {
    var cls = item.key === cur ? ' class="jh-cur"' : '';
    return '<a href="' + item.href + '"' + cls + '>' + item.label + '</a>';
  }).join('');

  /* ── 5. Build & insert header element ── */
  var header = document.createElement('header');
  header.className = 'jh-header';
  header.innerHTML =
    '<a class="jh-logo" href="' + base + 'index.html">' +
    '<img src="' + base + 'favicon.ico" alt="" ' +
    'onerror="this.style.display=\'none\'">' +
    'johostudio' +
    '</a>' +
    '<nav class="jh-nav">' + navLinks + '</nav>';

  /* Insert as very first child of <body> */
  if (document.body) {
    document.body.insertBefore(header, document.body.firstChild);
  } else {
    /* Fallback: listen for DOMContentLoaded (should never hit for synchronous placement) */
    document.addEventListener('DOMContentLoaded', function () {
      document.body.insertBefore(header, document.body.firstChild);
    });
  }
})();
