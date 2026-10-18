import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUT_DIR = path.resolve('docs/redesign/phase01-screens');
fs.mkdirSync(OUT_DIR, { recursive: true });

const routes = [
  { path: '/', slug: 'home' },
  { path: '/quotes', slug: 'quotes' },
  { path: '/tools', slug: 'tools' },
  { path: '/games/menschlicher-knoten', slug: 'game-detail' },
];

const viewports = [
  { width: 1440, height: 900, name: '1440', isMobile: false },
  { width: 390, height: 844, name: '390', isMobile: true },
];

const themes = ['dark', 'light'];

async function run() {
  console.log(`🚀 Capturing Phase 1 screens against ${BASE_URL}...`);
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
    });
    const page = await context.newPage();

    for (const theme of themes) {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await page.evaluate((th) => {
        localStorage.setItem('jy_theme', th);
        localStorage.setItem('jy_lang', 'de');
        if (th === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }, theme);

      for (const route of routes) {
        const url = `${BASE_URL}${route.path}`;
        try {
          await page.goto(url, { waitUntil: 'networkidle' });
          await page.waitForTimeout(200);

          // Get meta theme-color value to verify
          const metaThemeColor = await page.evaluate(() => {
            const el = document.querySelector('meta[name="theme-color"]');
            return el ? el.getAttribute('content') : null;
          });

          const fileName = `${route.slug}-${vp.name}-${theme}.png`;
          const filePath = path.join(OUT_DIR, fileName);
          await page.screenshot({ path: filePath, fullPage: false });
          console.log(`Saved ${fileName} (meta theme-color: ${metaThemeColor})`);
        } catch (err) {
          console.error(`Error on ${route.path} (${vp.name}, ${theme}):`, err.message);
        }
      }
    }
    await context.close();
  }

  await browser.close();
  console.log(`✅ Phase 1 screenshots saved in ${OUT_DIR}`);
}

run().catch((err) => {
  console.error('Fatal error during capture:', err);
  process.exit(1);
});
