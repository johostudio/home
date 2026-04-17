/**
 * writeup-renderer.js
 * 
 * Lightweight Markdown-to-HTML renderer for writeup pages.
 * Reads the content from a <script type="text/markdown"> block on the page
 * and renders it into the .writeup-body container.
 * 
 * Supports: headings, bold, italic, links, images, lists, blockquotes,
 *           code blocks, inline code, horizontal rules, and paragraphs.
 * 
 * This lets you write project writeups in simple Markdown —
 * just like Obsidian or Notion — right inside the HTML file.
 */
;(function () {
  var mdBlock = document.getElementById('writeup-md');
  var target = document.getElementById('writeup-body');
  if (!mdBlock || !target) return;

  var md = mdBlock.textContent;

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
      var u = new URL(s, window.location.href);
      if (u.protocol === 'https:' || u.protocol === 'http:') return u.href;
      if (u.protocol === 'mailto:') {
        var path = (u.pathname || '') + (u.search || '');
        if (/^[^\s<>"]+$/.test(path)) return u.href;
      }
    } catch (_e) {}
    return '';
  }

  // ── Simple Markdown parser ──
  function renderMarkdown(src) {
    var lines = src.split('\n');
    var html = [];
    var inCodeBlock = false;
    var codeBuffer = [];
    var inList = false;
    var listType = '';
    var inBlockquote = false;
    var bqBuffer = [];

    function closeList() {
      if (inList) {
        html.push('</' + listType + '>');
        inList = false;
      }
    }

    function closeBlockquote() {
      if (inBlockquote) {
        html.push('<blockquote>' + inlineFormat(bqBuffer.join(' ')) + '</blockquote>');
        inBlockquote = false;
        bqBuffer = [];
      }
    }

    function inlineFormat(text) {
      text = escapeHtml(text);
      // Images: ![alt](src)
      text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function (_m, alt, url) {
        var u = sanitizeHttpUrl(url);
        if (!u) return alt;
        return '<img src="' + u + '" alt="' + alt + '" loading="lazy" decoding="async">';
      });
      // Links: [text](url)
      text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_m, label, url) {
        var u = sanitizeHttpUrl(url);
        if (!u) return label;
        return '<a href="' + u + '" target="_blank" rel="noopener noreferrer">' + label + '</a>';
      });
      // Bold: **text** or __text__
      text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');
      // Italic: *text* or _text_
      text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
      text = text.replace(/_(.+?)_/g, '<em>$1</em>');
      // Inline code: `code`
      text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
      return text;
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      // Code blocks: ```
      if (line.trim().indexOf('```') === 0) {
        if (inCodeBlock) {
          html.push('<pre><code>' + codeBuffer.join('\n') + '</code></pre>');
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          closeList();
          closeBlockquote();
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
        continue;
      }

      var trimmed = line.trim();

      // Empty line
      if (trimmed === '') {
        closeList();
        closeBlockquote();
        continue;
      }

      // Headings
      var headingMatch = trimmed.match(/^(#{1,6})\s+(.+)/);
      if (headingMatch) {
        closeList();
        closeBlockquote();
        var level = headingMatch[1].length;
        html.push('<h' + level + '>' + inlineFormat(headingMatch[2]) + '</h' + level + '>');
        continue;
      }

      // Horizontal rule
      if (/^(-{3,}|_{3,}|\*{3,})$/.test(trimmed)) {
        closeList();
        closeBlockquote();
        html.push('<hr>');
        continue;
      }

      // Blockquote
      if (trimmed.indexOf('> ') === 0 || trimmed === '>') {
        closeList();
        if (!inBlockquote) inBlockquote = true;
        bqBuffer.push(trimmed.substring(2));
        continue;
      } else {
        closeBlockquote();
      }

      // Unordered list
      if (/^[-*+]\s+/.test(trimmed)) {
        closeBlockquote();
        if (!inList || listType !== 'ul') {
          closeList();
          html.push('<ul>');
          inList = true;
          listType = 'ul';
        }
        html.push('<li>' + inlineFormat(trimmed.replace(/^[-*+]\s+/, '')) + '</li>');
        continue;
      }

      // Ordered list
      if (/^\d+\.\s+/.test(trimmed)) {
        closeBlockquote();
        if (!inList || listType !== 'ol') {
          closeList();
          html.push('<ol>');
          inList = true;
          listType = 'ol';
        }
        html.push('<li>' + inlineFormat(trimmed.replace(/^\d+\.\s+/, '')) + '</li>');
        continue;
      }

      // Regular paragraph
      closeList();
      html.push('<p>' + inlineFormat(trimmed) + '</p>');
    }

    closeList();
    closeBlockquote();
    return html.join('\n');
  }

  target.innerHTML = renderMarkdown(md);

  /* ── Side jumpbar (table of contents) ── */
  var headings = target.querySelectorAll('h1, h2, h3');
  if (headings.length > 1) {
    // Generate IDs for headings
    for (var j = 0; j < headings.length; j++) {
      var h = headings[j];
      if (!h.id) {
        h.id = 'section-' + h.textContent.trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }
    }

    // Build jumpbar
    var jumpbar = document.createElement('nav');
    jumpbar.className = 'writeup-jumpbar';
    var jumpInner = '<div class="jumpbar-title">On this page</div>';
    for (var k = 0; k < headings.length; k++) {
      var hd = headings[k];
      var indent = hd.tagName === 'H3' ? ' jumpbar-indent' : '';
      jumpInner += '<a href="#' + escapeHtml(hd.id) + '" class="jumpbar-link' + indent + '" data-target="' + escapeHtml(hd.id) + '">' + escapeHtml(hd.textContent) + '</a>';
    }
    jumpbar.innerHTML = jumpInner;

    // Insert jumpbar into page
    var mainEl = document.querySelector('.writeup-main');
    if (mainEl) {
      mainEl.style.position = 'relative';
      mainEl.appendChild(jumpbar);
    }

    // Scroll spy
    var jumpLinks = jumpbar.querySelectorAll('.jumpbar-link');
    function updateJumpbar() {
      var scrollPos = window.scrollY + 120;
      var activeId = '';
      for (var m = 0; m < headings.length; m++) {
        if (headings[m].offsetTop <= scrollPos) {
          activeId = headings[m].id;
        }
      }
      for (var n = 0; n < jumpLinks.length; n++) {
        if (jumpLinks[n].getAttribute('data-target') === activeId) {
          jumpLinks[n].classList.add('jumpbar-active');
        } else {
          jumpLinks[n].classList.remove('jumpbar-active');
        }
      }
    }
    window.addEventListener('scroll', updateJumpbar, { passive: true });
    updateJumpbar();

    // Smooth scroll
    jumpbar.addEventListener('click', function(e) {
      if (e.target.classList.contains('jumpbar-link')) {
        e.preventDefault();
        var tgt = document.getElementById(e.target.getAttribute('data-target'));
        if (tgt) {
          tgt.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }
})();
