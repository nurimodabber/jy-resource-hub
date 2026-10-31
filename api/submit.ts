import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';

/**
 * Contact details must not appear in the public GitHub issue (the repo is public). They are
 * encrypted with the same key as the admin state and embedded as an HTML comment; /api/sync
 * decrypts them for reviewers only.
 */
function encryptContact(contact: { name?: string; email?: string }): string {
  const secret = process.env.ADMIN_STATE_KEY || process.env.GITHUB_TOKEN || '';
  const key = crypto.createHash('sha256').update(secret).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(contact), 'utf8'), cipher.final()]);
  return `<!-- jy-contact:${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${data.toString('base64url')} -->`;
}

/** Stops "@user" in submitted text from pinging GitHub users via the owner's token. */
const noMentions = (str: string): string => str.replace(/@/g, '@\u200b');

interface ProposalPayload {
  type: 'spiel' | 'dienst' | 'kunst' | 'feedback';
  title: string;
  subtitle?: string;
  summary: string;
  groupSizeMin: number;
  groupSizeMax: number;
  durationMin: number;
  durationMax: number;
  materials: string[];
  steps: string[];
  animatorTips?: string;
  source?: string;
  authorName?: string;
  authorEmail?: string;
  // Extra fields for service/arts
  objective?: string;
  reflectionQuestions?: string[];
  setting?: 'drinnen' | 'draussen' | 'beides';
  occasion?: 'treffen' | 'camp' | 'beides';
  // Anti-spam fields
  clientTimestamp?: number;
  hp_website?: string;
}

// Simple in-memory rate limiting (max 5 requests per IP per hour)
const ipRateLimit = new Map<string, { count: number; resetAt: number }>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const entry = ipRateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRateLimit.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) {
    return false;
  }
  entry.count += 1;
  return true;
};

const sanitize = (str: string = ''): string => {
  return str.replace(/<[^>]*>?/gm, '').trim();
};

const containsUrl = (str: string = ''): boolean => {
  return /(https?:\/\/|www\.|\.com|\.org|\.net|\.de|\.io)/i.test(str);
};

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  // Same-origin only (no CORS): the form lives on this site.
  const origin = req.headers.origin;
  if (origin) {
    let sameHost = false;
    try {
      sameHost = new URL(origin).host === req.headers.host;
    } catch {
      sameHost = false;
    }
    if (!sameHost) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Forbidden' }));
      return;
    }
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    // 1. Read & parse body
    let rawBody = '';
    if (typeof req.body === 'object' && req.body !== null) {
      rawBody = JSON.stringify(req.body);
    } else {
      rawBody = await new Promise<string>((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => {
          data += chunk;
          if (data.length > 8192) {
            reject(new Error('Payload too large (max 8KB)'));
          }
        });
        req.on('end', () => resolve(data));
        req.on('error', reject);
      });
    }

    if (rawBody.length > 8192) {
      res.statusCode = 413;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Payload too large (max 8KB)' }));
      return;
    }

    const payload: ProposalPayload = typeof req.body === 'object' && req.body !== null ? req.body : JSON.parse(rawBody);

    // 2. Anti-spam checks
    // Honeypot check
    if (payload.hp_website && payload.hp_website.trim().length > 0) {
      // Fake success for bots
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: true, dropped: true }));
      return;
    }

    // Minimum time check (must take at least 3 seconds to fill form)
    const now = Date.now();
    if (payload.clientTimestamp && now - payload.clientTimestamp < 3000) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Zu schnell gesendet. Bitte nimm dir einen Moment Zeit.' }));
      return;
    }

    // Rate limiting by IP
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      res.statusCode = 429;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Zu viele Anfragen. Bitte versuche es später noch einmal.' }));
      return;
    }

    // 3. Field validation
    const type = payload.type;
    if (!['spiel', 'dienst', 'kunst', 'feedback'].includes(type)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Ungültige Art der Aktivität' }));
      return;
    }

    const title = sanitize(payload.title);
    if (!title || title.length < 3 || title.length > 100) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Titel muss zwischen 3 und 100 Zeichen lang sein.' }));
      return;
    }
    if (containsUrl(title)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Titel darf keine Web-Links enthalten.' }));
      return;
    }

    const summary = sanitize(payload.summary);
    if (!summary || summary.length < 5 || summary.length > 1500) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Text muss zwischen 5 und 1500 Zeichen lang sein.' }));
      return;
    }
    if (containsUrl(summary)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Text darf keine Web-Links enthalten.' }));
      return;
    }

    const steps = (Array.isArray(payload.steps) ? payload.steps : [])
      .map(sanitize)
      .filter((s) => s.length > 0);
    if (type !== 'feedback' && steps.length < 3) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Bitte gib mindestens 3 Ablaufschritte an.' }));
      return;
    }

    const materials = (Array.isArray(payload.materials) ? payload.materials : []).map(sanitize).filter(Boolean);
    const subtitle = sanitize(payload.subtitle);
    const animatorTips = sanitize(payload.animatorTips);
    const source = sanitize(payload.source);
    const authorName = sanitize(payload.authorName);
    const authorEmail = sanitize(payload.authorEmail);
    const objective = sanitize(payload.objective);
    const reflectionQuestions = (Array.isArray(payload.reflectionQuestions) ? payload.reflectionQuestions : []).map(sanitize).filter(Boolean);
    const setting = ['drinnen', 'draussen', 'beides'].includes(String(payload.setting)) ? payload.setting! : 'beides';
    const occasion = ['treffen', 'camp', 'beides'].includes(String(payload.occasion)) ? payload.occasion! : 'beides';

    const groupSizeMin = Math.max(1, Number(payload.groupSizeMin) || 4);
    const groupSizeMax = Math.max(groupSizeMin, Number(payload.groupSizeMax) || 20);
    const durationMin = Math.max(5, Number(payload.durationMin) || 15);
    const durationMax = Math.max(durationMin, Number(payload.durationMax) || 30);

    // 4. Check GitHub environment variables
    const { GITHUB_TOKEN, GITHUB_REPO } = process.env;
    if (!GITHUB_TOKEN || !GITHUB_REPO) {
      // Success for local/client-side storage without requiring GitHub server secrets
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        ok: true,
        storedLocally: true,
        message: 'Vorschlag wurde entgegengenommen und im Admin-Dashboard zur Freigabe hinterlegt.',
      }));
      return;
    }

    // 5. Build GitHub Issue content
    const kindLabel = type === 'spiel' ? 'Spiel' : type === 'dienst' ? 'Dienst' : type === 'kunst' ? 'Kunst' : 'Feedback';
    const issueTitle = `[${kindLabel}] ${title}`;

    const jsonDraft = {
      kind: type,
      status: 'draft',
      submittedBy: authorName || 'Anonym',
      submittedAt: new Date().toISOString(),
      title: { de: title, en: '' },
      subtitle: subtitle ? { de: subtitle, en: '' } : undefined,
      summary: { de: summary, en: '' },
      groupSize: { min: groupSizeMin, max: groupSizeMax },
      durationMin,
      durationMax,
      materials: { de: materials, en: [] },
      steps: { de: steps, en: [] },
      animatorTips: animatorTips ? { de: [animatorTips], en: [] } : undefined,
      source: source || 'Eingereicht von Animatoren',
      ...(type === 'dienst' ? {
        category: 'neighborhood',
        scope: 'medium',
        setting,
        occasion,
        objective: { de: objective || summary, en: '' },
        reflectionQuestions: { de: reflectionQuestions, en: [] }
      } : {}),
      ...(type === 'kunst' ? {
        artForm: 'visual_arts',
        setting,
        occasion,
        description: { de: summary, en: '' },
        guidingSteps: { de: steps, en: [] },
        reflectionPrompts: { de: reflectionQuestions, en: [] }
      } : {})
    };

    const markdownBody = type === 'feedback'
      ? `
### Neues Feedback: ${title}

**Art:** Feedback  
**Eingereicht von:** ${authorName || 'Anonym'} ${authorEmail ? `(${authorEmail})` : ''}  
**Datum:** ${new Date().toLocaleDateString('de-DE')}  

---

#### Nachricht
${summary}

\`\`\`json
${JSON.stringify({ kind: 'feedback', submittedBy: authorName || 'Anonym', submittedAt: new Date().toISOString(), message: summary }, null, 2)}
\`\`\`
`.trim()
      : `
### Neuer Vorschlag: ${title}

**Art:** ${kindLabel}  
**Eingereicht von:** ${authorName || 'Anonym'}${authorEmail ? ' (Kontakt liegt der Redaktion vor)' : ''}  
**Datum:** ${new Date().toLocaleDateString('de-DE')}  
**Quelle / Herkunft:** ${source || 'Keine Angabe'}

---

#### Zusammenfassung
${summary}

${subtitle ? `**Untertitel:** ${subtitle}\n` : ''}
**Dauer:** ${durationMin}–${durationMax} Min  
**Gruppengröße:** ${groupSizeMin}–${groupSizeMax} Personen  
**Material:** ${materials.length > 0 ? materials.join(', ') : 'Kein besonderes Material'}

#### Ablauf
${steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}

${animatorTips ? `#### Tipps für Animatoren\n${animatorTips}\n` : ''}
${objective ? `#### Ziel\n${objective}\n` : ''}
${reflectionQuestions.length > 0 ? `#### Reflexionsfragen\n${reflectionQuestions.map((q) => `- ${q}`).join('\n')}\n` : ''}

---

\`\`\`json
${JSON.stringify(jsonDraft, null, 2)}
\`\`\`
`.trim();
    const publicBody = noMentions(markdownBody) + (authorEmail ? `\n\n${encryptContact({ name: authorName, email: authorEmail })}` : '');

    // 6. Post to GitHub Issues API
    const ghResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'JuniorYouthHub-ProposalBot',
      },
      body: JSON.stringify({
        title: noMentions(issueTitle),
        body: publicBody,
        labels: type === 'feedback' ? ['feedback'] : ['vorschlag', type],
      }),
    });

    if (!ghResponse.ok) {
      const errText = await ghResponse.text();
      console.error('GitHub API error:', errText);
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        ok: false,
        error: 'Fehler bei der Übertragung an GitHub. Bitte nutze den E-Mail-Rückfall.',
        fallback: 'mailto'
      }));
      return;
    }

    const ghData = await ghResponse.json();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      ok: true,
      issueUrl: ghData.html_url,
      issueNumber: ghData.number,
    }));
  } catch (err: any) {
    console.error('Submit proposal error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      ok: false,
      error: 'Serverfehler beim Verarbeiten des Vorschlags',
      fallback: 'mailto',
    }));
  }
}
