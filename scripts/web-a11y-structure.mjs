/**
 * Extracts the page structure screen-reader users navigate by — landmarks,
 * heading outline, links and form fields — from the running web app, so the
 * accessibility documentation describes what the app actually renders.
 *
 *   npm run dev -- --port 5180      # terminal 1
 *   npm run a11y:structure          # terminal 2 → docs/web/accessibility/structure.md
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '../docs/web/accessibility/structure.md');
const base = (process.env.WEB_URL ?? 'http://localhost:5180').replace(/\/$/, '');
const user = { id: 'u', name: 'Margaret Whitfield', email: 'margaret@example.com' };

const pages = [
  ['Landing', '/', null],
  ['Sign in', '/signin', null],
  ['Sign up', '/signup', null],
  ['Role chooser', '/role', 'none'],
  ['Today (patient home)', '/app', 'patient'],
  ['My Day', '/app/schedule', 'patient'],
  ['Appointments', '/app/appointments', 'patient'],
  ['Medicines', '/app/medications', 'patient'],
  ['Memories', '/app/memories', 'patient'],
  ['Contacts', '/app/contacts', 'patient'],
  ['Caregiver dashboard', '/app', 'caregiver'],
  ['Manage medications', '/app/manage-medications', 'caregiver'],
  ['Manage appointments', '/app/manage-appointments', 'caregiver'],
  ['Activity log', '/app/activity', 'caregiver'],
  ['Caregiver notes', '/app/caregiver', 'caregiver'],
];

function extract() {
  const name = (el) => {
    const labelled = el.getAttribute('aria-labelledby');
    if (labelled) return labelled.split(' ').map((id) => document.getElementById(id)?.textContent?.trim()).join(' ');
    return el.getAttribute('aria-label') ?? '';
  };
  const visible = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  const clean = (s) => (s ?? '').replace(/\s+/g, ' ').trim();
  const landmarkOf = (el) => {
    const tag = el.tagName.toLowerCase();
    const role = el.getAttribute('role');
    if (role) return role;
    if (tag === 'header') return el.closest('main, article, aside, nav, section') ? null : 'banner';
    if (tag === 'footer') return el.closest('main, article, aside, nav, section') ? null : 'contentinfo';
    if (tag === 'aside') return 'complementary';
    if (tag === 'section' && name(el)) return 'region';
    return { nav: 'navigation', main: 'main', form: name(el) ? 'form' : null }[tag] ?? null;
  };
  const landmarks = [...document.querySelectorAll('header, nav, main, footer, aside, section, form, [role]')]
    .map((el) => ({ el, role: landmarkOf(el) }))
    .filter((x) => ['banner', 'navigation', 'main', 'contentinfo', 'complementary', 'region', 'form', 'search', 'dialog'].includes(x.role))
    .map(({ el, role }) => ({
      role,
      tag: el.tagName.toLowerCase(),
      explicitRole: el.getAttribute('role') ?? '',
      name: clean(name(el)),
      shown: visible(el),
    }));
  const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')]
    .filter(visible)
    .map((h) => ({ level: Number(h.tagName[1]), text: clean(h.textContent) }));
  const links = [...document.querySelectorAll('a[href]')]
    .filter(visible)
    .map((a) => ({ text: clean(a.textContent), label: clean(a.getAttribute('aria-label')), href: a.getAttribute('href') }));
  const fields = [...document.querySelectorAll('input, textarea, select')]
    .filter((f) => f.type !== 'hidden' && visible(f))
    .map((f) => ({
      label: clean(f.labels?.[0]?.textContent ?? f.getAttribute('aria-label')),
      type: f.type,
      required: f.required || f.getAttribute('aria-required') === 'true',
      autocomplete: f.getAttribute('autocomplete') ?? '',
    }));
  const live = [...document.querySelectorAll('[aria-live], [role="status"], [role="alert"]')].map((el) => ({
    role: el.getAttribute('role') ?? '',
    live: el.getAttribute('aria-live') ?? '',
    text: clean(el.textContent).slice(0, 60),
  }));
  return { title: document.title, landmarks, headings, links, fields, live };
}

const browser = await chromium.launch();
const sections = [];
for (const [label, p, role] of pages) {
  const byWidth = {};
  for (const width of [375, 820, 1280]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${base}/`);
    await page.evaluate((s) => {
      localStorage.clear();
      if (s) localStorage.setItem('careconnect_session', s);
    }, role === null ? null : JSON.stringify({ user, role: role === 'none' ? null : role }));
    await page.goto(`${base}${p}`);
    await page.locator('h1').first().waitFor();
    await page.waitForTimeout(200);
    byWidth[width] = await page.evaluate(extract);
    await ctx.close();
  }
  const d = byWidth[1280];
  const shownAt = (lm) =>
    [375, 820, 1280].filter((w) => byWidth[w].landmarks.some((x) => x.role === lm.role && x.name === lm.name && x.shown)).map((w) => ({ 375: 'M', 820: 'T', 1280: 'D' })[w]).join(' ') || '—';
  const lines = [
    `## ${label} — \`${p}\`${role && role !== 'none' ? ` (${role})` : ''}`,
    '',
    `**Title:** ${d.title}`,
    '',
    '| Landmark | Element | Accessible name | Shown at |',
    '|:--|:--|:--|:--|',
    ...d.landmarks
      .filter((lm) => lm.role !== 'region')
      .map((lm) => `| ${lm.role} | \`<${lm.tag}${lm.explicitRole ? ` role="${lm.explicitRole}"` : ''}>\` | ${lm.name || '—'} | ${shownAt(lm)} |`),
    '',
    `Named regions inside main: ${d.landmarks.filter((lm) => lm.role === 'region').map((lm) => `“${lm.name}”`).join(', ') || 'none'}`,
    '',
    '**Heading outline (desktop)**',
    '',
    '```',
    ...d.headings.map((h) => `${'  '.repeat(h.level - 1)}h${h.level}  ${h.text}`),
    '```',
    '',
  ];
  if (d.fields.length) {
    lines.push('| Field | Type | Required | autocomplete |', '|:--|:--|:--|:--|');
    for (const f of d.fields) lines.push(`| ${f.label || '**unlabelled**'} | ${f.type} | ${f.required ? 'yes' : ''} | ${f.autocomplete} |`);
    lines.push('');
  }
  const linkRows = d.links.filter((l) => l.text || l.label);
  lines.push(
    `**Links (${linkRows.length}):** ` +
      linkRows.map((l) => (l.label && l.label !== l.text ? `“${l.text}” (named “${l.label}”)` : `“${l.text || l.label}”`)).join(' · '),
    '',
  );
  if (d.live.length) {
    lines.push(`**Live regions:** ${d.live.map((l) => `${l.role || 'aria-live'}${l.live ? `/${l.live}` : ''}${l.text ? ` “${l.text}”` : ''}`).join(' · ')}`, '');
  }
  sections.push(lines.join('\n'));
}
await browser.close();

const md = `# Page structure — CareConnect web app

Generated from the running app by \`scripts/web-a11y-structure.mjs\` (${new Date().toISOString().slice(0, 10)}).
This is what a screen-reader user can navigate by: landmarks (VoiceOver rotor, NVDA \`D\`),
headings (\`H\`), links and form fields. "Shown at": M = mobile 375px, T = tablet 820px,
D = desktop 1280px.

${sections.join('\n---\n\n')}
`;
await writeFile(out, md);
console.log(`wrote ${out}`);
