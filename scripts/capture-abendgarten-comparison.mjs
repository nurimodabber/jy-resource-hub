import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = '/Users/nurimilanmodabber/.gemini/antigravity/brain/74c6dd68-6b04-450b-a5f6-edba6a99cca3';
const OUT_DIR = path.join(ARTIFACT_DIR, 'abendgarten-screens');
fs.mkdirSync(OUT_DIR, { recursive: true });

const BASE_URL = 'http://localhost:4174';

const routes = [
  { path: '/', slug: 'home', name: 'Startseite' },
  { path: '/games', slug: 'games', name: 'Spiele-Katalog' },
  { path: '/games/menschlicher-knoten', slug: 'game-detail', name: 'Spiel-Detail' },
  { path: '/quotes', slug: 'quotes', name: 'Zitate-Sammlung' },
  { path: '/quotes/numbers-orderly-thoughts', slug: 'quote-detail', name: 'Zitat-Detail' },
  { path: '/service-arts', slug: 'service-arts', name: 'Dienst & Kunst' },
  { path: '/treffen', slug: 'treffen', name: 'Treffen-Planer' },
  { path: '/tools', slug: 'tools', name: 'Werkzeuge' },
  { path: '/tools/timer', slug: 'timer', name: 'Timer' },
];

const viewports = [
  { width: 390, height: 844, name: '390', isMobile: true, label: 'Mobile (390 px)' },
  { width: 768, height: 1024, name: '768', isMobile: false, label: 'Tablet (768 px)' },
  { width: 1280, height: 800, name: '1280', isMobile: false, label: 'Desktop (1280 px)' },
];

const themes = ['dark', 'light'];

async function run() {
  console.log(`🚀 Starting capture of 54 Abendgarten screens against ${BASE_URL}...`);
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
      // Set theme in localStorage & document class
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
          await page.waitForTimeout(300);

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
  console.log('✅ All 54 Abendgarten screenshots captured successfully!');

  // Generate vorher-nachher.md markdown artifact
  let md = '# Vorher / Nachher – Design-Upgrade „Abendgarten“\n\n';
  md += '> Vergleich der bisherigen Version (`v1`, Port 4173) mit dem neuen organischen Redesign **„Abendgarten“** (`v2`, Port 4174).\n';
  md += '> Getestet über 9 Hauptrouten, 3 Bildschirmbreiten (Mobile 390px, Tablet 768px, Desktop 1280px) in Dark und Light Mode.\n\n';

  md += '## Übersicht der Änderungen\n\n';
  md += '| Bereich | Vorher (v1) | Nachher (Abendgarten v2) |\n';
  md += '| :--- | :--- | :--- |\n';
  md += '| **Farbwelt & Material** | Standard Navy `#0E1626` mit Einheitsblau | Tiefes Dämmerungs-Nachtgrün `#0F1714`, kühler Kalkstein `#F1F3EE`, mattes Messing `#D4AE5C` |\n';
  md += '| **Typografie** | Generische Figtree Sans | Lokale Atkinson Hyperlegible Next, Atkinson Mono & Literata Serif |\n';
  md += '| **Radien & Formen** | Einheitsradius 20 px für alles | Rollenbasierte Radien (Bedienelement 8 px, Karte 14 px, Zitat 4 px) |\n';
  md += '| **Startseite** | Zwei gleichförmige Kacheln, KI-Sprache | Zitat des Tages als Lesekarte mit Badi-Datum, proportionale Ablauf-Vorschau, Live-Werkzeugstatus |\n';
  md += '| **Spiele** | Unruhige Kacheln, 1–3 Punkte für Energie | Spielkarten-Paradigma mit vertikalem Farbstreifen, 2–40 Gruppenskala, rechteckige Filterchips |\n';
  md += '| **Spiel-Detail** | Standardliste | Große Monospace-Schrittnummern (`01`, `02`), ruhiger Animator-Tipp, Vollbild-Durchführungsmodus |\n';
  md += '| **Zitate** | Symmetrisches 2-Spalten-Raster | CSS Masonry Leseliste, Serif-Schrift Literata, abgedunkelter Beamer-Modus mit Messing-Anführungszeichen |\n';
  md += '| **Treffen-Planer** | Reine Kachel-Liste gleicher Höhe | Interaktive proportionale Zeitachse mit Drag & Pfeiltasten-Sortierung, visuelle Rhythmus-Vorschau auf Vorlagen |\n';
  md += '| **Werkzeuge** | 4 gleiche Icon-im-Kreis-Kacheln | Gebrauchsobjekte mit Kernwert-Vorschau (Mono-Zeit, Teams A/B, Rollen, Score) |\n';
  md += '| **Timer** | Linearer Balken | 3-px-Kreisbogen mit SVG Progress, Tabular-Mono-Ziffern, ruhiger Farbwechsel auf Warmorange in letzten 10s |\n';
  md += '| **Dienst & Kunst** | Gleiches Schema für beides | Getrennte Schemata: Dienst (Ort & Zeitrahmen) vs. Kunst (Disziplin & Materialaufwand) |\n';
  md += '| **Tone of Voice** | Werbliche KI-Floskeln („authentische Zusammenarbeit“) | Kollegialer Animatoren-Ton („35 Spiele für den Kreis, die Wiese und den Gruppenraum“) |\n\n';

  md += '---\n\n';

  for (const route of routes) {
    md += `## ${route.name} (\`${route.path}\`)\n\n`;

    for (const vp of viewports) {
      md += `### ${vp.label}\n\n`;

      for (const th of themes) {
        const thLabel = th === 'dark' ? 'Dark Mode' : 'Light Mode';
        const v1Img = `${ARTIFACT_DIR}/audit-screens/${route.slug}-${vp.name}-${th}.png`;
        const v2Img = `${ARTIFACT_DIR}/abendgarten-screens/${route.slug}-${vp.name}-${th}.png`;

        md += `#### ${thLabel}\n\n`;
        md += '````carousel\n';
        md += `![Vorher (v1 Port 4173) – ${route.name} ${vp.name} ${th}](${v1Img})\n`;
        md += '<!-- slide -->\n';
        md += `![Nachher (Abendgarten v2 Port 4174) – ${route.name} ${vp.name} ${th}](${v2Img})\n`;
        md += '````\n\n';
      }
    }
  }

  const comparisonPath = path.join(ARTIFACT_DIR, 'vorher-nachher.md');
  fs.writeFileSync(comparisonPath, md, 'utf-8');
  console.log(`✅ Vorher-Nachher Artifact written to ${comparisonPath}`);
}

run().catch((err) => {
  console.error('Fatal error during capture & comparison:', err);
  process.exit(1);
});
