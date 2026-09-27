(function () {
  'use strict';

  var CACHE_PREFIX = 'joho_cms_cache_v1_';

  function baseUrl() {
    return String(window.CLOUDFLARE_WORKER_URL || '').trim().replace(/\/$/, '');
  }

  function cacheKey(collection) {
    return CACHE_PREFIX + collection;
  }

  function readCache(collection) {
    try {
      var parsed = JSON.parse(window.localStorage.getItem(cacheKey(collection)) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (_e) {
      return [];
    }
  }

  function writeCache(collection, items) {
    try {
      window.localStorage.setItem(cacheKey(collection), JSON.stringify(items));
    } catch (_e) { }
  }

  async function request(path, options) {
    var root = baseUrl();
    if (!root) throw new Error('CMS API is not configured.');
    var response = await fetch(root + path, options || {});
    var payload = null;
    try {
      payload = await response.json();
    } catch (_e) { }
    if (!response.ok) {
      throw new Error(payload && payload.error ? payload.error : 'CMS request failed.');
    }
    return payload;
  }

  async function list(collection, options) {
    var settings = options || {};
    var path = '/content/' + encodeURIComponent(collection);
    var headers = {};
    if (settings.drafts) {
      path += '?drafts=1';
      headers['x-admin-token'] = settings.token || '';
    }

    try {
      var items = await request(path, { headers: headers });
      if (!settings.drafts) writeCache(collection, items);
      return Array.isArray(items) ? items : [];
    } catch (error) {
      if (!settings.drafts && settings.cache !== false) {
        var cached = readCache(collection);
        if (cached.length) return cached;
      }
      throw error;
    }
  }

  function save(collection, item, token) {
    var editing = item && item.id;
    var path = '/content/' + encodeURIComponent(collection) + (editing ? '/' + encodeURIComponent(item.id) : '');
    return request(path, {
      method: editing ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || ''
      },
      body: JSON.stringify(item || {})
    });
  }

  function remove(collection, id, token) {
    return request('/content/' + encodeURIComponent(collection) + '/' + encodeURIComponent(id), {
      method: 'DELETE',
      headers: { 'x-admin-token': token || '' }
    });
  }

  function batch(collection, items, token) {
    return request('/content/' + encodeURIComponent(collection) + '/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || ''
      },
      body: JSON.stringify({ items: items || [] })
    });
  }

  function upload(collection, file, token) {
    var formData = new FormData();
    formData.append('file', file);
    return request('/content/' + encodeURIComponent(collection) + '/upload', {
      method: 'POST',
      headers: { 'x-admin-token': token || '' },
      body: formData
    });
  }

  function lookupMusic(url, token) {
    return request('/music-lookup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || ''
      },
      body: JSON.stringify({ url: url || '' })
    });
  }

  function flatten(items) {
    return (Array.isArray(items) ? items : []).map(function (item) {
      return Object.assign({
        id: item.id,
        slug: item.slug,
        sortOrder: item.sortOrder,
        published: item.published
      }, item.data || {});
    });
  }

  window.JOHO_CMS = {
    list: list,
    save: save,
    remove: remove,
    batch: batch,
    upload: upload,
    lookupMusic: lookupMusic,
    flatten: flatten
  };
})();
