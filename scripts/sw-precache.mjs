// Writes the list of built files into dist/sw.js so the installed app works offline from the start.
// The cache name gets a hash of that list, so each deploy replaces the old cache instead of growing it.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const dist = new URL('../dist/', import.meta.url);
// .woff is only the fallback for browsers without .woff2; every browser that runs the service worker has .woff2.
const assets = readdirSync(new URL('assets/', dist))
  .filter((f) => !f.endsWith('.woff') && !f.endsWith('.map'))
  .map((f) => `/assets/${f}`)
  .sort();
const icons = ['/icon-192.png', '/icon-512.png', '/manifest.webmanifest'];
const list = [...assets, ...icons];

const swUrl = new URL('sw.js', dist);
const sw = readFileSync(swUrl, 'utf8');
const hash = createHash('sha256').update(list.join('\n')).digest('hex').slice(0, 10);
const out = sw
  .replace('const PRECACHE = [];', `const PRECACHE = ${JSON.stringify(list)};`)
  .replace(/const CACHE = 'jy-hub-[^']*';/, `const CACHE = 'jy-hub-${hash}';`);
if (out === sw || !out.includes(hash)) throw new Error('sw-precache: placeholders not found in dist/sw.js');
writeFileSync(swUrl, out);

const bytes = assets.reduce((n, a) => n + readFileSync(new URL(`.${a}`, dist)).length, 0);
console.log(`sw-precache: ${list.length} files, ${(bytes / 1024 / 1024).toFixed(2)} MB`);
