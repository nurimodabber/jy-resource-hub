/**
 * Local full preview with test data: `npm run dev:vorschau`.
 *
 * Runs the real handlers in api/sync.ts and api/submit.ts on localhost, but GitHub (issues, the
 * admin Gist) and Resend are simulated in memory. Nothing touches real accounts or public GitHub
 * issues, and everything resets when the dev server restarts. Only active in `vite` dev mode with
 * JY_MOCK_API=1; never part of a build or a Vercel deployment.
 *
 * Test accounts (local only, made up for this preview):
 *   Inhaber:   inhaber@test.local   / Vorschau-Inhaber-2026
 *   Redaktion: redaktion@test.local / Vorschau-Redaktion-2026
 */
import crypto from 'node:crypto';

export const MOCK_ACCOUNTS = {
  owner: { username: 'inhaber@test.local', password: 'Vorschau-Inhaber-2026', displayName: 'Inhaber (Test)' },
  editor: { username: 'redaktion@test.local', password: 'Vorschau-Redaktion-2026', displayName: 'Redaktion (Test)' },
};

const REPO = 'vorschau/juju-hub';
const GIST = 'vorschau-gist';
const SETUP_TOKEN = 'vorschau-setup-token-0123456789';

const state = { gist: '', issues: new Map(), comments: [], nextNumber: 1004 };

const draftBlock = (draft) => '```json\n' + JSON.stringify(draft, null, 2) + '\n```';
function seedIssue(number, kind, title, summary, steps, labels, open = true) {
  const kindLabel = kind === 'spiel' ? 'Spiel' : kind === 'dienst' ? 'Dienst' : 'Kunst';
  const draft = {
    kind,
    status: 'draft',
    submittedBy: 'Beispiel-Animatorin',
    submittedAt: new Date().toISOString(),
    title: { de: title, en: '' },
    summary: { de: summary, en: '' },
    groupSize: { min: 6, max: 20 },
    durationMin: 10,
    durationMax: 20,
    materials: { de: ['Wäscheklammern'], en: [] },
    steps: { de: steps, en: [] },
    source: 'Beispiel für die lokale Vorschau',
  };
  state.issues.set(number, {
    number,
    title: `[${kindLabel}] ${title}`,
    body: `### Neuer Vorschlag: ${title}\n\n**Art:** ${kindLabel}\n**Eingereicht von:** Beispiel-Animatorin\n\n#### Zusammenfassung\n${summary}\n\n#### Ablauf\n${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n---\n\n${draftBlock(draft)}`,
    labels: labels.map((name) => ({ name })),
    state: open ? 'open' : 'closed',
    created_at: new Date(Date.now() - (1010 - number) * 86_400_000).toISOString(),
    closed_at: open ? null : new Date().toISOString(),
    html_url: `https://github.com/${REPO}/issues/${number}`,
    user: { login: 'vorschau-bot', avatar_url: '', html_url: 'https://github.com/vorschau-bot' },
  });
}

seedIssue(1001, 'spiel', 'Wäscheklammer-Jagd', 'Alle tragen Klammern am Rücken und versuchen, die der anderen zu sammeln.', ['Klammern verteilen', 'Spielfeld abstecken', 'Auf ein Zeichen starten'], ['vorschlag', 'spiel']);
seedIssue(1002, 'dienst', 'Nachbarschafts-Picknick', 'Die Gruppe lädt Nachbarn zu einem einfachen Picknick ein und kommt ins Gespräch.', ['Ort und Datum wählen', 'Einladungen verteilen', 'Picknick vorbereiten'], ['vorschlag', 'dienst']);
seedIssue(1003, 'spiel', 'Echo-Kreis', 'Eine Person gibt einen Rhythmus vor, der Kreis antwortet als Echo.', ['Kreis bilden', 'Rhythmus klatschen', 'Rolle weitergeben'], ['übernommen', 'spiel'], false);

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

function handleGitHub(url, method, init) {
  if (url.startsWith('https://gist.githubusercontent.com/')) return new Response(state.gist, { status: 200 });
  if (url === `https://api.github.com/gists/${GIST}`) {
    if (method === 'PATCH') {
      state.gist = JSON.parse(init.body).files['jy_admin_state.json'].content;
      return json({});
    }
    return json({ files: { 'jy_admin_state.json': { content: state.gist } } });
  }
  if (url === 'https://api.resend.com/emails') {
    const mail = JSON.parse(init.body);
    console.log(`[vorschau] E-Mail (nicht gesendet) an ${mail.to}: ${mail.subject}`);
    return json({ id: 'vorschau' });
  }
  const m = new RegExp(`^https://api\\.github\\.com/repos/${REPO}(/issues(?:/(\\d+))?(/comments)?)?(\\?.*)?$`).exec(url);
  if (!m) return null;
  const [, issuesPath, num, comments, query] = m;
  if (!issuesPath) return json({ permissions: { push: true } }, 200, { 'x-ratelimit-remaining': '4999' });
  if (comments) {
    const body = JSON.parse(init.body).body;
    state.comments.push({ num: Number(num), body });
    console.log(`[vorschau] Kommentar an #${num}: ${body}`);
    return json({});
  }
  if (num) {
    const issue = state.issues.get(Number(num));
    if (!issue) return json({ message: 'Not Found' }, 404);
    if (method === 'PATCH') {
      const patch = JSON.parse(init.body);
      if (patch.labels) issue.labels = patch.labels.map((name) => ({ name }));
      if (typeof patch.body === 'string') issue.body = patch.body;
      if (patch.title) issue.title = patch.title;
      if (patch.state) {
        issue.state = patch.state;
        issue.closed_at = patch.state === 'closed' ? new Date().toISOString() : null;
      }
    }
    return json(issue);
  }
  if (method === 'POST') {
    const body = JSON.parse(init.body);
    const number = state.nextNumber++;
    const issue = {
      number,
      title: body.title,
      body: body.body,
      labels: (body.labels || []).map((name) => ({ name })),
      state: 'open',
      created_at: new Date().toISOString(),
      closed_at: null,
      html_url: `https://github.com/${REPO}/issues/${number}`,
      user: { login: 'vorschau-bot', avatar_url: '', html_url: 'https://github.com/vorschau-bot' },
    };
    state.issues.set(number, issue);
    console.log(`[vorschau] Neuer Vorschlag #${number}: ${body.title}`);
    return json(issue, 201);
  }
  const q = new URLSearchParams((query || '').slice(1));
  const perPage = Number(q.get('per_page') || 30);
  const page = Number(q.get('page') || 1);
  let list = [...state.issues.values()].sort((a, b) => b.number - a.number);
  if (q.get('state') === 'open') list = list.filter((i) => i.state === 'open');
  return json(list.slice((page - 1) * perPage, page * perPage));
}

let ready = null;

/** Sets test configuration, routes GitHub/Resend calls to memory, creates the test accounts once. */
export function installMockGitHub(syncHandler) {
  Object.assign(process.env, {
    GITHUB_TOKEN: 'vorschau-token-nicht-echt',
    GITHUB_REPO: REPO,
    ADMIN_STATE_GIST_ID: GIST,
    ADMIN_STATE_GIST_OWNER: 'vorschau',
    ADMIN_STATE_KEY: 'vorschau-schluessel-nur-lokal',
    OWNER_USERNAME: MOCK_ACCOUNTS.owner.username,
    ADMIN_SESSION_SECRET: crypto.randomBytes(32).toString('hex'),
    ADMIN_SETUP_TOKEN: SETUP_TOKEN,
    RESEND_API_KEY: 'vorschau',
    SITE_URL: 'http://localhost:3000',
  });
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (input, init = {}) => {
    const url = String(input instanceof Request ? input.url : input);
    const method = (init.method || 'GET').toUpperCase();
    if (/^https:\/\/(api\.github\.com|gist\.githubusercontent\.com|api\.resend\.com)\//.test(url)) {
      const res = handleGitHub(url, method, init);
      if (res) return res;
      return json({ message: `Vorschau: ${method} ${url} ist nicht nachgebaut` }, 404);
    }
    return realFetch(input, init);
  };
  ready ??= seedAccounts(syncHandler);
  return ready;
}

async function callSync(syncHandler, body, token) {
  let resolve;
  const done = new Promise((r) => (resolve = r));
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
      resolve();
    },
  };
  const headers = { host: 'localhost:3000' };
  if (token) headers.cookie = `jy_admin_session=${token}`;
  await syncHandler({ method: 'POST', headers, body, socket: {}, url: '/api/sync' }, res);
  if (!res.writableEnded) await done;
  const data = JSON.parse(res.body || '{}');
  // The session comes back only as httpOnly cookie.
  data.token = String(res.headers['set-cookie'] || '').match(/^jy_admin_session=([^;]*)/)?.[1];
  return data;
}

async function seedAccounts(syncHandler) {
  const owner = await callSync(syncHandler, {
    action: 'setup_owner',
    setupToken: SETUP_TOKEN,
    username: MOCK_ACCOUNTS.owner.username,
    displayName: MOCK_ACCOUNTS.owner.displayName,
    password: MOCK_ACCOUNTS.owner.password,
  });
  if (owner.token) {
    await callSync(
      syncHandler,
      {
        action: 'create_account',
        username: MOCK_ACCOUNTS.editor.username,
        displayName: MOCK_ACCOUNTS.editor.displayName,
        password: MOCK_ACCOUNTS.editor.password,
        role: 'editor',
      },
      owner.token
    );
  }
  // Disable owner setup again, as in production after the first setup.
  delete process.env.ADMIN_SETUP_TOKEN;
  console.log('\n[vorschau] Lokale Vorschau mit Testdaten aktiv. Nichts wird an GitHub gesendet.');
  console.log(`[vorschau] Inhaber:   ${MOCK_ACCOUNTS.owner.username}`);
  console.log(`[vorschau] Redaktion: ${MOCK_ACCOUNTS.editor.username}`);
  console.log('[vorschau] Passwörter: siehe scripts/dev-mock-github.mjs (oben)\n');
}
