import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('docs/v2/screens/06');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const VIEWPORTS = [
  { name: 'phone-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1280', width: 1280, height: 800 }
];

async function capture() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';

  // Helper setup state
  const setupState = async (page, theme, lang = 'de') => {
    await page.evaluate(({ curTheme, curLang }) => {
      localStorage.setItem('jy_theme', curTheme);
      localStorage.setItem('jy_language', curLang);
      if (curTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      // Set test group members and presence
      const testNames = ['Amina', 'David', 'Layli', 'Kian', 'Sora', 'Tariq'];
      localStorage.setItem('jy_group_names', JSON.stringify(testNames));
      localStorage.setItem('jy_group_present', JSON.stringify({
        'Amina': true,
        'David': true,
        'Layli': true,
        'Kian': true,
        'Sora': false,
        'Tariq': true
      }));
      // Set recent tools
      localStorage.setItem('jy_recent_tools', JSON.stringify(['timer', 'scoreboard', 'teams']));
    }, { curTheme: theme, curLang: lang });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
  };

  // 1. Toolkits List View (Index)
  for (const vp of VIEWPORTS) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();

      try {
        console.log(`[Toolkits Index] ${theme} on ${vp.name}...`);
        await page.goto(`${BASE_URL}/tools`, { waitUntil: 'networkidle', timeout: 15000 });
        await setupState(page, theme, 'de');

        const outPath = path.join(outDir, `01-tools-index-${vp.name}-${theme}.png`);
        await page.screenshot({ path: outPath, fullPage: true });
      } catch (err) {
        console.error(`Error on toolkits index:`, err.message);
      } finally {
        await context.close();
      }
    }
  }

  // 2. Scoreboard Tool
  for (const vp of [VIEWPORTS[0], VIEWPORTS[2]]) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    try {
      console.log(`[Scoreboard Tool] light on ${vp.name}...`);
      await page.goto(`${BASE_URL}/tools/scoreboard`, { waitUntil: 'networkidle', timeout: 15000 });
      await setupState(page, 'light', 'de');

      const outPath = path.join(outDir, `02-scoreboard-${vp.name}.png`);
      await page.screenshot({ path: outPath, fullPage: false });
    } catch (err) {
      console.error(`Error on scoreboard:`, err.message);
    } finally {
      await context.close();
    }
  }

  // 3. Teams Tool
  for (const vp of [VIEWPORTS[0], VIEWPORTS[2]]) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    try {
      console.log(`[Teams Tool] dark on ${vp.name}...`);
      await page.goto(`${BASE_URL}/tools/teams`, { waitUntil: 'networkidle', timeout: 15000 });
      await setupState(page, 'dark', 'de');

      const outPath = path.join(outDir, `03-teams-${vp.name}-dark.png`);
      await page.screenshot({ path: outPath, fullPage: false });
    } catch (err) {
      console.error(`Error on teams:`, err.message);
    } finally {
      await context.close();
    }
  }

  // 4. Timer Tool
  for (const vp of [VIEWPORTS[0], VIEWPORTS[2]]) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    try {
      console.log(`[Timer Tool] light on ${vp.name}...`);
      await page.goto(`${BASE_URL}/tools/timer`, { waitUntil: 'networkidle', timeout: 15000 });
      await setupState(page, 'light', 'de');

      const outPath = path.join(outDir, `04-timer-${vp.name}.png`);
      await page.screenshot({ path: outPath, fullPage: false });
    } catch (err) {
      console.error(`Error on timer:`, err.message);
    } finally {
      await context.close();
    }
  }

  // 5. Cards Tool (Discussion cards in Lora serif)
  for (const vp of [VIEWPORTS[0], VIEWPORTS[2]]) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    try {
      console.log(`[Cards Tool] dark on ${vp.name}...`);
      await page.goto(`${BASE_URL}/tools/cards`, { waitUntil: 'networkidle', timeout: 15000 });
      await setupState(page, 'dark', 'de');

      const outPath = path.join(outDir, `05-cards-${vp.name}-dark.png`);
      await page.screenshot({ path: outPath, fullPage: false });
    } catch (err) {
      console.error(`Error on cards:`, err.message);
    } finally {
      await context.close();
    }
  }

  // 6. English Parity Check on Phone
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    try {
      console.log(`[Toolkits EN Parity] light on phone-390...`);
      await page.goto(`${BASE_URL}/tools`, { waitUntil: 'networkidle', timeout: 15000 });
      await setupState(page, 'light', 'en');

      const outPath = path.join(outDir, `06-tools-en-phone-390.png`);
      await page.screenshot({ path: outPath, fullPage: true });
    } catch (err) {
      console.error(`Error on EN parity:`, err.message);
    } finally {
      await context.close();
    }
  }

  await browser.close();
  console.log(`Phase 06 screenshots captured successfully in ${outDir}!`);
}

capture().catch((err) => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
