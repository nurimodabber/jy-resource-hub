import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUT_DIR = path.resolve('docs/redesign/screenshots');
fs.mkdirSync(OUT_DIR, { recursive: true });

const routes = [
  { path: '/', slug: 'home' },
  { path: '/games', slug: 'games' },
  { path: '/quotes', slug: 'quotes' },
  { path: '/service', slug: 'service' },
  { path: '/arts', slug: 'arts' },
  { path: '/tools', slug: 'tools' },
  { path: '/treffen', slug: 'treffen' },
  { path: '/saved', slug: 'saved' },
  { path: '/vorschlagen', slug: 'vorschlagen' },
  { path: '/games/menschlicher-knoten', slug: 'game-detail' },
  { path: '/?beamer=true', slug: 'beamer-mode', isBeamer: true },
];

const viewports = [
  { width: 1440, height: 900, name: '1440', isMobile: false },
  { width: 1024, height: 768, name: '1024', isMobile: false },
  { width: 768, height: 1024, name: '768', isMobile: false },
  { width: 390, height: 844, name: '390', isMobile: true },
  { width: 360, height: 780, name: '360', isMobile: true },
];

const themes = ['dark', 'light'];

async function run() {
  console.log(`🚀 Starting baseline audit against ${BASE_URL}...`);
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  const axeResults = {};
  const overflowIssues = [];
  const smallTapTargets = [];

  for (const vp of viewports) {
    console.log(`\n📱 Testing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
    });
    const page = await context.newPage();

    for (const theme of themes) {
      // Set theme and language
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
          await page.waitForTimeout(250);

          if (route.isBeamer) {
            await page.evaluate(() => {
              document.documentElement.classList.add('beamer-mode');
            });
            await page.waitForTimeout(100);
          }

          // Screenshot
          const fileName = `${route.slug}-${vp.name}-${theme}.png`;
          const filePath = path.join(OUT_DIR, fileName);
          await page.screenshot({ path: filePath, fullPage: false });

          // Run Axe on dark theme for 1440 and 390 viewports
          if (theme === 'dark' && (vp.name === '1440' || vp.name === '390')) {
            const axeKey = `${route.slug}-${vp.name}`;
            try {
              const axeScan = await new AxeBuilder({ page }).analyze();
              axeResults[axeKey] = {
                violations: axeScan.violations.map((v) => ({
                  id: v.id,
                  impact: v.impact,
                  description: v.description,
                  help: v.help,
                  nodesCount: v.nodes.length,
                  targets: v.nodes.slice(0, 3).map((n) => n.target.join(' ')),
                })),
              };
            } catch (err) {
              console.warn(`Axe failed on ${route.slug}:`, err.message);
            }
          }

          // Check overflow on 360 and 390
          if ((vp.name === '360' || vp.name === '390') && theme === 'dark') {
            const overflow = await page.evaluate(() => {
              const docWidth = document.documentElement.scrollWidth;
              const winWidth = window.innerWidth;
              return { hasOverflow: docWidth > winWidth, docWidth, winWidth };
            });
            if (overflow.hasOverflow) {
              overflowIssues.push({ route: route.path, vp: vp.name, ...overflow });
            }
          }

          // Check small tap targets (<44px in height or width) on 390px
          if (vp.name === '390' && theme === 'dark') {
            const smallTargets = await page.evaluate((routePath) => {
              const elements = Array.from(document.querySelectorAll('a, button, [role="button"], input, select'));
              const issues = [];
              for (const el of elements) {
                // skip hidden or sr-only
                if (el.offsetParent === null || el.classList.contains('sr-only')) continue;
                const rect = el.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                  if (rect.width < 44 || rect.height < 44) {
                    const text = (el.innerText || el.getAttribute('aria-label') || el.className).trim().slice(0, 40);
                    issues.push({
                      route: routePath,
                      text,
                      tag: el.tagName,
                      width: Math.round(rect.width),
                      height: Math.round(rect.height),
                      selector: el.className.split(' ').slice(0, 3).join('.'),
                    });
                  }
                }
              }
              return issues;
            }, route.path);
            smallTapTargets.push(...smallTargets);
          }

          console.log(`Saved ${fileName}`);
        } catch (err) {
          console.error(`Error on ${route.path} (${vp.name}, ${theme}):`, err.message);
        }
      }
    }
    await context.close();
  }

  await browser.close();

  // Save Axe results
  fs.writeFileSync('docs/redesign/axe-baseline.json', JSON.stringify(axeResults, null, 2));

  // Save Overflow & Target reports
  fs.writeFileSync(
    'docs/redesign/diagnostics-baseline.json',
    JSON.stringify({ overflowIssues, smallTapTargets: smallTapTargets.slice(0, 50) }, null, 2)
  );

  console.log(`\n✅ Completed! Captured 110 screenshots in ${OUT_DIR}`);
  console.log(`✅ Axe results written to docs/redesign/axe-baseline.json`);
  console.log(`✅ Diagnostics written to docs/redesign/diagnostics-baseline.json`);
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
