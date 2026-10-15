import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('🔍 Testing translations and data integrity...');

let failures = 0;
function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    failures++;
  } else {
    console.log(`  ✅ PASSED: ${message}`);
  }
}

// 1. Translations check
const transFile = fs.readFileSync(path.join(ROOT_DIR, 'src/data/translations.ts'), 'utf8');

// Parse 'de' object and 'en' object keys using regex
function extractKeysAndValues(fileContent, objName) {
  const match = fileContent.match(new RegExp(`const ${objName}[^=]*= \\{([\\s\\S]*?)\\n\\};`));
  if (!match) throw new Error(`Could not find object ${objName}`);
  const block = match[1];
  const entries = {};
  const lineRegex = /^\s*([a-zA-Z0-9_]+)\s*:\s*('[^']*'|`[^`]*`|"[^"]*"),?/gm;
  let m;
  while ((m = lineRegex.exec(block)) !== null) {
    const key = m[1];
    let val = m[2];
    val = val.slice(1, -1); // strip quotes
    entries[key] = val;
  }
  return entries;
}

const deEntries = extractKeysAndValues(transFile, 'de');
const enEntries = extractKeysAndValues(transFile, 'en');

const deKeys = Object.keys(deEntries);
const enKeys = Object.keys(enEntries);

assert(deKeys.length > 50, `Found ${deKeys.length} keys in German translation dictionary`);
assert(enKeys.length > 50, `Found ${enKeys.length} keys in English translation dictionary`);
assert(deKeys.length === enKeys.length, `Equal key count between de (${deKeys.length}) and en (${enKeys.length})`);

const missingInEn = deKeys.filter((k) => !(k in enEntries));
const missingInDe = enKeys.filter((k) => !(k in deEntries));

assert(missingInEn.length === 0, `All DE keys present in EN (missing: ${missingInEn.join(', ') || 'none'})`);
assert(missingInDe.length === 0, `All EN keys present in DE (missing: ${missingInDe.join(', ') || 'none'})`);

// Check non-empty values
let emptyDe = deKeys.filter((k) => !deEntries[k] || deEntries[k].trim() === '');
let emptyEn = enKeys.filter((k) => !enEntries[k] || enEntries[k].trim() === '');

assert(emptyDe.length === 0, `Zero empty values in DE (empty: ${emptyDe.join(', ') || 'none'})`);
assert(emptyEn.length === 0, `Zero empty values in EN (empty: ${emptyEn.join(', ') || 'none'})`);

// 2. Scripture integrity check
const quotesFile = fs.readFileSync(path.join(ROOT_DIR, 'src/data/quotes.ts'), 'utf8');
assert(quotesFile.includes('QUOTES_DATA'), 'QUOTES_DATA is present in src/data/quotes.ts');
assert(quotesFile.includes("Bahá\\'u\\'lláh") || quotesFile.includes("Bahá'u'lláh") || quotesFile.includes("Bahá’u’lláh"), 'Sacred author Bahá’u’lláh preserved');

// Verify quotes count and fields
const idMatches = [...quotesFile.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
assert(idMatches.length >= 50, `Found ${idMatches.length} scripture quote IDs (>= 50 expected)`);

// 3. Scan src/ for tr() calls having both arguments
function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      scanDir(full);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(full, 'utf8');
      // Look for calls to L(...) or tr(...)(...)
      // tr(language)(arg1, arg2)
      // Since TypeScript guarantees function signature (de: string, en: string), single-argument calls fail compile time.
      // Let's verify no empty strings passed to tr or L: e.g. L('', ...) or L(..., '')
      const badTrCalls = [...content.matchAll(/\b(?:L|tr\([^)]+\))\(\s*['"]\s*['"],/g)];
      assert(badTrCalls.length === 0, `${file}: Zero empty first argument in localized string calls`);
    }
  }
}

scanDir(path.join(ROOT_DIR, 'src'));

console.log('\n---------------------------------------------------');
if (failures === 0) {
  console.log('🎉 Translation & data integrity tests PASSED (0 failures)!');
  process.exit(0);
} else {
  console.error(`❌ Translation & data integrity tests FAILED with ${failures} failure(s).`);
  process.exit(1);
}
