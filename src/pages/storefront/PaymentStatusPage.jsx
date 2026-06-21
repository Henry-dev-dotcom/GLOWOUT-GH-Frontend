import { useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Badge, Button, Card, EmptyState, PageHero } from '../../components/Common';
import { money } from '../../utils/helpers';

export function PaymentStatusPage({ navigate, params = {} }) {
  const { orders, upsertOrder, settings } = useStore();
  const [status, setStatus] = useState(params.status || 'pending');
  const order = useMemo(() => orders.find((item) => item.id === params.order) || orders[0], [orders, params.order]);

  if (!order) {
    return <><PageHero eyebrow="Payment" title="Payment not found" /><section className="pb-16"><div className="container-lux"><EmptyState title="No payment session" action={<Button onClick={() => navigate('checkout')}>Back to Checkout</Button>}>Place an order first before opening payment status.</EmptyState></div></section></>;
  }

  function markPaid() {
    upsertOrder({ ...order, paid: true, paymentStatus: 'paid', status: 'processing' });
    setStatus('paid');
  }
  function markFailed() {
    upsertOrder({ ...order, paid: false, paymentStatus: 'failed', status: 'payment failed' });
    setStatus('failed');
  }

  const current = status === 'paid' ? 'paid' : status === 'failed' ? 'failed' : order.paymentStatus || 'pending';
  const title = current === 'paid' ? 'Payment successful' : current === 'failed' ? 'Payment failed' : 'Payment pending';

  return (
    <>
      <PageHero eyebrow="Payment Status" title={title}>This screen prepares the frontend for real Paystack payment verification from the backend.</PageHero>
      <section className="pb-16">
        <div className="container-lux grid gap-8 lg:grid-cols-[1fr_360px]">
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><p className="section-eyebrow">Order</p><h2 className="mt-2 font-display text-3xl font-bold">{order.id}</h2></div>
              <Badge status={current}>{current}</Badge>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[rgba(201,169,110,.12)] bg-surface-2 p-5"><p className="label">Amount</p><p className="font-display text-2xl font-bold text-gold">{money(order.total, settings.currency)}</p></div>
              <div className="rounded-2xl border border-[rgba(201,169,110,.12)] bg-surface-2 p-5"><p className="label">Method</p><p className="font-bold text-white">{order.paymentMethod}</p></div>
              <div className="rounded-2xl border border-[rgba(201,169,110,.12)] bg-surface-2 p-5"><p className="label">Reference</p><p className="font-bold text-white">{order.paymentReference || 'Pending'}</p></div>
            </div>

            <div className="mt-8 rounded-2xl border border-gold/20 bg-gold/10 p-5 text-sm leading-7 text-gold-light">
              In production, the backend will initialize the payment, redirect the customer to Paystack, receive a webhook, verify the transaction, then update this order automatically. These buttons simulate that result during frontend testing.
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="button" onClick={markPaid}>Simulate Paid</Button>
              <Button type="button" variant="danger" onClick={markFailed}>Simulate Failed</Button>
              <Button type="button" variant="outline" onClick={() => navigate('order-confirmation', { order: order.id })}>View Order Confirmation</Button>
            </div>
          </Card>

          <Card className="h-fit p-6">
            <h3 className="font-display text-2xl font-bold">Payment Checklist</h3>
            <div className="mt-5 space-y-3 text-sm text-[#C8BAD0]">
              <p>✓ Order has been created</p>
              <p>{current === 'paid' ? '✓' : '○'} Payment verified</p>
              <p>{current === 'failed' ? '!' : '○'} Failure handled</p>
              <p>○ Backend webhook connection pending</p>
            </div>
            <div className="mt-6 grid gap-3">
              <Button variant="outline" onClick={() => navigate('tracking', { order: order.id })}>Track Order</Button>
              <Button variant="ghost" onClick={() => navigate('shop')}>Continue Shopping</Button>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
