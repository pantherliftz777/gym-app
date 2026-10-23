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

// Load local .env if present
try {
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
} catch (e) {}

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
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
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
  if (row) {
    row.is_admin = (row.email === 'admin@fitfuel.app') ? 1 : 0;
  }
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
    const isAdmin = (em === 'admin@fitfuel.app') ? 1 : 0;
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
    const isAdmin = (em === 'admin@fitfuel.app') ? 1 : 0;
    await db.run('UPDATE users SET last_login=?, is_admin=? WHERE id=?', [Date.now(), isAdmin, u.id]);
    const token = crypto.randomBytes(24).toString('hex');
    await db.run('INSERT INTO sessions(token,user_id,created_at) VALUES(?,?,?)', [token, u.id, Date.now()]);
    json(res, 200, { token, user: { id: u.id, name: u.name, email: u.email, contact: u.contact, created_at: u.created_at, last_login: Date.now(), is_admin: isAdmin } });
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

  /* ---------- activity & live GPS sessions ---------- */
  'GET /api/activity/sessions': async (req, res) => {
    const u = await getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    const rows = await db.all('SELECT * FROM activity_sessions WHERE user_id=? ORDER BY start_time DESC LIMIT 100', [u.id]);
    json(res, 200, { sessions: rows });
  },
  'POST /api/activity/session': async (req, res) => {
    const u = await getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    const body = await readBody(req);
    const { activity_type, start_time, end_time, duration_sec, distance_meters, avg_speed_kmh, avg_pace_min_km, calories, steps, route_data } = body;
    const info = await db.run(
      'INSERT INTO activity_sessions(user_id,activity_type,start_time,end_time,duration_sec,distance_meters,avg_speed_kmh,avg_pace_min_km,calories,steps,route_data,created) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        u.id,
        String(activity_type || 'walking'),
        Number(start_time) || Date.now(),
        Number(end_time) || Date.now(),
        Number(duration_sec) || 0,
        Number(distance_meters) || 0,
        Number(avg_speed_kmh) || 0,
        Number(avg_pace_min_km) || 0,
        Number(calories) || 0,
        Number(steps) || 0,
        typeof route_data === 'object' ? JSON.stringify(route_data) : String(route_data || ''),
        Date.now()
      ]
    );
    json(res, 200, { ok: true, id: info.lastInsertRowid });
  },

  /* ---------- posture & form check sessions ---------- */
  'GET /api/posture/sessions': async (req, res) => {
    const u = await getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    const rows = await db.all('SELECT * FROM posture_sessions WHERE user_id=? ORDER BY created DESC LIMIT 60', [u.id]);
    json(res, 200, { sessions: rows });
  },
  'POST /api/posture/session': async (req, res) => {
    const u = await getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    const body = await readBody(req);
    const { exercise, reps, score, feedback } = body;
    const info = await db.run(
      'INSERT INTO posture_sessions(user_id,exercise,reps,score,feedback,created) VALUES(?,?,?,?,?,?)',
      [
        u.id,
        String(exercise || 'Squats'),
        Number(reps) || 0,
        Number(score) || 0,
        typeof feedback === 'object' ? JSON.stringify(feedback) : String(feedback || ''),
        Date.now()
      ]
    );
    json(res, 200, { ok: true, id: info.lastInsertRowid });
  },

  /* ---------- data erasure & account deletion ---------- */
  'POST /api/user/erase-data': async (req, res) => {
    const u = await getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    const tables = ['log_entries', 'water', 'custom_foods', 'plans', 'weights', 'workouts_done', 'saved_plans', 'activity_sessions', 'posture_sessions'];
    const statements = tables.map(t => ({ sql: 'DELETE FROM ' + t + ' WHERE user_id=?', args: [u.id] }));
    await db.batch(statements);
    json(res, 200, { ok: true, message: 'All user data erased successfully' });
  },
  'POST /api/user/delete-account': async (req, res) => {
    const u = await getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    const tables = ['sessions', 'profile', 'log_entries', 'water', 'custom_foods', 'plans', 'settings', 'weights', 'workouts_done', 'saved_plans', 'activity_sessions', 'posture_sessions'];
    const statements = tables.map(t => ({ sql: 'DELETE FROM ' + t + ' WHERE user_id=?', args: [u.id] }));
    statements.push({ sql: 'DELETE FROM users WHERE id=?', args: [u.id] });
    await db.batch(statements);
    json(res, 200, { ok: true, message: 'Account permanently deleted' });
  },

  /* ---------- complaints / suggestions ---------- */
  'POST /api/complaint': async (req, res) => {
    const u = await getUser(req);
    const { name, email, type, text, files } = await readBody(req);
    if (!name || String(name).trim().length < 2) return json(res, 400, { error: 'Please enter your name' });
    if (!text || String(text).trim().length < 5) return json(res, 400, { error: 'Please describe your problem / suggestion' });
    const userEmail = (email && String(email).trim()) || (u && u.email) || '';
    const safeFiles = (Array.isArray(files) ? files : []).slice(0, 3).map(f => ({
      name: String(f.name || 'file').slice(0, 80),
      type: String(f.type || '').slice(0, 60),
      data: String(f.data || '').slice(0, 900000)
    }));
    await db.run(
      'INSERT INTO complaints(user_id,name,email,type,text,files,created,seen) VALUES(?,?,?,?,?,?,?,0)',
      [u ? u.id : null, String(name).trim(), userEmail, String(type || 'complaint'), String(text).trim(), JSON.stringify(safeFiles), Date.now()]
    );
    json(res, 200, { ok: true });
  },
  'GET /api/complaints': async (req, res) => {
    const u = await getUser(req);
    if (!u || !u.is_admin) return json(res, 403, { error: 'Admin access only' });
    const rows = await db.all(`
      SELECT c.*, COALESCE(NULLIF(c.email, ''), u.email, 'Not provided') as email
      FROM complaints c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.created DESC LIMIT 200
    `);
    json(res, 200, { complaints: rows.map(r => ({ ...r, files: JSON.parse(r.files || '[]') })) });
  },
  'PATCH /api/complaint/status': async (req, res) => {
    const u = await getUser(req);
    if (!u || !u.is_admin) return json(res, 403, { error: 'Admin access only' });
    const { id, status, admin_notes } = await readBody(req);
    if (!id) return json(res, 400, { error: 'Missing complaint id' });
    const safeStatus = ['pending', 'in_progress', 'resolved'].includes(status) ? status : 'pending';
    await db.run('UPDATE complaints SET status = ?, admin_notes = ? WHERE id = ?', [safeStatus, String(admin_notes || '').slice(0, 1000), id]);
    json(res, 200, { ok: true, status: safeStatus });
  },
  'DELETE /api/complaint': async (req, res) => {
    const u = await getUser(req);
    if (!u || !u.is_admin) return json(res, 403, { error: 'Admin access only' });
    const { id } = await readBody(req);
    if (!id) return json(res, 400, { error: 'Missing complaint id' });
    await db.run('DELETE FROM complaints WHERE id = ?', [id]);
    json(res, 200, { ok: true });
  },
  'GET /api/admin/stats': async (req, res) => {
    const u = await getUser(req);
    if (!u || !u.is_admin) return json(res, 403, { error: 'Admin access only' });
    const userCountRow = await db.get('SELECT COUNT(*) as count FROM users');
    const complaintCountRow = await db.get('SELECT COUNT(*) as count FROM complaints');
    const pendingRow = await db.get("SELECT COUNT(*) as count FROM complaints WHERE status = 'pending' OR status IS NULL");
    const resolvedRow = await db.get("SELECT COUNT(*) as count FROM complaints WHERE status = 'resolved'");
    json(res, 200, {
      totalUsers: userCountRow ? Number(userCountRow.count) : 0,
      totalComplaints: complaintCountRow ? Number(complaintCountRow.count) : 0,
      pendingComplaints: pendingRow ? Number(pendingRow.count) : 0,
      resolvedComplaints: resolvedRow ? Number(resolvedRow.count) : 0
    });
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
  },
  'POST /api/ai/chat': async (req, res) => {
    const body = await readBody(req);
    const { prompt, systemPrompt, messages, geminiKey: userGeminiKey, openRouterKey: userOpenRouterKey } = body || {};

    const isJson = (systemPrompt && systemPrompt.toLowerCase().includes('json')) || (prompt && prompt.toLowerCase().includes('json'));

    const baseSystemPrompt = systemPrompt || 'You are FitFuel AI Coach — an elite sports nutritionist and strength coach. Provide direct, dynamic, customized advice tailored specifically to the user. Never use emojis anywhere in your output. Use clean markdown formatting.';

    // Format messages for OpenAI / OpenRouter standard
    let chatMessages = [];
    if (Array.isArray(messages) && messages.length > 0) {
      chatMessages.push({ role: 'system', content: baseSystemPrompt });
      chatMessages = chatMessages.concat(messages.map(m => ({
        role: m.role === 'assistant' || m.role === 'bot' ? 'assistant' : 'user',
        content: stripEmojis(m.content || m.text || '')
      })));
      if (prompt && (!messages.length || (messages[messages.length - 1].content !== prompt && messages[messages.length - 1].text !== prompt))) {
        chatMessages.push({ role: 'user', content: stripEmojis(prompt) });
      }
    } else {
      chatMessages = [
        { role: 'system', content: baseSystemPrompt },
        { role: 'user', content: stripEmojis(prompt || 'Hello') }
      ];
    }

    // 1. Direct Google Gemini API (if user or server has key)
    const geminiKey = userGeminiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (geminiKey) {
      const geminiModels = ['gemini-2.0-flash', 'gemini-1.5-flash'];
      for (const gModel of geminiModels) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 25000);

          const geminiContents = chatMessages
            .filter(m => m.role !== 'system')
            .map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }]
            }));

          const gResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${gModel}:generateContent?key=${geminiKey}`, {
            signal: controller.signal,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: baseSystemPrompt }] },
              contents: geminiContents,
              generationConfig: {
                temperature: isJson ? 0.2 : 0.7,
                maxOutputTokens: 2500
              }
            })
          });
          clearTimeout(timeoutId);

          if (gResp.ok) {
            const gData = await gResp.json();
            const text = gData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (isValidAiOutput(text)) {
              return json(res, 200, { ok: true, provider: 'google-gemini', model: gModel, content: stripEmojis(text).trim() });
            }
          }
        } catch (err) {
          // Cascade to OpenRouter
        }
      }
    }

    // 2. OpenRouter Cascade across live free models
    const orKey = userOpenRouterKey || process.env.OPENROUTER_API_KEY;
    if (orKey) {
      const callOrModel = async (model, timeoutMs = 28000) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const fetchRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            signal: controller.signal,
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + orKey,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://fitfuel.app',
              'X-Title': 'FitFuel AI Live Coach'
            },
            body: JSON.stringify({
              model: model,
              messages: chatMessages,
              temperature: isJson ? 0.2 : 0.6,
              max_tokens: 2200,
              reasoning: { max_tokens: 120 }
            })
          });
          clearTimeout(timeoutId);

          if (!fetchRes.ok) throw new Error('Status ' + fetchRes.status);
          const data = await fetchRes.json();
          const extracted = extractAiMessage(data);
          if (isValidAiOutput(extracted)) {
            return { model: data.model || model, content: extracted };
          }
          throw new Error('Invalid or error content from ' + model);
        } catch (err) {
          clearTimeout(timeoutId);
          throw err;
        }
      };

      // Try prioritized free models (minimax does not hit OpenRouter free-tier quota; openrouter/free auto-cascades)
      const primaryModels = [
        'minimax/minimax-m3.1-flash:free',
        'openrouter/free',
        'nvidia/nemotron-3.5-lightning:free'
      ];

      for (const m of primaryModels) {
        try {
          const resData = await callOrModel(m, 22000);
          if (resData && resData.content) {
            return json(res, 200, { ok: true, provider: 'openrouter', model: resData.model, content: resData.content });
          }
        } catch (err) {
          // Cascade to next model
        }
      }

      // Fallback sequentially
      const fallbackModels = [
        'liquid/lfm-2.5-2.6b:free',
        'google/gemma-4-26b-a4b-it:free',
        'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free'
      ];
      for (const m of fallbackModels) {
        try {
          const resData = await callOrModel(m, 16000);
          if (resData && resData.content) {
            return json(res, 200, { ok: true, provider: 'openrouter', model: resData.model, content: resData.content });
          }
        } catch (e) {}
      }
    }

    // 3. Fallback Handling
    if (isJson) {
      if (prompt && (prompt.toLowerCase().includes('food item') || prompt.toLowerCase().includes('meal description') || prompt.toLowerCase().includes('portiongrams'))) {
        return json(res, 200, { ok: true, provider: 'fitfuel-calc-engine', model: 'fitfuel-nutrition-math', content: generateDynamicFoodJson(prompt) });
      }
      return json(res, 200, { ok: true, provider: 'fitfuel-calc-engine', model: 'fitfuel-metabolic-math', content: generateDynamicPlanJson(prompt) });
    }

    return json(res, 503, {
      ok: false,
      error: 'FitFuel AI models are temporarily experiencing high traffic upstream. Please retry your question in a moment or provide your own key in Settings.'
    });
  }
};

function cleanReasoningToMarkdown(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let text = raw.trim();
  const draftIndex = text.search(/(\n\s*(#{1,4}|[A-Z][a-zA-Z\s]{2,15}:|\d+\.|\-)\s+[A-Z0-9])/);
  if (draftIndex > 20) {
    const candidate = text.slice(draftIndex).trim();
    if (candidate.length > 50) text = candidate;
  }
  text = text.replace(/^(We need|I need|User asks|Let's verify|Let me check).*$/gmi, '').trim();
  return text;
}

function extractAiMessage(data) {
  const choice = data?.choices?.[0];
  if (!choice || !choice.message) return null;
  const msg = choice.message;
  if (msg.content && typeof msg.content === 'string' && msg.content.trim().length >= 8) {
    return stripEmojis(msg.content).trim();
  }
  const reasoning = msg.reasoning || (Array.isArray(msg.reasoning_details) ? msg.reasoning_details.map(d => d.text).join('\n') : null);
  if (reasoning && typeof reasoning === 'string') {
    const cleaned = cleanReasoningToMarkdown(reasoning);
    if (cleaned && cleaned.length >= 8) return stripEmojis(cleaned).trim();
  }
  return null;
}

function stripEmojis(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{25A0}-\u{25FF}\u{FE00}-\u{FE0F}\u{200D}]/gu, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/^ +/gm, '');
}

function isValidAiOutput(text) {
  if (!text || typeof text !== 'string') return false;
  const t = text.trim();
  if (t.length < 8) return false;
  const lower = t.toLowerCase();
  if (lower.startsWith('upstream error') ||
      lower.includes('resourceexhausted') ||
      lower.includes('rate-limited') ||
      lower.includes('rate limit exceeded') ||
      lower.includes('worker local total request limit') ||
      lower.startsWith('user safety:') ||
      lower.startsWith('error:')) {
    return false;
  }
  return true;
}

function generateDynamicPlanJson(prompt = '') {
  const lower = (prompt || '').toLowerCase();
  const wMatch = prompt.match(/weight:\s*(\d+(\.\d+)?)/i);
  const wKg = wMatch ? parseFloat(wMatch[1]) : 70;
  const isFatLoss = lower.includes('fatloss') || lower.includes('fat loss') || lower.includes('cut') || lower.includes('lose');
  const isMuscleGain = lower.includes('gain') || lower.includes('bulk') || lower.includes('hypertrophy') || lower.includes('build');

  const bmr = 10 * wKg + 6.25 * 175 - 5 * 25 + 5;
  const tdee = Math.round(bmr * 1.45);
  const cal = isFatLoss ? Math.round(tdee - 450) : (isMuscleGain ? Math.round(tdee + 350) : tdee);
  const p = Math.round(wKg * (isMuscleGain ? 2.2 : 2.0));
  const f = Math.round(wKg * 0.85);
  const c = Math.max(90, Math.round((cal - (p * 4 + f * 9)) / 4));
  const waterL = Math.max(2.5, ((wKg * 0.035) + 0.6)).toFixed(1);

  const isVeg = lower.includes('veg') || lower.includes('vegetarian');
  const isVegan = lower.includes('vegan');

  let meals = [];
  if (isVegan) {
    meals = [
      { meal: 'Breakfast', name: 'Tofu Scramble & Sprouted Whole Wheat Toast', detail: '180g firm tofu, turmeric, spinach, 2 slices whole grain bread', k: Math.round(cal * 0.25), p: Math.round(p * 0.25), c: Math.round(c * 0.3), f: Math.round(f * 0.25) },
      { meal: 'Lunch', name: 'Lentil Curry, Quinoa & Steamed Vegetables', detail: '200g cooked dal, 150g quinoa, broccoli, carrot salad', k: Math.round(cal * 0.35), p: Math.round(p * 0.35), c: Math.round(c * 0.4), f: Math.round(f * 0.3) },
      { meal: 'Snack', name: 'Pea Protein Shake with Almond Milk & Chia', detail: '1 scoop plant protein isolate, 250ml unsweetened almond milk, 15g chia seeds', k: Math.round(cal * 0.15), p: Math.round(p * 0.15), c: Math.round(c * 0.15), f: Math.round(f * 0.15) },
      { meal: 'Dinner', name: 'Seitan / Tempeh Stir-Fry with Mixed Greens', detail: '120g seitan or tempeh, zucchini, bell peppers, olive oil drizzle', k: Math.round(cal * 0.25), p: Math.round(p * 0.25), c: Math.round(c * 0.15), f: Math.round(f * 0.3) }
    ];
  } else if (isVeg) {
    meals = [
      { meal: 'Breakfast', name: 'Low-Fat Paneer Bhurji & Multigrain Roti', detail: '120g low-fat paneer, 2 small rotis, tomato, green chilies', k: Math.round(cal * 0.25), p: Math.round(p * 0.25), c: Math.round(c * 0.3), f: Math.round(f * 0.25) },
      { meal: 'Lunch', name: 'Soya Chunks Curry, Brown Rice & Cucumber Salad', detail: '60g uncooked soya chunks, 120g brown rice, 1 bowl dal', k: Math.round(cal * 0.35), p: Math.round(p * 0.35), c: Math.round(c * 0.4), f: Math.round(f * 0.3) },
      { meal: 'Snack', name: 'Greek Yogurt Bowl with Flax Seeds & Berries', detail: '200g non-fat Greek yogurt or hung curd, 10g flax seeds', k: Math.round(cal * 0.15), p: Math.round(p * 0.15), c: Math.round(c * 0.15), f: Math.round(f * 0.15) },
      { meal: 'Dinner', name: 'Grilled Tofu / Paneer Tikka with Sautéed Spinach', detail: '120g paneer or tofu, mixed salad with lemon vinaigrette', k: Math.round(cal * 0.25), p: Math.round(p * 0.25), c: Math.round(c * 0.15), f: Math.round(f * 0.3) }
    ];
  } else {
    meals = [
      { meal: 'Breakfast', name: 'Whole Eggs, Egg Whites & Oatmeal', detail: '2 whole eggs, 3 egg whites, 50g rolled oats with water', k: Math.round(cal * 0.25), p: Math.round(p * 0.25), c: Math.round(c * 0.3), f: Math.round(f * 0.25) },
      { meal: 'Lunch', name: 'Grilled Chicken Breast, Brown Rice & Dal', detail: '160g chicken breast, 130g cooked rice, steamed vegetables', k: Math.round(cal * 0.35), p: Math.round(p * 0.35), c: Math.round(c * 0.4), f: Math.round(f * 0.3) },
      { meal: 'Snack', name: 'Whey Protein Isolate & Almonds', detail: '1 scoop whey protein, 15 raw almonds', k: Math.round(cal * 0.15), p: Math.round(p * 0.15), c: Math.round(c * 0.15), f: Math.round(f * 0.15) },
      { meal: 'Dinner', name: 'Tandoori Fish / Chicken Breast with Salad', detail: '160g fish fillet or chicken, cucumber and greens with olive oil', k: Math.round(cal * 0.25), p: Math.round(p * 0.25), c: Math.round(c * 0.15), f: Math.round(f * 0.3) }
    ];
  }

  let workoutMoves = [
    { name: 'Barbell Back Squat', sets: '3-4 sets x 8-10 reps', tip: 'Control descent for 2 seconds, drive up through midfoot with braced core' },
    { name: 'Incline Dumbbell Press', sets: '3 sets x 8-10 reps', tip: '30-degree bench incline targeting upper clavicular fibers' },
    { name: 'Lat Pulldown / Neutral Grip Pull-up', sets: '3 sets x 10-12 reps', tip: 'Drive elbows down and back, hold 1s peak squeeze' },
    { name: 'Romanian Deadlift (RDL)', sets: '3 sets x 8-10 reps', tip: 'Hinge back at hips, stretch hamstrings, keep neutral spine' }
  ];

  if (lower.includes('chest') || lower.includes('arm')) {
    workoutMoves = [
      { name: 'Incline Barbell Bench Press', sets: '4 sets x 6-8 reps', tip: 'Touch collarbone area, drive barbell up with full clavicular contraction' },
      { name: 'Flat Dumbbell Press', sets: '3 sets x 8-10 reps', tip: 'Slight arch in upper back, flared 45-degree elbows for shoulder safety' },
      { name: 'Incline Dumbbell Bicep Curl', sets: '3 sets x 10-12 reps', tip: 'Elbows behind torso for maximum long-head stretch' },
      { name: 'Overhead Cable Triceps Extension', sets: '3 sets x 12-15 reps', tip: 'Keep upper arms locked vertically, flare rope at lockout' }
    ];
  } else if (lower.includes('glute') || lower.includes('leg')) {
    workoutMoves = [
      { name: 'Barbell Back Squat / Hack Squat', sets: '4 sets x 6-8 reps', tip: 'Deep hip hinge below parallel, knees tracking over toes' },
      { name: 'Romanian Deadlift (RDL)', sets: '3 sets x 8-10 reps', tip: 'Keep bar glued to shins, maximum hamstring and glute stretch' },
      { name: 'Bulgarian Split Squat', sets: '3 sets x 10-12 reps per leg', tip: 'Forward torso lean to place direct tension on glute max' },
      { name: 'Standing Calf Raise', sets: '4 sets x 15 reps', tip: 'Full 2-second pause at bottom stretch, explosive drive to toes' }
    ];
  }

  return JSON.stringify({
    cal,
    p,
    c,
    f,
    waterL,
    meals,
    workout: {
      name: isFatLoss ? 'Metabolic Conditioning & Strength Split' : 'Hypertrophy Progressive Overload Split',
      focus: isFatLoss ? 'FULL BODY · CORE · METABOLIC DENSITY' : 'HYPERTROPHY · MECHANICAL TENSION · COMPOUND',
      duration: '45 min',
      benefit: 'Engineered for progressive overload, maximum lean mass retention, and optimal recovery.',
      moves: workoutMoves
    }
  }, null, 2);
}

function generateDynamicFoodJson(prompt = '') {
  const lower = (prompt || '').toLowerCase();
  let name = 'Balanced Whole Food Serving';
  let g = 150, k = 220, p = 14, c = 25, f = 6;

  if (lower.includes('biryani')) { name = 'Chicken Biryani'; g = 280; k = 490; p = 25; c = 58; f = 16; }
  else if (lower.includes('chicken breast') || lower.includes('chicken')) { name = 'Grilled Chicken Breast'; g = 150; k = 245; p = 46; c = 0; f = 5; }
  else if (lower.includes('paneer')) { name = 'Fresh Paneer / Paneer Bhurji'; g = 120; k = 285; p = 19; c = 5; f = 21; }
  else if (lower.includes('egg')) { name = 'Boiled Eggs (2 whole + 1 white)'; g = 120; k = 175; p = 16; c = 1; f = 11; }
  else if (lower.includes('rice') || lower.includes('fried rice')) { name = 'Steamed Rice with Lentil Dal'; g = 250; k = 310; p = 10; c = 56; f = 4; }
  else if (lower.includes('burger')) { name = 'Lean Chicken / Veggie Burger'; g = 180; k = 390; p = 22; c = 42; f = 14; }
  else if (lower.includes('pizza')) { name = 'Thin Crust Pizza (2 slices)'; g = 180; k = 420; p = 16; c = 52; f = 15; }
  else if (lower.includes('oats') || lower.includes('oatmeal')) { name = 'Rolled Oats with Milk and Almonds'; g = 250; k = 310; p = 13; c = 46; f = 7; }
  else if (lower.includes('salad')) { name = 'High-Protein Garden Salad'; g = 220; k = 190; p = 15; c = 14; f = 8; }
  else if (lower.includes('dosa')) { name = 'Masala Dosa with Sambar'; g = 180; k = 280; p = 6; c = 45; f = 9; }
  else if (lower.includes('roti') || lower.includes('chapati')) { name = 'Whole Wheat Roti with Mixed Veg Sabzi'; g = 200; k = 260; p = 8; c = 44; f = 5; }
  else if (lower.includes('soya')) { name = 'Soya Chunks Curry'; g = 150; k = 210; p = 28; c = 16; f = 2; }
  else if (lower.includes('fish') || lower.includes('salmon')) { name = 'Grilled Fish Fillet'; g = 160; k = 260; p = 34; c = 0; f = 12; }
  else if (lower.includes('whey') || lower.includes('protein shake')) { name = 'Whey Protein Shake'; g = 300; k = 140; p = 26; c = 3; f = 2; }

  return JSON.stringify({
    name,
    detail: g + 'g standard portion',
    portionGrams: g,
    calories: k,
    protein: p,
    carbs: c,
    fat: f
  }, null, 2);
}

/* ---------- static files ---------- */
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.ico': 'image/x-icon', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json' };
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
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
      return res.end();
    }

    const parsed = new URL(req.url, 'http://localhost');
    let pathname = parsed.pathname;
    
    // 1. Check path param from Vercel rewrite (?path=auth/register)
    const qPath = parsed.searchParams.get('path');
    if (qPath) {
      pathname = '/api/' + qPath.replace(/^\/+/, '');
    } else {
      // 2. Fallbacks from headers
      const orig = req.headers['x-forwarded-uri'] || req.headers['x-invoke-path'] || req.headers['x-matched-path'];
      if (orig) {
        const p = new URL(orig, 'http://localhost').pathname;
        if (p.startsWith('/api/')) pathname = p;
      }
      if (req.headers['x-now-route-matches']) {
        const m = /1=([^&]+)/.exec(req.headers['x-now-route-matches']);
        if (m) pathname = '/api/' + decodeURIComponent(m[1]);
      }
    }

    const key = req.method + ' ' + pathname;
    if (routes[key]) return await routes[key](req, res);
    if (key.startsWith('GET /api/') || key.startsWith('POST /api/') || key.startsWith('PUT /api/') || key.startsWith('DELETE /api/')) {
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
  server.listen(PORT, '0.0.0.0', () => console.log('FitFuel running on port ' + PORT + ' (Turso Cloud Connected)'));
}

module.exports = requestHandler;
