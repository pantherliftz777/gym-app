const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

const target = `    </div>
  </div>
<!-- ================= FITFUEL PREMIUM PAID PLANS MODAL (IMAGE 4) ================= -->`;

const replacement = `    </div>
  </div>
</div>

<!-- ================= FITFUEL PREMIUM PAID PLANS MODAL (IMAGE 4) ================= -->`;

if (html.includes(target)) {
  html = html.replace(target, replacement);
  fs.writeFileSync('public/index.html', html, 'utf8');
  console.log('Successfully added missing </div> for exerciseDetailModal');
} else {
  // Regex fallback handling CRLF or different whitespace
  const reg = /(Mark Completed\s*<\/button>\s*<\/div>\s*<\/div>)(\s*<!-- ================= FITFUEL PREMIUM PAID PLANS MODAL)/;
  if (reg.test(html)) {
    html = html.replace(reg, '$1\n</div>\n$2');
    fs.writeFileSync('public/index.html', html, 'utf8');
    console.log('Successfully added missing </div> via regex fallback');
  } else {
    console.error('FAILED to find target location');
  }
}
