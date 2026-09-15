import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const importedData = JSON.parse(await readFile('content/wordpress.json', 'utf8'));
const localPosts = JSON.parse(await readFile('content/local-posts.json', 'utf8'));
const data = { ...importedData, posts: [...localPosts, ...importedData.posts] };
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
const releaseDate = new Date('2025-11-14T12:00:00Z');
const writtenDates = {
  'taptopay': '2025-12-02',
  'one-month-out-and-apparently-employable': '2025-12-19',
  'dear-prison-pals-things-are-moving-fast': '2025-12-21',
  'dear-prison-pals-im-building-something-new': '2025-12-28',
  'praying-they-see-me-before-they-see-google': '2026-01-01',
  'what-graduating-from-persevere-means-to-me': '2026-01-04',
  'life-is-apparently-not-boring': '2026-01-08',
  'somehow-this-is-my-life-now': '2026-01-15',
  'what-the-hell-did-i-walk-into': '2026-01-17',
  'how-many-people-have-you-killed': '2026-01-20',
  'im-not-ready-to-write-this': '2026-01-21',
  'blessings-boundaries-and-bad-decisions': '2026-02-01',
  'this-was-definitely-not-the-plan': '2026-03-15',
  'but-wait-theres-more': '2026-03-28',
  'look-what-god-did': '2026-04-19',
  'the-keys-were-the-prize-for-the-prep': '2026-05-02',
  'rainbows-butterflies-reality': '2026-05-24',
  'look-at-god-yall': '2026-06-22',
};
const prisonWrittenSlugs = new Set(['a-contradiction-of-love', 'turn-tragedy-to-worth']);
const writtenTimelineOverrides = {
  'dear-prison-pals-im-building-something-new': '6 weeks out of prison',
  'the-hot-boss-dilemma': '6 weeks out of prison',
  'life-is-apparently-not-boring': '2 months out of prison',
  'what-graduating-from-persevere-means-to-me': '2 months out of prison',
  'praying-they-see-me-before-they-see-google': '2 months out of prison',
  'dear-me': '2 months out of prison',
  'me-according-to-google': '3 months out of prison',
  'the-day-i-walked-away': '6 months out of prison',
  'the-stuff-in-the-shower': 'Exactly 10 months out of prison',
  'here-in-the-waiting': 'Exactly 10 months out of prison',
};

function writtenTimelineLabel(post) {
  if (prisonWrittenSlugs.has(post.slug)) return 'Written in prison';
  if (writtenTimelineOverrides[post.slug]) return writtenTimelineOverrides[post.slug];
  const date = writtenDates[post.slug] || post.date.slice(0, 10);
  const written = new Date(`${date}T12:00:00Z`);
  const days = Math.max(0, Math.round((written - releaseDate) / 86400000));
  if (days < 14) return `${days} day${days === 1 ? '' : 's'} out of prison`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks === 1 ? '' : 's'} out of prison`;
  }
  const months = Math.max(1, Math.floor(days / 30.4375));
  return `${months} month${months === 1 ? '' : 's'} out of prison`;
}

function writtenTimeline(post) {
  if (prisonWrittenSlugs.has(post.slug)) return '<span class="written-timeline">Written in prison</span>';
  const date = writtenDates[post.slug] || post.date.slice(0, 10);
  const label = writtenTimelineLabel(post);
  if (writtenTimelineOverrides[post.slug] && !writtenDates[post.slug]) return `<span class="written-timeline">${label}</span>`;
  return `<time class="written-timeline" datetime="${date}" title="Written ${formatDate(date)}">${label}</time>`;
}

const postsByRoute = new Map(data.posts.map((post) => [postRoute(post), post]));
const readNextRoute = (post) => post.content.match(/href="https:\/\/celltoself\.com\/(\d{4}\/\d{2}\/\d{2}\/[^"/]+)\/"[^>]*>READ NEXT/i)?.[1];
const readingOrder = [];
const visitedRoutes = new Set();
let orderedPost = [...data.posts].sort((a, b) => a.date.localeCompare(b.date))[0];
while (orderedPost && !visitedRoutes.has(postRoute(orderedPost))) {
  const route = postRoute(orderedPost);
  readingOrder.push(orderedPost);
  visitedRoutes.add(route);
  orderedPost = postsByRoute.get(readNextRoute(orderedPost));
}
for (const slug of ['hey-thats-mine', 'sometimes-home-was-hayley', 'nothing-exciting-to-report', 'the-stuff-in-the-shower', 'here-in-the-waiting']) {
  const post = data.posts.find((item) => item.slug === slug);
  if (post && !visitedRoutes.has(postRoute(post))) {
    readingOrder.push(post);
    visitedRoutes.add(postRoute(post));
  }
}
const readingOrderIndex = new Map(readingOrder.map((post, index) => [postRoute(post), index]));

function cleanArticle(html, prefix = '../') {
  return html
    .replace(/<div class="wp-block-buttons[\s\S]*$/i, '')
    .replace(/\s(?:srcset|sizes|data-[\w-]+)="[^"]*"/g, '')
    .replace(/https:\/\/(?:i0\.wp\.com\/)?celltoself\.com\/wp-content\/uploads\/([^"'<\s?]+)(?:\?[^"'<\s]*)?/gi, (_, mediaPath) => `${prefix}assets/media/${mediaPath.replace(/\.(?:png|jpe?g)$/i, '.webp')}`)
    .replace(/href="https:\/\/celltoself\.com\//g, `href="${prefix}`);
}

function localMediaUrl(url, prefix) {
  if (!url) return '';
  const match = url.match(/^https:\/\/(?:i0\.wp\.com\/)?celltoself\.com\/wp-content\/uploads\/([^?]+)(?:\?.*)?$/i);
  return match ? `${prefix}assets/media/${match[1].replace(/\.(?:png|jpe?g)$/i, '.webp')}` : url;
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
    <a class="wordmark" href="${prefix}index.html" aria-label="Cell to Self home"><img class="horizontal-logo" src="${prefix}assets/images/cell-to-self-horizontal-logo.webp" alt="Cell to Self — Life, Rewritten in Real Time"></a>
    <button class="menu-toggle" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span><b>Menu</b></button>
    <nav id="site-nav" aria-label="Main navigation">${links.map(([key, label, href]) => `<a href="${href}"${key === active ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>
  </header>`;
}

function footer(prefix) {
  const facebookIcon = '<svg class="facebook-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z"/></svg>';
  return `<footer class="site-footer">
    <div class="footer-brand"><img class="footer-logo" src="${prefix}assets/images/cell-to-self-horizontal-logo.webp" alt="Cell to Self"><p>Real life after prison, written in real time—without polish or pretending.</p></div>
    <nav aria-label="Footer navigation"><a href="${prefix}index.html">Home</a><a href="${prefix}start-here/">Start Here</a><a href="${prefix}stories/">Stories</a><a href="${prefix}dear-prison-pals/">Dear Prison Pals</a><a href="${prefix}about/">About Amy</a></nav>
    <div class="footer-connect"><strong>Stay connected</strong><div class="footer-socials"><a href="https://www.facebook.com/cell2self">${facebookIcon}<span>Cell to Self</span></a><a href="https://www.facebook.com/amycarolparks/">${facebookIcon}<span>Amy Parks</span></a></div><a href="${prefix}stay-connected/">Contact Amy</a></div>
    <div class="footer-legal"><span>© ${new Date().getFullYear()} Cell to Self</span><a href="${prefix}privacy/">Privacy</a><a href="#top">Back to Top</a></div>
  </footer>`;
}

function layout({ route = '', title, description, active, body }) {
  const prefix = prefixFor(route);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#11100e"><link rel="icon" type="image/png" href="${prefix}assets/images/favicon.png"><title>${esc(title)} — Cell to Self</title><link rel="stylesheet" href="${prefix}styles.css?v=20260912-1"></head><body id="top">${header(prefix, active)}<main id="main-content">${body}</main>${footer(prefix)}<script src="${prefix}main.js?v=20260912-1"></script></body></html>`;
}

function storyCard(post, prefix, index = 0, hidden = false) {
  const cat = category(post);
  const description = strip(post.excerpt || post.content).slice(0, 180).replace(/\s+\S*$/, '') + '…';
  const orderIndex = readingOrderIndex.get(postRoute(post));
  return `<article class="archive-card${hidden ? ' is-older-story' : ''}" data-category="${cat.slug}" data-default-order="${index}" data-reading-order="${orderIndex ?? ''}"${hidden ? ' hidden' : ''}>
    ${post.featuredImage ? `<img src="${localMediaUrl(post.featuredImage, prefix)}" alt="${esc(post.featuredImageAlt || decode(post.title))}" loading="lazy">` : `<div class="card-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</div>`}
    <div class="archive-card-copy"><p class="story-meta"><span>${esc(cat.name)}</span>${writtenTimeline(post)}</p><h2><a href="${prefix}${postRoute(post)}/">${esc(post.title)}</a></h2><p>${esc(description)}</p><a class="text-link" href="${prefix}${postRoute(post)}/">Read Story</a></div>
  </article>`;
}

async function save(route, html) {
  const directory = route ? path.join(route) : '.';
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'index.html'), html, 'utf8');
}

const storiesBody = `<section class="page-hero page-hero--stories"><p class="eyebrow">The complete archive</p><h1>Stories,<br><em>still unfolding.</em></h1><p>Browse real life after prison as it happens—messy, funny, painful, hopeful, and free.</p></section>
<section class="archive-section" aria-labelledby="all-stories"><div class="archive-toolbar"><div><h2 id="all-stories">All Stories</h2><p class="archive-mode-note" data-archive-note>Newest stories first.</p></div><div class="filters" role="group" aria-label="Filter and order stories"><button class="is-active" data-filter="all" aria-pressed="true">All</button>${data.categories.map((cat) => `<button data-filter="${cat.slug}" aria-pressed="false">${esc(cat.name)}</button>`).join('')}<button class="reading-order-button" data-filter="reading-order" aria-pressed="false">Read in Order</button></div></div><div class="archive-grid">${data.posts.map((post, index) => storyCard(post, '../', index)).join('')}</div><p class="no-results" hidden>No stories are in this category yet.</p></section>`;
await save('stories', layout({ route: 'stories', title: 'Stories', description: 'Browse every Cell to Self story by category.', active: 'stories', body: storiesBody }));

const pals = data.posts.filter((post) => category(post).slug === 'dear-prison-pals');
const palsBody = `<section class="page-hero page-hero--pals"><p class="eyebrow">Letters to the women still inside</p><h1>Dear Prison<br><em>Pals,</em></h1><p>Actual letters about debit cards, probation, men, meetings, peanut butter Snickers, work, God, and everything freedom forgot to explain.</p></section><section class="archive-section"><div class="archive-toolbar"><div><p class="eyebrow">Every installment</p><h2>The letter archive</h2></div><p>${pals.length} letters and counting.</p></div><div class="archive-grid">${pals.map((post, index) => storyCard(post, '../', index, index >= 8)).join('')}</div>${pals.length > 8 ? '<button class="button-link load-more" type="button" data-load-more>Load Older Letters</button>' : ''}</section>`;
await save('dear-prison-pals', layout({ route: 'dear-prison-pals', title: 'Dear Prison Pals', description: 'Letters from freedom to friends still inside.', active: 'pals', body: palsBody }));

for (const cat of data.categories) {
  const posts = data.posts.filter((post) => category(post).slug === cat.slug);
  const body = `<section class="page-hero"><p class="eyebrow">Story category</p><h1>${esc(cat.name)}</h1><p>${esc(strip(cat.description) || `${posts.length} stories from this chapter of Cell to Self.`)}</p></section><section class="archive-section"><div class="archive-grid">${posts.map((post, index) => storyCard(post, '../../', index)).join('')}</div></section>`;
  await save(`category/${cat.slug}`, layout({ route: `category/${cat.slug}`, title: cat.name, description: strip(cat.description) || `Read ${cat.name} stories.`, active: cat.slug === 'dear-prison-pals' ? 'pals' : 'stories', body }));
}

const startBody = `<section class="start-here-hero"><div class="start-here-intro"><p class="eyebrow">Start Here</p><h1>If you’re new here,<br><em>welcome.</em></h1><p><strong>I’m glad you found this place.</strong></p><a class="button-link" href="../2025/12/31/taptopay/">First Blog</a></div><figure class="printed-photo start-here-polaroid"><img src="../assets/images/about/amy-collage-soft.webp" alt="Amy smiling with naturally curly hair" width="959" height="1000"><figcaption>Start right here.</figcaption></figure></section><article class="start-here-page"><section class="start-here-story"><p>Cell to Self is not a comeback story. It’s real life after prison, written in real time. There’s no polish, no pretending, and no neatly wrapped ending. Just the messy work of becoming yourself again.</p><p>You won’t find a single, complete explanation of my past here. Instead, you’ll find pieces of it — moments, memories, letters, poems, and reflections — shared as they surface and make sense. This space isn’t about rewriting history. It’s about telling the truth as it unfolds.</p></section><section class="start-here-categories"><p class="eyebrow">Find your way in</p><h2>How this space works</h2><p>I write in a few different ways, depending on where I’m at that day.</p><div class="start-category-list"><a href="../dear-prison-pals/"><strong>Dear Prison Pals</strong><em>Letters I’d send anyway.</em><span>These are letters and updates I send to friends still in prison — honest, sometimes funny, sometimes heavy, always real.</span></a><a href="../category/ink-on-the-inside/"><strong>Ink on the Inside</strong><em>Poems written when words were the only way out.</em><span>These poems were written in prison, without knowing who would ever read them. They aren’t polished for performance. They’re preserved as they were.</span></a><a href="../category/after-the-headline/"><strong>After the Headline</strong><em>Writing away imposter syndrome.</em><span>This is where I write about identity, work, fear, and living under a story I didn’t get to tell, while choosing to become more than what people think they know.</span></a><a href="../category/healing-in-real-time/"><strong>Healing in Real Time</strong><em>Working through what still hurts.</em><span>This is where I write about healing as it unfolds. Untangling trauma, working the steps, learning to forgive, and letting go in real time.</span></a></div></section><section class="start-here-close"><p>You don’t have to read everything in order. You don’t have to agree with me. You just have to be willing to read honestly.</p><p class="start-here-statement"><strong>This isn’t a blueprint. It’s just my story unfolding in honesty, humor, and hope.</strong></p><p>Still not sure where to start?</p><a class="button-link" href="../2025/12/31/taptopay/">Start Here</a></section></article>`;
await save('start-here', layout({ route: 'start-here', title: 'Start Here', description: 'Meet Amy and learn how to begin reading Cell to Self.', active: 'start', body: startBody }));

const aboutBody = await readFile('content/about.html', 'utf8');
await save('about', layout({ route: 'about', title: 'About Amy', description: 'Meet Amy Parks, the writer behind Cell to Self.', active: 'about', body: aboutBody }));

const connectBody = `<section class="page-hero"><p class="eyebrow">Keep reading</p><h1>Stay<br><em>connected.</em></h1><p>Send a note, follow along, or ask to hear when something new is published.</p></section><section class="connection-page contact-layout"><div><p class="eyebrow">Contact Amy</p><h2>Say hello.</h2><p>Questions, stories, speaking inquiries, support, or just a note from one human figuring it out to another.</p><p class="form-success" data-form-success hidden role="status">Thanks for reaching out. Your message has been sent to Amy.</p><form class="contact-form" data-contact-form action="https://formsubmit.co/amycarolparks318@gmail.com" method="post"><input type="hidden" name="_subject" value="New Cell to Self website message"><input type="hidden" name="_template" value="table"><input type="hidden" name="_next" value="https://www.celltoself.com/stay-connected/?sent=1"><input class="form-honeypot" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true"><label for="contact-name">Name</label><input id="contact-name" name="name" type="text" autocomplete="name"><label for="contact-phone">Phone number <span>(optional)</span></label><input id="contact-phone" name="phone" type="tel" autocomplete="tel"><label for="contact-email">Email <span>(required)</span></label><input id="contact-email" name="email" type="email" autocomplete="email" required><label for="contact-message">Message</label><textarea id="contact-message" name="message" rows="7" required></textarea><label class="checkbox-label" for="contact-subscribe"><input id="contact-subscribe" name="subscribe" type="checkbox" value="Yes"><span>Yes, tell Amy I’d like to subscribe when email updates become available.</span></label><button class="button-link" type="submit">Send Message</button></form></div><aside class="connection-options"><h2>Find Cell to Self</h2><a class="social-link" href="https://www.facebook.com/cell2self"><svg class="facebook-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z"/></svg><span>Cell to Self on Facebook</span></a><a class="social-link" href="https://www.facebook.com/amycarolparks/"><svg class="facebook-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z"/></svg><span>Amy on Facebook</span></a><a class="text-link" href="../stories/">Explore All Stories</a></aside></section>`;
const finishedConnectBody = connectBody.replace('<h2>Find Cell to Self</h2>', '');
await save('stay-connected', layout({ route: 'stay-connected', title: 'Stay Connected', description: 'Ways to stay connected with Cell to Self.', active: 'connect', body: finishedConnectBody }));

const privacyBody = `<section class="page-hero"><p class="eyebrow">Site information</p><h1>Privacy</h1><p>A complete privacy policy is still needed before the custom-domain launch.</p></section><section class="connection-page"><p>This site does not currently add analytics, advertising trackers, accounts, payments, or a mailing-list integration. Contact-form entries are securely relayed to Amy by FormSubmit and are not stored by this website. A final policy should be reviewed after Amy chooses subscription and support services.</p></section>`;
await save('privacy', layout({ route: 'privacy', title: 'Privacy', description: 'Privacy information for Cell to Self.', active: '', body: privacyBody }));

for (let index = 0; index < data.posts.length; index += 1) {
  const post = data.posts[index];
  const route = postRoute(post);
  const orderedIndex = readingOrderIndex.get(route);
  const previous = orderedIndex === undefined ? data.posts[index + 1] : readingOrder[orderedIndex - 1];
  const next = orderedIndex === undefined ? data.posts[index - 1] : readingOrder[orderedIndex + 1];
  const prefix = prefixFor(route);
  const cat = category(post);
  const body = `<article class="story-page"><header class="article-header"><a class="back-link" href="${prefix}stories/">Back to Stories</a><p class="story-meta"><a href="${prefix}category/${cat.slug}/">${esc(cat.name)}</a>${writtenTimeline(post)}</p><h1>${esc(post.title)}</h1>${post.featuredImage ? `<img class="article-featured" src="${localMediaUrl(post.featuredImage, prefix)}" alt="${esc(post.featuredImageAlt || decode(post.title))}">` : ''}</header><div class="article-content">${writtenTimelineOverrides[post.slug] ? `<p class="story-timeline-intro">${writtenTimelineLabel(post)}</p>` : ''}${cleanArticle(post.content, prefix)}</div><nav class="story-pagination" aria-label="Story navigation">${previous ? `<a href="${prefix}${postRoute(previous)}/"><span>Previous Story</span><strong>${esc(previous.title)}</strong></a>` : '<span></span>'}${next ? `<a href="${prefix}${postRoute(next)}/"><span>Next Story</span><strong>${esc(next.title)}</strong></a>` : '<span></span>'}</nav><section class="article-subscribe"><p class="eyebrow">The story is still unfolding</p><h2>Stay connected.</h2><p>Email subscription is coming soon. Until then, explore the complete archive.</p><a class="button-link" href="${prefix}stories/">Explore All Stories</a></section></article>`;
  await save(route, layout({ route, title: strip(post.title), description: strip(post.excerpt || post.content).slice(0, 155), active: 'stories', body }));
}

console.log(`Built ${data.posts.length} story pages, ${data.categories.length} category pages, and 6 core pages.`);
