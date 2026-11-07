/**
 * Load and failure tests for api/sync.ts and api/submit.ts.
 *
 * Runs the real handlers in Node against a simulated GitHub that can be slowed down, made to fail
 * or to hang. Checks what tests/api-security.mjs does not: concurrent admin saves lose nothing,
 * the public catalogue is cacheable, a hanging GitHub never hangs a request, and a shared IP
 * (school Wi-Fi, mobile carrier) does not block ordinary use.
 * Usage: node tests/api-resilience.mjs (part of npm run test:api)
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'jy-api-resilience-'));

async function loadHandler(file) {
  const src = fs.readFileSync(path.join(root, file), 'utf8');
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const out = path.join(tmp, path.basename(file).replace(/\.ts$/, `.${crypto.randomUUID()}.mjs`));
  fs.writeFileSync(out, js);
  return (await import(pathToFileURL(out).href)).default;
}

const GITHUB_TOKEN = 'test-github-token';
const GIST = 'testgist';
const OWNER = 'owner@example.org';
const SETUP_TOKEN = 'setup-token-0123456789abcdef';
Object.assign(process.env, {
  GITHUB_TOKEN,
  GITHUB_REPO: 'x/y',
  ADMIN_STATE_GIST_ID: GIST,
  OWNER_USERNAME: OWNER,
  ADMIN_SESSION_SECRET: 's'.repeat(40),
  ADMIN_SETUP_TOKEN: SETUP_TOKEN,
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fake = {
  gist: '',
  latency: 0, // ms per GitHub call, with jitter, so concurrent requests interleave
  gistWrite409Once: false,
  issuesMode: 'ok', // ok | hang | fail
  createMode: 'ok', // ok | hang | fail
  issuesCalls: 0,
  created: 0,
};
const jitter = () => sleep(fake.latency ? fake.latency / 2 + Math.random() * fake.latency : 0);
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const hang = (init) =>
  new Promise((_, reject) => {
    // A real hung connection never answers; it only ends when the caller aborts.
    init?.signal?.addEventListener('abort', () => reject(init.signal.reason ?? new Error('aborted')));
  });

globalThis.fetch = async (input, init = {}) => {
  const url = String(input);
  const method = (init.method || 'GET').toUpperCase();
  if (url.startsWith('https://gist.githubusercontent.com/')) {
    await jitter();
    return new Response(fake.gist, { status: 200 });
  }
  if (url === `https://api.github.com/gists/${GIST}`) {
    await jitter();
    if (method === 'PATCH') {
      if (fake.gistWrite409Once) {
        fake.gistWrite409Once = false;
        return json({ message: 'Conflict' }, 409);
      }
      fake.gist = JSON.parse(init.body).files['jy_admin_state.json'].content;
      return json({});
    }
    return json({ files: { 'jy_admin_state.json': { content: fake.gist } } });
  }
  if (/^https:\/\/api\.github\.com\/repos\/x\/y\/issues\?/.test(url)) {
    fake.issuesCalls++;
    if (fake.issuesMode === 'hang') return hang(init);
    if (fake.issuesMode === 'fail') return json({ message: 'Server Error' }, 500);
    return json([]);
  }
  if (url === 'https://api.github.com/repos/x/y/issues' && method === 'POST') {
    if (fake.createMode === 'hang') return hang(init);
    if (fake.createMode === 'fail') return json({ message: 'Server Error' }, 500);
    fake.created++;
    return json({ number: 100 + fake.created, html_url: `https://github.com/x/y/issues/${100 + fake.created}` }, 201);
  }
  throw new Error(`unexpected fetch ${method} ${url}`);
};

async function call(handler, { method = 'POST', body, token, ip = '1.2.3.4' } = {}) {
  const headers = { host: 'juju-hub.vercel.app', 'x-forwarded-for': ip, 'x-real-ip': ip };
  if (token) headers.authorization = `Bearer ${token}`;
  const req = { method, headers, body, socket: {}, url: '/api/x' };
  let done;
  const finished = new Promise((r) => (done = r));
  const res = {
    statusCode: 200,
    headers: {},
    writableEnded: false,
    setHeader(k, v) {
      this.headers[k.toLowerCase()] = v;
    },
    end(data) {
      this.writableEnded = true;
      this.body = data;
      done();
    },
  };
  await handler(req, res);
  if (!res.writableEnded) await finished;
  let data = null;
  try {
    data = res.body ? JSON.parse(res.body) : null;
  } catch {
    data = res.body;
  }
  return { status: res.statusCode, data, headers: res.headers };
}

function decryptGist() {
  const p = JSON.parse(fake.gist);
  const d = crypto.createDecipheriv('aes-256-gcm', crypto.createHash('sha256').update(GITHUB_TOKEN).digest(), Buffer.from(p.iv, 'hex'));
  d.setAuthTag(Buffer.from(p.tag, 'hex'));
  return JSON.parse(Buffer.concat([d.update(Buffer.from(p.data, 'base64')), d.final()]).toString('utf8'));
}

let passes = 0;
let failures = 0;
function check(cond, msg) {
  if (cond) {
    passes++;
    console.log(`  ✅ ${msg}`);
  } else {
    failures++;
    console.error(`  ❌ ${msg}`);
  }
}

const sync = await loadHandler('api/sync.ts');
const submit = await loadHandler('api/submit.ts');

console.log('\n— Public catalogue is cacheable at the edge');
let r = await call(sync, { method: 'GET' });
check(r.status === 200 && /s-maxage=\d+/.test(String(r.headers['cache-control'])), `GET /api/sync can be cached by the CDN (got "${r.headers['cache-control']}")`);
fake.issuesMode = 'fail';
r = await call(sync, { method: 'GET' });
check(r.data?.ok === false && !/s-maxage/.test(String(r.headers['cache-control'])), 'an upstream error is not cached');
fake.issuesMode = 'ok';

console.log('\n— Concurrent admin saves lose nothing');
r = await call(sync, { body: { action: 'setup_owner', setupToken: SETUP_TOKEN, username: OWNER, displayName: 'Owner', password: 'owner-password-1' } });
const token = r.data.token;
check(Boolean(token), 'owner session for the load test');
fake.latency = 40;
for (const parallel of [3, 12]) {
  const ids = Array.from({ length: parallel }, (_, i) => `rev_load_${parallel}_${i}`);
  const results = await Promise.all(
    ids.map((id) =>
      call(sync, { token, body: { action: 'sync_admin_state', revisions: [{ revisionId: id, collection: 'games', entityId: 'g', action: 'update', summary: id }], proposals: [] } })
    )
  );
  const stored = new Set(decryptGist().revisions.map((x) => x.revisionId));
  const okIds = ids.filter((_, i) => results[i].data?.ok);
  const lost = okIds.filter((id) => !stored.has(id));
  const answered = results.every((x) => x.data?.ok || x.status === 409);
  check(lost.length === 0, `${parallel} parallel saves: no confirmed save is lost (${okIds.length} ok, ${lost.length} lost)`);
  check(answered, `${parallel} parallel saves: every request gets ok or a clear 409, never a silent failure`);
  if (parallel === 3) check(okIds.length === 3, '3 parallel saves (a realistic team) all succeed');
}
fake.gistWrite409Once = true;
r = await call(sync, { token, body: { action: 'sync_admin_state', revisions: [{ revisionId: 'rev_after_409', collection: 'games', entityId: 'g', action: 'update', summary: 'x' }], proposals: [] } });
check(r.data?.ok && decryptGist().revisions.some((x) => x.revisionId === 'rev_after_409'), 'GitHub answering 409 to a Gist write is retried, not a 503');
fake.latency = 0;

console.log('\n— A hanging GitHub never hangs a request');
// AbortSignal.timeout uses an unref'd timer; a server keeps the event loop alive, this script must.
const keepAlive = setInterval(() => {}, 1000);
fake.issuesMode = 'hang';
let t0 = Date.now();
r = await call(sync, { method: 'GET' });
check(r.data?.ok === false && Date.now() - t0 < 10_000, `public catalogue answers despite a hanging GitHub (${Date.now() - t0} ms)`);
fake.issuesMode = 'ok';
fake.createMode = 'hang';
const valid = (ip) => ({
  body: { type: 'spiel', title: 'Kreis bilden', summary: 'Alle stehen im Kreis und warten.', steps: ['Eins', 'Zwei', 'Drei'], clientTimestamp: Date.now() - 10_000 },
  ip,
});
t0 = Date.now();
r = await call(submit, valid('9.0.0.1'));
check(r.status >= 500 && r.data?.fallback === 'mailto' && Date.now() - t0 < 10_000, `submission answers with the e-mail fallback despite a hanging GitHub (${Date.now() - t0} ms)`);
fake.createMode = 'fail';
r = await call(submit, valid('9.0.0.2'));
check(r.status === 502 && r.data?.fallback === 'mailto', 'GitHub error on submission → 502 with e-mail fallback');
fake.createMode = 'ok';
clearInterval(keepAlive);

console.log('\n— Shared IP (school Wi-Fi, mobile carrier)');
let accepted = 0;
for (let i = 0; i < 12; i++) if ((await call(submit, valid('100.64.0.1'))).data?.ok) accepted++;
check(accepted >= 10, `12 people behind one IP can submit within an hour (${accepted} accepted; the Vercel firewall separately allows 5 per minute)`);

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
