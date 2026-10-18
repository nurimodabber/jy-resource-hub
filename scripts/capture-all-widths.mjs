import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('docs/redesign/width-audit-screens');
fs.mkdirSync(OUT_DIR, { recursive: true });

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const routes = [
  { name: 'home', path: '/' },
  { name: 'quotes', path: '/quotes' },
  { name: 'treffen', path: '/treffen' },
  { name: 'tools', path: '/tools' },
  { name: 'service', path: '/service' },
  { name: 'saved', path: '/saved' },
];

async function main() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  });

  const page = await context.newPage();

  // Populate mock bookmarks so saved page has cards
  await page.goto('http://localhost:3000/');
  await page.evaluate(() => {
    localStorage.setItem('jy_theme', 'dark');
    document.documentElement.classList.add('dark');
    localStorage.setItem('jy_favorites', JSON.stringify(['sp_01', 'breezes_01', 'community_cleanup']));
  });

  for (const r of routes) {
    await page.goto(`http://localhost:3000${r.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    const file = path.join(OUT_DIR, `${r.name}-1440-dark.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log(`Saved ${r.name}-1440-dark.png`);
  }

  await browser.close();
  console.log('✅ All width audit screenshots saved!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
