import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('docs/v2/screens/00');
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

  for (const vp of VIEWPORTS) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();

      try {
        console.log(`Capturing ${theme} mode on ${vp.name}...`);
        await page.goto(`${BASE_URL}/_design`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(500);

        if (theme === 'dark') {
          await page.evaluate(() => {
            document.documentElement.classList.add('dark');
            localStorage.setItem('jy_theme', 'dark');
          });
          await page.waitForTimeout(400);
        } else {
          await page.evaluate(() => {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('jy_theme', 'light');
          });
          await page.waitForTimeout(400);
        }

        const screenPath = path.join(outDir, `gallery-${theme}-${vp.name}.png`);
        await page.screenshot({ path: screenPath, fullPage: true });
        console.log(`Saved: ${screenPath}`);
      } catch (err) {
        console.error(`Error on ${vp.name} (${theme}):`, err.message);
      } finally {
        await context.close();
      }
    }
  }

  await browser.close();
  console.log('Finished capturing gallery screenshots.');
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});
