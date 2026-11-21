import fs from 'fs';

let html = fs.readFileSync('public/fitfuel-feature-catalog.html', 'utf8');

// Update header stats
html = html.replace('<div class="doc-meta-num">33</div>\n      <div class="doc-meta-label">Total Features</div>', '<div class="doc-meta-num">35</div>\n      <div class="doc-meta-label">Total Features</div>');
html = html.replace('25</div>\n      <div class="doc-meta-label">Live / Ready</div>', '27</div>\n      <div class="doc-meta-label">Live / Ready</div>');
html = html.replace('All (33)', 'All (35)');
html = html.replace('🟢 Live (25)', '🟢 Live (27)');
html = html.replace('25 features · No registration needed', '27 features · No registration needed');

// Add features 26 and 27 before </div><!-- /grid-live -->
const newLiveCards = `
  <!-- 26 -->
  <div class="feat-card live" data-tier="live">
    <div class="card-top">
      <span class="card-num">#26</span>
      <span class="card-badge badge-live">● Live</span>
    </div>
    <div class="card-icon icon-live">✨</div>
    <div class="card-name">Volumetric Light Cone &amp; Kinetic Landing Showcase</div>
    <div class="card-tagline">60 FPS requestAnimationFrame lerp cursor tracking with 3D mouse tilt cards</div>
    <div class="card-desc">Interactive volumetric lighting physics simulation that tracks cursor coordinates with real-time bloom decay, accompanied by 3D mouse tilt cards, infinite partner marquee, and responsive viewport geometry.</div>
    <div class="card-meta">
      <span class="meta-chip cat">🎨 Appearance</span>
      <span class="meta-chip card-route">/</span>
      <span class="meta-chip">ID: volumetricLightCone</span>
    </div>
  </div>

  <!-- 27 -->
  <div class="feat-card live" data-tier="live">
    <div class="card-top">
      <span class="card-num">#27</span>
      <span class="card-badge badge-live">● Live</span>
    </div>
    <div class="card-icon icon-live">🎨</div>
    <div class="card-name">Dual-Theme Studio &amp; Chromatic Accent Swatches</div>
    <div class="card-tagline">Zero-inversion Obsidian (#060709) &amp; Porcelain (#F6F5F0) themes with 4 performance accents</div>
    <div class="card-desc">Dedicated appearance personalization studio supporting Signature Obsidian dark theme and Warm Porcelain editorial sibling theme with 4 dynamic chromatic accent swatches: Electric Neon Lime (#CEFF1A), Porcelain Emerald (#10B981), Cyber Cyan (#06B6D4), and Crimson Surge (#F43F5E).</div>
    <div class="card-meta">
      <span class="meta-chip cat">🎨 Appearance</span>
      <span class="meta-chip card-route">/app/customization</span>
      <span class="meta-chip">ID: appearanceStudio</span>
    </div>
  </div>
`;

html = html.replace('</div><!-- /grid-live -->', newLiveCards + '\n</div><!-- /grid-live -->');

// Renumber beta cards
html = html.replace('<span class="card-num">#26</span>\n      <span class="card-badge badge-beta">', '<span class="card-num">#28</span>\n      <span class="card-badge badge-beta">');
html = html.replace('<span class="card-num">#27</span>\n      <span class="card-badge badge-beta">', '<span class="card-num">#29</span>\n      <span class="card-badge badge-beta">');
html = html.replace('<span class="card-num">#28</span>\n      <span class="card-badge badge-beta">', '<span class="card-num">#30</span>\n      <span class="card-badge badge-beta">');
html = html.replace('<span class="card-num">#29</span>\n      <span class="card-badge badge-beta">', '<span class="card-num">#31</span>\n      <span class="card-badge badge-beta">');

// Renumber soon cards
html = html.replace('<span class="card-num">#30</span>\n      <span class="card-badge badge-soon">', '<span class="card-num">#32</span>\n      <span class="card-badge badge-soon">');
html = html.replace('<span class="card-num">#31</span>\n      <span class="card-badge badge-soon">', '<span class="card-num">#33</span>\n      <span class="card-badge badge-soon">');
html = html.replace('<span class="card-num">#32</span>\n      <span class="card-badge badge-soon">', '<span class="card-num">#34</span>\n      <span class="card-badge badge-soon">');
html = html.replace('<span class="card-num">#33</span>\n      <span class="card-badge badge-soon">', '<span class="card-num">#35</span>\n      <span class="card-badge badge-soon">');

// Update summary table
html = html.replace('📋 Quick-Reference Index — All 33 Features', '📋 Quick-Reference Index — All 35 Features');

const newTable = `      <tr><td class="tbl-num">25</td><td class="tbl-name">Interactive Voice Mode &amp; Coaching</td><td class="tbl-id">voiceCoach</td><td>Community</td><td><span class="card-badge badge-live">● Live</span></td><td class="tbl-route">/app/ai-coach</td></tr>
      <tr><td class="tbl-num">26</td><td class="tbl-name">Volumetric Light Cone &amp; Kinetic Landing Showcase</td><td class="tbl-id">volumetricLightCone</td><td>Appearance</td><td><span class="card-badge badge-live">● Live</span></td><td class="tbl-route">/</td></tr>
      <tr><td class="tbl-num">27</td><td class="tbl-name">Dual-Theme Studio &amp; Chromatic Accent Swatches</td><td class="tbl-id">appearanceStudio</td><td>Appearance</td><td><span class="card-badge badge-live">● Live</span></td><td class="tbl-route">/app/customization</td></tr>
      <tr><td class="tbl-num">28</td><td class="tbl-name">AI Camera Form Checker</td><td class="tbl-id">formCorrectionAi</td><td>Workout</td><td><span class="card-badge badge-beta">◆ Beta</span></td><td class="tbl-route">/app/form-checker</td></tr>
      <tr><td class="tbl-num">29</td><td class="tbl-name">Coach 1-on-1 Messaging &amp; Booking</td><td class="tbl-id">trainerChat</td><td>Community</td><td><span class="card-badge badge-beta">◆ Beta</span></td><td class="tbl-route">/app/messages</td></tr>
      <tr><td class="tbl-num">30</td><td class="tbl-name">Voice-Dictated Recipe Studio</td><td class="tbl-id">voiceRecipeStudio</td><td>Nutrition</td><td><span class="card-badge badge-beta">◆ Beta</span></td><td class="tbl-route">/app/recipe-studio</td></tr>
      <tr><td class="tbl-num">31</td><td class="tbl-name">Product Barcode Scanner &amp; Vault</td><td class="tbl-id">barcodeScanner</td><td>Nutrition</td><td><span class="card-badge badge-beta">◆ Beta</span></td><td class="tbl-route">/app/barcode-scanner</td></tr>
      <tr><td class="tbl-num">32</td><td class="tbl-name">Apple Watch &amp; Whoop BLE Sync</td><td class="tbl-id">wearableSync</td><td>Hardware</td><td><span class="card-badge badge-soon">◉ Soon</span></td><td class="tbl-route">/app/wearables</td></tr>
      <tr><td class="tbl-num">33</td><td class="tbl-name">AI Grocery &amp; Meal Prep Generator</td><td class="tbl-id">mealPlanAi</td><td>Nutrition</td><td><span class="card-badge badge-soon">◉ Soon</span></td><td class="tbl-route">/app/meal-prep</td></tr>
      <tr><td class="tbl-num">34</td><td class="tbl-name">3D Body Composition Mesh</td><td class="tbl-id">bodyScan3D</td><td>Workout</td><td><span class="card-badge badge-soon">◉ Soon</span></td><td class="tbl-route">/app/body-scan</td></tr>
      <tr><td class="tbl-num">35</td><td class="tbl-name">Live Gym Occupancy Heatmap</td><td class="tbl-id">gymCrowdMeter</td><td>Membership</td><td><span class="card-badge badge-soon">◉ Soon</span></td><td class="tbl-route">/app/crowd-meter</td></tr>
`;

const oldVoiceCoachRow = '<tr><td class="tbl-num">25</td><td class="tbl-name">Interactive Voice Mode &amp; Coaching</td><td class="tbl-id">voiceCoach</td><td>Community</td><td><span class="card-badge badge-live">● Live</span></td><td class="tbl-route">/app/ai-coach</td></tr>';
const endOfTable = '</tbody>';
const tableSliceStart = html.indexOf(oldVoiceCoachRow);
const tableSliceEnd = html.indexOf(endOfTable, tableSliceStart);

if (tableSliceStart !== -1 && tableSliceEnd !== -1) {
  html = html.slice(0, tableSliceStart) + newTable + '    ' + html.slice(tableSliceEnd);
}

// Download bar update with direct link
const oldDownloadBar = `<div class="download-bar">
  <button class="btn-download btn-pdf" onclick="downloadPDF()">📥 Download as PDF</button>
  <button class="btn-download btn-print" onclick="window.print()">🖨️ Print / Save PDF</button>
  <span class="download-info">Use <strong>Print → Save as PDF</strong> in your browser for the best quality</span>
</div>`;

const newDownloadBar = `<div class="download-bar">
  <a href="/FitFuel-Complete-Feature-Catalog.pdf" download="FitFuel-Complete-Feature-Catalog.pdf" class="btn-download btn-pdf" id="directPdfDownloadLink">📥 Download PDF File</a>
  <button class="btn-download btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
  <span class="download-info">Direct PDF document available, or use <strong>Print → Save as PDF</strong> in browser</span>
</div>`;

html = html.replace(oldDownloadBar, newDownloadBar);

// Footer update
html = html.replace('33 features across', '35 features across');

fs.writeFileSync('public/fitfuel-feature-catalog.html', html, 'utf8');
console.log('Successfully updated fitfuel-feature-catalog.html to 35 features!');
