import { useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button, Card, EmptyState, PageHero, ProductCard, ProductImage } from '../../components/Common';
import { money } from '../../utils/helpers';

export function WishlistPage({ navigate }) {
  const { wishlist, products, addToCart, toggleWishlist, settings } = useStore();
  const items = products.filter((p) => wishlist.includes(p.id));
  const recommended = useMemo(() => products.filter((p) => p.available && !wishlist.includes(p.id)).slice(0, 4), [products, wishlist]);

  return (
    <>
      <PageHero eyebrow="Wishlist" title="Saved favourites">Keep products here until you are ready to add them to cart.</PageHero>
      <section className="pb-16">
        <div className="container-lux space-y-8">
          {items.length ? (
            <div className="grid gap-4">
              {items.map((product) => (
                <Card key={product.id} className="grid gap-4 p-4 md:grid-cols-[120px_1fr_auto] md:items-center">
                  <button onClick={() => navigate('product', { product: product.id })} className="text-left"><ProductImage product={product} className="h-28" /></button>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-gold/70">{product.brand}</p>
                    <button onClick={() => navigate('product', { product: product.id })} className="font-display text-xl font-bold hover:text-gold">{product.name}</button>
                    <p className="mt-1 text-sm text-[#8A7A98]">★ {product.rating} · {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}</p>
                    <p className="mt-2 text-sm leading-6 text-[#C8BAD0]">{product.description}</p>
                  </div>
                  <div className="flex flex-col gap-3 text-right">
                    <p className="text-xl font-bold text-gold">{money(product.price, settings.currency)}</p>
                    <Button disabled={!product.available || product.stock <= 0} onClick={() => addToCart(product.id)}>Move to Cart</Button>
                    <Button variant="ghost" onClick={() => toggleWishlist(product.id)}>Remove</Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState title="No saved products" action={<Button onClick={() => navigate('shop')}>Browse Products</Button>}>
              Tap the heart on products you want to revisit.
            </EmptyState>
          )}

          {!!recommended.length && (
            <div>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="section-eyebrow">Recommended</p>
                  <h3 className="heading-md mt-2">You may also like</h3>
                </div>
                <Button variant="outline" onClick={() => navigate('shop')}>Shop More</Button>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {recommended.map((p) => <ProductCard key={p.id} product={p} navigate={navigate} compact />)}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
