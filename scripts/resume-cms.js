(function () {
  'use strict';

  function updateYear(root) {
    var year = root.querySelector('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  function loadResume() {
    var container = document.querySelector('#resume-content .resume-container');
    if (!container || !window.JOHO_CMS) return Promise.resolve(false);

    return window.JOHO_CMS.list('resume')
      .then(function (records) {
        var page = records.find(function (record) { return record.slug === 'page'; });
        if (!page || !page.data || !page.data.html) return false;
        container.innerHTML = page.data.html;
        updateYear(container);
        document.dispatchEvent(new CustomEvent('joho:resume-loaded'));
        return true;
      })
      .catch(function () { return false; });
  }

  window.JOHO_RESUME_READY = loadResume();
})();
