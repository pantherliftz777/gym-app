const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '../public/fitfuel.js');
let js = fs.readFileSync(jsPath, 'utf8');

if (!js.includes("'landing': ['landing']")) {
  js = js.replace(
    "const SECTION_VIEW_MAP = {",
    "const SECTION_VIEW_MAP = {\n  'landing': ['landing'],"
  );
  fs.writeFileSync(jsPath, js, 'utf8');
  console.log('Added landing to SECTION_VIEW_MAP!');
} else {
  console.log('Already present');
}
