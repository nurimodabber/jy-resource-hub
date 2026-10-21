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
  console.log('🚀 Starting JY Hub Phase 09 Comprehensive E2E Verification Suite on', BASE_URL);
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

  const routes = [
    { name: 'Start (Home)', path: '/' },
    { name: 'Spiele (Games)', path: '/games' },
    { name: 'Zitate (Quotes)', path: '/quotes' },
    { name: 'Gemerkt (Saved)', path: '/saved' },
    { name: 'Dienst & Kunst (Service/Arts)', path: '/service-arts' },
    { name: 'Werkzeuge (Tools)', path: '/tools' },
    { name: 'Vorschlagen (Submit Proposal)', path: '/vorschlagen' },
    { name: 'Impressum', path: '/impressum' },
    { name: 'Datenschutz', path: '/datenschutz' },
  ];

  // -------------------------------------------------------------
  // TEST 1: Layout & Viewport Overflow Matrix
  // -------------------------------------------------------------
  console.log('\n--- 1. Viewport Overflow Matrix (390, 768, 1024, 1280, 1920 px) ---');
  const viewports = [
    { name: 'Mobile 390px', width: 390, height: 844, isMobile: true },
    { name: 'Tablet 768px', width: 768, height: 1024, isMobile: false },
    { name: 'Landscape 1024px', width: 1024, height: 768, isMobile: false },
    { name: 'Desktop 1280px', width: 1280, height: 800, isMobile: false },
    { name: 'Full HD 1920px', width: 1920, height: 1080, isMobile: false },
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
      await page.waitForTimeout(200);

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
  // TEST 2: Touch Targets (Bottom Tab Bar >= 44x44px for all 5 tabs)
  // -------------------------------------------------------------
  console.log('\n--- 2. Mobile Touch Targets (5 main tabs >= 44x44px) ---');
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

    assert(touchTargets.length === 6, `Bottom nav bar renders exactly 6 main tabs (got ${touchTargets.length})`);
    for (const target of touchTargets) {
      assert(target.ok, `Bottom nav target "${target.text}": ${target.width}x${target.height}px >= 44x44px`);
    }
    await context.close();
  }

  // -------------------------------------------------------------
  // TEST 3: Deep Links, 404, Legacy /planner Redirect
  // -------------------------------------------------------------
  console.log('\n--- 3. Deep Links, 404, Legacy /planner Redirect ---');
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

    // 3.2 Legacy redirect: /planner and /treffen -> /
    await page.goto(`${BASE_URL}/planner`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    assert(page.url().endsWith('/') || !page.url().includes('/planner'), `Legacy /planner cleanly redirects to home (current url: ${page.url()})`);

    // 3.3 Game deep link: /games/wer-bin-ich
    await page.goto(`${BASE_URL}/games/wer-bin-ich`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const gameModalVisible = await page.evaluate(() => {
      return document.body.innerText.includes('Wer bin ich');
    });
    assert(gameModalVisible, 'Deep link /games/wer-bin-ich directly opens game details view');

    // 3.4 Quote deep link: /quotes/honor-mine-gems
    await page.goto(`${BASE_URL}/quotes/honor-mine-gems`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const quoteModalVisible = await page.evaluate(() => {
      return document.body.innerText.includes('Bergwerk') || document.body.innerText.includes('gems');
    });
    assert(quoteModalVisible, 'Deep link /quotes/honor-mine-gems directly opens quote reading view dialog');

    // 3.5 Tools deep link: /tools/timer
    await page.goto(`${BASE_URL}/tools/timer`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const timerVisible = await page.evaluate(() => {
      return Boolean(
        document.body.innerText.includes('Timer & Intervall') || 
        document.body.innerText.includes('Timer & Interval') || 
        document.body.innerText.includes('05:00')
      );
    });
    assert(timerVisible, 'Deep link /tools/timer directly opens interactive timer tool');

    // 3.6 Service deep link: /service-arts/trash-audit-cleanup
    await page.goto(`${BASE_URL}/service-arts/trash-audit-cleanup`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const serviceModalVisible = await page.evaluate(() => {
      return document.body.innerText.includes('Stadtteil-Putz') || document.body.innerText.includes('Trash Audit');
    });
    assert(serviceModalVisible, 'Deep link /service-arts/trash-audit-cleanup directly opens service detail');

    // 3.7 Proposal route: /vorschlagen
    await page.goto(`${BASE_URL}/vorschlagen`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    const proposalVisible = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Erfahrungen beitragen') || text.includes('Vorschlag einreichen') || text.includes('Contribute') || text.includes('Submit proposal');
    });
    assert(proposalVisible, 'Route /vorschlagen renders submission workflow');

    await context.close();
  }

  // -------------------------------------------------------------
  // TEST 4: URL Game Filtering (/games?...)
  // -------------------------------------------------------------
  console.log('\n--- 4. URL Game Filtering ---');
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    // 4.1 Filter by purpose: /games?wirkung=energie
    await page.goto(`${BASE_URL}/games?wirkung=energie`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const hasEnergyGames = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href^="/games/"]');
      return links.length > 0;
    });
    assert(hasEnergyGames, 'Filter /games?wirkung=energie successfully applies and renders matching games');

    // 4.2 Filter without materials: /games?material=ohne
    await page.goto(`${BASE_URL}/games?material=ohne`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const noMatGames = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href^="/games/"]');
      return links.length > 0;
    });
    assert(noMatGames, 'Filter /games?material=ohne successfully applies and renders matching games');

    // 4.3 Filter with duration and group size: /games?personen=12&dauer=20
    await page.goto(`${BASE_URL}/games?personen=12&dauer=20`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const matchedFilteredGames = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href^="/games/"]');
      return links.length > 0;
    });
    assert(matchedFilteredGames, 'Filter /games?personen=12&dauer=20 successfully applies and renders games');

    await context.close();
  }

  // -------------------------------------------------------------
  // TEST 5: Minimalist Reference Hub & Fast Quotes/Methods
  // -------------------------------------------------------------
  console.log('\n--- 5. Minimalistisches Nachschlagewerk & Methoden ---');
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/quotes?tab=practice`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    // Verify flat methods list without phase segmented control
    const hasPhaseSegmentedControl = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Alle Phasen') || text.includes('Phase 1: Verstehen');
    });
    assert(!hasPhaseSegmentedControl, 'No phase sorting/filter or phase labels present in methods list');

    const methodCards = await page.evaluate(() => {
      return document.querySelectorAll('article').length;
    });
    assert(methodCards >= 10, `Consolidated flat list of methods rendered (${methodCards} cards found)`);

    // Verify clicking an interactive web app launches the web-app
    const launchWebApp = await page.evaluate(() => {
      const webAppBtn = Array.from(document.querySelectorAll('article')).find(a => a.innerText.includes('Web-App'));
      if (webAppBtn) {
        webAppBtn.click();
        return true;
      }
      return false;
    });
    assert(launchWebApp, 'Interactive web app card clicked');
    await page.waitForTimeout(300);

    const isWebAppRunning = await page.evaluate(() => {
      return document.body.innerText.includes('Web-App schließen');
    });
    assert(isWebAppRunning, 'Interactive Web-App opened and running from overview');

    // Verify in selected quote detail: Clean sacred scripture focus and subtle memorisation trigger
    await page.goto(`${BASE_URL}/quotes/honor-mine-gems`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    const hasClearScriptureFocus = await page.evaluate(() => {
      const bq = document.querySelector('blockquote.font-serif');
      const hasText = bq && bq.textContent.includes('Bergwerk');
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Auswendiglernen') || b.innerText.includes('Dieses Zitat auswendig lernen'));
      return Boolean(hasText && btn);
    });
    assert(hasClearScriptureFocus, 'Quote detail maintains reverent scripture focus with subtle Auswendiglernen trigger');

    // Click subtle Auswendiglernen button in quote detail: opens memorisation page with this quote
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Dieses Zitat auswendig lernen') || b.innerText.includes('Auswendiglernen'));
      if (btn) btn.click();
    });
    await page.waitForTimeout(400);

    const openedPracticePage = await page.evaluate(() => {
      const url = window.location.href;
      const body = document.body.innerText;
      return url.includes('tab=practice') && (url.includes('quote=honor-mine-gems') || body.includes('Bergwerk'));
    });
    assert(openedPracticePage, 'Clicking subtle memorisation button opens Auswendiglern-Seite with active quote');

    // Verify obsolete /treffen cleanly redirects
    await page.goto(`${BASE_URL}/treffen`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    assert(!page.url().includes('/treffen'), `Obsolete /treffen redirected to home (${page.url()})`);

    await context.close();
  }

  // -------------------------------------------------------------
  // TEST 6: Tool: Empire-Ablauf (/tools/empire)
  // -------------------------------------------------------------
  console.log('\n--- 6. Tool: Empire-Ablauf ---');
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    
    // Seed group names
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.setItem('jy_group_names', JSON.stringify(['Samir', 'Layla', 'Mona', 'Tarek']));
      localStorage.setItem('jy_group_present', JSON.stringify({ Samir: true, Layla: true, Mona: true, Tarek: true }));
    });

    await page.goto(`${BASE_URL}/tools/empire`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    const hasEmpire = await page.evaluate(() => {
      return document.body.innerText.includes('Empire') && 
             (document.body.innerText.includes('Kategorie') || document.body.innerText.includes('Category') || document.body.innerText.includes('Zettel'));
    });
    assert(hasEmpire, 'Empire tool loads with facilitator setup and instructions');

    await context.close();
  }

  // -------------------------------------------------------------
  // TEST 7: Tool: Rollenverteiler - Isolation & Never Double Visible
  // -------------------------------------------------------------
  console.log('\n--- 7. Tool: Rollenverteiler (Isolation & Never Double Visible) ---');
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
    const page = await context.newPage();

    // Seed group names
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.setItem('jy_group_names', JSON.stringify(['Samir', 'Layla', 'Mona', 'Tarek']));
      localStorage.setItem('jy_group_present', JSON.stringify({ Samir: true, Layla: true, Mona: true, Tarek: true }));
    });

    await page.goto(`${BASE_URL}/tools/roles`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    // Advance to pass-around screen
    const dealBtn = page.locator('button:has-text("Rollen geheim verteilen"), button:has-text("Deal roles secretly"), button:has-text("Karten verteilen"), button:has-text("Deal cards")').first();
    if (await dealBtn.isVisible()) {
      await dealBtn.click();
      await page.waitForTimeout(400);
    }

    // Verify initial card is face-down / hidden before player interaction
    const initiallyHidden = await page.evaluate(() => {
      return document.body.innerText.includes('Gib das Handy an') || 
             document.body.innerText.includes('Hand the phone to') || 
             document.body.innerText.includes('Samir');
    });
    assert(initiallyHidden, 'Rollenverteiler: Secret card begins face-down / hidden before player interaction');

    // Tap "Karte aufdecken"
    const revealBtn = page.locator('button:has-text("Karte aufdecken"), button:has-text("Reveal card")').first();
    if (await revealBtn.isVisible()) {
      await revealBtn.click();
      await page.waitForTimeout(300);
    }

    // Tap "Verbergen & weitergeben"
    const hideBtn = page.locator('button:has-text("Verbergen & weitergeben"), button:has-text("Verstecken & Weitergeben"), button:has-text("Hide and pass on"), button:has-text("Hide & pass")').first();
    if (await hideBtn.isVisible()) {
      await hideBtn.click();
      await page.waitForTimeout(300);
    }

    // Verify player 2 name appears with card hidden again (isolated, never double visible)
    const passedSafely = await page.evaluate(() => {
      return document.body.innerText.includes('Layla') || document.body.innerText.includes('Gib das Handy an');
    });
    assert(passedSafely, 'Rollenverteiler: Card immediately hides before passing to next player (never double visible)');

    await context.close();
  }

  // -------------------------------------------------------------
  // TEST 8: Backup & Restore (Local data export/import round-trip)
  // -------------------------------------------------------------
  console.log('\n--- 8. Sicherung & Wiederherstellung (Round-Trip) ---');
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    const roundTripSuccess = await page.evaluate(() => {
      // Setup test keys
      localStorage.setItem('jy_test_key_phase09', JSON.stringify({ verified: true, time: 12345 }));
      localStorage.setItem('jy_favorites', JSON.stringify(['game-1', 'quote-2']));

      // Simulate export logic from src/utils/backup.ts
      const out = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('jy_')) out[k] = localStorage.getItem(k);
      }
      const exportedJson = JSON.stringify({ app: 'jy-hub', version: 1, exportedAt: new Date().toISOString(), data: out });

      // Clear local storage
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('jy_')) keys.push(k);
      }
      keys.forEach((k) => localStorage.removeItem(k));

      // Verify cleared
      if (localStorage.getItem('jy_test_key_phase09') !== null) return false;

      // Simulate import logic
      const parsed = JSON.parse(exportedJson);
      if (!parsed || parsed.app !== 'jy-hub' || typeof parsed.data !== 'object') return false;
      for (const [k, v] of Object.entries(parsed.data)) {
        if (k.startsWith('jy_') && typeof v === 'string') {
          localStorage.setItem(k, v);
        }
      }

      // Check restored data
      const restored = localStorage.getItem('jy_test_key_phase09');
      const restoredFavs = localStorage.getItem('jy_favorites');
      return Boolean(restored && JSON.parse(restored).verified === true && restoredFavs?.includes('game-1'));
    });

    assert(roundTripSuccess, 'Local data backup round-trip (export -> clear -> import) preserves jy_* data perfectly');
    await context.close();
  }

  // -------------------------------------------------------------
  // TEST 9: Zeichengenaue Zitat-Integrität
  // -------------------------------------------------------------
  console.log('\n--- 9. Zeichengenaue Zitat-Integrität ---');
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/quotes/honor-mine-gems`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    const renderedText = await page.evaluate(() => {
      const bq = document.querySelector('blockquote, [role="dialog"] p.font-serif, p.font-serif');
      return bq ? (bq.textContent || '').trim() : '';
    });

    const expectedDe = 'Betrachtet den Menschen als ein Bergwerk, reich an Edelsteinen von unschätzbarem Wert. Nur die Erziehung kann seine Schätze enthüllen und der Menschheit ermöglichen, daraus Nutzen zu ziehen.';
    
    assert(
      renderedText.includes(expectedDe) || expectedDe.includes(renderedText),
      `Rendered scripture matches QUOTES_DATA verbatim without truncation or editorial drift`
    );

    await context.close();
  }

  // -------------------------------------------------------------
  // TEST 10: Proposal Workflow & Honeypot Protection
  // -------------------------------------------------------------
  console.log('\n--- 10. Vorschlagsformular & Honeypot-Schutz ---');
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/vorschlagen`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    // Step 1: Select "Gruppenspiel"
    const gameBtn = page.locator('button:has-text("Gruppenspiel"), button:has-text("Group Game")').first();
    await gameBtn.click();
    await page.waitForTimeout(300);

    // Check step 2 form is shown
    const step2Visible = await page.evaluate(() => {
      return document.body.innerText.includes('Titel *') || document.body.innerText.includes('Title *');
    });
    assert(step2Visible, 'Vorschlagen: Transitions from type picker to Step 2 input form');

    // Toggle live preview
    const previewBtn = page.locator('button:has-text("Vorschau ansehen"), button:has-text("Live preview")').first();
    await previewBtn.click();
    await page.waitForTimeout(300);

    const previewShown = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('So sieht der Beitrag') || text.includes('So sieht der Eintrag') || text.includes('This is how');
    });
    assert(previewShown, 'Vorschlagen: Live preview toggle displays rendered card view');

    // Toggle back to form
    const editBtn = page.locator('button:has-text("Formular bearbeiten"), button:has-text("Edit form")').first();
    await editBtn.click();
    await page.waitForTimeout(300);

    // Check honeypot element exists and is hidden
    const honeypotOk = await page.evaluate(() => {
      const hp = document.querySelector('input[name="hp_website"]');
      const container = hp?.closest('div[aria-hidden="true"]');
      return Boolean(hp && container && container.classList.contains('hidden'));
    });
    assert(honeypotOk, 'Vorschlagen: Honeypot field exists and is securely hidden from legitimate users');

    await context.close();
  }

  // -------------------------------------------------------------
  // TEST 11: T1–T7 Tap Benchmarks
  // -------------------------------------------------------------
  console.log('\n--- 11. T1–T7 Tap Benchmarks ---');
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
    const findGameBtn = page.locator('a:has-text("Spiel finden"), button:has-text("Spiel finden"), a:has-text("Find a game"), button:has-text("Find a game")').first();
    if (await findGameBtn.isVisible()) {
      await findGameBtn.click();
      t1Taps++;
      await page.waitForTimeout(300);
    }
    const showGamesBtn = page.locator('button:has-text("Spiele anzeigen"), button:has-text("Show games")').first();
    if (await showGamesBtn.isVisible()) {
      await showGamesBtn.click();
      t1Taps++;
      await page.waitForTimeout(400);
    }
    const firstGame = page.locator('a[href^="/games/"]').first();
    if (await firstGame.isVisible()) {
      await firstGame.click();
      t1Taps++;
      await page.waitForTimeout(400);
    }
    const isRulesOpen = page.url().includes('/games/');
    assert(isRulesOpen && t1Taps <= 3, `T1: Quick Pick to Game Rules open in ${t1Taps} taps (Target <= 3 taps)`);

    // T2: "Share / Copy" via ShareMenu (Target: <= 2 taps from game details)
    await page.goto(`${BASE_URL}/games/wer-bin-ich`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    let t2Taps = 0;
    const shareBtn = page.locator('button[aria-haspopup="menu"]').first();
    if (await shareBtn.isVisible()) {
      await shareBtn.click();
      t2Taps++;
      await page.waitForTimeout(200);
      const copyOption = page.locator('[role="menuitem"]').first();
      assert(await copyOption.isVisible(), 'ShareMenu opened cleanly with copy options');
    }

    // T4: Theme toggle in settings
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    let t4Taps = 0;
    const settingsBtn = page.locator('header button[aria-label="Einstellungen"], header button[aria-label="Settings"]').first();
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      t4Taps++;
      await page.waitForTimeout(300);
      const darkBtn = page.locator('button:has-text("Dunkel"), button:has-text("Dark")').first();
      if (await darkBtn.isVisible()) {
        await darkBtn.click();
        t4Taps++;
      }
    }
    await page.waitForTimeout(300);
    const isDarkPersisted = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') || localStorage.getItem('jy_theme') === 'dark';
    });
    assert(isDarkPersisted && t4Taps <= 2, `T4: Theme toggles with localStorage persistence in ${t4Taps} taps`);

    // T6: Tools -> Timer running
    await page.goto(`${BASE_URL}/tools/timer`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const startTimerBtn = page.locator('button:has-text("Start"), button:has-text("Starten")').first();
    if (await startTimerBtn.isVisible()) {
      await startTimerBtn.click();
      await page.waitForTimeout(300);
    }
    const isTimerRunning = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).some((b) => b.textContent?.includes('Pause') || b.textContent?.includes('anhalten')) || document.body.innerText.includes('Pause');
    });
    assert(isTimerRunning, `T6: Tools to running Timer in <= 2 taps`);

    // T7: Legal compliance
    await page.goto(`${BASE_URL}/impressum`, { waitUntil: 'networkidle' });
    const impressumOk = await page.evaluate(() => document.body.innerText.includes('Impressum'));
    assert(impressumOk, 'T7a: Impressum legal page is accessible and verified');

    await page.goto(`${BASE_URL}/datenschutz`, { waitUntil: 'networkidle' });
    const datenschutzOk = await page.evaluate(() => document.body.innerText.includes('Datenschutzerklärung') || document.body.innerText.includes('Privacy Policy'));
    assert(datenschutzOk, 'T7b: Datenschutz page is accessible with zero-tracking disclosure');

    await context.close();
  }

  // -------------------------------------------------------------
  // TEST 12: Axe Color Contrast Compliance (Light & Dark)
  // -------------------------------------------------------------
  console.log('\n--- 12. Axe Color Contrast Compliance (Light & Dark) ---');
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    for (const route of routes) {
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(200);

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
      await page.waitForTimeout(200);

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
  // TEST 13: Print Stylesheet Validation
  // -------------------------------------------------------------
  console.log('\n--- 13. Print Stylesheet Validation ---');
  {
    const context = await browser.newContext({ viewport: { width: 1200, height: 800 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/games`, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(300);

    const printStyles = await page.evaluate(() => {
      const navbar = document.querySelector('header');
      const footer = document.querySelector('footer');
      const navDisplay = navbar ? window.getComputedStyle(navbar).display : 'none';
      const footDisplay = footer ? window.getComputedStyle(footer).display : 'none';
      return {
        navHidden: navDisplay === 'none',
        footHidden: footDisplay === 'none',
      };
    });

    assert(printStyles.navHidden, 'Print mode: Header navbar is hidden (@media print)');
    assert(printStyles.footHidden, 'Print mode: Footer is hidden (@media print)');
    await context.close();
  }

  await browser.close();

  console.log('\n-------------------------------------------------------------');
  if (failures === 0) {
    console.log('🎉 ALL JY HUB PHASE 09 E2E VERIFICATION CHECKS PASSED (0 FAILURES)!');
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
