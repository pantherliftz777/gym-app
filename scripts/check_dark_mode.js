const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const css = fs.readFileSync('public/styles.css', 'utf8');

const darkHtml = html.match(/theme|dark/gi);
console.log('dark in html count:', darkHtml ? darkHtml.length : 0);

const darkSelectors = [...css.matchAll(/([^{]+dark[^{]+)\{/g)].map(m => m[1].trim()).slice(0, 10);
console.log('Sample dark selectors in CSS:', darkSelectors);
