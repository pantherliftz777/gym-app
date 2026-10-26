const fs = require('fs');
const path = require('path');

console.log('--- Applying Light Mode Text Contrast & Theme Color Fix ---');

const stylesPath = path.join(__dirname, '..', 'public', 'styles.css');
let css = fs.readFileSync(stylesPath, 'utf8');

// 1. Clean up Light Mode Canvas Gradients (Remove purple/violet/pink hues)
const oldCanvasMesh1 = `  --ff-canvas-bg: #f0f4fd;
  --ff-canvas-gradient:
    radial-gradient(circle at 12% 16%, rgba(56, 189, 248, 0.22) 0%, transparent 45%),
    radial-gradient(circle at 88% 14%, rgba(139, 92, 246, 0.20) 0%, transparent 48%),
    radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 82% 86%, rgba(20, 184, 166, 0.18) 0%, transparent 45%),
    radial-gradient(circle at 16% 84%, rgba(168, 85, 247, 0.15) 0%, transparent 42%),
    linear-gradient(135deg, #f8faff 0%, #edf2fe 45%, #f4f1ff 100%);`;

const newCanvasMesh1 = `  --ff-canvas-bg: #f8fafc;
  --ff-canvas-gradient:
    radial-gradient(circle at 12% 16%, rgba(37, 99, 235, 0.08) 0%, transparent 45%),
    radial-gradient(circle at 88% 12%, rgba(22, 199, 154, 0.07) 0%, transparent 45%),
    radial-gradient(circle at 50% 50%, rgba(2, 132, 199, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 82% 86%, rgba(37, 99, 235, 0.06) 0%, transparent 45%),
    linear-gradient(145deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);`;

css = css.replace(oldCanvasMesh1, newCanvasMesh1);

const oldCanvasMesh2 = `  --glass-canvas-bg: #edf2fc;
  --glass-canvas-mesh:
    radial-gradient(circle at 12% 16%, rgba(56, 189, 248, 0.24) 0%, transparent 45%),
    radial-gradient(circle at 88% 12%, rgba(139, 92, 246, 0.22) 0%, transparent 48%),
    radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.14) 0%, transparent 50%),
    radial-gradient(circle at 82% 86%, rgba(20, 184, 166, 0.20) 0%, transparent 45%),
    radial-gradient(circle at 16% 84%, rgba(168, 85, 247, 0.18) 0%, transparent 42%),
    linear-gradient(135deg, #f8faff 0%, #edf3fe 45%, #f4f0ff 100%);`;

const newCanvasMesh2 = `  --glass-canvas-bg: #f8fafc;
  --glass-canvas-mesh:
    radial-gradient(circle at 12% 16%, rgba(37, 99, 235, 0.08) 0%, transparent 45%),
    radial-gradient(circle at 88% 12%, rgba(22, 199, 154, 0.07) 0%, transparent 45%),
    radial-gradient(circle at 50% 50%, rgba(2, 132, 199, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 82% 86%, rgba(37, 99, 235, 0.06) 0%, transparent 45%),
    linear-gradient(145deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);`;

css = css.replace(oldCanvasMesh2, newCanvasMesh2);

// 2. Clean up Dark Mode Canvas Gradients (Remove purple/magenta)
const oldDarkMesh1 = `  --ff-canvas-bg: #070b14;
  --ff-canvas-gradient:
    radial-gradient(circle at 12% 16%, rgba(14, 165, 233, 0.24) 0%, transparent 48%),
    radial-gradient(circle at 88% 14%, rgba(168, 85, 247, 0.22) 0%, transparent 48%),
    radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.18) 0%, transparent 50%),
    radial-gradient(circle at 82% 86%, rgba(20, 184, 166, 0.20) 0%, transparent 46%),
    radial-gradient(circle at 16% 84%, rgba(236, 72, 153, 0.16) 0%, transparent 42%),
    linear-gradient(145deg, #070b14 0%, #0d1527 50%, #080c17 100%);`;

const newDarkMesh1 = `  --ff-canvas-bg: #080c14;
  --ff-canvas-gradient:
    radial-gradient(circle at 12% 16%, rgba(14, 165, 233, 0.18) 0%, transparent 48%),
    radial-gradient(circle at 88% 14%, rgba(37, 99, 235, 0.16) 0%, transparent 48%),
    radial-gradient(circle at 50% 50%, rgba(30, 58, 138, 0.20) 0%, transparent 50%),
    radial-gradient(circle at 82% 86%, rgba(22, 199, 154, 0.12) 0%, transparent 46%),
    linear-gradient(145deg, #070b14 0%, #0d1527 50%, #080c17 100%);`;

css = css.replace(oldDarkMesh1, newDarkMesh1);

const oldDarkMesh2 = `  --glass-canvas-bg: #070b14;
  --glass-canvas-mesh:
    radial-gradient(circle at 12% 16%, rgba(14, 165, 233, 0.24) 0%, transparent 48%),
    radial-gradient(circle at 88% 12%, rgba(168, 85, 247, 0.22) 0%, transparent 48%),
    radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.18) 0%, transparent 50%),
    radial-gradient(circle at 82% 86%, rgba(20, 184, 166, 0.20) 0%, transparent 46%),
    radial-gradient(circle at 16% 84%, rgba(236, 72, 153, 0.16) 0%, transparent 42%),
    linear-gradient(145deg, #070b14 0%, #0d1527 50%, #080c17 100%);`;

const newDarkMesh2 = `  --glass-canvas-bg: #080c14;
  --glass-canvas-mesh:
    radial-gradient(circle at 12% 16%, rgba(14, 165, 233, 0.18) 0%, transparent 48%),
    radial-gradient(circle at 88% 12%, rgba(37, 99, 235, 0.16) 0%, transparent 48%),
    radial-gradient(circle at 50% 50%, rgba(30, 58, 138, 0.20) 0%, transparent 50%),
    radial-gradient(circle at 82% 86%, rgba(22, 199, 154, 0.12) 0%, transparent 46%),
    linear-gradient(145deg, #070b14 0%, #0d1527 50%, #080c17 100%);`;

css = css.replace(oldDarkMesh2, newDarkMesh2);

// 3. Replace the legacy Welcome Strip and Daily Motivation CSS blocks (which had hardcoded #ffffff !important)
const legacySectionStart = '/* ================= WELCOME CHECK-IN STRIP (BLUE THEME) ================= */';
const legacySectionEnd = '/* ================= FRONT SCREEN WATER ESTIMATE & WEATHER ADVISORY ================= */';

const startIndex = css.indexOf(legacySectionStart);
const endIndex = css.indexOf(legacySectionEnd);

if (startIndex !== -1 && endIndex !== -1) {
  const updatedSection = `/* ================= WELCOME CHECK-IN STRIP & DAILY MOTIVATION (HIGH CONTRAST) ================= */
.welcome-strip {
  color: var(--ff-text-primary, #0f172a);
  background: rgba(255, 255, 255, 0.88) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(203, 213, 225, 0.85) !important;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95) !important;
  border-radius: 16px !important;
  justify-content: space-between;
  align-items: center;
  min-height: 151px;
  padding: 25px 31px;
  display: flex;
  position: relative;
  overflow: hidden;
}
.welcome-strip h2 {
  color: #0f172a !important;
  letter-spacing: -0.5px;
  margin: 13px 0 5px;
  font-size: 23px;
  font-weight: 700;
}
.welcome-strip p {
  color: #475569 !important;
  margin: 0;
  font-size: 13px;
  font-weight: 500;
}
.welcome-overline {
  color: #0284c7 !important;
  letter-spacing: 1.1px;
  align-items: center;
  gap: 7px;
  font-size: 10px;
  font-weight: 800;
  display: flex;
}
.welcome-overline svg {
  stroke: #0284c7 !important;
}
.strip-stats span {
  color: #2563eb !important;
  letter-spacing: 0.9px;
  font-size: 9px;
  font-weight: 800;
}
.strip-stats b {
  color: #0f172a !important;
  font-size: 24px;
  font-weight: 800;
}
.strip-stats small {
  color: #0284c7 !important;
  font-size: 12px;
  font-weight: 700;
}
.strip-orbit {
  border: 1px solid rgba(37, 99, 235, 0.12) !important;
  border-radius: 50%;
  position: absolute;
}

.daily-motivation-panel {
  background: rgba(255, 255, 255, 0.88) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  color: var(--ff-text-primary, #0f172a);
  border-radius: 16px !important;
  border: 1px solid rgba(203, 213, 225, 0.85) !important;
  padding: 22px 26px;
  margin-bottom: 18px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95) !important;
  position: relative;
  overflow: hidden;
}
.daily-motivation-panel::after {
  content: "“";
  position: absolute;
  right: 20px;
  bottom: -25px;
  font-size: 130px;
  line-height: 1;
  font-family: Georgia, serif;
  color: rgba(37, 99, 235, 0.06) !important;
  pointer-events: none;
}
.motivation-overline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}
.motivation-tag {
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0284c7 !important;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.motivation-tag svg {
  stroke: #0284c7 !important;
}
.next-quote-btn {
  color: #2563eb !important;
  font-size: 0.78rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(37, 99, 235, 0.08) !important;
  border: 1px solid rgba(37, 99, 235, 0.25) !important;
  padding: 4px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.next-quote-btn:hover {
  background: rgba(37, 99, 235, 0.16) !important;
  border-color: #2563eb !important;
}
.motivation-quote-text {
  font-size: 1.12rem;
  font-weight: 700;
  line-height: 1.5;
  color: #0f172a !important;
  margin: 0 0 10px;
}
.motivation-author {
  font-size: 0.86rem;
  color: #2563eb !important;
  font-weight: 700;
}

/* Scoped Dark Mode Overrides for Check-in & Motivation */
html.dark .welcome-strip, [data-theme="dark"] .welcome-strip, body.dark .welcome-strip {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(20, 35, 70, 0.85) 100%) !important;
  border: 1px solid rgba(59, 130, 246, 0.35) !important;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.5) !important;
}
html.dark .welcome-strip h2, [data-theme="dark"] .welcome-strip h2, body.dark .welcome-strip h2 {
  color: #f8fafc !important;
}
html.dark .welcome-strip p, [data-theme="dark"] .welcome-strip p, body.dark .welcome-strip p {
  color: #cbd5e1 !important;
}
html.dark .welcome-overline, [data-theme="dark"] .welcome-overline, body.dark .welcome-overline {
  color: #38bdf8 !important;
}
html.dark .welcome-overline svg, [data-theme="dark"] .welcome-overline svg, body.dark .welcome-overline svg {
  stroke: #38bdf8 !important;
}
html.dark .strip-stats span, [data-theme="dark"] .strip-stats span, body.dark .strip-stats span {
  color: #93c5fd !important;
}
html.dark .strip-stats b, [data-theme="dark"] .strip-stats b, body.dark .strip-stats b {
  color: #ffffff !important;
}
html.dark .strip-stats small, [data-theme="dark"] .strip-stats small, body.dark .strip-stats small {
  color: #60a5fa !important;
}
html.dark .daily-motivation-panel, [data-theme="dark"] .daily-motivation-panel, body.dark .daily-motivation-panel {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.94) 0%, rgba(18, 32, 64, 0.85) 100%) !important;
  border: 1px solid rgba(56, 189, 248, 0.3) !important;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.5) !important;
}
html.dark .daily-motivation-panel::after, [data-theme="dark"] .daily-motivation-panel::after, body.dark .daily-motivation-panel::after {
  color: rgba(56, 189, 248, 0.12) !important;
}
html.dark .motivation-tag, [data-theme="dark"] .motivation-tag, body.dark .motivation-tag {
  color: #38bdf8 !important;
}
html.dark .motivation-tag svg, [data-theme="dark"] .motivation-tag svg, body.dark .motivation-tag svg {
  stroke: #38bdf8 !important;
}
html.dark .next-quote-btn, [data-theme="dark"] .next-quote-btn, body.dark .next-quote-btn {
  color: #38bdf8 !important;
  background: rgba(56, 189, 248, 0.15) !important;
  border-color: rgba(56, 189, 248, 0.35) !important;
}
html.dark .motivation-quote-text, [data-theme="dark"] .motivation-quote-text, body.dark .motivation-quote-text {
  color: #f8fafc !important;
}
html.dark .motivation-author, [data-theme="dark"] .motivation-author, body.dark .motivation-author {
  color: #38bdf8 !important;
}

`;
  css = css.slice(0, startIndex) + updatedSection + css.slice(endIndex);
  console.log('✔ Replaced legacy check-in and motivation CSS with high-contrast rules');
}

fs.writeFileSync(stylesPath, css, 'utf8');
console.log('✔ Saved updated public/styles.css');

// 4. Update cache buster in public/index.html
const indexHtmlPath = path.join(__dirname, '..', 'public', 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
indexHtml = indexHtml.replace(/styles\.css\?v=[0-9.]+/g, 'styles.css?v=5.4.0');
fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
console.log('✔ Updated styles.css cache buster in public/index.html to v=5.4.0');
