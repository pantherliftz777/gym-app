const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

// Find all buttons or links with data-view
const viewBtnRegex = /<(?:button|a)[^>]*data-view="([^"]+)"[^>]*>/g;
let m;
const viewTriggers = [];
while ((m = viewBtnRegex.exec(html)) !== null) {
  viewTriggers.push({ full: m[0], view: m[1] });
}
console.log('=== DATA-VIEW TRIGGERS IN HTML ===');
const grouped = {};
viewTriggers.forEach(t => {
  grouped[t.view] = grouped[t.view] || [];
  grouped[t.view].push(t.full.replace(/\s+/g, ' '));
});
for (const [v, list] of Object.entries(grouped)) {
  console.log(`View: ${v} (${list.length} triggers)`);
  list.forEach(item => console.log('   ' + item.slice(0, 120)));
}

// Find mobile nav
console.log('\n=== MOBILE NAV BUTTONS ===');
const mobNavRegex = /class="mobile-nav-btn[^"]*"[^>]*>/g;
while ((m = mobNavRegex.exec(html)) !== null) {
  console.log('   ' + m[0]);
}

// Find 3dots menu items or more features modal
console.log('\n=== 3DOTS / MORE MENU ITEMS ===');
const moreItemRegex = /class="[^"]*(?:more-menu-item|quick-action-item|feature-card)[^"]*"[^>]*>/g;
while ((m = moreItemRegex.exec(html)) !== null) {
  console.log('   ' + m[0].slice(0, 120));
}
