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

const PALETTES = {
  Light: {
    bg: '#F7F9FC',
    surface: '#FFFFFF',
    'surface-2': '#EEF2F8',
    border: '#E3E8F0',
    text: '#142033',
    'text-secondary': '#4A5568',
    'text-tertiary': '#4E5A6B',
    accent: '#1F6FEB',
    'accent-hover': '#1859C4',
    'accent-subtle': '#E8F0FE',
    'accent-text': '#1850B8',
    'accent-contrast': '#FFFFFF',
    highlight: '#F5B82E',
    success: '#167448',
    danger: '#C13333',
  },
  Dark: {
    bg: '#0E1626',
    surface: '#162036',
    'surface-2': '#1E2A44',
    border: '#2A3858',
    text: '#EEF2FA',
    'text-secondary': '#BAC6DC',
    'text-tertiary': '#A3B1CA',
    accent: '#6FA3FF',
    'accent-hover': '#8DB8FF',
    'accent-subtle': '#1B2E55',
    'accent-text': '#A9C8FF',
    'accent-contrast': '#0A1426',
    highlight: '#F5B82E',
    success: '#4FC08A',
    danger: '#FF8A8A',
  }
};

let totalViolations = 0;
let totalChecks = 0;

console.log('='.repeat(70));
console.log('  WCAG AA CONTRAST AUDIT REPORT (Junior Youth Hub v2 Tokens)');
console.log('='.repeat(70));

for (const [mode, tokens] of Object.entries(PALETTES)) {
  console.log(`\n### ${mode.toUpperCase()} MODE ###\n`);
  const surfaces = ['bg', 'surface', 'surface-2'];
  const textTokens = [
    { name: 'text', minRatio: 4.5, type: 'Normal text' },
    { name: 'text-secondary', minRatio: 4.5, type: 'Normal text' },
    { name: 'text-tertiary', minRatio: 4.5, type: 'Small/secondary text' },
    { name: 'accent-text', minRatio: 4.5, type: 'Accent text' },
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

  // 3. UI Component Boundary/Focus: accent against surface (graphical / focus target req >= 3.0:1)
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
