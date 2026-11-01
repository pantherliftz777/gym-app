const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');
const vm = require('vm');

const startIdx = js.indexOf('const EXERCISES_LIBRARY = [');
const endIdx = js.indexOf('];', startIdx) + 2;
let exCode = js.substring(startIdx, endIdx);
exCode = exCode.replace('const EXERCISES_LIBRARY =', 'var EXERCISES_LIBRARY =');

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(exCode, sandbox);

const pool = sandbox.EXERCISES_LIBRARY;
console.log('Total exercises in EXERCISES_LIBRARY:', pool.length);

const categories = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio', 'Full Body'];
categories.forEach(cat => {
  const catMoves = pool.filter(e => e.category === cat);
  const homeMoves = catMoves.filter(e => {
    const t = (e.type || '').toUpperCase();
    return t.includes('BODY') || t.includes('HOME') || t.includes('DUMBBELL');
  });
  const gymMoves = catMoves.filter(e => {
    const t = (e.type || '').toUpperCase();
    return t.includes('BARBELL') || t.includes('DUMBBELL') || t.includes('CABLE') || t.includes('MACHINE') || t.includes('GYM');
  });
  console.log(`${cat}: total=${catMoves.length}, home=${homeMoves.length}, gym=${gymMoves.length}`);
});
