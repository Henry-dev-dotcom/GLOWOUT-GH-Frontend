import { useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Badge, Button, Card, EmptyState, PageHero, ProductImage } from '../../components/Common';
import { money } from '../../utils/helpers';

function Detail({ label, value }) {
  return <div className="rounded-2xl border border-[rgba(201,169,110,.12)] bg-surface-2 p-4"><p className="label">{label}</p><p className="font-bold text-white">{value || '—'}</p></div>;
}

export function OrderConfirmationPage({ navigate, params = {} }) {
  const { orders, settings } = useStore();
  const order = useMemo(() => orders.find((item) => item.id === params.order) || orders[0], [orders, params.order]);

  if (!order) {
    return <><PageHero eyebrow="Order Confirmation" title="Order not found" /><section className="pb-16"><div className="container-lux"><EmptyState title="No order to confirm" action={<Button onClick={() => navigate('shop')}>Return to Shop</Button>}>Place an order first, then your confirmation will appear here.</EmptyState></div></section></>;
  }

  return (
    <>
      <PageHero eyebrow="Order Confirmed" title="Thank you for your order">Your order has been received and saved. Use the tracking page to follow fulfilment updates.</PageHero>
      <section className="pb-16">
        <div className="container-lux grid gap-8 lg:grid-cols-[1fr_380px]">
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[rgba(201,169,110,.12)] pb-5">
              <div>
                <p className="section-eyebrow">Order Number</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-white">{order.id}</h2>
              </div>
              <Badge status={order.paymentStatus || (order.paid ? 'paid' : 'pending')}>{order.paymentStatus || (order.paid ? 'Paid' : 'Pending')}</Badge>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Detail label="Customer" value={order.customer?.name} />
              <Detail label="Payment" value={order.paymentMethod} />
              <Detail label="Delivery" value={order.deliveryMethod || 'Standard delivery'} />
              <Detail label="Total" value={money(order.total, settings.currency)} />
            </div>

            <h3 className="mt-8 font-display text-2xl font-bold">Items Ordered</h3>
            <div className="mt-4 space-y-3">
              {order.items.map((item) => <div key={`${item.productId}-${item.name}`} className="grid grid-cols-[72px_1fr_auto] gap-4 rounded-2xl border border-[rgba(201,169,110,.12)] bg-surface-2 p-3">
                <ProductImage product={{ images: [item.image] }} className="h-20" />
                <div><p className="font-bold text-white">{item.name}</p><p className="mt-1 text-sm text-[#8A7A98]">Qty {item.qty} · {money(item.price, settings.currency)}</p></div>
                <p className="font-bold text-gold">{money(item.qty * item.price, settings.currency)}</p>
              </div>)}
            </div>

            <div className="mt-8 rounded-2xl border border-gold/20 bg-gold/10 p-5 text-sm leading-7 text-gold-light">
              A confirmation message will be sent when backend email/SMS notifications are connected. For now, use this order ID for tracking and admin fulfilment testing.
            </div>
          </Card>

          <Card className="h-fit p-6">
            <h3 className="font-display text-2xl font-bold">Next Steps</h3>
            <div className="mt-5 space-y-4 text-sm leading-7 text-[#C8BAD0]">
              <p><span className="font-bold text-white">1.</span> GLOWOUT GH reviews and confirms your order.</p>
              <p><span className="font-bold text-white">2.</span> Payment is verified if Mobile Money, card or bank transfer was used.</p>
              <p><span className="font-bold text-white">3.</span> Products are packed and dispatched.</p>
              <p><span className="font-bold text-white">4.</span> Tracking details are updated in your account.</p>
            </div>
            <div className="mt-6 grid gap-3">
              <Button onClick={() => navigate('tracking', { order: order.id })}>Track Order</Button>
              <Button variant="outline" onClick={() => navigate('account')}>Go to Account</Button>
              <Button variant="ghost" onClick={() => navigate('shop')}>Continue Shopping</Button>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
