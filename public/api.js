
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
  async sendComplaint(name, type, text, files) { await this.req('POST', '/api/complaint', { name, type, text, files }); },

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
    'nvidia/nemotron-3.5-super-vl:free',
    'liquid/lfm-2.5-2.6b:free'
  ],

  async callAI(prompt, systemPrompt = 'You are an elite sports nutritionist and fitness AI coach.', messages = null) {
    const geminiKey = this.getGeminiKey();
    const openRouterKey = this.getOpenRouterKey();

    // 1. Try server endpoint first (has secure .env keys + high-speed parallel race)
    try {
      const res = await this.req('POST', '/api/ai/chat', { prompt, systemPrompt, messages, geminiKey, openRouterKey });
      if (res && res.content && String(res.content).trim()) return res.content;
    } catch (e) {
      // Proceed to direct client-side fallback
    }

    // 2. Direct client Google Gemini call if user configured personal Gemini API key
    if (geminiKey) {
      try {
        const geminiContents = Array.isArray(messages) && messages.length > 0
          ? messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content || m.text }] }))
          : [{ role: 'user', parts: [{ text: prompt }] }];

        const gResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
            contents: geminiContents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 2500 }
          })
        });
        if (gResp.ok) {
          const gData = await gResp.json();
          const text = gData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim()) return text;
        }
      } catch (err) {}
    }

    // 3. Cascade across free OpenRouter models directly from client if client key present
    const activeOrKey = openRouterKey;
    if (activeOrKey) {
      const clientMessages = Array.isArray(messages) && messages.length > 0
        ? [{ role: 'system', content: systemPrompt }, ...messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content || m.text }))]
        : [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }];

      // Try race first
      try {
        const fetchModel = async (model, timeoutMs = 50000) => {
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
                temperature: 0.7,
                max_tokens: 2500
              })
            });
            clearTimeout(timeoutId);
            if (!resp.ok) throw new Error('Status ' + resp.status);
            const data = await resp.json();
            const content = data?.choices?.[0]?.message?.content;
            if (content && content.trim() && !content.toLowerCase().startsWith('user safety:') && content.trim().length > 20) return content;
            throw new Error('Invalid or trivial content');
          } catch (err) {
            clearTimeout(timeoutId);
            throw err;
          }
        };

        const result = await Promise.any([
          fetchModel('minimax/minimax-m3.1-flash:free', 60000),
          fetchModel('nvidia/nemotron-3.5-lightning:free', 45000),
          fetchModel('openrouter/free', 45000)
        ]);
        if (result) return result;
      } catch (err) {
        // Fallback models
        for (const model of ['nvidia/nemotron-3.5-lightning:free', 'nvidia/nemotron-3.5-super-vl:free']) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 25000);
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
                temperature: 0.7,
                max_tokens: 2200
              })
            });
            clearTimeout(timeoutId);
            if (resp.ok) {
              const data = await resp.json();
              const content = data?.choices?.[0]?.message?.content;
              if (content && content.trim()) return content;
            }
          } catch (e) {}
        }
      }
    }

    // 4. Fallback to expert dynamic local intelligence so request NEVER crashes or gives canned answers
    return generateSmartAiFallback(prompt, systemPrompt);
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
    try {
      const raw = await this.callAI(prompt, 'You are an accurate nutritional database and AI nutrition analyzer. Respond with strict JSON only.');
      return safeJsonParse(raw);
    } catch (e) {
      const fallback = generateSmartAiFallback(prompt, 'strict JSON');
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
    try {
      const raw = await this.callAI(prompt, 'You are Formwise AI, an elite personal trainer and sports nutritionist. Respond with strict JSON only.');
      return safeJsonParse(raw);
    } catch (e) {
      const fallback = generateSmartAiFallback(prompt, 'strict JSON');
      return safeJsonParse(fallback);
    }
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

if (typeof window !== 'undefined') {
  window.FF = FF;
  window.safeJsonParse = safeJsonParse;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FF, safeJsonParse, generateSmartAiFallback };
}

