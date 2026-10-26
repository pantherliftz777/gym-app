const fs = require('fs');

const extraCss = `

/* ================= WORKOUT & CHALLENGE MOVE THUMBNAILS (1,318 INTEGRATION) ================= */
.move-item-thumb,
.challenge-routine-thumb {
  width: 58px;
  height: 58px;
  min-width: 58px;
  border-radius: 10px;
  background: var(--ff-bg-panel, #0f172a);
  border: 1px solid var(--ff-glass-border, rgba(255,255,255,0.08));
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.2s ease, border-color 0.2s ease;
}
.move-item-thumb:hover,
.challenge-routine-thumb:hover {
  transform: scale(1.06);
  border-color: #38bdf8;
}
.move-item-thumb img,
.challenge-routine-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* ================= SMART START WORKOUT & CALIBRATION STYLES ================= */
.smart-start-section-card {
  max-width: 960px;
  margin: 0 auto 32px;
  padding: 26px 30px;
  border-radius: 20px;
  background: var(--ff-glass-bg);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1.5px solid var(--ff-glass-border);
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.05);
}
.smart-start-routines-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
}
.smart-start-routine-card {
  background: var(--ff-surface);
  border: 1.5px solid var(--ff-glass-border-subtle);
  border-radius: 16px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.03);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.smart-start-routine-card:hover {
  transform: translateY(-3px);
  border-color: #38bdf8;
  box-shadow: 0 10px 24px rgba(56, 189, 248, 0.12);
}
.smart-calc-exercise-result {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--ff-surface);
  border: 1.5px solid var(--ff-glass-border-subtle);
  border-radius: 16px;
  margin-top: 16px;
  flex-wrap: wrap;
}
`;

fs.appendFileSync('public/styles.css', extraCss, 'utf8');
console.log('Appended extra styles successfully to public/styles.css');
