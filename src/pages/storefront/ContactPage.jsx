import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { contactApi } from '../../services';
import { isValidGhanaPhone } from '../../utils/helpers';
import { Card, Field, PageHero, SelectField, Button } from '../../components/Common';

export function ContactPage() {
  const { settings } = useStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', type: 'Product enquiry', subject: '', message: '' });
  const [status, setStatus] = useState({ state: 'idle', text: '' });
  function update(key, value) { setForm((current) => ({ ...current, [key]: value })); }
  async function submit(e) {
    e.preventDefault();
    if (form.phone && !isValidGhanaPhone(form.phone)) return setStatus({ state: 'error', text: 'Please enter a valid Ghana phone number, e.g. 024 000 0000.' });
    setStatus({ state: 'sending', text: 'Sending your message...' });
    try {
      await contactApi.submit(form);
      setStatus({ state: 'sent', text: `Message received. For an urgent response, reach us on WhatsApp at ${settings.whatsapp}.` });
      setForm({ name: '', email: '', phone: '', type: 'Product enquiry', subject: '', message: '' });
    } catch (error) {
      setStatus({ state: 'error', text: error?.message || `Sorry, we could not send your message. Please try again or WhatsApp us at ${settings.whatsapp}.` });
    }
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
            <p className="mt-2 text-sm leading-6 text-[#8A7A98]">Send us your enquiry and the team will follow up during support hours. For urgent order questions, WhatsApp or phone is fastest.</p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Full Name" required value={form.name} onChange={(e) => update('name', e.target.value)} /><Field label="Email" required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} /><SelectField label="Enquiry Type" value={form.type} onChange={(e) => update('type', e.target.value)}><option>Product enquiry</option><option>Order support</option><option>Delivery question</option><option>Returns and exchange</option><option>Wholesale / partnership</option></SelectField></div>
              <Field label="Subject" required value={form.subject} onChange={(e) => update('subject', e.target.value)} />
              <Field label="Message" as="textarea" required rows="6" value={form.message} onChange={(e) => update('message', e.target.value)} />
              {status.state !== 'idle' && <p className={`rounded-xl p-3 text-sm ${status.state === 'error' ? 'bg-rose/10 text-rose-light' : status.state === 'sent' ? 'bg-emerald-400/10 text-emerald-200' : 'bg-surface-2 text-[#C8BAD0]'}`}>{status.text}</p>}
              <Button type="submit" className="w-full" disabled={status.state === 'sending'}>{status.state === 'sending' ? 'Sending...' : 'Send Message'}</Button>
            </form>
          </Card>
        </div>
      </section>
    </>
  );
}
