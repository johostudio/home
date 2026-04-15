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
