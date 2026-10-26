const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const target = `<div class="muscle-tags" id="muscleSubTags">
          <!-- Sub-tags -->
        </div>`;

const targetNormalized = html.includes(target) ? target :
  (html.includes(target.replace(/\n/g, '\r\n')) ? target.replace(/\n/g, '\r\n') : null);

console.log('Found exact target?', !!targetNormalized);

if (targetNormalized) {
  const replacement = `${targetNormalized}

        <div class="equipment-filter-bar" id="libEquipmentFilters">
          <!-- Equipment filters populated dynamically -->
        </div>`;
  html = html.replace(targetNormalized, replacement);
  fs.writeFileSync('public/index.html', html, 'utf8');
  console.log('Successfully inserted #libEquipmentFilters into public/index.html');
} else {
  // Find index of id="muscleSubTags"
  const idx = html.indexOf('id="muscleSubTags"');
  console.log('idx of muscleSubTags:', idx);
  if (idx !== -1) {
    const closeDivIdx = html.indexOf('</div>', idx);
    const insertPoint = closeDivIdx + 6;
    const replacement = `\r\n\r\n        <div class="equipment-filter-bar" id="libEquipmentFilters">\r\n          <!-- Equipment filters populated dynamically -->\r\n        </div>`;
    html = html.slice(0, insertPoint) + replacement + html.slice(insertPoint);
    fs.writeFileSync('public/index.html', html, 'utf8');
    console.log('Successfully inserted via index splice!');
  }
}
