/**
 * gallery-render.js
 * Renders the project gallery grid and filter pills from GALLERY_PROJECTS data.
 */
;(function () {
  var grid = document.getElementById('gallery-grid');
  var filtersNav = document.getElementById('gallery-filters');
  if (!grid || !filtersNav) return;

  // ── Build filter pills from categories that have at least one project ──
  var usedCategories = {};
  GALLERY_PROJECTS.forEach(function (p) {
    usedCategories[p.category] = true;
  });

  GALLERY_CATEGORIES.forEach(function (cat) {
    // Show all category pills, even if empty (so user sees the full scope)
    var btn = document.createElement('button');
    btn.className = 'filter-pill';
    btn.setAttribute('data-filter', cat.key);
    btn.textContent = cat.label;
    filtersNav.appendChild(btn);
  });

  // ── Render project cards ──
  function renderProjects(filter) {
    grid.innerHTML = '';

    var filtered = filter === 'all'
      ? GALLERY_PROJECTS
      : GALLERY_PROJECTS.filter(function (p) { return p.category === filter; });

    // Sort by date descending
    filtered.sort(function (a, b) {
      return b.date.localeCompare(a.date);
    });

    if (filtered.length === 0) {
      grid.innerHTML = '<div class="gallery-empty">nothing here yet — stay tuned!</div>';
      return;
    }

    filtered.forEach(function (project) {
      var card = document.createElement('a');
      card.className = 'project-card';
      card.href = project.href ? project.href : 'writeups/' + project.slug + '.html';

      // Find category label
      var catLabel = '';
      GALLERY_CATEGORIES.forEach(function (c) {
        if (c.key === project.category) catLabel = c.label;
      });

      // Format date
      var dateParts = project.date.split('-');
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var dateStr = months[parseInt(dateParts[1], 10) - 1] + ' ' + dateParts[0];

      // Thumbnail
      var thumbHTML = '';
      if (project.thumb) {
        thumbHTML = '<div class="project-thumb"><img src="' + project.thumb + '" alt="' + project.title + '"></div>';
      } else {
        thumbHTML = '<div class="project-thumb"><div class="project-thumb-placeholder">✦</div></div>';
      }

      card.innerHTML =
        thumbHTML +
        '<div class="project-info">' +
          '<div class="project-meta-row">' +
            '<span class="project-date">' + dateStr + '</span>' +
            '<span class="project-category-tag">' + catLabel + '</span>' +
          '</div>' +
          '<div class="project-title">' + project.title + '</div>' +
          '<div class="project-desc">' + project.description + '</div>' +
          '<span class="project-read-more">Read more →</span>' +
        '</div>';

      grid.appendChild(card);
    });
  }

  // ── Filter pill click handler ──
  filtersNav.addEventListener('click', function (e) {
    var btn = e.target.closest('.filter-pill');
    if (!btn) return;

    // Update active state
    filtersNav.querySelectorAll('.filter-pill').forEach(function (p) {
      p.classList.remove('active');
    });
    btn.classList.add('active');

    renderProjects(btn.getAttribute('data-filter'));
  });

  // ── Initial render ──
  renderProjects('all');
})();
