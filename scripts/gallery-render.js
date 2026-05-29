;(function () {
  var grid = document.getElementById('gallery-grid');
  var filtersNav = document.getElementById('gallery-filters');
  if (!grid || !filtersNav) return;
  var FILTER_STORAGE_KEY = 'jh_gallery_filter';

  var categoryLabelByKey = {};
  var validFilters = { all: true };
  GALLERY_CATEGORIES.forEach(function (cat) {
    categoryLabelByKey[cat.key] = cat.label;
    validFilters[cat.key] = true;
    var btn = document.createElement('button');
    btn.className = 'filter-pill';
    btn.setAttribute('data-filter', cat.key);
    btn.textContent = cat.label;
    filtersNav.appendChild(btn);
  });

  var sortedAll = GALLERY_PROJECTS.slice().sort(function (a, b) {
    return b.date.localeCompare(a.date);
  });
  var sortedAllVisible = sortedAll.filter(function (p) {
    return p.category !== 'misc';
  });
  var sortedByCategory = {};
  var currentFilter = 'all';

  function normalizeFilter(raw) {
    var value = String(raw || '').trim().toLowerCase();
    if (!value) return 'all';
    return validFilters[value] ? value : 'all';
  }

  function readFilterFromUrl() {
    var params = new URLSearchParams(window.location.search || '');
    return normalizeFilter(params.get('category') || params.get('galleryCategory'));
  }

  function persistFilter(filter) {
    try {
      window.sessionStorage.setItem(FILTER_STORAGE_KEY, filter);
    } catch (err) {
    }
  }

  function readStoredFilter() {
    try {
      return normalizeFilter(window.sessionStorage.getItem(FILTER_STORAGE_KEY));
    } catch (err) {
      return 'all';
    }
  }

  function updateGalleryUrl(filter) {
    if (!window.history || !window.history.replaceState) return;
    var url = new URL(window.location.href);
    url.searchParams.delete('galleryCategory');
    if (filter === 'all') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', filter);
    }
    window.history.replaceState(window.history.state, '', url.toString());
  }

  function toProjectHref(project, filter) {
    var baseHref = project.href ? project.href : 'writeups/' + project.slug + '.html';
    if (!filter || filter === 'all') return baseHref;
    var url = new URL(baseHref, window.location.href);
    if (url.origin !== window.location.origin) return url.toString();
    url.searchParams.set('galleryCategory', filter);
    return url.pathname + url.search + url.hash;
  }

  function getFiltered(filter) {
    if (filter === 'all') return sortedAllVisible;
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
      card.href = toProjectHref(project, filter);
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

  function setActiveFilter(filter) {
    currentFilter = normalizeFilter(filter);
    filtersNav.querySelectorAll('.filter-pill').forEach(function (p) {
      p.classList.toggle('active', p.getAttribute('data-filter') === currentFilter);
    });
    updateGalleryUrl(currentFilter);
    persistFilter(currentFilter);
    renderProjects(currentFilter);
  }

  filtersNav.addEventListener('click', function (e) {
    var btn = e.target.closest('.filter-pill');
    if (!btn) return;
    setActiveFilter(btn.getAttribute('data-filter'));
  });

  window.addEventListener('popstate', function () {
    setActiveFilter(readFilterFromUrl());
  });

  var initial = readFilterFromUrl();
  if (initial === 'all') {
    try {
      if (document.referrer) {
        var refUrl = new URL(document.referrer, window.location.href);
        var fromDetail = refUrl.origin === window.location.origin &&
          (/\/writeups\//.test(refUrl.pathname) || /\/projects\//.test(refUrl.pathname));
        if (fromDetail) {
          initial = readStoredFilter();
        }
      }
    } catch (err) {
    }
  }
  setActiveFilter(initial);
})();
