const fs = require('fs');
const path = require('path');

const testPath = path.join(__dirname, '..', 'tests', 'e2e', 'comprehensive_audit.test.js');
let testCode = fs.readFileSync(testPath, 'utf8');

// Fix accidental duplicate block inside auth register check
const badBlock = `    // REGRESSION TEST: Dashboard Shell, Sidebar & SVG Dimensions
    const layoutIntegrity = await page.evaluate(() => {
      const sidebar = document.querySelector('.sidebar');
      const today = document.querySelector('#view-today');
      const logoSvg = document.querySelector('.fitusion-logo-icon');
      const giantSvgs = Array.from(document.querySelectorAll('svg')).filter(s => {
        const r = s.getBoundingClientRect();
        return r.width > 400 || r.height > 400;
      });
      return {
        sidebarWidth: sidebar ? sidebar.getBoundingClientRect().width : 0,
        todayHeight: today ? today.getBoundingClientRect().height : 0,
        logoSvgWidth: logoSvg ? logoSvg.getBoundingClientRect().width : 0,
        giantSvgCount: giantSvgs.length
      };
    });

    if (layoutIntegrity.sidebarWidth >= 200 && layoutIntegrity.sidebarWidth <= 320) {
      recordPass(\`Dashboard sidebar width is constrained (\${layoutIntegrity.sidebarWidth}px)\`);
    } else {
      recordFail('Dashboard sidebar width', { reason: \`Width was \${layoutIntegrity.sidebarWidth}px\`, file: 'dashboard-styles.css', line: 1 });
    }

    if (layoutIntegrity.todayHeight > 500) {
      recordPass(\`Dashboard view-today has full content rendered (\${layoutIntegrity.todayHeight}px)\`);
    } else {
      recordFail('Dashboard view-today content height', { reason: \`Height was \${layoutIntegrity.todayHeight}px\`, file: 'dashboard.html', line: 760 });
    }

    if (layoutIntegrity.giantSvgCount === 0 && layoutIntegrity.logoSvgWidth <= 32) {
      recordPass('No oversized SVGs or unconstrained logo paths (logo: ' + layoutIntegrity.logoSvgWidth + 'px)');
    } else {
      recordFail('SVG sizing regression', { reason: \`giantSvgCount=\${layoutIntegrity.giantSvgCount}, logoWidth=\${layoutIntegrity.logoSvgWidth}px\`, file: 'dashboard.html', line: 352 });
    }`;

// Replace the first occurrence of badBlock (inside auth test)
if (testCode.indexOf(badBlock) !== -1) {
  testCode = testCode.replace(badBlock, '');
}

// Remove any third occurrence if it was added before Phase 6
const phase5Idx = testCode.indexOf('// PHASE 5: API CONTRACT');
const phase6Idx = testCode.indexOf('// PHASE 6: PWA & SERVICE WORKER');
if (phase6Idx > phase5Idx) {
  const between = testCode.slice(phase5Idx, phase6Idx);
  if (between.includes('REGRESSION TEST: Dashboard Shell')) {
    const fixedBetween = between.replace(badBlock, '');
    testCode = testCode.slice(0, phase5Idx) + fixedBetween + testCode.slice(phase6Idx);
  }
}

fs.writeFileSync(testPath, testCode, 'utf8');
console.log('Fixed test file cleanly.');
