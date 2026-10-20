
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

  /* OpenRouter Free AI Engine with Cascade Failover */
  openRouterKey: (typeof localStorage !== 'undefined' ? localStorage.getItem('ff_openrouter_key') : '') || '',
  freeModels: [
    'openrouter/free',
    'minimax/minimax-m3.1-flash:free',
    'liquid/lfm-2.5-2.6b:free',
    'nvidia/nemotron-3.5-lightning:free',
    'nvidia/nemotron-3.5-super-vl:free',
    'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
    'poolside/laguna-s-2.1:free',
    'google/gemma-4-31b-it:free',
    'google/gemma-4-26b-a4b-it:free'
  ],

  async callAI(prompt, systemPrompt = 'You are an elite sports nutritionist and fitness AI. Respond with valid JSON only.') {
    // 1. Try server endpoint first (handles key safely from .env)
    try {
      const res = await this.req('POST', '/api/ai/chat', { prompt, systemPrompt });
      if (res && res.content) return res.content;
    } catch (e) {
      // Proceed to direct client-side fallback
    }

    // 2. Cascade across free OpenRouter models directly from client
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
            max_tokens: 2500
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          if (data && data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
          }
        }
      } catch (err) {
        // Cascade to next free model
      }
    }

    // 3. Fallback to expert local intelligence so request NEVER fails
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

  // 3. Chat: Micronutrients Query
  if (lower.includes('micronutrient') || lower.includes('vitamin') || lower.includes('mineral')) {
    return '### 🥦 Essential Daily Micronutrients Guide\n\n' +
      'Here are the critical micronutrients you need daily and their best food sources:\n\n' +
      '• **Vitamin D3 & Calcium**: Essential for bone density, testosterone synthesis, and muscular contraction. Best from sunlight, whole eggs, fortified milk, paneer, and curd.\n' +
      '• **Vitamin B12**: Essential for red blood cell formation, energy metabolism, and nerve function. Found in chicken breast, eggs, fish, and dairy.\n' +
      '• **Iron**: Transports oxygen to working muscles. Best from spinach (palak), kala chana, lentils, and lean meat.\n' +
      '• **Magnesium**: Crucial for muscle relaxation, protein synthesis, and deep sleep recovery. Top sources: almonds, pumpkin seeds, rolled oats, and dark leafy greens.\n' +
      '• **Zinc**: Key for immune defense and hormonal optimization. Top sources: eggs, chickpeas (chole), pumpkin seeds, and chicken.\n' +
      '• **Potassium**: Regulates fluid balance and prevents cramping during heavy lifts. Found in bananas, sweet potatoes, coconut water, and watermelon.\n' +
      '• **Vitamin C**: Powerful antioxidant for collagen synthesis and joint health. Richest in guava (amrood, 220mg/100g), oranges, and broccoli.';
  }

  // 4. Chat: Upper / Lower Chest Query
  if (lower.includes('upper chest') || (lower.includes('chest') && (lower.includes('sets') || lower.includes('reps')))) {
    return '### 💪 Optimal Upper Chest Growth Protocol\n\n' +
      'The upper chest is formed by the **clavicular head** of the pectoralis major. Its fibers run upward at approximately a 30-45 degree angle towards your collarbone.\n\n' +
      '**Prescribed Routine & Biomechanics:**\n' +
      '1. **Incline Dumbbell Press (30° Bench)**\n' +
      '   • **Sets & Reps**: 3-4 sets × 8-10 reps (RPE 8-9)\n' +
      '   • **Tempo**: 2-1-1 (2s lower, 1s pause at deep chest stretch, explosive push)\n' +
      '   • **Why it works**: A 30° incline maximizes tension on clavicular fibers while minimizing front deltoid takeover.\n\n' +
      '2. **Low-to-High Cable Flyes**\n' +
      '   • **Sets & Reps**: 3 sets × 12-15 reps (60s rest)\n' +
      '   • **Why it works**: Provides continuous peak tension at full upper chest contraction at chin height.\n\n' +
      '3. **Incline Push-ups (Hands on floor, feet elevated)**\n' +
      '   • **Sets & Reps**: 3 sets to failure as a metabolic finisher.';
  }

  // 5. Chat: Fast Food & Hotel Food
  if (lower.includes('biryani') || lower.includes('pizza') || lower.includes('burger') || lower.includes('fast food') || lower.includes('hotel')) {
    return '### 🍕 How to Fit Hotel & Fast Food into Your Plan\n\n' +
      'You can enjoy hotel or fast food without ruining your progress using the **80/20 Flexible Dieting Rule**:\n\n' +
      '• **Chicken Biryani (~550-650 kcal per plate)**: Good protein source (~28-34g). Pair with cucumber raita, and keep your earlier meals lower in carbs and fats.\n' +
      '• **Pizza (~225 kcal per medium slice)**: Cap your intake at 2-3 slices (~450-675 kcal). Have a 1-scoop whey protein shake beforehand so you stay full and hit your protein target.\n' +
      '• **Burger (~380-450 kcal)**: Opt for grilled chicken over crispy fried. Skip extra mayo and sugary soda (choose water or zero-calorie soda).\n' +
      '• **Golden Rule**: Balance the higher calories by keeping your other meals today focused on lean protein (boiled eggs, chicken breast, or whey) and high-fiber veggies.';
  }

  // 6. Chat: Today's Adherence Audit
  if (lower.includes('today') || lower.includes('verify') || lower.includes('audit') || lower.includes('review')) {
    return '### 📊 Today\'s Health & Performance Audit\n\n' +
      '• **Calorie Balance**: Keep tracking each meal consistently to stay within your goal range.\n' +
      '• **Protein Benchmark**: Aim for 1.8g to 2.2g of protein per kg of bodyweight to stimulate muscle protein synthesis (MPS).\n' +
      '• **Hydration**: Aim for at least 35ml of water per kg of bodyweight, especially on lifting days.\n' +
      '• **Workout Execution**: Focus on 1-2 RIR (Reps in Reserve) on all working sets with strict form and progressive overload.';
  }

  // Default intelligent assistant response
  return '### 🤖 FitFuel AI Coach Advice\n\n' +
    'To achieve optimal body composition and strength progress:\n\n' +
    '• **Nutrition**: Prioritize high-protein whole foods (1.8-2.2g/kg), complex carbs around workouts, and micronutrient-dense fruits and vegetables.\n' +
    '• **Hypertrophy**: Train in the 6-12 rep range with 2-3 minutes rest on compounds and 1-2 minutes on isolation movements.\n' +
    '• **Recovery**: Prioritize 7-8 hours of sleep and adequate hydration (35ml/kg) to maximize muscle recovery.\n\n' +
    'Feel free to ask me about specific foods, micronutrient profiles, or customized exercise biomechanics!';
}

if (typeof window !== 'undefined') {
  window.FF = FF;
  window.safeJsonParse = safeJsonParse;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FF, safeJsonParse, generateSmartAiFallback };
}

