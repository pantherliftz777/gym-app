const fs = require('fs');

const html = fs.readFileSync('public/index.html', 'utf8');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

// Match all button tags in HTML
const buttonRegex = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
let match;
const buttons = [];

while ((match = buttonRegex.exec(html)) !== null) {
  const attrs = match[1];
  const inner = match[2].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ').slice(0, 50);

  const idMatch = attrs.match(/\bid=["']([^"']+)["']/i);
  const classMatch = attrs.match(/\bclass=["']([^"']+)["']/i);
  const onclickMatch = attrs.match(/\bonclick=["']([^"']+)["']/i);
  const dataViewMatch = attrs.match(/\bdata-view=["']([^"']+)["']/i);
  const dataModalMatch = attrs.match(/\bdata-modal=["']([^"']+)["']/i);
  const dataTargetMatch = attrs.match(/\bdata-hub-target=["']([^"']+)["']/i);

  const id = idMatch ? idMatch[1] : null;
  const className = classMatch ? classMatch[1] : '';
  const onclick = onclickMatch ? onclickMatch[1] : null;
  const dataView = dataViewMatch ? dataViewMatch[1] : null;
  const dataModal = dataModalMatch ? dataModalMatch[1] : null;
  const dataTarget = dataTargetMatch ? dataTargetMatch[1] : null;

  buttons.push({
    id,
    className,
    text: inner,
    onclick,
    dataView,
    dataModal,
    dataTarget,
    rawAttrs: attrs.trim()
  });
}

console.log(`Total <button> elements in index.html: ${buttons.length}`);

// For each button, determine if it has a wired event handler in JS
const unhandled = [];
buttons.forEach((b, idx) => {
  let isHandled = false;
  let reason = '';

  if (b.onclick) {
    isHandled = true;
    reason = 'inline onclick: ' + b.onclick;
  } else if (b.dataView) {
    isHandled = true;
    reason = 'data-view attribute: ' + b.dataView;
  } else if (b.dataTarget) {
    isHandled = true;
    reason = 'data-hub-target: ' + b.dataTarget;
  } else if (b.id) {
    // Check if ID is referenced in fitfuel.js
    const idRegex = new RegExp(`['"#]${b.id}\\b`);
    if (idRegex.test(js)) {
      isHandled = true;
      reason = 'referenced by ID in JS';
    }
  }

  // Also check class-based delegation
  if (!isHandled && b.className) {
    const classes = b.className.split(/\s+/).filter(Boolean);
    for (const c of classes) {
      if (['nav-link', 'modal-close', 'hub-tab-btn', 'filter-pill', 'sub-muscle-pill', 'muscle-tab', 'date-pill-btn', 'ba-goal-card', 'ba-slot-action-btn', 'ba-review-retake-btn', 'ba-step-item', 'sy-bcard-action-btn'].includes(c)) {
        isHandled = true;
        reason = 'handled by class: ' + c;
        break;
      }
      // Check if class is referenced in js event delegation
      if (js.includes(`.${c}`)) {
        isHandled = true;
        reason = 'class referenced in JS: .' + c;
        break;
      }
    }
  }

  if (!isHandled) {
    unhandled.push({ index: idx, ...b });
  }
});

console.log(`\nUnhandler/Dead Buttons count: ${unhandled.length}`);
console.log('--- Unhandled Buttons Detail ---');
unhandled.forEach(u => {
  console.log(`[#${u.index}] ID: ${u.id || 'NO_ID'} | Class: "${u.className}" | Text: "${u.text}"`);
});

fs.writeFileSync('scripts/unhandled_buttons.json', JSON.stringify(unhandled, null, 2));
