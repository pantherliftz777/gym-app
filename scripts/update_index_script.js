const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');
if (!html.includes('modules/beta-manager.js')) {
  html = html.replace(
    '<script src="fitfuel.js?v=7.9.0"></script>',
    '<script src="modules/beta-manager.js?v=7.9.0"></script>\r\n<script src="fitfuel.js?v=7.9.0"></script>'
  );
  fs.writeFileSync('public/index.html', html, 'utf8');
  console.log('Added beta-manager.js script tag successfully');
} else {
  console.log('Script tag already present');
}
