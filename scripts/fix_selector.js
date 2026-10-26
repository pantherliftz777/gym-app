const fs = require('fs');
let js = fs.readFileSync('public/fitfuel.js', 'utf8');

// Replace $('.primary-nav .nav-link').forEach with $$('.primary-nav .nav-link').forEach
const bad = "$('.primary-nav .nav-link').forEach";
const good = "$$$$('.primary-nav .nav-link').forEach"; // In String.prototype.replace, '$$$$' produces '$$'

if (js.includes(bad)) {
  js = js.replace(bad, () => "$$('.primary-nav .nav-link').forEach");
  fs.writeFileSync('public/fitfuel.js', js, 'utf8');
  console.log('Fixed $$ selector in fitfuel.js!');
} else {
  console.log('bad pattern not found');
}
