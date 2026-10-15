#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const issueArg = process.argv[2];

if (!issueArg) {
  console.error('Verwendung: node scripts/issue-to-data.mjs <issue-nummer|datei.json>');
  process.exit(1);
}

let jsonContent = null;

// Case 1: Argument is a JSON file on disk
if (fs.existsSync(issueArg)) {
  try {
    const raw = fs.readFileSync(issueArg, 'utf-8');
    jsonContent = JSON.parse(raw);
  } catch (err) {
    console.error('Fehler beim Lesen der JSON-Datei:', err.message);
    process.exit(1);
  }
} else {
  // Case 2: Fetch via GitHub CLI (gh issue view)
  try {
    console.log(`Lese GitHub-Issue #${issueArg} über gh CLI...`);
    const output = execSync(`gh issue view ${issueArg} --json body,title`, { encoding: 'utf-8' });
    const issue = JSON.parse(output);
    const body = issue.body || '';

    const match = body.match(/```json\s*([\s\S]*?)\s*```/);
    if (!match) {
      console.error('Kein ```json ... ``` Block im Issue gefunden.');
      process.exit(1);
    }
    jsonContent = JSON.parse(match[1]);
  } catch (err) {
    console.error('Fehler beim Abrufen des GitHub-Issues via `gh`:', err.message);
    console.error('Tipp: Du kannst das JSON auch in einer temporären Datei speichern und `node scripts/issue-to-data.mjs temp.json` ausführen.');
    process.exit(1);
  }
}

if (!jsonContent || !jsonContent.title || !jsonContent.kind) {
  console.error('Ungültiges Datenformat im JSON-Block.');
  process.exit(1);
}

const kind = jsonContent.kind;
const germanTitle = typeof jsonContent.title === 'string' ? jsonContent.title : jsonContent.title?.de || 'Neuer Eintrag';

// Generate clean kebab-case ID
const slug = germanTitle
  .toLowerCase()
  .replace(/ä/g, 'ae')
  .replace(/ö/g, 'oe')
  .replace(/ü/g, 'ue')
  .replace(/ß/g, 'ss')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 40);

const id = `${slug}-${Date.now().toString().slice(-4)}`;

console.log(`Verarbeite Vorschlag: "${germanTitle}" (Art: ${kind}, ID: ${id})`);

if (kind === 'spiel') {
  const filePath = path.resolve('src/data/games.ts');
  let content = fs.readFileSync(filePath, 'utf-8');

  const newGame = {
    id,
    title: {
      de: germanTitle,
      en: jsonContent.title?.en || germanTitle,
    },
    subtitle: jsonContent.subtitle ? {
      de: jsonContent.subtitle.de || jsonContent.subtitle,
      en: jsonContent.subtitle.en || '',
    } : undefined,
    category: jsonContent.category || 'cooperative',
    energyLevel: jsonContent.energyLevel || 'medium',
    purpose: jsonContent.purpose || 'zusammenarbeit',
    groupSize: {
      min: jsonContent.groupSize?.min || 4,
      max: jsonContent.groupSize?.max || 16,
    },
    prepLevel: 'instant',
    materials: {
      de: jsonContent.materials?.de || [],
      en: jsonContent.materials?.en || [],
    },
    durationMinutes: `${jsonContent.durationMin || 15}–${jsonContent.durationMax || 30} Min`,
    durationMin: jsonContent.durationMin || 15,
    durationMax: jsonContent.durationMax || 30,
    space: { de: 'Drinnen oder draußen', en: 'Indoor or outdoor' },
    summary: {
      de: jsonContent.summary?.de || jsonContent.summary || '',
      en: jsonContent.summary?.en || '',
    },
    idea: {
      de: jsonContent.summary?.de || jsonContent.summary || '',
      en: jsonContent.summary?.en || '',
    },
    rules: {
      de: jsonContent.steps?.de || jsonContent.steps || [],
      en: jsonContent.steps?.en || [],
    },
    animatorTips: {
      de: jsonContent.animatorTips?.de || (jsonContent.animatorTips ? [jsonContent.animatorTips] : []),
      en: jsonContent.animatorTips?.en || [],
    },
    status: 'draft',
    submittedBy: jsonContent.submittedBy || 'Animatoren',
  };

  const formattedObj = JSON.stringify(newGame, null, 2);
  const insertIndex = content.lastIndexOf('];');
  if (insertIndex === -1) {
    console.error('Konnte Array-Ende in games.ts nicht finden.');
    process.exit(1);
  }

  const trimmedBefore = content.slice(0, insertIndex).trimEnd();
  const needsComma = !trimmedBefore.endsWith(',');
  const updated = trimmedBefore + (needsComma ? ',\n  ' : '\n  ') + formattedObj + '\n];\n';
  fs.writeFileSync(filePath, updated, 'utf-8');
  console.log(`Erfolgreich als Entwurf zu src/data/games.ts hinzugefügt!`);
} else if (kind === 'dienst') {
  const filePath = path.resolve('src/data/serviceProjects.ts');
  let content = fs.readFileSync(filePath, 'utf-8');

  const newProject = {
    id,
    kind: 'dienst',
    title: {
      de: germanTitle,
      en: jsonContent.title?.en || germanTitle,
    },
    category: jsonContent.category || 'neighborhood',
    scope: jsonContent.scope || 'medium',
    duration: {
      de: `${jsonContent.durationMin || 45}–${jsonContent.durationMax || 90} Min`,
      en: `${jsonContent.durationMin || 45}–${jsonContent.durationMax || 90} min`,
    },
    durationMin: jsonContent.durationMin || 45,
    durationMax: jsonContent.durationMax || 90,
    groupSize: {
      min: jsonContent.groupSize?.min || 4,
      max: jsonContent.groupSize?.max || 16,
    },
    setting: jsonContent.setting || 'beides',
    occasion: jsonContent.occasion || 'beides',
    materials: {
      de: jsonContent.materials?.de || [],
      en: jsonContent.materials?.en || [],
    },
    objective: {
      de: jsonContent.objective?.de || jsonContent.summary?.de || '',
      en: jsonContent.objective?.en || '',
    },
    steps: {
      de: jsonContent.steps?.de || jsonContent.steps || [],
      en: jsonContent.steps?.en || [],
    },
    reflectionQuestions: {
      de: jsonContent.reflectionQuestions?.de || jsonContent.reflectionQuestions || [],
      en: jsonContent.reflectionQuestions?.en || [],
    },
    animatorTips: {
      de: jsonContent.animatorTips?.de || (jsonContent.animatorTips ? [jsonContent.animatorTips] : []),
      en: jsonContent.animatorTips?.en || [],
    },
    status: 'draft',
    submittedBy: jsonContent.submittedBy || 'Animatoren',
  };

  const formattedObj = JSON.stringify(newProject, null, 2);
  const insertIndex = content.lastIndexOf('];');
  if (insertIndex === -1) {
    console.error('Konnte Array-Ende in serviceProjects.ts nicht finden.');
    process.exit(1);
  }

  const trimmedBefore = content.slice(0, insertIndex).trimEnd();
  const needsComma = !trimmedBefore.endsWith(',');
  const updated = trimmedBefore + (needsComma ? ',\n  ' : '\n  ') + formattedObj + '\n];\n';
  fs.writeFileSync(filePath, updated, 'utf-8');
  console.log(`Erfolgreich als Entwurf zu src/data/serviceProjects.ts hinzugefügt!`);
} else if (kind === 'kunst') {
  const filePath = path.resolve('src/data/artsPrompts.ts');
  let content = fs.readFileSync(filePath, 'utf-8');

  const newArt = {
    id,
    kind: 'kunst',
    title: {
      de: germanTitle,
      en: jsonContent.title?.en || germanTitle,
    },
    book: {
      de: 'Freie Aktivität',
      en: 'General Activity',
    },
    artForm: jsonContent.artForm || 'visual_arts',
    duration: {
      de: `${jsonContent.durationMin || 30}–${jsonContent.durationMax || 60} Min`,
      en: `${jsonContent.durationMin || 30}–${jsonContent.durationMax || 60} min`,
    },
    durationMin: jsonContent.durationMin || 30,
    durationMax: jsonContent.durationMax || 60,
    groupSize: {
      min: jsonContent.groupSize?.min || 4,
      max: jsonContent.groupSize?.max || 16,
    },
    setting: jsonContent.setting || 'drinnen',
    occasion: jsonContent.occasion || 'beides',
    theme: {
      de: germanTitle,
      en: germanTitle,
    },
    description: {
      de: jsonContent.summary?.de || jsonContent.summary || '',
      en: jsonContent.summary?.en || '',
    },
    materials: {
      de: jsonContent.materials?.de || [],
      en: jsonContent.materials?.en || [],
    },
    guidingSteps: {
      de: jsonContent.steps?.de || jsonContent.steps || [],
      en: jsonContent.steps?.en || [],
    },
    reflectionPrompts: {
      de: jsonContent.reflectionQuestions?.de || jsonContent.reflectionQuestions || [],
      en: jsonContent.reflectionQuestions?.en || [],
    },
    status: 'draft',
    submittedBy: jsonContent.submittedBy || 'Animatoren',
  };

  const formattedObj = JSON.stringify(newArt, null, 2);
  const insertIndex = content.lastIndexOf('];');
  if (insertIndex === -1) {
    console.error('Konnte Array-Ende in artsPrompts.ts nicht finden.');
    process.exit(1);
  }

  const trimmedBefore = content.slice(0, insertIndex).trimEnd();
  const needsComma = !trimmedBefore.endsWith(',');
  const updated = trimmedBefore + (needsComma ? ',\n  ' : '\n  ') + formattedObj + '\n];\n';
  fs.writeFileSync(filePath, updated, 'utf-8');
  console.log(`Erfolgreich als Entwurf zu src/data/artsPrompts.ts hinzugefügt!`);
}

console.log(`\nNächste Schritte:`);
console.log(`1. Führe 'npm run check' aus, um Typsicherheit zu bestätigen.`);
console.log(`2. Prüfe den neuen Eintrag im Browser.`);
console.log(`3. Öffne einen Git-Branch und Pull Request zur Freigabe.`);
