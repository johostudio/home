(function () {
  'use strict';

  function numberOr(value, fallback) {
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function renderIcon(layer, item, options) {
    var button = document.createElement('button');
    var x = numberOr(item.x, 0);
    var y = numberOr(item.y, 0);
    var size = numberOr(item.size, options.defaultSize || 120);
    var rotation = numberOr(item.rotation, 0);
    var label = String(item.alt || item.title || 'floating icon').trim();

    button.className = 'sticker';
    button.type = 'button';
    button.setAttribute('data-sticker', '');
    button.setAttribute('data-size', size);
    button.setAttribute('data-x', x);
    button.setAttribute('data-y', y);
    button.setAttribute('data-rotation', rotation);
    button.setAttribute('data-cms-slug', item.slug || '');
    button.setAttribute('aria-label', label);
    if (item.spawnBias) button.setAttribute('data-spawn-bias', item.spawnBias);

    var image = document.createElement('img');
    image.src = item.image;
    image.alt = label;
    image.loading = 'lazy';
    button.appendChild(image);

    if (item.caption) {
      var caption = document.createElement('span');
      caption.className = options.captionClass || 'sticker-desc-label';
      caption.textContent = item.caption;
      button.appendChild(caption);
    }

    layer.appendChild(button);
  }

  function load(options) {
    var settings = options || {};
    var layer = document.querySelector(settings.layer || '[data-sticker-layer]');
    if (!layer || !window.JOHO_CMS) return Promise.resolve(false);

    return window.JOHO_CMS.list('floating-icons')
      .then(function (records) {
        var items = window.JOHO_CMS.flatten(records).filter(function (item) {
          return item.page === settings.page && item.image;
        });
        if (!items.length) return false;
        layer.textContent = '';
        items.forEach(function (item) { renderIcon(layer, item, settings); });
        return true;
      })
      .catch(function () { return false; });
  }

  function loadStickerEngine(ready, path) {
    return Promise.resolve(ready).catch(function () { return false; }).then(function () {
      if (window.JOHO_STICKERS_LOADED) return true;
      return new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = path || 'scripts/stickers.js';
        script.onload = function () {
          window.JOHO_STICKERS_LOADED = true;
          resolve(true);
        };
        script.onerror = reject;
        document.body.appendChild(script);
      });
    });
  }

  window.JOHO_FLOATING_ICONS = {
    load: load,
    loadStickerEngine: loadStickerEngine
  };
})();
