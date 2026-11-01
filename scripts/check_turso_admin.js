const path = require('path');
const fs = require('fs');
const { createClient } = require('@libsql/client');

const ROOT = path.join(__dirname, '..');
if (fs.existsSync(path.join(ROOT, '.env'))) {
  const envLines = fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/);
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

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:fitfuel.db',
  ...(process.env.TURSO_AUTH_TOKEN ? { authToken: process.env.TURSO_AUTH_TOKEN } : {})
});

async function run() {
  const res = await client.execute("SELECT id, name, email, is_admin, pass_hash, salt FROM users WHERE email LIKE '%admin%'");
  console.log('Admin users in Turso:', res.rows);
}

run();
