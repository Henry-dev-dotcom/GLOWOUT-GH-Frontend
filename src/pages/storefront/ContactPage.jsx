import { useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { blogPosts, imageBank } from '../../data/defaultData';
import { Badge, Button, Card, EmptyState, Field, PageHero, ProductCard, ProductImage, SelectField, StatCard } from '../../components/Common';
import { money } from '../../utils/helpers';

export function ContactPage() {
  const { settings } = useStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', type: 'Product enquiry', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  function update(key, value) { setForm((current) => ({ ...current, [key]: value })); }
  function submit(e) {
    e.preventDefault();
    const messages = JSON.parse(localStorage.getItem('glowoutgh_contact_messages') || '[]');
    messages.unshift({ ...form, id: `MSG-${Date.now().toString().slice(-6)}`, createdAt: new Date().toISOString(), status: 'new' });
    localStorage.setItem('glowoutgh_contact_messages', JSON.stringify(messages));
    setSent(true);
    setForm({ name: '', email: '', phone: '', type: 'Product enquiry', subject: '', message: '' });
  }
  return (
    <>
      <PageHero eyebrow="Contact GLOWOUT GH" title="We are here to help">Send a product, delivery, order, return or wholesale enquiry and the team can follow up.</PageHero>
      <section className="pb-16">
        <div className="container-lux grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
          <div className="grid gap-5">
            <Card className="p-6"><h3 className="font-display text-2xl font-bold text-gold">Contact Details</h3><div className="mt-5 space-y-3 text-[#C8BAD0]"><p><strong className="text-white">Email:</strong> {settings.email}</p><p><strong className="text-white">Phone:</strong> {settings.phone}</p><p><strong className="text-white">WhatsApp:</strong> {settings.whatsapp}</p><p><strong className="text-white">Location:</strong> {settings.address}</p></div></Card>
            <Card className="p-6"><h3 className="font-display text-2xl font-bold text-gold">Support Hours</h3><p className="mt-3 leading-7 text-[#8A7A98]">Monday to Saturday, 9:00am - 6:00pm. Delivery and order updates are handled during working hours.</p></Card>
            <Card className="p-6"><h3 className="font-display text-2xl font-bold text-gold">Quick Help</h3><div className="mt-4 grid gap-3 text-sm text-[#C8BAD0]"><p>• Product recommendation and availability</p><p>• Delivery fee and order tracking</p><p>• Returns, exchanges and damaged items</p><p>• Wholesale or partnership requests</p></div></Card>
          </div>
          <Card className="p-7">
            <h3 className="font-display text-3xl font-bold">Send a message</h3>
            <p className="mt-2 text-sm leading-6 text-[#8A7A98]">This frontend stores messages locally for now. When connected to the backend, this form should create support tickets or send email notifications.</p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Full Name" required value={form.name} onChange={(e) => update('name', e.target.value)} /><Field label="Email" required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} /><SelectField label="Enquiry Type" value={form.type} onChange={(e) => update('type', e.target.value)}><option>Product enquiry</option><option>Order support</option><option>Delivery question</option><option>Returns and exchange</option><option>Wholesale / partnership</option></SelectField></div>
              <Field label="Subject" required value={form.subject} onChange={(e) => update('subject', e.target.value)} />
              <Field label="Message" as="textarea" required rows="6" value={form.message} onChange={(e) => update('message', e.target.value)} />
              {sent && <p className="rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-200">Message saved successfully. Backend email/ticket integration can be added next.</p>}
              <Button type="submit" className="w-full">Send Message</Button>
            </form>
          </Card>
        </div>
      </section>
    </>
  );
}
