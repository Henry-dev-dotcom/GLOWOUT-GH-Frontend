import { useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button, Card, EmptyState, PageHero, ProductCard, ProductImage, Reveal } from '../../components/Common';
import { money, safeNumber } from '../../utils/helpers';

export function CartPage({ navigate }) {
  const { cartItems, wishlist, products, updateCartQty, removeFromCart, saveForLater, cartTotals, settings } = useStore();
  const savedItems = products.filter((p) => wishlist.includes(p.id) && !cartItems.some((item) => item.product.id === p.id)).slice(0, 4);
  const recommended = useMemo(() => products.filter((p) => p.available && p.stock > 0).slice(0, 4), [products]);

  if (!cartItems.length) {
    return (
      <>
        <PageHero eyebrow="Cart" title="Your cart is empty">Your selected beauty essentials will appear here before checkout.</PageHero>
        <section className="pb-16">
          <div className="container-lux space-y-8">
            <EmptyState title="No products in cart" action={<div className="flex flex-wrap justify-center gap-3"><Button onClick={() => navigate('shop')}>Continue Shopping</Button><Button variant="outline" onClick={() => navigate('wishlist')}>View Wishlist</Button></div>}>
              Add products from the shop, or move saved wishlist items into your cart.
            </EmptyState>
            {!!recommended.length && <ProductStrip title="Popular picks to start with" products={recommended} navigate={navigate} />}
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero eyebrow="Cart" title="Review your order">Adjust quantities and confirm delivery costs before checkout.</PageHero>
      <section className="pb-16">
        <div className="container-lux grid gap-8 lg:grid-cols-[1fr_390px]">
          <div className="space-y-4">
            {cartItems.map(({ product, qty }, i) => (
              <Reveal key={product.id} delay={i * 60}>
              <Card className="grid gap-4 p-4 transition hover:border-gold/25 sm:grid-cols-[120px_1fr_auto]">
                <button onClick={() => navigate('product', { product: product.slug || product.id })} className="text-left"><ProductImage product={product} className="h-28" /></button>
                <div>
                  <h3 className="font-display text-xl font-bold">{product.name}</h3>
                  <p className="text-sm text-[#8A7A98]">{product.brand} · {product.sku}</p>
                  <p className="mt-1 text-sm text-[#564869]">{product.stock} available</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button variant="ghost" disabled={qty <= 1} onClick={() => updateCartQty(product.id, qty - 1)}>−</Button>
                    <span className="min-w-10 rounded-xl bg-surface-2 px-4 py-2 text-center font-bold">{qty}</span>
                    <Button variant="ghost" disabled={qty >= product.stock} onClick={() => updateCartQty(product.id, qty + 1)}>+</Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button onClick={() => saveForLater(product.id)} className="text-sm font-semibold text-gold">Save for later</button>
                    <button onClick={() => removeFromCart(product.id)} className="text-sm font-semibold text-rose-light">Remove</button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gold">{money(product.price * qty, settings.currency)}</p>
                  <p className="text-sm text-[#8A7A98]">{money(product.price, settings.currency)} each</p>
                </div>
              </Card>
              </Reveal>
            ))}

            <DeliveryEstimator subtotal={cartTotals.subtotal} settings={settings} />
            {!!savedItems.length && <ProductStrip title="Saved for later" products={savedItems} navigate={navigate} compact />}
          </div>
          <OrderSummary navigate={navigate} />
        </div>
      </section>
    </>
  );
}

function OrderSummary({ navigate }) {
  const { cartTotals, settings } = useStore();
  return (
    <Card className="h-fit p-6 lg:sticky lg:top-24">
      <h3 className="font-display text-2xl font-bold">Order Summary</h3>
      <div className="mt-5 space-y-3 text-sm">
        <Row label="Subtotal" value={money(cartTotals.subtotal, settings.currency)} />
        <Row label="Shipping" value={cartTotals.shipping ? money(cartTotals.shipping, settings.currency) : 'Free'} />
        <Row label={`Tax (${settings.taxRate}%)`} value={money(cartTotals.tax, settings.currency)} />
        <div className="border-t border-[rgba(201,169,110,.12)] pt-3"><Row label="Total" value={money(cartTotals.total, settings.currency)} big /></div>
      </div>
      <Button onClick={() => navigate('checkout')} className="mt-6 w-full">Proceed to Checkout</Button>
      <p className="mt-4 text-center text-xs leading-5 text-[#8A7A98]">Delivery and tax totals will be rechecked before order creation.</p>
    </Card>
  );
}

function DeliveryEstimator({ subtotal, settings }) {
  const threshold = safeNumber(settings.freeDeliveryThreshold);
  const remaining = Math.max(0, threshold - safeNumber(subtotal));
  const progress = threshold ? Math.min(100, (safeNumber(subtotal) / threshold) * 100) : 100;
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-xl font-bold">Delivery estimate</h3>
          <p className="mt-1 text-sm text-[#8A7A98]">{remaining > 0 ? `Add ${money(remaining, settings.currency)} more to reach the free delivery threshold.` : 'This order qualifies for free delivery based on your store settings.'}</p>
        </div>
        <span className="rounded-full bg-gold/10 px-4 py-2 text-sm font-bold text-gold">{remaining > 0 ? money(settings.deliveryFee, settings.currency) : 'Free'}</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-3"><div className="h-full rounded-full bg-gold" style={{ width: `${progress}%` }} /></div>
    </Card>
  );
}

function ProductStrip({ title, products, navigate, compact }) {
  return (
    <div>
      <h3 className="mb-4 font-display text-2xl font-bold">{title}</h3>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => <ProductCard key={product.id} product={product} navigate={navigate} compact={compact} />)}
      </div>
    </div>
  );
}
function Row({ label, value, big }) { return <div className={`flex justify-between ${big ? 'text-lg font-bold text-white' : 'text-[#C8BAD0]'}`}><span>{label}</span><span className="text-gold">{value}</span></div>; }
