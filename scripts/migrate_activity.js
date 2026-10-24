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

async function run() {
  console.log('Running migration for activity and posture tables...');
  await client.execute(`
    CREATE TABLE IF NOT EXISTS activity_sessions(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      activity_type TEXT NOT NULL,
      start_time INTEGER NOT NULL,
      end_time INTEGER NOT NULL,
      duration_sec INTEGER NOT NULL,
      distance_meters REAL NOT NULL,
      avg_speed_kmh REAL NOT NULL,
      avg_pace_min_km REAL NOT NULL,
      calories INTEGER NOT NULL,
      steps INTEGER DEFAULT 0,
      route_data TEXT,
      created INTEGER NOT NULL
    );
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_sessions(user_id, start_time);
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS posture_sessions(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      exercise TEXT NOT NULL,
      reps INTEGER NOT NULL,
      score INTEGER NOT NULL,
      feedback TEXT,
      created INTEGER NOT NULL
    );
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_posture_user ON posture_sessions(user_id, created);
  `);

  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
  console.log('Current tables in Turso DB:', tables.rows.map(r => r.name));
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
