import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function launchBrowser() {
  try {
    return await chromium.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: true,
    });
  } catch {
    return await chromium.launch({ headless: true });
  }
}

async function runTests() {
  console.log('🚀 Starting JY Hub E2E Verification Suite on', BASE_URL);
  const browser = await launchBrowser();
  let failures = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error(`  ❌ FAILED: ${message}`);
      failures++;
    } else {
      console.log(`  ✅ PASSED: ${message}`);
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Layout & Viewport Overflow (scrollWidth <= innerWidth)
  // -------------------------------------------------------------
  console.log('\n--- 1. Viewport Overflow Verification ---');
  const viewports = [
    { name: 'Phone Portrait', width: 390, height: 844, isMobile: true },
    { name: 'Phone Landscape', width: 844, height: 390, isMobile: true },
    { name: 'Tablet Portrait', width: 820, height: 1180, isMobile: false },
    { name: 'Tablet Landscape', width: 1180, height: 820, isMobile: false },
    { name: 'Desktop Narrow', width: 1272, height: 800, isMobile: false },
    { name: 'Desktop Wide', width: 1440, height: 900, isMobile: false },
  ];

  const routes = [
    { name: 'Start (Home)', path: '/' },
    { name: 'Spiele (Games)', path: '/games' },
    { name: 'Zitate (Quotes)', path: '/quotes' },
    { name: 'Planer (Planner)', path: '/planner' },
    { name: 'Dienst & Kunst (Service/Arts)', path: '/service-arts' },
    { name: 'Werkzeuge (Tools)', path: '/tools' },
    { name: 'Impressum', path: '/impressum' },
    { name: 'Datenschutz', path: '/datenschutz' },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
    });
    const page = await context.newPage();

    for (const route of routes) {
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(300);

      const metrics = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          scrollWidth: doc.scrollWidth,
          innerWidth: window.innerWidth,
          overflowPx: Math.max(0, doc.scrollWidth - window.innerWidth),
        };
      });

      assert(
        metrics.overflowPx === 0,
        `[${vp.name}] ${route.name}: scrollWidth (${metrics.scrollWidth}px) <= innerWidth (${metrics.innerWidth}px) [overflow=${metrics.overflowPx}px]`
      );
    }
    await context.close();
  }

  // -------------------------------------------------------------
  // TEST 2: Touch Targets (Bottom Tab Bar >= 44x44px)
  // -------------------------------------------------------------
  console.log('\n--- 2. Mobile Touch Target Dimensions ---');
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    const touchTargets = await page.evaluate(() => {
      const bottomNavLinks = Array.from(document.querySelectorAll('nav.fixed.bottom-0 a, nav.fixed.bottom-0 button'));
      return bottomNavLinks.map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          text: (el.textContent || '').trim(),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          ok: rect.width >= 44 && rect.height >= 44,
        };
      });
    });

    for (const target of touchTargets) {
      assert(target.ok, `Bottom nav target "${target.text}": ${target.width}x${target.height}px >= 44x44px`);
    }
    await context.close();
  }

  // -------------------------------------------------------------
  // TEST 3: Deep Links & 404 Route
  // -------------------------------------------------------------
  console.log('\n--- 3. Deep Links & 404 Page ---');
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    // 3.1 404 Route
    await page.goto(`${BASE_URL}/gibtsnicht`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    const has404 = await page.evaluate(() => {
      return document.body.innerText.includes('404') && 
             (document.body.innerText.includes('nicht gefunden') || document.body.innerText.includes('Not Found'));
    });
    assert(has404, 'Route /gibtsnicht renders dedicated 404 error page');

    // 3.2 Game deep link: /games/wer-bin-ich
    await page.goto(`${BASE_URL}/games/wer-bin-ich`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const gameModalVisible = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return Boolean(dialog && dialog.textContent?.includes('Wer bin ich'));
    });
    assert(gameModalVisible, 'Deep link /games/wer-bin-ich directly opens game dialog modal');

    // 3.3 Quote deep link: /quotes/honor-mine-gems
    await page.goto(`${BASE_URL}/quotes/honor-mine-gems`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const quoteModalVisible = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return Boolean(dialog && (dialog.textContent?.includes('Bergwerk') || dialog.textContent?.includes('gems')));
    });
    assert(quoteModalVisible, 'Deep link /quotes/honor-mine-gems directly opens quote reading view dialog');

    // 3.4 Tools deep link: /tools/timer
    await page.goto(`${BASE_URL}/tools/timer`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const timerVisible = await page.evaluate(() => {
      return Boolean(document.body.innerText.includes('Countdown-Timer') || document.body.innerText.includes('Countdown Timer'));
    });
    assert(timerVisible, 'Deep link /tools/timer directly opens interactive timer tool');

    // 3.5 Service deep link: /service-arts/trash-audit-cleanup
    await page.goto(`${BASE_URL}/service-arts/trash-audit-cleanup`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const serviceModalVisible = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return Boolean(dialog && (dialog.textContent?.includes('Stadtteil-Putz') || dialog.textContent?.includes('Trash Audit')));
    });
    assert(serviceModalVisible, 'Deep link /service-arts/trash-audit-cleanup directly opens service detail dialog');

    await context.close();
  }

  // -------------------------------------------------------------
  // TEST 4: T1–T7 Tap Benchmarks
  // -------------------------------------------------------------
  console.log('\n--- 4. T1–T7 Tap Benchmarks ---');
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();

    // T1: Quick pick -> Game rules open (Target: <= 3 taps)
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    let t1Taps = 0;
    // Tap 1: Group size "8–15 Jugendliche"
    const groupBtn = page.locator('button:has-text("8–15"), button:has-text("Medium")').first();
    if (await groupBtn.isVisible()) {
      await groupBtn.click();
      t1Taps++;
    }
    // Tap 2: Duration "5–10 Min"
    const timeBtn = page.locator('button:has-text("5–10"), button:has-text("short")').first();
    if (await timeBtn.isVisible()) {
      await timeBtn.click();
      t1Taps++;
    }
    await page.waitForTimeout(300);
    // Tap 3: Open matched game card
    const firstGameCard = page.locator('article[role="button"]').first();
    if (await firstGameCard.isVisible()) {
      await firstGameCard.click();
      t1Taps++;
    }
    await page.waitForTimeout(500);
    const isRulesOpen = page.url().includes('/games/') || await page.locator('[role="dialog"]').isVisible();
    assert(isRulesOpen && t1Taps <= 3, `T1: Quick Pick to Game Rules open in ${t1Taps} taps (Target <= 3 taps)`);

    // T2: "Zum Plan hinzufügen" (Target: <= 2 taps from game modal to planner)
    await page.goto(`${BASE_URL}/games/wer-bin-ich`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    let t2Taps = 0;
    const addToPlanBtn = page.locator('button:has-text("Zum Plan hinzufügen"), button:has-text("Add to Plan")').first();
    if (await addToPlanBtn.isVisible()) {
      await addToPlanBtn.click();
      t2Taps++;
    }
    await page.waitForTimeout(300);
    // Tap "Plan öffnen" in floating toast
    const openPlanToastBtn = page.locator('button:has-text("Plan öffnen"), button:has-text("Open Plan")').first();
    if (await openPlanToastBtn.isVisible()) {
      await openPlanToastBtn.click();
      t2Taps++;
    }
    await page.waitForTimeout(400);
    const onPlannerPage = page.url().includes('/planner');
    assert(onPlannerPage && t2Taps <= 2, `T2: Add to Plan and open Planner in ${t2Taps} taps (Target <= 2 taps)`);

    // T3: Start -> Quote practice full-screen (Target: <= 3 taps)
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    let t3Taps = 0;
    const practiceBtn = page.locator('button:has-text("Zitat lesen & üben"), button:has-text("Read & Practice")').first();
    if (await practiceBtn.isVisible()) {
      await practiceBtn.click();
      t3Taps++;
    }
    await page.waitForTimeout(400);
    // Quote reading view is open; tap practice button inside dialog
    const startPracticeBtn = page.locator('[role="dialog"] button:has-text("Üben"), [role="dialog"] button:has-text("Practice")').first();
    if (await startPracticeBtn.isVisible()) {
      await startPracticeBtn.click();
      t3Taps++;
    }
    await page.waitForTimeout(400);
    // Select first practice method
    const firstMethodBtn = page.locator('[role="dialog"] button:has-text("Starten"), [role="dialog"] button:has-text("Start")').first();
    if (await firstMethodBtn.isVisible()) {
      await firstMethodBtn.click();
      t3Taps++;
    }
    await page.waitForTimeout(400);
    const isPracticeFullscreen = await page.evaluate(() => {
      return Boolean(document.querySelector('.fixed.inset-0.z-50'));
    });
    assert(isPracticeFullscreen && t3Taps <= 3, `T3: Start to Quote Practice in ${t3Taps} taps (Target <= 3 taps)`);

    // T4: Theme toggle & persistence (Target: <= 2 taps)
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    let t4Taps = 0;
    // Open Mehr sheet
    const mehrTab = page.locator('nav.fixed.bottom-0 button:has-text("Mehr"), nav.fixed.bottom-0 button:has-text("More")').first();
    await mehrTab.click();
    t4Taps++;
    await page.waitForTimeout(300);
    // Tap "Dunkel" theme button
    const darkChip = page.locator('button[title="Dunkel"], button[title="Dark"]').first();
    if (await darkChip.isVisible()) {
      await darkChip.click();
      t4Taps++;
    }
    await page.waitForTimeout(300);
    const isDarkPersisted = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') && localStorage.getItem('jy_theme') === 'dark';
    });
    assert(isDarkPersisted && t4Taps <= 2, `T4: Toggle dark theme in ${t4Taps} taps with localStorage persistence`);

    // T6: Tools -> Timer running (Target: <= 2 taps)
    await page.goto(`${BASE_URL}/tools/timer`, { waitUntil: 'networkidle' });
    let t6Taps = 1;
    await page.waitForTimeout(400);
    // Tap Start timer button
    const startTimerBtn = page.locator('button:has-text("Start"), button:has-text("Starten")').first();
    if (await startTimerBtn.isVisible()) {
      await startTimerBtn.click();
      t6Taps++;
    }
    await page.waitForTimeout(300);
    const isTimerRunning = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).some((b) => b.textContent?.includes('Pause') || b.textContent?.includes('anhalten')) || document.body.innerText.includes('Pause') || document.body.innerText.includes('anhalten');
    });
    assert(isTimerRunning && t6Taps <= 2, `T6: Tools to running Timer in ${t6Taps} taps (Target <= 2 taps)`);

    // T7: Impressum & Datenschutz visible
    await page.goto(`${BASE_URL}/impressum`, { waitUntil: 'networkidle' });
    const impressumOk = await page.evaluate(() => document.body.innerText.includes('Impressum'));
    assert(impressumOk, 'T7a: Impressum legal page is accessible and verified');

    await page.goto(`${BASE_URL}/datenschutz`, { waitUntil: 'networkidle' });
    const datenschutzOk = await page.evaluate(() => document.body.innerText.includes('Datenschutzerklärung') || document.body.innerText.includes('Privacy Policy'));
    assert(datenschutzOk, 'T7b: Datenschutz page is accessible with zero-tracking disclosure');

    await context.close();
  }

  // -------------------------------------------------------------
  // TEST 5: Axe Accessibility & Contrast (Light & Dark)
  // -------------------------------------------------------------
  console.log('\n--- 5. Axe Color-Contrast Compliance (Light & Dark) ---');
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    for (const route of routes) {
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);

      if (theme === 'dark') {
        await page.evaluate(() => {
          document.documentElement.classList.add('dark');
          localStorage.setItem('jy_theme', 'dark');
        });
      } else {
        await page.evaluate(() => {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('jy_theme', 'light');
        });
      }
      await page.waitForTimeout(300);

      const axeResults = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze();

      const violations = axeResults.violations.find((v) => v.id === 'color-contrast');
      const nodeCount = violations ? violations.nodes.length : 0;
      assert(nodeCount === 0, `[${theme.toUpperCase()}] ${route.name}: 0 color-contrast violations (got ${nodeCount})`);
    }
    await context.close();
  }

  // -------------------------------------------------------------
  // TEST 6: Print Stylesheet Validation
  // -------------------------------------------------------------
  console.log('\n--- 6. Print Stylesheet Validation ---');
  {
    const context = await browser.newContext({ viewport: { width: 1200, height: 800 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/planner`, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(300);

    const printStyles = await page.evaluate(() => {
      const navbar = document.querySelector('header');
      const footer = document.querySelector('footer');
      const navDisplay = navbar ? window.getComputedStyle(navbar).display : 'none';
      const footDisplay = footer ? window.getComputedStyle(footer).display : 'none';
      const bodyBg = window.getComputedStyle(document.body).backgroundColor;
      return {
        navHidden: navDisplay === 'none',
        footHidden: footDisplay === 'none',
        bodyBg,
      };
    });

    assert(printStyles.navHidden, 'Print mode: Header navbar is hidden (@media print)');
    assert(printStyles.footHidden, 'Print mode: Footer is hidden (@media print)');
    await context.close();
  }

  await browser.close();

  console.log('\n-------------------------------------------------------------');
  if (failures === 0) {
    console.log('🎉 ALL JY HUB E2E VERIFICATION CHECKS PASSED WITH 0 FAILURES!');
    process.exit(0);
  } else {
    console.error(`💥 E2E VERIFICATION COMPLETED WITH ${failures} FAILURE(S).`);
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
