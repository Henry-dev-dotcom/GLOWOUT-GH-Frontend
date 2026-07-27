import { useMemo, useState } from 'react';
import { Heart } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Badge, Button, Card, EmptyState, PageHero, ProductCard, Reveal } from '../../components/Common';
import { WhatsAppOrderButton } from '../../components/WhatsAppButton';
import { money, safeNumber } from '../../utils/helpers';

const tabs = ['Overview', 'Details', 'Shipping', 'Reviews'];

export function ProductDetailPage({ navigate, params }) {
  const { products, categories, addToCart, toggleWishlist, wishlist, settings } = useStore();
  const product = products.find((p) => p.slug === params.product || p.id === params.product);
  const [image, setImage] = useState(product?.images?.[0]);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('Overview');

  const related = useMemo(() => products
    .filter((p) => p.id !== product?.id && p.available && (p.category === product?.category || p.featured))
    .slice(0, 4), [products, product]);
  const category = categories.find((c) => c.slug === product?.category);

  if (!product) return <EmptyState title="Product not found">No product is available yet.</EmptyState>;

  function addSelectedToCart() {
    addToCart(product.id, qty);
  }

  function buyNow() {
    addToCart(product.id, qty);
    navigate('checkout');
  }

  return (
    <>
      <PageHero eyebrow={category?.name || product.category} title={product.name}>{product.description}</PageHero>
      <section className="pb-16">
        <div className="container-lux grid gap-10 lg:grid-cols-2">
          <div>
            <div className="relative h-[360px] rounded-3xl border border-[rgba(201,169,110,.12)] bg-surface-2 product-image sm:h-[440px] lg:h-[520px]" style={{ backgroundImage: `url(${image || product.images?.[0]})` }}>
              {product.badge && <div className="absolute left-5 top-5"><Badge>{product.badge}</Badge></div>}
            </div>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {product.images?.map((img) => (
                <button
                  key={img}
                  onClick={() => setImage(img)}
                  className={`h-24 w-24 shrink-0 rounded-xl border product-image ${image === img ? 'border-gold' : 'border-gold/20'}`}
                  style={{ backgroundImage: `url(${img})` }}
                  aria-label="Change product image"
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge>{product.brand}</Badge>
              <span className="text-sm text-[#8A7A98]">SKU: {product.sku}</span>
              <span className="text-sm text-[#8A7A98]">★ {product.rating} ({product.reviews} reviews)</span>
            </div>
            <h2 className="mt-5 font-display text-4xl font-bold">{product.name}</h2>
            <p className="mt-4 text-lg leading-8 text-[#C8BAD0]">{product.description}</p>
            <div className="mt-6 flex items-center gap-4">
              <span className="text-3xl font-bold text-gold">{money(product.price, settings.currency)}</span>
              {product.wasPrice > 0 && <span className="text-[#564869] line-through">{money(product.wasPrice, settings.currency)}</span>}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Card className="p-4"><p className="text-sm text-[#8A7A98]">Availability</p><p className="font-bold">{product.available && product.stock > 0 ? 'In stock' : 'Unavailable'}</p></Card>
              <Card className="p-4"><p className="text-sm text-[#8A7A98]">Stock</p><p className="font-bold">{product.stock} units</p></Card>
              <Card className="p-4"><p className="text-sm text-[#8A7A98]">Category</p><p className="font-bold">{category?.name || product.category}</p></Card>
            </div>

            <Card className="mt-6 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Quantity</p>
                  <p className="text-sm text-[#8A7A98]">Maximum available: {product.stock}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" disabled={qty <= 1} onClick={() => setQty((value) => Math.max(1, value - 1))}>−</Button>
                  <span className="min-w-12 rounded-xl bg-surface-2 px-4 py-2 text-center font-bold">{qty}</span>
                  <Button variant="ghost" disabled={qty >= product.stock} onClick={() => setQty((value) => Math.min(product.stock, value + 1))}>+</Button>
                </div>
              </div>
            </Card>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button disabled={!product.available || product.stock <= 0} onClick={addSelectedToCart}>Add {qty} to Cart</Button>
              <Button disabled={!product.available || product.stock <= 0} variant="outline" onClick={buyNow}>Buy Now</Button>
              <Button variant="ghost" onClick={() => toggleWishlist(product.id)} className="inline-flex items-center gap-2"><Heart size={16} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />{wishlist.includes(product.id) ? 'Saved' : 'Save'}</Button>
            </div>
            <div className="mt-3"><WhatsAppOrderButton product={product} /></div>
          </div>
        </div>

        <div className="container-lux mt-12">
          <Card className="p-5 md:p-7">
            <div className="flex flex-wrap gap-2 border-b border-[rgba(201,169,110,.12)] pb-4">
              {tabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-full px-4 py-2 text-sm font-bold transition ${activeTab === tab ? 'bg-gold text-ink' : 'bg-surface-2 text-[#C8BAD0] hover:text-white'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <ProductTabContent tab={activeTab} product={product} settings={settings} category={category} navigate={navigate} />
          </Card>
        </div>

        {!!related.length && (
          <div className="container-lux mt-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="section-eyebrow">Complete the routine</p>
                <h3 className="heading-md mt-2">Related products</h3>
              </div>
              <Button variant="outline" onClick={() => navigate('shop', { category: product.category })}>Shop {category?.name || product.category}</Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item, i) => <Reveal key={item.id} delay={i * 70}><ProductCard product={item} navigate={navigate} compact /></Reveal>)}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function ProductTabContent({ tab, product, settings, category, navigate }) {
  if (tab === 'Details') {
    const details = [
      ['Brand', product.brand],
      ['Category', category?.name || product.category],
      ['SKU', product.sku],
      ['Stock Level', `${product.stock} units`],
      ['Rating', `${product.rating} / 5`],
      ['Review Count', product.reviews]
    ];
    return <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{details.map(([label, value]) => <div key={label} className="rounded-xl bg-surface-2 p-4"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#8A7A98]">{label}</p><p className="mt-2 font-semibold text-white">{value}</p></div>)}</div>;
  }
  if (tab === 'Shipping') {
    return <div className="mt-6 grid gap-4 md:grid-cols-3"><Info title="Delivery" text={`Standard delivery fee is ${money(settings.deliveryFee, settings.currency)} unless the order qualifies for free delivery.`} /><Info title="Processing" text="Orders are checked, packed and confirmed before courier handover." /><Info title="Returns" text="Eligible products can be requested for return through the Returns page after order confirmation." /></div>;
  }
  if (tab === 'Reviews') {
    return (
      <div className="mt-6 grid gap-4 lg:grid-cols-[260px_1fr]">
        <Card className="bg-surface-2 p-5">
          <p className="font-display text-5xl font-bold text-gold">{safeNumber(product.rating, 0).toFixed(1)}</p>
          <p className="mt-1 text-[#C8BAD0]">Average rating</p>
          <p className="mt-2 text-sm text-[#8A7A98]">Based on {product.reviews} customer review{product.reviews === 1 ? '' : 's'}.</p>
        </Card>
        <Card className="flex flex-col items-start justify-center gap-3 bg-surface-2 p-6">
          <p className="text-[#8A7A98]">{product.reviews > 0 ? 'Read what customers are saying about products across the store.' : 'No written reviews yet for this product.'}</p>
          <Button variant="outline" onClick={() => navigate('reviews')}>View Customer Reviews</Button>
        </Card>
      </div>
    );
  }
  return <div className="mt-6 grid gap-4 md:grid-cols-3"><Info title="Why customers choose it" text={product.description} /><Info title="Best for" text="Customers looking for a premium beauty essential with clean product information and reliable fulfilment." /><Info title="Care note" text="Store products away from heat, moisture and direct sunlight where applicable." /></div>;
}
function Info({ title, text }) { return <div className="rounded-xl bg-surface-2 p-5"><h4 className="font-display text-xl font-bold">{title}</h4><p className="mt-2 leading-7 text-[#8A7A98]">{text}</p></div>; }
