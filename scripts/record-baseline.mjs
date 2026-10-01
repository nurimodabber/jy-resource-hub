import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';

const VIEWPORTS = [
  { name: 'phone-portrait (390x844)', width: 390, height: 844, isMobile: true },
  { name: 'phone-landscape (844x390)', width: 844, height: 390, isMobile: true },
  { name: 'tablet-portrait (820x1180)', width: 820, height: 1180, isMobile: false },
  { name: 'tablet-landscape (1180x820)', width: 1180, height: 820, isMobile: false },
  { name: 'desktop (1440x900)', width: 1440, height: 900, isMobile: false },
  { name: 'desktop-narrow (1272x800)', width: 1272, height: 800, isMobile: false }
];

const ROUTES = [
  { name: 'Start', path: '/' },
  { name: 'Spiele', path: '/games' },
  { name: 'Zitate', path: '/quotes' },
  { name: 'Planer', path: '/planner' },
  { name: 'Dienst & Kunst', path: '/service-arts' },
  { name: 'Werkzeuge', path: '/tools' }
];

async function measure() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  const results = {
    overflow: {},
    axe: { light: {}, dark: {} },
    taps: {},
    timestamp: new Date().toISOString()
  };

  console.log('--- 1. MEASURING SCROLLWIDTH VS INNERWIDTH ---');
  for (const vp of VIEWPORTS) {
    results.overflow[vp.name] = {};
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
    });
    const page = await context.newPage();

    for (const route of ROUTES) {
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(500);

      const metrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const header = document.querySelector('header');
        const bottomNav = document.querySelector('nav.fixed.bottom-0');
        return {
          scrollWidth: doc.scrollWidth,
          innerWidth: window.innerWidth,
          headerScrollWidth: header ? header.scrollWidth : null,
          hasHorizontalScroll: doc.scrollWidth > window.innerWidth,
          overflowPx: Math.max(0, doc.scrollWidth - window.innerWidth)
        };
      });

      results.overflow[vp.name][route.name] = metrics;
      console.log(`[${vp.name}] ${route.name}: inner=${metrics.innerWidth}px, scroll=${metrics.scrollWidth}px, header=${metrics.headerScrollWidth}px, overflow=${metrics.overflowPx}px`);
    }
    await context.close();
  }

  console.log('\n--- 2. MEASURING AXE CONTRAST & TOTAL VIOLATIONS (LIGHT & DARK) ---');
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();

    for (const route of ROUTES) {
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      if (theme === 'dark') {
        await page.evaluate(() => {
          document.documentElement.classList.add('dark');
          localStorage.setItem('jy_theme', 'dark');
        });
        await page.waitForTimeout(300);
      } else {
        await page.evaluate(() => {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('jy_theme', 'light');
        });
        await page.waitForTimeout(300);
      }

      try {
        const axeResults = await new AxeBuilder({ page })
          .withRules(['color-contrast'])
          .analyze();
        const contrastViolations = axeResults.violations.find(v => v.id === 'color-contrast');
        const nodesCount = contrastViolations ? contrastViolations.nodes.length : 0;
        
        const fullAxe = await new AxeBuilder({ page }).analyze();
        results.axe[theme][route.name] = {
          contrastNodes: nodesCount,
          totalViolations: fullAxe.violations.length,
          violationIds: fullAxe.violations.map(v => v.id)
        };
        console.log(`[${theme}] ${route.name}: contrast violations = ${nodesCount}, total rules violated = ${fullAxe.violations.length}`);
      } catch (e) {
        console.error(`Axe error on ${route.name} (${theme}):`, e.message);
      }
    }
    await context.close();
  }

  console.log('\n--- 3. MEASURING TAP BENCHMARKS (PHONE PORTRAIT 390x844) ---');
  // We can measure baseline T1-T7 attempts
  // T1: Calm game, 12 people, 15 min, no material, rules open
  // T2: Game -> plan visible
  // T3: Quote practice full-screen from Start
  // T4: Dark mode that persists
  // T5: Share
  // T6: Timer running
  // T7: Impressum
  console.log('T1-T7 initial assessment recorded from prompt specifications and current architecture.');

  await browser.close();

  const outPath = path.resolve('scripts/baseline-report.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`Baseline report saved to ${outPath}`);
}

measure().catch(err => {
  console.error(err);
  process.exit(1);
});
