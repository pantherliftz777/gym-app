const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

function printCards(listId) {
  console.log('*** LIST: ' + listId + ' ***');
  const start = html.indexOf('id="' + listId + '"');
  if (start === -1) {
    console.log('NOT FOUND');
    return;
  }
  const snippet = html.substring(start, start + 3000);
  const regex = /data-(motive|minutes|intensity|days)="([^"]+)"|value="([^"]+)"/g;
  let match;
  while ((match = regex.exec(snippet)) !== null) {
    console.log('  ' + match[0]);
  }
}

['motiveOptionsList', 'chTypesOptionsList', 'chTimeOptionsList', 'chIntensityOptionsList', 'durationOptionsList'].forEach(printCards);
