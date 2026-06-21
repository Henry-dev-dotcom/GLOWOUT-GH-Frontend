import { useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { blogPosts, imageBank } from '../../data/defaultData';
import { Badge, Button, Card, EmptyState, Field, PageHero, ProductCard, ProductImage, SelectField, StatCard } from '../../components/Common';
import { money } from '../../utils/helpers';

export function CategoriesPage({ navigate }) {
  const { categories, products } = useStore();
  return <><PageHero eyebrow="Categories" title="Shop by beauty need">Choose a category and explore products connected to the Product Manager.</PageHero><section className="pb-16"><div className="container-lux grid gap-6 md:grid-cols-2 xl:grid-cols-4">{categories.map((cat) => { const count = products.filter((p) => p.category === cat.slug).length; return <button key={cat.id} onClick={() => navigate('shop', { category: cat.slug })} className="group overflow-hidden rounded-3xl border border-[rgba(201,169,110,.12)] bg-surface-1 text-left transition hover:-translate-y-1 hover:border-gold/40"><div className="h-64 product-image transition group-hover:scale-105" style={{ backgroundImage: `url(${cat.image})` }} /><div className="p-6"><div className="mb-3 flex justify-between"><Badge>{cat.visible ? 'Visible' : 'Hidden'}</Badge><span className="text-sm text-[#8A7A98]">{count} items</span></div><h3 className="font-display text-2xl font-bold">{cat.name}</h3><p className="mt-2 text-sm leading-6 text-[#8A7A98]">{cat.subtitle}</p></div></button>; })}</div></section></>;
}
