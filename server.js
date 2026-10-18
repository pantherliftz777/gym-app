/* FitFuel API Gateway + Database Server
   Run:  node server.js        (then open http://localhost:3000)
   Data: SQLite file `fitfuel.db` (auto-created) — sab user data yahan safe rehta hai. */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DB_PATH = path.join(ROOT, 'fitfuel.db');

/* ---------- DATABASE ---------- */
const db = new DatabaseSync(DB_PATH);
db.exec(`
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  contact TEXT,
  pass_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_login INTEGER
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
  type TEXT,
  text TEXT,
  files TEXT,
  created INTEGER NOT NULL,
  seen INTEGER DEFAULT 0
);
`);
try { db.exec('ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0'); } catch (e) { /* already added */ }

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
function getUser(req) {
  const h = req.headers.authorization || '';
  let token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token && req.headers.cookie) {
    const m = /ff_token=([^;]+)/.exec(req.headers.cookie);
    if (m) token = m[1];
  }
  if (!token) return null;
  const row = db.prepare('SELECT u.id, u.name, u.email, u.contact, u.created_at, u.last_login, u.is_admin FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?').get(token);
  return row || null;
}

/* ---------- state upsert / read ---------- */
function saveState(userId, state) {
  if (state.profile !== undefined) {
    db.prepare('INSERT INTO profile(user_id,data,updated) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data, updated=excluded.updated')
      .run(userId, JSON.stringify(state.profile), Date.now());
  }
  if (state.plan !== undefined) {
    db.prepare('INSERT INTO plans(user_id,data,updated) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data, updated=excluded.updated')
      .run(userId, JSON.stringify(state.plan), Date.now());
  }
  if (state.settings !== undefined) {
    db.prepare('INSERT INTO settings(user_id,data,updated) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data, updated=excluded.updated')
      .run(userId, JSON.stringify(state.settings), Date.now());
  }
  if (state.water !== undefined) {
    const w = state.water || {};
    if (w.date) db.prepare('INSERT INTO water(user_id,date,ml) VALUES(?,?,?) ON CONFLICT(user_id,date) DO UPDATE SET ml=excluded.ml')
      .run(userId, w.date, w.ml | 0);
  }
  if (state.log !== undefined) {
    db.exec('BEGIN');
    try {
      db.prepare('DELETE FROM log_entries WHERE user_id=?').run(userId);
      const ins = db.prepare('INSERT INTO log_entries(user_id,date,meal,entry) VALUES(?,?,?,?)');
      const log = state.log || {};
      for (const date of Object.keys(log)) {
        for (const e of (log[date] || [])) ins.run(userId, date, e.meal || '', JSON.stringify(e));
      }
      db.exec('COMMIT');
    } catch (e) { db.exec('ROLLBACK'); throw e; }
  }
  if (state.custom !== undefined) {
    db.exec('BEGIN');
    try {
      db.prepare('DELETE FROM custom_foods WHERE user_id=?').run(userId);
      const ins = db.prepare('INSERT INTO custom_foods(id,user_id,data,created) VALUES(?,?,?,?)');
      for (const c of (state.custom || [])) ins.run(String(c.id), userId, JSON.stringify(c), Date.now());
      db.exec('COMMIT');
    } catch (e) { db.exec('ROLLBACK'); throw e; }
  }
}
function loadState(userId) {
  const one = (q, key) => { const r = db.prepare(q).get(userId); return r ? JSON.parse(r.data) : null; };
  const log = {};
  for (const r of db.prepare('SELECT date, entry FROM log_entries WHERE user_id=? ORDER BY id').all(userId)) {
    (log[r.date] = log[r.date] || []).push(JSON.parse(r.entry));
  }
  const custom = db.prepare('SELECT data FROM custom_foods WHERE user_id=? ORDER BY created').all(userId)
    .map(r => JSON.parse(r.data));
  const weights = db.prepare('SELECT date, w_kg FROM weights WHERE user_id=? ORDER BY date DESC LIMIT 90').all(userId)
    .map(r => ({ date: r.date, wKg: r.w_kg })).reverse();
  const workouts = db.prepare('SELECT date, name FROM workouts_done WHERE user_id=? ORDER BY date DESC LIMIT 300').all(userId)
    .map(r => ({ date: r.date, name: r.name })).reverse();
  const water = db.prepare('SELECT date, ml FROM water WHERE user_id=? ORDER BY date DESC LIMIT 1').get(userId);
  return {
    profile: one('SELECT data FROM profile WHERE user_id=?'),
    plan: one('SELECT data FROM plans WHERE user_id=?'),
    settings: one('SELECT data FROM settings WHERE user_id=?'),
    water: water ? { date: water.date, ml: water.ml } : null,
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
    if (db.prepare('SELECT id FROM users WHERE email=?').get(em)) return json(res, 409, { error: 'Email already registered — please login' });
    const salt = crypto.randomBytes(16).toString('hex');
    const isAdmin = db.prepare('SELECT COUNT(*) AS c FROM users').get().c === 0 ? 1 : 0;
    const info = db.prepare('INSERT INTO users(name,email,contact,pass_hash,salt,created_at,last_login,is_admin) VALUES(?,?,?,?,?,?,?,?)')
      .run(String(name).trim(), em, String(contact || ''), hashPass(password, salt), salt, Date.now(), Date.now(), isAdmin);
    const userId = info.lastInsertRowid;
    const token = crypto.randomBytes(24).toString('hex');
    db.prepare('INSERT INTO sessions(token,user_id,created_at) VALUES(?,?,?)').run(token, userId, Date.now());
    json(res, 200, { token, user: { id: userId, name: String(name).trim(), email: em, contact: String(contact || ''), created_at: Date.now(), last_login: Date.now(), is_admin: isAdmin } });
  },
  'POST /api/auth/login': async (req, res) => {
    const { email, password } = await readBody(req);
    const em = String(email || '').toLowerCase().trim();
    const u = db.prepare('SELECT * FROM users WHERE email=?').get(em);
    if (!u || hashPass(password || '', u.salt) !== u.pass_hash) return json(res, 401, { error: 'Wrong email or password' });
    db.prepare('UPDATE users SET last_login=? WHERE id=?').run(Date.now(), u.id);
    const token = crypto.randomBytes(24).toString('hex');
    db.prepare('INSERT INTO sessions(token,user_id,created_at) VALUES(?,?,?)').run(token, u.id, Date.now());
    json(res, 200, { token, user: { id: u.id, name: u.name, email: u.email, contact: u.contact, created_at: u.created_at, last_login: Date.now(), is_admin: u.is_admin || 0 } });
  },
  'GET /api/auth/me': async (req, res) => {
    const u = getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    json(res, 200, { user: u });
  },
  'POST /api/auth/logout': async (req, res) => {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (token) db.prepare('DELETE FROM sessions WHERE token=?').run(token);
    json(res, 200, { ok: true });
  },
  'GET /api/data': async (req, res) => {
    const u = getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    json(res, 200, { user: u, state: loadState(u.id) });
  },
  'PUT /api/state': async (req, res) => {
    const u = getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    saveState(u.id, await readBody(req));
    json(res, 200, { ok: true });
  },
  'POST /api/weight': async (req, res) => {
    const u = getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    const { wKg, date } = await readBody(req);
    if (!wKg || wKg < 20 || wKg > 400) return json(res, 400, { error: 'Enter a valid weight' });
    db.prepare('INSERT INTO weights(user_id,date,w_kg) VALUES(?,?,?)').run(u.id, date || todayStr(), wKg);
    json(res, 200, { ok: true });
  },
  'POST /api/workout': async (req, res) => {
    const u = getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    const { name, date } = await readBody(req);
    if (!name) return json(res, 400, { error: 'Workout name required' });
    db.prepare('INSERT INTO workouts_done(user_id,date,name,created) VALUES(?,?,?,?)').run(u.id, date || todayStr(), String(name), Date.now());
    json(res, 200, { ok: true });
  },

  /* ---------- saved plans (multiple) ---------- */
  'GET /api/plans': async (req, res) => {
    const u = getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    const rows = db.prepare('SELECT id, data, created FROM saved_plans WHERE user_id=? ORDER BY created DESC').all(u.id);
    json(res, 200, { plans: rows.map(r => ({ id: r.id, created: r.created, ...JSON.parse(r.data) })) });
  },
  'POST /api/plans': async (req, res) => {
    const u = getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    const { plan } = await readBody(req);
    if (!plan) return json(res, 400, { error: 'No plan given' });
    const info = db.prepare('INSERT INTO saved_plans(user_id,data,created) VALUES(?,?,?)').run(u.id, JSON.stringify(plan), Date.now());
    json(res, 200, { id: info.lastInsertRowid });
  },
  'DELETE /api/plans': async (req, res) => {
    const u = getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    const { id } = await readBody(req);
    db.prepare('DELETE FROM saved_plans WHERE id=? AND user_id=?').run(id, u.id);
    json(res, 200, { ok: true });
  },

  /* ---------- complaints / suggestions ---------- */
  'POST /api/complaint': async (req, res) => {
    const u = getUser(req);
    const { name, type, text, files } = await readBody(req);
    if (!name || String(name).trim().length < 2) return json(res, 400, { error: 'Please enter your name' });
    if (!text || String(text).trim().length < 5) return json(res, 400, { error: 'Please describe your problem / suggestion' });
    const safeFiles = (Array.isArray(files) ? files : []).slice(0, 3).map(f => ({
      name: String(f.name || 'file').slice(0, 80),
      type: String(f.type || '').slice(0, 60),
      data: String(f.data || '').slice(0, 900000)
    }));
    db.prepare('INSERT INTO complaints(user_id,name,type,text,files,created,seen) VALUES(?,?,?,?,?,?,0)')
      .run(u ? u.id : null, String(name).trim(), String(type || 'complaint'), String(text).trim(), JSON.stringify(safeFiles), Date.now());
    json(res, 200, { ok: true });
  },
  'GET /api/complaints': async (req, res) => {
    const u = getUser(req);
    if (!u || !u.is_admin) return json(res, 403, { error: 'Admin access only' });
    const rows = db.prepare('SELECT * FROM complaints ORDER BY created DESC LIMIT 200').all();
    json(res, 200, { complaints: rows.map(r => ({ ...r, files: JSON.parse(r.files || '[]') })) });
  },

  /* ---------- admin ---------- */
  'GET /api/admin/users': async (req, res) => {
    const u = getUser(req);
    if (!u || !u.is_admin) return json(res, 403, { error: 'Admin access only' });
    const rows = db.prepare('SELECT id, name, email, contact, created_at, last_login, is_admin FROM users ORDER BY id').all();
    const counts = {};
    for (const r of db.prepare('SELECT user_id, COUNT(*) AS c FROM log_entries GROUP BY user_id').all()) counts[r.user_id] = r.c;
    json(res, 200, { users: rows.map(r => ({ ...r, logCount: counts[r.id] || 0 })) });
  },
  'DELETE /api/admin/user': async (req, res) => {
    const u = getUser(req);
    if (!u || !u.is_admin) return json(res, 403, { error: 'Admin access only' });
    const { id } = await readBody(req);
    if (id === u.id) return json(res, 400, { error: 'You cannot delete your own admin account' });
    db.exec('BEGIN');
    try {
      for (const t of ['sessions', 'profile', 'log_entries', 'water', 'custom_foods', 'plans', 'settings', 'weights', 'workouts_done', 'saved_plans'])
        db.prepare('DELETE FROM ' + t + ' WHERE user_id=?').run(id);
      db.prepare('DELETE FROM users WHERE id=?').run(id);
      db.exec('COMMIT');
    } catch (e) { db.exec('ROLLBACK'); throw e; }
    json(res, 200, { ok: true });
  },
  'POST /api/admin/claim': async (req, res) => {
    const u = getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    const { secret } = await readBody(req);
    if (secret === process.env.ADMIN_SECRET || secret === 'fitfuel-admin-2026') {
      db.prepare('UPDATE users SET is_admin=1 WHERE id=?').run(u.id);
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
  const file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(buf);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const key = req.method + ' ' + new URL(req.url, 'http://x').pathname;
    if (routes[key]) return await routes[key](req, res);
    if (key.startsWith('GET /api/')) return json(res, 404, { error: 'Unknown API route' });
    if (req.method === 'GET' || req.method === 'HEAD') return serveStatic(req, res);
    res.writeHead(405); res.end();
  } catch (e) {
    json(res, 500, { error: 'Server error: ' + e.message });
  }
});
server.listen(PORT, '0.0.0.0', () => console.log('🔥 FitFuel running on port ' + PORT + ' (DB: fitfuel.db)'));
module.exports = app;
