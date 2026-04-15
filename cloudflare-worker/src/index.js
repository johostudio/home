function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS',
      'access-control-allow-headers': 'content-type,x-client-id'
    }
  });
}

function text(message, status = 200) {
  return new Response(message, {
    status,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS',
      'access-control-allow-headers': 'content-type,x-client-id'
    }
  });
}

function corsPreflight() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS',
      'access-control-allow-headers': 'content-type,x-client-id'
    }
  });
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
  if (!clientId || clientId !== record.client_id) {
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

function publicConfig(env) {
  return json({
    mapboxPublicToken: (env.MAPBOX_PUBLIC_TOKEN || '').trim(),
    googleBooksApiKey: (env.GOOGLE_BOOKS_API_KEY || '').trim(),
    googleBooksUserId: (env.GOOGLE_BOOKS_USER_ID || '').trim(),
    googleBooksShelfId: (env.GOOGLE_BOOKS_SHELF_ID || '').trim()
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

    return json({ error: 'not found' }, 404);
  }
};
