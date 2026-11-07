/**
 * WCAG AA Contrast Verification Script
 * Checks contrast ratios between all background surfaces and text/UI tokens
 * for both Light and Dark themes according to WCAG 2.1 AA specifications.
 * Normal text >= 4.5:1, Large text & UI components >= 3.0:1
 */

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const num = parseInt(hex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Read the tokens straight from src/index.css. The palettes used to be copied here by hand and
// drifted (the dark one was still the retired blue theme), so the check passed on colours the site
// no longer used.
import { readFileSync } from 'node:fs';
const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
const block = (selector) => {
  const from = css.indexOf(selector);
  const body = css.slice(from, css.indexOf('\n}', from));
  return Object.fromEntries([...body.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,6})\s*;/g)].map((m) => [m[1], m[2]]));
};
const PALETTES = {
  Light: block(':root, [data-theme="light"] {'),
  Dark: block('.dark, [data-theme="dark"] {'),
};

let totalViolations = 0;
let totalChecks = 0;

console.log('='.repeat(70));
console.log('  WCAG AA CONTRAST AUDIT REPORT (Juju Hub v2 Tokens)');
console.log('='.repeat(70));

for (const [mode, tokens] of Object.entries(PALETTES)) {
  console.log(`\n### ${mode.toUpperCase()} MODE ###\n`);
  const surfaces = ['bg', 'surface', 'surface-2', 'surface-3'];
  const textTokens = [
    { name: 'text', minRatio: 4.5, type: 'Normal text' },
    { name: 'text-secondary', minRatio: 4.5, type: 'Normal text' },
    { name: 'text-tertiary', minRatio: 4.5, type: 'Small/secondary text' },
    { name: 'accent-text', minRatio: 4.5, type: 'Accent text' },
    { name: 'amber-text', minRatio: 4.5, type: 'Devotion/Amber text' },
    { name: 'success', minRatio: 4.5, type: 'Status text' },
    { name: 'danger', minRatio: 4.5, type: 'Status text' },
  ];

  for (const surf of surfaces) {
    console.log(`  Surface: ${surf} (${tokens[surf]})`);
    for (const fg of textTokens) {
      totalChecks++;
      const ratio = contrastRatio(tokens[surf], tokens[fg.name]);
      const passed = ratio >= fg.minRatio;
      if (!passed) totalViolations++;
      const status = passed ? '✅ PASS' : '❌ FAIL';
      console.log(`    ${status} [${ratio.toFixed(2)}:1] (req >= ${fg.minRatio}:1) - ${fg.name} (${tokens[fg.name]})`);
    }
  }

  // Component-specific combinations
  console.log(`  Component Pairings:`);
  
  // 1. Accent Button: accent-contrast on accent
  totalChecks++;
  const btnRatio = contrastRatio(tokens['accent'], tokens['accent-contrast']);
  const btnPass = btnRatio >= 4.5;
  if (!btnPass) totalViolations++;
  console.log(`    ${btnPass ? '✅ PASS' : '❌ FAIL'} [${btnRatio.toFixed(2)}:1] (req >= 4.5:1) - accent-contrast on accent`);

  // 2. Active Chip: accent-text on accent-subtle
  totalChecks++;
  const chipRatio = contrastRatio(tokens['accent-subtle'], tokens['accent-text']);
  const chipPass = chipRatio >= 4.5;
  if (!chipPass) totalViolations++;
  console.log(`    ${chipPass ? '✅ PASS' : '❌ FAIL'} [${chipRatio.toFixed(2)}:1] (req >= 4.5:1) - accent-text on accent-subtle`);

  // 3. Devotion / Amber Chip: amber-text on amber-subtle
  totalChecks++;
  const amberChipRatio = contrastRatio(tokens['amber-subtle'], tokens['amber-text']);
  const amberChipPass = amberChipRatio >= 4.5;
  if (!amberChipPass) totalViolations++;
  console.log(`    ${amberChipPass ? '✅ PASS' : '❌ FAIL'} [${amberChipRatio.toFixed(2)}:1] (req >= 4.5:1) - amber-text on amber-subtle`);

  // 4. UI Component Boundary/Focus: accent against surface (graphical / focus target req >= 3.0:1)
  totalChecks++;
  const focusRatio = contrastRatio(tokens['surface'], tokens['accent']);
  const focusPass = focusRatio >= 3.0;
  if (!focusPass) totalViolations++;
  console.log(`    ${focusPass ? '✅ PASS' : '❌ FAIL'} [${focusRatio.toFixed(2)}:1] (req >= 3.0:1) - accent focus/UI on surface`);
}

console.log('\n' + '='.repeat(70));
console.log(`  SUMMARY: ${totalChecks} contrast checks completed.`);
if (totalViolations === 0) {
  console.log(`  🎉 ZERO VIOLATIONS. All tokens strictly satisfy WCAG 2.1 AA.`);
  console.log('='.repeat(70) + '\n');
  process.exit(0);
} else {
  console.error(`  ⚠️ ${totalViolations} VIOLATIONS FOUND.`);
  console.log('='.repeat(70) + '\n');
  process.exit(1);
}
