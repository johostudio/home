// Small page transition controller: fade/slide in on load, fade/slide out on same-origin link click.
(function () {
  const DURATION = 340; // should match --page-transition
  const root = document.documentElement;
  const body = document.body;

  // Prepare enter animation
  function playEnter() {
    body.classList.add('page-enter');
    // next frame, add active so CSS transition runs
    requestAnimationFrame(() => {
      body.classList.add('page-enter-active');
    });
    // cleanup after animation
    setTimeout(() => {
      body.classList.remove('page-enter', 'page-enter-active');
    }, DURATION + 60);
  }

  // Play exit animation then navigate
  function navigateWithExit(href) {
    // don't double-trigger
    if (body.classList.contains('page-exit')) return;
    body.classList.add('page-exit');
    requestAnimationFrame(() => body.classList.add('page-exit-active'));
    setTimeout(() => {
      window.location.href = href;
    }, DURATION);
  }

  // Intercept clicks on same-origin internal links
  function onDocumentClick(e) {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('javascript:')) return;

    // external or target="_blank" or download or hash-only → allow default
    try {
      const url = new URL(href, location.href);
      if (a.target === '_blank' || url.origin !== location.origin) return;
      if (url.hash && url.pathname === location.pathname) return; // in-page anchor
    } catch (err) {
      return; // malformed URL → do nothing
    }

    // allow modifier-clicks (open in new tab)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    e.preventDefault();
    navigateWithExit(href);
  }

  // init
  document.addEventListener('DOMContentLoaded', () => {
    // mark ready (opt-in if needed)
    root.classList.add('page-transition-ready');
    playEnter();
    document.addEventListener('click', onDocumentClick, true);
    // ensure keyboard navigation via Enter on focused links works
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && document.activeElement && document.activeElement.tagName === 'A') {
        const a = document.activeElement;
        const href = a.getAttribute('href');
        if (href) {
          // let click handler do the rest
          navigateWithExit(href);
          e.preventDefault();
        }
      }
    });
  });
})();