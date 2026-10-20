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
  async adminDeleteUser(id) { await this.req('DELETE', '/api/admin/user', { id }); },

  /* OpenRouter Free AI Engine with Cascade Failover */
  openRouterKey: (typeof localStorage !== 'undefined' ? localStorage.getItem('ff_openrouter_key') : '') || '',
  freeModels: [
    'openrouter/free',
    'minimax/minimax-m3.1-flash:free',
    'liquid/lfm-2.5-2.6b:free',
    'nvidia/nemotron-3.5-lightning:free'
  ],

  async callAI(prompt, systemPrompt = 'You are an elite sports nutritionist and fitness AI. Respond with valid JSON only.') {
    // 1. Try server endpoint first
    try {
      const res = await this.req('POST', '/api/ai/chat', { prompt, systemPrompt });
      if (res && res.content) return res.content;
    } catch (e) {
      // Proceed to direct client-side fallback
    }

    // 2. Cascade across free OpenRouter models
    for (const model of this.freeModels) {
      try {
        const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + this.openRouterKey,
            'Content-Type': 'application/json',
            'HTTP-Referer': typeof location !== 'undefined' ? location.origin : 'https://fitfuel.app',
            'X-Title': 'FitFuel AI Engine'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 850
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          if (data && data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
          }
        }
      } catch (err) {
        console.warn('AI fallback triggered from model:', model, err);
      }
    }
    throw new Error('All free AI models currently busy. Please try again.');
  },

  async aiPredictFood(foodName, meal = 'Snack') {
    const prompt = `Analyze this food item or meal description: "${foodName}". Meal type: "${meal}".
Estimate the standard serving size, calories, protein, carbs, and fat.
Return ONLY valid JSON matching this exact structure:
{
  "name": "Food Name",
  "detail": "Serving detail (e.g. 1 bowl / 150g)",
  "portionGrams": 150,
  "calories": 250,
  "protein": 12,
  "carbs": 35,
  "fat": 6
}`;
    const raw = await this.callAI(prompt, 'You are an accurate nutritional database and AI nutrition analyzer. Respond with strict JSON only.');
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Could not parse nutrition data');
    return JSON.parse(match[0]);
  },

  async aiGeneratePlan(profileData) {
    const prompt = `Create a complete, highly personalized nutrition and workout plan for this user:
- Weight: ${profileData.wKg} kg (${profileData.units})
- Height: ${profileData.hCm} cm
- Primary Goal: ${profileData.goal}
- Training Frequency: ${profileData.days} days / week
- Creatine: ${profileData.creatine}
- Dietary Preference: ${profileData.dietPref || 'Balanced'}
- Target Focus Areas: ${profileData.focus || 'Full body'}
- Extra Notes: ${profileData.note || 'None'}

Return ONLY valid JSON with this exact structure:
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
    "focus": "PRIMARY MUSCLE TARGETS",
    "duration": "40 min",
    "benefit": "Why this workout was chosen for this goal.",
    "moves": [
      { "name": "Exercise 1", "sets": "3 sets × 10 reps", "tip": "Key technique cue" },
      { "name": "Exercise 2", "sets": "3 sets × 12 reps", "tip": "Key technique cue" },
      { "name": "Exercise 3", "sets": "3 sets × 10 reps", "tip": "Key technique cue" },
      { "name": "Exercise 4", "sets": "3 sets × 15 reps", "tip": "Key technique cue" }
    ]
  }
}`;
    const raw = await this.callAI(prompt, 'You are Formwise AI, an elite personal trainer and sports nutritionist. Respond with strict JSON only.');
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Could not parse AI plan');
    return JSON.parse(match[0]);
  }
};
