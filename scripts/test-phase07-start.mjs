import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('docs/v2/screens/07');
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

  // 1. First Visit (Empty state: no active plan, no recent views)
  for (const vp of VIEWPORTS) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();

      try {
        console.log(`[Home First Visit] ${theme} on ${vp.name}...`);
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.evaluate(({ curTheme }) => {
          localStorage.setItem('jy_theme', curTheme);
          localStorage.setItem('jy_language', 'de');
          localStorage.removeItem('jy_plans');
          localStorage.removeItem('jy_active_plan_id');
          localStorage.removeItem('jy_recent_views');
          if (curTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }, { curTheme: theme });

        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(400);

        const outPath = path.join(outDir, `01-home-first-visit-${vp.name}-${theme}.png`);
        await page.screenshot({ path: outPath, fullPage: true });

        // Above the fold check for 390x844
        if (vp.name === 'phone-390' && theme === 'light') {
          const foldPath = path.join(outDir, `01-home-fold-check-390.png`);
          await page.screenshot({ path: foldPath, fullPage: false });
        }
      } catch (err) {
        console.error(`Error on first visit:`, err.message);
      } finally {
        await context.close();
      }
    }
  }

  // 2. Returning Visit with Plan & Recent Views
  for (const vp of [VIEWPORTS[0], VIEWPORTS[2]]) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    try {
      console.log(`[Home Active Plan & History] light on ${vp.name}...`);
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.evaluate(() => {
        localStorage.setItem('jy_theme', 'light');
        localStorage.setItem('jy_language', 'de');
        
        // Active plan with slots
        const activePlan = {
          id: 'plan-active-1',
          name: 'Treffen am Freitag',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          targetDurationMinutes: 75,
          startTime: '17:00',
          slots: [
            { id: 's1', type: 'warmup', title: { de: 'Warm-up', en: 'Warm-up' }, durationMinutes: 15, description: { de: '', en: '' } },
            { id: 's2', type: 'study', title: { de: 'Textstudie', en: 'Study' }, durationMinutes: 30, description: { de: '', en: '' } },
            { id: 's3', type: 'service', title: { de: 'Aktion planen', en: 'Service' }, durationMinutes: 20, description: { de: '', en: '' } },
          ]
        };
        localStorage.setItem('jy_plans', JSON.stringify([activePlan]));
        localStorage.setItem('jy_active_plan_id', 'plan-active-1');

        // Recent items
        const recent = [
          { id: 'g1', type: 'game', title: { de: 'Drachenschwanz', en: 'Dragon Tail' }, subtitle: { de: 'Energizer · 15 min', en: 'Energizer · 15 min' }, path: '/games/dragon-tail' },
          { id: 'q1', type: 'quote', title: { de: 'Edelstein-Zitat', en: 'Gem Quote' }, subtitle: { de: 'Baha\'u\'llah', en: 'Baha\'u\'llah' }, path: '/quotes/q-edelstein' }
        ];
        localStorage.setItem('jy_recent_views', JSON.stringify(recent));
      });

      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      const outPath = path.join(outDir, `02-home-with-plan-${vp.name}.png`);
      await page.screenshot({ path: outPath, fullPage: true });

      // Above fold check with plan on phone-390
      if (vp.name === 'phone-390') {
        const foldPath = path.join(outDir, `02-home-with-plan-fold-check-390.png`);
        await page.screenshot({ path: foldPath, fullPage: false });
      }
    } catch (err) {
      console.error(`Error on returning visit:`, err.message);
    } finally {
      await context.close();
    }
  }

  // 3. Compact Spielfinder Open
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    try {
      console.log(`[Home Compact Spielfinder Open] phone-390...`);
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(300);
      
      // Click "Spiel finden" to toggle compact finder
      const findBtn = await page.getByRole('button', { name: /spiel finden/i });
      if (findBtn) {
        await findBtn.click();
        await page.waitForTimeout(300);
      }

      const outPath = path.join(outDir, `03-home-compact-finder-phone-390.png`);
      await page.screenshot({ path: outPath, fullPage: false });
    } catch (err) {
      console.error(`Error on compact finder:`, err.message);
    } finally {
      await context.close();
    }
  }

  // 4. English Parity on Desktop
  {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    try {
      console.log(`[Home EN Parity] desktop-1280...`);
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.evaluate(() => {
        localStorage.setItem('jy_theme', 'light');
        localStorage.setItem('jy_language', 'en');
      });
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      const outPath = path.join(outDir, `04-home-en-desktop-1280.png`);
      await page.screenshot({ path: outPath, fullPage: true });
    } catch (err) {
      console.error(`Error on EN parity:`, err.message);
    } finally {
      await context.close();
    }
  }

  await browser.close();
  console.log(`Phase 07 screenshots captured in ${outDir}!`);
}

capture().catch((err) => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
