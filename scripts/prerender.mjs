// Build-time prerender for per-product social link previews.
//
// Social crawlers (WhatsApp, Facebook, etc.) do not run JavaScript, so a
// client-only SPA cannot give them per-product Open Graph tags. This script
// runs after `vite build`: it fetches products from the backend and writes a
// static dist/product/<id>/index.html for each, with the product's title,
// description, image and price baked into the <head>. Vercel serves those
// static files (crawlers get real tags); the React app still hydrates on top.
//
// It is INTENTIONALLY best-effort: if PRERENDER_API_URL is unset or the fetch
// fails, it logs and exits 0 so the build never breaks — the SPA continues to
// serve every product page client-side, just without a per-product preview.
//
// Configure in the Vercel project:
//   PRERENDER_API_URL   e.g. https://your-api.up.railway.app/api   (required)
//   PRERENDER_SITE_URL  e.g. https://your-domain.com               (optional, for absolute og:url)

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const DIST = resolve(process.cwd(), 'dist');
const API = process.env.PRERENDER_API_URL || '';
const SITE = (process.env.PRERENDER_SITE_URL || '').replace(/\/$/, '');

const escAttr = (value = '') => String(value)
  .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function firstImage(product) {
  const images = Array.isArray(product.images) ? product.images : [];
  const first = images[0];
  if (!first) return '';
  return typeof first === 'string' ? first : (first.url || '');
}

function replaceMetaContent(html, attr, key, value) {
  const re = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`);
  return re.test(html) ? html.replace(re, `$1${escAttr(value)}$2`) : html;
}

function buildProductHtml(template, product) {
  const title = `${product.name} | GlowOut gh`;
  const description = (product.description || `Buy ${product.name} at GlowOut gh.`).slice(0, 300);
  const image = firstImage(product);
  const url = SITE ? `${SITE}/product/${product.id}` : '';

  let html = template;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escAttr(title)}</title>`);
  html = replaceMetaContent(html, 'name', 'description', description);
  html = replaceMetaContent(html, 'property', 'og:title', title);
  html = replaceMetaContent(html, 'property', 'og:description', description);
  html = replaceMetaContent(html, 'property', 'og:type', 'product');
  if (image) html = replaceMetaContent(html, 'property', 'og:image', image);
  html = replaceMetaContent(html, 'name', 'twitter:title', title);
  html = replaceMetaContent(html, 'name', 'twitter:description', description);
  if (image) html = replaceMetaContent(html, 'name', 'twitter:image', image);

  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: image ? [image] : undefined,
    description: product.description || '',
    sku: product.sku || undefined,
    brand: { '@type': 'Brand', name: product.brand || 'GlowOut gh' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'GHS',
      price: Number(product.price) || 0,
      availability: Number(product.stock) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    }
  };
  const head = [
    url ? `<link rel="canonical" href="${escAttr(url)}" />` : '',
    url ? `<meta property="og:url" content="${escAttr(url)}" />` : '',
    `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`
  ].filter(Boolean).join('\n    ');

  return html.replace('</head>', `    ${head}\n  </head>`);
}

async function main() {
  if (!API) {
    console.info('[prerender] PRERENDER_API_URL not set — skipping product prerender (SPA still serves product pages).');
    return;
  }
  let template;
  try {
    template = await readFile(resolve(DIST, 'index.html'), 'utf8');
  } catch (error) {
    console.warn('[prerender] could not read dist/index.html — skipping.', error.message);
    return;
  }

  let products = [];
  try {
    const res = await fetch(`${API.replace(/\/$/, '')}/products`);
    const json = await res.json();
    products = Array.isArray(json) ? json : (json.data || []);
  } catch (error) {
    console.warn('[prerender] could not fetch products — skipping.', error.message);
    return;
  }

  let count = 0;
  for (const product of products) {
    if (!product?.id) continue;
    try {
      const dir = resolve(DIST, 'product', String(product.id));
      await mkdir(dir, { recursive: true });
      await writeFile(resolve(dir, 'index.html'), buildProductHtml(template, product), 'utf8');
      count += 1;
    } catch (error) {
      console.warn(`[prerender] failed for product ${product.id} — skipping.`, error.message);
    }
  }
  console.info(`[prerender] wrote ${count} product page(s).`);
}

// Never fail the build because of prerendering.
main().catch((error) => {
  console.warn('[prerender] unexpected error — continuing.', error?.message);
}).finally(() => process.exit(0));
