/* FitFuel API client — server se data save/load. Server na mile to localStorage pe chalta rehta hai. */
const FF = {
  token: typeof localStorage !== 'undefined' ? (localStorage.getItem('ff_token') || null) : null,
  user: null,
  online: false,
  _syncQ: [],
  _syncT: null,

  async req(method, path, body) {
    const h = { 'Content-Type': 'application/json' };
    if (this.token) h.Authorization = 'Bearer ' + this.token;
    let r;
    try {
      r = await fetch(path, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
    } catch (e) {
      if (location.protocol === 'file:')
        throw new Error('Website file:// pe khuli hai — server chahiye. Project folder me: npm start → phir http://localhost:3000 kholo');
      throw new Error('Server se connection nahi ho raha — terminal me "npm start" chalao, phir http://localhost:3000 kholo');
    }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || ('HTTP ' + r.status));
    return j;
  },

  /* returns {user, state} or null (401) — 'offline' on network error */
  async boot() {
    try {
      const me = await this.req('GET', '/api/auth/me');
      this.user = me.user;
      this.online = true;
      const data = await this.req('GET', '/api/data');
      this.user = data.user;
      return data;
    } catch (e) {
      const msg = String(e.message);
      if (msg.includes('Not logged in') || msg.includes('401') || msg.includes('Admin access')) { this.online = true; return null; }
      this.online = false;
      return 'offline';
    }
  },

  async register(name, email, contact, password) {
    const r = await this.req('POST', '/api/auth/register', { name, email, contact, password });
    this.token = r.token; this.user = r.user; this.online = true;
    localStorage.setItem('ff_token', r.token);
    return r.user;
  },
  async login(email, password) {
    const r = await this.req('POST', '/api/auth/login', { email, password });
    this.token = r.token; this.user = r.user; this.online = true;
    localStorage.setItem('ff_token', r.token);
    return r.user;
  },
  async logout() {
    try { await this.req('POST', '/api/auth/logout'); } catch (e) {}
    this.token = null; this.user = null;
    localStorage.removeItem('ff_token');
  },

  patch(state) {
    if (!this.online || !this.token) return Promise.resolve();
    Object.assign(this._syncQ[0] || (this._syncQ[0] = {}), state);
    clearTimeout(this._syncT);
    this._syncT = setTimeout(() => this._flush(), 700);
    return Promise.resolve();
  },
  async _flush() {
    const body = this._syncQ.shift();
    if (!body) return;
    try { await this.req('PUT', '/api/state', body); }
    catch (e) { /* server band — local copy safe hai */ }
  },
  async flushNow() {
    clearTimeout(this._syncT);
    while (this._syncQ.length) await this._flush();
  },
  async addWeight(wKg) { await this.req('POST', '/api/weight', { wKg, date: new Date().toISOString().slice(0, 10) }); },
  async addWorkoutDone(name) { await this.req('POST', '/api/workout', { name, date: new Date().toISOString().slice(0, 10) }); },

  /* saved plans */
  async getPlans() { const r = await this.req('GET', '/api/plans'); return r.plans; },
  async savePlan(plan) { const r = await this.req('POST', '/api/plans', { plan }); return r.id; },
  async deletePlan(id) { await this.req('DELETE', '/api/plans', { id }); },

  /* complaints */
  async sendComplaint(name, type, text, files) { await this.req('POST', '/api/complaint', { name, type, text, files }); },

  /* admin */
  async adminUsers() { const r = await this.req('GET', '/api/admin/users'); return r.users; },
  async adminComplaints() { const r = await this.req('GET', '/api/complaints'); return r.complaints; },
  async adminDeleteUser(id) { await this.req('DELETE', '/api/admin/user', { id }); }
};
