function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'access-control-allow-headers': 'content-type,x-client-id,x-admin-token'
    }
  });
}

function text(message, status = 200) {
  return new Response(message, {
    status,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'access-control-allow-headers': 'content-type,x-client-id,x-admin-token'
    }
  });
}

function corsPreflight() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'access-control-allow-headers': 'content-type,x-client-id,x-admin-token'
    }
  });
}

function hasAtlasAdminAccess(request, env) {
  var configuredToken = safeText(env.ATLAS_ADMIN_TOKEN || '', 256);
  if (!configuredToken && env.ATLAS_ADMIN_PASSWORD) {
    configuredToken = safeText(env.ATLAS_ADMIN_PASSWORD || '', 256);
  }
  if (!configuredToken) return false;
  var providedToken = safeText(request.headers.get('x-admin-token') || '', 256);
  if (!providedToken && request.headers.get('x-admin-password')) {
    providedToken = safeText(request.headers.get('x-admin-password') || '', 256);
  }
  return !!providedToken && providedToken === configuredToken;
}

function hasPhotoAdminAccess(request, env) {
  var configuredToken = safeText(env.PHOTOGRAPHY_ADMIN_TOKEN || '', 256);
  if (!configuredToken) {
    configuredToken = safeText(env.ATLAS_ADMIN_TOKEN || '', 256);
  }
  if (!configuredToken && env.ATLAS_ADMIN_PASSWORD) {
    configuredToken = safeText(env.ATLAS_ADMIN_PASSWORD || '', 256);
  }
  if (!configuredToken) return false;
  var providedToken = safeText(request.headers.get('x-admin-token') || '', 256);
  return !!providedToken && providedToken === configuredToken;
}

function hasScrambledAdminAccess(request, env) {
  var configuredToken = safeText(env.PHOTOGRAPHY_ADMIN_TOKEN || '', 256);
  if (!configuredToken) {
    configuredToken = safeText(env.SCRAMBLED_ADMIN_TOKEN || '', 256);
  }
  if (!configuredToken) {
    configuredToken = safeText(env.ATLAS_ADMIN_TOKEN || '', 256);
  }
  if (!configuredToken && env.ATLAS_ADMIN_PASSWORD) {
    configuredToken = safeText(env.ATLAS_ADMIN_PASSWORD || '', 256);
  }
  if (!configuredToken) return false;
  var providedToken = safeText(request.headers.get('x-admin-token') || '', 256);
  return !!providedToken && providedToken === configuredToken;
}

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function safeSong(input) {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, 120);
}

function safeAuthor(input) {
  if (typeof input !== 'string') return 'anonymous';
  var value = input.trim().slice(0, 30);
  return value || 'anonymous';
}

function safeText(input, maxLen) {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLen || 400);
}

function safePhotos(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => safeText(entry, 800))
    .filter(Boolean)
    .slice(0, 10);
}

function safeDate(value) {
  if (typeof value !== 'string') return '';
  var date = value.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return '';
  return date;
}

function safeLocation(value) {
  return safeText(value, 120);
}

function safeImageUrl(value) {
  var url = safeText(value, 1200);
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) return '';
  return url;
}

function safeNodeGroup(value) {
  var n = Number(value);
  if (!Number.isFinite(n)) return 2;
  n = Math.round(n);
  if (n < 1) n = 1;
  if (n > 5) n = 5;
  return n;
}

function safeNodeVal(value) {
  var n = Number(value);
  if (!Number.isFinite(n)) return 8;
  if (n < 1) n = 1;
  if (n > 60) n = 60;
  return n;
}

async function listSongRecommendations(env) {
  var result = await env.DB.prepare(
    'SELECT id, song, client_id, created_at FROM song_recommendations ORDER BY created_at DESC LIMIT 500'
  ).all();
  return result.results || [];
}

async function createSongRecommendation(request, env) {
  var body;
  try {
    body = await request.json();
  } catch (_e) {
    return json({ error: 'invalid json body' }, 400);
  }

  var song = safeSong(body && body.song);
  if (!song) {
    return json({ error: 'song is required' }, 400);
  }

  var clientId = request.headers.get('x-client-id');
  if (!clientId) {
    clientId = makeId();
  }

  var id = makeId();
  var createdAt = Date.now();

  await env.DB.prepare(
    'INSERT INTO song_recommendations (id, song, client_id, created_at) VALUES (?1, ?2, ?3, ?4)'
  )
    .bind(id, song, clientId, createdAt)
    .run();

  return json({ id: id, song: song, client_id: clientId, created_at: createdAt }, 201);
}

async function deleteSongRecommendation(id, request, env) {
  if (!id) {
    return json({ error: 'song id is required' }, 400);
  }

  var record = await env.DB.prepare(
    'SELECT id, client_id FROM song_recommendations WHERE id = ?1'
  )
    .bind(id)
    .first();

  if (!record) {
    return json({ error: 'recommendation not found' }, 404);
  }

  var clientId = request.headers.get('x-client-id');
  var hasOwnerAccess = !!clientId && clientId === record.client_id;
  if (!hasOwnerAccess && !hasAtlasAdminAccess(request, env)) {
    return json({ error: 'not allowed to remove this recommendation' }, 403);
  }

  await env.DB.prepare('DELETE FROM song_recommendations WHERE id = ?1').bind(id).run();
  return json({ ok: true });
}

async function uploadStrip(request, env) {
  var formData;
  try {
    formData = await request.formData();
  } catch (_e) {
    return json({ error: 'invalid form data' }, 400);
  }

  var file = formData.get('file');
  if (!(file instanceof File)) {
    return json({ error: 'file is required' }, 400);
  }

  var author = safeAuthor(formData.get('author'));
  var id = makeId();
  var ext = (file.name && file.name.includes('.')) ? file.name.split('.').pop().toLowerCase() : 'png';
  var key = 'darkroom/' + id + '.' + ext;
  var createdAt = Date.now();
  var publicBaseUrl = (env.R2_PUBLIC_BASE_URL || '').replace(/\/$/, '');

  if (!publicBaseUrl) {
    return json({ error: 'R2_PUBLIC_BASE_URL is not configured' }, 500);
  }

  await env.STRIPS_BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: file.type || 'image/png'
    }
  });

  var imageUrl = publicBaseUrl + '/' + key;

  await env.DB.prepare(
    'INSERT INTO strips (id, image_url, author, created_at) VALUES (?1, ?2, ?3, ?4)'
  )
    .bind(id, imageUrl, author, createdAt)
    .run();

  return json({ id: id, image_url: imageUrl, author: author, created_at: createdAt }, 201);
}

async function listStrips(env) {
  var result = await env.DB.prepare(
    'SELECT id, image_url, author, created_at FROM strips ORDER BY created_at DESC LIMIT 60'
  ).all();
  return json(result.results || []);
}

async function readVisitorCount(env) {
  var now = Date.now();

  await env.DB.prepare(
    'INSERT OR IGNORE INTO visitor_counter (id, count, updated_at) VALUES (1, 0, ?1)'
  )
    .bind(now)
    .run();

  var row = await env.DB.prepare('SELECT count, updated_at FROM visitor_counter WHERE id = 1').first();
  var count = Number(row && row.count);
  var updatedAt = Number(row && row.updated_at);

  return {
    count: Number.isFinite(count) ? count : 0,
    updated_at: Number.isFinite(updatedAt) ? updatedAt : now
  };
}

async function incrementVisitorCount(env) {
  var now = Date.now();

  await env.DB.prepare(
    'INSERT OR IGNORE INTO visitor_counter (id, count, updated_at) VALUES (1, 0, ?1)'
  )
    .bind(now)
    .run();

  await env.DB.prepare(
    'UPDATE visitor_counter SET count = count + 1, updated_at = ?1 WHERE id = 1'
  )
    .bind(now)
    .run();

  return readVisitorCount(env);
}

async function listAtlasPoints(env) {
  var result = await env.DB.prepare(
    'SELECT id, point_type, city, lat, lng, note, stamp, photos_json, created_at FROM atlas_points ORDER BY created_at DESC LIMIT 1000'
  ).all();

  var rows = result.results || [];
  return rows.map(function (row) {
    var photos = [];
    try {
      var parsed = JSON.parse(row.photos_json || '[]');
      if (Array.isArray(parsed)) photos = parsed;
    } catch (_e) {}

    return {
      id: row.id,
      type: row.point_type,
      city: row.city,
      lat: row.lat,
      lng: row.lng,
      note: row.note,
      stamp: row.stamp || '',
      photos: photos,
      created_at: row.created_at
    };
  });
}

async function createAtlasPoint(request, env) {
  var body;
  try {
    body = await request.json();
  } catch (_e) {
    return json({ error: 'invalid json body' }, 400);
  }

  var pointType = safeText(body && body.type, 20) || 'user';
  var city = safeText(body && body.city, 160);
  var note = safeText(body && body.note, 420);
  var stamp = safeText(body && body.stamp, 12);
  var lat = Number(body && body.lat);
  var lng = Number(body && body.lng);
  var photos = safePhotos(body && body.photos);

  if (!city || !note || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return json({ error: 'city, note, lat, lng are required' }, 400);
  }

  var id = makeId();
  var createdAt = Date.now();

  await env.DB.prepare(
    'INSERT INTO atlas_points (id, point_type, city, lat, lng, note, stamp, photos_json, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)'
  )
    .bind(id, pointType, city, lat, lng, note, stamp, JSON.stringify(photos), createdAt)
    .run();

  return json({
    id: id,
    type: pointType,
    city: city,
    lat: lat,
    lng: lng,
    note: note,
    stamp: stamp,
    photos: photos,
    created_at: createdAt
  }, 201);
}

async function deleteAtlasPoint(id, request, env) {
  if (!id) {
    return json({ error: 'atlas point id is required' }, 400);
  }

  if (!hasAtlasAdminAccess(request, env)) {
    return json({ error: 'admin token required' }, 403);
  }

  var record = await env.DB.prepare(
    'SELECT id FROM atlas_points WHERE id = ?1'
  )
    .bind(id)
    .first();

  if (!record) {
    return json({ error: 'atlas point not found' }, 404);
  }

  await env.DB.prepare('DELETE FROM atlas_points WHERE id = ?1').bind(id).run();
  return json({ ok: true, id: id });
}

async function uploadAtlasStamp(request, env) {
  var formData;
  try {
    formData = await request.formData();
  } catch (_e) {
    return json({ error: 'invalid form data' }, 400);
  }

  var file = formData.get('file');
  if (!(file instanceof File)) {
    return json({ error: 'file is required' }, 400);
  }

  var ext = (file.name && file.name.includes('.')) ? file.name.split('.').pop().toLowerCase() : 'png';
  var id = makeId();
  var key = 'atlas-stamps/' + id + '.' + ext;
  var publicBaseUrl = (env.R2_PUBLIC_BASE_URL || '').replace(/\/$/, '');
  if (!publicBaseUrl) {
    return json({ error: 'R2_PUBLIC_BASE_URL is not configured' }, 500);
  }

  await env.STRIPS_BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: file.type || 'image/png'
    }
  });

  return json({
    id: id,
    url: publicBaseUrl + '/' + key,
    key: key
  }, 201);
}

async function listClientPhotos(env) {
  var result = await env.DB.prepare(
    'SELECT id, image_url, shoot_date, location, created_at FROM client_photos ORDER BY shoot_date DESC, created_at DESC LIMIT 2000'
  ).all();

  return json(result.results || []);
}

async function insertClientPhoto(env, payload) {
  var id = makeId();
  var createdAt = Date.now();
  var imageUrl = safeImageUrl(payload.image_url);
  var shootDate = safeDate(payload.date || payload.shoot_date);
  var location = safeLocation(payload.location);
  var r2Key = safeText(payload.r2_key || '', 400);

  if (!imageUrl || !shootDate || !location) {
    return null;
  }

  await env.DB.prepare(
    'INSERT INTO client_photos (id, image_url, r2_key, shoot_date, location, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)'
  )
    .bind(id, imageUrl, r2Key, shootDate, location, createdAt)
    .run();

  return {
    id: id,
    image_url: imageUrl,
    date: shootDate,
    location: location,
    created_at: createdAt
  };
}

async function uploadClientPhoto(request, env) {
  if (!hasPhotoAdminAccess(request, env)) {
    return json({ error: 'admin token required' }, 403);
  }

  var formData;
  try {
    formData = await request.formData();
  } catch (_e) {
    return json({ error: 'invalid form data' }, 400);
  }

  var file = formData.get('file');
  if (!(file instanceof File)) {
    return json({ error: 'file is required' }, 400);
  }

  var shootDate = safeDate(formData.get('date'));
  var location = safeLocation(formData.get('location'));
  if (!shootDate || !location) {
    return json({ error: 'date (YYYY-MM-DD) and location are required' }, 400);
  }

  var id = makeId();
  var ext = (file.name && file.name.includes('.')) ? file.name.split('.').pop().toLowerCase() : 'jpg';
  var key = 'client-photos/' + id + '.' + ext;
  var publicBaseUrl = (env.R2_PUBLIC_BASE_URL || '').replace(/\/$/, '');

  if (!publicBaseUrl) {
    return json({ error: 'R2_PUBLIC_BASE_URL is not configured' }, 500);
  }

  await env.STRIPS_BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: file.type || 'image/jpeg'
    }
  });

  var record = await insertClientPhoto(env, {
    image_url: publicBaseUrl + '/' + key,
    r2_key: key,
    date: shootDate,
    location: location
  });

  if (!record) {
    return json({ error: 'failed to create photo record' }, 500);
  }

  return json(record, 201);
}

async function batchImportClientPhotos(request, env) {
  if (!hasPhotoAdminAccess(request, env)) {
    return json({ error: 'admin token required' }, 403);
  }

  var body;
  try {
    body = await request.json();
  } catch (_e) {
    return json({ error: 'invalid json body' }, 400);
  }

  var photos = body && Array.isArray(body.photos) ? body.photos : [];
  if (!photos.length) {
    return json({ error: 'photos array is required' }, 400);
  }

  var maxCount = 300;
  if (photos.length > maxCount) {
    return json({ error: 'photos array exceeds limit of ' + maxCount }, 400);
  }

  var inserted = [];
  var skipped = [];

  for (var i = 0; i < photos.length; i++) {
    var item = photos[i] || {};
    var imageUrl = safeImageUrl(item.image_url || item.image || '');
    var shootDate = safeDate(item.date || item.shoot_date || '');
    var location = safeLocation(item.location || '');
    if (!imageUrl || !shootDate || !location) {
      skipped.push({ index: i, reason: 'invalid image_url/date/location' });
      continue;
    }

    var existing = await env.DB.prepare(
      'SELECT id FROM client_photos WHERE image_url = ?1 LIMIT 1'
    )
      .bind(imageUrl)
      .first();

    if (existing) {
      skipped.push({ index: i, reason: 'duplicate image_url' });
      continue;
    }

    var created = await insertClientPhoto(env, {
      image_url: imageUrl,
      r2_key: '',
      date: shootDate,
      location: location
    });

    if (created) {
      inserted.push(created);
    } else {
      skipped.push({ index: i, reason: 'failed to insert record' });
    }
  }

  return json({
    ok: true,
    inserted_count: inserted.length,
    skipped_count: skipped.length,
    inserted: inserted,
    skipped: skipped
  }, 201);
}

async function updateClientPhoto(id, request, env) {
  if (!id) {
    return json({ error: 'photo id is required' }, 400);
  }

  if (!hasPhotoAdminAccess(request, env)) {
    return json({ error: 'admin token required' }, 403);
  }

  var record = await env.DB.prepare(
    'SELECT id, image_url, shoot_date, location FROM client_photos WHERE id = ?1'
  )
    .bind(id)
    .first();

  if (!record) {
    return json({ error: 'photo not found' }, 404);
  }

  var body;
  try {
    body = await request.json();
  } catch (_e) {
    return json({ error: 'invalid json body' }, 400);
  }

  var nextDate = safeDate(body && body.date ? body.date : record.shoot_date);
  var nextLocation = safeLocation(body && body.location ? body.location : record.location);
  var nextImageUrl = safeImageUrl(body && body.image_url ? body.image_url : record.image_url);

  if (!nextDate || !nextLocation || !nextImageUrl) {
    return json({ error: 'valid date/location/image_url are required' }, 400);
  }

  await env.DB.prepare(
    'UPDATE client_photos SET image_url = ?1, shoot_date = ?2, location = ?3 WHERE id = ?4'
  )
    .bind(nextImageUrl, nextDate, nextLocation, id)
    .run();

  return json({
    ok: true,
    id: id,
    image_url: nextImageUrl,
    date: nextDate,
    location: nextLocation
  });
}

async function deleteClientPhoto(id, request, env) {
  if (!id) {
    return json({ error: 'photo id is required' }, 400);
  }

  if (!hasPhotoAdminAccess(request, env)) {
    return json({ error: 'admin token required' }, 403);
  }

  var record = await env.DB.prepare(
    'SELECT id, r2_key FROM client_photos WHERE id = ?1'
  )
    .bind(id)
    .first();

  if (!record) {
    return json({ error: 'photo not found' }, 404);
  }

  if (record.r2_key) {
    await env.STRIPS_BUCKET.delete(record.r2_key);
  }

  await env.DB.prepare('DELETE FROM client_photos WHERE id = ?1').bind(id).run();
  return json({ ok: true, id: id });
}

async function listScrambledGraph(env) {
  var nodesResult = await env.DB.prepare(
    'SELECT id, name, node_group, node_val, content, date_text, now_playing, now_playing_url, image_url FROM scrambled_nodes ORDER BY updated_at DESC LIMIT 3000'
  ).all();
  var linksResult = await env.DB.prepare(
    'SELECT id, source_id, target_id FROM scrambled_links ORDER BY created_at DESC LIMIT 6000'
  ).all();

  var nodes = (nodesResult.results || []).map(function (row) {
    return {
      id: row.id,
      name: row.name,
      group: row.node_group,
      val: row.node_val,
      content: row.content,
      date: row.date_text,
      nowPlaying: row.now_playing,
      nowPlayingUrl: row.now_playing_url,
      img: row.image_url || ''
    };
  });

  var links = (linksResult.results || []).map(function (row) {
    return {
      id: row.id,
      source: row.source_id,
      target: row.target_id
    };
  });

  return json({ nodes: nodes, links: links });
}

async function createOrUpdateScrambledNode(request, env, idOverride) {
  if (!hasScrambledAdminAccess(request, env)) {
    return json({ error: 'admin token required' }, 403);
  }

  var body;
  try {
    body = await request.json();
  } catch (_e) {
    return json({ error: 'invalid json body' }, 400);
  }

  var id = safeText(idOverride || (body && body.id) || '', 120);
  var name = safeText(body && body.name, 180);
  var group = safeNodeGroup(body && body.group);
  var val = safeNodeVal(body && body.val);
  var content = safeText(body && body.content, 5000);
  var dateText = safeText(body && body.date, 80);
  var nowPlaying = safeText(body && body.nowPlaying, 280);
  var nowPlayingUrl = safeText(body && body.nowPlayingUrl, 1200);
  var imageUrl = safeText(body && body.img, 1200);
  var now = Date.now();

  if (!id || !name || !content) {
    return json({ error: 'id, name, and content are required' }, 400);
  }

  var existing = await env.DB.prepare(
    'SELECT id FROM scrambled_nodes WHERE id = ?1'
  )
    .bind(id)
    .first();

  if (existing) {
    await env.DB.prepare(
      'UPDATE scrambled_nodes SET name = ?1, node_group = ?2, node_val = ?3, content = ?4, date_text = ?5, now_playing = ?6, now_playing_url = ?7, image_url = ?8, updated_at = ?9 WHERE id = ?10'
    )
      .bind(name, group, val, content, dateText, nowPlaying, nowPlayingUrl, imageUrl, now, id)
      .run();
  } else {
    await env.DB.prepare(
      'INSERT INTO scrambled_nodes (id, name, node_group, node_val, content, date_text, now_playing, now_playing_url, image_url, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)'
    )
      .bind(id, name, group, val, content, dateText, nowPlaying, nowPlayingUrl, imageUrl, now, now)
      .run();
  }

  return json({
    ok: true,
    node: {
      id: id,
      name: name,
      group: group,
      val: val,
      content: content,
      date: dateText,
      nowPlaying: nowPlaying,
      nowPlayingUrl: nowPlayingUrl,
      img: imageUrl
    }
  });
}

async function deleteScrambledNode(id, request, env) {
  if (!id) return json({ error: 'node id is required' }, 400);
  if (!hasScrambledAdminAccess(request, env)) {
    return json({ error: 'admin token required' }, 403);
  }

  await env.DB.prepare('DELETE FROM scrambled_nodes WHERE id = ?1').bind(id).run();
  await env.DB.prepare('DELETE FROM scrambled_links WHERE source_id = ?1 OR target_id = ?1').bind(id).run();
  return json({ ok: true, id: id });
}

async function createScrambledLink(request, env) {
  if (!hasScrambledAdminAccess(request, env)) {
    return json({ error: 'admin token required' }, 403);
  }

  var body;
  try {
    body = await request.json();
  } catch (_e) {
    return json({ error: 'invalid json body' }, 400);
  }

  var source = safeText(body && body.source, 120);
  var target = safeText(body && body.target, 120);
  if (!source || !target) {
    return json({ error: 'source and target are required' }, 400);
  }

  var sourceNode = await env.DB.prepare('SELECT id FROM scrambled_nodes WHERE id = ?1').bind(source).first();
  var targetNode = await env.DB.prepare('SELECT id FROM scrambled_nodes WHERE id = ?1').bind(target).first();
  if (!sourceNode || !targetNode) {
    return json({ error: 'source and target must both exist as nodes' }, 400);
  }

  var existing = await env.DB.prepare(
    'SELECT id FROM scrambled_links WHERE source_id = ?1 AND target_id = ?2'
  )
    .bind(source, target)
    .first();

  if (existing) {
    return json({ ok: true, id: existing.id, source: source, target: target });
  }

  var id = makeId();
  var now = Date.now();
  await env.DB.prepare(
    'INSERT INTO scrambled_links (id, source_id, target_id, created_at) VALUES (?1, ?2, ?3, ?4)'
  )
    .bind(id, source, target, now)
    .run();

  return json({ ok: true, id: id, source: source, target: target }, 201);
}

async function deleteScrambledLink(id, request, env) {
  if (!id) return json({ error: 'link id is required' }, 400);
  if (!hasScrambledAdminAccess(request, env)) {
    return json({ error: 'admin token required' }, 403);
  }
  await env.DB.prepare('DELETE FROM scrambled_links WHERE id = ?1').bind(id).run();
  return json({ ok: true, id: id });
}

function publicConfig(env) {
  return json({
    mapboxPublicToken: (env.MAPBOX_PUBLIC_TOKEN || '').trim(),
    openLibraryEnabled: true,
    openLibraryQuery: (env.OPEN_LIBRARY_QUERY || '').trim()
  });
}

export default {
  async fetch(request, env) {
    var url = new URL(request.url);
    var path = url.pathname;

    if (request.method === 'OPTIONS') {
      return corsPreflight();
    }

    if (request.method === 'GET' && path === '/health') {
      return text('ok');
    }

    if (request.method === 'GET' && path === '/public-config') {
      return publicConfig(env);
    }

    if (request.method === 'GET' && path === '/song-recs') {
      var songs = await listSongRecommendations(env);
      return json(songs);
    }

    if (request.method === 'POST' && path === '/song-recs') {
      return createSongRecommendation(request, env);
    }

    if (request.method === 'DELETE' && path.startsWith('/song-recs/')) {
      var songId = path.split('/').pop();
      return deleteSongRecommendation(songId, request, env);
    }

    if (request.method === 'POST' && path === '/upload') {
      return uploadStrip(request, env);
    }

    if (request.method === 'GET' && path === '/strips') {
      return listStrips(env);
    }

    if (request.method === 'GET' && path === '/visitor-count') {
      var visitorCount = await readVisitorCount(env);
      return json(visitorCount);
    }

    if (request.method === 'POST' && path === '/visitor-count/increment') {
      var updatedVisitorCount = await incrementVisitorCount(env);
      return json(updatedVisitorCount);
    }

    if (request.method === 'GET' && path === '/atlas-points') {
      var points = await listAtlasPoints(env);
      return json(points);
    }

    if (request.method === 'POST' && path === '/atlas-points') {
      return createAtlasPoint(request, env);
    }

    if (request.method === 'DELETE' && path.startsWith('/atlas-points/')) {
      var atlasPointId = path.slice('/atlas-points/'.length);
      return deleteAtlasPoint(atlasPointId, request, env);
    }

    if (request.method === 'POST' && path === '/atlas-stamp-upload') {
      return uploadAtlasStamp(request, env);
    }

    if (request.method === 'GET' && path === '/client-photos') {
      return listClientPhotos(env);
    }

    if (request.method === 'POST' && path === '/client-photos') {
      return uploadClientPhoto(request, env);
    }

    if (request.method === 'POST' && path === '/client-photos/batch') {
      return batchImportClientPhotos(request, env);
    }

    if (request.method === 'PUT' && path.startsWith('/client-photos/')) {
      var clientPhotoEditId = path.slice('/client-photos/'.length);
      return updateClientPhoto(clientPhotoEditId, request, env);
    }

    if (request.method === 'DELETE' && path.startsWith('/client-photos/')) {
      var clientPhotoId = path.slice('/client-photos/'.length);
      return deleteClientPhoto(clientPhotoId, request, env);
    }

    if (request.method === 'GET' && path === '/scrambled-graph') {
      return listScrambledGraph(env);
    }

    if (request.method === 'POST' && path === '/scrambled-nodes') {
      return createOrUpdateScrambledNode(request, env, '');
    }

    if (request.method === 'PUT' && path.startsWith('/scrambled-nodes/')) {
      var editNodeId = path.slice('/scrambled-nodes/'.length);
      return createOrUpdateScrambledNode(request, env, editNodeId);
    }

    if (request.method === 'DELETE' && path.startsWith('/scrambled-nodes/')) {
      var deleteNodeId = path.slice('/scrambled-nodes/'.length);
      return deleteScrambledNode(deleteNodeId, request, env);
    }

    if (request.method === 'POST' && path === '/scrambled-links') {
      return createScrambledLink(request, env);
    }

    if (request.method === 'DELETE' && path.startsWith('/scrambled-links/')) {
      var deleteLinkId = path.slice('/scrambled-links/'.length);
      return deleteScrambledLink(deleteLinkId, request, env);
    }

    return json({ error: 'not found' }, 404);
  }
};
