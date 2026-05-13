;(function () {
  var grid = document.getElementById('gallery-grid');
  var filtersNav = document.getElementById('gallery-filters');
  if (!grid || !filtersNav) return;

  var categoryLabelByKey = {};
  GALLERY_CATEGORIES.forEach(function (cat) {
    categoryLabelByKey[cat.key] = cat.label;
    var btn = document.createElement('button');
    btn.className = 'filter-pill';
    btn.setAttribute('data-filter', cat.key);
    btn.textContent = cat.label;
    filtersNav.appendChild(btn);
  });

  var sortedAll = GALLERY_PROJECTS.slice().sort(function (a, b) {
    return b.date.localeCompare(a.date);
  });
  var sortedByCategory = {};

  function getFiltered(filter) {
    if (filter === 'all') return sortedAll;
    if (sortedByCategory[filter]) return sortedByCategory[filter];
    sortedByCategory[filter] = sortedAll.filter(function (p) {
      return p.category === filter;
    });
    return sortedByCategory[filter];
  }

  function renderProjects(filter) {
    grid.textContent = '';
    var filtered = getFiltered(filter);

    if (filtered.length === 0) {
      grid.innerHTML = '<div class="gallery-empty">nothing here yet - stay tuned!</div>';
      return;
    }

    var frag = document.createDocumentFragment();
    filtered.forEach(function (project) {
      var card = document.createElement('a');
      card.className = 'project-card';
      card.href = project.href ? project.href : 'writeups/' + project.slug + '.html';
      card.setAttribute('aria-label', project.title);

      var catLabel = categoryLabelByKey[project.category] || project.category;
      var dateParts = project.date.split('-');
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      var dateStr = months[parseInt(dateParts[1], 10) - 1] + ' ' + dateParts[0];

      var thumbHTML = '';
      if (project.thumb) {
        thumbHTML = '<div class="project-thumb"><img src="' + project.thumb + '" alt="' + project.title + '" loading="lazy" decoding="async" fetchpriority="low" width="112" height="112"></div>';
      } else {
        thumbHTML = '<div class="project-thumb"><div class="project-thumb-placeholder">&starf;</div></div>';
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
        '<span class="project-read-more">Read more &rarr;</span>' +
        '</div>';

      frag.appendChild(card);
    });

    grid.appendChild(frag);
  }

  filtersNav.addEventListener('click', function (e) {
    var btn = e.target.closest('.filter-pill');
    if (!btn) return;

    filtersNav.querySelectorAll('.filter-pill').forEach(function (p) {
      p.classList.remove('active');
    });
    btn.classList.add('active');
    renderProjects(btn.getAttribute('data-filter'));
  });

  renderProjects('all');
})();
