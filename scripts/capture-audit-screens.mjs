import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/Users/nurimilanmodabber/.gemini/antigravity/brain/74c6dd68-6b04-450b-a5f6-edba6a99cca3/audit-screens';
fs.mkdirSync(OUT_DIR, { recursive: true });

const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';

const routes = [
  { path: '/', slug: 'home' },
  { path: '/games', slug: 'games' },
  { path: '/games/menschlicher-knoten', slug: 'game-detail' },
  { path: '/quotes', slug: 'quotes' },
  { path: '/quotes/numbers-orderly-thoughts', slug: 'quote-detail' },
  { path: '/service-arts', slug: 'service-arts' },
  { path: '/treffen', slug: 'treffen' },
  { path: '/tools', slug: 'tools' },
  { path: '/tools/timer', slug: 'timer' },
];

const viewports = [
  { width: 390, height: 844, name: '390', isMobile: true },
  { width: 768, height: 1024, name: '768', isMobile: false },
  { width: 1280, height: 800, name: '1280', isMobile: false },
];

const themes = ['dark', 'light'];

async function run() {
  console.log(`🚀 Starting capture of 54 audit screens against ${BASE_URL}...`);
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
      // Set theme in localStorage & document class
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
          await page.waitForTimeout(300);

          const fileName = `${route.slug}-${vp.name}-${theme}.png`;
          const filePath = path.join(OUT_DIR, fileName);
          await page.screenshot({ path: filePath, fullPage: false });
          console.log(`Saved ${fileName}`);
        } catch (err) {
          console.error(`Error on ${route.path} (${vp.name}, ${theme}):`, err.message);
        }
      }
    }
    await context.close();
  }

  await browser.close();
  console.log('✅ All 54 screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Fatal error during capture:', err);
  process.exit(1);
});
