import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const VIEWPORTS = [
  { name: 'phone-portrait', width: 390, height: 844 },
  { name: 'phone-landscape', width: 844, height: 390 },
  { name: 'tablet-portrait', width: 820, height: 1180 },
  { name: 'tablet-landscape', width: 1180, height: 820 },
  { name: 'desktop', width: 1440, height: 900 }
];

const TABS = ['games', 'quotes', 'planner', 'service-arts', 'tools'];

const targetDir = process.argv[2] || 'screenshots/baseline';
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    for (const tab of TABS) {
      const url = `http://localhost:3000/#/${tab}`;
      console.log(`Capturing ${vp.name} (${vp.width}x${vp.height}) - ${tab}...`);
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600); // allow layout & fonts to settle
      const filename = path.join(targetDir, `${tab}_${vp.name}.png`);
      await page.screenshot({ path: filename, fullPage: false });
    }

    await context.close();
  }

  await browser.close();
  console.log('All screenshots captured in', targetDir);
}

run().catch((err) => {
  console.error('Error taking screenshots:', err);
  process.exit(1);
});
