INSERT INTO content_items (id, collection, slug, data_json, sort_order, published, created_at, updated_at)
VALUES (
  'music-luke-chiang-typhoon',
  'music',
  'luke-chiang-typhoon',
  json_object(
    'title', 'TYPHOON',
    'artist', 'Luke Chiang',
    'album', 'TYPHOON',
    'year', 2026,
    'format', 'album',
    'favorite', json('false'),
    'cover', 'https://i.scdn.co/image/ab67616d0000b27316b953cc2756638d5b6682fc',
    'link', 'https://open.spotify.com/album/53SL5EIuJdUG7EBF6u2rdv',
    'note', ''
  ),
  0,
  1,
  CAST(strftime('%s', 'now') AS INTEGER) * 1000,
  CAST(strftime('%s', 'now') AS INTEGER) * 1000
)
ON CONFLICT(collection, slug) DO UPDATE SET
  data_json = excluded.data_json,
  sort_order = excluded.sort_order,
  published = excluded.published,
  updated_at = excluded.updated_at;

INSERT INTO content_items (id, collection, slug, data_json, sort_order, published, created_at, updated_at)
VALUES (
  'music-pryvt-back-to-reality',
  'music',
  'pryvt-back-to-reality',
  json_object(
    'title', 'BACK TO REALITY',
    'artist', 'PRYVT',
    'album', 'BACK TO REALITY',
    'year', 2025,
    'format', 'album',
    'favorite', json('false'),
    'cover', 'https://i.scdn.co/image/ab67616d0000b2730cf774b4dce7036b18cab3ee',
    'link', 'https://open.spotify.com/album/61ztlk3IamUgahgX4VPisJ',
    'note', ''
  ),
  1,
  1,
  CAST(strftime('%s', 'now') AS INTEGER) * 1000,
  CAST(strftime('%s', 'now') AS INTEGER) * 1000
)
ON CONFLICT(collection, slug) DO UPDATE SET
  data_json = excluded.data_json,
  sort_order = excluded.sort_order,
  published = excluded.published,
  updated_at = excluded.updated_at;

INSERT INTO content_items (id, collection, slug, data_json, sort_order, published, created_at, updated_at)
VALUES (
  'music-pryvt-scene',
  'music',
  'pryvt-scene',
  json_object(
    'title', '&SCENE',
    'artist', 'PRYVT',
    'album', '&SCENE',
    'year', 2024,
    'format', 'album',
    'favorite', json('false'),
    'cover', 'https://i.scdn.co/image/ab67616d0000b2734240232d28b16aaaf96b41e2',
    'link', 'https://open.spotify.com/album/6kUCuqzonPC7ey2XbPonGz',
    'note', ''
  ),
  2,
  1,
  CAST(strftime('%s', 'now') AS INTEGER) * 1000,
  CAST(strftime('%s', 'now') AS INTEGER) * 1000
)
ON CONFLICT(collection, slug) DO UPDATE SET
  data_json = excluded.data_json,
  sort_order = excluded.sort_order,
  published = excluded.published,
  updated_at = excluded.updated_at;

INSERT INTO content_items (id, collection, slug, data_json, sort_order, published, created_at, updated_at)
VALUES (
  'music-hyukoh-24',
  'music',
  'hyukoh-24-how-to-find-true-love-and-happiness',
  json_object(
    'title', '24: How to find true love and happiness',
    'artist', 'HYUKOH',
    'album', '24: How to find true love and happiness',
    'year', 2018,
    'format', 'ep',
    'favorite', json('false'),
    'cover', 'https://i.scdn.co/image/ab67616d0000b273a97f3ecf6ac03bb13b218e8c',
    'link', 'https://open.spotify.com/album/5PBv1FrNgnUw7mb3k4OmMo',
    'note', ''
  ),
  3,
  1,
  CAST(strftime('%s', 'now') AS INTEGER) * 1000,
  CAST(strftime('%s', 'now') AS INTEGER) * 1000
)
ON CONFLICT(collection, slug) DO UPDATE SET
  data_json = excluded.data_json,
  sort_order = excluded.sort_order,
  published = excluded.published,
  updated_at = excluded.updated_at;

INSERT INTO content_items (id, collection, slug, data_json, sort_order, published, created_at, updated_at)
VALUES (
  'music-sik-k-lil-moshpit-k-flip',
  'music',
  'sik-k-lil-moshpit-k-flip',
  json_object(
    'title', 'K-FLIP+',
    'artist', 'Sik-K & Lil Moshpit',
    'album', 'K-FLIP+',
    'year', 2025,
    'format', 'ep',
    'favorite', json('false'),
    'cover', 'https://i.scdn.co/image/ab67616d0000b27373353f72d6760d107a955847',
    'link', 'https://open.spotify.com/album/4EPIlAjXbTNQTracKmYnI6',
    'note', ''
  ),
  4,
  1,
  CAST(strftime('%s', 'now') AS INTEGER) * 1000,
  CAST(strftime('%s', 'now') AS INTEGER) * 1000
)
ON CONFLICT(collection, slug) DO UPDATE SET
  data_json = excluded.data_json,
  sort_order = excluded.sort_order,
  published = excluded.published,
  updated_at = excluded.updated_at;

INSERT INTO content_items (id, collection, slug, data_json, sort_order, published, created_at, updated_at)
VALUES (
  'music-ado-kyougen',
  'music',
  'ado-kyougen',
  json_object(
    'title', 'Kyougen',
    'artist', 'Ado',
    'album', 'Kyougen',
    'year', 2022,
    'format', 'album',
    'favorite', json('false'),
    'cover', 'https://i.scdn.co/image/ab67616d0000b27364381fb5ba549f149ae74560',
    'link', 'https://open.spotify.com/album/4muEF5biWb506ZojGMfHb7',
    'note', ''
  ),
  5,
  1,
  CAST(strftime('%s', 'now') AS INTEGER) * 1000,
  CAST(strftime('%s', 'now') AS INTEGER) * 1000
)
ON CONFLICT(collection, slug) DO UPDATE SET
  data_json = excluded.data_json,
  sort_order = excluded.sort_order,
  published = excluded.published,
  updated_at = excluded.updated_at;
