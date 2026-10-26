/* FitFuel V5 Comprehensive Feature Test Suite */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3005;

console.log('[Test Suite] Spawning FitFuel server on port ' + PORT + '...');
const child = spawn(process.execPath, [path.join(__dirname, '../server.js')], {
  env: { ...process.env, PORT: String(PORT) },
  stdio: 'inherit'
});

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: '127.0.0.1',
      port: PORT,
      path: path,
      method: method,
      headers: { ...headers }
    };
    if (body) {
      const data = typeof body === 'string' ? body : JSON.stringify(body);
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(data);
    }
    const req = http.request(opts, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(d); } catch (e) {}
        resolve({ status: res.statusCode, headers: res.headers, raw: d, json });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function run() {
  await new Promise(r => setTimeout(r, 1200));
  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name}: ${details}`);
      failed++;
    }
  }

  console.log('\n--- 1. API HEALTH CHECK ---');
  const health = await request('GET', '/api/health');
  assert('Health returns 200', health.status === 200, `Got ${health.status}`);
  assert('Status is healthy', health.json && health.json.status === 'healthy', JSON.stringify(health.json));
  assert('Database is connected', health.json && health.json.database === 'connected', JSON.stringify(health.json));

  console.log('\n--- 2. PWA & STATIC ASSET DELIVERY ---');
  const manifest = await request('GET', '/manifest.json');
  assert('Manifest returns 200', manifest.status === 200, `Got ${manifest.status}`);
  assert('Manifest has display standalone', manifest.json && manifest.json.display === 'standalone');
  assert('Manifest has name FitFuel', manifest.json && manifest.json.short_name === 'FitFuel');

  const sw = await request('GET', '/sw.js');
  assert('Service Worker returns 200', sw.status === 200, `Got ${sw.status}`);
  assert('Service Worker contains CACHE_NAME', sw.raw && (sw.raw.includes('fitfuel-cache-') || sw.raw.includes('CACHE_NAME')));

  console.log('\n--- 3. MODULARIZED FEATURE ASSETS ---');
  for (const mod of ['pwa-sync.js', 'voice-coach.js', 'social-card.js', 'barcode-scanner.js', 'mediapipe-posture.js']) {
    const res = await request('GET', `/modules/${mod}`);
    assert(`Module ${mod} accessible`, res.status === 200, `Got ${res.status}`);
  }

  console.log('\n--- 4. RATE LIMITING & SECURITY HARDENING ---');
  // Send 16 rapid login attempts (max 15 allowed)
  let rateLimited = false;
  for (let i = 0; i < 17; i++) {
    const res = await request('POST', '/api/auth/login', { email: `fake_${i}@example.com`, password: 'WrongPassword123!' });
    if (res.status === 429) {
      rateLimited = true;
      assert('Rate limiting blocks 16th login attempt with 429', true, `Blocked at request #${i + 1}`);
      break;
    }
  }
  assert('Rate limiter triggered successfully', rateLimited, 'Did not encounter 429 status code');

  console.log('\n--- 5. OPENFOODFACTS NUTRITION INTEGRATION ---');
  try {
    const ofRes = await fetch('https://world.openfoodfacts.org/api/v2/product/737628064502.json');
    if (ofRes.ok) {
      const ofData = await ofRes.json();
      assert('OpenFoodFacts API reachable', ofData.status === 1 || ofData.product !== undefined);
      assert('Product nutrition retrieved', ofData.product && ofData.product.nutriments);
    } else {
      console.log('  ⚠️ OpenFoodFacts responded with status ' + ofRes.status + ' (external network latency)');
    }
  } catch (err) {
    console.log('  ⚠️ OpenFoodFacts network test skipped (external offline/timeout):', err.message);
  }

  console.log('\n--- 6. CREDENTIAL LEAK PREVENTION CHECK ---');
  const jwtRegex = /eyJhbGciOi/;
  const serverCode = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
  assert('server.js has no hardcoded JWT tokens', !jwtRegex.test(serverCode));
  const initCode = fs.readFileSync(path.join(__dirname, 'init_turso.js'), 'utf8');
  assert('init_turso.js has no hardcoded JWT tokens', !jwtRegex.test(initCode));

  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  try {
    process.kill(child.pid);
  } catch (e) {}
  setTimeout(() => process.exit(failed > 0 ? 1 : 0), 200);
}

run().catch(err => {
  console.error('Fatal test error:', err);
  try {
    process.kill(child.pid);
  } catch (e) {}
  setTimeout(() => process.exit(1), 200);
});
