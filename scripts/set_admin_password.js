const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
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

const salt = crypto.randomBytes(16).toString('hex');
const pass = 'FitFuel@Admin2026!';
const passHash = crypto.scryptSync(pass, salt, 64).toString('hex');

async function run() {
  await client.execute({
    sql: 'UPDATE users SET pass_hash = ?, salt = ?, is_admin = 1, is_beta_tester = 1 WHERE email = ?',
    args: [passHash, salt, 'admin@fitfuel.app']
  });
  console.log('Successfully set admin@fitfuel.app password to FitFuel@Admin2026!');
}

run();
