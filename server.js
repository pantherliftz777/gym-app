/* FitFuel API Gateway + Database Server
   Run:  node server.js        (then open http://localhost:3000)
   Data: Turso Cloud SQLite (Persistent on Vercel & Multi-device synced)
*/
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@libsql/client');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const TURSO_URL = process.env.TURSO_DATABASE_URL || 'libsql://gym-app-pantherliftz777.aws-ap-south-1.turso.io';
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTIzMTY4NzYsImlkIjoiMDFhMTRlNjgtZmYwMS03MTBlLWE0YmItOTUxYzAwNTAzNjc0Iiwia2lkIjoidldIWDFnYjZCNEtoT0l5WXpxVHQ2MDkxR18zQUhKZnNOZ3FmRTBkaUNJUSIsInJpZCI6Ijk2Mjg4OTRmLWRlMGYtNDlmZC1hYzA3LTgyZGQ2MjlmMzY4MCJ9.2GeLWOkLpH2QYFCB2gAgHk-qlpRg3MfUmuD8XH_qf-9qUEcwQpg8xbg5DzE7Gq_vwpXSbT2fN7z0BQyNDuJGAA';

const client = createClient({
  url: TURSO_URL,
  authToken: TURSO_AUTH_TOKEN
});

const db = {
  async get(sql, args = []) {
    const res = await client.execute({ sql, args });
    return res.rows[0] || null;
  },
  async all(sql, args = []) {
    const res = await client.execute({ sql, args });
    return res.rows || [];
  },
  async run(sql, args = []) {
    const res = await client.execute({ sql, args });
    return {
      lastInsertRowid: res.lastInsertRowid !== undefined ? Number(res.lastInsertRowid) : null,
      changes: res.rowsAffected
    };
  },
  async exec(sql) {
    return await client.executeMultiple(sql);
  },
  async batch(statements) {
    return await client.batch(statements, 'write');
  }
};

/* ---------- helpers ---------- */
const hashPass = (pass, salt) =>
  crypto.scryptSync(pass, salt, 64).toString('hex');
const todayStr = () => new Date().toISOString().slice(0, 10);
const json = (res, code, obj) => {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
};
const readBody = req => new Promise((resolve, reject) => {
  let b = '';
  req.on('data', c => { b += c; if (b.length > 8e6) req.destroy(); });
  req.on('end', () => { try { resolve(b ? JSON.parse(b) : {}); } catch (e) { reject(e); } });
  req.on('error', reject);
});

async function getUser(req) {
  const h = req.headers.authorization || '';
  let token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token && req.headers.cookie) {
    const m = /ff_token=([^;]+)/.exec(req.headers.cookie);
    if (m) token = m[1];
  }
  if (!token) return null;
  const row = await db.get(
    'SELECT u.id, u.name, u.email, u.contact, u.created_at, u.last_login, u.is_admin FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?',
    [token]
  );
  return row || null;
}

/* ---------- state upsert / read ---------- */
async function saveState(userId, state) {
  if (state.profile !== undefined) {
    await db.run(
      'INSERT INTO profile(user_id,data,updated) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data, updated=excluded.updated',
      [userId, JSON.stringify(state.profile), Date.now()]
    );
  }
  if (state.plan !== undefined) {
    await db.run(
      'INSERT INTO plans(user_id,data,updated) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data, updated=excluded.updated',
      [userId, JSON.stringify(state.plan), Date.now()]
    );
  }
  if (state.settings !== undefined) {
    await db.run(
      'INSERT INTO settings(user_id,data,updated) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data, updated=excluded.updated',
      [userId, JSON.stringify(state.settings), Date.now()]
    );
  }
  if (state.water !== undefined) {
    const w = state.water || {};
    if (w.date) {
      await db.run(
        'INSERT INTO water(user_id,date,ml) VALUES(?,?,?) ON CONFLICT(user_id,date) DO UPDATE SET ml=excluded.ml',
        [userId, w.date, w.ml | 0]
      );
    }
  }
  if (state.log !== undefined) {
    const statements = [{ sql: 'DELETE FROM log_entries WHERE user_id=?', args: [userId] }];
    const log = state.log || {};
    for (const date of Object.keys(log)) {
      for (const e of (log[date] || [])) {
        statements.push({
          sql: 'INSERT INTO log_entries(user_id,date,meal,entry) VALUES(?,?,?,?)',
          args: [userId, date, e.meal || '', JSON.stringify(e)]
        });
      }
    }
    await db.batch(statements);
  }
  if (state.custom !== undefined) {
    const statements = [{ sql: 'DELETE FROM custom_foods WHERE user_id=?', args: [userId] }];
    for (const c of (state.custom || [])) {
      statements.push({
        sql: 'INSERT INTO custom_foods(id,user_id,data,created) VALUES(?,?,?,?)',
        args: [String(c.id), userId, JSON.stringify(c), Date.now()]
      });
    }
    await db.batch(statements);
  }
}

async function loadState(userId) {
  const [profRow, planRow, settRow, waterRow, logRows, customRows, weightRows, woRows] = await Promise.all([
    db.get('SELECT data FROM profile WHERE user_id=?', [userId]),
    db.get('SELECT data FROM plans WHERE user_id=?', [userId]),
    db.get('SELECT data FROM settings WHERE user_id=?', [userId]),
    db.get('SELECT date, ml FROM water WHERE user_id=? ORDER BY date DESC LIMIT 1', [userId]),
    db.all('SELECT date, entry FROM log_entries WHERE user_id=? ORDER BY id', [userId]),
    db.all('SELECT data FROM custom_foods WHERE user_id=? ORDER BY created', [userId]),
    db.all('SELECT date, w_kg FROM weights WHERE user_id=? ORDER BY date DESC LIMIT 90', [userId]),
    db.all('SELECT date, name FROM workouts_done WHERE user_id=? ORDER BY date DESC LIMIT 300', [userId])
  ]);

  const log = {};
  for (const r of logRows) {
    (log[r.date] = log[r.date] || []).push(JSON.parse(r.entry));
  }
  const custom = customRows.map(r => JSON.parse(r.data));
  const weights = weightRows.map(r => ({ date: r.date, wKg: r.w_kg })).reverse();
  const workouts = woRows.map(r => ({ date: r.date, name: r.name })).reverse();

  return {
    profile: profRow ? JSON.parse(profRow.data) : null,
    plan: planRow ? JSON.parse(planRow.data) : null,
    settings: settRow ? JSON.parse(settRow.data) : null,
    water: waterRow ? { date: waterRow.date, ml: waterRow.ml } : null,
    log, custom, weights, workouts
  };
}

/* ---------- routes ---------- */
const routes = {
  'POST /api/auth/register': async (req, res) => {
    const { name, email, contact, password } = await readBody(req);
    if (!name || String(name).trim().length < 2) return json(res, 400, { error: 'Enter your full name' });
    if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(email || '')) return json(res, 400, { error: 'Enter a valid email (must end with .com, .in, .org etc.)' });
    if (!/[A-Z]/.test(password || '')) return json(res, 400, { error: 'Password must include at least one capital letter' });
    if (!/[^A-Za-z0-9]/.test(password || '')) return json(res, 400, { error: 'Password must include at least one special character (!@#$...)' });
    if (!password || String(password).length < 6) return json(res, 400, { error: 'Password must be at least 6 characters' });
    const em = String(email).toLowerCase().trim();
    const existing = await db.get('SELECT id FROM users WHERE email=?', [em]);
    if (existing) return json(res, 409, { error: 'Email already registered — please login' });
    const salt = crypto.randomBytes(16).toString('hex');
    const userCount = await db.get('SELECT COUNT(*) AS c FROM users');
    const isAdmin = Number(userCount ? userCount.c : 0) === 0 ? 1 : 0;
    const info = await db.run(
      'INSERT INTO users(name,email,contact,pass_hash,salt,created_at,last_login,is_admin) VALUES(?,?,?,?,?,?,?,?)',
      [String(name).trim(), em, String(contact || ''), hashPass(password, salt), salt, Date.now(), Date.now(), isAdmin]
    );
    const userId = info.lastInsertRowid;
    const token = crypto.randomBytes(24).toString('hex');
    await db.run('INSERT INTO sessions(token,user_id,created_at) VALUES(?,?,?)', [token, userId, Date.now()]);
    json(res, 200, { token, user: { id: userId, name: String(name).trim(), email: em, contact: String(contact || ''), created_at: Date.now(), last_login: Date.now(), is_admin: isAdmin } });
  },
  'POST /api/auth/login': async (req, res) => {
    const { email, password } = await readBody(req);
    const em = String(email || '').toLowerCase().trim();
    const u = await db.get('SELECT * FROM users WHERE email=?', [em]);
    if (!u || hashPass(password || '', u.salt) !== u.pass_hash) return json(res, 401, { error: 'Wrong email or password' });
    await db.run('UPDATE users SET last_login=? WHERE id=?', [Date.now(), u.id]);
    const token = crypto.randomBytes(24).toString('hex');
    await db.run('INSERT INTO sessions(token,user_id,created_at) VALUES(?,?,?)', [token, u.id, Date.now()]);
    json(res, 200, { token, user: { id: u.id, name: u.name, email: u.email, contact: u.contact, created_at: u.created_at, last_login: Date.now(), is_admin: u.is_admin || 0 } });
  },
  'GET /api/auth/me': async (req, res) => {
    const u = await getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    json(res, 200, { user: u });
  },
  'POST /api/auth/logout': async (req, res) => {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (token) await db.run('DELETE FROM sessions WHERE token=?', [token]);
    json(res, 200, { ok: true });
  },
  'GET /api/data': async (req, res) => {
    const u = await getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    const state = await loadState(u.id);
    json(res, 200, { user: u, state });
  },
  'PUT /api/state': async (req, res) => {
    const u = await getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    await saveState(u.id, await readBody(req));
    json(res, 200, { ok: true });
  },
  'POST /api/weight': async (req, res) => {
    const u = await getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    const { wKg, date } = await readBody(req);
    if (!wKg || wKg < 20 || wKg > 400) return json(res, 400, { error: 'Enter a valid weight' });
    await db.run('INSERT INTO weights(user_id,date,w_kg) VALUES(?,?,?)', [u.id, date || todayStr(), wKg]);
    json(res, 200, { ok: true });
  },
  'POST /api/workout': async (req, res) => {
    const u = await getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    const { name, date } = await readBody(req);
    if (!name) return json(res, 400, { error: 'Workout name required' });
    await db.run('INSERT INTO workouts_done(user_id,date,name,created) VALUES(?,?,?,?)', [u.id, date || todayStr(), String(name), Date.now()]);
    json(res, 200, { ok: true });
  },

  /* ---------- saved plans (multiple) ---------- */
  'GET /api/plans': async (req, res) => {
    const u = await getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    const rows = await db.all('SELECT id, data, created FROM saved_plans WHERE user_id=? ORDER BY created DESC', [u.id]);
    json(res, 200, { plans: rows.map(r => ({ id: r.id, created: r.created, ...JSON.parse(r.data) })) });
  },
  'POST /api/plans': async (req, res) => {
    const u = await getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    const { plan } = await readBody(req);
    if (!plan) return json(res, 400, { error: 'No plan given' });
    const info = await db.run('INSERT INTO saved_plans(user_id,data,created) VALUES(?,?,?)', [u.id, JSON.stringify(plan), Date.now()]);
    json(res, 200, { id: info.lastInsertRowid });
  },
  'DELETE /api/plans': async (req, res) => {
    const u = await getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    const { id } = await readBody(req);
    await db.run('DELETE FROM saved_plans WHERE id=? AND user_id=?', [id, u.id]);
    json(res, 200, { ok: true });
  },

  /* ---------- complaints / suggestions ---------- */
  'POST /api/complaint': async (req, res) => {
    const u = await getUser(req);
    const { name, type, text, files } = await readBody(req);
    if (!name || String(name).trim().length < 2) return json(res, 400, { error: 'Please enter your name' });
    if (!text || String(text).trim().length < 5) return json(res, 400, { error: 'Please describe your problem / suggestion' });
    const safeFiles = (Array.isArray(files) ? files : []).slice(0, 3).map(f => ({
      name: String(f.name || 'file').slice(0, 80),
      type: String(f.type || '').slice(0, 60),
      data: String(f.data || '').slice(0, 900000)
    }));
    await db.run(
      'INSERT INTO complaints(user_id,name,type,text,files,created,seen) VALUES(?,?,?,?,?,?,0)',
      [u ? u.id : null, String(name).trim(), String(type || 'complaint'), String(text).trim(), JSON.stringify(safeFiles), Date.now()]
    );
    json(res, 200, { ok: true });
  },
  'GET /api/complaints': async (req, res) => {
    const u = await getUser(req);
    if (!u || !u.is_admin) return json(res, 403, { error: 'Admin access only' });
    const rows = await db.all('SELECT * FROM complaints ORDER BY created DESC LIMIT 200');
    json(res, 200, { complaints: rows.map(r => ({ ...r, files: JSON.parse(r.files || '[]') })) });
  },

  /* ---------- admin ---------- */
  'GET /api/admin/users': async (req, res) => {
    const u = await getUser(req);
    if (!u || !u.is_admin) return json(res, 403, { error: 'Admin access only' });
    const rows = await db.all('SELECT id, name, email, contact, created_at, last_login, is_admin FROM users ORDER BY id');
    const counts = {};
    const countRows = await db.all('SELECT user_id, COUNT(*) AS c FROM log_entries GROUP BY user_id');
    for (const r of countRows) counts[r.user_id] = r.c;
    json(res, 200, { users: rows.map(r => ({ ...r, logCount: counts[r.id] || 0 })) });
  },
  'DELETE /api/admin/user': async (req, res) => {
    const u = await getUser(req);
    if (!u || !u.is_admin) return json(res, 403, { error: 'Admin access only' });
    const { id } = await readBody(req);
    if (id === u.id) return json(res, 400, { error: 'You cannot delete your own admin account' });
    const tables = ['sessions', 'profile', 'log_entries', 'water', 'custom_foods', 'plans', 'settings', 'weights', 'workouts_done', 'saved_plans'];
    const statements = tables.map(t => ({ sql: 'DELETE FROM ' + t + ' WHERE user_id=?', args: [id] }));
    statements.push({ sql: 'DELETE FROM users WHERE id=?', args: [id] });
    await db.batch(statements);
    json(res, 200, { ok: true });
  },
  'POST /api/admin/claim': async (req, res) => {
    const u = await getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    const { secret } = await readBody(req);
    if (secret === process.env.ADMIN_SECRET || secret === 'fitfuel-admin-2026') {
      await db.run('UPDATE users SET is_admin=1 WHERE id=?', [u.id]);
      return json(res, 200, { ok: true });
    }
    json(res, 403, { error: 'Wrong admin secret' });
  }
};

/* ---------- static files ---------- */
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.ico': 'image/x-icon', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };
function serveStatic(req, res) {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/') p = '/index.html';
  let file = path.normalize(path.join(ROOT, 'public', p));
  if (!fs.existsSync(file)) file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(buf);
  });
}

async function requestHandler(req, res) {
  try {
    let pathname = new URL(req.url, 'http://localhost').pathname;
    const orig = req.headers['x-forwarded-uri'] || req.headers['x-invoke-path'] || req.headers['x-matched-path'];
    if (orig) {
      const p = new URL(orig, 'http://localhost').pathname;
      if (p.startsWith('/api/')) pathname = p;
    }
    if (req.headers['x-now-route-matches']) {
      const m = /1=([^&]+)/.exec(req.headers['x-now-route-matches']);
      if (m) pathname = '/api/' + decodeURIComponent(m[1]);
    }
    const key = req.method + ' ' + pathname;
    if (routes[key]) return await routes[key](req, res);
    if (key.startsWith('GET /api/') || key.startsWith('POST /api/') || key.startsWith('DELETE /api/')) {
      return json(res, 404, { error: 'Unknown API route: ' + key });
    }
    if (req.method === 'GET' || req.method === 'HEAD') return serveStatic(req, res);
    res.writeHead(405); res.end();
  } catch (e) {
    json(res, 500, { error: 'Server error: ' + e.message });
  }
}

if (require.main === module) {
  const server = http.createServer(requestHandler);
  server.listen(PORT, '0.0.0.0', () => console.log('🔥 FitFuel running on port ' + PORT + ' (Turso Cloud Connected)'));
}

module.exports = requestHandler;
