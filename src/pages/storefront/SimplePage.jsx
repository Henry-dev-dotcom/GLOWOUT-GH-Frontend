import { useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { blogPosts, imageBank } from '../../data/defaultData';
import { Badge, Button, Card, EmptyState, Field, PageHero, ProductCard, ProductImage, SelectField, StatCard } from '../../components/Common';
import { money } from '../../utils/helpers';

export function SimplePage({ type }) {
  const titles = {
    about: ['About GLOWOUT GH', 'A premium beauty store frontend with a complete admin system.'],
    faq: ['Frequently Asked Questions', 'Answers to common shopping, delivery, payment and returns questions.'],
    returns: ['Returns Policy', 'Clear guidance for exchanges, refunds and return requests.'],
    reviews: ['Customer Reviews', 'Social proof and product experience highlights.'],
    blog: ['Beauty Journal', 'Guides, routines and store updates.']
  };
  const [title, sub] = titles[type] || titles.about;
  if (type === 'blog') {
    return <><PageHero eyebrow="GLOWOUT GH" title={title}>{sub}</PageHero><section className="pb-16"><div className="container-lux"><div className="grid gap-6 md:grid-cols-3">{blogPosts.map((post) => <Card key={post.id} className="overflow-hidden"><div className="h-56 product-image" style={{ backgroundImage: `url(${post.image})` }} /><div className="p-6"><Badge>{post.category}</Badge><h3 className="mt-3 font-display text-2xl font-bold">{post.title}</h3><p className="mt-3 text-[#8A7A98]">{post.excerpt}</p></div></Card>)}</div></div></section></>;
  }
  const content = {
    about: ['Curated beauty commerce', 'GLOWOUT GH brings perfumes, skincare, wigs and bodycare into one polished shopping experience. The frontend is organised for growth and ready to connect to the backend API.'],
    faq: ['Shopping support', 'Customers can find answers on product authenticity, payment methods, delivery, order tracking and returns.'],
    returns: ['Simple return flow', 'Return requests can be created, reviewed and managed from the admin dashboard. Production rules can be connected through the backend.'],
    reviews: ['Customer confidence', 'Review cards and ratings help shoppers trust product quality before they buy.']
  }[type] || ['GLOWOUT GH', 'This page is ready for live content.'];
  return <><PageHero eyebrow="GLOWOUT GH" title={title}>{sub}</PageHero><section className="pb-16"><div className="container-lux grid gap-6 md:grid-cols-3"><Card className="p-8 md:col-span-2"><h3 className="font-display text-3xl font-bold text-gold">{content[0]}</h3><p className="mt-4 text-lg leading-8 text-[#8A7A98]">{content[1]}</p></Card>{['Authentic products', 'Secure checkout flow', 'Admin-ready operations'].map((item) => <Card key={item} className="p-8"><h3 className="font-display text-2xl font-bold text-gold">{item}</h3><p className="mt-3 leading-7 text-[#8A7A98]">This page is structured as part of the React frontend and can be expanded with live content from a CMS later.</p></Card>)}</div></section></>;
}
