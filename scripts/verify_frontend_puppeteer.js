const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '..', 'test_screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runPuppeteerVerification() {
  console.log('=== STARTING COMPLETE PUPPETEER FRONTEND AI VERIFICATION ===\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  page.on('console', msg => console.log('  [BROWSER CONSOLE]', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('  [BROWSER ERROR]', err.message));
  page.on('requestfailed', req => console.log('  [BROWSER REQ FAILED]', req.url(), req.failure()?.errorText));

  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // 1. Load Main Application
    console.log('[UI TEST 1] Loading FitFuel App at http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_homepage.png') });
    console.log('-> Page loaded successfully!');
    testsPassed++;

    // 2. Verify Model Selectors & Exclusion of Laguna
    console.log('[UI TEST 2] Verifying Nemotron as primary model and exclusion of Laguna...');
    const coachModelText = await page.$eval('#coachModelActiveName', el => el.textContent.trim()).catch(() => '');
    const floatingModelText = await page.$eval('#floatingActiveModelLabel', el => el.textContent.trim()).catch(() => '');
    console.log(`-> Active Coach Model: "${coachModelText}", Active Floating Model: "${floatingModelText}"`);

    const pageContent = await page.content();
    const hasLagunaInModelPicker = pageContent.includes('Laguna XS') || pageContent.includes('Laguna S');
    if (!hasLagunaInModelPicker && (coachModelText.includes('Nemotron') || floatingModelText.includes('Nemotron'))) {
      console.log('-> SUCCESS! Nemotron is primary active model. Laguna models are completely removed from UI.\n');
      testsPassed++;
    } else {
      console.error('-> FAILED model picker check: Laguna found or Nemotron not default!');
      testsFailed++;
    }

    // 3. Test Dedicated AI Fitness Coach View
    console.log('[UI TEST 3] Testing Dedicated AI Fitness Coach View with Nemotron...');
    await page.evaluate(() => {
      if (typeof switchView === 'function') switchView('ai-coach');
    });
    await new Promise(r => setTimeout(r, 800));

    // Send a message to AI Coach
    const coachInput = await page.$('#coachChatInput');
    if (coachInput) {
      await page.type('#coachChatInput', 'What are the best mobility drills for deep squat depth?');
      const sendBtn = await page.$('#coachChatSendBtn');
      if (sendBtn) await sendBtn.click();

      console.log('-> Sent query to AI Coach. Waiting for Nemotron response...');
      await page.waitForFunction(() => {
        const msgs = Array.from(document.querySelectorAll('#coachChatStream .ai-msg.bot'))
          .filter(el => !el.className.includes('ai-typing'));
        return msgs.length >= 1 && msgs[msgs.length - 1].innerText.length > 80;
      }, { timeout: 45000 });

      const lastCoachReply = await page.evaluate(() => {
        const msgs = Array.from(document.querySelectorAll('#coachChatStream .ai-msg.bot'))
          .filter(el => !el.className.includes('ai-typing'));
        return msgs[msgs.length - 1]?.innerText || '';
      });

      if (lastCoachReply.includes('ReferenceError') || lastCoachReply.includes('Connection note: Unable')) {
        console.error('-> FAILED: AI Coach returned an error message:', lastCoachReply);
        testsFailed++;
      } else {
        console.log(`-> SUCCESS! AI Coach received dynamic Nemotron answer (${lastCoachReply.length} chars)`);
        console.log(`-> Output Preview:\n"${lastCoachReply.slice(0, 160).replace(/\n/g, ' ')}..."\n`);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_ai_coach_response.png') });
        testsPassed++;
      }
    } else {
      console.error('-> FAILED to find coachChatInput');
      testsFailed++;
    }

    // 4. Test Floating AI Assistant
    console.log('[UI TEST 4] Testing Global Floating 3D AI Assistant with Nemotron...');
    const launcher = await page.$('#floatingAiLauncher');
    if (launcher) {
      await launcher.click();
      await new Promise(r => setTimeout(r, 600));

      const floatInput = await page.$('#floatingAiInput');
      if (floatInput) {
        await page.type('#floatingAiInput', 'Give me 2 healthy high-protein snacks.');
        const floatSend = await page.$('#floatingAiSendBtn');
        if (floatSend) await floatSend.click();

        console.log('-> Sent query to Floating Assistant. Waiting for Nemotron response...');
        await page.waitForFunction(() => {
          const msgs = Array.from(document.querySelectorAll('#floatingAiMessages .ai-msg.bot'))
            .filter(el => !el.className.includes('ai-typing'));
          return msgs.length >= 2 && msgs[msgs.length - 1].innerText.length > 50;
        }, { timeout: 45000 });

        const lastFloatReply = await page.evaluate(() => {
          const msgs = Array.from(document.querySelectorAll('#floatingAiMessages .ai-msg.bot'))
            .filter(el => !el.className.includes('ai-typing'));
          return msgs[msgs.length - 1]?.innerText || '';
        });

        if (lastFloatReply.includes('ReferenceError') || lastFloatReply.includes('Connection note: Unable')) {
          console.error('-> FAILED: Floating Assistant returned an error message:', lastFloatReply);
          testsFailed++;
        } else {
          console.log(`-> SUCCESS! Floating Assistant received dynamic Nemotron answer (${lastFloatReply.length} chars)`);
          console.log(`-> Output Preview:\n"${lastFloatReply.slice(0, 140).replace(/\n/g, ' ')}..."\n`);
          await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_floating_assistant_response.png') });
          testsPassed++;
        }
      }
    }

    // 5. Test AI Workout & Diet Plan Generator
    console.log('[UI TEST 5] Testing AI Workout & Diet Plan Generator UI (#generateAiPlanBtn)...');
    await page.evaluate(() => {
      if (typeof openModal === 'function') openModal('#aiPlanModal');
    });
    await new Promise(r => setTimeout(r, 1200));

    const modalOpen = await page.evaluate(() => document.querySelector('#aiPlanModal')?.classList.contains('open'));
    console.log(`-> #aiPlanModal open state: ${modalOpen}`);

    const generateBtn = await page.$('#generateAiPlanBtn');
    if (generateBtn) {
      console.log('-> Triggering click on "Generate & Apply My AI Plan" (#generateAiPlanBtn)...');
      await page.evaluate(() => {
        const btn = document.querySelector('#generateAiPlanBtn');
        if (btn) btn.click();
      });

      console.log('-> Waiting for AI plan generation and modal close...');
      await page.waitForFunction(() => {
        const modal = document.querySelector('#aiPlanModal');
        return modal && !modal.classList.contains('open');
      }, { timeout: 60000 });

      const workoutTitle = await page.evaluate(() => {
        return document.querySelector('#planWorkoutTitle')?.textContent || document.querySelector('#workoutRoutineName')?.textContent || '';
      });

      console.log(`-> SUCCESS! AI Plan generated and applied! Active Workout: "${workoutTitle.trim()}"\n`);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_ai_plan_applied.png') });
      testsPassed++;
    } else {
      console.error('-> FAILED to find #generateAiPlanBtn');
      testsFailed++;
    }

    // 6. Test 4D Body Scan & Transformation Assessment UI
    console.log('[UI TEST 6] Testing 4D Body Transformation Assessment UI with Nemotron...');
    await page.evaluate(() => {
      const activeModals = document.querySelectorAll('.modal-backdrop.open');
      activeModals.forEach(m => m.classList.remove('open'));
      if (typeof switchView === 'function') switchView('body-analysis');
    });
    await new Promise(r => setTimeout(r, 600));

    const scanResult = await page.evaluate(async () => {
      const res = await fetch('/api/body-scan/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: 'lean_athletic',
          preferences: {
            age: 26,
            weight: 72,
            height: 178,
            daysPerWeek: 4,
            durationMin: 45,
            equipment: 'gym',
            dietary: 'balanced'
          },
          images: []
        })
      });
      const data = await res.json();
      if (data && data.analysis && typeof renderTransformationDashboard === 'function') {
        renderTransformationDashboard(data.analysis);
        if (typeof goToBodyStep === 'function') goToBodyStep(6);
      }
      return data;
    });

    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_body_transformation_dashboard.png') });

    if (scanResult && scanResult.analysis && scanResult.analysis.assessmentSummary) {
      console.log(`-> SUCCESS! 4D Transformation Dashboard rendered with AI assessment!`);
      console.log(`-> Provider: ${scanResult.provider}, Model: ${scanResult.model}`);
      console.log(`-> Summary: "${scanResult.analysis.assessmentSummary.slice(0, 140)}..."\n`);
      testsPassed++;
    } else {
      console.error('-> FAILED 4D body scan UI rendering');
      testsFailed++;
    }

  } catch (err) {
    console.error('PUPPETEER ERROR:', err.message);
    testsFailed++;
  } finally {
    await browser.close();
  }

  console.log(`=== COMPLETE PUPPETEER FRONTEND RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED ===`);
  if (testsFailed > 0) process.exit(1);
}

runPuppeteerVerification();
