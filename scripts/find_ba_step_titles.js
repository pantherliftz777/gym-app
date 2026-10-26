const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

for (let i = 1; i <= 6; i++) {
  const stepIdx = html.indexOf(`id="baStep${i}"`);
  if (stepIdx !== -1) {
    const chunk = html.substring(stepIdx, stepIdx + 400);
    const titleMatch = chunk.match(/<h[234][^>]*>(.*?)<\/h[234]>/);
    console.log(`Step ${i}:`, titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : 'No title');
  }
}
