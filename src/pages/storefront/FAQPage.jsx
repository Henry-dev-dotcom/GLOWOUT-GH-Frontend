import { useState } from 'react';
import { Button, Card, PageHero } from '../../components/Common';

const faqGroups = [
  {
    title: 'Shopping & Products',
    items: [
      ['Are GLOWOUT GH products authentic?', 'The storefront is built around authenticity messaging and product-detail transparency. In production, sourcing notes, supplier records and batch information can be connected through the backend.'],
      ['How do I choose the right product?', 'Use category pages, product descriptions, ratings, related products and the contact page for support. Product guides in the Beauty Journal also help customers compare options.'],
      ['Can I save products for later?', 'Yes. Use the wishlist button on a product card or product detail page to save products and move them to cart later.']
    ]
  },
  {
    title: 'Orders & Payment',
    items: [
      ['Which payment methods are supported?', 'The frontend supports Mobile Money, card, bank transfer and cash-on-delivery UI flows. Real payment processing will be activated through the backend payment integration.'],
      ['Can I use coupons?', 'Yes. Coupons are managed in the admin panel and validated during cart/checkout. Backend validation will prevent browser-side discount manipulation when connected.'],
      ['Will I receive order confirmation?', 'The UI creates order confirmation locally for now. Production email/SMS confirmation will be handled by the backend notification system.']
    ]
  },
  {
    title: 'Delivery & Tracking',
    items: [
      ['How do I track my order?', 'Use the Track Order page and enter your order number. Admin users can add courier details and tracking codes from the Orders Manager.'],
      ['Can delivery fees change?', 'Yes. Delivery fees, tax and thresholds are controlled from Store Settings and will later come from the backend settings API.'],
      ['What happens if an order is delayed?', 'The admin Orders Manager supports notes, courier updates and order status changes so customer support can communicate fulfilment progress.']
    ]
  },
  {
    title: 'Returns & Support',
    items: [
      ['Can I request a return?', 'Yes. The Returns page now includes a customer return request form. Admin users can review, approve, reject or close return requests.'],
      ['What items cannot be returned?', 'Used, damaged, altered or hygiene-sensitive items may be declined depending on store policy. The final business rules should be confirmed before launch.'],
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
            {faqGroups.map((group) => (
              <Card key={group.title} className="p-6">
                <h2 className="font-display text-3xl font-bold text-gold">{group.title}</h2>
                <div className="mt-5 space-y-3">
                  {group.items.map(([question, answer], index) => {
                    const key = `${group.title}-${index}`;
                    return <FAQItem key={key} question={question} answer={answer} open={openKey === key} onClick={() => setOpenKey(openKey === key ? '' : key)} />;
                  })}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
