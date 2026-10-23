const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://gym-app-pantherliftz777.aws-ap-south-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTIzMTY4NzYsImlkIjoiMDFhMTRlNjgtZmYwMS03MTBlLWE0YmItOTUxYzAwNTAzNjc0Iiwia2lkIjoidldIWDFnYjZCNEtoT0l5WXpxVHQ2MDkxR18zQUhKZnNOZ3FmRTBkaUNJUSIsInJpZCI6Ijk2Mjg4OTRmLWRlMGYtNDlmZC1hYzA3LTgyZGQ2MjlmMzY4MCJ9.2GeLWOkLpH2QYFCB2gAgHk-qlpRg3MfUmuD8XH_qf-9qUEcwQpg8xbg5DzE7Gq_vwpXSbT2fN7z0BQyNDuJGAA'
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
