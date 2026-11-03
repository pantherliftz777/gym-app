const { spawn } = require('child_process');
const path = require('path');
const { ensureServerRunning, forceStopServer } = require('./server_helper.js');

const testFiles = [
  'tests/anthropometrics.test.js',
  'tests/feature_engine.test.js',
  'tests/verify_merged_gym_features.js',
  'tests/feature_engine_browser.test.js',
  'tests/beta_access_e2e.test.js'
];

function runTestFile(file) {
  return new Promise((resolve, reject) => {
    console.log(`\n======================================================`);
    console.log(`RUNNING: ${file}`);
    console.log(`======================================================`);
    const child = spawn(process.execPath, [file], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, FITFUEL_TEST_RUNNER: '1' }
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Test file failed with exit code ${code}: ${file}`));
      }
    });
    child.on('error', reject);
  });
}

async function main() {
  const startTime = Date.now();
  let serverInfo = null;
  try {
    serverInfo = await ensureServerRunning();

    for (const file of testFiles) {
      await runTestFile(file);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n======================================================`);
    console.log(`✅ ALL 5 TEST SUITES PASSED (0 FAILURES) IN ${elapsed}s!`);
    console.log(`======================================================\n`);
  } catch (err) {
    console.error('\n❌ Test Suite Execution Failed:', err.message);
    process.exit(1);
  } finally {
    if (serverInfo && serverInfo.spawned) {
      forceStopServer();
    }
  }
}

main();
