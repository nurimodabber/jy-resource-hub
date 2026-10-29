/**
 * Security regression tests for api/sync.ts and api/submit.ts.
 *
 * Runs the real handlers in Node with GitHub, the Gist and Resend replaced by in-memory fakes,
 * then attacks them the way the pre-hardening code allowed (see AGENTS.md "Admin security").
 * Usage: npm run test:api
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'jy-api-test-'));

async function loadHandler(file) {
  const src = fs.readFileSync(path.join(root, file), 'utf8');
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const out = path.join(tmp, path.basename(file).replace(/\.ts$/, `.${crypto.randomUUID()}.mjs`));
  fs.writeFileSync(out, js);
  return (await import(pathToFileURL(out).href)).default;
}

// ---------------------------------------------------------------------------------------------
// Fakes
// ---------------------------------------------------------------------------------------------

const GITHUB_TOKEN = 'test-github-token';
const GIST = 'testgist';
const OWNER = 'owner@example.org';
const SETUP_TOKEN = 'setup-token-0123456789abcdef';

const legacyHash = (salt, pw) => crypto.createHash('sha256').update(`${salt}:${pw}`).digest('hex');
function oldEncrypt(state, secret) {
  const key = crypto.createHash('sha256').update(secret).digest();
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([c.update(JSON.stringify(state), 'utf8'), c.final()]);
  return JSON.stringify({ encrypted: true, v: 1, iv: iv.toString('hex'), tag: c.getAuthTag().toString('hex'), data: data.toString('base64') });
}

const fake = {
  gist: '',
  gistWrites: 0,
  issues: new Map(),
  comments: [],
  mails: [],
  createdIssues: [],
};

function resetFakes() {
  // State as the pre-hardening code left it: legacy sha256 hashes that were publicly readable.
  fake.gist = oldEncrypt(
    {
      version: 1,
      updatedAt: 1,
      accounts: [
        { id: 'acc_owner', username: OWNER, displayName: 'Owner', role: 'owner', isPrimaryOwner: true, salt: 'aa', passwordHash: legacyHash('aa', 'old-owner-pw'), createdAt: 1 },
        { id: 'acc_editor', username: 'editor@example.org', displayName: 'Ed', role: 'editor', salt: 'bb', passwordHash: legacyHash('bb', 'old-editor-pw'), createdAt: 2 },
      ],
      deletedAccountIds: [],
      revisions: [{ revisionId: 'rev_1', timestamp: 1, collection: 'games', entityId: 'g1', action: 'update', author: 'Ed', authorId: 'acc_editor', summary: 'x' }],
      proposals: [{ id: 'p1', type: 'spiel', title: 'T', summary: 'S', authorEmail: 'submitter@example.org', createdAt: 1, status: 'pending' }],
      accountRequests: [
        // Made before the hardening (client-side sha256); never exposed, so still approvable.
        { id: 'req_legacy', displayName: 'Lea', email: 'lea@example.org', message: '', salt: 'cc', passwordHash: legacyHash('cc', 'lea-password'), status: 'pending', createdAt: 3 },
      ],
    },
    GITHUB_TOKEN
  );
  fake.gistWrites = 0;
  fake.issues = new Map([
    [1, { number: 1, title: '[Spiel] Proposal', body: 'text\n\n```json\n{"title":{"de":"A"},"authorEmail":"leak@example.org"}\n```', labels: [{ name: 'vorschlag' }, { name: 'spiel' }], state: 'open', created_at: '2026-01-01T00:00:00Z', html_url: 'https://github.com/x/y/issues/1', user: { login: 'u' } }],
    [2, { number: 2, title: 'Bug: something', body: 'not a proposal', labels: [{ name: 'bug' }], state: 'open', created_at: '2026-01-01T00:00:00Z', html_url: 'https://github.com/x/y/issues/2', user: { login: 'u' } }],
  ]);
  fake.comments = [];
  fake.mails = [];
  fake.createdIssues = [];
}

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

globalThis.fetch = async (input, init = {}) => {
  const url = String(input);
  const method = (init.method || 'GET').toUpperCase();
  if (url.startsWith('https://gist.githubusercontent.com/')) return new Response(fake.gist, { status: 200 });
  if (url === `https://api.github.com/gists/${GIST}`) {
    if (method === 'PATCH') {
      fake.gist = JSON.parse(init.body).files['jy_admin_state.json'].content;
      fake.gistWrites++;
      return json({});
    }
    return json({ files: { 'jy_admin_state.json': { content: fake.gist } } });
  }
  if (url === 'https://api.resend.com/emails') {
    fake.mails.push(JSON.parse(init.body));
    return json({ id: 'm1' });
  }
  const m = /^https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+(\/issues(?:\/(\d+))?(\/comments)?)?(\?.*)?$/.exec(url);
  if (m) {
    const [, issuesPath, num, comments] = m;
    if (!issuesPath) return json({ permissions: { push: true } }, 200, { 'x-ratelimit-remaining': '4999' });
    if (comments) {
      fake.comments.push({ num: Number(num), body: JSON.parse(init.body).body });
      return json({});
    }
    if (num) {
      const issue = fake.issues.get(Number(num));
      if (!issue) return json({ message: 'Not Found' }, 404);
      if (method === 'PATCH') {
        const patch = JSON.parse(init.body);
        if (patch.labels) issue.labels = patch.labels.map((name) => ({ name }));
        if (patch.body) issue.body = patch.body;
        if (patch.state) issue.state = patch.state;
      }
      return json(issue);
    }
    if (method === 'POST') {
      const body = JSON.parse(init.body);
      const number = 100 + fake.createdIssues.length;
      const issue = { number, ...body, labels: body.labels.map((name) => ({ name })), state: 'open', created_at: new Date().toISOString(), html_url: `https://github.com/x/y/issues/${number}`, user: { login: 'bot' } };
      fake.createdIssues.push(issue);
      fake.issues.set(number, issue);
      return json(issue, 201);
    }
    return json(Array.from(fake.issues.values()));
  }
  throw new Error(`unexpected fetch ${method} ${url}`);
};

// ---------------------------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------------------------

function setEnv(overrides = {}) {
  Object.assign(process.env, {
    GITHUB_TOKEN,
    GITHUB_REPO: 'x/y',
    ADMIN_STATE_GIST_ID: GIST,
    OWNER_USERNAME: OWNER,
    ADMIN_SESSION_SECRET: 's'.repeat(40),
    ADMIN_SETUP_TOKEN: SETUP_TOKEN,
    RESEND_API_KEY: 'resend-key',
    ...overrides,
  });
  for (const [k, v] of Object.entries(overrides)) if (v === undefined) delete process.env[k];
}

async function call(handler, { method = 'POST', body, token, origin, ip = '1.2.3.4' } = {}) {
  const headers = { host: 'juju-hub.vercel.app', 'x-forwarded-for': ip };
  if (token) headers.authorization = `Bearer ${token}`;
  if (origin) headers.origin = origin;
  const req = { method, headers, body, socket: {}, url: '/api/sync' };
  let resolveDone;
  const done = new Promise((r) => (resolveDone = r));
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
      resolveDone();
    },
  };
  await handler(req, res);
  if (!res.writableEnded) await done;
  let data = null;
  try {
    data = res.body ? JSON.parse(res.body) : null;
  } catch {
    data = res.body;
  }
  return { status: res.statusCode, data, headers: res.headers };
}

let failures = 0;
let passes = 0;
function check(cond, msg) {
  if (cond) {
    passes++;
    console.log(`  ✅ ${msg}`);
  } else {
    failures++;
    console.error(`  ❌ ${msg}`);
  }
}
const noSecrets = (obj) => !/"(salt|passwordHash|hashAlgo|iterations)"/.test(JSON.stringify(obj));

// ---------------------------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------------------------

resetFakes();
setEnv();
let sync = await loadHandler('api/sync.ts');

console.log('\n— Unauthenticated access (the two critical holes)');
let r = await call(sync, { body: { action: 'sync_admin_state', accounts: [] } });
check(r.status === 401 && noSecrets(r.data), 'sync_admin_state without session → 401, no hashes');
r = await call(sync, {
  body: {
    action: 'sync_admin_state',
    accounts: [{ id: 'evil', username: OWNER, displayName: 'Nuri', role: 'owner', salt: 'x', passwordHash: legacyHash('x', 'attacker'), updatedAt: 9e15 }],
    deletedAccountIds: ['acc_owner'],
  },
});
check(r.status === 401 && fake.gistWrites === 0, 'owner takeover via injected account → 401, nothing written');
for (const action of ['accept', 'reject', 'delete']) {
  r = await call(sync, { body: { action, issueNumber: 1, updatedPayload: { title: 'defaced' } } });
  check(r.status === 401 && fake.issues.get(1).body.includes('"A"'), `${action} issue without session → 401, issue untouched`);
}
for (const action of ['list_account_requests', 'decide_account_request', 'create_account', 'update_account', 'reset_password', 'delete_account', 'list_proposals', 'system_status', 'change_password', 'session']) {
  r = await call(sync, { body: { action } });
  check(r.status === 401, `${action} without session → 401`);
}
r = await call(sync, { body: { action: 'sync_admin_state' }, token: 'forged.token' });
check(r.status === 401, 'forged token → 401');

console.log('\n— Cross-origin and configuration');
r = await call(sync, { body: { action: 'login', username: OWNER, password: 'x' }, origin: 'https://evil.example' });
check(r.status === 403, 'cross-origin POST → 403');
r = await call(sync, { method: 'OPTIONS' });
check(r.status === 405 && !r.headers['access-control-allow-origin'], 'no CORS preflight / wildcard');
setEnv({ ADMIN_SESSION_SECRET: 'short' });
r = await call(sync, { body: { action: 'login', username: OWNER, password: 'x' } });
check(r.status === 503 && r.data.code === 'not_configured', 'weak/missing session secret → fail closed (503)');
setEnv();

console.log('\n— Legacy (exposed) hashes are not accepted');
r = await call(sync, { body: { action: 'login', username: OWNER, password: 'old-owner-pw' } });
check(r.data.ok === false && r.data.code === 'reset_required', 'owner with exposed legacy hash → reset_required');
r = await call(sync, { body: { action: 'login', username: 'editor@example.org', password: 'old-editor-pw' } });
check(r.data.ok === false && r.data.code === 'reset_required', 'editor with exposed legacy hash → reset_required');
r = await call(sync, { body: { action: 'login', username: 'nobody@example.org', password: 'whatever1' } });
check(r.data.code === 'invalid', 'unknown user → generic invalid');

console.log('\n— Owner setup with the one-time token');
r = await call(sync, { body: { action: 'setup_owner', setupToken: 'wrong-token-0000000000', username: OWNER, password: 'new-owner-pw' } });
check(r.data.ok === false && r.data.code === 'invalid', 'wrong setup token → invalid');
r = await call(sync, { body: { action: 'setup_owner', setupToken: SETUP_TOKEN, username: 'nuri.someone@example.org', displayName: 'Nuri Modabber', password: 'new-owner-pw' } });
check(r.data.ok === false, 'right token but non-owner username (even with "Nuri" name) → refused');
r = await call(sync, { body: { action: 'setup_owner', setupToken: SETUP_TOKEN, username: OWNER, displayName: 'Owner', password: 'new-owner-pw' } });
check(r.data.ok === true && r.data.token && r.data.account.role === 'owner' && noSecrets(r.data), 'owner setup → owner session, no hashes in response');
const ownerToken = r.data.token;
setEnv({ ADMIN_SETUP_TOKEN: undefined });
r = await call(sync, { body: { action: 'setup_owner', setupToken: SETUP_TOKEN, username: OWNER, password: 'another-pw-1' } });
check(r.data.code === 'setup_disabled', 'setup disabled once ADMIN_SETUP_TOKEN is removed');

console.log('\n— Owner session');
r = await call(sync, { body: { action: 'sync_admin_state', revisions: [], proposals: [] }, token: ownerToken });
check(r.data.ok && noSecrets(r.data), 'sync returns state without any salt/hash');
check(r.data.state.accounts.find((a) => a.id === 'acc_editor')?.passwordResetRequired === true, 'exposed accounts are flagged "needs new password"');
check(r.data.pendingRequestCount === 1, 'owner sees pending request count');
r = await call(sync, { body: { action: 'list_account_requests' }, token: ownerToken });
check(r.data.ok && r.data.requests.length === 1 && noSecrets(r.data), 'owner lists requests without hashes');

console.log('\n— Access requests');
r = await call(sync, { body: { action: 'request_account', displayName: 'Nina', email: 'nina@example.org', password: 'nina-password', message: 'hi' }, ip: '5.5.5.5' });
check(r.data.ok === true, 'public access request accepted');
r = await call(sync, { body: { action: 'request_account', displayName: 'Xavier', email: OWNER, password: 'whatever12' }, ip: '5.5.5.6' });
check(r.data.code === 'reserved', 'request for the owner email → reserved');
r = await call(sync, { body: { action: 'list_account_requests' }, token: ownerToken });
const nina = r.data.requests.find((q) => q.email === 'nina@example.org');
r = await call(sync, { body: { action: 'decide_account_request', requestId: nina.id, decision: 'approve', role: 'owner' }, token: ownerToken });
check(r.data.ok && fake.mails.some((m) => m.to[0] === 'nina@example.org'), 'approve sends email; requested role "owner" is not grantable');
r = await call(sync, { body: { action: 'login', username: 'nina@example.org', password: 'nina-password' } });
check(r.data.ok && r.data.account.role === 'contributor', 'approved user logs in as contributor');
const ninaToken = r.data.token;
r = await call(sync, { body: { action: 'decide_account_request', requestId: 'req_legacy', decision: 'approve', role: 'editor' }, token: ownerToken });
check(r.data.ok, 'legacy (never exposed) request can be approved');
r = await call(sync, { body: { action: 'login', username: 'lea@example.org', password: 'lea-password' } });
check(r.data.ok && r.data.account.role === 'editor', 'legacy request account logs in (hash upgraded)');
const leaToken = r.data.token;

console.log('\n— Privilege boundaries');
r = await call(sync, { body: { action: 'create_account', username: 'x@example.org', displayName: 'X', password: 'password12' }, token: leaToken });
check(r.status === 403, 'editor cannot create accounts');
r = await call(sync, { body: { action: 'update_account', targetAccountId: 'acc_owner', role: 'viewer' }, token: leaToken });
check(r.status === 403, 'editor cannot change accounts');
r = await call(sync, { body: { action: 'delete', issueNumber: 1 }, token: leaToken });
check(r.status === 403, 'editor without delete right cannot delete catalog issues');
r = await call(sync, { body: { action: 'accept', issueNumber: 2 }, token: leaToken });
check(r.status === 403 && fake.issues.get(2).labels[0].name === 'bug', 'non-proposal issue cannot be touched');
r = await call(sync, { body: { action: 'accept', issueNumber: 1 }, token: ninaToken });
check(r.status === 403, 'contributor cannot publish');
r = await call(sync, { body: { action: 'list_proposals' }, token: ninaToken });
check(r.status === 403, 'contributor cannot list proposals');
r = await call(sync, { body: { action: 'sync_admin_state', proposals: [] }, token: ninaToken });
check(r.data.ok && !JSON.stringify(r.data.state.proposals).includes('submitter@example.org'), 'submitter emails hidden from non-reviewers');
r = await call(sync, { body: { action: 'accept', issueNumber: 1, updatedPayload: { title: { de: 'Edited' }, authorEmail: 'x@y.z' } }, token: leaToken });
check(r.data.ok && fake.issues.get(1).labels.some((l) => l.name === 'übernommen') && !fake.issues.get(1).body.includes('x@y.z'), 'editor accepts proposal; emails stripped from payload');
r = await call(sync, { body: { action: 'reject', issueNumber: 1, reason: 'hey @someone' }, token: leaToken });
check(fake.comments.at(-1).body.includes('@​someone'), '@mentions in reasons are neutralised');

console.log('\n— Revision log integrity');
r = await call(sync, {
  body: {
    action: 'sync_admin_state',
    revisions: [
      { revisionId: 'rev_new', timestamp: 5, collection: 'games', entityId: 'g2', action: 'create', author: 'Owner', authorId: 'acc_owner', authorUsername: OWNER, summary: 'spoof' },
      { revisionId: 'rev_1', author: 'Hacked', undoneByRevisionId: 'rev_x' },
    ],
  },
  token: ninaToken,
});
const revs = r.data.state.revisions;
check(revs.find((x) => x.revisionId === 'rev_new')?.authorId !== 'acc_owner', 'new revisions are stamped with the real author');
check(revs.find((x) => x.revisionId === 'rev_1')?.author === 'Ed' && !revs.find((x) => x.revisionId === 'rev_1')?.undoneByRevisionId, "others' revisions cannot be edited or undone without rights");

console.log('\n— Sessions end with password changes and suspension');
r = await call(sync, { body: { action: 'reset_password', targetAccountId: 'acc_editor', newPassword: 'fresh-editor-pw' }, token: ownerToken });
check(r.data.ok, 'owner resets an exposed account');
r = await call(sync, { body: { action: 'login', username: 'editor@example.org', password: 'fresh-editor-pw' } });
check(r.data.ok, 'reset account can log in');
const edToken = r.data.token;
await call(sync, { body: { action: 'reset_password', targetAccountId: 'acc_editor', newPassword: 'second-pw-123' }, token: ownerToken });
r = await call(sync, { body: { action: 'session' }, token: edToken });
check(r.status === 401, 'old session invalid after password reset');
const leaAccId = (await call(sync, { body: { action: 'session' }, token: leaToken })).data.account.id;
await call(sync, { body: { action: 'update_account', targetAccountId: leaAccId, status: 'suspended' }, token: ownerToken });
r = await call(sync, { body: { action: 'session' }, token: leaToken });
check(r.status === 401, 'suspended account session rejected');
r = await call(sync, { body: { action: 'change_password', currentPassword: 'wrong', newPassword: 'whatever12' }, token: ninaToken });
check(r.data.ok === false, 'change_password needs the current password');
r = await call(sync, { body: { action: 'delete_account', targetAccountId: 'acc_owner' }, token: ownerToken });
check(r.data.ok === false, 'owner account cannot be deleted');

console.log('\n— Storage safety');
const writesBefore = fake.gistWrites;
const savedGist = fake.gist;
setEnv({ GITHUB_TOKEN: 'different-token', ADMIN_STATE_KEY: undefined });
sync = await loadHandler('api/sync.ts'); // fresh module = empty cache
r = await call(sync, { body: { action: 'login', username: OWNER, password: 'new-owner-pw' } });
check(r.status === 503 && fake.gistWrites === writesBefore && fake.gist === savedGist, 'undecryptable state → 503, never overwritten');
setEnv({ ADMIN_STATE_KEY: GITHUB_TOKEN, GITHUB_TOKEN: 'rotated-token' });
sync = await loadHandler('api/sync.ts');
r = await call(sync, { body: { action: 'login', username: OWNER, password: 'new-owner-pw' } });
check(r.data.ok, 'ADMIN_STATE_KEY keeps the state readable after rotating GITHUB_TOKEN');
setEnv();

console.log('\n— Public GET');
sync = await loadHandler('api/sync.ts');
fake.issues.get(1).body = fake.issues.get(1).body.replace('"title"', '"authorEmail":"leak@example.org","title"');
r = await call(sync, { method: 'GET' });
check(r.data.ok && !JSON.stringify(r.data).includes('@example.org'), 'public catalog never serves emails');

console.log('\n— Submissions (api/submit.ts)');
const submit = await loadHandler('api/submit.ts');
r = await call(submit, {
  body: {
    type: 'spiel',
    title: 'Neues Spiel @someone',
    summary: 'Eine Zusammenfassung mit genug Text',
    steps: ['Eins', 'Zwei', 'Drei'],
    authorName: 'Ana',
    authorEmail: 'ana@example.org',
    setting: '<script>',
    clientTimestamp: Date.now() - 10000,
  },
  ip: '9.9.9.9',
});
const created = fake.createdIssues.at(-1);
check(r.data?.ok && created && !created.body.includes('ana@example.org') && !created.title.includes('@someone'), 'issue has no email and no live @mention');
check(/<!--\s*jy-contact:/.test(created.body), 'contact stored encrypted in the issue');
r = await call(sync, { body: { action: 'list_proposals' }, token: ownerToken });
const listed = r.data.issues.find((i) => i.number === created.number);
check(listed?.contactEmail === 'ana@example.org' && !listed.body.includes('jy-contact'), 'reviewers see the decrypted contact');
r = await call(submit, { body: { type: 'spiel' }, origin: 'https://evil.example' });
check(r.status === 403, 'cross-origin submission → 403');

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
