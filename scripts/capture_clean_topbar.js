const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true
  });

  const artDir = 'C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a';

  // 1. Laptop 1280x800
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      if (window.applyTheme) window.applyTheme('light');
      const authBtn = document.getElementById('topAuthBtn');
      if (authBtn) authBtn.textContent = 'Sign out';
      const greeting = document.getElementById('userGreeting');
      if (greeting) greeting.textContent = 'Good evening, Utkarsh';
    });
    await new Promise(r => setTimeout(r, 400));
    const p = path.join(artDir, 'topbar_laptop_1280_fixed.png');
    await page.screenshot({ path: p, clip: { x: 0, y: 0, width: 1280, height: 200 } });
    console.log('Saved laptop screenshot:', p);
    await page.close();
  }

  // 2. Large Desktop 1440x900
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      if (window.applyTheme) window.applyTheme('light');
      const authBtn = document.getElementById('topAuthBtn');
      if (authBtn) authBtn.textContent = 'Sign out';
      const greeting = document.getElementById('userGreeting');
      if (greeting) greeting.textContent = 'Good evening, Utkarsh';
    });
    await new Promise(r => setTimeout(r, 400));
    const p = path.join(artDir, 'topbar_desktop_1440_fixed.png');
    await page.screenshot({ path: p, clip: { x: 0, y: 0, width: 1440, height: 200 } });
    console.log('Saved desktop screenshot:', p);
    await page.close();
  }

  // 3. Mobile 390x844
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      if (window.applyTheme) window.applyTheme('light');
      const authBtn = document.getElementById('topAuthBtn');
      if (authBtn) authBtn.textContent = 'Sign out';
      const greeting = document.getElementById('userGreeting');
      if (greeting) greeting.textContent = 'Good evening, Utkarsh';
    });
    await new Promise(r => setTimeout(r, 400));
    const p = path.join(artDir, 'topbar_mobile_390_fixed.png');
    await page.screenshot({ path: p, clip: { x: 0, y: 0, width: 390, height: 260 } });
    console.log('Saved mobile screenshot:', p);
    await page.close();
  }

  // 4. Laptop Dark Mode 1280x800
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      if (window.applyTheme) window.applyTheme('dark');
      const authBtn = document.getElementById('topAuthBtn');
      if (authBtn) authBtn.textContent = 'Sign out';
      const greeting = document.getElementById('userGreeting');
      if (greeting) greeting.textContent = 'Good evening, Utkarsh';
    });
    await new Promise(r => setTimeout(r, 400));
    const p = path.join(artDir, 'topbar_laptop_1280_dark_fixed.png');
    await page.screenshot({ path: p, clip: { x: 0, y: 0, width: 1280, height: 200 } });
    console.log('Saved laptop dark screenshot:', p);
    await page.close();
  }

  await browser.close();
  console.log('All captures done!');
}

capture().catch(console.error);
