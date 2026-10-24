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
  console.log('Running migration for body_assessments table...');
  await client.execute(`
    CREATE TABLE IF NOT EXISTS body_assessments(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      goal TEXT NOT NULL,
      preferences TEXT,
      photos_meta TEXT,
      analysis_json TEXT NOT NULL,
      created INTEGER NOT NULL
    );
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_body_assessments_user ON body_assessments(user_id, created);
  `);

  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
  console.log('Current tables in Turso DB:', tables.rows.map(r => r.name));
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
