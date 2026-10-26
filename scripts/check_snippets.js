const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

// Find all elements that look like interactive buttons or cards
const btnLikeRegex = /<(button|a|div)\b([^>]*class=["'][^"']*(?:btn|button|card-action|quick-action|action-btn|choice-card)[^"']*["'][^>]*)>([\s\S]*?)<\/\1>/gi;
let m;
const unhandledInteractive = [];

while ((m = btnLikeRegex.exec(html)) !== null) {
  const tag = m[1];
  const attrs = m[2];
  const inner = m[3].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ').slice(0, 40);

  const idMatch = attrs.match(/\bid=["']([^"']+)["']/i);
  const classMatch = attrs.match(/\bclass=["']([^"']+)["']/i);
  const onclickMatch = attrs.match(/\bonclick=["']([^"']+)["']/i);
  const dataViewMatch = attrs.match(/\bdata-view=["']([^"']+)["']/i);

  const id = idMatch ? idMatch[1] : null;
  const className = classMatch ? classMatch[1] : '';

  let handled = false;
  if (onclickMatch || dataViewMatch) handled = true;
  if (!handled && id && (js.includes(`'#${id}'`) || js.includes(`"#${id}"`) || js.includes(`'${id}'`) || js.includes(`"${id}"`))) handled = true;

  if (!handled) {
    const classes = className.split(/\s+/).filter(Boolean);
    for (const c of classes) {
      if (js.includes(`.${c}`) || js.includes(`"${c}"`) || js.includes(`'${c}'`)) {
        handled = true;
        break;
      }
    }
  }

  if (!handled) {
    unhandledInteractive.push({ tag, id, className, text: inner, attrs: attrs.trim() });
  }
}

console.log(`Found ${unhandledInteractive.length} potentially unhandled interactive elements:`);
unhandledInteractive.forEach(u => console.log(`  <${u.tag}> [${u.id || 'NO_ID'}] class="${u.className}" text="${u.text}"`));
