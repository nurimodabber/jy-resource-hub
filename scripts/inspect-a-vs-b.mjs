import { chromium } from 'playwright';

const routes = [
  '/',
  '/games',
  '/games/menschlicher-knoten',
  '/quotes',
  '/service-arts',
  '/treffen',
  '/tools/timer'
];

async function inspect() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  console.log('🔍 Inspecting 4173 (A) vs 4174 (B)...');

  for (const r of routes) {
    const pageA = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const pageB = await browser.newPage({ viewport: { width: 1280, height: 800 } });

    await pageA.goto(`http://localhost:4173${r}`, { waitUntil: 'networkidle' });
    await pageB.goto(`http://localhost:4174${r}`, { waitUntil: 'networkidle' });

    // Check fonts loaded on B
    const fontsB = await pageB.evaluate(() => {
      const loaded = [];
      document.fonts.forEach(f => {
        loaded.push({ family: f.family, status: f.status, weight: f.weight });
      });
      return loaded;
    });

    const titleA = await pageA.title();
    const titleB = await pageB.title();

    console.log(`\nRoute: ${r}`);
    console.log(`  A Title: ${titleA}`);
    console.log(`  B Title: ${titleB}`);
    if (r === '/') {
      console.log('  B Fonts:', fontsB.filter(f => f.status === 'loaded').map(f => f.family).filter((v, i, a) => a.indexOf(v) === i));
    }

    await pageA.close();
    await pageB.close();
  }

  // Check 680px break on /treffen
  const pageBBreak = await browser.newPage({ viewport: { width: 680, height: 800 } });
  await pageBBreak.goto('http://localhost:4174/treffen', { waitUntil: 'networkidle' });
  const headerLayout = await pageBBreak.evaluate(() => {
    const h1 = document.querySelector('h1');
    const header = h1?.closest('.bg-surface');
    return {
      h1Text: h1?.innerText,
      h1ClientWidth: h1?.clientWidth,
      headerScrollWidth: header?.scrollWidth,
      headerClientWidth: header?.clientWidth,
    };
  });
  console.log('\n/treffen at 680px:', headerLayout);
  await pageBBreak.close();

  await browser.close();
  console.log('\n✅ Inspection complete.');
}

inspect().catch(console.error);
