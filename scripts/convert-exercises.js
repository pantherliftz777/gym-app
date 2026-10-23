/**
 * Convert vendor_repos/exercises-dataset/data/exercises.json into the app's
 * normalized public/data/exercises.json format.
 *
 * Source record fields used:
 *   id, name, category, body_part, equipment, target, muscle_group,
 *   secondary_muscles, instructions.{lang}, instruction_steps.{lang},
 *   image, gif_url, media_id, attribution, created_at
 *
 * Target shape (one object per exercise):
 *   id, name, muscle, equipment, instructions_en, gif, category, level
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'vendor_repos', 'exercises-dataset', 'data', 'exercises.json');
const OUT_DIR = path.join(ROOT, 'public', 'data');
const OUT = path.join(OUT_DIR, 'exercises.json');

// Remote base for the media assets (served from the upstream GitHub repo via raw CDN).
const GIF_BASE = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/';

// Difficulty heuristic. The source dataset has no explicit difficulty/level field,
// so we derive a beginner/intermediate/advanced label from the equipment needed
// and how complex the movement is.
function deriveLevel(ex) {
  const eq = (ex.equipment || '').toLowerCase();
  const name = (ex.name || '').toLowerCase();

  if (eq === 'body weight') {
    // Simple bodyweight movements are accessible to most beginners.
    if (/(plank|glute bridge|bridge|crunch|sit-up|sit up|calf raise|neck|rotation|twist|superman|butterfly)/.test(name)) {
      return 'beginner';
    }
    return 'beginner';
  }

  if (/(machine|cable|smith machine|leverage machine|stability ball|band|resistance band|roller|kettlebell|dumbbell)/.test(eq)) {
    return 'intermediate';
  }

  if (/(barbell|olympic barbell|ez barbell|trap bar|sled machine|hammer|medicine ball|upper body ergometer)/.test(eq)) {
    return 'advanced';
  }

  return 'intermediate';
}

function main() {
  const raw = fs.readFileSync(SRC, 'utf8');
  const src = JSON.parse(raw);
  if (!Array.isArray(src)) throw new Error('Source is not a JSON array');

  const seen = new Set();
  const out = [];
  let dupes = 0;

  for (const ex of src) {
    const name = (ex.name || '').trim();
    if (!name) continue;

    // Dedup key: exercise name + target muscle + equipment.
    const key = `${name.toLowerCase()}|${(ex.target || '').toLowerCase()}|${(ex.equipment || '').toLowerCase()}`;
    if (seen.has(key)) {
      dupes++;
      continue;
    }
    seen.add(key);

    // gif_url in the source is a relative path like "videos/0001-2gPfomN.gif".
    const gifFile = String(ex.gif_url || '');
    const gif = gifFile
      ? (gifFile.startsWith('http') ? gifFile : GIF_BASE + gifFile.replace(/^\/?videos\//, ''))
      : '';

    const instructionsEn = (ex.instructions && ex.instructions.en) ||
      ((ex.instruction_steps && ex.instruction_steps.en) || []).join(' ');

    out.push({
      id: ex.id,
      name,
      muscle: ex.target || ex.muscle_group || '',
      equipment: ex.equipment || '',
      instructions_en: instructionsEn,
      gif,
      category: ex.category || ex.body_part || '',
      level: deriveLevel(ex),
    });
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf8');

  console.log(`source records : ${src.length}`);
  console.log(`written records: ${out.length}`);
  console.log(`deduped        : ${dupes}`);
  console.log(`output         : ${OUT}`);
  console.log(`sample         : ${JSON.stringify(out[0])}`);
}

main();
