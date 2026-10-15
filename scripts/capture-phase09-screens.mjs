import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT_DIR, 'docs/v2/screens/09');

fs.mkdirSync(OUT_DIR, { recursive: true });

const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';

async function capture() {
  console.log('📸 Capturing Phase 09 matrix screens on', BASE_URL);
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  const matrix = [
    { name: '01-home-390-de-light', path: '/', width: 390, height: 844, isMobile: true, lang: 'de', theme: 'light' },
    { name: '02-home-390-en-dark', path: '/', width: 390, height: 844, isMobile: true, lang: 'en', theme: 'dark' },
    { name: '03-games-768-de-light', path: '/games', width: 768, height: 1024, isMobile: false, lang: 'de', theme: 'light' },
    { name: '04-quotes-1024-en-dark', path: '/quotes', width: 1024, height: 768, isMobile: false, lang: 'en', theme: 'dark' },
    { name: '05-treffen-1280-de-light', path: '/treffen', width: 1280, height: 800, isMobile: false, lang: 'de', theme: 'light' },
    { name: '06-treffen-live-1280-de-dark', path: '/treffen', width: 1280, height: 800, isMobile: false, lang: 'de', theme: 'dark', action: 'preset' },
    { name: '07-tools-1280-de-light', path: '/tools', width: 1280, height: 800, isMobile: false, lang: 'de', theme: 'light' },
    { name: '08-vorschlagen-390-de-light', path: '/vorschlagen', width: 390, height: 844, isMobile: true, lang: 'de', theme: 'light' },
    { name: '09-service-arts-1920-de-light', path: '/service-arts', width: 1920, height: 1080, isMobile: false, lang: 'de', theme: 'light' },
    { name: '10-datenschutz-1280-de-light', path: '/datenschutz', width: 1280, height: 800, isMobile: false, lang: 'de', theme: 'light' },
  ];

  for (const item of matrix) {
    const context = await browser.newContext({
      viewport: { width: item.width, height: item.height },
      isMobile: item.isMobile,
      hasTouch: item.isMobile,
    });
    const page = await context.newPage();

    // Set storage beforehand
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.evaluate(({ lang, theme }) => {
      localStorage.setItem('jy_lang', lang);
      localStorage.setItem('jy_theme', theme);
      if (theme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }, { lang: item.lang, theme: item.theme });

    await page.goto(`${BASE_URL}${item.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    if (item.action === 'preset') {
      const presetBtn = page.locator('button:has-text("Normales Treffen"), button:has-text("Standard Gathering")').first();
      if (await presetBtn.isVisible()) {
        await presetBtn.click();
        await page.waitForTimeout(400);
      }
      const startLiveBtn = page.locator('button:visible:has-text("Treffen starten")').first();
      if (await startLiveBtn.isVisible() && await startLiveBtn.isEnabled()) {
        await startLiveBtn.click();
        await page.waitForTimeout(400);
      }
    }

    const file = path.join(OUT_DIR, `${item.name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log(`Saved screenshot: ${item.name}.png`);
    await context.close();
  }

  await browser.close();
  console.log('✅ All Phase 09 matrix screens captured successfully!');
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});
