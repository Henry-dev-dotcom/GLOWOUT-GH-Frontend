import { useStore } from '../../context/StoreContext';
import { imageBank } from '../../data/defaultData';
import { Button, Card, PageHero, StatCard } from '../../components/Common';

const values = [
  ['Authenticity first', 'Every product page is structured to support verified sourcing, batch notes and transparent product details once the backend is connected.'],
  ['Beauty that feels personal', 'GLOWOUT GH is designed around guided discovery: fragrance moods, skin goals, wig care needs and clear shopping support.'],
  ['Operationally ready', 'The storefront is paired with admin tools for products, categories, orders, coupons, returns, customers, finance and team access.']
];

const promises = [
  'Curated perfumes, skincare, wigs and bodycare for everyday confidence.',
  'Clear product information, stock status and order tracking from purchase to delivery.',
  'Responsive shopping experience across mobile, tablet and desktop.',
  'A backend-ready structure for real payments, authentication and database storage.'
];

export function AboutPage({ navigate }) {
  const { products, visibleCategories, orders, customers, settings } = useStore();
  const featured = products.filter((product) => product.featured).slice(0, 3);

  return (
    <>
      <PageHero eyebrow="About GLOWOUT GH" title="Luxury beauty shopping built for trust, speed and style." image={imageBank.about}>
        GLOWOUT GH brings perfumes, skincare, wigs and bodycare into one refined online store experience, with a storefront and admin system prepared for real e-commerce operations.
      </PageHero>

      <section className="pb-16">
        <div className="container-lux grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <p className="section-eyebrow">Our Story</p>
            <h2 className="heading-lg mt-4">A beauty house designed for confident discovery.</h2>
            <p className="mt-6 text-lg leading-9 text-[#C8BAD0]">
              GLOWOUT GH is positioned as a premium beauty destination where customers can shop fragrance, skin essentials and hair products without confusion. The brand experience is built to feel editorial, clean and high-trust while still supporting practical selling tools such as stock control, order management, coupons and returns.
            </p>
            <p className="mt-4 leading-8 text-[#8A7A98]">
              This React frontend keeps the dark luxury identity from the original design while turning the site into a scalable app. The next production step is connecting the pages to the backend API so inventory, accounts, payments and orders become live.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => navigate('shop')}>Shop Collection</Button>
              <Button variant="outline" onClick={() => navigate('contact')}>Contact Support</Button>
            </div>
          </div>
          <Card className="overflow-hidden">
            <div className="h-[260px] product-image sm:h-[340px] lg:h-[420px]" style={{ backgroundImage: `url(${imageBank.about})` }} />
          </Card>
        </div>
      </section>

      <section className="pb-16">
        <div className="container-lux grid gap-4 md:grid-cols-4">
          <StatCard label="Products Ready" value={products.length} hint="Managed from admin" />
          <StatCard label="Categories" value={visibleCategories.length} hint="Visible in storefront" />
          <StatCard label="Orders Tracked" value={orders.length} hint="Local demo until API" />
          <StatCard label="Customers" value={customers.length} hint="Account-ready" />
        </div>
      </section>

      <section className="pb-16">
        <div className="container-lux">
          <div className="mb-8 max-w-3xl">
            <p className="section-eyebrow">Brand Values</p>
            <h2 className="heading-md mt-3">What every section of the store should communicate.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {values.map(([title, body]) => (
              <Card key={title} className="p-7">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-2xl text-gold">✦</div>
                <h3 className="font-display text-2xl font-bold text-gold">{title}</h3>
                <p className="mt-4 leading-8 text-[#8A7A98]">{body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container-lux grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
          <Card className="p-8">
            <p className="section-eyebrow">GLOWOUT GH Promise</p>
            <h2 className="heading-md mt-4">A clearer beauty journey from browsing to delivery.</h2>
            <div className="mt-6 space-y-4">
              {promises.map((promise) => (
                <div key={promise} className="flex gap-3 rounded-2xl border border-[rgba(201,169,110,.12)] bg-surface-2/60 p-4">
                  <span className="mt-1 text-gold">✓</span>
                  <p className="leading-7 text-[#C8BAD0]">{promise}</p>
                </div>
              ))}
            </div>
          </Card>
          <div className="grid gap-5 sm:grid-cols-3">
            {featured.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="h-52 product-image" style={{ backgroundImage: `url(${product.images?.[0]})` }} />
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-gold/70">{product.brand}</p>
                  <h3 className="mt-2 font-display text-xl font-bold">{product.name}</h3>
                  <button onClick={() => navigate('product', { product: product.id })} className="mt-4 text-sm font-bold text-gold hover:text-gold-bright">View product →</button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-lux">
          <Card className="grid gap-8 overflow-hidden p-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="section-eyebrow">Support</p>
              <h2 className="heading-md mt-3">Need help choosing the right product?</h2>
              <p className="mt-4 max-w-2xl leading-8 text-[#8A7A98]">Contact {settings.storeName} for product guidance, order questions, delivery support or return assistance.</p>
            </div>
            <Button onClick={() => navigate('contact')}>Talk to GLOWOUT GH</Button>
          </Card>
        </div>
      </section>
    </>
  );
}
