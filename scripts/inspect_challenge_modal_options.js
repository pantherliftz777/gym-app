const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
['motiveOptionsList', 'chTypesOptionsList', 'chTimeOptionsList', 'chIntensityOptionsList', 'durationOptionsList'].forEach(id => {
  const i = html.indexOf('id="' + id + '"');
  console.log('=== ' + id + ' ===');
  if (i !== -1) {
    console.log(html.substring(i, i + 800));
  } else {
    console.log('NOT FOUND');
  }
});
