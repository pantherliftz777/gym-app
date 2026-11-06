// Verification of FitFuel Algorithm Suite
import assert from 'node:assert';

function bmrMifflinStJeor(weightKg, heightCm, ageYears, sex) {
  const w = Number(weightKg) || 0;
  const h = Number(heightCm) || 0;
  const a = Number(ageYears) || 0;
  const base = 10 * w + 6.25 * h - 5 * a + 5;
  return Math.round(sex === 'female' ? base - 161 : base);
}

function calculateEpley1RM(weightKg, reps) {
  const w = Number(weightKg) || 0;
  const r = Number(reps) || 0;
  if (w <= 0 || r <= 0) return 0;
  if (r === 1) return w;
  return Math.round(w * (1 + r / 30) * 10) / 10;
}

function calculateNavyBodyFat({ gender = 'male', heightCm, waistCm, neckCm, hipsCm }) {
  const hIn = heightCm / 2.54;
  const wIn = waistCm / 2.54;
  const nIn = neckCm / 2.54;
  const hipIn = (hipsCm || waistCm * 1.15) / 2.54;
  let bfp;
  if (gender === 'male') {
    const diff = Math.max(0.5, wIn - nIn);
    bfp = 86.010 * Math.log10(diff) - 70.041 * Math.log10(hIn) + 36.76;
  } else {
    const diff = Math.max(0.5, wIn + hipIn - nIn);
    bfp = 163.205 * Math.log10(diff) - 97.684 * Math.log10(hIn) - 78.387;
  }
  return Math.round(Math.max(3, Math.min(55, bfp)) * 10) / 10;
}

// 1. Test Jordan Davis Seed (78.5 kg, 182 cm, 28 yo male)
const jordanBmr = bmrMifflinStJeor(78.5, 182, 28, 'male');
console.log('Jordan BMR (Mifflin-St Jeor):', jordanBmr);
assert.strictEqual(jordanBmr, 1788);

// 2. Test Epley 1RM for 100kg x 8 reps
const e1rm = calculateEpley1RM(100, 8);
console.log('Epley e1RM (100kg x 8 reps):', e1rm);
assert.strictEqual(e1rm, 126.7);

// 3. Test Navy Body Fat
const bfMale = calculateNavyBodyFat({ gender: 'male', heightCm: 182, waistCm: 81, neckCm: 39 });
console.log('Male Navy Body Fat (182cm, waist 81cm, neck 39cm):', bfMale);
assert(bfMale > 10 && bfMale < 18);

console.log('All algorithm verification assertions passed successfully!');
