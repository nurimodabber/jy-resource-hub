import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUT_DIR = path.resolve('docs/redesign/phase03-screens');
fs.mkdirSync(OUT_DIR, { recursive: true });

const viewports = [
  { width: 1440, height: 900, name: '1440', isMobile: false },
  { width: 1024, height: 768, name: '1024', isMobile: false },
  { width: 768, height: 1024, name: '768', isMobile: false },
  { width: 390, height: 844, name: '390', isMobile: true },
];

const themes = ['dark', 'light'];

async function run() {
  console.log(`🚀 Capturing Phase 3 HomeView screens against ${BASE_URL}...`);
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

      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);

      // 1. Above the fold screenshot
      const foldFileName = `home-${vp.name}-${theme}-fold.png`;
      await page.screenshot({ path: path.join(OUT_DIR, foldFileName), fullPage: false });
      console.log(`Saved ${foldFileName}`);

      // 2. Full page screenshot showing all sections down to footer
      const fullFileName = `home-${vp.name}-${theme}-full.png`;
      await page.screenshot({ path: path.join(OUT_DIR, fullFileName), fullPage: true });
      console.log(`Saved ${fullFileName}`);
    }
    await context.close();
  }

  await browser.close();
  console.log(`✅ Phase 3 screenshots saved in ${OUT_DIR}`);
}

run().catch((err) => {
  console.error('Fatal error during capture:', err);
  process.exit(1);
});
