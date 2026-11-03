const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

let spawnedProcess = null;

function isServerListening(port = 3000) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/api/health`, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function ensureServerRunning(port = 3000) {
  const isUp = await isServerListening(port);
  if (isUp) {
    return { spawned: false };
  }

  console.log(`[Test Harness] No responding server found on port ${port}. Spawning server.js...`);
  const serverPath = path.join(__dirname, '..', 'server.js');
  spawnedProcess = spawn(process.execPath, [serverPath], {
    env: { ...process.env, PORT: String(port) },
    stdio: 'ignore',
    detached: false
  });

  const startTime = Date.now();
  while (Date.now() - startTime < 15000) {
    await new Promise(r => setTimeout(r, 400));
    if (await isServerListening(port)) {
      console.log(`[Test Harness] Server successfully spawned and ready on port ${port}.`);
      return { spawned: true, process: spawnedProcess };
    }
  }

  try {
    if (spawnedProcess) spawnedProcess.kill();
  } catch (e) {}
  throw new Error(`[Test Harness] Server failed to start on port ${port} within 15 seconds.`);
}

function stopServerIfSpawned() {
  if (process.env.FITFUEL_TEST_RUNNER === '1') {
    return;
  }
  forceStopServer();
}

function forceStopServer() {
  if (spawnedProcess) {
    try {
      console.log('[Test Harness] Shutting down spawned test server...');
      spawnedProcess.kill();
    } catch (e) {}
    spawnedProcess = null;
  }
}

process.on('exit', () => {
  if (process.env.FITFUEL_TEST_RUNNER !== '1') {
    forceStopServer();
  }
});
process.on('SIGINT', () => {
  forceStopServer();
  process.exit(1);
});
process.on('SIGTERM', () => {
  forceStopServer();
  process.exit(1);
});

module.exports = {
  ensureServerRunning,
  stopServerIfSpawned,
  forceStopServer,
  isServerListening
};
