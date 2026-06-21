import { money, statusClass } from '../utils/helpers';
import { useStore } from '../context/StoreContext';

export function Button({ children, variant = 'gold', className = '', ...props }) {
  const styles = variant === 'gold' ? 'btn btn-gold' : variant === 'outline' ? 'btn btn-outline' : variant === 'danger' ? 'btn btn-danger' : 'btn btn-ghost';
  return <button className={`${styles} ${className}`} {...props}>{children}</button>;
}

export function Card({ children, className = '' }) {
  return <div className={`lux-card ${className}`}>{children}</div>;
}

export function Field({ label, as = 'input', className = '', ...props }) {
  const Component = as;
  return <label className="block"><span className="label">{label}</span><Component className={`field ${className}`} {...props} /></label>;
}

export function SelectField({ label, children, className = '', ...props }) {
  return <label className="block"><span className="label">{label}</span><select className={`field ${className}`} {...props}>{children}</select></label>;
}

export function Badge({ children, status = '' }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${statusClass(status)}`}>{children}</span>;
}

export function PageHero({ eyebrow, title, children, image }) {
  return (
    <section className="relative overflow-hidden pt-28 pb-12">
      {image && <div className="absolute inset-0 opacity-20 product-image" style={{ backgroundImage: `url(${image})` }} />}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-0/50 via-surface-0/80 to-surface-0" />
      <div className="container-lux relative text-center">
        {eyebrow && <p className="section-eyebrow mb-4">{eyebrow}</p>}
        <h1 className="heading-lg">{title}</h1>
        {children && <div className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#C8BAD0]">{children}</div>}
      </div>
    </section>
  );
}

export function ProductImage({ product, className = 'h-64', rounded = true }) {
  const image = product?.images?.[0] || product?.image || '';
  return (
    <div className={`${className} ${rounded ? 'rounded-2xl' : ''} product-image relative overflow-hidden border border-[rgba(201,169,110,.12)] bg-surface-2`} style={{ backgroundImage: image ? `url(${image})` : undefined }}>
      {!image && <div className="flex h-full items-center justify-center text-5xl">✨</div>}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />
    </div>
  );
}

export function ProductCard({ product, navigate, compact = false }) {
  const { addToCart, toggleWishlist, wishlist, settings } = useStore();
  const liked = wishlist.includes(product.id);
  return (
    <article className="group overflow-hidden rounded-2xl border border-[rgba(201,169,110,.12)] bg-surface-1 transition hover:-translate-y-1 hover:border-gold/40 hover:shadow-glow">
      <button onClick={() => navigate('product', { product: product.id })} className="block w-full text-left">
        <ProductImage product={product} className={compact ? 'h-48' : 'h-64'} rounded={false} />
      </button>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[.16em] text-gold/70">{product.brand}</span>
          {product.badge && <span className="rounded-full bg-rose-deep/35 px-2 py-1 text-[10px] font-bold uppercase text-rose-light">{product.badge}</span>}
        </div>
        <button onClick={() => navigate('product', { product: product.id })} className="text-left font-display text-lg font-bold leading-snug text-white hover:text-gold">{product.name}</button>
        <div className="mt-2 flex items-center justify-between text-sm text-[#8A7A98]">
          <span>★ {product.rating} · {product.reviews}</span>
          <span>{product.stock > 0 ? `${product.stock} left` : 'Out of stock'}</span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-xl font-bold text-gold">{money(product.price, settings.currency)}</span>
          {product.wasPrice > 0 && <span className="text-sm text-[#564869] line-through">{money(product.wasPrice, settings.currency)}</span>}
        </div>
        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <Button disabled={!product.available || product.stock <= 0} onClick={() => addToCart(product.id)} className="w-full">Add to Cart</Button>
          <Button variant="ghost" onClick={() => toggleWishlist(product.id)} className={liked ? 'text-rose-light' : ''}>{liked ? '♥' : '♡'}</Button>
        </div>
      </div>
    </article>
  );
}

export function StatCard({ label, value, hint }) {
  return <Card className="p-5"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#8A7A98]">{label}</p><p className="mt-2 font-display text-3xl font-bold text-white">{value}</p>{hint && <p className="mt-1 text-sm text-[#8A7A98]">{hint}</p>}</Card>;
}

export function EmptyState({ title, children, action }) {
  return <Card className="p-10 text-center"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-2xl">✨</div><h3 className="font-display text-2xl font-bold">{title}</h3><p className="mx-auto mt-3 max-w-xl text-[#8A7A98]">{children}</p>{action && <div className="mt-6">{action}</div>}</Card>;
}


export function Notice({ title, children, tone = 'gold' }) {
  const tones = {
    gold: 'border-gold/20 bg-gold/10 text-gold-light',
    success: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
    warning: 'border-amber-300/20 bg-amber-300/10 text-amber-100',
    danger: 'border-rose/25 bg-rose/10 text-rose-light'
  };
  return <div className={`status-panel ${tones[tone] || tones.gold}`} role="status"><p className="font-bold">{title}</p>{children && <div className="mt-1 text-sm opacity-90">{children}</div>}</div>;
}

export function LoadingBlock({ label = 'Loading...' }) {
  return (
    <div className="lux-card animate-pulse p-6" role="status" aria-live="polite">
      <div className="mb-4 h-4 w-32 rounded bg-surface-3" />
      <div className="mb-3 h-8 w-2/3 rounded bg-surface-3" />
      <div className="h-4 w-full rounded bg-surface-3" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
