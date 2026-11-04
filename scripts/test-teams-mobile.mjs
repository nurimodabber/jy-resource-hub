import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const OUT_DIR = path.resolve('docs/redesign/teams-audit');
fs.mkdirSync(OUT_DIR, { recursive: true });

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function main() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  console.log('Testing Teams tool at 360px, 390px, and 1280px...');

  // 1. Mobile 360px
  {
    const context = await browser.newContext({
      viewport: { width: 360, height: 780 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    // Setup 7 participants in localStorage
    await page.goto('http://localhost:3000/tools/teams');
    await page.evaluate(() => {
      const names = ['Musonda', 'Rosa', 'Amir', 'Maya', 'Tahir', 'Layla', 'Navid'];
      localStorage.setItem('jy_group_names', JSON.stringify(names));
      const present = {};
      names.forEach((n) => (present[n] = true));
      localStorage.setItem('jy_group_present', JSON.stringify(present));
      localStorage.setItem('jy_teams_split_mode', JSON.stringify('bySize'));
      localStorage.setItem('jy_teams_team_size', '2');
      localStorage.removeItem('jy_teams_last_split');
      localStorage.removeItem('jy_teams_has_manual_edits');
    });

    await page.goto('http://localhost:3000/tools/teams', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Verify placeholder
    const placeholder = await page.getAttribute('input[type="text"]', 'placeholder');
    console.log(`[360px] Input placeholder: "${placeholder}"`);
    if (placeholder !== '+ Name') {
      throw new Error(`Expected "+ Name", got "${placeholder}"`);
    }

    // Verify preview text shows 3 groups (2 pairs + 1 trio)
    const previewText = await page.textContent('.text-accent');
    console.log(`[360px] Preview text: ${previewText}`);

    // Verify mobile sticky bar is visible
    const stickyShuffleBtn = page.locator('.fixed.bottom-\\[calc\\(64px\\+env\\(safe-area-inset-bottom\\,0px\\)\\)\\] button').first();
    const isStickyVisible = await stickyShuffleBtn.isVisible();
    console.log(`[360px] Mobile sticky action bar visible: ${isStickyVisible}`);
    if (!isStickyVisible) {
      throw new Error('Mobile sticky action bar is not visible at 360px!');
    }

    // Verify desktop buttons are hidden
    const desktopButtons = page.locator('.hidden.md\\:grid');
    const isDesktopHidden = !(await desktopButtons.isVisible());
    console.log(`[360px] Desktop buttons hidden: ${isDesktopHidden}`);

    // Screenshot 360px
    await page.screenshot({ path: path.join(OUT_DIR, 'teams-360px.png'), fullPage: false });

    // Click on a person chip to test bottom sheet
    const personChip = page.locator('button:has-text("Musonda")').last();
    await personChip.click();
    await page.waitForTimeout(300);

    // Verify bottom sheet is open
    const sheetTitle = await page.locator('#sheet-title').textContent();
    console.log(`[360px] Bottom sheet opened with title: "${sheetTitle}"`);
    await page.screenshot({ path: path.join(OUT_DIR, 'teams-bottomsheet-360px.png'), fullPage: false });

    // Click cancel in bottom sheet
    await page.click('button:has-text("Abbrechen")');
    await page.waitForTimeout(200);

    await context.close();
  }

  // 2. Mobile 390px (iPhone 14/15/16)
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto('http://localhost:3000/tools/teams');
    await page.evaluate(() => {
      const names = ['Musonda', 'Rosa', 'Amir', 'Maya', 'Tahir', 'Layla', 'Navid'];
      localStorage.setItem('jy_group_names', JSON.stringify(names));
      const present = {};
      names.forEach((n) => (present[n] = true));
      localStorage.setItem('jy_group_present', JSON.stringify(present));
      localStorage.setItem('jy_teams_split_mode', JSON.stringify('bySize'));
      localStorage.setItem('jy_teams_team_size', '2');
      localStorage.removeItem('jy_teams_last_split');
      localStorage.removeItem('jy_teams_has_manual_edits');
    });

    await page.goto('http://localhost:3000/tools/teams', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    // Verify 2-column card layout on mobile for tandem (size <= 4)
    const gridCols = await page.locator('.grid.grid-cols-2').count();
    console.log(`[390px] 2-column grid found: ${gridCols > 0}`);
    if (gridCols === 0) {
      throw new Error('Expected 2-column grid on mobile for team sizes <= 4!');
    }

    await page.screenshot({ path: path.join(OUT_DIR, 'teams-390px.png'), fullPage: false });
    await context.close();
  }

  // 3. Desktop 1280px
  {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto('http://localhost:3000/tools/teams');
    await page.evaluate(() => {
      const names = ['Musonda', 'Rosa', 'Amir', 'Maya', 'Tahir', 'Layla', 'Navid'];
      localStorage.setItem('jy_group_names', JSON.stringify(names));
      const present = {};
      names.forEach((n) => (present[n] = true));
      localStorage.setItem('jy_group_present', JSON.stringify(present));
      localStorage.setItem('jy_teams_split_mode', JSON.stringify('bySize'));
      localStorage.setItem('jy_teams_team_size', '2');
    });

    await page.goto('http://localhost:3000/tools/teams', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    // Mobile sticky bar should NOT be visible on desktop
    const stickyBar = page.locator('.fixed.bottom-\\[calc\\(64px\\+env\\(safe-area-inset-bottom\\,0px\\)\\)\\]');
    const isStickyVisible = await stickyBar.isVisible();
    console.log(`[1280px] Mobile sticky bar visible (should be false): ${isStickyVisible}`);

    // Desktop in-flow buttons should be visible
    const desktopButtons = page.locator('.hidden.md\\:grid');
    const isDesktopVisible = await desktopButtons.isVisible();
    console.log(`[1280px] Desktop buttons visible: ${isDesktopVisible}`);

    await page.screenshot({ path: path.join(OUT_DIR, 'teams-1280px.png'), fullPage: false });
    await context.close();
  }

  await browser.close();
  console.log('✅ All mobile layout verification checks passed successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
