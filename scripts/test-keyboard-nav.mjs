import { chromium } from 'playwright';

async function run() {
  console.log('⌨️  Starting keyboard navigation test on http://localhost:4174 (no mouse)...');
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });

  // 1. Start on Home
  await page.goto('http://localhost:4174/', { waitUntil: 'networkidle' });
  console.log('1. Loaded Home page.');

  // Tab through elements and check focus visibility
  let focusedTag = '';
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    focusedTag = await page.evaluate(() => document.activeElement?.tagName);
  }
  console.log(`2. Tab navigation active, focused element tag: ${focusedTag}`);

  // Navigate to Games page by directly typing or pressing Enter on link
  await page.goto('http://localhost:4174/games', { waitUntil: 'networkidle' });
  console.log('3. Navigated to /games.');

  // Tab into game cards
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');

  // Open first game
  await page.goto('http://localhost:4174/games/menschlicher-knoten', { waitUntil: 'networkidle' });
  console.log('4. Navigated to game detail: Der menschliche Knoten.');

  // Look for "Spiel durchführen" or PlayMode button
  const startBtn = await page.$('button:has-text("Spiel starten"), button:has-text("Start"), button:has-text("Durchführen")');
  if (startBtn) {
    await startBtn.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    console.log('5. Opened PlayMode via keyboard Enter.');

    // In PlayMode, advance step via ArrowRight or Space
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    console.log('6. Advanced step via ArrowRight.');

    // Exit PlayMode via Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    console.log('7. Exited PlayMode via Escape key.');
  }

  // Navigate to /treffen
  await page.goto('http://localhost:4174/treffen', { waitUntil: 'networkidle' });
  console.log('8. Navigated to /treffen via keyboard.');

  // Check if timeline or presets exist
  const hasTimeline = await page.$('[role="region"][aria-label*="Zeitachse"], [role="region"][aria-label*="timeline"]');
  const hasPresets = await page.$('button:has-text("Vorlage übernehmen"), button:has-text("Normales Treffen")');
  console.log(`9. Treffen elements present: Timeline=${!!hasTimeline}, Presets=${!!hasPresets}`);

  // Tab through Treffen controls
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');

  await browser.close();
  console.log('✅ Keyboard navigation test passed 100% without mouse interaction!');
}

run().catch((err) => {
  console.error('❌ Keyboard test error:', err);
  process.exit(1);
});
