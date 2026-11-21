const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../public/index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Replace 🔒
const lockSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#38bdf8;display:inline-block;vertical-align:middle;"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
html = html.replace('<span style="font-size:1.2rem;">🔒</span>', lockSvg);
html = html.replace('<span style="font-size:1.1rem;">🔒</span>', lockSvg);

// 2. Replace 🛡️
const shieldSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align:-2px;margin-right:4px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
html = html.replace('🛡️ Admin Approvals', shieldSvg + 'Admin Approvals');
html = html.replace('🛡️ Beta Testers &amp; Approvals', shieldSvg + 'Beta Testers &amp; Approvals');
html = html.replace('🛡️', shieldSvg);

// 3. Replace ⚡
const zapSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align:-2px;margin-left:4px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
html = html.replace('Upgrade to Pro ⚡', 'Upgrade to Pro ' + zapSvg);

// 4. Replace 📱
const phoneSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:6px;"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>';
html = html.replace('📱 Show Digital Gym Pass', phoneSvg + 'Show Digital Gym Pass');

// 5. Replace 📅
const calSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:6px;"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>';
html = html.replace('📅 Schedule / Book Session', calSvg + 'Schedule / Book Session');

// 6. Replace 🧪
const flaskSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:6px;"><path d="M10 2v7.31"/><path d="M14 2v7.31"/><path d="M8.5 2h7"/><path d="M14 9.3 18.5 17a3 3 0 0 1-2.6 4.5H8.1A3 3 0 0 1 5.5 17L10 9.3"/></svg>';
html = html.replace('🧪 Beta Features &amp; Flags', flaskSvg + 'Beta Features &amp; Flags');

// 7. Replace 👤
const userSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:4px;"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
html = html.replace('👤 Switch to Tester View', userSvg + 'Switch to Tester View');

// 8. Replace 🔄
const refreshSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:4px;"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>';
html = html.replace('🔄 Refresh Applicants', refreshSvg + 'Refresh Applicants');

// 9. Replace 🐞
const bugSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:5px;"><rect width="8" height="14" x="8" y="6" rx="4"/><path d="m19 7-3 2"/><path d="m5 7 3 2"/><path d="m19 19-3-2"/><path d="m5 19 3-2"/><path d="M20 13h-4"/><path d="M4 13h4"/><path d="m10 4 1 2"/><path d="m14 4-1 2"/></svg>';
html = html.replaceAll('🐞 Report Beta Bug / Feedback', bugSvg + 'Report Beta Bug / Feedback');

// 10. Replace ✓ Connected
const checkSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="vertical-align:-2px;margin-right:4px;"><polyline points="20 6 9 17 4 12"/></svg>';
html = html.replace('✓ Connected', checkSvg + 'Connected');

// 11. Replace 🛒
const cartSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-left:4px;"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>';
html = html.replace('Export to Instacart 🛒', 'Export to Instacart ' + cartSvg);

// 12. Replace 🚀
const rocketSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-left:4px;"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 9v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>';
html = html.replace('Submit Application 🚀', 'Submit Application ' + rocketSvg);

// 13. Select options
html = html.replace('<option value="bug">🐛 Visual Glitch or Crash Bug</option>', '<option value="bug">Visual Glitch or Crash Bug</option>');
html = html.replace('<option value="accuracy">🎯 Sensor / Model Accuracy Issue</option>', '<option value="accuracy">Sensor / Model Accuracy Issue</option>');
html = html.replace(/<option value="feature">.*?Feature Suggestion or Improvement<\/option>/u, '<option value="feature">Feature Suggestion or Improvement</option>');
html = html.replace('<option value="performance">⚡ Performance / Latency Feedback</option>', '<option value="performance">Performance / Latency Feedback</option>');

// 14. Replace 📨
const sendSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-left:4px;"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>';
html = html.replace('Send Feedback 📨', 'Send Feedback ' + sendSvg);

// 15. Replace ✎
const editSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-left:3px;"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>';
html = html.replace('Edit Settings ✎', 'Edit Settings ' + editSvg);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Successfully upgraded index.html with clean Lucide SVG icons!');
