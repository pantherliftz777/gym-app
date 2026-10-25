/* FitFuel Social PR Card & Data Export Engine */
(function() {
  'use strict';

  function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // 1. Export Workouts CSV
  function exportWorkoutsCSV() {
    let workouts = [];
    try {
      workouts = JSON.parse(localStorage.getItem('fitfuel_workouts') || '[]');
    } catch (e) {}

    const headers = ['Date', 'Routine', 'Exercise', 'Sets', 'Reps', 'Weight_KG', 'Volume_KG'];
    const rows = [headers.join(',')];

    for (const w of workouts) {
      const d = w.date || new Date().toISOString().slice(0, 10);
      const routine = `"${(w.name || w.focus || 'Workout').replace(/"/g, '""')}"`;
      if (Array.isArray(w.exercises)) {
        for (const ex of w.exercises) {
          const name = `"${(ex.name || 'Exercise').replace(/"/g, '""')}"`;
          const sets = ex.sets || 3;
          const reps = ex.reps || 10;
          const weight = ex.weight || 0;
          const vol = sets * reps * weight;
          rows.push([d, routine, name, sets, reps, weight, vol].join(','));
        }
      } else {
        rows.push([d, routine, 'General Session', 1, 1, 0, 0].join(','));
      }
    }

    const csvStr = rows.join('\r\n');
    const today = new Date().toISOString().slice(0, 10);
    downloadFile(csvStr, `fitfuel-workouts-${today}.csv`, 'text/csv;charset=utf-8;');
    if (typeof window.toast === 'function') window.toast('Workouts history exported to CSV!');
  }

  // 2. Export Nutrition CSV
  function exportNutritionCSV() {
    let logs = [];
    try {
      logs = JSON.parse(localStorage.getItem('fitfuel_food_log') || '[]');
    } catch (e) {}

    const headers = ['Date', 'Meal_Type', 'Food_Item', 'Calories_kcal', 'Protein_g', 'Carbs_g', 'Fats_g'];
    const rows = [headers.join(',')];

    for (const item of logs) {
      const d = item.date || new Date().toISOString().slice(0, 10);
      const meal = `"${(item.meal || 'Snack').replace(/"/g, '""')}"`;
      const name = `"${(item.name || 'Food').replace(/"/g, '""')}"`;
      rows.push([d, meal, name, item.calories || 0, item.protein || 0, item.carbs || 0, item.fats || 0].join(','));
    }

    const csvStr = rows.join('\r\n');
    const today = new Date().toISOString().slice(0, 10);
    downloadFile(csvStr, `fitfuel-nutrition-${today}.csv`, 'text/csv;charset=utf-8;');
    if (typeof window.toast === 'function') window.toast('Nutrition history exported to CSV!');
  }

  // 3. Export Full JSON Backup
  function exportFullBackupJSON() {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: {
        name: localStorage.getItem('fitfuel_username') || 'FitFuel Athlete',
        theme: localStorage.getItem('fitfuel_theme') || 'dark'
      },
      data: {
        profile: JSON.parse(localStorage.getItem('fitfuel_profile') || '{}'),
        workouts: JSON.parse(localStorage.getItem('fitfuel_workouts') || '[]'),
        foodLog: JSON.parse(localStorage.getItem('fitfuel_food_log') || '[]'),
        customFoods: JSON.parse(localStorage.getItem('fitfuel_custom_foods') || '[]'),
        waterHistory: JSON.parse(localStorage.getItem('fitfuel_water_history') || '{}'),
        weightHistory: JSON.parse(localStorage.getItem('fitfuel_weights') || '[]')
      }
    };

    const jsonStr = JSON.stringify(backup, null, 2);
    const today = new Date().toISOString().slice(0, 10);
    downloadFile(jsonStr, `fitfuel-full-backup-${today}.json`, 'application/json;charset=utf-8;');
    if (typeof window.toast === 'function') window.toast('Full data backup exported to JSON!');
  }

  // 4. Generate 1080x1920 Glassmorphism PR Story Card on HTML5 Canvas
  async function generatePRStoryCard(stats = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');

    const athleteName = stats.name || localStorage.getItem('fitfuel_username') || 'FitFuel Athlete';
    const workoutTitle = stats.workoutTitle || 'ELITE HYPERTROPHY WORKOUT';
    const volume = stats.volume || '8,420 KG';
    const sets = stats.sets || '18 SETS';
    const prText = stats.pr || 'NEW 1RM PR: BENCH PRESS 105 KG';
    const calories = stats.calories || '540 KCAL BURNED';
    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

    // 1. Mesh Background Gradients
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, 1080, 1920);

    // Glowing cyan & violet ambient circles
    const grad1 = ctx.createRadialGradient(250, 450, 50, 250, 450, 550);
    grad1.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
    grad1.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.fillStyle = grad1;
    ctx.beginPath();
    ctx.arc(250, 450, 550, 0, Math.PI * 2);
    ctx.fill();

    const grad2 = ctx.createRadialGradient(850, 1400, 50, 850, 1400, 600);
    grad2.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
    grad2.addColorStop(1, 'rgba(6, 182, 212, 0)');
    ctx.fillStyle = grad2;
    ctx.beginPath();
    ctx.arc(850, 1400, 600, 0, Math.PI * 2);
    ctx.fill();

    // 2. Central Glass Card (Frosted Glass Effect)
    const cardX = 90;
    const cardY = 220;
    const cardW = 900;
    const cardH = 1480;
    const cardR = 48;

    // Card shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 64;
    ctx.shadowOffsetY = 24;

    // Card Body
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, cardR);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    ctx.fill();
    ctx.restore();

    // Card Border
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, cardR);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Specular Highlight (top edge)
    const specTop = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY);
    specTop.addColorStop(0, 'rgba(255, 255, 255, 0)');
    specTop.addColorStop(0.5, 'rgba(255, 255, 255, 0.75)');
    specTop.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.strokeStyle = specTop;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cardX + cardR, cardY);
    ctx.lineTo(cardX + cardW - cardR, cardY);
    ctx.stroke();
    ctx.restore();

    // 3. Header Branding
    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('⚡ FITFUEL ATHLETIC PERFORMANCE', 540, cardY + 110);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(dateStr.toUpperCase(), 540, cardY + 160);

    // 4. Athlete Name
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 64px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(athleteName, 540, cardY + 280);

    // 5. Workout Title Badge
    ctx.save();
    const badgeW = 680;
    const badgeH = 72;
    const badgeX = (1080 - badgeW) / 2;
    const badgeY = cardY + 330;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 36);
    ctx.fillStyle = 'rgba(99, 102, 241, 0.25)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(129, 140, 248, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#c7d2fe';
    ctx.font = '700 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(workoutTitle.toUpperCase(), 540, badgeY + 46);
    ctx.restore();

    // 6. Highlighted Stats Grid
    const statBoxY = cardY + 470;
    const statBoxW = 380;
    const statBoxH = 220;

    // Stat 1: Volume
    drawMiniGlassBox(ctx, 150, statBoxY, statBoxW, statBoxH, 'TOTAL VOLUME', volume, '#38bdf8');
    // Stat 2: Sets
    drawMiniGlassBox(ctx, 550, statBoxY, statBoxW, statBoxH, 'SETS CRUSHED', sets, '#a855f7');
    // Stat 3: Calories
    drawMiniGlassBox(ctx, 150, statBoxY + 260, statBoxW, statBoxH, 'CALORIC BURN', calories, '#f97316');
    // Stat 4: Recovery Score
    drawMiniGlassBox(ctx, 550, statBoxY + 260, statBoxW, statBoxH, 'HYDRATION & REST', '100% OPTIMAL', '#10b981');

    // 7. PR Trophy Callout Card
    const prY = statBoxY + 560;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(150, prY, 780, 180, 28);
    const prGrad = ctx.createLinearGradient(150, prY, 930, prY + 180);
    prGrad.addColorStop(0, 'rgba(234, 179, 8, 0.22)');
    prGrad.addColorStop(1, 'rgba(249, 115, 22, 0.15)');
    ctx.fillStyle = prGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.6)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = '800 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('🏆 PERSONAL RECORD ACHIEVED', 540, prY + 65);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(prText, 540, prY + 125);
    ctx.restore();

    // 8. Footer Quote & Branding
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 500 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('"Consistency over perfection. Built with discipline."', 540, cardY + cardH - 120);

    ctx.fillStyle = '#64748b';
    ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('FITFUEL • PURE GLASSMORPHISM FITNESS OS', 540, cardY + cardH - 60);

    return canvas;
  }

  function drawMiniGlassBox(ctx, x, y, w, h, label, value, accentColor) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 24);
    ctx.fillStyle = 'rgba(30, 41, 59, 0.55)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(label, x + w / 2, y + 60);

    ctx.fillStyle = accentColor;
    ctx.font = '800 48px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(value, x + w / 2, y + 140);
    ctx.restore();
  }

  async function openAndDownloadPRCard(stats) {
    if (typeof window.toast === 'function') window.toast('Rendering 1080x1920 Glassmorphism PR Story...');
    const canvas = await generatePRStoryCard(stats);
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fitfuel-pr-story-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      if (typeof window.toast === 'function') window.toast('PR Story Card downloaded! Ready for Instagram / X.');
    }, 'image/png');
  }

  if (typeof window !== 'undefined') {
    window.FitFuelSocial = {
      exportWorkoutsCSV,
      exportNutritionCSV,
      exportFullBackupJSON,
      generatePRStoryCard,
      openAndDownloadPRCard
    };
  }
})();
