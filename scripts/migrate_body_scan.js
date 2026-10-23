const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://gym-app-pantherliftz777.aws-ap-south-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTIzMTY4NzYsImlkIjoiMDFhMTRlNjgtZmYwMS03MTBlLWE0YmItOTUxYzAwNTAzNjc0Iiwia2lkIjoidldIWDFnYjZCNEtoT0l5WXpxVHQ2MDkxR18zQUhKZnNOZ3FmRTBkaUNJUSIsInJpZCI6Ijk2Mjg4OTRmLWRlMGYtNDlmZC1hYzA3LTgyZGQ2MjlmMzY4MCJ9.2GeLWOkLpH2QYFCB2gAgHk-qlpRg3MfUmuD8XH_qf-9qUEcwQpg8xbg5DzE7Gq_vwpXSbT2fN7z0BQyNDuJGAA'
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
