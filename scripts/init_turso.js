const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envLines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of envLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq > 0) {
      const k = trimmed.slice(0, eq).trim();
      const v = trimmed.slice(eq + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

const url = process.env.TURSO_DATABASE_URL || 'file:fitfuel.db';
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

const client = createClient({
  url,
  ...(authToken ? { authToken } : {})
});

const schema = `
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  contact TEXT,
  pass_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_login INTEGER,
  is_admin INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS sessions(
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS profile(
  user_id INTEGER PRIMARY KEY,
  data TEXT NOT NULL,
  updated INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS log_entries(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  meal TEXT,
  entry TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_log_user_date ON log_entries(user_id, date);
CREATE TABLE IF NOT EXISTS water(
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  ml INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(user_id, date)
);
CREATE TABLE IF NOT EXISTS custom_foods(
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  data TEXT NOT NULL,
  created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS plans(
  user_id INTEGER PRIMARY KEY,
  data TEXT NOT NULL,
  updated INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS settings(
  user_id INTEGER PRIMARY KEY,
  data TEXT NOT NULL,
  updated INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS weights(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  w_kg REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_weights_user ON weights(user_id, date);
CREATE TABLE IF NOT EXISTS workouts_done(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  name TEXT NOT NULL,
  created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_wo_user ON workouts_done(user_id, date);
CREATE TABLE IF NOT EXISTS saved_plans(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  data TEXT NOT NULL,
  created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS complaints(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  name TEXT,
  type TEXT NOT NULL,
  text TEXT NOT NULL,
  files TEXT,
  created INTEGER NOT NULL,
  seen INTEGER DEFAULT 0
);
`;

async function main() {
  console.log('Connecting to Turso...');
  await client.executeMultiple(schema);
  console.log('All tables successfully created in Turso Cloud!');
  const res = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
  console.log('Tables in Turso DB:', res.rows.map(r => r.name));
}

main().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
