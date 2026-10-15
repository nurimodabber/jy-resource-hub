import assert from 'assert';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import http from 'http';
import submitHandler from '../api/submit.ts';

const outDir = path.resolve('docs/v2/screens/08');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. API Unit / Integration Tests
async function runApiTests() {
  console.log('Testing api/submit.ts...');

  const server = http.createServer((req, res) => {
    submitHandler(req, res);
  });

  await new Promise((resolve) => server.listen(3333, resolve));

  try {
    // Test A: Honeypot rejection
    const hpRes = await fetch('http://localhost:3333/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'spiel',
        title: 'Spam Game',
        summary: 'Spamming the site',
        steps: ['1', '2', '3'],
        hp_website: 'http://spam-bot.com',
      }),
    });
    const hpData = await hpRes.json();
    assert.strictEqual(hpData.dropped, true, 'Honeypot should trigger silent drop');

    // Test B: Too fast submission (< 3000 ms)
    const fastRes = await fetch('http://localhost:3333/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'spiel',
        title: 'Fast Game',
        summary: 'Submitted too quickly',
        steps: ['Step 1', 'Step 2', 'Step 3'],
        clientTimestamp: Date.now() - 500, // only 500ms ago
      }),
    });
    assert.strictEqual(fastRes.status, 400, 'Fast submission should return 400');

    // Test C: Graceful mailto fallback when GITHUB_TOKEN is not set
    const validRes = await fetch('http://localhost:3333/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'spiel',
        title: 'Valid Test Game',
        summary: 'A wonderful game for junior youth circle.',
        steps: ['Step 1: Introduction', 'Step 2: Main Activity', 'Step 3: Reflection'],
        clientTimestamp: Date.now() - 4000,
      }),
    });
    const validData = await validRes.json();
    assert.strictEqual(validData.ok, false);
    assert.strictEqual(validData.fallback, 'mailto', 'Should return mailto fallback when not configured');

    console.log('All api/submit.ts API tests passed successfully!');
  } finally {
    server.close();
  }
}

// 2. Playwright Screenshots
async function runScreenshots() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';

  const VIEWPORTS = [
    { name: 'phone-390', width: 390, height: 844 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'desktop-1280', width: 1280, height: 800 }
  ];

  // Capture Step 1 (Type Selection)
  for (const vp of VIEWPORTS) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();

      try {
        console.log(`[Proposal Step 1] ${theme} on ${vp.name}...`);
        await page.goto(`${BASE_URL}/vorschlagen`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.evaluate(({ curTheme }) => {
          localStorage.setItem('jy_theme', curTheme);
          localStorage.setItem('jy_language', 'de');
          localStorage.removeItem('jy_submit_draft');
          if (curTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }, { curTheme: theme });

        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(400);

        const outPath = path.join(outDir, `01-proposal-step1-${vp.name}-${theme}.png`);
        await page.screenshot({ path: outPath, fullPage: true });
      } catch (err) {
        console.error(`Error on proposal step 1:`, err.message);
      } finally {
        await context.close();
      }
    }
  }

  // Capture Step 2 (Form & Preview)
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    try {
      console.log(`[Proposal Step 2 Form] phone-390...`);
      await page.goto(`${BASE_URL}/vorschlagen`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(300);

      // Click "Gruppenspiel" to go to step 2
      await page.getByRole('button', { name: /gruppenspiel/i }).click();
      await page.waitForTimeout(400);

      const outPath = path.join(outDir, `02-proposal-form-phone-390.png`);
      await page.screenshot({ path: outPath, fullPage: true });
    } catch (err) {
      console.error(`Error on step 2 form:`, err.message);
    } finally {
      await context.close();
    }
  }

  // Capture English Parity
  {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    try {
      console.log(`[Proposal EN Parity] desktop-1280...`);
      await page.goto(`${BASE_URL}/vorschlagen`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.evaluate(() => {
        localStorage.setItem('jy_language', 'en');
      });
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      const outPath = path.join(outDir, `03-proposal-en-desktop-1280.png`);
      await page.screenshot({ path: outPath, fullPage: true });
    } catch (err) {
      console.error(`Error on EN proposal:`, err.message);
    } finally {
      await context.close();
    }
  }

  await browser.close();
  console.log(`Phase 08 screenshots captured in ${outDir}!`);
}

async function main() {
  await runApiTests();
  await runScreenshots();
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
