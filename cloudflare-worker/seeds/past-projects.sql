INSERT INTO content_items (id, collection, slug, data_json, sort_order, published, created_at, updated_at)
VALUES (
  'project-vancouver-sisu',
  'projects',
  'vancouver-sisu',
  json_object(
    'title', 'sisu',
    'category', 'production',
    'date', '2021-01',
    'thumb', '',
    'href', 'projects/project1',
    'description', 'turning dreams into waves'
  ),
  100,
  0,
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
  'project-vancouver-komorebi',
  'projects',
  'vancouver-komorebi',
  json_object(
    'title', 'komorebi',
    'category', 'misc',
    'date', '2021-01',
    'thumb', '',
    'href', 'projects/project2',
    'description', 'a japanese term for the dappled light and dancing shadows created by sunlight filtering through the leaves of trees.'
  ),
  101,
  0,
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
  'project-vancouver-film-000',
  'projects',
  'vancouver-film-000',
  json_object(
    'title', 'film[000]',
    'category', 'videography',
    'date', '2021-01',
    'thumb', '',
    'href', 'projects/project3',
    'description', 'we might grow old, but i hope we never grow apart'
  ),
  102,
  0,
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
  'project-vancouver-minifilm',
  'projects',
  'vancouver-minifilm',
  json_object(
    'title', 'minifilm',
    'category', 'videography',
    'date', '2021-01',
    'thumb', '',
    'href', 'projects/project4',
    'description', 'i like to use this camera of mine sometimes too'
  ),
  103,
  0,
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
  'project-vancouver-noel',
  'projects',
  'vancouver-noel',
  json_object(
    'title', 'noel',
    'category', 'motion-graphics',
    'date', '2021-01',
    'thumb', '',
    'href', 'projects/project5',
    'description', 'pre-comp pre-comp pre-comp....'
  ),
  104,
  0,
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
  'project-vancouver-autumn',
  'projects',
  'vancouver-autumn',
  json_object(
    'title', 'autumn',
    'category', 'photography',
    'date', '2021-01',
    'thumb', '',
    'href', 'projects/project6',
    'description', 'an occasional photo archive.'
  ),
  105,
  0,
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
  'project-vancouver-kocho',
  'projects',
  'vancouver-kocho',
  json_object(
    'title', 'kocho',
    'category', 'brand-design',
    'date', '2021-01',
    'thumb', '',
    'href', 'projects/project7',
    'description', 'an original brand by joho [tbd]'
  ),
  106,
  0,
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
  'project-vancouver-fika',
  'projects',
  'vancouver-fika',
  json_object(
    'title', 'fika',
    'category', 'diy-projects',
    'date', '2021-01',
    'thumb', '',
    'href', 'projects/project8',
    'description', 'sometimes i like to make physical projects too'
  ),
  107,
  0,
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
  'project-vancouver-kibun',
  'projects',
  'vancouver-kibun',
  json_object(
    'title', 'kibun',
    'category', 'photography',
    'date', '2021-01',
    'thumb', '',
    'href', 'projects/project9',
    'description', 'moments that make u feel something.'
  ),
  108,
  0,
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
  'project-vancouver-andy-joho',
  'projects',
  'vancouver-andy-joho',
  json_object(
    'title', 'andy+joho',
    'category', 'misc',
    'date', '2021-01',
    'thumb', '',
    'href', 'projects/project10',
    'description', 'tbd: a project by andy and johnny :>'
  ),
  109,
  0,
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
  'project-vancouver-boketto',
  'projects',
  'vancouver-boketto',
  json_object(
    'title', 'boketto',
    'category', 'engineering',
    'date', '2021-01',
    'thumb', '',
    'href', 'projects/project11',
    'description', 'i sometimes like to make websites'
  ),
  110,
  0,
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
  'project-vancouver-rkjk',
  'projects',
  'vancouver-rkjk',
  json_object(
    'title', 'rkjk',
    'category', 'illustration',
    'date', '2021-01',
    'thumb', '',
    'href', 'projects/project12',
    'description', 'digital painter, traditional sketcher [i retired in 2021 btw]'
  ),
  111,
  0,
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
  'project-hackathon-projects',
  'projects',
  'hackathon-projects',
  json_object(
    'title', 'Hackathon Projects @ UBC + SFU',
    'category', 'misc',
    'date', '2025-10',
    'thumb', '',
    'href', 'writeups/hackathon-projects.html',
    'description', 'Four hackathons within a couple months of each other - check out /archives for more.'
  ),
  112,
  0,
  CAST(strftime('%s', 'now') AS INTEGER) * 1000,
  CAST(strftime('%s', 'now') AS INTEGER) * 1000
)
ON CONFLICT(collection, slug) DO UPDATE SET
  data_json = excluded.data_json,
  sort_order = excluded.sort_order,
  published = excluded.published,
  updated_at = excluded.updated_at;
