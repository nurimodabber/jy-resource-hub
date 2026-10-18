import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = '/Users/nurimilanmodabber/.gemini/antigravity/brain/74c6dd68-6b04-450b-a5f6-edba6a99cca3';
const OUT_DIR = path.join(ARTIFACT_DIR, 'balance-screens');
fs.mkdirSync(OUT_DIR, { recursive: true });

const BASE_URL = 'http://localhost:4175';

const routes = [
  { path: '/', slug: 'home', name: 'Startseite' },
  { path: '/games', slug: 'games', name: 'Spiele-Katalog' },
  { path: '/games/menschlicher-knoten', slug: 'game-detail', name: 'Spiel-Detail' },
  { path: '/quotes', slug: 'quotes', name: 'Zitate-Sammlung' },
  { path: '/service-arts', slug: 'service-arts', name: 'Dienst & Kunst' },
  { path: '/treffen', slug: 'treffen', name: 'Treffen-Planer' },
  { path: '/tools', slug: 'tools', name: 'Werkzeuge' },
  { path: '/tools/timer', slug: 'timer', name: 'Timer' },
  { path: '/vorschlagen', slug: 'vorschlagen', name: 'Vorschlag einreichen' },
];

const viewports = [
  { width: 390, height: 844, name: '390', isMobile: true, label: 'Mobile (390 px)' },
  { width: 768, height: 1024, name: '768', isMobile: false, label: 'Tablet (768 px)' },
  { width: 1280, height: 800, name: '1280', isMobile: false, label: 'Desktop (1280 px)' },
];

const themes = ['dark', 'light'];

async function run() {
  console.log(`🚀 Starting capture of Version C balance screens against ${BASE_URL}...`);
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
    });
    const page = await context.newPage();

    for (const theme of themes) {
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
          await page.waitForTimeout(400);

          const fileName = `${route.slug}-${vp.name}-${theme}.png`;
          const filePath = path.join(OUT_DIR, fileName);
          await page.screenshot({ path: filePath, fullPage: false });
          console.log(`Saved ${fileName}`);
        } catch (err) {
          console.error(`Error on ${route.path} (${vp.name}, ${theme}):`, err.message);
        }
      }
    }
    await context.close();
  }

  await browser.close();
  console.log('✅ All Version C screens captured successfully!');

  // Generate a-b-c.md comparison artifact
  let md = '# Drei Entwürfe im Vergleich: A vs. B vs. C\n\n';
  md += '> Direkter Vergleich aller drei aktiven Entwicklungsstände:\n';
  md += '> - **Version A (Port 4173):** Ursprüngliches Design („Blau“, branch `main`/`dist-v1`)\n';
  md += '> - **Version B (Port 4174):** Radikaler organischer Entwurf („Abendgarten“, branch `design/abendgarten`/`dist-v2`)\n';
  md += '> - **Version C (Port 4175):** Ausgewogener Entwurf („Wort & Tun“, branch `design/balance`)\n\n';

  md += '## Architektur- und Design-Matrix\n\n';
  md += '| Kriterium | Version A (Blau, 4173) | Version B (Abendgarten, 4174) | Version C (Wort & Tun, 4175) |\n';
  md += '| :--- | :--- | :--- | :--- |\n';
  md += '| **Farbkonzept** | Navy `#0E1626` mit Einheitsblau `#3B82F6` | Nachtgrün `#0F1714` mit Messing `#D4AE5C` | Ausbalanciertes Duo: **Wort** (mattes Messing `#D8B565`/`#8C6418`) & **Tun** (klares Blau `#6FB3F0`/`#1F5FA8`) |\n';
  md += '| **Typografie** | Figtree (Sans) + Lora (Serif) | Atkinson Hyperlegible Next (fehlte im CSS) + Literata + Mono | Global Atkinson Hyperlegible Next (Text) + Literata (Zitate) + Atkinson Mono (Zahlen) |\n';
  md += '| **Startseite** | 2 symmetrische Handlungskacheln, KI-Text | Zitat-Hero, Badi-Datum, Ablauf-Vorschau | **Begrüßung** („Guten Abend“), Zitat-Hero mit Tun-CTA, 2-Spalten Desktop, **Dein Bereich** mit Treffen-Plan & JY-Buch Fortschrittstracker |\n';
  md += '| **Treffen-Planer** | Feste 5-Block-Struktur | Proportionale Zeitachse mit Drag & Drop | **Offener Ablaufplaner** ohne vorgeschriebene Struktur; Vorlagen frei wählbar; URL-Hash-Sharing (`#plan=...`); Reflexionskarten am Ende |\n';
  md += '| **Spiele-Filter** | Kategorien & Energie-Punkte | Farbstreifen & Personenbalken | Farbstreifen + Personenbalken + **Ort-Filter (Drinnen / Draußen)** + dynamische Datenzählung |\n';
  md += '| **Navigation** | 5 Tabs | 6 Tabs (inkl. Vorschlag, gedrängt) | **5 Tabs** mit oberem Tun-Aktionsstreifen und 100% deckendem opaken Hintergrund |\n';
  md += '| **Footer** | Umbrechende Punkte | Unruhige Trenner | Sauber formatierter Footer ohne verwaiste Trennpunkte |\n\n';

  md += '---\n\n';

  for (const route of routes) {
    md += `## ${route.name} (\`${route.path}\`)\n\n`;

    for (const vp of viewports) {
      md += `### ${vp.label}\n\n`;

      for (const th of themes) {
        const thLabel = th === 'dark' ? 'Dark Mode' : 'Light Mode';
        const aImg = `${ARTIFACT_DIR}/audit-screens/${route.slug}-${vp.name}-${th}.png`;
        const bImg = `${ARTIFACT_DIR}/abendgarten-screens/${route.slug}-${vp.name}-${th}.png`;
        const cImg = `${ARTIFACT_DIR}/balance-screens/${route.slug}-${vp.name}-${th}.png`;

        md += `#### ${thLabel}\n\n`;
        md += '````carousel\n';
        md += `![Version A (Blau 4173) – ${route.name} ${vp.name} ${th}](${aImg})\n`;
        md += '<!-- slide -->\n';
        md += `![Version B (Abendgarten 4174) – ${route.name} ${vp.name} ${th}](${bImg})\n`;
        md += '<!-- slide -->\n';
        md += `![Version C (Wort & Tun 4175) – ${route.name} ${vp.name} ${th}](${cImg})\n`;
        md += '````\n\n';
      }
    }
  }

  const comparisonPath = path.join(ARTIFACT_DIR, 'a-b-c.md');
  fs.writeFileSync(comparisonPath, md, 'utf-8');
  console.log(`✅ A vs B vs C comparison written to ${comparisonPath}`);
}

run().catch((err) => {
  console.error('Fatal error in capture-balance-screens:', err);
  process.exit(1);
});
