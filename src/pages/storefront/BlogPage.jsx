import { useMemo, useState } from 'react';
import { blogPosts, imageBank } from '../../data/defaultData';
import { Badge, Button, Card, Field, PageHero } from '../../components/Common';

const extendedPosts = blogPosts.map((post, index) => ({
  ...post,
  author: ['GLOWOUT GH Editorial', 'Skin Ritual Team', 'Haus Hair Desk'][index] || 'GLOWOUT GH Editorial',
  readTime: ['4 min read', '5 min read', '6 min read'][index] || '4 min read',
  date: ['June 12, 2026', 'June 8, 2026', 'June 2, 2026'][index] || 'June 2026',
  body: [
    'A refined beauty routine starts with intention. Choose a hero product, understand when to use it, then build supportive steps around it instead of overloading your shelf.',
    'For a clean GLOWOUT GH routine, focus on consistency: cleanse gently, hydrate daily, protect your skin, then treat specific concerns with one focused active at a time.',
    'Premium wigs stay beautiful when handled with care. Store the unit properly, detangle gently, avoid unnecessary heat and keep lace clean so the finish stays soft and natural.'
  ][index]
}));

const categories = ['All', ...new Set(extendedPosts.map((post) => post.category))];

export function BlogPage({ navigate, params = {} }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const activePost = params.post ? extendedPosts.find((post) => post.id === params.post) : null;

  const posts = useMemo(() => extendedPosts.filter((post) => {
    const search = `${post.title} ${post.excerpt} ${post.category}`.toLowerCase();
    return search.includes(query.toLowerCase()) && (category === 'All' || post.category === category);
  }), [query, category]);

  if (activePost) {
    const related = extendedPosts.filter((post) => post.id !== activePost.id).slice(0, 2);
    return (
      <>
        <PageHero eyebrow={activePost.category} title={activePost.title} image={activePost.image}>
          {activePost.excerpt}
        </PageHero>
        <section className="pb-16">
          <div className="container-lux grid gap-8 lg:grid-cols-[1fr_320px]">
            <Card className="overflow-hidden">
              <div className="h-80 product-image" style={{ backgroundImage: `url(${activePost.image})` }} />
              <article className="p-8">
                <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-[#8A7A98]">
                  <Badge>{activePost.category}</Badge>
                  <span>{activePost.date}</span>
                  <span>•</span>
                  <span>{activePost.readTime}</span>
                  <span>•</span>
                  <span>{activePost.author}</span>
                </div>
                <p className="text-lg leading-9 text-[#C8BAD0]">{activePost.body}</p>
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {['What to remember', 'GLOWOUT GH tip'].map((title, index) => (
                    <div key={title} className="rounded-2xl border border-[rgba(201,169,110,.12)] bg-surface-2 p-5">
                      <h3 className="font-display text-xl font-bold text-gold">{title}</h3>
                      <p className="mt-3 leading-7 text-[#8A7A98]">{index === 0 ? 'Keep your routine simple, consistent and matched to your actual product goals.' : 'Use the shop filters and product detail notes to compare products before buying.'}</p>
                    </div>
                  ))}
                </div>
              </article>
            </Card>
            <aside className="space-y-5">
              <Button variant="outline" onClick={() => navigate('blog')} className="w-full">← Back to Journal</Button>
              <Card className="p-6">
                <h3 className="font-display text-2xl font-bold">Related reads</h3>
                <div className="mt-5 space-y-4">
                  {related.map((post) => (
                    <button key={post.id} onClick={() => navigate('blog', { post: post.id })} className="block w-full rounded-2xl border border-[rgba(201,169,110,.12)] p-4 text-left hover:border-gold/40">
                      <p className="text-xs font-bold uppercase tracking-[.14em] text-gold/70">{post.category}</p>
                      <h4 className="mt-2 font-display text-lg font-bold">{post.title}</h4>
                    </button>
                  ))}
                </div>
              </Card>
            </aside>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero eyebrow="Beauty Journal" title="Guides for fragrance, skincare and hair confidence." image={imageBank.blog}>
        Read practical GLOWOUT GH notes for choosing products, building routines and keeping beauty essentials in premium condition.
      </PageHero>

      <section className="pb-16">
        <div className="container-lux">
          <Card className="mb-8 grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-end">
            <Field label="Search journal" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search perfume, skincare, wig care..." />
            <div>
              <span className="label">Category</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button key={item} onClick={() => setCategory(item)} className={`rounded-full border px-4 py-2 text-sm font-bold ${category === item ? 'border-gold bg-gold text-ink' : 'border-[rgba(201,169,110,.2)] text-[#C8BAD0] hover:text-gold'}`}>{item}</button>
                ))}
              </div>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
            {posts[0] && (
              <Card className="overflow-hidden">
                <div className="h-96 product-image" style={{ backgroundImage: `url(${posts[0].image})` }} />
                <div className="p-7">
                  <Badge>{posts[0].category}</Badge>
                  <h2 className="mt-4 font-display text-3xl font-bold">{posts[0].title}</h2>
                  <p className="mt-4 leading-8 text-[#8A7A98]">{posts[0].excerpt}</p>
                  <Button onClick={() => navigate('blog', { post: posts[0].id })} className="mt-6">Read Article</Button>
                </div>
              </Card>
            )}
            <div className="grid gap-6">
              {posts.slice(1).map((post) => (
                <Card key={post.id} className="grid overflow-hidden md:grid-cols-[180px_1fr]">
                  <div className="min-h-48 product-image" style={{ backgroundImage: `url(${post.image})` }} />
                  <div className="p-6">
                    <Badge>{post.category}</Badge>
                    <h3 className="mt-3 font-display text-2xl font-bold">{post.title}</h3>
                    <p className="mt-3 leading-7 text-[#8A7A98]">{post.excerpt}</p>
                    <button onClick={() => navigate('blog', { post: post.id })} className="mt-4 text-sm font-bold text-gold hover:text-gold-bright">Read more →</button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
