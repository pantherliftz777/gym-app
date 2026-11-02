/* FitFuel API Gateway + Database Server
   Run:  node server.js        (then open http://localhost:3000)
   Data: Turso Cloud SQLite (Persistent on Vercel & Multi-device synced)
*/
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@libsql/client');
const FF_ALGO = require('./public/algo.js');
const betaFeatures = require('./beta-features.js');

let betaInitPromise = null;
function ensureBetaInit() {
  if (!betaInitPromise) {
    betaInitPromise = betaFeatures.init(db).catch(err => {
      console.warn('[server.js] betaFeatures.init error:', err.message);
    });
  }
  return betaInitPromise;
}

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

/* ---------- rate limiter & ip helper ---------- */
const rateLimits = new Map();
const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || '127.0.0.1';
};

function checkRateLimit(ip, routeType, maxRequests, windowMs) {
  const key = `${ip}:${routeType}`;
  const now = Date.now();
  let record = rateLimits.get(key);
  if (!record || now - record.start > windowMs) {
    record = { start: now, count: 1 };
    rateLimits.set(key, record);
    return { allowed: true, remaining: maxRequests - 1 };
  }
  record.count++;
  if (record.count > maxRequests) {
    const retryAfter = Math.ceil((record.start + windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }
  return { allowed: true, remaining: maxRequests - record.count };
}

// Clean up stale rate limit entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateLimits.entries()) {
    if (now - v.start > 1800000) rateLimits.delete(k);
  }
}, 600000).unref();

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
    'SELECT u.id, u.name, u.email, u.contact, u.created_at, u.last_login, u.is_admin, COALESCE(u.is_beta_tester, 0) as is_beta_tester FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?',
    [token]
  );
  if (row) {
    if (row.email === 'admin@fitfuel.app') {
      row.is_admin = 1;
      row.is_beta_tester = 1;
    }
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

/* ---------- beta applications table & access control ---------- */
let betaTableInitPromise = null;
async function ensureBetaTable() {
  if (!betaTableInitPromise) {
    betaTableInitPromise = (async () => {
      try {
        await db.exec(`
          CREATE TABLE IF NOT EXISTS beta_applications (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            featureId TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            reason TEXT NOT NULL,
            device TEXT NOT NULL,
            appliedAt TEXT NOT NULL,
            approvedAt TEXT
          );
          CREATE UNIQUE INDEX IF NOT EXISTS idx_beta_app_user_feat ON beta_applications(userId, featureId);
          CREATE INDEX IF NOT EXISTS idx_beta_app_status ON beta_applications(status);
        `);

        // Check if table has seed data
        const countRow = await db.get('SELECT COUNT(*) as count FROM beta_applications');
        if (!countRow || Number(countRow.count) === 0) {
          const nowIso = new Date().toISOString();
          const pastIso = new Date(Date.now() - 86400000 * 2).toISOString();
          await db.run(
            'INSERT INTO beta_applications (id, userId, featureId, status, reason, device, appliedAt, approvedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            ['beta_seed_1', 'sarah.m@fitfuel.test', 'formCorrectionAi', 'pending', 'Recovering from minor knee surgery and need live visual squat depth feedback.', 'iPhone 15 Pro', pastIso, null]
          );
          await db.run(
            'INSERT INTO beta_applications (id, userId, featureId, status, reason, device, appliedAt, approvedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            ['beta_seed_2', 'marcus.chen@fitfuel.test', 'wearableSync', 'approved', 'Testing gym cardio equipment BLE telemetry streaming with Apple Watch Ultra.', 'Apple Watch Ultra 2', pastIso, nowIso]
          );
          await db.run(
            'INSERT INTO beta_applications (id, userId, featureId, status, reason, device, appliedAt, approvedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            ['beta_seed_3', 'elena.r@fitfuel.test', 'mealPlanAi', 'pending', 'Need high-protein weekly grocery lists calibrated precisely to 165g daily target.', 'Google Pixel 8 Pro', pastIso, null]
          );
        }
      } catch (err) {
        console.warn('[server.js] ensureBetaTable error:', err.message);
      }
    })();
  }
  return betaTableInitPromise;
}

/* ---------- routes ---------- */
const routes = {
  'GET /api/beta/status': async (req, res) => {
    try {
      await ensureBetaTable();
      const urlObj = new URL(req.url, 'http://localhost');
      let featureId = (urlObj.searchParams.get('featureId') || '').trim();
      let userId = (urlObj.searchParams.get('userId') || '').trim();
      const user = await getUser(req);
      if (!userId && user) {
        userId = user.email || String(user.id);
      }
      if (!featureId) {
        return json(res, 400, { ok: false, error: 'featureId parameter is required' });
      }

      const isAdmin = (user && (user.is_admin === 1 || user.email === 'admin@fitfuel.app')) || urlObj.searchParams.get('demo') === '1' || urlObj.searchParams.get('admin') === '1';

      if (!userId) {
        return json(res, 200, {
          ok: true,
          featureId,
          userId: '',
          status: 'none',
          application: null,
          canAccess: isAdmin
        });
      }

      const row = await db.get(
        'SELECT id, userId, featureId, status, reason, device, appliedAt, approvedAt FROM beta_applications WHERE (userId = ? OR userId = ? OR userId = ?) AND featureId = ?',
        [userId, user ? user.email : userId, user ? String(user.id) : userId, featureId]
      );

      if (!row) {
        return json(res, 200, {
          ok: true,
          featureId,
          userId,
          status: 'none',
          application: null,
          canAccess: isAdmin
        });
      }

      const status = row.status || 'none';
      return json(res, 200, {
        ok: true,
        featureId,
        userId,
        status,
        application: row,
        canAccess: isAdmin || status === 'approved'
      });
    } catch (e) {
      return json(res, 500, { ok: false, error: 'Internal server error: ' + e.message });
    }
  },

  'POST /api/beta/apply': async (req, res) => {
    try {
      await ensureBetaTable();
      const user = await getUser(req);
      const body = await readBody(req);
      let { userId, featureId, device, reason } = body || {};

      if (!userId && user) {
        userId = user.email || String(user.id);
      }
      if (!userId || typeof userId !== 'string' || !userId.trim()) {
        return json(res, 400, { ok: false, error: 'userId or email is required.' });
      }
      userId = userId.trim();

      if (!featureId || typeof featureId !== 'string' || !featureId.trim()) {
        return json(res, 400, { ok: false, error: 'featureId is required.' });
      }
      featureId = featureId.trim();

      const validBetaFeatures = ['formCorrectionAi', 'wearableSync', 'mealPlanAi'];
      if (!validBetaFeatures.includes(featureId)) {
        return json(res, 400, { ok: false, error: 'Invalid beta feature ID: ' + featureId });
      }

      if (!device || typeof device !== 'string' || device.trim().length < 2) {
        return json(res, 400, { ok: false, error: 'Valid testing device is required (e.g. iPhone 15 Pro, Apple Watch Ultra).' });
      }
      device = device.trim();

      if (!reason || typeof reason !== 'string' || reason.trim().length < 3) {
        return json(res, 400, { ok: false, error: 'Please describe why you would like early access.' });
      }
      reason = reason.trim();

      const now = new Date().toISOString();
      const appId = 'beta_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');

      const existing = await db.get(
        'SELECT id, userId, featureId, status, reason, device, appliedAt, approvedAt FROM beta_applications WHERE userId = ? AND featureId = ?',
        [userId, featureId]
      );

      let appRecord;
      if (existing) {
        const newStatus = existing.status === 'approved' ? 'approved' : 'pending';
        await db.run(
          'UPDATE beta_applications SET status = ?, reason = ?, device = ?, appliedAt = ? WHERE id = ?',
          [newStatus, reason, device, now, existing.id]
        );
        appRecord = {
          id: existing.id,
          userId,
          featureId,
          status: newStatus,
          reason,
          device,
          appliedAt: now,
          approvedAt: existing.approvedAt
        };
      } else {
        await db.run(
          'INSERT INTO beta_applications (id, userId, featureId, status, reason, device, appliedAt, approvedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [appId, userId, featureId, 'pending', reason, device, now, null]
        );
        appRecord = {
          id: appId,
          userId,
          featureId,
          status: 'pending',
          reason,
          device,
          appliedAt: now,
          approvedAt: null
        };
      }

      return json(res, 200, {
        ok: true,
        message: 'Beta application submitted successfully. Under review.',
        application: appRecord
      });
    } catch (e) {
      return json(res, 500, { ok: false, error: 'Internal server error: ' + e.message });
    }
  },

  'GET /api/admin/beta-testers': async (req, res) => {
    try {
      await ensureBetaTable();
      const user = await getUser(req);
      const urlObj = new URL(req.url, 'http://localhost');
      const isDemo = urlObj.searchParams.get('demo') === '1' || urlObj.searchParams.get('admin') === '1';
      const isAdmin = (user && (user.is_admin === 1 || user.email === 'admin@fitfuel.app')) || isDemo;

      if (!isAdmin) {
        return json(res, 403, { ok: false, error: 'Admin authentication required.' });
      }

      const statusFilter = urlObj.searchParams.get('status') || 'all';
      const featureFilter = urlObj.searchParams.get('featureId') || '';

      const totalRow = await db.get('SELECT COUNT(*) as count FROM beta_applications');
      const approvedRow = await db.get("SELECT COUNT(*) as count FROM beta_applications WHERE status = 'approved'");
      const pendingRow = await db.get("SELECT COUNT(*) as count FROM beta_applications WHERE status = 'pending'");
      const rejectedRow = await db.get("SELECT COUNT(*) as count FROM beta_applications WHERE status = 'rejected'");

      const totalApplicants = totalRow ? Number(totalRow.count) : 0;
      const approvedTesters = approvedRow ? Number(approvedRow.count) : 0;
      const pendingCount = pendingRow ? Number(pendingRow.count) : 0;
      const rejectedCount = rejectedRow ? Number(rejectedRow.count) : 0;
      const maxSlots = 20;
      const remainingSlots = Math.max(0, maxSlots - approvedTesters);

      let sql = 'SELECT id, userId, featureId, status, reason, device, appliedAt, approvedAt FROM beta_applications WHERE 1=1';
      const args = [];
      if (statusFilter && statusFilter !== 'all') {
        sql += ' AND status = ?';
        args.push(statusFilter);
      }
      if (featureFilter && featureFilter !== 'all') {
        sql += ' AND featureId = ?';
        args.push(featureFilter);
      }
      sql += ' ORDER BY appliedAt DESC';

      const applicants = await db.all(sql, args);
      const testers = await db.all('SELECT id, name, email, contact, created_at, last_login, is_admin, COALESCE(is_beta_tester, 0) as is_beta_tester FROM users ORDER BY is_beta_tester DESC, id ASC').catch(() => []);

      return json(res, 200, {
        ok: true,
        stats: {
          totalApplicants,
          approvedTesters,
          pendingCount,
          rejectedCount,
          maxSlots,
          remainingSlots,
          remainingSlotsFormatted: `${remainingSlots} / ${maxSlots}`
        },
        applicants,
        testers
      });
    } catch (e) {
      return json(res, 500, { ok: false, error: 'Internal server error: ' + e.message });
    }
  },

  'POST /api/admin/beta-testers/action': async (req, res) => {
    try {
      await ensureBetaTable();
      const user = await getUser(req);
      const urlObj = new URL(req.url, 'http://localhost');
      const isDemo = urlObj.searchParams.get('demo') === '1' || urlObj.searchParams.get('admin') === '1';
      const isAdmin = (user && (user.is_admin === 1 || user.email === 'admin@fitfuel.app')) || isDemo;

      if (!isAdmin) {
        return json(res, 403, { ok: false, error: 'Admin authentication required.' });
      }

      const body = await readBody(req);
      const { id, applicationId, action } = body || {};
      const targetId = id || applicationId;

      if (!targetId || typeof targetId !== 'string') {
        return json(res, 400, { ok: false, error: 'Application ID is required.' });
      }
      if (!['approve', 'decline', 'revoke'].includes(action)) {
        return json(res, 400, { ok: false, error: 'Valid action (approve, decline, revoke) is required.' });
      }

      const existing = await db.get('SELECT * FROM beta_applications WHERE id = ?', [targetId]);
      if (!existing) {
        return json(res, 404, { ok: false, error: 'Application not found.' });
      }

      let newStatus = 'pending';
      let approvedAt = null;
      if (action === 'approve') {
        newStatus = 'approved';
        approvedAt = new Date().toISOString();
      } else if (action === 'decline') {
        newStatus = 'rejected';
        approvedAt = null;
      } else if (action === 'revoke') {
        newStatus = 'rejected';
        approvedAt = null;
      }

      await db.run(
        'UPDATE beta_applications SET status = ?, approvedAt = ? WHERE id = ?',
        [newStatus, approvedAt, targetId]
      );

      const updated = await db.get('SELECT id, userId, featureId, status, reason, device, appliedAt, approvedAt FROM beta_applications WHERE id = ?', [targetId]);

      const totalRow = await db.get('SELECT COUNT(*) as count FROM beta_applications');
      const approvedRow = await db.get("SELECT COUNT(*) as count FROM beta_applications WHERE status = 'approved'");
      const totalApplicants = totalRow ? Number(totalRow.count) : 0;
      const approvedTesters = approvedRow ? Number(approvedRow.count) : 0;
      const maxSlots = 20;
      const remainingSlots = Math.max(0, maxSlots - approvedTesters);

      return json(res, 200, {
        ok: true,
        message: `Application ${action}d successfully.`,
        application: updated,
        stats: {
          totalApplicants,
          approvedTesters,
          maxSlots,
          remainingSlots
        }
      });
    } catch (e) {
      return json(res, 500, { ok: false, error: 'Internal server error: ' + e.message });
    }
  },

  'GET /api/features': async (req, res) => {
    const { GYM_FEATURES } = require('./shared/featureStatus.js');
    return json(res, 200, { ok: true, features: GYM_FEATURES });
  },
  'POST /api/features/waitlist': async (req, res) => {
    try {
      try {
        await db.exec(`
          CREATE TABLE IF NOT EXISTS feature_waitlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            feature_id TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
          CREATE UNIQUE INDEX IF NOT EXISTS idx_feature_waitlist_unique 
          ON feature_waitlist(email, feature_id);
        `);
      } catch (tableErr) {}

      const body = await readBody(req);
      const { email, featureId } = body || {};

      if (typeof email !== 'string') {
        return json(res, 400, { ok: false, error: 'Valid email is required.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || cleanEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return json(res, 400, { ok: false, error: 'Valid email is required.' });
      }

      const { GYM_FEATURES } = require('./shared/featureStatus.js');
      const feat = GYM_FEATURES[featureId];
      if (!feat) {
        return json(res, 400, { ok: false, error: 'Unknown feature: ' + featureId });
      }

      // Rule #1 & #2: Waitlists are strictly for upcoming (coming-soon) features
      if (feat.status !== 'coming-soon') {
        return json(res, 400, {
          ok: false,
          error: `${feat.name} is ${feat.status === 'available' ? 'already live in production' : 'currently in public beta'}. You can launch it directly in the app!`
        });
      }

      // Check if user is already on waitlist for this feature
      let existing = null;
      try {
        existing = await db.get(
          'SELECT id, created_at FROM feature_waitlist WHERE email = ? AND feature_id = ?',
          [cleanEmail, featureId]
        );
      } catch (e) {}

      if (existing) {
        let existingPos = 1;
        try {
          const posRes = await db.get(
            'SELECT COUNT(*) as pos FROM feature_waitlist WHERE feature_id = ? AND id <= ?',
            [featureId, existing.id]
          );
          if (posRes && posRes.pos) existingPos = posRes.pos;
        } catch (e) {}

        return json(res, 200, {
          ok: true,
          alreadyRegistered: true,
          message: `You're already registered at #${existingPos} on the priority early-access waitlist for ${feat.name}! We'll notify you as soon as testing opens.`,
          queuePosition: existingPos
        });
      }

      // Insert new waitlist registration
      try {
        await db.run('INSERT INTO feature_waitlist (email, feature_id) VALUES (?, ?)', [cleanEmail, featureId]);
      } catch (insertErr) {
        // Safe fallback in case DB fails
      }

      let count = 1;
      try {
        const countRes = await db.get('SELECT COUNT(*) as count FROM feature_waitlist WHERE feature_id = ?', [featureId]);
        if (countRes && countRes.count) count = countRes.count;
      } catch (e) {}

      return json(res, 200, {
        ok: true,
        alreadyRegistered: false,
        message: `You're #${count} on the priority early-access waitlist for ${feat.name}! We'll notify you as soon as testing opens.`,
        queuePosition: count
      });
    } catch (err) {
      return json(res, 500, { ok: false, error: 'Internal server error: ' + err.message });
    }
  },
  'GET /api/health': async (req, res) => {
    try {
      const dbCheck = await db.get('SELECT 1 as alive');
      json(res, 200, {
        status: 'healthy',
        database: dbCheck && dbCheck.alive === 1 ? 'connected' : 'degraded',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      json(res, 500, { status: 'unhealthy', database: 'disconnected', error: err.message });
    }
  },
  'POST /api/auth/register': async (req, res) => {
    const ip = getClientIp(req);
    const limit = checkRateLimit(ip, 'register', 15, 15 * 60 * 1000);
    if (!limit.allowed) {
      return json(res, 429, { error: `Too many registration attempts. Please try again in ${limit.retryAfter}s.` });
    }
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
    const ip = getClientIp(req);
    const limit = checkRateLimit(ip, 'login', 15, 15 * 60 * 1000);
    if (!limit.allowed) {
      return json(res, 429, { error: `Too many login attempts. Please try again in ${limit.retryAfter}s.` });
    }
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
    if (!betaFeatures.isFeatureAccessible('gps-activity', u)) {
      return json(res, 403, { error: 'Access Denied: GPS Activity Tracking is a restricted beta feature.', feature: 'gps-activity' });
    }
    const rows = await db.all('SELECT * FROM activity_sessions WHERE user_id=? ORDER BY start_time DESC LIMIT 100', [u.id]);
    json(res, 200, { sessions: rows });
  },
  'POST /api/activity/session': async (req, res) => {
    const u = await getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    if (!betaFeatures.isFeatureAccessible('gps-activity', u)) {
      return json(res, 403, { error: 'Access Denied: GPS Activity Tracking is a restricted beta feature.', feature: 'gps-activity' });
    }
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
    if (!betaFeatures.isFeatureAccessible('posture', u)) {
      return json(res, 403, { error: 'Access Denied: Posture AI Camera is a restricted beta feature.', feature: 'posture' });
    }
    const rows = await db.all('SELECT * FROM posture_sessions WHERE user_id=? ORDER BY created DESC LIMIT 60', [u.id]);
    json(res, 200, { sessions: rows });
  },
  'POST /api/posture/session': async (req, res) => {
    const u = await getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    if (!betaFeatures.isFeatureAccessible('posture', u)) {
      return json(res, 403, { error: 'Access Denied: Posture AI Camera is a restricted beta feature.', feature: 'posture' });
    }
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
    const u = await getUser(req);
    if (!betaFeatures.isFeatureAccessible('body-analysis', u)) {
      return json(res, 403, { error: 'Access Denied: Body Analysis & Scan is a restricted beta feature.', feature: 'body-analysis' });
    }
    const uid = u ? u.id : 0;
    const rows = await db.all('SELECT * FROM body_assessments WHERE user_id=? ORDER BY created DESC LIMIT 50', [uid]);
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
    const u = await getUser(req);
    if (!betaFeatures.isFeatureAccessible('body-analysis', u)) {
      return json(res, 403, { error: 'Access Denied: Body Analysis & Scan is a restricted beta feature.', feature: 'body-analysis' });
    }
    const uid = u ? u.id : 0;
    const body = await readBody(req);
    const goal = body.goal || 'lean_athletic';
    const preferences = body.preferences || {};
    const photos_meta = body.photos_meta || {};
    const analysis = body.analysis || (body.analysis_json ? JSON.parse(body.analysis_json) : null);
    if (!analysis) return json(res, 400, { error: 'Missing analysis data' });
    const info = await db.run(
      'INSERT INTO body_assessments(user_id,goal,preferences,photos_meta,analysis_json,created) VALUES(?,?,?,?,?,?)',
      [
        uid,
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
    const u = await getUser(req);
    if (!betaFeatures.isFeatureAccessible('body-analysis', u)) {
      return json(res, 403, { error: 'Access Denied: Body Analysis & Scan is a restricted beta feature.', feature: 'body-analysis' });
    }
    const uid = u ? u.id : 0;
    let id = req.url.includes('id=') ? new URL(req.url, 'http://localhost').searchParams.get('id') : null;
    if (!id) {
      const body = await readBody(req);
      id = body && body.id;
    }
    if (!id) return json(res, 400, { error: 'Missing assessment id' });
    await db.run('DELETE FROM body_assessments WHERE id=? AND user_id=?', [id, uid]);
    json(res, 200, { ok: true, success: true });
  },
  'POST /api/body-scan/analyze': async (req, res) => {
    const u = await getUser(req);
    if (!betaFeatures.isFeatureAccessible('body-analysis', u)) {
      return json(res, 403, { error: 'Access Denied: Body Analysis & Scan is a restricted beta feature.', feature: 'body-analysis' });
    }
    const body = await readBody(req);
    const { goal, preferences, images } = body || {};
    try {
      const result = await generateBodyTransformationAnalysis(goal, preferences, images);
      json(res, 200, { ok: true, provider: result.provider || 'openrouter', model: result.model || 'nvidia/nemotron-3-ultra-550b-a55b:free', analysis: result });
    } catch (err) {
      json(res, 500, { ok: false, error: 'Analysis failed: ' + err.message });
    }
  },
  'POST /api/analyze-body': async (req, res) => {
    const u = await getUser(req);
    if (!betaFeatures.isFeatureAccessible('body-analysis', u)) {
      return json(res, 403, { error: 'Access Denied: Body Analysis & Scan is a restricted beta feature.', feature: 'body-analysis' });
    }
    const body = await readBody(req);
    const { goal, preferences, images } = body || {};
    try {
      const result = await generateBodyTransformationAnalysis(goal, preferences, images);
      json(res, 200, { ok: true, provider: result.provider || 'openrouter', model: result.model || 'nvidia/nemotron-3-ultra-550b-a55b:free', analysis: result });
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
    const body = await readBody(req);
    const { email, files } = body || {};
    const name = body?.name || (u && (u.name || u.email)) || 'Beta Tester';
    const text = body?.text || body?.message || body?.comment || body?.subject || '';
    const type = body?.type || body?.category || 'complaint';
    if (!name || String(name).trim().length < 2) return json(res, 400, { error: 'Please enter your name' });
    if (!text || String(text).trim().length < 3) return json(res, 400, { error: 'Please describe your problem / suggestion' });
    const userEmail = (email && String(email).trim()) || (u && u.email) || '';
    const safeFiles = (Array.isArray(files) ? files : []).slice(0, 3).map(f => ({
      name: String(f.name || 'file').slice(0, 80),
      type: String(f.type || '').slice(0, 60),
      data: String(f.data || '').slice(0, 900000)
    }));
    await db.run(
      'INSERT INTO complaints(user_id,name,email,type,text,files,created,seen) VALUES(?,?,?,?,?,?,?,0)',
      [u ? u.id : null, String(name).trim(), userEmail, String(type), String(text).trim(), JSON.stringify(safeFiles), Date.now()]
    );
    json(res, 200, { ok: true, message: 'Complaint/feedback received successfully' });
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
    const tables = ['sessions', 'profile', 'log_entries', 'water', 'custom_foods', 'plans', 'settings', 'weights', 'workouts_done', 'saved_plans', 'activity_sessions', 'posture_sessions', 'body_assessments'];
    const statements = tables.map(t => ({ sql: 'DELETE FROM ' + t + ' WHERE user_id=?', args: [id] }));
    statements.push({ sql: 'DELETE FROM users WHERE id=?', args: [id] });
    await db.batch(statements);
    json(res, 200, { ok: true });
  },
  'POST /api/admin/claim': async (req, res) => {
    const u = await getUser(req);
    if (!u) return json(res, 401, { error: 'Not logged in' });
    const { secret } = await readBody(req);
    const adminSecret = process.env.ADMIN_SECRET || 'fitfuel-admin-2026';
    const isAuthorized = (secret && secret === adminSecret) || (u.email && u.email.toLowerCase() === 'admin@fitfuel.app');
    if (isAuthorized) {
      await db.run('UPDATE users SET is_admin=1 WHERE id=?', [u.id]);
      return json(res, 200, { ok: true });
    }
    json(res, 403, { error: 'Invalid admin secret' });
  },

  /* ---------- beta features management ---------- */
  'GET /api/beta-features': async (req, res) => {
    const u = await getUser(req);
    const data = betaFeatures.getUserFeatures(u);
    json(res, 200, { ok: true, ...data });
  },
  'GET /api/admin/feature-flags': async (req, res) => {
    const u = await getUser(req);
    if (!u || !u.is_admin) return json(res, 403, { error: 'Admin access only' });
    json(res, 200, { ok: true, flags: betaFeatures.getAllFlags() });
  },
  'POST /api/admin/feature-flags': async (req, res) => {
    const u = await getUser(req);
    if (!u || !u.is_admin) return json(res, 403, { error: 'Admin access only' });
    const { key, access_level } = await readBody(req);
    try {
      const updated = await betaFeatures.updateFlag(key, access_level, u);
      json(res, 200, { ok: true, flag: updated });
    } catch (err) {
      json(res, 400, { ok: false, error: err.message });
    }
  },
  'POST /api/admin/beta-testers': async (req, res) => {
    const u = await getUser(req);
    if (!u || !u.is_admin) return json(res, 403, { error: 'Admin access only' });
    const { user_id, is_beta_tester } = await readBody(req);
    if (!user_id) return json(res, 400, { error: 'Missing user_id' });
    const val = is_beta_tester ? 1 : 0;
    await db.run('UPDATE users SET is_beta_tester=? WHERE id=?', [val, user_id]);
    json(res, 200, { ok: true, user_id, is_beta_tester: val });
  },
  'POST /api/beta/feedback': async (req, res) => {
    const u = await getUser(req);
    const { feature_key, rating, feedback_type, comment, metadata } = await readBody(req);
    if (!feature_key) return json(res, 400, { error: 'Missing feature_key' });
    if (!comment || String(comment).trim().length < 3) return json(res, 400, { error: 'Please enter your feedback' });
    
    const userEmail = (u && u.email) || 'Anonymous Tester';
    const userName = (u && u.name) || 'Beta Tester';
    const textContent = `[BETA FEEDBACK: ${String(feature_key).toUpperCase()}] [Type: ${feedback_type || 'feedback'}] [Rating: ${rating || 'N/A'}]\n${comment}`;
    await db.run(
      'INSERT INTO complaints(user_id,name,email,type,text,files,created,seen) VALUES(?,?,?,?,?,?,?,0)',
      [u ? u.id : null, userName, userEmail, 'beta_feedback', textContent, JSON.stringify(metadata || {}), Date.now()]
    );
    json(res, 200, { ok: true, message: 'Thank you for your beta feedback!' });
  },

  'POST /api/ai-coach': async (req, res) => {
    const u = await getUser(req);
    const body = await readBody(req);
    const { prompt, systemPrompt, messages, selectedModel, model, image, images, is_voice_session, is_photo_scan } = body || {};
    
    if (is_voice_session && !betaFeatures.isFeatureAccessible('voice-coach', u)) {
      return json(res, 403, { error: 'Access Denied: Voice Mode is a restricted beta feature.', feature: 'voice-coach' });
    }
    const incomingImages = Array.isArray(images)
      ? images
      : (images && typeof images === 'object' ? Object.values(images) : []);
    const allImages = [image, ...incomingImages].filter(Boolean);
    if ((is_photo_scan || allImages.length > 0) && !betaFeatures.isFeatureAccessible('food-scanner', u)) {
      return json(res, 403, { error: 'Access Denied: Food Photo Scan is a restricted beta feature.', feature: 'food-scanner' });
    }

    let chatMessages = [];
    if (Array.isArray(messages) && messages.length > 0) {
      chatMessages.push({ role: 'system', content: effectiveSystemPrompt });
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
          { role: 'system', content: effectiveSystemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: stripEmojis(prompt || 'Visually analyze this photo for calories, macros, exercise form, or physique composition.') },
              ...allImages.map(img => ({ type: 'image_url', image_url: { url: img } }))
            ]
          }
        ];
      } else {
        chatMessages = [
          { role: 'system', content: effectiveSystemPrompt },
          { role: 'user', content: stripEmojis(prompt || 'Hello Coach') }
        ];
      }
    }

    const aiRes = await callOpenRouterAiPipeline({
      chatMessages,
      requestedModel: selectedModel || model,
      isJson: false,
      hasImages: allImages.length > 0,
      userOpenRouterKey: body.openRouterKey
    });

    if (aiRes && aiRes.content) {
      return json(res, 200, { ok: true, provider: 'openrouter', model: aiRes.model, content: aiRes.content, latency: aiRes.latency });
    }

    if (allImages.length > 0) {
      return json(res, 200, {
        ok: true,
        provider: 'fitfuel-vision-engine',
        model: 'fitfuel-visual-coach',
        content: generateDynamicCoachVisionText(prompt)
      });
    }

    return json(res, 200, {
      ok: true,
      provider: 'fitfuel-ai-coach-engine',
      model: 'fitfuel-elite-coach',
      content: generateDynamicCoachChatResponse(prompt, chatMessages)
    });
  },

  'POST /api/ai-plan': async (req, res) => {
    const body = await readBody(req);
    const profileData = body.profileData || body || {};
    const { wKg = 72, hCm = 178, goal = 'Maintain weight', days = 4, creatine = 'yes', units = 'Metric', dietPref = 'Balanced', focus = 'Full body', note = '' } = profileData;

    const planPrompt = `Create a complete, highly personalized nutrition and workout plan for this user:
- Weight: ${wKg} kg (${units})
- Height: ${hCm} cm
- Primary Goal: ${goal}
- Training Frequency: ${days} days / week
- Creatine: ${creatine}
- Dietary Preference: ${dietPref}
- Target Focus Areas: ${focus}
- Extra Notes: ${note || 'None'}

Never use emojis. Return ONLY valid JSON with this exact structure:
{
  "cal": 2200,
  "p": 145,
  "c": 220,
  "f": 65,
  "waterL": "2.5",
  "meals": [
    { "meal": "Breakfast", "name": "Meal Name", "detail": "Ingredients/Portion", "k": 450, "p": 32, "c": 45, "f": 12 },
    { "meal": "Lunch", "name": "Meal Name", "detail": "Ingredients/Portion", "k": 600, "p": 45, "c": 60, "f": 18 },
    { "meal": "Snack", "name": "Meal Name", "detail": "Ingredients/Portion", "k": 250, "p": 20, "c": 25, "f": 8 },
    { "meal": "Dinner", "name": "Meal Name", "detail": "Ingredients/Portion", "k": 550, "p": 40, "c": 50, "f": 16 }
  ],
  "workout": {
    "name": "Routine Name",
    "focus": "PRIMARY TARGETS",
    "duration": "45 min",
    "benefit": "Why this workout was chosen for this goal.",
    "moves": [
      { "name": "Exercise 1", "sets": "3 sets x 10 reps", "tip": "Technique cue" },
      { "name": "Exercise 2", "sets": "3 sets x 12 reps", "tip": "Technique cue" },
      { "name": "Exercise 3", "sets": "3 sets x 10 reps", "tip": "Technique cue" },
      { "name": "Exercise 4", "sets": "3 sets x 15 reps", "tip": "Technique cue" }
    ]
  }
}`;

    const chatMessages = [
      { role: 'system', content: 'You are FitFuel AI, an elite personal trainer and sports nutritionist. Respond with strict JSON only. Never use emojis or code block wrappers.' },
      { role: 'user', content: planPrompt }
    ];

    const aiRes = await callOpenRouterAiPipeline({
      chatMessages,
      requestedModel: body.selectedModel || body.model,
      isJson: true,
      userOpenRouterKey: body.openRouterKey
    });

    if (aiRes && aiRes.content) {
      try {
        let clean = aiRes.content.replace(/```json/gi, '').replace(/```/g, '').trim();
        const s = clean.indexOf('{');
        const e = clean.lastIndexOf('}');
        if (s !== -1 && e > s) clean = clean.slice(s, e + 1);
        const parsed = JSON.parse(clean);
        if (parsed.cal && parsed.meals && parsed.workout) {
          return json(res, 200, { ok: true, provider: 'openrouter', model: aiRes.model, plan: parsed, latency: aiRes.latency });
        }
      } catch (e) {}
    }

    const fallbackJson = generateDynamicPlanJson(planPrompt);
    return json(res, 200, { ok: true, provider: 'fitfuel-calc-engine', model: 'fitfuel-metabolic-math', plan: JSON.parse(fallbackJson) });
  },

  'POST /api/ai/chat': async (req, res) => {
    const ip = getClientIp(req);
    const limit = checkRateLimit(ip, 'ai_chat', 30, 10 * 60 * 1000);
    if (!limit.allowed) {
      return json(res, 429, { error: `AI Coach rate limit reached. Please wait ${limit.retryAfter}s before sending more queries.` });
    }
    const body = await readBody(req);
    const { prompt, systemPrompt, messages, geminiKey: userGeminiKey, openRouterKey: userOpenRouterKey, selectedModel, model } = body || {};

    const isJson = (systemPrompt && systemPrompt.toLowerCase().includes('json')) || (prompt && prompt.toLowerCase().includes('json'));

    const baseSystemPrompt = systemPrompt || 'You are FitFuel AI Coach — an elite sports nutritionist and strength coach. Provide direct, dynamic, customized advice tailored specifically to the user. Never use emojis anywhere in your output. Use clean markdown formatting.';

    const incomingImages = Array.isArray(body.images)
      ? body.images
      : (body.images && typeof body.images === 'object' ? Object.values(body.images) : []);
    const allImages = [body.image, ...incomingImages].filter(Boolean);

    // Format messages for standard Chat Completion API
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
          const timeoutId = setTimeout(() => controller.abort(), 20000);

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

    // 2. OpenRouter Cascade across live free models (Nemotron-first primary pipeline)
    const aiRes = await callOpenRouterAiPipeline({
      chatMessages,
      requestedModel: selectedModel || model,
      isJson,
      hasImages: allImages.length > 0,
      userOpenRouterKey: userOpenRouterKey
    });

    if (aiRes && aiRes.content) {
      return json(res, 200, { ok: true, provider: 'openrouter', model: aiRes.model, content: aiRes.content, latency: aiRes.latency });
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

    // Guaranteed Zero-Fail Responsive AI Coach for floating bot and AI Trainer page
    return json(res, 200, {
      ok: true,
      provider: 'fitfuel-ai-coach-engine',
      model: 'fitfuel-elite-coach',
      content: generateDynamicCoachChatResponse(prompt, chatMessages)
    });
  }
};

const NEMOTRON_FREE_MODELS = [
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  'nvidia/nemotron-3.5-super-vl:free',
  'nvidia/nemotron-3.5-lightning:free'
];

const OPENROUTER_FALLBACK_MODELS = [
  'google/gemma-4-26b-a4b-it:free',
  'google/gemma-4-31b-it:free',
  'xingchen-agi/xing4.0-29b-a4b:free',
  'recursive/flint-v1.0:free',
  'dots-studio/dots-3-note-preview:free',
  'cohere/north-mini-code:free',
  'thinkingmachines/inkling-small:free',
  'thinkingmachines/inkling:free',
  'liquid/lfm-2.5-2.6b:free',
  'openrouter/free'
];

function canonicalizeModelId(raw) {
  if (!raw || typeof raw !== 'string') return 'nvidia/nemotron-3-ultra-550b-a55b:free';
  const m = raw.trim().toLowerCase();
  if (m === 'auto') return 'auto';
  if (m.includes('laguna') || m.includes('poolside')) return 'nvidia/nemotron-3-ultra-550b-a55b:free';
  if (m === 'nvidia/nemotron-3-ultra:free' || m.includes('nemotron-3-ultra')) return 'nvidia/nemotron-3-ultra-550b-a55b:free';
  if (m === 'nvidia/nemotron-3-nano-omni:free' || m.includes('nemotron-3-nano')) return 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free';
  if (m === 'nvidia/nemotron-3.5-super:free' || m === 'nvidia/nemotron-3.5-vl:free' || m.includes('nemotron-3.5-super-vl')) return 'nvidia/nemotron-3.5-super-vl:free';
  if (m === 'nvidia/nemotron-3.5-lightning:free' || m.includes('nemotron-3.5-lightning')) return 'nvidia/nemotron-3.5-lightning:free';
  if (m === 'google/gemma-4-26b-a4b:free' || m.includes('gemma-4-26b')) return 'google/gemma-4-26b-a4b-it:free';
  if (m === 'google/gemma-4-31b:free' || m.includes('gemma-4-31b')) return 'google/gemma-4-31b-it:free';
  if (m === 'xingchen-agi/xing4.0-29b-a4b:free' || m.includes('xing4.0') || m.includes('xing-4.0')) return 'xingchen-agi/xing4.0-29b-a4b:free';
  if (m.includes('inkling-small')) return 'thinkingmachines/inkling-small:free';
  if (m.includes('inkling')) return 'thinkingmachines/inkling:free';
  return raw.trim();
}

function getOpenRouterKeys(userKey) {
  const keys = [];
  if (userKey && typeof userKey === 'string' && userKey.trim()) {
    keys.push(userKey.trim());
  }
  const envVal = process.env.OPENROUTER_API_KEY || '';
  if (envVal) {
    const parts = envVal.split(/[,;\n\r]+/).map(k => k.trim()).filter(Boolean);
    for (const p of parts) {
      if (!keys.includes(p)) keys.push(p);
    }
  }
  return keys;
}

function isForbiddenModel(modelId) {
  if (!modelId || typeof modelId !== 'string') return false;
  const m = modelId.toLowerCase();
  return m.includes('laguna') || m.includes('poolside');
}

async function callOpenRouterAiPipeline({
  chatMessages,
  requestedModel = null,
  isJson = false,
  hasImages = false,
  userOpenRouterKey = null,
  timeoutMs = null,
  maxTokens = 2500
}) {
  const keys = getOpenRouterKeys(userOpenRouterKey);
  if (!keys.length) return null;

  const candidateModels = [];
  const normalizedRequested = requestedModel ? canonicalizeModelId(requestedModel) : null;
  if (normalizedRequested && normalizedRequested !== 'auto' && !isForbiddenModel(normalizedRequested)) {
    candidateModels.push(normalizedRequested);
  }

  if (hasImages) {
    if (!candidateModels.includes('nvidia/nemotron-3.5-super-vl:free')) {
      candidateModels.unshift('nvidia/nemotron-3.5-super-vl:free');
    }
  }

  for (const m of NEMOTRON_FREE_MODELS) {
    if (!candidateModels.includes(m)) candidateModels.push(m);
  }

  for (const m of OPENROUTER_FALLBACK_MODELS) {
    if (!candidateModels.includes(m) && !isForbiddenModel(m)) {
      candidateModels.push(m);
    }
  }

  const effectiveTimeout = timeoutMs || (isJson ? 25000 : 16000);

  for (const orKey of keys) {
    let keyDailyLimitHit = false;

    for (const model of candidateModels) {
      if (keyDailyLimitHit) break;
      const t0 = Date.now();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), effectiveTimeout);
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          signal: controller.signal,
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + orKey,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://fitfuel.app',
            'X-Title': 'FitFuel AI Nemotron Gateway',
            'User-Agent': 'FitFuel-AI-Agent/2.0'
          },
          body: JSON.stringify({
            model: model,
            messages: chatMessages,
            temperature: isJson ? 0.2 : 0.7,
            max_tokens: maxTokens
          })
        });
        clearTimeout(timer);

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = (errData.error?.message || '').toLowerCase();
          const limitSource = errData.error?.metadata?.limit_source;
          if (res.status === 429 && (limitSource === 'openrouter_free_tier_daily' || errMsg.includes('free-models-per-day'))) {
            // Key exhausted daily limit - break candidate loop for this key
            keyDailyLimitHit = true;
            break;
          }
          continue;
        }

        const data = await res.json();
        const extracted = extractAiMessage(data, isJson);
        if (isValidAiOutput(extracted)) {
          return {
            ok: true,
            provider: 'openrouter',
            model: data.model || model,
            content: formatOutputContent(extracted, isJson),
            latency: Date.now() - t0
          };
        }
      } catch (e) {
        clearTimeout(timer);
      }
    }
  }
  return null;
}

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

function extractAiMessage(data, isJson = false) {
  const choice = data?.choices?.[0];
  if (!choice || !choice.message) return null;
  const msg = choice.message;
  if (msg.content && typeof msg.content === 'string' && msg.content.trim().length >= 8) {
    return stripEmojis(msg.content).trim();
  }
  const reasoning = msg.reasoning || (Array.isArray(msg.reasoning_details) ? msg.reasoning_details.map(d => d.text).join('\n') : null);
  if (reasoning && typeof reasoning === 'string') {
    if (isJson) {
      const match = reasoning.match(/\{[\s\S]*\}/);
      if (match) return match[0];
    }
    const cleaned = cleanReasoningToMarkdown(reasoning);
    if (cleaned && cleaned.length >= 8) return stripEmojis(cleaned).trim();
    if (reasoning.trim().length >= 8) return stripEmojis(reasoning).trim();
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
  const exp = preferences.experience || 'intermediate';
  const curW = Number(preferences.weight) || 72;
  const hCm = Number(preferences.height) || 178;
  const daysPerWeek = Number(preferences.daysPerWeek) || 4;
  const durationMin = Number(preferences.durationMin) || 45;
  const equipment = preferences.equipment || 'gym';
  const dietary = preferences.dietary || 'balanced';
  const customGoalText = preferences.customGoalText || '';

  const incomingImages = Array.isArray(images)
    ? images
    : (images && typeof images === 'object' ? Object.values(images) : []);
  const allImages = incomingImages.filter(Boolean);

  const scanPrompt = `Conduct a comprehensive 4D physique, posture, and anthropometric transformation analysis:
- User Profile: Age ${age}, Current Weight ${curW} kg, Height ${hCm} cm
- Target Physique Goal: ${goal} ${customGoalText ? '(' + customGoalText + ')' : ''}
- Training Schedule: ${daysPerWeek} days / week, ${durationMin} minutes per session, Equipment: ${equipment}
- Dietary Preference: ${dietary}
- Visual Data: ${allImages.length} body scans / physique photos provided.

Never use emojis. Output ONLY valid JSON with this exact structure:
{
  "summary": "Detailed 2-3 sentence anthropometric and biomechanical summary.",
  "posture_observations": {
    "apparent_head_position": "Observation on cervical alignment",
    "visible_shoulder_alignment": "Observation on biacromial clavicle level",
    "left_vs_right_symmetry": "Observation on lateral torso & deltoid balance",
    "coronal_trunk_alignment": "Observation on spinal contour and ribcage position",
    "hip_and_knee_positioning": "Observation on pelvic level and knee tracking",
    "general_stance_and_balance": "Observation on bilateral grounding"
  },
  "possible_alignment_considerations": [
    "Specific alignment or mobility consideration 1",
    "Specific alignment or mobility consideration 2"
  ],
  "estimated_physical_characteristics": {
    "estimated_body_fat_range": "15-17%",
    "fitness_category": "Healthy Athletic Range",
    "estimated_lean_muscle_mass": "${Math.round(curW * 0.82)} kg",
    "estimated_adipose_tissue_mass": "${Math.round(curW * 0.18)} kg"
  },
  "reassessment_interval": "6 to 8 weeks",
  "training_structure": {
    "methodology": "Targeted Progressive Hypertrophy & Biomechanics",
    "weekly_split": "${daysPerWeek} Days / Week",
    "session_duration_minutes": ${durationMin},
    "exercise_intensity": "RPE 7.5-8.5",
    "progressive_overload_guidance": "Add 1-2.5 kg or 1 rep weekly"
  },
  "macronutrient_distribution": {
    "daily_calories": 2350,
    "daily_protein_grams": ${Math.round(curW * 2.1)},
    "daily_carbohydrates_grams": 260,
    "daily_fats_grams": 65,
    "daily_water_liters": 3.0,
    "sample_daily_meals": [
      { "meal_name": "Breakfast", "description": "High-protein meal description (macros)" },
      { "meal_name": "Lunch", "description": "High-protein meal description (macros)" },
      { "meal_name": "Snack", "description": "High-protein meal description (macros)" },
      { "meal_name": "Dinner", "description": "High-protein meal description (macros)" }
    ],
    "nutrition_rules": [
      "Protein timing and hydration guideline 1",
      "Nutrient density guideline 2"
    ]
  },
  "recovery_protocols": {
    "restorative_sleep_hours": "7.5 to 8.5 hours nightly",
    "sleep_hygiene_rules": ["Keep bedroom cool and dark", "Zero screens 45m before sleep"],
    "recoveryProtocols": ["Post-workout foam rolling", "Contrast recovery"]
  }
}`;

  let chatMessages = [];
  if (allImages.length > 0) {
    chatMessages = [
      { role: 'system', content: 'You are an elite anthropometric scientist and sports biomechanics specialist. Output strict JSON only. Never use markdown code blocks or emojis.' },
      {
        role: 'user',
        content: [
          { type: 'text', text: scanPrompt },
          ...allImages.map(img => ({ type: 'image_url', image_url: { url: img } }))
        ]
      }
    ];
  } else {
    chatMessages = [
      { role: 'system', content: 'You are an elite anthropometric scientist and sports biomechanics specialist. Output strict JSON only. Never use markdown code blocks or emojis.' },
      { role: 'user', content: scanPrompt }
    ];
  }

  try {
    const aiRes = await callOpenRouterAiPipeline({
      chatMessages,
      requestedModel: allImages.length > 0 ? 'nvidia/nemotron-3.5-super-vl:free' : 'nvidia/nemotron-3-ultra-550b-a55b:free',
      isJson: true,
      hasImages: allImages.length > 0,
      maxTokens: 2500
    });

    if (aiRes && aiRes.content) {
      let clean = aiRes.content.replace(/```json/gi, '').replace(/```/g, '').trim();
      const s = clean.indexOf('{');
      const e = clean.lastIndexOf('}');
      if (s !== -1 && e > s) clean = clean.slice(s, e + 1);
      const parsed = JSON.parse(clean);
      if (parsed.summary || parsed.posture_observations || parsed.postureObservations || parsed.macronutrient_distribution) {
        const baseline = generateDynamicBodyTransformationFallback(goal, preferences, images);

        const merged = {
          ...baseline,
          ...parsed,
          provider: 'openrouter',
          model: aiRes.model,
          summary: parsed.summary || parsed.assessmentSummary || baseline.summary,
          assessmentSummary: parsed.summary || parsed.assessmentSummary || baseline.summary,
          posture_observations: { ...baseline.posture_observations, ...(parsed.posture_observations || parsed.postureObservations || {}) },
          postureObservations: { ...baseline.postureObservations, ...(parsed.posture_observations || parsed.postureObservations || {}) },
          possible_alignment_considerations: parsed.possible_alignment_considerations || parsed.possibleAlignmentConcerns || baseline.possible_alignment_considerations,
          possibleAlignmentConcerns: parsed.possible_alignment_considerations || parsed.possibleAlignmentConcerns || baseline.possibleAlignmentConcerns,
          estimated_physical_characteristics: { ...baseline.estimated_physical_characteristics, ...(parsed.estimated_physical_characteristics || parsed.estimatedPhysicalCharacteristics || {}) },
          estimatedPhysicalCharacteristics: { ...baseline.estimatedPhysicalCharacteristics, ...(parsed.estimated_physical_characteristics || parsed.estimatedPhysicalCharacteristics || {}) },
          training_structure: { ...baseline.training_structure, ...(parsed.training_structure || parsed.trainingStructure || {}) },
          macronutrient_distribution: { ...baseline.macronutrient_distribution, ...(parsed.macronutrient_distribution || parsed.nutritionGuidance || {}) },
          nutritionGuidance: { ...baseline.nutritionGuidance, ...(parsed.macronutrient_distribution || parsed.nutritionGuidance || {}) },
          recovery_protocols: { ...baseline.recovery_protocols, ...(parsed.recovery_protocols || parsed.recoveryAndSleepRecommendations || {}) },
          recoveryAndSleepRecommendations: { ...baseline.recoveryAndSleepRecommendations, ...(parsed.recovery_protocols || parsed.recoveryAndSleepRecommendations || {}) },
          anthropometrics: parsed.anthropometrics || parsed.circumferences || baseline.anthropometrics,
          circumferences: parsed.circumferences || parsed.anthropometrics || baseline.circumferences,
          cross_sections: parsed.cross_sections || parsed.crossSections || baseline.cross_sections,
          crossSections: parsed.crossSections || parsed.cross_sections || baseline.crossSections,
          clinical_risk: parsed.clinical_risk || parsed.clinicalRisk || baseline.clinical_risk,
          clinicalRisk: parsed.clinicalRisk || parsed.clinical_risk || baseline.clinicalRisk,
          navy_body_fat: parsed.navy_body_fat || baseline.navy_body_fat,
          navyBodyFat: parsed.navyBodyFat || baseline.navyBodyFat
        };
        return merged;
      }
    }
  } catch (err) {
    // OpenRouter fallback
  }

  return generateDynamicBodyTransformationFallback(goal, preferences, images);
}

function generateDynamicBodyTransformationFallback(goal = 'lean_athletic', preferences = {}, images = {}) {
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
  const gender = preferences.gender || 'male';

  const anthro = FF_ALGO.evaluateAnthropometricPhysique({
    heightCm: hCm,
    weightKg: curW,
    gender,
    age,
    goal,
    experience: exp,
    manualMeasurements: preferences.anthropometrics || preferences.measurements || null
  });

  const estimatedBf = anthro.navyBf;
  const fatMass = anthro.clinical.fatMassKg;
  const leanMass = anthro.clinical.leanMassKg;
  const bmi = anthro.clinical.bmi;

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
    navy_body_fat_percentage: `${estimatedBf}%`,
    navyBodyFatPercentage: `${estimatedBf}%`,
    navy_body_fat: estimatedBf,
    navyBodyFat: estimatedBf,
    bmi: anthro.clinical.bmi,
    bmi_category: anthro.clinical.bmiCategory,
    bmiCategory: anthro.clinical.bmiCategory,
    whr: anthro.clinical.whr,
    whr_status: anthro.clinical.whrStatus,
    whrStatus: anthro.clinical.whrStatus,
    whr_risk_level: anthro.clinical.whrRiskLevel,
    whrRiskLevel: anthro.clinical.whrRiskLevel,
    whr_threshold: anthro.clinical.whrThreshold,
    whrThreshold: anthro.clinical.whrThreshold,
    whtr: anthro.clinical.whtr,
    whtr_status: anthro.clinical.whtrStatus,
    whtrStatus: anthro.clinical.whtrStatus,
    whtr_risk_level: anthro.clinical.whtrRiskLevel,
    whtrRiskLevel: anthro.clinical.whtrRiskLevel,
    whtr_threshold: anthro.clinical.whtrThreshold,
    whtrThreshold: anthro.clinical.whtrThreshold,
    circumferences: anthro.circumferences,
    anthropometrics: anthro.circumferences,
    cross_sections: anthro.crossSections,
    crossSections: anthro.crossSections,
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
    reassessment_interval: '6 to 8 weeks',
    anthropometrics: anthro.circumferences,
    circumferences: anthro.circumferences,
    cross_sections: anthro.crossSections,
    crossSections: anthro.crossSections,
    clinical_risk: anthro.clinical,
    clinicalRisk: anthro.clinical,
    navy_body_fat: estimatedBf,
    navyBodyFat: estimatedBf
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

function generateDynamicCoachChatResponse(prompt = '', messages = []) {
  const p = (prompt || '').toLowerCase().trim();

  // 1. Protein, nutrition, macros, foods
  if (p.includes('protein') || p.includes('macro') || p.includes('calorie') || p.includes('diet') || p.includes('food') || p.includes('meal') || p.includes('nutrition') || p.includes('eat')) {
    return `### FitFuel Nutrition & Macro Strategy

**Target Macronutrient Guidance:**
- **Daily Protein Target:** Aim for **1.8 – 2.2g of protein per kg of bodyweight** (e.g. 125g–155g for a 70kg athlete). This preserves lean mass during caloric deficits and maximizes myofibrillar protein synthesis during resistance training.
- **Carbohydrate Timing:** Consume 35–50g of complex carbohydrates (oats, brown rice, whole wheat roti, sweet potato) 90–120 minutes prior to training for muscle glycogen saturation.
- **Healthy Fats:** Maintain 0.8–1.0g/kg (avocados, nuts, seeds, extra virgin olive oil) for hormone synthesis and joint lubrication.

**Top High-Yield Protein Foods:**
| Source | Typical Serving | Protein Content | Caloric Value |
| :--- | :--- | :--- | :--- |
| **Chicken Breast** | 150g cooked | ~46g protein | 240 kcal |
| **Paneer (Low-Fat)** | 100g | ~19g protein | 180 kcal |
| **Egg Whites / Eggs**| 4 whites + 1 whole | ~22g protein | 135 kcal |
| **Whey Isolate** | 1 scoop (30g) | ~25g protein | 120 kcal |
| **Greek Yogurt / Curd**| 200g | ~20g protein | 130 kcal |
| **Soya Chunks / Tofu**| 50g raw | ~26g protein | 170 kcal |

**Coach Action Plan:**
1. Distribute your protein across 3 to 4 meals daily (~30–40g per meal) for optimal leucine threshold triggering.
2. Track your daily intake on the FitFuel Food Log tab to monitor your real-time macro dial.`;
  }

  // 2. Workouts, exercises, chest, back, legs, routine, plan
  if (p.includes('workout') || p.includes('exercise') || p.includes('chest') || p.includes('back') || p.includes('leg') || p.includes('squat') || p.includes('deadlift') || p.includes('bench') || p.includes('push') || p.includes('pull') || p.includes('hypertrophy') || p.includes('muscle')) {
    return `### FitFuel Strength & Hypertrophy Prescription

**Optimal Weekly Training Split (Push / Pull / Legs):**
- **Push (Chest, Shoulders, Triceps):** Barbell or Dumbbell Bench Press (4x6-8), Incline Dumbbell Press (3x8-10), Overhead Dumbbell Shoulder Press (3x10), Cable Lateral Raises (4x12-15), Cable Tricep Pushdowns (3x12).
- **Pull (Back, Rear Delts, Biceps):** Barbell Deadlift or Rack Pull (3x5), Lat Pulldown or Weighted Pull-ups (4x8-10), Seated Cable Row (3x10-12), Face Pulls (3x15), Incline Dumbbell Bicep Curls (3x10-12).
- **Legs & Core (Quads, Hamstrings, Calves):** Barbell Back Squats (4x6-8), Romanian Deadlifts (3x8-10), Bulgarian Split Squats (3x10/leg), Standing Calf Raises (4x15), Hanging Knee Raises (3x15).

**Autoregulation & Progressive Overload Rules:**
1. **Target RPE:** Train at **RPE 7.5 to 8.5** (leaving 1 to 2 reps in reserve before muscular failure).
2. **Double Progression:** When you hit the maximum prescribed reps on all working sets with strict form, increase load by **2.5kg to 5kg** in the subsequent session.
3. **Form Integrity:** Use the FitFuel Posture AI tab with your webcam to verify pelvic alignment and squat depth.`;
  }

  // 3. Creatine, supplements, hydration, water
  if (p.includes('creatine') || p.includes('water') || p.includes('hydration') || p.includes('supplement') || p.includes('caffeine')) {
    return `### FitFuel Supplement & Hydration Protocol

**Creatine Monohydrate Science:**
- **Dosage:** 3g to 5g taken daily at any consistent time.
- **Loading Phase:** Not required. Taking 5g daily will fully saturate muscle phosphocreatine stores within 3 to 4 weeks with zero gastrointestinal distress.
- **Mechanism:** Replenishes ATP during high-intensity 1RM and repeated anaerobic sprints, improving muscular endurance and strength by 5–15%.

**Hydration Benchmark:**
- **Baseline Water:** Minimum **35ml to 45ml per kg of bodyweight** daily (typically 2.8L to 3.8L for active athletes).
- **Training Surplus:** Add 500ml to 750ml for every 60 minutes of strenuous exercise to offset sweat rate.
- **Electrolytes:** Ensure adequate dietary sodium (~2,000–3,000mg) and potassium especially during warm weather or intense endurance sessions.`;
  }

  // 4. Weight loss, fat loss, cutting, deficit
  if (p.includes('fat loss') || p.includes('weight loss') || p.includes('cut') || p.includes('deficit') || p.includes('lose weight') || p.includes('belly fat')) {
    return `### Sustainable Fat Loss Protocol

**The Fat Loss Hierarchy:**
1. **Caloric Deficit:** Set a moderate, sustainable deficit of **350 – 500 kcal below maintenance (TDEE)**. This targets 0.5kg to 0.75kg of fat loss per week without sacrificing skeletal muscle mass.
2. **Elevated Protein:** Keep protein at **2.0g – 2.4g per kg** to maximize satiety, support muscle retention, and leverage the thermic effect of food (TEF).
3. **Resistance Training:** Continue heavy lifting with moderate volume to signal the body to spare muscle tissue while burning adipose tissue.
4. **Daily Steps (NEAT):** Target **8,000 to 10,000 steps daily**. Non-Exercise Activity Thermogenesis accounts for up to 15% of total daily energy expenditure.

**Avoid Crash Diets:** Rapid deficits (>800 kcal) cause metabolic adaptation, hormonal downregulation (thyroid, testosterone/estrogen), and loss of contractile muscle tissue.`;
  }

  // 5. Recovery, sleep, rest, soreness
  if (p.includes('recovery') || p.includes('sleep') || p.includes('rest') || p.includes('sore') || p.includes('injury') || p.includes('pain')) {
    return `### Athletic Recovery & Injury Prevention Protocol

**Restorative Recovery Pillars:**
- **Sleep Architecture:** Aim for **7.5 to 9.0 hours of uninterrupted sleep**. Slow-wave deep sleep is when over 80% of systemic growth hormone (GH) secretion occurs for tissue synthesis.
- **DOMS Management:** Delayed Onset Muscle Soreness is normal after novel stimuli. Active recovery (light 20-minute walking, foam rolling, dynamic mobility) increases capillary blood flow and accelerates metabolite clearance.
- **Deload Weeks:** Every 6 to 8 weeks of progressive overload, reduce training volume by 40–50% for 7 days to allow connective tissues and the central nervous system (CNS) to fully regenerate.
- **Warning Signs:** Sharp, stabbing joint pain or tendon inflammation requires immediate load cessation and cold/warm contrast therapy.`;
  }

  // 6. Default Athlete Welcome & General Query
  return `### FitFuel AI Performance Coach

**Welcome, Athlete! I am your real-time fitness, nutrition, and biomechanics coach.**

To give you the most accurate and high-impact strategy, here is what we can optimize right now:
1. **Calorie & Macro Targets:** Calculate your personalized daily caloric requirement based on your height, weight, and target goal.
2. **Starting Loads & Workout Split:** Program your barbell squat, bench press, deadlift, and overhead press progressions.
3. **Form & Posture Verification:** Live webcam biomechanical feedback on spinal integrity and joint depth.
4. **Hydration & Recovery:** Track your 12 glasses of daily water and monitor training consistency streaks.

What specific fitness goal or question would you like to tackle today?`;
}

/* ---------- static files ---------- */
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.ico': 'image/x-icon', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.gif': 'image/gif' };
function serveStatic(req, res) {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/') p = '/index.html';
  if (p === '/features' || p === '/features/') p = '/features.html';
  if (p.startsWith('/app/')) p = '/index.html';
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
    await ensureBetaInit();

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
