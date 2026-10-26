const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('id="view-body-analysis"');
const eIdx = html.indexOf('id="view-', sIdx + 20);
const bodyAnalysisHtml = html.slice(sIdx, eIdx);

const buttonRegex = /<button[^>]*>([\s\S]*?)<\/button>/gi;
let match;
const buttons = [];
while ((match = buttonRegex.exec(bodyAnalysisHtml)) !== null) {
  const fullTag = match[0].slice(0, match[0].indexOf('>') + 1);
  const text = match[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
  buttons.push({ fullTag, text });
}

console.log('Buttons in view-body-analysis:', buttons.length);
buttons.forEach((b, i) => {
  console.log(`${i+1}. Text: "${b.text}" | Tag: ${b.fullTag}`);
});
