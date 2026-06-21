import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Badge, Button, Card, Field, PageHero, SelectField } from '../../components/Common';
import { money } from '../../utils/helpers';

const steps = [
  ['1', 'Submit request', 'Send your order number, item details and reason for return.'],
  ['2', 'Review', 'GLOWOUT GH support checks eligibility, timing and product condition.'],
  ['3', 'Decision', 'The request is approved, rejected or moved to exchange guidance.'],
  ['4', 'Refund or close', 'Approved cases are refunded, exchanged or closed after confirmation.']
];

const policyBlocks = [
  ['Eligible items', ['Wrong item received', 'Damaged item reported quickly', 'Unopened qualifying product', 'Approved exchange request']],
  ['May be declined', ['Used beauty/hygiene-sensitive items', 'Altered or damaged packaging', 'Late request outside policy window', 'Products without order reference']],
  ['Helpful evidence', ['Order number', 'Clear product photos', 'Delivery date', 'Reason for return or exchange']]
];

export function ReturnsPolicyPage({ navigate }) {
  const { upsertReturn, returns, orders, settings } = useStore();
  const [form, setForm] = useState({ orderId: '', customer: '', reason: 'Wrong item received', refundAmount: '', notes: '' });
  const [message, setMessage] = useState('');

  function update(field, value) { setForm((current) => ({ ...current, [field]: value })); }
  function submit(e) {
    e.preventDefault();
    if (!form.orderId || !form.customer || !form.reason) {
      setMessage('Please enter your order number, name and return reason.');
      return;
    }
    const created = upsertReturn({ ...form, status: 'requested', refundAmount: Number(form.refundAmount || 0) });
    setMessage(`Return request ${created.id} has been created for admin review.`);
    setForm({ orderId: '', customer: '', reason: 'Wrong item received', refundAmount: '', notes: '' });
  }

  return (
    <>
      <PageHero eyebrow="Returns & Exchanges" title="A clear return process for confident shopping.">
        Submit a return request, understand eligibility and follow the status from review to final decision.
      </PageHero>

      <section className="pb-16">
        <div className="container-lux grid gap-5 md:grid-cols-4">
          {steps.map(([num, title, body]) => (
            <Card key={num} className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold font-black text-ink">{num}</div>
              <h3 className="mt-5 font-display text-xl font-bold">{title}</h3>
              <p className="mt-3 leading-7 text-[#8A7A98]">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="pb-16">
        <div className="container-lux grid gap-8 lg:grid-cols-[1fr_.9fr]">
          <Card className="p-7">
            <p className="section-eyebrow">Request Form</p>
            <h2 className="heading-md mt-3">Start a return request.</h2>
            <form onSubmit={submit} className="mt-6 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Order number" value={form.orderId} onChange={(e) => update('orderId', e.target.value)} placeholder="GH-1001" />
                <Field label="Customer name" value={form.customer} onChange={(e) => update('customer', e.target.value)} placeholder="Your full name" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField label="Return reason" value={form.reason} onChange={(e) => update('reason', e.target.value)}>
                  <option>Wrong item received</option>
                  <option>Damaged item</option>
                  <option>Exchange request</option>
                  <option>Changed mind</option>
                  <option>Other</option>
                </SelectField>
                <Field label={`Requested amount (${settings.currency})`} type="number" value={form.refundAmount} onChange={(e) => update('refundAmount', e.target.value)} placeholder="0.00" />
              </div>
              <Field label="Notes" as="textarea" rows="5" value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Tell us what happened and what resolution you prefer." />
              {message && <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4 text-gold">{message}</div>}
              <div className="flex flex-wrap gap-3">
                <Button type="submit">Submit Return Request</Button>
                <Button type="button" variant="outline" onClick={() => navigate('tracking')}>Track Order</Button>
              </div>
            </form>
          </Card>

          <div className="space-y-5">
            {policyBlocks.map(([title, items]) => (
              <Card key={title} className="p-6">
                <h3 className="font-display text-2xl font-bold text-gold">{title}</h3>
                <ul className="mt-4 space-y-3">
                  {items.map((item) => <li key={item} className="flex gap-3 text-[#C8BAD0]"><span className="text-gold">•</span><span>{item}</span></li>)}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-lux">
          <Card className="p-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="section-eyebrow">Existing Requests</p>
                <h2 className="heading-md mt-3">Recent return activity.</h2>
              </div>
              <Badge>{returns.length} request{returns.length === 1 ? '' : 's'}</Badge>
            </div>
            <div className="mt-6 overflow-x-auto">
              <table className="admin-table">
                <thead><tr><th>ID</th><th>Order</th><th>Customer</th><th>Reason</th><th>Status</th><th>Amount</th></tr></thead>
                <tbody>
                  {returns.map((ret) => (
                    <tr key={ret.id}><td>{ret.id}</td><td>{ret.orderId}</td><td>{ret.customer}</td><td>{ret.reason}</td><td><Badge status={ret.status}>{ret.status}</Badge></td><td>{money(ret.refundAmount, settings.currency)}</td></tr>
                  ))}
                  {!returns.length && <tr><td colSpan="6" className="text-center">No return requests yet.</td></tr>}
                </tbody>
              </table>
            </div>
            {!!orders.length && <p className="mt-4 text-sm text-[#8A7A98]">Tip: Use an existing order number such as {orders[0]?.id} when testing this frontend flow.</p>}
          </Card>
        </div>
      </section>
    </>
  );
}
