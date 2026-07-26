import { useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Badge, Button, Card, EmptyState, Field, PageHero, ProductCard, ProductImage, SelectField } from '../../components/Common';
import { money, safeNumber } from '../../utils/helpers';

const PAGE_SIZE = 6;

export function ShopPage({ navigate, params }) {
  const { products, categories, settings, addToCart, toggleWishlist, wishlist } = useStore();
  const [query, setQuery] = useState(params.q || '');
  const [category, setCategory] = useState(params.category || 'all');
  const [brand, setBrand] = useState('all');
  const [stock, setStock] = useState('available');
  const [rating, setRating] = useState('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sort, setSort] = useState('featured');
  const [page, setPage] = useState(1);
  const [quickView, setQuickView] = useState(null);

  const brands = useMemo(() => [...new Set(products.map((p) => p.brand).filter(Boolean))].sort(), [products]);
  const categoryMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.slug, c])), [categories]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (stock === 'available') list = list.filter((p) => p.available && safeNumber(p.stock) > 0);
    if (stock === 'low') list = list.filter((p) => p.available && safeNumber(p.stock) > 0 && safeNumber(p.stock) <= safeNumber(settings.lowStockThreshold, 5));
    if (stock === 'out') list = list.filter((p) => !p.available || safeNumber(p.stock) <= 0);
    if (category !== 'all') list = list.filter((p) => p.category === category);
    if (brand !== 'all') list = list.filter((p) => p.brand === brand);
    if (rating !== 'all') list = list.filter((p) => safeNumber(p.rating) >= safeNumber(rating));
    if (priceMin !== '') list = list.filter((p) => safeNumber(p.price) >= safeNumber(priceMin));
    if (priceMax !== '') list = list.filter((p) => safeNumber(p.price) <= safeNumber(priceMax));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => `${p.name} ${p.brand} ${p.description} ${p.sku}`.toLowerCase().includes(q));
    }
    if (sort === 'price-low') list.sort((a, b) => safeNumber(a.price) - safeNumber(b.price));
    if (sort === 'price-high') list.sort((a, b) => safeNumber(b.price) - safeNumber(a.price));
    if (sort === 'rating') list.sort((a, b) => safeNumber(b.rating) - safeNumber(a.rating));
    if (sort === 'stock') list.sort((a, b) => safeNumber(b.stock) - safeNumber(a.stock));
    if (sort === 'newest') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === 'featured') list.sort((a, b) => Number(b.featured) - Number(a.featured));
    return list;
  }, [products, query, category, brand, stock, rating, priceMin, priceMax, sort, settings.lowStockThreshold]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visibleProducts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function clearFilters() {
    setQuery('');
    setCategory('all');
    setBrand('all');
    setStock('available');
    setRating('all');
    setPriceMin('');
    setPriceMax('');
    setSort('featured');
    setPage(1);
  }

  function applyAndReset(setter) {
    return (event) => { setter(event.target.value); setPage(1); };
  }

  return (
    <>
      <PageHero eyebrow="Shop" title="Beauty collection">
        Search, filter and compare products controlled from your admin Product Manager.
      </PageHero>
      <section className="pb-16">
        <div className="container-lux grid gap-8 lg:grid-cols-[300px_1fr]">
          <Card className="h-fit p-5 lg:sticky lg:top-24">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-bold">Filters</h2>
              <button onClick={clearFilters} className="text-sm font-semibold text-gold">Reset</button>
            </div>
            <div className="space-y-4">
              <Field label="Search" value={query} onChange={applyAndReset(setQuery)} placeholder="Perfume, wig, serum..." />
              <SelectField label="Category" value={category} onChange={applyAndReset(setCategory)}>
                <option value="all">All Categories</option>
                {categories.filter((c) => c.visible).map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </SelectField>
              <SelectField label="Brand" value={brand} onChange={applyAndReset(setBrand)}>
                <option value="all">All Brands</option>
                {brands.map((name) => <option key={name} value={name}>{name}</option>)}
              </SelectField>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Min Price" type="number" value={priceMin} onChange={applyAndReset(setPriceMin)} placeholder="0" />
                <Field label="Max Price" type="number" value={priceMax} onChange={applyAndReset(setPriceMax)} placeholder="1000" />
              </div>
              <SelectField label="Stock" value={stock} onChange={applyAndReset(setStock)}>
                <option value="available">Available</option>
                <option value="low">Low stock</option>
                <option value="out">Out of stock</option>
                <option value="all">All stock states</option>
              </SelectField>
              <SelectField label="Rating" value={rating} onChange={applyAndReset(setRating)}>
                <option value="all">All ratings</option>
                <option value="4.5">4.5 stars and above</option>
                <option value="4">4 stars and above</option>
                <option value="3">3 stars and above</option>
              </SelectField>
              <SelectField label="Sort" value={sort} onChange={applyAndReset(setSort)}>
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="stock">Stock</option>
              </SelectField>
            </div>
          </Card>

          <div>
            <div className="mb-5 flex flex-col justify-between gap-3 rounded-2xl border border-[rgba(201,169,110,.12)] bg-surface-1/70 p-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-[#8A7A98]"><strong className="text-white">{filtered.length}</strong> products found</p>
                <p className="text-sm text-[#564869]">Page {page} of {pageCount} · {category === 'all' ? 'All categories' : categoryMap[category]?.name || category}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {category !== 'all' && <Badge>{categoryMap[category]?.name || category}</Badge>}
                {brand !== 'all' && <Badge>{brand}</Badge>}
                {rating !== 'all' && <Badge>★ {rating}+</Badge>}
              </div>
            </div>

            {visibleProducts.length ? (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleProducts.map((product) => (
                    <div key={product.id} className="relative">
                      <ProductCard product={product} navigate={navigate} />
                      <button onClick={() => setQuickView(product)} className="absolute right-4 top-4 rounded-full border border-gold/30 bg-ink/70 px-3 py-1 text-xs font-bold text-gold backdrop-blur hover:bg-gold hover:text-ink">
                        Quick View
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
                  <span className="rounded-full border border-[rgba(201,169,110,.18)] px-4 py-2 text-sm text-[#C8BAD0]">{page} / {pageCount}</span>
                  <Button variant="ghost" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>Next</Button>
                </div>
              </>
            ) : (
              <EmptyState title="No products found" action={<Button onClick={clearFilters}>Clear filters</Button>}>
                Try another category, price range or search term.
              </EmptyState>
            )}
          </div>
        </div>
      </section>

      {quickView && (
        <QuickViewModal
          product={quickView}
          settings={settings}
          liked={wishlist.includes(quickView.id)}
          onClose={() => setQuickView(null)}
          onAdd={() => addToCart(quickView.id)}
          onWishlist={() => toggleWishlist(quickView.id)}
          onDetails={() => { setQuickView(null); navigate('product', { product: quickView.slug || quickView.id }); }}
        />
      )}
    </>
  );
}

function QuickViewModal({ product, settings, liked, onClose, onAdd, onWishlist, onDetails }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <Card className="max-h-[90vh] w-full max-w-4xl overflow-y-auto p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <Badge>{product.brand}</Badge>
          <button onClick={onClose} className="rounded-full border border-[rgba(201,169,110,.18)] px-3 py-1 text-sm text-[#C8BAD0] hover:text-white">Close</button>
        </div>
        <div className="grid gap-6 md:grid-cols-[320px_1fr]">
          <ProductImage product={product} className="h-80" />
          <div>
            <h3 className="font-display text-3xl font-bold">{product.name}</h3>
            <p className="mt-3 leading-7 text-[#C8BAD0]">{product.description}</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-bold text-gold">{money(product.price, settings.currency)}</span>
              {product.wasPrice > 0 && <span className="text-[#564869] line-through">{money(product.wasPrice, settings.currency)}</span>}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-surface-2 p-3"><p className="text-xs text-[#8A7A98]">Rating</p><p className="font-bold">★ {product.rating}</p></div>
              <div className="rounded-xl bg-surface-2 p-3"><p className="text-xs text-[#8A7A98]">Stock</p><p className="font-bold">{product.stock} left</p></div>
              <div className="rounded-xl bg-surface-2 p-3"><p className="text-xs text-[#8A7A98]">SKU</p><p className="font-bold">{product.sku}</p></div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button disabled={!product.available || product.stock <= 0} onClick={onAdd}>Add to Cart</Button>
              <Button variant="outline" onClick={onDetails}>View Details</Button>
              <Button variant="ghost" onClick={onWishlist}>{liked ? 'Saved ♥' : 'Save ♡'}</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
