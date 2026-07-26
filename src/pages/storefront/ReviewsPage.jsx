import { useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Badge, Button, Card, Field, PageHero, ProductImage, SelectField, StatCard } from '../../components/Common';

const seedReviews = [
  { id: 'rev_1', name: 'Ama M.', product: 'Luna Oud Eau de Parfum', rating: 5, title: 'Long-lasting and elegant', text: 'The scent feels premium and lasts through the evening without being too loud.', verified: true, date: 'June 2026' },
  { id: 'rev_2', name: 'Nana B.', product: 'Silk Press Bob Wig', rating: 5, title: 'Very soft finish', text: 'The unit looks polished and the styling feels easy to maintain.', verified: true, date: 'June 2026' },
  { id: 'rev_3', name: 'Akosua A.', product: 'Radiance Vitamin C Serum', rating: 4, title: 'Good glow routine product', text: 'Light texture and easy to layer with moisturiser. I like the product-page guidance.', verified: false, date: 'May 2026' }
];

function useLocalReviews() {
  const [reviews, setReviews] = useState(() => {
    try { return JSON.parse(localStorage.getItem('glowoutgh_react_reviews') || 'null') || seedReviews; } catch { return seedReviews; }
  });
  function save(next) {
    setReviews(next);
    try { localStorage.setItem('glowoutgh_react_reviews', JSON.stringify(next)); } catch {}
  }
  return [reviews, save];
}

function Stars({ rating }) {
  return <span className="text-gold">{'★★★★★'.slice(0, rating)}<span className="text-[#3A2E45]">{'★★★★★'.slice(rating)}</span></span>;
}

export function ReviewsPage({ navigate }) {
  const { products } = useStore();
  const [reviews, setReviews] = useLocalReviews();
  const [form, setForm] = useState({ name: '', product: products[0]?.name || '', rating: 5, title: '', text: '' });
  const [filter, setFilter] = useState('all');

  const avg = useMemo(() => reviews.length ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length : 0, [reviews]);
  const ratingCounts = [5, 4, 3, 2, 1].map((score) => ({ score, count: reviews.filter((review) => Number(review.rating) === score).length }));
  const filteredReviews = reviews.filter((review) => filter === 'all' || Number(review.rating) === Number(filter));
  const topProducts = products.filter((product) => product.rating >= 4.7).slice(0, 3);

  function update(field, value) { setForm((current) => ({ ...current, [field]: value })); }
  function submit(e) {
    e.preventDefault();
    if (!form.name || !form.title || !form.text) return;
    setReviews([{ ...form, id: `rev_${Date.now()}`, rating: Number(form.rating), verified: false, date: 'Just now' }, ...reviews]);
    setForm({ name: '', product: products[0]?.name || '', rating: 5, title: '', text: '' });
  }

  return (
    <>
      <PageHero eyebrow="Customer Reviews" title="Real shopping confidence starts with clear feedback.">
        Read customer impressions, product highlights and ratings across perfumes, skincare, wigs and bodycare.
      </PageHero>

      <section className="pb-16">
        <div className="container-lux grid gap-5 md:grid-cols-4">
          <StatCard label="Average Rating" value={avg.toFixed(1)} hint="Across visible reviews" />
          <StatCard label="Reviews" value={reviews.length} hint="From our customers" />
          <StatCard label="Verified" value={reviews.filter((r) => r.verified).length} hint="Verified buyers" />
          <StatCard label="Top Products" value={topProducts.length} hint="Rated 4.7+" />
        </div>
      </section>

      <section className="pb-16">
        <div className="container-lux grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-5">
            <Card className="p-6 text-center">
              <div className="font-display text-6xl font-black text-gold">{avg.toFixed(1)}</div>
              <div className="mt-2 text-xl"><Stars rating={Math.round(avg)} /></div>
              <p className="mt-2 text-[#8A7A98]">Based on {reviews.length} review{reviews.length === 1 ? '' : 's'}</p>
              <div className="mt-6 space-y-3">
                {ratingCounts.map(({ score, count }) => (
                  <button key={score} onClick={() => setFilter(filter === String(score) ? 'all' : String(score))} className="grid w-full grid-cols-[42px_1fr_32px] items-center gap-3 text-sm text-[#C8BAD0]">
                    <span>{score}★</span>
                    <span className="h-2 overflow-hidden rounded-full bg-surface-3"><span className="block h-full rounded-full bg-gold" style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }} /></span>
                    <span>{count}</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display text-2xl font-bold">Write a review</h3>
              <form onSubmit={submit} className="mt-5 space-y-4">
                <Field label="Name" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Your name" />
                <SelectField label="Product" value={form.product} onChange={(e) => update('product', e.target.value)}>
                  {products.map((product) => <option key={product.id}>{product.name}</option>)}
                </SelectField>
                <SelectField label="Rating" value={form.rating} onChange={(e) => update('rating', e.target.value)}>
                  {[5, 4, 3, 2, 1].map((score) => <option key={score} value={score}>{score} star{score === 1 ? '' : 's'}</option>)}
                </SelectField>
                <Field label="Review title" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Short headline" />
                <Field label="Review" as="textarea" rows="4" value={form.text} onChange={(e) => update('text', e.target.value)} placeholder="Share your experience." />
                <Button type="submit" className="w-full">Submit Review</Button>
              </form>
            </Card>
          </aside>

          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="heading-md">Review Feed</h2>
              <button onClick={() => setFilter('all')} className="text-sm font-bold text-gold hover:text-gold-bright">Show all</button>
            </div>
            {filteredReviews.map((review) => (
              <Card key={review.id} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-2xl font-bold">{review.title}</h3>
                      {review.verified && <Badge status="active">Verified buyer</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-[#8A7A98]">{review.name} · {review.date} · {review.product}</p>
                  </div>
                  <div className="text-xl"><Stars rating={Number(review.rating)} /></div>
                </div>
                <p className="mt-5 leading-8 text-[#C8BAD0]">{review.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-lux">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-eyebrow">Customer favourites</p>
              <h2 className="heading-md mt-3">Highly rated products.</h2>
            </div>
            <Button variant="outline" onClick={() => navigate('shop')}>Shop all</Button>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {topProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <ProductImage product={product} className="h-60" rounded={false} />
                <div className="p-5">
                  <Badge>{product.rating} ★ · {product.reviews} reviews</Badge>
                  <h3 className="mt-3 font-display text-2xl font-bold">{product.name}</h3>
                  <button onClick={() => navigate('product', { product: product.slug || product.id })} className="mt-4 text-sm font-bold text-gold hover:text-gold-bright">View product →</button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
