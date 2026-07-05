import { useStore } from '../../context/StoreContext';
import { Card, PageHero } from '../../components/Common';

function sections(type, store) {
  const name = store.settings.storeName || 'GlowOut gh';
  const email = store.settings.email || 'support@glowoutgh.com';
  if (type === 'privacy') {
    return {
      eyebrow: 'Legal',
      title: 'Privacy Policy',
      intro: `This policy explains what information ${name} collects, how we use it, and the choices you have. By using our website you agree to the practices described here.`,
      blocks: [
        ['Information we collect', `We collect the details you provide when you create an account, place an order or contact us — such as your name, email, phone number and delivery address. We also collect basic technical data (like device and browsing information) to keep the store secure and working well.`],
        ['How we use your information', `We use your information to process and deliver your orders, confirm payments, respond to enquiries, prevent fraud, and — where you have agreed — send you offers and updates. We do not sell your personal information.`],
        ['Payments', `Card and Mobile Money payments are processed by our payment provider (Paystack). We do not store your full card details on our servers; they are handled securely by the payment provider.`],
        ['Sharing', `We share information only with the partners needed to run the store — for example delivery couriers and our payment provider — and where required by law. These partners are expected to protect your information.`],
        ['Data retention & security', `We keep your information for as long as needed to provide our services and meet legal obligations, then delete or anonymise it. We use reasonable technical and organisational measures to protect your data.`],
        ['Your rights', `You may request access to, correction of, or deletion of your personal information, and you can opt out of marketing messages at any time. Contact us to make a request.`],
        ['Contact', `Questions about this policy? Email us at ${email}.`]
      ]
    };
  }
  return {
    eyebrow: 'Legal',
    title: 'Terms of Service',
    intro: `These terms govern your use of the ${name} website and your purchases from us. By placing an order you agree to these terms.`,
    blocks: [
      ['Orders', `An order is an offer to buy. We confirm orders once payment is received or, for cash on delivery, once the order is verified. We may decline or cancel an order if an item is unavailable, a pricing error occurs, or payment cannot be confirmed.`],
      ['Pricing & payment', `All prices are shown in Ghana Cedis (GH₵) and include applicable taxes where stated. Delivery fees are shown at checkout. We accept Mobile Money, card, bank transfer and, in selected areas, cash on delivery.`],
      ['Delivery', `Delivery times are estimates and may vary. Risk in the goods passes to you on delivery. Please provide accurate delivery details — we are not responsible for delays caused by incorrect information.`],
      ['Returns & refunds', `Eligible items may be returned in line with our Returns Policy. Used, damaged, altered or hygiene-sensitive items (such as opened skincare or worn wigs) may not be eligible. Approved refunds are made to your original payment method.`],
      ['Product information', `We work to describe products accurately, but colours and finishes may vary slightly from images. Products are intended for normal personal use; follow any usage or care instructions provided.`],
      ['Acceptable use', `You agree not to misuse the website, attempt to gain unauthorised access, or use it for unlawful purposes.`],
      ['Liability', `To the extent permitted by law, ${name} is not liable for indirect or consequential loss. Nothing in these terms limits rights you have under applicable consumer law.`],
      ['Changes', `We may update these terms from time to time. The version shown here applies to your current use of the site.`],
      ['Contact', `Questions about these terms? Email us at ${email}.`]
    ]
  };
}

export function LegalPage({ type = 'terms' }) {
  const store = useStore();
  const { eyebrow, title, intro, blocks } = sections(type, store);
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title}>{intro}</PageHero>
      <section className="pb-16">
        <div className="container-lux max-w-3xl space-y-5">
          {blocks.map(([heading, body]) => (
            <Card key={heading} className="p-6">
              <h2 className="font-display text-2xl font-bold text-gold">{heading}</h2>
              <p className="mt-3 leading-8 text-[#C8BAD0]">{body}</p>
            </Card>
          ))}
          <p className="px-2 text-sm text-[#8A7A98]">Last updated {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}. This is a general template — have it reviewed by a qualified professional before launch to match your business and local law.</p>
        </div>
      </section>
    </>
  );
}
