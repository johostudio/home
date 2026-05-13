CREATE TABLE IF NOT EXISTS strips (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS song_recommendations (
  id TEXT PRIMARY KEY,
  song TEXT NOT NULL,
  client_id TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_song_recommendations_created_at
ON song_recommendations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_strips_created_at
ON strips(created_at DESC);

CREATE TABLE IF NOT EXISTS atlas_points (
  id TEXT PRIMARY KEY,
  point_type TEXT NOT NULL,
  city TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  note TEXT NOT NULL,
  stamp TEXT NOT NULL,
  photos_json TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_atlas_points_created_at
ON atlas_points(created_at DESC);

CREATE TABLE IF NOT EXISTS visitor_counter (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  count INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS client_photos (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  shoot_date TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_client_photos_created_at
ON client_photos(created_at DESC);
