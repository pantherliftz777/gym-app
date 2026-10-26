const fs = require('fs');
const path = require('path');

// 1. UPDATE public/index.html to add #libEquipmentFilters
const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const targetHtml = `<div class="muscle-tags" id="muscleSubTags">
          <!-- Sub-tags -->
        </div>`;

const replacementHtml = `<div class="muscle-tags" id="muscleSubTags">
          <!-- Sub-tags -->
        </div>

        <div class="equipment-filter-bar" id="libEquipmentFilters">
          <!-- Dynamically populated equipment filters -->
        </div>`;

if (html.includes(targetHtml)) {
  html = html.replace(targetHtml, replacementHtml);
  console.log('Added #libEquipmentFilters to public/index.html');
} else {
  console.log('targetHtml already modified or not found');
}

// Bump cache buster
html = html.replace(/styles\.css\?v=[0-9.]+/g, 'styles.css?v=5.6.0');
fs.writeFileSync(htmlPath, html, 'utf8');

// 2. UPDATE public/styles.css for equipment filters & exercise card media
const cssPath = path.join(__dirname, '..', 'public', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

const extraStyles = `
/* ==========================================================================
   FULL 1,318 EXERCISE LIBRARY STYLES (EQUIPMENT PILLS & GIF DEMOS)
   ========================================================================== */
.equipment-filter-bar {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  overflow-x: auto !important;
  -webkit-overflow-scrolling: touch !important;
  scrollbar-width: none !important;
  padding: 8px 0 14px !important;
  margin-top: 4px !important;
}
.equipment-filter-bar::-webkit-scrollbar {
  display: none !important;
}
.equipment-filter-bar button {
  background: var(--ff-glass-bg-subtle, rgba(255, 255, 255, 0.75)) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border: 1.5px solid var(--ff-glass-border, #cbd5e1) !important;
  color: var(--glass-text-secondary, #475569) !important;
  padding: 6px 14px !important;
  border-radius: 9999px !important;
  font-size: 0.78rem !important;
  font-weight: 700 !important;
  cursor: pointer !important;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
  transition: all 0.15s ease !important;
}
.equipment-filter-bar button:hover {
  background: #eff6ff !important;
  border-color: #2563eb !important;
  color: #1d4ed8 !important;
}
.equipment-filter-bar button.active {
  background: #0284c7 !important;
  border-color: #0284c7 !important;
  color: #ffffff !important;
  font-weight: 800 !important;
  box-shadow: 0 3px 10px rgba(2, 132, 199, 0.3) !important;
}
html.dark .equipment-filter-bar button {
  background: rgba(15, 23, 42, 0.65) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
  color: #cbd5e1 !important;
}
html.dark .equipment-filter-bar button.active {
  background: #38bdf8 !important;
  border-color: #38bdf8 !important;
  color: #080c14 !important;
  box-shadow: 0 3px 12px rgba(56, 189, 248, 0.4) !important;
}

.exercise-cards {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important;
  gap: 18px !important;
  margin-top: 14px !important;
}

.exercise-card-media {
  width: 100% !important;
  height: 180px !important;
  background: #070b14 !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  position: relative !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  margin-bottom: 12px !important;
  cursor: pointer !important;
}
.exercise-card-media img {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important;
  transition: transform 0.25s ease !important;
}
.exercise-card:hover .exercise-card-media img {
  transform: scale(1.05) !important;
}
.exercise-card-media .media-badge {
  position: absolute !important;
  bottom: 8px !important;
  right: 8px !important;
  background: rgba(15, 23, 42, 0.85) !important;
  color: #38bdf8 !important;
  padding: 3px 8px !important;
  border-radius: 6px !important;
  font-size: 0.68rem !important;
  font-weight: 700 !important;
  backdrop-filter: blur(6px) !important;
  border: 1px solid rgba(56, 189, 248, 0.25) !important;
}
`;

if (!css.includes('FULL 1,318 EXERCISE LIBRARY STYLES')) {
  css += '\n' + extraStyles;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('Appended exercise library styles to public/styles.css');
}

console.log('Step 1 and 2 done.');
