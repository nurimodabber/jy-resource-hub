import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('docs/v2/screens/05');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const VIEWPORTS = [
  { name: 'phone-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1280', width: 1280, height: 800 }
];

async function capture() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';

  // 1. Capture Empty Preset Selection View
  for (const vp of VIEWPORTS) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();

      try {
        console.log(`[Empty Preset View] ${theme} on ${vp.name}...`);
        await page.goto(`${BASE_URL}/treffen`, { waitUntil: 'networkidle', timeout: 15000 });
        
        // Ensure clean state: empty plan
        await page.evaluate(({ curTheme }) => {
          localStorage.setItem('jy_theme', curTheme);
          if (curTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          // Empty plan
          const emptyPlan = [{
            id: 'plan-empty-test',
            name: 'Mein Treffen',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            slots: [],
            targetDurationMinutes: 75,
            startTime: '17:00'
          }];
          localStorage.setItem('jy_plans', JSON.stringify(emptyPlan));
          localStorage.setItem('jy_active_plan_id', 'plan-empty-test');
        }, { curTheme: theme });

        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(400);

        const screenPath = path.join(outDir, `05-preset-picker-${theme}-${vp.name}.png`);
        await page.screenshot({ path: screenPath, fullPage: true });
        console.log(`Saved: ${screenPath}`);
      } catch (err) {
        console.error(`Error on preset picker ${vp.name} (${theme}):`, err.message);
      } finally {
        await context.close();
      }
    }
  }

  // 2. Capture Active Timeline View & Live Gathering Mode
  for (const vp of VIEWPORTS) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();

      try {
        console.log(`[Timeline & Live Mode] ${theme} on ${vp.name}...`);
        await page.goto(`${BASE_URL}/treffen`, { waitUntil: 'networkidle', timeout: 15000 });

        // Set populated 75 min standard gathering plan
        await page.evaluate(({ curTheme }) => {
          localStorage.setItem('jy_theme', curTheme);
          if (curTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          const standardPlan = [{
            id: 'plan-std-test',
            name: 'Normales Treffen (75 Min)',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            targetDurationMinutes: 75,
            startTime: '17:00',
            slots: [
              {
                id: 's1',
                type: 'devotional',
                title: { de: 'Andacht & Lied: Gesegnet ist die Stätte', en: 'Devotion & Song: Blessed is the Spot' },
                durationMinutes: 10,
                description: { de: 'Gemeinsames Gebet und Lied zur ruhigen, ehrfürchtigen Einstimmung.', en: 'Opening prayer and choral song.' },
                referenceType: 'song',
                referenceId: 'blessed-is-the-spot'
              },
              {
                id: 's2',
                type: 'study',
                title: { de: 'Zitatestudium: Reine Absichten', en: 'Text Study: Pure Intentions' },
                durationMinutes: 20,
                description: { de: 'Gemeinsames Verstehen und Memorieren mit der Verschwindenden Tafel.', en: 'Collective memorisation and understanding.' },
                referenceType: 'quote',
                referenceId: 'breezes-love-mankind'
              },
              {
                id: 's3',
                type: 'warmup',
                title: { de: 'Gruppenspiel: Schnick-Schnack-Schnuck Evolution', en: 'Group Game: RPS Evolution' },
                durationMinutes: 15,
                description: { de: 'Aktiver Energizer im Kreis, baut Hemmungen ab und bringt Energie.', en: 'Energizing icebreaker.' },
                referenceType: 'game',
                referenceId: 'ssp-evolution'
              },
              {
                id: 's4',
                type: 'arts_discussion',
                title: { de: 'Theater-Impuls: Weggabelung der Bestätigungen', en: 'Drama Prompt: The Fork in the Road' },
                durationMinutes: 20,
                description: { de: 'Kurze Standbilder oder Szenenspiel zur Anwendung des Zitats.', en: 'Short skits or tableaux.' },
                referenceType: 'art',
                referenceId: 'breezes-two-roads-skit'
              },
              {
                id: 's5',
                type: 'closing',
                title: { de: 'Abschlusskreis: Wort-Mind', en: 'Closing Circle: Word Mind' },
                durationMinutes: 10,
                description: { de: 'Ruhige Zähl-Herausforderung im Kreis und Gedanke für die Woche.', en: 'Quiet mindful challenge.' },
                referenceType: 'game',
                referenceId: 'wort-mind'
              }
            ]
          }];
          localStorage.setItem('jy_plans', JSON.stringify(standardPlan));
          localStorage.setItem('jy_active_plan_id', 'plan-std-test');
        }, { curTheme: theme });

        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(400);

        // Screenshot of vertical timeline
        const timelinePath = path.join(outDir, `05-timeline-${theme}-${vp.name}.png`);
        await page.screenshot({ path: timelinePath, fullPage: true });
        console.log(`Saved: ${timelinePath}`);

        // Click "Treffen starten" to capture Live Execution Mode
        const startBtn = page.locator('button:has-text("Treffen starten"), button:has-text("Start Gathering")').first();
        if (await startBtn.isVisible()) {
          await startBtn.click();
          await page.waitForTimeout(400);

          const livePath = path.join(outDir, `05-live-guide-${theme}-${vp.name}.png`);
          await page.screenshot({ path: livePath, fullPage: true });
          console.log(`Saved: ${livePath}`);

          // Close live mode
          const closeBtn = page.locator('button[aria-label*="beenden"], button[aria-label*="Exit"]').first();
          if (await closeBtn.isVisible()) {
            await closeBtn.click();
            await page.waitForTimeout(300);
          }
        }

        // Click "Packliste" to capture packing list modal on desktop
        if (vp.name === 'desktop-1280' && theme === 'light') {
          const packBtn = page.locator('button:has-text("Packliste"), button:has-text("Packing List")').first();
          if (await packBtn.isVisible()) {
            await packBtn.click();
            await page.waitForTimeout(400);
            const packPath = path.join(outDir, `05-packing-list-modal.png`);
            await page.screenshot({ path: packPath });
            console.log(`Saved: ${packPath}`);
          }
        }

      } catch (err) {
        console.error(`Error on timeline ${vp.name} (${theme}):`, err.message);
      } finally {
        await context.close();
      }
    }
  }

  await browser.close();
  console.log('Phase 05 verification screenshots completed successfully.');
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});
