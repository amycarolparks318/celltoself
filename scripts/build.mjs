import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const data = JSON.parse(await readFile('content/wordpress.json', 'utf8'));
const categoryOrder = ['dear-prison-pals', 'after-the-headline', 'healing-in-real-time', 'ink-on-the-inside'];

const decode = (value = '') => value
  .replace(/&#8217;|&#x2019;/g, '’').replace(/&#8216;/g, '‘')
  .replace(/&#8220;/g, '“').replace(/&#8221;/g, '”')
  .replace(/&#8212;/g, '—').replace(/&#8211;/g, '–')
  .replace(/&#8230;/g, '…').replace(/&amp;/g, '&')
  .replace(/&nbsp;/g, ' ').replace(/&#(d+);/g, (_, n) => String.fromCodePoint(Number(n)));
const strip = (html = '') => decode(html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
const esc = (value = '') => decode(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const dateParts = (date) => date.slice(0, 10).split('-');
const postRoute = (post) => `${dateParts(post.date).join('/')}/${post.slug}`;
const prefixFor = (route = '') => '../'.repeat(route.split('/').filter(Boolean).length) || './';
const formatDate = (date) => new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date.slice(0, 10)}T12:00:00Z`));
const category = (post) => post.categories[0] || { name: 'Stories', slug: 'stories' };

function cleanArticle(html, prefix = '../') {
  return html
    .replace(/<div class="wp-block-buttons[\s\S]*$/i, '')
    .replace(/\s(?:srcset|sizes|data-[\w-]+)="[^"]*"/g, '')
    .replace(/href="https:\/\/celltoself\.com\//g, `href="${prefix}`);
}

function header(prefix, active = '') {
  const links = [
    ['home', 'Home', `${prefix}index.html`],
    ['start', 'Start Here', `${prefix}start-here/`],
    ['stories', 'Stories', `${prefix}stories/`],
    ['pals', 'Dear Prison Pals', `${prefix}dear-prison-pals/`],
    ['about', 'About Amy', `${prefix}about/`],
    ['connect', 'Stay Connected', `${prefix}stay-connected/`],
  ];
  return `<a class="skip-link" href="#main-content">Skip to content</a>
  <header class="site-header global-header">
    <a class="wordmark" href="${prefix}index.html" aria-label="Cell to Self home"><img class="horizontal-logo" src="${prefix}assets/images/cell-to-self-horizontal-logo.png" alt="Cell to Self — Life, Rewritten in Real Time"></a>
    <button class="menu-toggle" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span><b>Menu</b></button>
    <nav id="site-nav" aria-label="Main navigation">${links.map(([key, label, href]) => `<a href="${href}"${key === active ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>
  </header>`;
}

function footer(prefix) {
  return `<footer class="site-footer">
    <div class="footer-brand"><img class="footer-logo" src="${prefix}assets/images/cell-to-self-horizontal-logo.png" alt="Cell to Self"><p>Real life after prison, written in real time—without polish or pretending.</p></div>
    <nav aria-label="Footer navigation"><a href="${prefix}index.html">Home</a><a href="${prefix}start-here/">Start Here</a><a href="${prefix}stories/">Stories</a><a href="${prefix}dear-prison-pals/">Dear Prison Pals</a><a href="${prefix}about/">About Amy</a></nav>
    <div class="footer-connect"><strong>Stay connected</strong><p>Email subscription and Amy’s social links are coming soon.</p><a href="${prefix}stay-connected/">Connection details</a></div>
    <div class="footer-legal"><span>© ${new Date().getFullYear()} Cell to Self</span><a href="${prefix}privacy/">Privacy</a><a href="#top">Back to Top</a></div>
  </footer>`;
}

function layout({ route = '', title, description, active, body }) {
  const prefix = prefixFor(route);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#11100e"><link rel="icon" type="image/png" href="${prefix}assets/images/favicon.png"><title>${esc(title)} — Cell to Self</title><link rel="stylesheet" href="${prefix}styles.css"></head><body id="top">${header(prefix, active)}<main id="main-content">${body}</main>${footer(prefix)}<script src="${prefix}main.js"></script></body></html>`;
}

function storyCard(post, prefix, index = 0, hidden = false) {
  const cat = category(post);
  const description = strip(post.excerpt || post.content).slice(0, 180).replace(/\s+\S*$/, '') + '…';
  return `<article class="archive-card${hidden ? ' is-older-story' : ''}" data-category="${cat.slug}"${hidden ? ' hidden' : ''}>
    ${post.featuredImage ? `<img src="${post.featuredImage}" alt="${esc(post.featuredImageAlt || decode(post.title))}" loading="lazy">` : `<div class="card-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</div>`}
    <div class="archive-card-copy"><p class="story-meta"><span>${esc(cat.name)}</span><time datetime="${post.date.slice(0, 10)}">${formatDate(post.date)}</time></p><h2><a href="${prefix}${postRoute(post)}/">${esc(post.title)}</a></h2><p>${esc(description)}</p><a class="text-link" href="${prefix}${postRoute(post)}/">Read Story</a></div>
  </article>`;
}

async function save(route, html) {
  const directory = route ? path.join(route) : '.';
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'index.html'), html, 'utf8');
}

const storiesBody = `<section class="page-hero page-hero--stories"><p class="eyebrow">The complete archive</p><h1>Stories,<br><em>still unfolding.</em></h1><p>Browse real life after prison as it happens—messy, funny, painful, hopeful, and free.</p></section>
<section class="archive-section" aria-labelledby="all-stories"><div class="archive-toolbar"><h2 id="all-stories">All Stories</h2><div class="filters" role="group" aria-label="Filter stories"><button class="is-active" data-filter="all" aria-pressed="true">All</button>${data.categories.map((cat) => `<button data-filter="${cat.slug}" aria-pressed="false">${esc(cat.name)}</button>`).join('')}</div></div><div class="archive-grid">${data.posts.map((post, index) => storyCard(post, '../', index)).join('')}</div><p class="no-results" hidden>No stories are in this category yet.</p></section>`;
await save('stories', layout({ route: 'stories', title: 'Stories', description: 'Browse every Cell to Self story by category.', active: 'stories', body: storiesBody }));

const pals = data.posts.filter((post) => category(post).slug === 'dear-prison-pals');
const palsBody = `<section class="page-hero page-hero--pals"><p class="eyebrow">Letters to the women still inside</p><h1>Dear Prison<br><em>Pals,</em></h1><p>Actual letters about debit cards, probation, men, meetings, peanut butter Snickers, work, God, and everything freedom forgot to explain.</p></section><section class="archive-section"><div class="archive-toolbar"><div><p class="eyebrow">Every installment</p><h2>The letter archive</h2></div><p>${pals.length} letters and counting.</p></div><div class="archive-grid">${pals.map((post, index) => storyCard(post, '../', index, index >= 8)).join('')}</div>${pals.length > 8 ? '<button class="button-link load-more" type="button" data-load-more>Load Older Letters</button>' : ''}</section>`;
await save('dear-prison-pals', layout({ route: 'dear-prison-pals', title: 'Dear Prison Pals', description: 'Letters from freedom to friends still inside.', active: 'pals', body: palsBody }));

for (const cat of data.categories) {
  const posts = data.posts.filter((post) => category(post).slug === cat.slug);
  const body = `<section class="page-hero"><p class="eyebrow">Story category</p><h1>${esc(cat.name)}</h1><p>${esc(strip(cat.description) || `${posts.length} stories from this chapter of Cell to Self.`)}</p></section><section class="archive-section"><div class="archive-grid">${posts.map((post, index) => storyCard(post, '../../', index)).join('')}</div></section>`;
  await save(`category/${cat.slug}`, layout({ route: `category/${cat.slug}`, title: cat.name, description: strip(cat.description) || `Read ${cat.name} stories.`, active: cat.slug === 'dear-prison-pals' ? 'pals' : 'stories', body }));
}

const startPage = data.pages.find((page) => page.slug === 'start-here');
const recommended = data.posts.find((post) => post.slug === 'taptopay') || data.posts.at(-1);
const startBody = `<section class="page-hero page-hero--start"><p class="eyebrow">Begin here</p><h1>If you’re new,<br><em>welcome.</em></h1><p>Cell to Self is not a comeback story. It’s real life after prison, written in real time.</p></section><article class="editorial-page"><div class="article-content">${cleanArticle(startPage.content)}</div><section class="start-categories"><h2>Four ways into the story</h2>${categoryOrder.map((slug) => { const cat = data.categories.find((item) => item.slug === slug); return `<a href="../category/${slug}/"><strong>${esc(cat.name)}</strong><span>Explore this chapter</span></a>`; }).join('')}</section><section class="recommended-story"><p class="eyebrow">A recommended first story</p><h2>${esc(recommended.title)}</h2><p>${esc(strip(recommended.excerpt || recommended.content).slice(0, 220))}…</p><a class="button-link" href="../${postRoute(recommended)}/">Read the Story</a></section><section class="support-note"><h2>Stay with the story</h2><p>Read, share, and return as the story unfolds. Email subscription, social links, and additional ways to support Cell to Self will be added once Amy provides them.</p><a class="text-link" href="../stay-connected/">Stay Connected</a></section></article>`;
await save('start-here', layout({ route: 'start-here', title: 'Start Here', description: 'Meet Amy and learn how to begin reading Cell to Self.', active: 'start', body: startBody }));

const aboutPage = data.pages.find((page) => page.slug === 'about');
const aboutBody = `<section class="page-hero page-hero--about"><p class="eyebrow">The woman behind the headline</p><h1>I Am Amy.</h1><p>I write from the middle—not after the lesson is learned or the story makes sense.</p></section><article class="editorial-page editorial-page--about"><img class="about-page-photo" src="../assets/images/amy-about-transparent.png" alt="Amy Parks, founder and writer of Cell to Self"><div class="article-content">${cleanArticle(aboutPage.content)}</div></article>`;
await save('about', layout({ route: 'about', title: 'About Amy', description: 'Meet Amy Parks, the writer behind Cell to Self.', active: 'about', body: aboutBody }));

const connectBody = `<section class="page-hero"><p class="eyebrow">Keep reading</p><h1>Stay<br><em>connected.</em></h1><p>Cell to Self is still becoming. So is the way we stay in touch.</p></section><section class="connection-page"><h2>Coming soon</h2><p>Email subscription, Amy’s verified social profiles, and a contact or support destination have not been provided yet. Nothing has been invented or linked to an unverified account.</p><p>For now, bookmark the Stories page and return for new writing.</p><a class="button-link" href="../stories/">Explore All Stories</a></section>`;
await save('stay-connected', layout({ route: 'stay-connected', title: 'Stay Connected', description: 'Ways to stay connected with Cell to Self.', active: 'connect', body: connectBody }));

const privacyBody = `<section class="page-hero"><p class="eyebrow">Site information</p><h1>Privacy</h1><p>A complete privacy policy is still needed before the custom-domain launch.</p></section><section class="connection-page"><p>This local revision does not add analytics, advertising trackers, forms, accounts, payments, or a mailing-list integration. A final policy should be reviewed after Amy chooses subscription and contact services.</p></section>`;
await save('privacy', layout({ route: 'privacy', title: 'Privacy', description: 'Privacy information for Cell to Self.', active: '', body: privacyBody }));

for (let index = 0; index < data.posts.length; index += 1) {
  const post = data.posts[index];
  const previous = data.posts[index + 1];
  const next = data.posts[index - 1];
  const route = postRoute(post);
  const prefix = prefixFor(route);
  const cat = category(post);
  const body = `<article class="story-page"><header class="article-header"><a class="back-link" href="${prefix}stories/">Back to Stories</a><p class="story-meta"><a href="${prefix}category/${cat.slug}/">${esc(cat.name)}</a><time datetime="${post.date.slice(0, 10)}">${formatDate(post.date)}</time></p><h1>${esc(post.title)}</h1>${post.featuredImage ? `<img class="article-featured" src="${post.featuredImage}" alt="${esc(post.featuredImageAlt || decode(post.title))}">` : ''}</header><div class="article-content">${cleanArticle(post.content)}</div><nav class="story-pagination" aria-label="Story navigation">${previous ? `<a href="${prefix}${postRoute(previous)}/"><span>Previous Story</span><strong>${esc(previous.title)}</strong></a>` : '<span></span>'}${next ? `<a href="${prefix}${postRoute(next)}/"><span>Next Story</span><strong>${esc(next.title)}</strong></a>` : '<span></span>'}</nav><section class="article-subscribe"><p class="eyebrow">The story is still unfolding</p><h2>Stay connected.</h2><p>Email subscription is coming soon. Until then, explore the complete archive.</p><a class="button-link" href="${prefix}stories/">Explore All Stories</a></section></article>`;
  await save(route, layout({ route, title: strip(post.title), description: strip(post.excerpt || post.content).slice(0, 155), active: 'stories', body }));
}

console.log(`Built ${data.posts.length} story pages, ${data.categories.length} category pages, and 6 core pages.`);
