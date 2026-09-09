import { mkdir, writeFile } from 'node:fs/promises';

const api = 'https://celltoself.com/wp-json/wp/v2';

async function get(path) {
  const response = await fetch(`${api}${path}`);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${path}`);
  return response.json();
}

const [posts, pages, categories] = await Promise.all([
  get('/posts?per_page=100&_embed=1'),
  get('/pages?per_page=100&_embed=1'),
  get('/categories?per_page=100'),
]);

const categoryById = new Map(categories.map((category) => [category.id, category]));
const simplify = (item) => ({
  id: item.id,
  date: item.date,
  modified: item.modified,
  slug: item.slug,
  link: item.link,
  title: item.title.rendered,
  excerpt: item.excerpt?.rendered || '',
  content: item.content.rendered,
  categories: (item.categories || []).map((id) => categoryById.get(id)).filter(Boolean).map(({ id, name, slug }) => ({ id, name, slug })),
  featuredImage: item._embedded?.['wp:featuredmedia']?.[0]?.source_url || '',
  featuredImageAlt: item._embedded?.['wp:featuredmedia']?.[0]?.alt_text || '',
});

const data = {
  importedAt: new Date().toISOString(),
  source: 'https://celltoself.com',
  categories: categories.filter((category) => category.count > 0).map(({ id, name, slug, count, description }) => ({ id, name, slug, count, description })),
  pages: pages.map(simplify),
  posts: posts.map(simplify).sort((a, b) => new Date(b.date) - new Date(a.date)),
};

await mkdir('content', { recursive: true });
await writeFile('content/wordpress.json', `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log(`Imported ${data.posts.length} posts, ${data.pages.length} pages, and ${data.categories.length} categories.`);
