import { useEffect } from 'react';
import { useStore } from '../context/StoreContext';

// Imperatively upsert a <meta> tag by name or property, creating it if missing.
function setMeta(key, value, attr = 'name') {
  if (!value) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(data) {
  let el = document.getElementById('seo-jsonld');
  if (!data) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = 'seo-jsonld';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

// Pages that must never be indexed (private, transactional, or admin).
const NOINDEX_VIEWS = new Set([
  'cart', 'checkout', 'order-confirmation', 'payment-status', 'wishlist',
  'login', 'register', 'forgot-password', 'reset-password', 'account'
]);

const BRAND_DESCRIPTION = 'Shop authentic perfumes, skincare and wigs at GlowOut gh — premium beauty in Ghana with secure checkout and fast, tracked delivery.';

function resolveSeo(view, params, store) {
  const { products, settings } = store;
  const storeName = settings.storeName || 'GlowOut gh';
  const defaultImage = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80';
  const base = { title: `${storeName} | Perfumes, Skincare & Wigs`, description: BRAND_DESCRIPTION, image: defaultImage, type: 'website', noindex: false, jsonLd: null };

  if (view?.startsWith('admin')) return { ...base, title: `Admin | ${storeName}`, noindex: true };

  switch (view) {
    case 'home':
      return base;
    case 'product': {
      const product = products.find((p) => p.id === params.product);
      if (!product) return { ...base, title: `Product | ${storeName}` };
      return {
        title: `${product.name} | ${storeName}`,
        description: product.description || `Buy ${product.name} at ${storeName}.`,
        image: product.images?.[0] || defaultImage,
        type: 'product',
        noindex: false,
        jsonLd: {
          '@context': 'https://schema.org/',
          '@type': 'Product',
          name: product.name,
          image: product.images?.length ? product.images : [defaultImage],
          description: product.description || '',
          sku: product.sku || undefined,
          brand: { '@type': 'Brand', name: product.brand || storeName },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'GHS',
            price: Number(product.price) || 0,
            availability: Number(product.stock) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
          }
        }
      };
    }
    case 'shop': {
      const cat = params.category && params.category !== 'all' ? params.category : '';
      const pretty = cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : '';
      return { ...base, title: cat ? `Shop ${pretty} | ${storeName}` : `Shop All Products | ${storeName}`, description: cat ? `Shop ${pretty} at ${storeName}.` : BRAND_DESCRIPTION };
    }
    case 'categories':
      return { ...base, title: `Shop by Category | ${storeName}` };
    case 'about':
      return { ...base, title: `About Us | ${storeName}` };
    case 'contact':
      return { ...base, title: `Contact Us | ${storeName}`, description: `Contact ${storeName} for product, order, delivery and return support.` };
    case 'faq':
      return { ...base, title: `FAQ | ${storeName}` };
    case 'returns':
      return { ...base, title: `Returns & Refunds | ${storeName}` };
    case 'terms':
      return { ...base, title: `Terms of Service | ${storeName}`, description: `The terms that govern purchases from ${storeName}.` };
    case 'privacy':
      return { ...base, title: `Privacy Policy | ${storeName}`, description: `How ${storeName} collects, uses and protects your information.` };
    case 'reviews':
      return { ...base, title: `Customer Reviews | ${storeName}` };
    case 'blog':
      return { ...base, title: `Beauty Journal | ${storeName}`, type: 'article' };
    case 'tracking':
      return { ...base, title: `Track Your Order | ${storeName}`, noindex: true };
    default:
      if (NOINDEX_VIEWS.has(view)) return { ...base, title: `${storeName}`, noindex: true };
      return base;
  }
}

export function Seo({ view, params = {} }) {
  const store = useStore();
  const storeName = store.settings.storeName || 'GlowOut gh';

  useEffect(() => {
    const seo = resolveSeo(view, params, store);
    const url = window.location.href;

    document.title = seo.title;
    setMeta('description', seo.description);
    setMeta('robots', seo.noindex ? 'noindex,nofollow' : 'index,follow');
    setCanonical(url);

    setMeta('og:site_name', storeName, 'property');
    setMeta('og:title', seo.title, 'property');
    setMeta('og:description', seo.description, 'property');
    setMeta('og:type', seo.type, 'property');
    setMeta('og:url', url, 'property');
    setMeta('og:image', seo.image, 'property');

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', seo.title);
    setMeta('twitter:description', seo.description);
    setMeta('twitter:image', seo.image);

    setJsonLd(seo.jsonLd);
    // Re-run whenever the route changes or product data loads in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, params.product, params.category, params.post, store.products, store.settings.storeName]);

  return null;
}
