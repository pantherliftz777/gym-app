const fs = require('fs');

let code = fs.readFileSync('public/fitfuel.js', 'utf8');

// 1. Update initial selectedExerciseCategory & subMuscle & add selectedEquipmentFilter
code = code.replace(
  "let selectedExerciseCategory = 'Legs';\nlet selectedSubMuscle = 'All Legs';",
  "let selectedExerciseCategory = 'All';\nlet selectedSubMuscle = 'All Moves';\nlet selectedEquipmentFilter = 'All';"
);

// 2. Replace loadFullExerciseLibrary
const oldLoadRegex = /\/\* ===== Full Exercise Library Loader ===== \*\/[\s\S]*?loadFullExerciseLibrary\(\);/;

const newLoad = `/* ===== Full Exercise Library Loader ===== */
async function loadFullExerciseLibrary() {
  try {
    const res = await fetch('/data/exercises.json');
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    const MUSCLE_MAP = {
      'pectorals': 'Chest', 'chest': 'Chest',
      'biceps': 'Arms', 'triceps': 'Arms', 'forearms': 'Arms',
      'upper back': 'Back', 'lats': 'Back', 'traps': 'Back', 'spine': 'Back',
      'delts': 'Shoulders', 'serratus anterior': 'Shoulders', 'levator scapulae': 'Shoulders',
      'glutes': 'Legs', 'quads': 'Legs', 'hamstrings': 'Legs', 'calves': 'Legs', 'adductors': 'Legs', 'abductors': 'Legs',
      'abs': 'Core', 'cardiovascular system': 'Cardio'
    };
    const EQUIP_MAP = {
      'body weight': 'BODYWEIGHT · HOME OR GYM', 'dumbbell': 'DUMBBELL · GYM OR HOME',
      'barbell': 'BARBELL · GYM', 'cable': 'CABLE · GYM', 'leverage machine': 'MACHINE · GYM',
      'band': 'BAND · HOME', 'smith machine': 'SMITH MACHINE · GYM', 'kettlebell': 'KETTLEBELL · GYM OR HOME',
      'stability ball': 'STABILITY BALL · HOME OR GYM', 'ez barbell': 'EZ BAR · GYM', 'rope': 'ROPE · GYM',
      'medicine ball': 'MEDICINE BALL · GYM OR HOME', 'bosu ball': 'BOSU BALL · GYM OR HOME', 'resistance band': 'RESISTANCE BAND · HOME',
      'roller': 'ROLLER · MOBILITY', 'wheel roller': 'WHEEL ROLLER · HOME OR GYM', 'weighted': 'WEIGHTED · GYM'
    };

    const toTitle = (str) => {
      if (!str) return '';
      return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    };

    // First: enrich curated exercises with gif and metadata from data if names match
    const dataByLower = new Map();
    for (const d of data) {
      if (d.name) dataByLower.set(d.name.toLowerCase().trim(), d);
    }
    for (const cur of EXERCISES_LIBRARY) {
      const match = dataByLower.get(cur.name.toLowerCase().trim());
      if (match) {
        if (!cur.gif && match.gif) cur.gif = match.gif;
        if (!cur.rawEquipment && match.equipment) cur.rawEquipment = match.equipment.toLowerCase();
        if (!cur.equipment && match.equipment) cur.equipment = match.equipment;
        if (!cur.level && match.level) cur.level = toTitle(match.level);
        if (!cur.id && match.id) cur.id = match.id;
      }
    }

    const existingNames = new Set(EXERCISES_LIBRARY.map(e => e.name.toLowerCase().trim()));
    const newExercises = [];
    for (const ex of data) {
      if (!ex.name) continue;
      const nameLower = ex.name.toLowerCase().trim();
      if (existingNames.has(nameLower)) continue;
      const muscle = (ex.muscle || '').toLowerCase().trim();
      const category = MUSCLE_MAP[muscle] || 'Other';
      if (category === 'Other') continue;
      const equipment = (ex.equipment || '').toLowerCase().trim();
      const type = EQUIP_MAP[equipment] || (ex.equipment ? ex.equipment.toUpperCase() + ' · GYM' : 'BODYWEIGHT · HOME OR GYM');
      const instructions = Array.isArray(ex.instructions_en) ? ex.instructions_en : (ex.instructions_en ? [ex.instructions_en] : []);

      const titleName = toTitle(ex.name);
      const subTitle = toTitle(ex.muscle || muscle);
      const levelTitle = toTitle(ex.level || 'Intermediate');

      newExercises.push({
        id: ex.id,
        name: titleName,
        category,
        sub: subTitle,
        muscle: ex.muscle || muscle,
        equipment: ex.equipment || 'body weight',
        rawEquipment: equipment,
        level: levelTitle,
        gif: ex.gif || '',
        type,
        rxSetsReps: category === 'Cardio' ? '20–30 min · Zone 2' : '3 sets × 8–12 reps · 60s rest',
        rxTempo: 'Tempo: 2-0-1',
        rxWhy: instructions[0] || \`Targets the \${ex.muscle || muscle} effectively for strength, stability, and hypertrophy.\`,
        benefit: instructions[0] || \`Develops \${ex.muscle || muscle} strength and muscular endurance.\`,
        steps: instructions.join(' ') || \`Perform \${titleName} with controlled form throughout the movement.\`,
        instructions: instructions,
        _searchIdx: \`\${titleName.toLowerCase()} \${muscle} \${equipment} \${category.toLowerCase()}\`
      });
      existingNames.add(nameLower);
    }
    EXERCISES_LIBRARY.push(...newExercises);

    // Ensure Cardio category in MUSCLE_GROUPS
    if (!MUSCLE_GROUPS['Cardio']) {
      MUSCLE_GROUPS['Cardio'] = ['All Cardio', 'cardiovascular system'];
    }

    console.log(\`[FitFuel] Exercise library loaded: \${EXERCISES_LIBRARY.length} total exercises across all categories\`);
    if (activeView === 'exercise-library' && typeof renderExerciseLibrary === 'function') renderExerciseLibrary();
    if (activeView === 'workouts' && typeof renderCustomWorkoutExplorer === 'function') renderCustomWorkoutExplorer();
  } catch (err) {
    console.warn('[FitFuel] Could not load full exercise library, using curated set:', err.message);
  }
}
loadFullExerciseLibrary();`;

if (oldLoadRegex.test(code)) {
  code = code.replace(oldLoadRegex, newLoad);
  console.log('Successfully replaced loadFullExerciseLibrary');
} else {
  console.error('Could not find old loadFullExerciseLibrary');
}

fs.writeFileSync('public/fitfuel.js', code, 'utf8');
