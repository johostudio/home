;(function () {
  var mdBlock = document.getElementById('writeup-md');
  var target = document.getElementById('writeup-body');
  if (!mdBlock || !target) return;

  var md = mdBlock.textContent;

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
      text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
      text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
      text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');
      text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
      text = text.replace(/_(.+?)_/g, '<em>$1</em>');
      text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
      return text;
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

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

      if (trimmed === '') {
        closeList();
        closeBlockquote();
        continue;
      }

      var headingMatch = trimmed.match(/^(#{1,6})\s+(.+)/);
      if (headingMatch) {
        closeList();
        closeBlockquote();
        var level = headingMatch[1].length;
        html.push('<h' + level + '>' + inlineFormat(headingMatch[2]) + '</h' + level + '>');
        continue;
      }

      if (/^(-{3,}|_{3,}|\*{3,})$/.test(trimmed)) {
        closeList();
        closeBlockquote();
        html.push('<hr>');
        continue;
      }

      if (trimmed.indexOf('> ') === 0 || trimmed === '>') {
        closeList();
        if (!inBlockquote) inBlockquote = true;
        bqBuffer.push(trimmed.substring(2));
        continue;
      } else {
        closeBlockquote();
      }

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

      closeList();
      html.push('<p>' + inlineFormat(trimmed) + '</p>');
    }

    closeList();
    closeBlockquote();
    return html.join('\n');
  }

  target.innerHTML = renderMarkdown(md);
  var renderedImages = target.querySelectorAll('img');
  for (var imgIndex = 0; imgIndex < renderedImages.length; imgIndex++) {
    var image = renderedImages[imgIndex];
    image.loading = imgIndex === 0 ? 'eager' : 'lazy';
    image.decoding = 'async';
    image.fetchPriority = imgIndex === 0 ? 'high' : 'low';
  }

  var headings = target.querySelectorAll('h1, h2, h3');
  if (headings.length > 1) {
    for (var j = 0; j < headings.length; j++) {
      var h = headings[j];
      if (!h.id) {
        h.id = 'section-' + h.textContent.trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }
    }

    var jumpbar = document.createElement('nav');
    jumpbar.className = 'writeup-jumpbar';
    var jumpInner = '<div class="jumpbar-title">On this page</div>';
    for (var k = 0; k < headings.length; k++) {
      var hd = headings[k];
      var indent = hd.tagName === 'H3' ? ' jumpbar-indent' : '';
      jumpInner += '<a href="#' + hd.id + '" class="jumpbar-link' + indent + '" data-target="' + hd.id + '">' + hd.textContent + '</a>';
    }
    jumpbar.innerHTML = jumpInner;

    var mainEl = document.querySelector('.writeup-main');
    if (mainEl) {
      mainEl.style.position = 'relative';
      mainEl.appendChild(jumpbar);
    }

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
