
function safeJsonParse(raw) {
  if (!raw) throw new Error('Empty AI response');
  if (typeof raw === 'object') return raw;

  let clean = String(raw).replace(/```json/gi, '').replace(/```/g, '').trim();

  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    clean = clean.slice(start, end + 1);
  }

  try {
    return JSON.parse(clean);
  } catch (e1) {
    let repaired = clean
      .replace(/,\s*([\}\]])/g, '$1')
      .replace(/([{,]\s*)'([^']+)'(\s*:)/g, '$1"$2"$3')
      .replace(/:\s*'([^']*)'/g, ':"$1"');
    try {
      return JSON.parse(repaired);
    } catch (e2) {
      try {
        const fn = new Function('return (' + clean + ')');
        const res = fn();
        if (res && typeof res === 'object') return res;
      } catch (e3) {}
    }
  }
  throw new Error('Could not parse AI response');
}

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

  async register(name, email, contact, password, autoLogin = false) {
    const r = await this.req('POST', '/api/auth/register', { name, email, contact, password });
    if (autoLogin) {
      this.token = r.token; this.user = r.user; this.online = true;
      localStorage.setItem('ff_token', r.token);
    } else {
      this.token = null; this.user = null;
      localStorage.removeItem('ff_token');
    }
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
  async sendComplaint(name, email, type, text, files) { await this.req('POST', '/api/complaint', { name, email, type, text, files }); },

  /* data erasure & account deletion */
  async eraseData() {
    if (this.online && this.token) {
      await this.req('POST', '/api/user/erase-data');
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('ff_log');
      localStorage.removeItem('ff_water');
      localStorage.removeItem('ff_custom');
      localStorage.removeItem('ff_plan');
      localStorage.removeItem('ff_weights');
      localStorage.removeItem('ff_workouts');
    }
    return true;
  },

  async deleteAccount() {
    if (this.online && this.token) {
      await this.req('POST', '/api/user/delete-account');
    }
    await this.logout();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    return true;
  },

  /* admin */
  async adminUsers() { const r = await this.req('GET', '/api/admin/users'); return r.users; },
  async adminComplaints() { const r = await this.req('GET', '/api/complaints'); return r.complaints; },
  async adminUpdateComplaintStatus(id, status, admin_notes) { return await this.req('PATCH', '/api/complaint/status', { id, status, admin_notes }); },
  async adminDeleteComplaint(id) { return await this.req('DELETE', '/api/complaint', { id }); },
  async adminStats() { return await this.req('GET', '/api/admin/stats'); },
  async adminDeleteUser(id) { await this.req('DELETE', '/api/admin/user', { id }); },

    safeJsonParse: safeJsonParse,

  /* Live AI Engine with Multi-Provider Cascade (Google Gemini & OpenRouter) */
  getGeminiKey() {
    return (typeof localStorage !== 'undefined' ? localStorage.getItem('ff_gemini_key') : '') || '';
  },
  getOpenRouterKey() {
    return (typeof localStorage !== 'undefined' ? localStorage.getItem('ff_openrouter_key') : '') || '';
  },
  freeModels: [
    'openrouter/free',
    'minimax/minimax-m3.1-flash:free',
    'nvidia/nemotron-3.5-lightning:free',
    'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
    'nvidia/nemotron-3.5-super-vl:free'
  ],

  async callAI(prompt, systemPrompt = 'You are an elite sports nutritionist and fitness AI coach.', messages = null) {
    const geminiKey = this.getGeminiKey();
    const openRouterKey = this.getOpenRouterKey();
    const isJson = (systemPrompt && systemPrompt.toLowerCase().includes('json')) || (prompt && prompt.toLowerCase().includes('json'));

    const baseSystemPrompt = (systemPrompt ? systemPrompt + ' ' : '') + 'Never use emojis in your response. Output clean, professional markdown only.';

    // 1. Try server endpoint first (connects to OpenRouter free models via backend .env)
    let lastError = null;
    try {
      const res = await this.req('POST', '/api/ai/chat', { prompt, systemPrompt: baseSystemPrompt, messages, geminiKey, openRouterKey });
      if (res && res.content && String(res.content).trim()) {
        return stripEmojis(res.content).trim();
      }
    } catch (e) {
      lastError = e;
    }

    // 2. Direct client Google Gemini call if user configured personal Gemini API key
    if (geminiKey) {
      try {
        const geminiContents = Array.isArray(messages) && messages.length > 0
          ? messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: stripEmojis(m.content || m.text) }] }))
          : [{ role: 'user', parts: [{ text: stripEmojis(prompt) }] }];

        const gResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: baseSystemPrompt }] },
            contents: geminiContents,
            generationConfig: { temperature: isJson ? 0.2 : 0.7, maxOutputTokens: 2500 }
          })
        });
        if (gResp.ok) {
          const gData = await gResp.json();
          const text = gData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (isValidAiOutput(text)) return stripEmojis(text).trim();
        }
      } catch (err) {}
    }

    // 3. Cascade across free OpenRouter models directly from client if client key present
    const activeOrKey = openRouterKey;
    if (activeOrKey) {
      const clientMessages = Array.isArray(messages) && messages.length > 0
        ? [{ role: 'system', content: baseSystemPrompt }, ...messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: stripEmojis(m.content || m.text) }))]
        : [{ role: 'system', content: baseSystemPrompt }, { role: 'user', content: stripEmojis(prompt) }];

      const fetchModel = async (model, timeoutMs = 25000) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            signal: controller.signal,
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + activeOrKey,
              'Content-Type': 'application/json',
              'HTTP-Referer': typeof location !== 'undefined' ? location.origin : 'https://fitfuel.app',
              'X-Title': 'FitFuel AI Live Coach'
            },
            body: JSON.stringify({
              model: model,
              messages: clientMessages,
              temperature: isJson ? 0.2 : 0.6,
              max_tokens: 2200,
              reasoning: { max_tokens: 120 }
            })
          });
          clearTimeout(timeoutId);
          if (!resp.ok) throw new Error('Status ' + resp.status);
          const data = await resp.json();
          const extracted = extractAiMessage(data);
          if (isValidAiOutput(extracted)) return extracted;
          throw new Error('Invalid or error content from ' + model);
        } catch (err) {
          clearTimeout(timeoutId);
          throw err;
        }
      };

      const clientModels = [
        'minimax/minimax-m3.1-flash:free',
        'openrouter/free',
        'nvidia/nemotron-3.5-lightning:free',
        'liquid/lfm-2.5-2.6b:free'
      ];
      for (const model of clientModels) {
        try {
          const content = await fetchModel(model, 20000);
          if (content) return content;
        } catch (e) {}
      }
    }

    // 4. Fallback Handling:
    // If structured JSON was requested, generate dynamic mathematical plan
    if (isJson) {
      if (prompt && (prompt.toLowerCase().includes('food item') || prompt.toLowerCase().includes('meal description') || prompt.toLowerCase().includes('portiongrams'))) {
        return generateDynamicFoodJson(prompt);
      }
      return generateDynamicPlanJson(prompt);
    }

    // For user chat queries, NEVER return canned answers. Provide clean error status.
    throw new Error(lastError?.message || 'FitFuel AI Coach models are currently busy upstream. Please retry your question in a moment or add a custom API key in Settings.');
  },

  async aiPredictFood(foodName, meal = 'Snack') {
    const prompt = `Analyze this food item or meal description: "${foodName}". Meal type: "${meal}".
Estimate the standard serving size, calories, protein, carbs, and fat. Never use emojis.
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
    try {
      const raw = await this.callAI(prompt, 'You are an accurate nutritional database and AI nutrition analyzer. Respond with strict JSON only.');
      return safeJsonParse(raw);
    } catch (e) {
      const fallback = generateDynamicFoodJson(prompt);
      return safeJsonParse(fallback);
    }
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
    "focus": "PRIMARY MUSCLE TARGETS",
    "duration": "40 min",
    "benefit": "Why this workout was chosen for this goal.",
    "moves": [
      { "name": "Exercise 1", "sets": "3 sets x 10 reps", "tip": "Key technique cue" },
      { "name": "Exercise 2", "sets": "3 sets x 12 reps", "tip": "Key technique cue" },
      { "name": "Exercise 3", "sets": "3 sets x 10 reps", "tip": "Key technique cue" },
      { "name": "Exercise 4", "sets": "3 sets x 15 reps", "tip": "Key technique cue" }
    ]
  }
}`;
    try {
      const raw = await this.callAI(prompt, 'You are FitFuel AI, an elite personal trainer and sports nutritionist. Respond with strict JSON only.');
      return safeJsonParse(raw);
    } catch (e) {
      const fallback = generateDynamicPlanJson(prompt);
      return safeJsonParse(fallback);
    }
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
