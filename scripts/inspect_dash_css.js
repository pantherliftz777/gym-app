const fs = require('fs');

const dashCss = fs.readFileSync('gym-app/public/dashboard-styles.css', 'utf8');
console.log('Total length of dashboard-styles.css:', dashCss.length);

// Check if app-shell, sidebar, topbar, view are defined
console.log('Contains .app-shell?', dashCss.includes('.app-shell'));
console.log('Contains .sidebar?', dashCss.includes('.sidebar'));
console.log('Contains .page-content?', dashCss.includes('.page-content'));
console.log('Contains .view {?', dashCss.includes('.view'));
console.log('Contains .view.active?', dashCss.includes('.view.active'));

// Find app-shell rule in dashCss
const matchAppShell = dashCss.match(/\.app-shell[^{]*\{[^}]+\}/);
console.log('App shell rule:', matchAppShell ? matchAppShell[0] : 'not found');

// Find sidebar rule in dashCss
const matchSidebar = dashCss.match(/\.sidebar[^{]*\{[^}]+\}/);
console.log('Sidebar rule:', matchSidebar ? matchSidebar[0] : 'not found');
