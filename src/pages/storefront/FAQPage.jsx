import { useState } from 'react';
import { Button, Card, PageHero, Reveal } from '../../components/Common';

const faqGroups = [
  {
    title: 'Shopping & Products',
    items: [
      ['Are GlowOut gh products authentic?', 'Yes. We source every perfume, skincare product and wig from trusted suppliers and verified distributors, and each product page shows clear details so you know exactly what you are buying.'],
      ['How do I choose the right product?', 'Use category pages, product descriptions, ratings, related products and the contact page for support. Product guides in the Beauty Journal also help customers compare options.'],
      ['Can I save products for later?', 'Yes. Use the wishlist button on a product card or product detail page to save products and move them to cart later.']
    ]
  },
  {
    title: 'Orders & Payment',
    items: [
      ['Which payment methods are supported?', 'You can pay with Mobile Money (MTN, Telecel or AirtelTigo), Visa or Mastercard, bank transfer, or cash on delivery in selected areas.'],
      ['Will I receive order confirmation?', 'Yes. You receive your order number immediately after checkout, and our team confirms every order before it is dispatched.']
    ]
  },
  {
    title: 'Delivery & Tracking',
    items: [
      ['How do I track my order?', 'Use the Track Order page and enter your order number. You will see your fulfilment status, courier details and delivery timeline as they update.'],
      ['Can delivery fees change?', 'Delivery fees depend on your location and the delivery option you choose. Orders above our free-delivery threshold are delivered free.'],
      ['What happens if an order is delayed?', 'Our support team will keep you updated with courier details and status changes. You can also contact us any time with your order number for an update.']
    ]
  },
  {
    title: 'Returns & Support',
    items: [
      ['Can I request a return?', 'Yes. Submit a return request from the Returns page with your order number and our team will review it and get back to you.'],
      ['What items cannot be returned?', 'Used, damaged, altered or hygiene-sensitive items (such as opened skincare or worn wigs) may not be eligible for return. See the Returns page for full details.'],
      ['How do I contact support?', 'Use the Contact page for general questions, product support, order support or returns assistance.']
    ]
  }
];

function FAQItem({ question, answer, open, onClick }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[rgba(201,169,110,.12)] bg-surface-1">
      <button onClick={onClick} className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold text-[#F5EFE8] hover:bg-surface-2">
        <span>{question}</span>
        <span className="text-xl text-gold">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="border-t border-[rgba(201,169,110,.12)] p-5 leading-8 text-[#8A7A98]">{answer}</div>}
    </div>
  );
}

export function FAQPage({ navigate }) {
  const [openKey, setOpenKey] = useState('Shopping & Products-0');

  return (
    <>
      <PageHero eyebrow="Help Centre" title="Frequently asked questions.">
        Answers to common questions about shopping, product care, payment, delivery, tracking and returns.
      </PageHero>

      <section className="pb-16">
        <div className="container-lux grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4">
            <Card className="p-6">
              <h3 className="font-display text-2xl font-bold">Need direct help?</h3>
              <p className="mt-3 leading-7 text-[#8A7A98]">Contact GLOWOUT GH support for order, delivery, product or return questions.</p>
              <Button onClick={() => navigate('contact')} className="mt-5 w-full">Contact Support</Button>
            </Card>
            <Card className="p-6">
              <h3 className="font-display text-xl font-bold text-gold">Fast links</h3>
              <div className="mt-4 space-y-2">
                {['Shop', 'Track Order', 'Returns'].map((item) => (
                  <button key={item} onClick={() => navigate(item === 'Shop' ? 'shop' : item === 'Track Order' ? 'tracking' : 'returns')} className="block w-full rounded-xl border border-[rgba(201,169,110,.12)] px-4 py-3 text-left text-[#C8BAD0] hover:border-gold/40 hover:text-gold">{item}</button>
                ))}
              </div>
            </Card>
          </aside>

          <div className="space-y-8">
            {faqGroups.map((group, i) => (
              <Reveal key={group.title} delay={i * 60}>
              <Card className="p-6">
                <h2 className="font-display text-3xl font-bold text-gold">{group.title}</h2>
                <div className="mt-5 space-y-3">
                  {group.items.map(([question, answer], index) => {
                    const key = `${group.title}-${index}`;
                    return <FAQItem key={key} question={question} answer={answer} open={openKey === key} onClick={() => setOpenKey(openKey === key ? '' : key)} />;
                  })}
                </div>
              </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
