// Design-Sperre: Der dunkle Modus ist "Dark Graphite" (neutrales Schwarz, kein Blau).
// Dieser Test läuft vor jedem Build (npm run build). Er schlägt fehl, wenn die Farbwerte oder die
// Kartendarstellung geändert werden. Das ist Absicht: Am 6.11.2026 ist durch einen Commit
// ("kühles tiefes Nachtblau") das blaue Design versehentlich live gegangen, obwohl der Inhaber das
// Graphit-Design wollte. Eine Änderung ist nur nach AUSDRÜCKLICHER Anforderung des Inhabers erlaubt.
// Dann diese Datei, AGENTS.md und docs/v2/prompts/00-design-system.md gemeinsam anpassen.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
const read = (p) => readFileSync(new URL(`../src/components/${p}`, import.meta.url), 'utf8');

describe('Design-Sperre: dunkler Modus = Dark Graphite', () => {
  const required = [
    '--bg: #0C0D0E;',
    '--surface: #15171A;',
    '--surface-2: #1E2025;',
    '--surface-3: #282B32;',
    '--border: #23262D;',
    '--text: #F4F4F6;',
    '--text-secondary: #A1A1AA;',
  ];
  for (const token of required) {
    test(`index.css enthält ${token}`, () => {
      assert.ok(
        css.includes(token),
        `Dunkles Token fehlt oder wurde geändert: ${token}. Design nur nach ausdrücklicher Anforderung ändern (siehe Kopf dieser Datei).`,
      );
    });
  }

  test('kein Nachtblau im dunklen Modus', () => {
    for (const blue of ['--bg: #0D131F;', '--bg: #0E1626;', 'Nachtblau']) {
      assert.ok(!css.includes(blue), `Veraltetes blaues Design gefunden: ${blue}`);
    }
  });

  test('Spiel- und Dienst/Kunst-Karten behalten das weiche Akzent-Leuchten oben rechts', () => {
    for (const file of ['GameCard.tsx', 'ServiceArtsCard.tsx']) {
      assert.ok(
        read(file).includes('Subtle Top-Right Ambient Glow'),
        `${file}: das Leuchten oben rechts wurde entfernt. Nur nach ausdrücklicher Anforderung ändern.`,
      );
    }
  });
});
