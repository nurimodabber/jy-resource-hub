import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUT_DIR = path.resolve('docs/redesign/lighthouse');
fs.mkdirSync(OUT_DIR, { recursive: true });

const pages = [
  { path: '/', slug: 'home', title: 'Startseite (/)' },
  { path: '/games', slug: 'games', title: 'Spiele (/games)' },
  { path: '/quotes', slug: 'quotes', title: 'Zitate (/quotes)' },
  { path: '/treffen', slug: 'treffen', title: 'Treffen (/treffen)' },
  { path: '/tools', slug: 'tools', title: 'Werkzeuge (/tools)' },
];

const modes = [
  { name: 'mobile', formFactor: 'mobile', flags: '--screenEmulation.mobile=true' },
  { name: 'desktop', formFactor: 'desktop', flags: '--preset=desktop' },
];

console.log(`🔦 Starting Lighthouse baseline audits against ${BASE_URL}...`);
const summary = [];

for (const mode of modes) {
  for (const page of pages) {
    const jsonOut = path.join(OUT_DIR, `${page.slug}-${mode.name}.json`);
    const targetUrl = `${BASE_URL}${page.path}`;
    console.log(`Running ${mode.name} audit for ${page.title}...`);

    try {
      execSync(
        `npx lighthouse "${targetUrl}" --output=json --output-path="${jsonOut}" --form-factor=${mode.formFactor} ${mode.flags} --throttling-method=provided --chrome-flags="--headless --no-sandbox"`,
        { stdio: 'pipe' }
      );

      const report = JSON.parse(fs.readFileSync(jsonOut, 'utf-8'));
      const perf = Math.round((report.categories.performance?.score || 0) * 100);
      const a11y = Math.round((report.categories.accessibility?.score || 0) * 100);
      const bp = Math.round((report.categories['best-practices']?.score || 0) * 100);
      const seo = Math.round((report.categories.seo?.score || 0) * 100);

      summary.push({
        page: page.title,
        mode: mode.name,
        performance: perf,
        accessibility: a11y,
        bestPractices: bp,
        seo: seo,
      });

      console.log(`✅ [${mode.name.toUpperCase()}] ${page.title}: Perf=${perf}, A11y=${a11y}, BP=${bp}, SEO=${seo}`);
    } catch (err) {
      console.error(`❌ Lighthouse failed on [${mode.name}] ${page.title}:`, err.message);
    }
  }
}

fs.writeFileSync(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
console.log('\n📊 Baseline Lighthouse Summary:');
console.table(summary);
