/**
 * Shared HTML / URL sanitization for static pages (DOM XSS hardening).
 * Exposes window.jhHtmlSafe — load before scripts that assign to innerHTML.
 */
;(function () {
  function escapeHtml(value) {
    if (value == null) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function sanitizeHttpUrl(raw) {
    if (raw == null || typeof raw !== 'string') return '';
    var s = raw.trim();
    if (!s) return '';
    try {
      var u = new URL(s, typeof window !== 'undefined' ? window.location.href : 'https://example.invalid');
      if (u.protocol === 'https:' || u.protocol === 'http:') return u.href;
      if (u.protocol === 'mailto:') {
        var path = (u.pathname || '') + (u.search || '');
        if (/^[^\s<>"]+$/.test(path)) return u.href;
      }
    } catch (_e) {}
    return '';
  }

  /** Allow only #rgb / #rrggbb for inline CSS color values. */
  function sanitizeHexColor(raw) {
    if (raw == null || typeof raw !== 'string') return '';
    var s = raw.trim();
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s) ? s : '';
  }

  if (typeof window !== 'undefined') {
    window.jhHtmlSafe = {
      escapeHtml: escapeHtml,
      sanitizeHttpUrl: sanitizeHttpUrl,
      sanitizeHexColor: sanitizeHexColor
    };
  }
})();
