import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const urls = [
  { url: 'http://localhost:4175/', name: 'Home (/)' },
  { url: 'http://localhost:4175/games', name: 'Spiele (/games)' },
  { url: 'http://localhost:4175/quotes', name: 'Zitate (/quotes)' },
  { url: 'http://localhost:4175/treffen', name: 'Treffen (/treffen)' },
];

const tmpDir = path.resolve('tmp-lh-4175');
fs.mkdirSync(tmpDir, { recursive: true });

console.log('🔦 Starting Lighthouse Mobile audits on http://localhost:4175...');
const results = [];

for (const item of urls) {
  const jsonOut = path.join(tmpDir, `${item.name.replace(/[^a-z0-9]/gi, '_')}.json`);
  console.log(`Running audit for ${item.name}...`);

  try {
    execSync(
      `npx lighthouse "${item.url}" --output=json --output-path="${jsonOut}" --form-factor=mobile --screenEmulation.mobile=true --throttling-method=provided --chrome-flags="--headless --no-sandbox"`,
      { stdio: 'pipe' }
    );

    const report = JSON.parse(fs.readFileSync(jsonOut, 'utf-8'));
    const perf = Math.round((report.categories.performance?.score || 0) * 100);
    const a11y = Math.round((report.categories.accessibility?.score || 0) * 100);
    const bp = Math.round((report.categories['best-practices']?.score || 0) * 100);
    const seo = Math.round((report.categories.seo?.score || 0) * 100);

    results.push({
      name: item.name,
      perf,
      a11y,
      bp,
      seo,
    });
    console.log(`✅ ${item.name}: Perf=${perf}, A11y=${a11y}, BestPractices=${bp}, SEO=${seo}`);
  } catch (err) {
    console.error(`❌ Lighthouse failed on ${item.name}:`, err.message);
  }
}

console.log('\n📊 Summary Table:');
console.table(results);
fs.writeFileSync(path.join(tmpDir, 'lighthouse-summary.json'), JSON.stringify(results, null, 2));
