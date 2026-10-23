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

const TURSO_URL = process.env.TURSO_DATABASE_URL || 'file:fitfuel.db';
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || undefined;

const client = createClient({
  url: TURSO_URL,
  ...(TURSO_AUTH_TOKEN ? { authToken: TURSO_AUTH_TOKEN } : {})
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

  /* ---------- body analysis & transformation assessments ---------- */
  'GET /api/body-scan/assessments': async (req, res) => {
    const u = (await getUser(req)) || { id: 0 };
    const rows = await db.all('SELECT * FROM body_assessments WHERE user_id=? ORDER BY created DESC LIMIT 50', [u.id]);
    json(res, 200, {
      assessments: rows.map(r => {
        let analysisObj = {};
        try { analysisObj = JSON.parse(r.analysis_json); } catch(e){}
        return {
          id: r.id,
          goal: r.goal,
          body_fat_estimate: analysisObj.estimated_physical_characteristics?.estimated_body_fat_range || analysisObj.estimatedPhysicalCharacteristics?.estimatedBodyFatPercentage || '16.5%',
          muscle_mass_estimate: analysisObj.estimated_physical_characteristics?.estimated_lean_muscle_mass || analysisObj.estimatedPhysicalCharacteristics?.estimatedLeanMuscleMass || '62.0 kg',
          posture_summary: analysisObj.posture_observations?.general_stance_and_balance || analysisObj.postureObservations?.generalStanceAndBalance || 'Symmetric alignment',
          analysis_json: r.analysis_json,
          analysis: analysisObj,
          created: r.created,
          created_at: r.created
        };
      })
    });
  },
  'POST /api/body-scan/assessment': async (req, res) => {
    const u = (await getUser(req)) || { id: 0 };
    const body = await readBody(req);
    const goal = body.goal || 'lean_athletic';
    const preferences = body.preferences || {};
    const photos_meta = body.photos_meta || {};
    const analysis = body.analysis || (body.analysis_json ? JSON.parse(body.analysis_json) : null);
    if (!analysis) return json(res, 400, { error: 'Missing analysis data' });
    const info = await db.run(
      'INSERT INTO body_assessments(user_id,goal,preferences,photos_meta,analysis_json,created) VALUES(?,?,?,?,?,?)',
      [
        u.id,
        String(goal),
        JSON.stringify(preferences),
        JSON.stringify(photos_meta),
        JSON.stringify(analysis),
        Date.now()
      ]
    );
    json(res, 200, { ok: true, success: true, id: info.lastInsertRowid });
  },
  'DELETE /api/body-scan/assessment': async (req, res) => {
    const u = (await getUser(req)) || { id: 0 };
    let id = req.url.includes('id=') ? new URL(req.url, 'http://localhost').searchParams.get('id') : null;
    if (!id) {
      const body = await readBody(req);
      id = body && body.id;
    }
    if (!id) return json(res, 400, { error: 'Missing assessment id' });
    await db.run('DELETE FROM body_assessments WHERE id=? AND (user_id=? OR user_id=0)', [id, u.id]);
    json(res, 200, { ok: true, success: true });
  },
  'POST /api/body-scan/analyze': async (req, res) => {
    const body = await readBody(req);
    const { goal, preferences, images } = body || {};
    try {
      const result = await generateBodyTransformationAnalysis(goal, preferences, images);
      json(res, 200, { ok: true, analysis: result });
    } catch (err) {
      json(res, 500, { ok: false, error: 'Analysis failed: ' + err.message });
    }
  },

  /* ---------- data erasure & account deletion ---------- */
  'POST /api/user/erase-data': async (req, res) => {
    const u = await getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    const tables = ['log_entries', 'water', 'custom_foods', 'plans', 'weights', 'workouts_done', 'saved_plans', 'activity_sessions', 'posture_sessions', 'body_assessments'];
    const statements = tables.map(t => ({ sql: 'DELETE FROM ' + t + ' WHERE user_id=?', args: [u.id] }));
    await db.batch(statements);
    json(res, 200, { ok: true, message: 'All user data erased successfully' });
  },
  'POST /api/user/delete-account': async (req, res) => {
    const u = await getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    const tables = ['sessions', 'profile', 'log_entries', 'water', 'custom_foods', 'plans', 'settings', 'weights', 'workouts_done', 'saved_plans', 'activity_sessions', 'posture_sessions', 'body_assessments'];
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
    const adminSecret = process.env.ADMIN_SECRET;
    if (adminSecret && secret === adminSecret) {
      await db.run('UPDATE users SET is_admin=1 WHERE id=?', [u.id]);
      return json(res, 200, { ok: true });
    }
    json(res, 403, { error: 'Invalid admin secret' });
  },
  'POST /api/ai/chat': async (req, res) => {
    const body = await readBody(req);
    const { prompt, systemPrompt, messages, geminiKey: userGeminiKey, openRouterKey: userOpenRouterKey } = body || {};

    const isJson = (systemPrompt && systemPrompt.toLowerCase().includes('json')) || (prompt && prompt.toLowerCase().includes('json'));

    const baseSystemPrompt = systemPrompt || 'You are FitFuel AI Coach — an elite sports nutritionist and strength coach. Provide direct, dynamic, customized advice tailored specifically to the user. Never use emojis anywhere in your output. Use clean markdown formatting.';

    const incomingImages = Array.isArray(body.images)
      ? body.images
      : (body.images && typeof body.images === 'object' ? Object.values(body.images) : []);
    const allImages = [body.image, ...incomingImages].filter(Boolean);

    // Format messages for OpenAI / OpenRouter standard
    let chatMessages = [];
    if (Array.isArray(messages) && messages.length > 0) {
      chatMessages.push({ role: 'system', content: baseSystemPrompt });
      chatMessages = chatMessages.concat(messages.map(m => ({
        role: m.role === 'assistant' || m.role === 'bot' ? 'assistant' : 'user',
        content: stripEmojis(m.content || m.text || '')
      })));
      if (prompt && (!messages.length || (messages[messages.length - 1].content !== prompt && messages[messages.length - 1].text !== prompt))) {
        if (allImages.length > 0) {
          chatMessages.push({
            role: 'user',
            content: [
              { type: 'text', text: stripEmojis(prompt) },
              ...allImages.map(img => ({ type: 'image_url', image_url: { url: img } }))
            ]
          });
        } else {
          chatMessages.push({ role: 'user', content: stripEmojis(prompt) });
        }
      }
    } else {
      if (allImages.length > 0) {
        chatMessages = [
          { role: 'system', content: baseSystemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: stripEmojis(prompt || 'Analyze this image in detail for fitness, nutrition or physique body composition.') },
              ...allImages.map(img => ({ type: 'image_url', image_url: { url: img } }))
            ]
          }
        ];
      } else {
        chatMessages = [
          { role: 'system', content: baseSystemPrompt },
          { role: 'user', content: stripEmojis(prompt || 'Hello') }
        ];
      }
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
            .map(m => {
              const parts = [];
              if (typeof m.content === 'string') {
                parts.push({ text: m.content });
              } else if (Array.isArray(m.content)) {
                for (const part of m.content) {
                  if (part.type === 'text') parts.push({ text: part.text });
                  else if (part.type === 'image_url' && part.image_url?.url?.startsWith('data:')) {
                    const match = part.image_url.url.match(/^data:([^;]+);base64,(.+)$/);
                    if (match) {
                      parts.push({
                        inlineData: {
                          mimeType: match[1],
                          data: match[2]
                        }
                      });
                    }
                  }
                }
              }
              return {
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: parts.length > 0 ? parts : [{ text: 'Please assist.' }]
              };
            });

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
              return json(res, 200, { ok: true, provider: 'google-gemini', model: gModel, content: formatOutputContent(text, isJson) });
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
            return json(res, 200, { ok: true, provider: 'openrouter', model: resData.model, content: formatOutputContent(resData.content, isJson) });
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
            return json(res, 200, { ok: true, provider: 'openrouter', model: resData.model, content: formatOutputContent(resData.content, isJson) });
          }
        } catch (e) {}
      }
    }

    // 3. Fallback Handling
    if (isJson) {
      if (prompt && (prompt.toLowerCase().includes('body composition') || prompt.toLowerCase().includes('4d') || prompt.toLowerCase().includes('physique') || prompt.toLowerCase().includes('demanding weight') || prompt.toLowerCase().includes('target weight'))) {
        return json(res, 200, { ok: true, provider: 'fitfuel-calc-engine', model: 'fitfuel-bodycomp-engine', content: generateDynamicBodyCompJson(prompt) });
      }
      if (prompt && (prompt.toLowerCase().includes('food item') || prompt.toLowerCase().includes('meal description') || prompt.toLowerCase().includes('portiongrams'))) {
        return json(res, 200, { ok: true, provider: 'fitfuel-calc-engine', model: 'fitfuel-nutrition-math', content: generateDynamicFoodJson(prompt) });
      }
      return json(res, 200, { ok: true, provider: 'fitfuel-calc-engine', model: 'fitfuel-metabolic-math', content: generateDynamicPlanJson(prompt) });
    }

    if (allImages.length > 0) {
      return json(res, 200, {
        ok: true,
        provider: 'fitfuel-vision-engine',
        model: 'fitfuel-visual-coach',
        content: generateDynamicCoachVisionText(prompt)
      });
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

function formatOutputContent(raw, isJson) {
  if (!raw || typeof raw !== 'string') return '';
  let text = stripEmojis(raw).trim();
  if (isJson) {
    let cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const s = cleanJson.indexOf('{');
    const e = cleanJson.lastIndexOf('}');
    if (s !== -1 && e !== -1 && e > s) {
      const candidate = cleanJson.slice(s, e + 1);
      try {
        JSON.parse(candidate);
        return candidate;
      } catch (_) {}
    }
  }
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

function generateDynamicBodyCompJson(prompt = '') {
  const lower = (prompt || '').toLowerCase();
  const curMatch = prompt.match(/current[_\s]?weight:\s*(\d+(\.\d+)?)/i) || prompt.match(/weight:\s*(\d+(\.\d+)?)/i);
  const curW = curMatch ? parseFloat(curMatch[1]) : 72;
  const demMatch = prompt.match(/(?:demanding|target)[_\s]?weight:\s*(\d+(\.\d+)?)/i);
  const targetW = demMatch ? parseFloat(demMatch[1]) : (lower.includes('muscle') || lower.includes('gain') ? curW + 4 : curW - 5);
  const hMatch = prompt.match(/height:\s*(\d+(\.\d+)?)/i);
  const hCm = hMatch ? parseFloat(hMatch[1]) : 178;
  const isFemale = lower.includes('female') || lower.includes('gender: f') || lower.includes('gender: female');

  let goal = 'lose_fat';
  if (lower.includes('gain muscle') || lower.includes('muscle_gain') || lower.includes('gain') || lower.includes('bulk')) {
    goal = 'gain_muscle';
  } else if (lower.includes('recomp') || lower.includes('maintain') || lower.includes('recomposition')) {
    goal = 'recomp';
  }

  const bmi = parseFloat((curW / Math.pow(hCm / 100, 2)).toFixed(1));

  let bodyFat = isFemale ? 22.5 : 15.8;
  if (bmi > 25) bodyFat += (bmi - 25) * 1.2;
  if (bmi < 21) bodyFat -= (21 - bmi) * 0.9;
  bodyFat = Math.max(8, Math.min(42, parseFloat(bodyFat.toFixed(1))));

  const fatMass = parseFloat((curW * (bodyFat / 100)).toFixed(1));
  const muscleMass = parseFloat((curW - fatMass).toFixed(1));
  const waterPct = parseFloat((isFemale ? 55 : 61.5 - (bodyFat * 0.2)).toFixed(1));
  const visceralFat = bodyFat > 24 ? 8 : (bodyFat > 18 ? 5 : 3);

  let timelineWeeks = 8;
  let timelineText = '8 weeks (~2 months)';
  let weeklyRate = '0.5 kg / week';

  if (goal === 'lose_fat') {
    const diff = Math.max(1, curW - targetW);
    timelineWeeks = Math.max(2, Math.round(diff / 0.5));
    timelineText = `${timelineWeeks} weeks (~${(timelineWeeks / 4.3).toFixed(1)} months)`;
    weeklyRate = '0.5 - 0.7 kg fat reduction / week';
  } else if (goal === 'gain_muscle') {
    const diff = Math.max(1, targetW - curW);
    timelineWeeks = Math.max(4, Math.round(diff / 0.22));
    timelineText = `${timelineWeeks} weeks (~${(timelineWeeks / 4.3).toFixed(1)} months)`;
    weeklyRate = '0.2 - 0.25 kg lean hypertrophy / week';
  } else {
    timelineWeeks = 12;
    timelineText = '10 - 14 weeks (~3 months)';
    weeklyRate = 'Body recomposition (1:1 adipose reduction to lean accretion)';
  }

  const bmr = isFemale
    ? Math.round(10 * curW + 6.25 * hCm - 5 * 26 - 161)
    : Math.round(10 * curW + 6.25 * hCm - 5 * 26 + 5);
  const tdee = Math.round(bmr * 1.45);
  let calories = tdee;
  if (goal === 'lose_fat') calories = Math.round(tdee - 480);
  else if (goal === 'gain_muscle') calories = Math.round(tdee + 320);

  const protein = Math.round(curW * (goal === 'lose_fat' ? 2.1 : 2.2));
  const fats = Math.round(curW * 0.85);
  const carbs = Math.max(90, Math.round((calories - (protein * 4 + fats * 9)) / 4));
  const waterL = Math.max(2.6, parseFloat((curW * 0.038).toFixed(1)));

  return JSON.stringify({
    metrics: {
      currentWeight: curW,
      targetWeight: targetW,
      heightCm: hCm,
      bmi: bmi,
      estimatedBodyFat: bodyFat,
      leanMuscleMassKg: muscleMass,
      fatMassKg: fatMass,
      bodyWaterPct: waterPct,
      visceralFatScore: visceralFat,
      metabolicAge: Math.max(19, Math.round(26 + (bodyFat - 15) * 0.6))
    },
    goal: {
      type: goal,
      label: goal === 'lose_fat' ? 'Lose Fat (Cut & Definition)' : (goal === 'gain_muscle' ? 'Gain Muscle (Hypertrophy)' : 'Body Recomposition (Maintain & Shred)'),
      weightDeltaKg: parseFloat((targetW - curW).toFixed(1)),
      timelineWeeks: timelineWeeks,
      timelineDisplay: timelineText,
      projectedWeeklyRate: weeklyRate
    },
    nutrition: {
      targetCalories: calories,
      proteinGrams: protein,
      carbsGrams: carbs,
      fatsGrams: fats,
      waterLiters: waterL
    },
    observations4D: {
      front: 'Good clavicle structure with balanced shoulder breadth. Core engagement shows early rectus abdominis definition with moderate midsection subcutaneous adipose.',
      back: 'V-taper trajectory visible from posterior view. Latissimus dorsi insertions are balanced with strong rhomboid and lower trapezius foundation.',
      leftSide: 'Neutral pelvic tilt with solid spinal posture. Thoracic curvature is within optimal limits with minimal anterior pelvic shift.',
      rightSide: 'Lateral posture shows balanced quad sweep and hamstring alignment. Core wall tension holds lumbar spine in healthy neutral extension.'
    },
    roadmap: [
      `Phase 1 (Weeks 1-${Math.max(2, Math.round(timelineWeeks * 0.4))}): Baseline adaptation, adhere to ${calories} kcal and ${protein}g protein daily.`,
      `Phase 2 (Weeks ${Math.max(3, Math.round(timelineWeeks * 0.4) + 1)}-${Math.max(4, Math.round(timelineWeeks * 0.8))}): Progressive resistance overload across 4 sessions weekly with 8,000 steps daily.`,
      `Phase 3 (Weeks ${Math.max(5, Math.round(timelineWeeks * 0.8) + 1)}-${timelineWeeks}): Peak calibration to reach target weight of ${targetW} kg with optimal muscle retention.`
    ]
  }, null, 2);
}

async function generateBodyTransformationAnalysis(goal = 'lean_athletic', preferences = {}, images = {}) {
  const age = Number(preferences.age) || 26;
  const isMinor = age < 18;
  const exp = preferences.experience || 'intermediate';
  const activity = preferences.activity || 'moderate';
  const curW = Number(preferences.weight) || 72;
  const hCm = Number(preferences.height) || 178;
  const daysPerWeek = Number(preferences.daysPerWeek) || 4;
  const durationMin = Number(preferences.durationMin) || 45;
  const equipment = preferences.equipment || 'gym';
  const dietary = preferences.dietary || 'balanced';
  const allergies = preferences.allergies || 'none';
  const limitations = preferences.limitations || 'none';
  const customGoalText = preferences.customGoalText || '';

  const bmi = parseFloat((curW / Math.pow(hCm / 100, 2)).toFixed(1));
  let estimatedBf = 16.5;
  if (bmi > 25) estimatedBf += (bmi - 25) * 1.1;
  if (bmi < 21) estimatedBf -= (21 - bmi) * 0.8;
  estimatedBf = Math.max(9, Math.min(38, parseFloat(estimatedBf.toFixed(1))));

  const fatMass = parseFloat((curW * (estimatedBf / 100)).toFixed(1));
  const leanMass = parseFloat((curW - fatMass).toFixed(1));

  const goalMap = {
    'lean_athletic': {
      title: 'Lean & Athletic Conditioning',
      desc: 'Sustainable fitness, functional athletic power, core definition and conditioning.',
      calMod: -150,
      proteinMul: 2.0,
      focus: 'HYBRID ATHLETIC · POWER & CONDITIONING'
    },
    'muscle_building': {
      title: 'Hypertrophic Muscle Building',
      desc: 'Progressive mechanical tension, muscular growth, recovery and protein synthesis.',
      calMod: isMinor ? 150 : 320,
      proteinMul: 2.2,
      focus: 'HYPERTROPHY · PROGRESSIVE OVERLOAD · COMPOUND LIFTS'
    },
    'fat_loss': {
      title: 'Sustainable Fat Loss & Definition',
      desc: 'Moderate caloric deficit, high-protein retention, metabolic density and movement.',
      calMod: isMinor ? -150 : -420,
      proteinMul: 2.1,
      focus: 'METABOLIC CONDITIONING · PRESERVE LEAN TISSUE'
    },
    'strength_performance': {
      title: 'Strength & Biomechanical Performance',
      desc: 'Neuromuscular efficiency, technical mastery, submaximal strength progression.',
      calMod: 200,
      proteinMul: 2.0,
      focus: 'NEURAL DRIVE · MAXIMUM RECRUITMENT · STRENGTH'
    },
    'balanced_fitness': {
      title: 'Balanced Longevity & Fitness',
      desc: 'Whole-body strength, cardiovascular stamina, joint mobility and sustainable habits.',
      calMod: 0,
      proteinMul: 1.8,
      focus: 'FULL BODY VITALITY · CARDIO & MOBILITY INTEGRATION'
    },
    'custom': {
      title: customGoalText ? `Custom: ${customGoalText.slice(0, 40)}` : 'Personalized Custom Physique Target',
      desc: customGoalText || 'Custom user-specified physique target and fitness goals.',
      calMod: 0,
      proteinMul: 2.0,
      focus: 'CUSTOM ADAPTATION · USER SPECIFIED GOAL'
    }
  };

  const gInfo = goalMap[goal] || goalMap['lean_athletic'];

  const bmr = Math.round(10 * curW + 6.25 * hCm - 5 * age + 5);
  const tdee = Math.round(bmr * 1.45);
  const targetCalories = Math.max(1600, tdee + gInfo.calMod);
  const proteinGrams = Math.round(curW * gInfo.proteinMul);
  const fatsGrams = Math.round(curW * 0.85);
  const carbsGrams = Math.max(100, Math.round((targetCalories - (proteinGrams * 4 + fatsGrams * 9)) / 4));
  const waterLiters = Math.max(2.5, parseFloat((curW * 0.038).toFixed(1)));

  const movesDatabase = {
    upper: [
      { name: 'Incline Dumbbell Bench Press', target: 'Upper Chest & Front Delts', sets: '3-4 sets', reps: '8-10 reps', rest: '90s', cue: '30-degree bench incline, control descent for 2 seconds, drive up with chest contraction', substitute: 'Push-Ups or Machine Chest Press' },
      { name: 'Neutral-Grip Lat Pulldown / Pull-Up', target: 'Latissimus Dorsi & Biceps', sets: '3 sets', reps: '10-12 reps', rest: '75s', cue: 'Drive elbows towards hips, hold 1s squeeze at full contraction', substitute: 'Resistance Band Pulldown' },
      { name: 'Overhead Dumbbell Shoulder Press', target: 'Anterior & Medial Deltoids', sets: '3 sets', reps: '10-12 reps', rest: '75s', cue: 'Brace core, press in slight arc without arching lower back', substitute: 'Pike Push-Ups or Seated DB Press' },
      { name: 'Cable / Dumbbell Lateral Raise', target: 'Lateral Deltoids', sets: '3 sets', reps: '12-15 reps', rest: '60s', cue: 'Lead with elbows, pause at shoulder height, avoid shrugging traps', substitute: 'Band Lateral Raise' }
    ],
    lower: [
      { name: 'Goblet Squat or Barbell Back Squat', target: 'Quadriceps, Glutes & Adductors', sets: '3-4 sets', reps: '8-10 reps', rest: '120s', cue: 'Break at knees and hips together, keep chest upright, knees tracking toes', substitute: 'Bodyweight Box Squat' },
      { name: 'Romanian Deadlift (RDL)', target: 'Hamstrings & Glute Max', sets: '3 sets', reps: '8-10 reps', rest: '90s', cue: 'Hinge back at the hips with soft knees, feel deep hamstring stretch', substitute: 'Dumbbell Good Mornings' },
      { name: 'Walking Dumbbell Lunges', target: 'Quads, Glutes & Dynamic Stability', sets: '3 sets', reps: '10 reps / leg', rest: '75s', cue: 'Step forward smoothly, lower trailing knee to 1 inch off floor', substitute: 'Reverse Static Lunges' },
      { name: 'Standing Calf Raise', target: 'Gastrocnemius & Soleus', sets: '3 sets', reps: '15 reps', rest: '60s', cue: 'Full 2-second stretch at bottom, explode up onto big toes', substitute: 'Single-Leg Bodyweight Calf Raise' }
    ],
    push: [
      { name: 'Flat Dumbbell / Barbell Bench Press', target: 'Sternal Pectoralis & Triceps', sets: '4 sets', reps: '6-8 reps', rest: '90s', cue: 'Squeeze shoulder blades back into bench, press smoothly without flaring elbows', substitute: 'Push-Ups on Handles' },
      { name: 'Standing Overhead Military Press', target: 'Deltoids & Upper Trapezius', sets: '3 sets', reps: '8-10 reps', rest: '90s', cue: 'Lock glutes and abs tight, clear chin and lock overhead', substitute: 'Dumbbell Arnold Press' },
      { name: 'Incline Dumbbell Flye', target: 'Pectoralis Minor & Outer Chest', sets: '3 sets', reps: '12-15 reps', rest: '60s', cue: 'Keep slight bend in elbows, feel stretch across chest wall', substitute: 'Cable Crossover' },
      { name: 'Overhead Rope Triceps Extension', target: 'Triceps Long Head', sets: '3 sets', reps: '12-15 reps', rest: '60s', cue: 'Flare rope ends apart at full elbow extension', substitute: 'Bench Dips' }
    ],
    pull: [
      { name: 'Chest-Supported Row / Barbell Row', target: 'Rhomboids, Middle Traps & Lats', sets: '4 sets', reps: '8-10 reps', rest: '90s', cue: 'Pull with elbows, retract shoulder blades with 1s pause', substitute: 'Inverted Bodyweight Row' },
      { name: 'Seated Cable Row / One-Arm DB Row', target: 'Lower Latissimus Dorsi', sets: '3 sets', reps: '10-12 reps', rest: '75s', cue: 'Maintain neutral spine, drive elbows straight back to hips', substitute: 'Resistance Band Seated Row' },
      { name: 'Incline Dumbbell Bicep Curl', target: 'Biceps Long Head', sets: '3 sets', reps: '10-12 reps', rest: '60s', cue: 'Let elbows hang back behind torso for maximum myofibrillar stretch', substitute: 'Standing EZ-Bar Curl' },
      { name: 'Face Pull with External Rotation', target: 'Rear Delts & Rotator Cuff', sets: '3 sets', reps: '15-20 reps', rest: '60s', cue: 'Pull hands toward temples, knuckles pointing behind ears', substitute: 'Band Pull-Apart' }
    ],
    legsCore: [
      { name: 'Bulgarian Split Squat', target: 'Glutes, Quads & Hip Stabilizers', sets: '3 sets', reps: '8-10 reps / leg', rest: '90s', cue: 'Torso angled slightly forward to shift load into working glute', substitute: 'Step-Ups on Bench' },
      { name: 'Lying or Seated Leg Curl', target: 'Hamstrings Knee Flexion', sets: '3 sets', reps: '12 reps', rest: '60s', cue: 'Control the release for 3 seconds, avoid jerking hip off pad', substitute: 'Stability Ball Hamstring Curl' },
      { name: 'Hanging Knee / Leg Raise', target: 'Lower Rectus Abdominis', sets: '3 sets', reps: '12-15 reps', rest: '60s', cue: 'Curl pelvis up towards sternum, avoid using hip flexor swing', substitute: 'Lying Floor Leg Raise' },
      { name: 'Pallof Press with Cable or Band', target: 'Anti-Rotation Core Stability', sets: '3 sets', reps: '10 reps / side', rest: '45s', cue: 'Resist trunk twist, press hands straight out from sternum', substitute: 'Side Plank Hold (30s)' }
    ],
    conditioning: [
      { name: 'Kettlebell / Dumbbell Swings', target: 'Posterior Kinetic Chain & Heart Rate', sets: '4 sets', reps: '15-20 reps', rest: '60s', cue: 'Snap hips forward with glute squeeze; do not squat the bell', substitute: 'Broad Jumps or Bodyweight Squat Jumps' },
      { name: 'Incline Treadmill Zone-2 Walk', target: 'Aerobic Base & Fat Oxidation', sets: '1 session', reps: '25-30 min', rest: 'None', cue: 'Incline 8-10%, speed 4.5-5.5 km/h, maintain conversational pace', substitute: 'Stationary Bike or Outdoor Rucking' },
      { name: 'Thoracic Extension & Cat-Cow Flow', target: 'Spinal Decompression & Mobility', sets: '3 sets', reps: '10 reps', rest: '30s', cue: 'Deep diaphragmatic breathing through full spinal flexion and extension', substitute: 'Foam Roller Upper Back Extension' }
    ]
  };

  // Normalize each move to have both camelCase and snake_case fields
  function normalizeMoves(movesList = []) {
    return movesList.map(m => ({
      name: m.name,
      exercise_name: m.name,
      target: m.target,
      sets: m.sets,
      reps: m.reps,
      rest: m.rest,
      rest_seconds: m.rest,
      cue: m.cue,
      biomechanical_form_cue: m.cue,
      substitute: m.substitute
    }));
  }

  const weeklySchedule = [];
  if (daysPerWeek <= 3) {
    weeklySchedule.push({ day: 'Day 1', day_number: 1, name: 'Full Body Compound A', day_title: 'Full Body Compound A', duration: `${durationMin} min`, focus: 'Quads, Chest, Back & Core', moves: normalizeMoves([movesDatabase.lower[0], movesDatabase.upper[0], movesDatabase.pull[0], movesDatabase.legsCore[2]]), exercises: normalizeMoves([movesDatabase.lower[0], movesDatabase.upper[0], movesDatabase.pull[0], movesDatabase.legsCore[2]]) });
    weeklySchedule.push({ day: 'Day 2', day_number: 2, name: 'Active Recovery & Mobility', day_title: 'Active Recovery & Mobility', duration: '30 min', focus: 'Low-intensity recovery, walking, thoracic mobility', moves: normalizeMoves([movesDatabase.conditioning[1], movesDatabase.conditioning[2]]), exercises: normalizeMoves([movesDatabase.conditioning[1], movesDatabase.conditioning[2]]) });
    weeklySchedule.push({ day: 'Day 3', day_number: 3, name: 'Full Body Compound B', day_title: 'Full Body Compound B', duration: `${durationMin} min`, focus: 'Hamstrings, Shoulders, Lats & Arms', moves: normalizeMoves([movesDatabase.lower[1], movesDatabase.upper[2], movesDatabase.pull[1], movesDatabase.push[3]]), exercises: normalizeMoves([movesDatabase.lower[1], movesDatabase.upper[2], movesDatabase.pull[1], movesDatabase.push[3]]) });
    weeklySchedule.push({ day: 'Day 4', day_number: 4, name: 'Rest & Nutrient Replenishment', day_title: 'Rest & Nutrient Replenishment', duration: '0 min', focus: 'Restorative sleep, hydration, cellular recovery', moves: [], exercises: [] });
    weeklySchedule.push({ day: 'Day 5', day_number: 5, name: 'Full Body Metabolic Circuit', day_title: 'Full Body Metabolic Circuit', duration: `${durationMin} min`, focus: 'Unilateral Legs, Upper Density & Conditioning', moves: normalizeMoves([movesDatabase.legsCore[0], movesDatabase.push[0], movesDatabase.pull[2], movesDatabase.conditioning[0]]), exercises: normalizeMoves([movesDatabase.legsCore[0], movesDatabase.push[0], movesDatabase.pull[2], movesDatabase.conditioning[0]]) });
    weeklySchedule.push({ day: 'Day 6', day_number: 6, name: 'Cardio & Core Flow', day_title: 'Cardio & Core Flow', duration: '30 min', focus: 'Zone 2 cardio and anti-rotational core', moves: normalizeMoves([movesDatabase.conditioning[1], movesDatabase.legsCore[3]]), exercises: normalizeMoves([movesDatabase.conditioning[1], movesDatabase.legsCore[3]]) });
    weeklySchedule.push({ day: 'Day 7', day_number: 7, name: 'Rest & Assessment Reflection', day_title: 'Rest & Assessment Reflection', duration: '0 min', focus: 'Rest and mental recalibration', moves: [], exercises: [] });
  } else if (daysPerWeek === 4) {
    weeklySchedule.push({ day: 'Day 1', day_number: 1, name: 'Upper Body Power', day_title: 'Upper Body Power', duration: `${durationMin} min`, focus: 'Chest, Shoulders & Upper Back', moves: normalizeMoves(movesDatabase.upper), exercises: normalizeMoves(movesDatabase.upper) });
    weeklySchedule.push({ day: 'Day 2', day_number: 2, name: 'Lower Body Strength', day_title: 'Lower Body Strength', duration: `${durationMin} min`, focus: 'Quads, Hamstrings & Calves', moves: normalizeMoves(movesDatabase.lower), exercises: normalizeMoves(movesDatabase.lower) });
    weeklySchedule.push({ day: 'Day 3', day_number: 3, name: 'Active Recovery & Zone-2 Cardio', day_title: 'Active Recovery & Zone-2 Cardio', duration: '30 min', focus: 'Walking, tissue flushing & mobility', moves: normalizeMoves([movesDatabase.conditioning[1], movesDatabase.conditioning[2]]), exercises: normalizeMoves([movesDatabase.conditioning[1], movesDatabase.conditioning[2]]) });
    weeklySchedule.push({ day: 'Day 4', day_number: 4, name: 'Upper Body Hypertrophy', day_title: 'Upper Body Hypertrophy', duration: `${durationMin} min`, focus: 'Lats, Triceps, Deltoid Width & Arms', moves: normalizeMoves([movesDatabase.push[0], movesDatabase.pull[0], movesDatabase.upper[3], movesDatabase.pull[2]]), exercises: normalizeMoves([movesDatabase.push[0], movesDatabase.pull[0], movesDatabase.upper[3], movesDatabase.pull[2]]) });
    weeklySchedule.push({ day: 'Day 5', day_number: 5, name: 'Lower Body & Core Hypertrophy', day_title: 'Lower Body & Core Hypertrophy', duration: `${durationMin} min`, focus: 'Unilateral Legs, Posterior Chain & Abs', moves: normalizeMoves([movesDatabase.legsCore[0], movesDatabase.legsCore[1], movesDatabase.legsCore[2], movesDatabase.legsCore[3]]), exercises: normalizeMoves([movesDatabase.legsCore[0], movesDatabase.legsCore[1], movesDatabase.legsCore[2], movesDatabase.legsCore[3]]) });
    weeklySchedule.push({ day: 'Day 6', day_number: 6, name: 'Cardio & Core Flow', day_title: 'Cardio & Core Flow', duration: '25 min', focus: 'Metabolic density and core stability', moves: normalizeMoves([movesDatabase.conditioning[0], movesDatabase.conditioning[1]]), exercises: normalizeMoves([movesDatabase.conditioning[0], movesDatabase.conditioning[1]]) });
    weeklySchedule.push({ day: 'Day 7', day_number: 7, name: 'Deep Rest & Sleep Recovery', day_title: 'Deep Rest & Sleep Recovery', duration: '0 min', focus: 'Rest, muscle protein synthesis', moves: [], exercises: [] });
  } else {
    weeklySchedule.push({ day: 'Day 1', day_number: 1, name: 'Push (Chest, Shoulders, Triceps)', day_title: 'Push (Chest, Shoulders, Triceps)', duration: `${durationMin} min`, focus: 'Anterior chain pressing & lockouts', moves: normalizeMoves(movesDatabase.push), exercises: normalizeMoves(movesDatabase.push) });
    weeklySchedule.push({ day: 'Day 2', day_number: 2, name: 'Pull (Back, Lats, Rear Delts, Biceps)', day_title: 'Pull (Back, Lats, Rear Delts, Biceps)', duration: `${durationMin} min`, focus: 'Posterior kinetic chain and vertical/horizontal pulls', moves: normalizeMoves(movesDatabase.pull), exercises: normalizeMoves(movesDatabase.pull) });
    weeklySchedule.push({ day: 'Day 3', day_number: 3, name: 'Legs & Core Conditioning', day_title: 'Legs & Core Conditioning', duration: `${durationMin} min`, focus: 'Knee flexion, hip hinge and intra-abdominal stability', moves: normalizeMoves(movesDatabase.lower), exercises: normalizeMoves(movesDatabase.lower) });
    weeklySchedule.push({ day: 'Day 4', day_number: 4, name: 'Upper Body Sculpt & Biomechanics', day_title: 'Upper Body Sculpt & Biomechanics', duration: `${durationMin} min`, focus: 'Shoulder cap, clavicular fibers and arm density', moves: normalizeMoves(movesDatabase.upper), exercises: normalizeMoves(movesDatabase.upper) });
    weeklySchedule.push({ day: 'Day 5', day_number: 5, name: 'Lower Body Posterior & Unilateral', day_title: 'Lower Body Posterior & Unilateral', duration: `${durationMin} min`, focus: 'Hamstrings, glute max, unilateral balance', moves: normalizeMoves(movesDatabase.legsCore), exercises: normalizeMoves(movesDatabase.legsCore) });
    weeklySchedule.push({ day: 'Day 6', day_number: 6, name: 'Active Conditioning & Cardio', day_title: 'Active Conditioning & Cardio', duration: '35 min', focus: 'Zone-2 aerobic capacity and joint mobility', moves: normalizeMoves(movesDatabase.conditioning), exercises: normalizeMoves(movesDatabase.conditioning) });
    weeklySchedule.push({ day: 'Day 7', day_number: 7, name: 'Rest & Recovery Protocol', day_title: 'Rest & Recovery Protocol', duration: '0 min', focus: 'Full rest and myofibrillar repair', moves: [], exercises: [] });
  }

  let mealExamples = [];
  if (dietary === 'vegetarian') {
    mealExamples = [
      { meal: 'Breakfast', name: 'Paneer & Sprouted Moong Scramble with Whole Wheat Toast', macros: '450 kcal · 28g P · 48g C · 14g F' },
      { meal: 'Lunch', name: 'High-Protein Soya Chunks Curry, Brown Rice & Spinach Salad', macros: '620 kcal · 42g P · 74g C · 12g F' },
      { meal: 'Snack', name: 'Low-Fat Greek Yogurt or Hung Curd with Flaxseeds & Walnuts', macros: '260 kcal · 20g P · 18g C · 10g F' },
      { meal: 'Dinner', name: 'Tofu / Paneer Tikka with Roasted Veggies & Yellow Lentil Dal', macros: '520 kcal · 35g P · 42g C · 18g F' }
    ];
  } else if (dietary === 'vegan') {
    mealExamples = [
      { meal: 'Breakfast', name: 'Tofu Bhurji Scramble with Nutritional Yeast & Multigrain Toast', macros: '420 kcal · 26g P · 46g C · 12g F' },
      { meal: 'Lunch', name: 'Tempeh / Chickpea Quinoa Bowl with Sautéed Broccoli & Tahini', macros: '610 kcal · 38g P · 70g C · 16g F' },
      { meal: 'Snack', name: 'Pea Protein Shake with Unsweetened Almond Milk & Chia Seeds', macros: '240 kcal · 27g P · 12g C · 6g F' },
      { meal: 'Dinner', name: 'Lentil & Seitan Vegetable Stew with Lemon-Dressed Field Greens', macros: '510 kcal · 40g P · 48g C · 13g F' }
    ];
  } else {
    mealExamples = [
      { meal: 'Breakfast', name: 'Farm Eggs, Egg White Omelet & Rolled Oatmeal with Berries', macros: '480 kcal · 36g P · 44g C · 14g F' },
      { meal: 'Lunch', name: 'Herb-Grilled Chicken Breast, Steamed Basmati Rice & Dal', macros: '640 kcal · 52g P · 68g C · 12g F' },
      { meal: 'Snack', name: 'Whey Protein Isolate with 15 Raw Almonds & Apple Slices', macros: '260 kcal · 28g P · 18g C · 8g F' },
      { meal: 'Dinner', name: 'Tandoori Salmon or Lean Fish Fillet with Asparagus & Sweet Potato', macros: '520 kcal · 44g P · 38g C · 15g F' }
    ];
  }

  const assessmentSummary = `Complete 4-view physique scan evaluated for goal: ${gInfo.title}. Biomechanical analysis demonstrates solid kinetic foundation with balanced bilateral symmetry. Personalized ${daysPerWeek}-day training split and ${targetCalories} kcal nutritional blueprint prepared for progressive, injury-free body transformation.`;

  const postureObs = {
    head: 'Neutral cervical spine alignment with slight forward translation within safe functional limits.',
    apparent_head_position: 'Neutral cervical spine alignment with slight forward translation within safe functional limits.',
    apparentHeadPosition: 'Neutral cervical spine alignment with slight forward translation within safe functional limits.',
    shoulders: 'Biacromial line is horizontal with symmetrical clavicle orientation; no prominent unleveling observed.',
    visible_shoulder_alignment: 'Biacromial line is horizontal with symmetrical clavicle orientation; no prominent unleveling observed.',
    visibleShoulderAlignment: 'Biacromial line is horizontal with symmetrical clavicle orientation; no prominent unleveling observed.',
    symmetry: 'Upper torso shows balanced left-to-right lateral development across deltoids and arm musculature.',
    leftVsRightSymmetry: 'Upper torso shows balanced left-to-right lateral development across deltoids and arm musculature.',
    left_vs_right_symmetry: 'Upper torso shows balanced left-to-right lateral development across deltoids and arm musculature.',
    trunk: 'Upright coronal alignment with good ribcage position and natural thoracic kyphotic contour.',
    coronalTrunk: 'Upright coronal alignment with good ribcage position and natural thoracic kyphotic contour.',
    coronal_trunk_alignment: 'Upright coronal alignment with good ribcage position and natural thoracic kyphotic contour.',
    hipsAndKnees: 'Pelvic crests appear balanced in sagittal view; knee extension shows stable patellar tracking.',
    hip_and_knee_positioning: 'Pelvic crests appear balanced in sagittal view; knee extension shows stable patellar tracking.',
    stance: 'Even bilateral foot pressure distribution with stable center-of-gravity grounding.',
    generalStance: 'Even bilateral foot pressure distribution with stable center-of-gravity grounding.',
    general_stance_and_balance: 'Even bilateral foot pressure distribution with stable center-of-gravity grounding.'
  };

  const alignmentConcerns = [
    'Mild tendency for forward head posture during prolonged static sitting; recommend thoracic extension mobility.',
    'Slightly tighter internal shoulder rotators; incorporate band face-pulls and doorway pectoral stretches.',
    'Pelvic stability is sound, but glute activation drills prior to heavy compound lifts will enhance hip mechanics.'
  ];

  const estimatedPhysical = {
    estimated_body_fat_range: `${estimatedBf}%`,
    estimatedBodyFatPercentage: `${estimatedBf}%`,
    estimated_lean_muscle_mass: `${leanMass} kg`,
    estimatedLeanMuscleMass: `${leanMass} kg`,
    estimated_adipose_tissue_mass: `${fatMass} kg`,
    estimatedFatMass: `${fatMass} kg`,
    fitness_category: estimatedBf < 14 ? 'Athletic Defined Range' : (estimatedBf < 20 ? 'Healthy Athletic Range' : 'Moderate Adipose Range'),
    fitnessCategory: estimatedBf < 14 ? 'Athletic Defined Range' : (estimatedBf < 20 ? 'Healthy Athletic Range' : 'Moderate Adipose Range')
  };

  const trainingStructure = {
    methodology: gInfo.focus,
    weekly_split: `${daysPerWeek} Days / Week`,
    weeklyStructure: `${daysPerWeek} training days / week, ${durationMin} minutes per session`,
    session_duration_minutes: durationMin,
    exercise_intensity: 'Progressive Overload (RPE 7.5–8.5)',
    intensity: 'RPE 7-8.5 across compound movements; leave 1-2 reps in reserve for optimal central nervous system recovery.',
    progressiveOverloadGuidance: 'Add 1-2.5 kg to barbell/dumbbell lifts or 1 extra repetition per set each week while maintaining strict technical execution.',
    progressive_overload_guidance: 'Add 1-2.5 kg to barbell/dumbbell lifts or 1 extra repetition per set each week while maintaining strict technical execution.'
  };

  const nutriGuide = {
    dailyCalories: targetCalories,
    daily_calories: targetCalories,
    proteinGrams: proteinGrams,
    daily_protein_grams: proteinGrams,
    carbsGrams: carbsGrams,
    daily_carbohydrates_grams: carbsGrams,
    fatsGrams: fatsGrams,
    daily_fats_grams: fatsGrams,
    hydrationLiters: waterLiters,
    daily_water_liters: waterLiters,
    dietaryPreference: dietary,
    allergiesNoted: allergies,
    mealExamples: mealExamples,
    sample_daily_meals: mealExamples.map(m => ({ meal_name: m.meal, description: `${m.name} (${m.macros})` })),
    guidelines: [
      `Distribute ${proteinGrams}g of protein evenly across 3-4 meals to maximize muscle protein synthesis.`,
      `Consume complex carbohydrates (oats, rice, sweet potatoes) 90-120 minutes prior to training for glycogen density.`,
      `Maintain minimum ${waterLiters}L hydration daily to preserve cell volumization and intracellular nutrient transport.`,
      isMinor ? 'Safety note: Growing adolescents must not undergo aggressive energy restriction; prioritize balanced whole foods.' : 'Consistent caloric tracking ensures predictable weekly physique adjustments.'
    ],
    nutrition_rules: [
      `Distribute ${proteinGrams}g of protein evenly across 3-4 meals to maximize muscle protein synthesis.`,
      `Consume complex carbohydrates (oats, rice, sweet potatoes) 90-120 minutes prior to training for glycogen density.`,
      `Maintain minimum ${waterLiters}L hydration daily to preserve cell volumization and intracellular nutrient transport.`,
      isMinor ? 'Safety note: Growing adolescents must not undergo aggressive energy restriction; prioritize balanced whole foods.' : 'Consistent caloric tracking ensures predictable weekly physique adjustments.'
    ]
  };

  const recoveryRecs = {
    sleepTargetHours: '7.5 to 8.5 hours of restorative sleep nightly',
    restorative_sleep_hours: '7.5 to 8.5 hours nightly',
    sleepHygieneCues: [
      'Maintain a dark, cool sleeping environment (~19°C / 66°F).',
      'Avoid screens and blue light 45 minutes before sleep to optimize endogenous melatonin secretion.',
      'Stop caffeine consumption at least 8 hours prior to your target bedtime.'
    ],
    sleep_hygiene_rules: [
      'Maintain a dark, cool sleeping environment (~19°C / 66°F).',
      'Avoid screens and blue light 45 minutes before sleep to optimize endogenous melatonin secretion.',
      'Stop caffeine consumption at least 8 hours prior to your target bedtime.'
    ],
    recoveryProtocols: [
      'Foam roll calves, thoracic spine, and hip flexors for 5 minutes post-workout.',
      'Incorporate 10-15 minutes of dynamic contrast showers or hot sauna where available.',
      'Schedule a complete deload week every 6-8 weeks of progressive training.'
    ],
    progress_tracking_schedule: [
      'Log morning bodyweight 3-4 times per week fasted and track the median.',
      'Measure waist circumference at navel level once every 2 weeks.',
      'Standardize progress photo lighting, time of day, and posture angles.'
    ]
  };

  const disclaimer = 'Non-medical disclaimer: This assessment is an automated computer-vision and anthropometric estimation derived from user-submitted 2D photographs. It does not constitute medical diagnosis, clinical posture evaluation, or diagnostic spinal screening. Measurements of body fat and muscle distribution are estimates based on standard biometrics. If you experience discomfort, dizziness, or pain, discontinue exercise and consult a qualified healthcare physician.';

  return {
    assessmentSummary,
    summary: assessmentSummary,
    postureObservations: postureObs,
    posture_observations: postureObs,
    possibleAlignmentConcerns: alignmentConcerns,
    possible_alignment_considerations: alignmentConcerns,
    areasRequiringFurtherAssessment: [
      'Dynamic single-leg landing biomechanics and ankle dorsiflexion mobility under full barbell loading.',
      'Active scapular upward rotation during overhead pressing (best evaluated in active motion rather than static photos).',
      'Individual joint range of motion: if experiencing pain, consult a licensed physiotherapist.'
    ],
    userSelectedGoal: {
      id: goal,
      title: gInfo.title,
      description: gInfo.desc
    },
    physique_goal: gInfo.title,
    goalCategory: gInfo.title,
    recommendedTrainingApproach: trainingStructure,
    training_structure: trainingStructure,
    progressive_overload_guidance: trainingStructure.progressiveOverloadGuidance,
    estimatedPhysicalCharacteristics: estimatedPhysical,
    estimated_physical_characteristics: estimatedPhysical,
    weeklyWorkoutSchedule: weeklySchedule,
    workoutSplit: weeklySchedule,
    days: weeklySchedule,
    exerciseRecommendations: [
      movesDatabase.upper[0],
      movesDatabase.lower[0],
      movesDatabase.pull[0],
      movesDatabase.push[1]
    ],
    cardioAndDailyActivity: {
      dailyStepsTarget: goal === 'fat_loss' ? '9,000 - 11,000 steps daily' : '7,500 - 8,500 steps daily',
      cardioType: 'Low-impact Zone-2 incline treadmill walking or outdoor brisk walk',
      frequency: '3-4 sessions per week (20-30 mins)',
      heartRateZone: 'Zone 2 (60-70% of maximum heart rate)',
      timing: 'Post-workout or morning fasted for optimal lipid oxidation without hindering hypertrophy'
    },
    nutritionGuidance: nutriGuide,
    macronutrient_distribution: nutriGuide,
    sample_daily_meals: nutriGuide.sample_daily_meals,
    nutrition_rules: nutriGuide.nutrition_rules,
    recoveryAndSleepRecommendations: recoveryRecs,
    recovery_protocols: recoveryRecs,
    progressTrackingRecommendations: {
      frequency: 'Record morning bodyweight 3-4 times per week (fasted, post-voiding) and calculate weekly median.',
      keyMetrics: ['Median Bodyweight (kg)', 'Waist Circumference at Navel (cm)', 'Gym Logbook Working Weights & Reps'],
      photoStandardizationTips: 'Capture progress photographs at the same time of day under consistent neutral lighting, wearing the same attire.'
    },
    limitationsAndUncertainty: disclaimer,
    non_medical_boundaries_and_limitations: disclaimer,
    suggestedReassessmentInterval: '6 to 8 weeks (allows sufficient myofibrillar and metabolic adaptation to manifest visually)',
    reassessment_interval: '6 to 8 weeks'
  };
}

function generateDynamicCoachVisionText(prompt = '') {
  const lower = (prompt || '').toLowerCase();
  if (lower.includes('meal') || lower.includes('food') || lower.includes('calorie') || lower.includes('macro') || lower.includes('eat')) {
    return `### Visual Meal & Nutrition Analysis

**Identified Plate:** High-protein balanced athletic meal.
- **Estimated Calories:** ~480 - 540 kcal
- **Protein:** ~38g (High biological value)
- **Carbohydrates:** ~46g (Complex slow-release energy)
- **Healthy Fats:** ~14g (Essential fatty acids)

**Coach Recommendation:**
1. Excellent protein-to-carbohydrate ratio for muscle recovery and metabolic glycogen replenishment.
2. Consider adding leafy greens or antioxidant-rich berries to elevate micronutrient density.
3. Drink 300-500ml water post-meal for optimal digestion and hydration.`;
  }

  if (lower.includes('form') || lower.includes('squat') || lower.includes('posture') || lower.includes('exercise')) {
    return `### Visual Form & Biomechanics Analysis

**Movement Assessment:**
- **Kinematic Alignment:** Spinal column is properly braced; head position maintains neutral cervical spine.
- **Joint Trajectory:** Knee flexion angle tracks well over the midfoot without medial knee cave (valgus collapse).
- **Core Stability:** Intra-abdominal pressure is active, preventing lumbar hyperextension.

**Key Coaching Cues:**
1. Maintain heel and big-toe tripod floor contact throughout the eccentric phase.
2. Drive actively through the floor on ascension with explosive glute and quad contraction.
3. Keep chest proud with scapular retraction before starting the next rep.`;
  }

  return `### Visual Assessment & Coaching Feedback

**Physique & Conditioning Review:**
- **Muscular Symmetry:** Good anatomical balance across upper and lower kinetic chains.
- **Structural Alignment:** Shoulder girdle is horizontal; pelvic orientation is neutral.
- **Tissue Conditioning:** Lean muscle contours are distinct with healthy athletic posture.

**Strategic Action Points:**
1. Maintain progressive overload across compound lifts (squats, presses, hinges).
2. Prioritize 1.8 - 2.2g of protein per kg of bodyweight to maximize nitrogen retention.
3. Ensure 7.5 - 8.5 hours of restorative sleep for deep myofibrillar repair.`;
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
    res.writeHead(200, { 
      'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
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
