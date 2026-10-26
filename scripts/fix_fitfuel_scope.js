const fs = require('fs');

const jsPath = 'public/fitfuel.js';
let js = fs.readFileSync(jsPath, 'utf8');

// 1. Fix switchView to select all .view elements
const oldSwitchViewSelect = "$$('.page-content .view').forEach(v => {";
if (js.includes(oldSwitchViewSelect)) {
  js = js.replace(oldSwitchViewSelect, "$$('.view').forEach(v => {");
  console.log('Fixed switchView to query $$(".view")');
}

// 2. Remove delegation from end of file
const dIdx = js.indexOf('/* ================= BULLETPROOF GLOBAL EVENT DELEGATION');
let delegationCode = '';
if (dIdx !== -1) {
  delegationCode = js.slice(dIdx);
  js = js.slice(0, dIdx).trimEnd();
  console.log('Extracted delegation code from end of file.');
}

// 3. Find "} // End of browser execution block" and insert delegation right before it
const endBlockStr = '} // End of browser execution block';
const endBlockIdx = js.indexOf(endBlockStr);
if (endBlockIdx !== -1 && delegationCode) {
  // Add window exports for challenge setup vars as well
  const setupExports = `
window.challengeSetup = {
  get motive() { return setupMotive; },
  set motive(v) { setupMotive = v; },
  get duration() { return setupDuration; },
  set duration(v) { setupDuration = v; },
  get minutes() { return setupMinutes; },
  set minutes(v) { setupMinutes = v; },
  get intensity() { return setupIntensity; },
  set intensity(v) { setupIntensity = v; },
  get types() { return setupTypes; },
  set types(v) { setupTypes = v; }
};
`;
  const insertText = '\n' + setupExports + '\n' + delegationCode + '\n';
  js = js.slice(0, endBlockIdx) + insertText + js.slice(endBlockIdx);
  console.log('Inserted setupExports and delegation code inside browser execution block!');
} else {
  console.error('Could not find end of browser execution block');
}

fs.writeFileSync(jsPath, js, 'utf8');
console.log('Saved fitfuel.js successfully.');
