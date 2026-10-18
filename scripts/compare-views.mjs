import { chromium } from 'playwright';

async function check() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  const routes = [
    '/',
    '/games',
    '/games/menschlicher-knoten',
    '/quotes',
    '/service-arts',
    '/treffen',
    '/tools/timer'
  ];

  console.log('Comparing A (4173) vs B (4174)...');
  for (const r of routes) {
    for (const width of [390, 768, 1280]) {
      const pageA = await browser.newPage({ viewport: { width, height: 800 } });
      const pageB = await browser.newPage({ viewport: { width, height: 800 } });

      await pageA.goto(`http://localhost:4173${r}`, { waitUntil: 'networkidle' });
      await pageB.goto(`http://localhost:4174${r}`, { waitUntil: 'networkidle' });

      // Check key visual metrics
      const dataA = await pageA.evaluate(() => ({
        h1: document.querySelector('h1')?.innerText?.trim(),
        buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText?.trim()).filter(Boolean).slice(0, 5),
        hasTimeline: !!document.querySelector('[role="region"][aria-label*="Zeitachse"], [role="region"][aria-label*="timeline"]'),
      }));

      const dataB = await pageB.evaluate(() => ({
        h1: document.querySelector('h1')?.innerText?.trim(),
        buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText?.trim()).filter(Boolean).slice(0, 5),
        hasTimeline: !!document.querySelector('[role="region"][aria-label*="Zeitachse"], [role="region"][aria-label*="timeline"]'),
      }));

      await pageA.close();
      await pageB.close();
    }
  }

  await browser.close();
  console.log('Comparison run finished.');
}

check().catch(console.error);
