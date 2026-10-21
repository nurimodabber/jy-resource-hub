import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const outDir = path.resolve('docs/v2/comparison-noble');
fs.mkdirSync(outDir, { recursive: true });

async function run() {
  console.log('Extracting old version screenshots from git commit d43ecda...');
  try {
    execSync(`git show d43ecda:docs/v2/screens/07/01-home-first-visit-desktop-1280-dark.png > ${outDir}/old-home-desktop.png`);
    execSync(`git show d43ecda:docs/v2/screens/07/01-home-first-visit-phone-390-dark.png > ${outDir}/old-home-phone.png`);
    execSync(`git show d43ecda:docs/v2/screens/01/nav-desktop-1280.png > ${outDir}/old-settings-desktop.png`);
    execSync(`git show d43ecda:docs/v2/screens/01/nav-phone-390.png > ${outDir}/old-settings-phone.png`);
    execSync(`git show d43ecda:docs/v2/screens/02/games-list-1280.png > ${outDir}/old-games-desktop.png`);
    execSync(`git show d43ecda:docs/v2/screens/02/games-list-390.png > ${outDir}/old-games-phone.png`);
    console.log('Old screenshots extracted successfully.');
  } catch (err) {
    console.error('Error extracting old screenshots:', err);
  }

  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  console.log('Capturing new version screenshots from http://localhost:3000...');

  // 1. Home Desktop 1280px
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.setItem('jy_theme', 'dark');
      localStorage.setItem('jy_glass_opacity', '60');
      document.documentElement.classList.add('dark');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${outDir}/new-home-desktop.png` });

    // Open settings sheet
    const settingsBtn = page.locator('button[aria-label*="Einstellungen"], button[aria-label*="Settings"], button:has(svg.lucide-settings)').first();
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${outDir}/new-settings-desktop.png` });
    }
    await page.close();
  }

  // 2. Home Phone 390px
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.setItem('jy_theme', 'dark');
      localStorage.setItem('jy_glass_opacity', '60');
      document.documentElement.classList.add('dark');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${outDir}/new-home-phone.png` });

    // Open settings sheet on mobile
    const settingsBtn = page.locator('button[aria-label*="Einstellungen"], button[aria-label*="Settings"], button:has(svg.lucide-settings)').first();
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${outDir}/new-settings-phone.png` });
    }
    await page.close();
  }

  // 3. Subpage Games Desktop 1280px
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto('http://localhost:3000/games', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.setItem('jy_theme', 'dark');
      localStorage.setItem('jy_glass_opacity', '60');
      document.documentElement.classList.add('dark');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${outDir}/new-games-desktop.png` });
    await page.close();
  }

  // 4. Subpage Games Phone 390px
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto('http://localhost:3000/games', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.setItem('jy_theme', 'dark');
      localStorage.setItem('jy_glass_opacity', '60');
      document.documentElement.classList.add('dark');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${outDir}/new-games-phone.png` });
    await page.close();
  }

  await browser.close();
  console.log(`✅ All screenshots captured into ${outDir}`);
}

run().catch(console.error);
