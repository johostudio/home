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
      // Images: ![alt](src)
      text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
      // Links: [text](url)
      text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
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
})();
