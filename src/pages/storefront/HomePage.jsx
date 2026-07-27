import { Gem, Truck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { imageBank } from '../../data/defaultData';
import { Badge, Button, Card, ProductCard, Reveal, StatCard } from '../../components/Common';

export function HomePage({ navigate }) {
  const { products, visibleCategories, settings } = useStore();
  const featured = products.filter((p) => p.featured && p.available).slice(0, 4);
  return (
    <>
      <section className="relative min-h-[560px] overflow-hidden pt-20 md:min-h-[760px]">
        <div className="absolute inset-0 product-image opacity-30" style={{ backgroundImage: `url(${imageBank.hero})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/25" />
        <div className="container-lux relative flex min-h-[520px] items-center py-12 md:min-h-[720px] md:py-0">
          <div className="max-w-3xl">
            <Reveal><p className="section-eyebrow mb-5">{settings.tagline}</p></Reveal>
            <Reveal delay={80}><h1 className="heading-xl">Beauty that feels premium before checkout.</h1></Reveal>
            <Reveal delay={160}><p className="mt-6 max-w-2xl text-lg leading-9 text-[#C8BAD0]">Shop curated perfumes, skincare and wigs with authentic product details, smooth checkout, order tracking and a complete admin dashboard behind the store.</p></Reveal>
            <Reveal delay={240} className="mt-8 flex flex-wrap gap-3"><Button onClick={() => navigate('shop')}>Shop Collection</Button><Button variant="outline" onClick={() => navigate('categories')}>Explore Categories</Button></Reveal>
            <Reveal delay={320} className="mt-10 grid max-w-xl grid-cols-3 gap-2 sm:gap-3">
              <StatCard label="Products" value={products.length} hint="Managed in admin" compact />
              <StatCard label="Delivery" value="GH" hint="Configurable fees" compact />
              <StatCard label="Checkout" value="MoMo" hint="Ready for gateway" compact />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="pt-16 pb-20 md:pt-20">
        <div className="container-lux">
          <Reveal className="mb-8 flex items-end justify-between gap-4">
            <div><p className="section-eyebrow">Shop by Category</p><h2 className="heading-md mt-2">Find your glow faster</h2></div>
            <Button variant="outline" onClick={() => navigate('categories')}>All Categories</Button>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-4">
            {visibleCategories.map((cat, i) => (
              <Reveal key={cat.id} delay={i * 70} as="button" onClick={() => navigate('shop', { category: cat.slug })} className="group relative min-h-[260px] overflow-hidden rounded-3xl border border-[rgba(201,169,110,.12)] bg-surface-1 text-left">
                <div className="absolute inset-0 product-image opacity-70 transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${cat.image})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <Badge>{cat.featured ? 'Featured' : 'Category'}</Badge>
                  <h3 className="mt-3 font-display text-2xl font-bold">{cat.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#C8BAD0]">{cat.subtitle}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-1/45 py-20 md:py-24">
        <div className="container-lux">
          <Reveal className="mb-8"><p className="section-eyebrow">Featured Today</p><h2 className="heading-md mt-2">Handpicked for you, in stock now</h2></Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 70}>
                <ProductCard product={p} navigate={navigate} compact />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pt-20 pb-24">
        <div className="container-lux grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal className="h-[280px] rounded-3xl product-image sm:h-[360px] lg:h-[460px]" style={{ backgroundImage: `url(${imageBank.about})` }} />
          <div>
            <Reveal><p className="section-eyebrow">The GLOWOUT GH Promise</p></Reveal>
            <Reveal delay={80}><h2 className="heading-lg mt-3">Luxury feeling, practical shopping.</h2></Reveal>
            <Reveal delay={160}><p className="mt-5 text-lg leading-9 text-[#C8BAD0]">Authentic perfumes, skincare and wigs, curated with care and delivered across Ghana. Shop with clear pricing, live stock status and support that actually responds.</p></Reveal>
            <Reveal delay={240} className="mt-6 grid gap-4 sm:grid-cols-2">
              <Card className="p-5 transition duration-300 hover:-translate-y-1 hover:border-gold/30">
                <Gem size={20} className="text-gold" strokeWidth={1.5} />
                <h3 className="mt-3 font-bold text-gold">Authentic Products</h3>
                <p className="mt-2 text-sm leading-6 text-[#8A7A98]">Sourced from trusted suppliers, with real images, details and stock status on every page.</p>
              </Card>
              <Card className="p-5 transition duration-300 hover:-translate-y-1 hover:border-gold/30">
                <Truck size={20} className="text-gold" strokeWidth={1.5} />
                <h3 className="mt-3 font-bold text-gold">Reliable Delivery</h3>
                <p className="mt-2 text-sm leading-6 text-[#8A7A98]">Standard and express delivery options, with order tracking from checkout to your door.</p>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
