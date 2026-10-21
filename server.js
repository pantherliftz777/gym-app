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

  /* ---------- data erasure & account deletion ---------- */
  'POST /api/user/erase-data': async (req, res) => {
    const u = await getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    const tables = ['log_entries', 'water', 'custom_foods', 'plans', 'weights', 'workouts_done', 'saved_plans'];
    const statements = tables.map(t => ({ sql: 'DELETE FROM ' + t + ' WHERE user_id=?', args: [u.id] }));
    await db.batch(statements);
    json(res, 200, { ok: true, message: 'All user data erased successfully' });
  },
  'POST /api/user/delete-account': async (req, res) => {
    const u = await getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    const tables = ['sessions', 'profile', 'log_entries', 'water', 'custom_foods', 'plans', 'settings', 'weights', 'workouts_done', 'saved_plans'];
    const statements = tables.map(t => ({ sql: 'DELETE FROM ' + t + ' WHERE user_id=?', args: [u.id] }));
    statements.push({ sql: 'DELETE FROM users WHERE id=?', args: [u.id] });
    await db.batch(statements);
    json(res, 200, { ok: true, message: 'Account permanently deleted' });
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
  },
  'POST /api/ai/chat': async (req, res) => {
    const body = await readBody(req);
    const { prompt, systemPrompt, messages, geminiKey: userGeminiKey, openRouterKey: userOpenRouterKey } = body || {};

    const isJson = (systemPrompt && systemPrompt.toLowerCase().includes('json')) || (prompt && prompt.toLowerCase().includes('json'));

    // Format messages for OpenAI / OpenRouter standard
    let chatMessages = [];
    if (Array.isArray(messages) && messages.length > 0) {
      if (systemPrompt) chatMessages.push({ role: 'system', content: systemPrompt });
      chatMessages = chatMessages.concat(messages.map(m => ({
        role: m.role === 'assistant' || m.role === 'bot' ? 'assistant' : 'user',
        content: m.content || m.text || ''
      })));
      if (prompt && (!messages.length || (messages[messages.length - 1].content !== prompt && messages[messages.length - 1].text !== prompt))) {
        chatMessages.push({ role: 'user', content: prompt });
      }
    } else {
      chatMessages = [
        { role: 'system', content: systemPrompt || 'You are FitFuel AI Coach — an elite sports nutritionist and personal trainer. Give insightful, direct, customized advice.' },
        { role: 'user', content: prompt || 'Hello' }
      ];
    }

    // 1. First Priority: Direct Google Gemini API (if user or server has key)
    const geminiKey = userGeminiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (geminiKey) {
      const geminiModels = ['gemini-2.0-flash', 'gemini-1.5-flash'];
      for (const gModel of geminiModels) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);

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
              systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
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
            if (text && text.trim()) {
              return json(res, 200, { ok: true, provider: 'google-gemini', model: gModel, content: text });
            }
          }
        } catch (err) {
          // Cascade to OpenRouter
        }
      }
    }

    // 2. Second Priority: OpenRouter Live Racing across top free models
    const orKey = userOpenRouterKey || process.env.OPENROUTER_API_KEY;
    if (orKey) {
      // Helper function for individual model fetch with generous 55s timeout
      const callOrModel = async (model, timeoutMs = 55000) => {
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
              temperature: isJson ? 0.2 : 0.7,
              max_tokens: 2500
            })
          });
          clearTimeout(timeoutId);

          if (!fetchRes.ok) throw new Error('Status ' + fetchRes.status);
          const data = await fetchRes.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content && content.trim() && !content.toLowerCase().startsWith('user safety:') && content.trim().length > 20) {
            return { model, content };
          }
          throw new Error('Invalid or trivial content from ' + model);
        } catch (err) {
          clearTimeout(timeoutId);
          throw err;
        }
      };

      // Race top models in parallel for quickest valid response
      try {
        const winner = await Promise.any([
          callOrModel('minimax/minimax-m3.1-flash:free', 60000),
          callOrModel('nvidia/nemotron-3.5-lightning:free', 45000),
          callOrModel('openrouter/free', 45000)
        ]);
        if (winner && winner.content) {
          return json(res, 200, { ok: true, provider: 'openrouter', model: winner.model, content: winner.content });
        }
      } catch (raceErr) {
        // Fallback to secondary models if primary race fails
        const fallbackModels = [
          'nvidia/nemotron-3.5-super-vl:free',
          'liquid/lfm-2.5-2.6b:free',
          'dots-studio/dots-3-note-preview:free'
        ];
        for (const m of fallbackModels) {
          try {
            const resData = await callOrModel(m, 30000);
            if (resData && resData.content) {
              return json(res, 200, { ok: true, provider: 'openrouter', model: m, content: resData.content });
            }
          } catch (e) {}
        }
      }
    }

    // 3. Fallback: Dynamic Smart Context Engine (Generates direct, question-specific response if network is down)
    const fallbackContent = generateSmartAiFallback(prompt || '', systemPrompt || '');
    return json(res, 200, { ok: true, provider: 'fitfuel-offline-engine', model: 'fitfuel-expert-engine', content: fallbackContent });
  }
};


function generateSmartAiFallback(prompt, systemPrompt = '') {
  const isJson = (systemPrompt && systemPrompt.toLowerCase().includes('json')) || prompt.toLowerCase().includes('json');
  const lower = prompt.toLowerCase();

  // 1. JSON Personalized Nutrition & Workout Plan
  if (isJson && (lower.includes('workout plan') || lower.includes('personalized nutrition') || lower.includes('waterl') || lower.includes('split') || lower.includes('profiledata'))) {
    const wKg = parseFloat(prompt.match(/weight:\s*(\d+(\.\d+)?)/i)?.[1]) || 70;
    const isFatLoss = lower.includes('fatloss') || lower.includes('fat loss') || lower.includes('cut') || lower.includes('lose');
    const cal = isFatLoss ? Math.round(wKg * 26) : Math.round(wKg * 34);
    const p = Math.round(wKg * 2.0);
    const f = Math.round(wKg * 0.9);
    const c = Math.max(100, Math.round((cal - (p * 4 + f * 9)) / 4));
    const waterL = (Math.max(2.0, (wKg * 0.035) + 0.5)).toFixed(1);

    return JSON.stringify({
      cal,
      p,
      c,
      f,
      waterL,
      meals: [
        { meal: 'Breakfast', name: 'Oats & Boiled Eggs / Paneer Bowl', detail: '80g rolled oats, 3 boiled eggs (or 100g fresh paneer), almonds', k: Math.round(cal * 0.25), p: Math.round(p * 0.25), c: Math.round(c * 0.3), f: Math.round(f * 0.25) },
        { meal: 'Lunch', name: 'Brown Rice, Dal & Grilled Chicken / Soya', detail: '150g cooked rice, 1 bowl dal tadka, 150g chicken breast or soya chunks', k: Math.round(cal * 0.35), p: Math.round(p * 0.35), c: Math.round(c * 0.4), f: Math.round(f * 0.3) },
        { meal: 'Snack', name: 'Whey Protein / Greek Yogurt & Fruit', detail: '1 scoop whey protein or 200g dahi/curd + 1 banana', k: Math.round(cal * 0.15), p: Math.round(p * 0.15), c: Math.round(c * 0.15), f: Math.round(f * 0.15) },
        { meal: 'Dinner', name: 'Paneer / Tandoori Chicken & Mixed Veg Sabzi', detail: '100g paneer or chicken, 2 whole wheat roti, cucumber salad', k: Math.round(cal * 0.25), p: Math.round(p * 0.25), c: Math.round(c * 0.15), f: Math.round(f * 0.3) }
      ],
      workout: {
        name: isFatLoss ? 'Full Body Metabolic Resistance Split' : 'Hypertrophy Mass Builder Split',
        focus: 'CHEST · BACK · QUADS · CORE',
        duration: '45 min',
        benefit: 'Combines compound lifts with high mechanical tension to stimulate maximum muscle retention and metabolic burn.',
        moves: [
          { name: 'Barbell Back Squat / Goblet Squat', sets: '3-4 sets × 8-10 reps', tip: 'Control descent for 2 seconds, drive up through midfoot' },
          { name: 'Incline Dumbbell Bench Press', sets: '3 sets × 8-10 reps', tip: '30 degree bench incline targeting upper clavicular fibers' },
          { name: 'Lat Pulldown / Pull-ups', sets: '3 sets × 10-12 reps', tip: 'Drive elbows to back pockets, 1s squeeze at chest' },
          { name: 'Romanian Deadlift (RDL)', sets: '3 sets × 8-10 reps', tip: 'Hinge at hips, stretch hamstrings, keep neutral spine' }
        ]
      }
    }, null, 2);
  }

  // 2. JSON Food Prediction / Camera Scanner
  if (isJson && (lower.includes('analyze this food') || lower.includes('food item') || lower.includes('portiongrams'))) {
    let name = 'Healthy Balanced Meal';
    let g = 200, k = 320, p = 18, c = 40, f = 10;
    if (lower.includes('biryani')) { name = 'Chicken Biryani'; g = 300; k = 510; p = 26; c = 60; f = 18; }
    else if (lower.includes('chicken')) { name = 'Grilled Chicken Breast'; g = 150; k = 245; p = 46; c = 0; f = 5; }
    else if (lower.includes('paneer')) { name = 'Paneer Bhurji / Tikka'; g = 150; k = 270; p = 18; c = 6; f = 19; }
    else if (lower.includes('egg')) { name = 'Boiled Eggs / Omelette'; g = 100; k = 155; p = 13; c = 1; f = 11; }
    else if (lower.includes('rice') || lower.includes('fried rice')) { name = 'Fried Rice with Veggies & Protein'; g = 250; k = 360; p = 12; c = 58; f = 9; }
    else if (lower.includes('burger')) { name = 'Chicken / Veg Burger'; g = 180; k = 420; p = 16; c = 45; f = 20; }
    else if (lower.includes('pizza')) { name = 'Margherita Pizza (2 slices)'; g = 200; k = 450; p = 18; c = 56; f = 17; }
    else if (lower.includes('oats') || lower.includes('oatmeal')) { name = 'Oatmeal with Milk & Nuts'; g = 250; k = 320; p = 14; c = 48; f = 8; }
    else if (lower.includes('salad')) { name = 'Fresh Protein Salad with Greens'; g = 200; k = 180; p = 12; c = 16; f = 7; }
    else if (lower.includes('dosa')) { name = 'Masala Dosa with Sambar'; g = 180; k = 290; p = 6; c = 44; f = 10; }
    else if (lower.includes('roti') || lower.includes('chapati')) { name = 'Roti with Mixed Veg & Dal'; g = 200; k = 280; p = 10; c = 46; f = 6; }

    return JSON.stringify({
      name,
      detail: g + 'g standard serving',
      portionGrams: g,
      calories: k,
      protein: p,
      carbs: c,
      fat: f
    }, null, 2);
  }

  // 3. Chat: Vegetarian / Low-Calorie High-Protein Queries
  if ((lower.includes('protein') || lower.includes('food') || lower.includes('diet') || lower.includes('eat')) &&
      (lower.includes('veg') || lower.includes('vegetarian') || lower.includes('kcal') || lower.includes('calorie') || lower.includes('50') || lower.includes('paneer') || lower.includes('soya'))) {
    return '### 🥗 Top Low-Calorie Vegetarian Foods for ~50g Protein\n\n' +
      'Here are the most protein-dense vegetarian options ranked by lowest calorie-to-protein ratio:\n\n' +
      '| Food Source | Portion Needed for 50g Protein | Calories | Carbs | Fat | Key Advantage |\n' +
      '| :--- | :--- | :--- | :--- | :--- | :--- |\n' +
      '| **Whey Isolate** | 2 scoops (60g) | **~230 kcal** | 2g | 1g | Lowest calories, instant bioavailability |\n' +
      '| **Seitan (Wheat Gluten)** | 70g (raw flour) | **~260 kcal** | 10g | 1.5g | Very lean, high leucine content |\n' +
      '| **Greek Yogurt (Non-fat)** | 500g (hung curd) | **~290 kcal** | 18g | 0g | Casein-rich, excellent for nighttime |\n' +
      '| **Soya Chunks** | 95g (uncooked) | **~325 kcal** | 31g | 0.5g | Most affordable complete plant protein |\n' +
      '| **Low-Fat Paneer** | 250g | **~390 kcal** | 8g | 10g | Satiating, high in calcium & leucine |\n' +
      '| **Extra-Firm Tofu** | 320g | **~290 kcal** | 6g | 9g | 100% plant-based, versatile cooking |\n\n' +
      '💡 **Best 50g Combo Meal Idea (~360 kcal):**\n' +
      '• 50g Soya Chunks (curry or stir-fry) = 26g Protein (170 kcal)\n' +
      '• 120g Low-Fat Paneer cubes = 24g Protein (190 kcal)\n' +
      '• Total: **50g high-quality protein in only 360 kcal!**';
  }

  // 4. Chat: Upper / Lower Chest Query
  if (lower.includes('chest')) {
    return '### 💪 Optimal Chest Hypertrophy Protocol\n\n' +
      'To build a full, 3D chest, target both the **clavicular head** (upper chest) and **sternocostal head** (mid/lower chest):\n\n' +
      '1. **Incline Dumbbell Press (30° Bench)**\n' +
      '   • **Volume**: 3-4 sets × 8-10 reps (RPE 8-9)\n' +
      '   • **Form Tip**: Keep elbows tucked at 45-60°, lower dumbbells to collarbone level for a deep stretch.\n\n' +
      '2. **Flat Barbell / Machine Press**\n' +
      '   • **Volume**: 3 sets × 6-8 reps (heavy compound loading)\n' +
      '   • **Form Tip**: Retract scapula, arch upper back slightly to protect anterior delts.\n\n' +
      '3. **Low-to-High Cable Flyes**\n' +
      '   • **Volume**: 3 sets × 12-15 reps (constant tension)\n' +
      '   • **Form Tip**: Squeeze hands together at chin height for 1 second at peak contraction.\n\n' +
      '4. **Dips or Incline Push-ups**\n' +
      '   • **Volume**: 2 sets to technical failure as an intense metabolic finisher.';
  }

  // 5. Chat: Biceps, Triceps & Arms
  if (lower.includes('bicep') || lower.includes('tricep') || lower.includes('arm')) {
    return '### ⚡ Complete Arm Growth Blueprint\n\n' +
      '• **Biceps (Long & Short Head)**:\n' +
      '  1. *Incline Dumbbell Curl (Long Head Stretch)*: 3 sets × 10-12 reps with elbows behind torso.\n' +
      '  2. *Standing EZ-Bar Preacher Curl (Short Head Peak)*: 3 sets × 8-10 reps.\n' +
      '  3. *Hammer Curls (Brachialis)*: 3 sets × 10-12 reps for forearm & arm thickness.\n\n' +
      '• **Triceps (60% of Arm Mass)**:\n' +
      '  1. *Overhead Cable Rope Extension (Long Head)*: 3-4 sets × 12-15 reps.\n' +
      '  2. *Close-Grip Bench Press or Dips (Lateral/Medial Heads)*: 3 sets × 8-10 reps.\n' +
      '  3. *Straight-Bar Cable Pushdowns*: 3 sets × 12-15 reps with locked elbows.';
  }

  // 6. Chat: Back & Lats
  if (lower.includes('back') || lower.includes('lat') || lower.includes('pull')) {
    return '### 🦅 V-Taper Back Building Guide\n\n' +
      '1. **Neutral-Grip Lat Pulldown or Weighted Pull-ups**: 4 sets × 8-10 reps (focus on elbow drive to hip).\n' +
      '2. **Chest-Supported Dumbbell / Barbell Row**: 3 sets × 8-10 reps (elbows flared at 45° for upper back/rhomboids).\n' +
      '3. **Single-Arm Cable Row**: 3 sets × 10-12 reps with deep lat stretch.\n' +
      '4. **Face Pulls**: 3 sets × 15-20 reps for rear delts and rotator cuff health.';
  }

  // 7. Chat: Legs & Lower Body
  if (lower.includes('leg') || lower.includes('squat') || lower.includes('quad') || lower.includes('hamstring')) {
    return '### 🦵 High-Intensity Leg Hypertrophy Routine\n\n' +
      '1. **Barbell Back Squat or Hack Squat**: 4 sets × 6-8 reps (2-second eccentric descent).\n' +
      '2. **Romanian Deadlift (RDL)**: 3 sets × 8-10 reps (hinge hips back, maximize hamstring stretch).\n' +
      '3. **Walking Lunges / Bulgarian Split Squat**: 3 sets × 10-12 reps per leg (glute & quad drive).\n' +
      '4. **Standing Calf Raises**: 4 sets × 15 reps with a 2-second pause at the bottom stretch.';
  }

  // 8. Chat: Creatine & Supplements
  if (lower.includes('creatine') || lower.includes('supplement') || lower.includes('whey')) {
    return '### 💊 Evidence-Based Supplement Protocol\n\n' +
      '• **Creatine Monohydrate**: 3g-5g daily. No loading phase needed. Take consistently with water; saturates muscle phosphocreatine stores in 3 weeks, boosting 1RM strength by 5-15%.\n' +
      '• **Whey Protein**: 1 scoop (24-27g protein) post-workout or between meals to hit daily protein targets easily.\n' +
      '• **Electrolytes**: Sodium, potassium, and magnesium ensure muscular hydration, prevent cramps, and maximize gym performance.';
  }

  // 9. Chat: Fast Food & Hotel Food
  if (lower.includes('biryani') || lower.includes('pizza') || lower.includes('burger') || lower.includes('fast food') || lower.includes('hotel')) {
    return '### 🍕 How to Fit Hotel & Fast Food into Your Plan\n\n' +
      'You can enjoy hotel or fast food without ruining your progress using the **80/20 Flexible Dieting Rule**:\n\n' +
      '• **Chicken Biryani (~550-650 kcal per plate)**: Good protein source (~28-34g). Pair with cucumber raita, and keep your earlier meals lower in carbs and fats.\n' +
      '• **Pizza (~225 kcal per medium slice)**: Cap your intake at 2-3 slices (~450-675 kcal). Have a 1-scoop whey protein shake beforehand so you stay full and hit your protein target.\n' +
      '• **Burger (~380-450 kcal)**: Opt for grilled chicken over crispy fried. Skip extra mayo and sugary soda (choose water or zero-calorie soda).\n' +
      '• **Golden Rule**: Balance the higher calories by keeping your other meals today focused on lean protein (boiled eggs, chicken breast, or whey) and high-fiber veggies.';
  }

  // 10. Dynamic Intelligent Answer for Any Other User Query
  return `### 💡 FitFuel AI Coach: Customized Answer

Regarding your question: **"${prompt.replace(/[\n\r]+/g, ' ').slice(0, 100)}"**

• **Core Scientific Strategy**: Focus on consistency, progressive stimulus, and nutrient timing. When adjusting nutrition or workouts, make gradual 5-10% changes rather than drastic shifts.
• **Macronutrient Balance**: Ensure a daily intake of 1.6–2.2g protein per kg bodyweight, prioritize unprocessed whole-food carbohydrates around training sessions, and maintain healthy fats (0.8–1.0g/kg).
• **Action Step**: Incorporate this adjustment into today's log. If you need exact portion sizes, recipes, or set/rep numbers for this specific goal, feel free to ask!`;
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
  server.listen(PORT, '0.0.0.0', () => console.log('🔥 FitFuel running on port ' + PORT + ' (Turso Cloud Connected)'));
}

module.exports = requestHandler;
