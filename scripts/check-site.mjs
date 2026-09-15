import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const ignored = new Set(['.git', 'node_modules', 'content', 'scripts']);
const htmlFiles = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
}

await walk(root);
const failures = [];
let linksChecked = 0;

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const relative = path.relative(root, file) || 'index.html';
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) failures.push(`${relative}: duplicate IDs (${[...new Set(duplicates)].join(', ')})`);
  if (!html.includes('href="#main-content"') || !html.includes('id="main-content"')) failures.push(`${relative}: missing skip-link target`);
  if (!html.includes('aria-label="Main navigation"')) failures.push(`${relative}: missing global navigation`);
  if (!html.includes('class="site-footer"')) failures.push(`${relative}: missing global footer`);
  if (html.includes('Dispatch 001')) failures.push(`${relative}: obsolete Dispatch 001 remains`);

  for (const match of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const value = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|#)/.test(value)) continue;
    linksChecked += 1;
    const clean = value.split(/[?#]/)[0];
    if (!clean) continue;
    let target = path.resolve(path.dirname(file), clean);
    if (clean.endsWith('/')) target = path.join(target, 'index.html');
    try { await access(target); } catch { failures.push(`${relative}: missing local target ${value}`); }
  }
}

const importedData = JSON.parse(await readFile(path.join(root, 'content', 'wordpress.json'), 'utf8'));
const localPosts = JSON.parse(await readFile(path.join(root, 'content', 'local-posts.json'), 'utf8'));
const expectedPages = 1 + 6 + importedData.categories.length + importedData.posts.length + localPosts.length;
if (htmlFiles.length !== expectedPages) failures.push(`Expected ${expectedPages} HTML pages, found ${htmlFiles.length}`);

const storiesHtml = await readFile(path.join(root, 'stories', 'index.html'), 'utf8');
const orderedCards = [...storiesHtml.matchAll(/data-reading-order="(\d+)"/g)].map((match) => Number(match[1])).sort((a, b) => a - b);
if (!storiesHtml.includes('data-filter="reading-order"')) failures.push('Stories page: missing Read in Order control');
const expectedOrderedStories = 25 + localPosts.length;
if (orderedCards.length !== expectedOrderedStories || orderedCards.some((value, index) => value !== index)) {
  failures.push(`Stories page: expected a continuous ${expectedOrderedStories}-story reading order, found ${orderedCards.length}`);
}

if (failures.length) {
  console.error(`Site check failed with ${failures.length} issue(s):\n${failures.join('\n')}`);
  process.exit(1);
}
console.log(`Site check passed: ${htmlFiles.length} pages and ${linksChecked} local links/assets checked.`);
