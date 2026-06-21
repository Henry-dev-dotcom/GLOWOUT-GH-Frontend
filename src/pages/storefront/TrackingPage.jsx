import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Badge, Button, Card, EmptyState, Field, PageHero, ProductImage, StatCard } from '../../components/Common';
import { money } from '../../utils/helpers';

const steps = [
  { key: 'processing', title: 'Order confirmed', text: 'Your order has been received and is being checked.' },
  { key: 'packed', title: 'Packed', text: 'Items have been picked, checked and packed for courier handover.' },
  { key: 'shipped', title: 'Shipped', text: 'The courier has received the package and delivery is in progress.' },
  { key: 'delivered', title: 'Delivered', text: 'The order has reached the customer.' }
];

export function TrackingPage({ params }) {
  const { orders, products, settings, loadDemoOrders } = useStore();
  const [orderId, setOrderId] = useState(params.order || '');
  const [searched, setSearched] = useState(Boolean(params.order));
  const order = orders.find((o) => o.id.toLowerCase() === orderId.trim().toLowerCase());

  function search(event) {
    event?.preventDefault?.();
    setSearched(true);
  }

  return (
    <>
      <PageHero eyebrow="Tracking" title="Track your order">Enter an order ID to view fulfilment status, courier details and delivery timeline.</PageHero>
      <section className="pb-16">
        <div className="container-lux max-w-5xl">
          <Card className="p-6">
            <form onSubmit={search} className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
              <Field label="Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="GH-1001" />
              <Button type="submit">Search</Button>
              <Button type="button" variant="ghost" onClick={() => { loadDemoOrders(); setOrderId('GH-1001'); setSearched(true); }}>Load Demo</Button>
            </form>
          </Card>

          {order ? (
            <Card className="mt-6 p-6">
              <div className="flex flex-wrap justify-between gap-4 border-b border-[rgba(201,169,110,.12)] pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-gold/70">Order number</p>
                  <h3 className="font-display text-3xl font-bold">{order.id}</h3>
                  <p className="text-[#8A7A98]">Placed {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <Badge status={order.status}>{order.status}</Badge>
                  <p className="mt-2 text-sm text-[#8A7A98]">{order.paid ? 'Payment confirmed' : 'Payment pending'}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <StatCard label="Total" value={money(order.total, settings.currency)} />
                <StatCard label="Payment" value={order.paymentMethod} hint={order.paid ? 'Paid' : 'Unpaid'} />
                <StatCard label="Tracking" value={order.trackingCode || 'Pending'} hint={order.courier || 'Courier not assigned'} />
              </div>

              <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
                <div>
                  <h4 className="font-display text-2xl font-bold">Fulfilment timeline</h4>
                  <div className="mt-5 space-y-4">
                    {steps.map((step, index) => {
                      const complete = steps.findIndex((item) => item.key === order.status) >= index;
                      return (
                        <div key={step.key} className="flex gap-4">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${complete ? 'bg-gold text-ink' : 'bg-surface-3 text-[#8A7A98]'}`}>{index + 1}</div>
                          <div className="pb-4">
                            <p className="font-bold text-white">{step.title}</p>
                            <p className="mt-1 text-sm leading-6 text-[#8A7A98]">{step.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <Card className="bg-surface-2 p-5">
                  <h4 className="font-display text-xl font-bold">Delivery details</h4>
                  <div className="mt-4 space-y-3 text-sm text-[#C8BAD0]">
                    <Info label="Customer" value={order.customer?.name || 'Customer'} />
                    <Info label="Phone" value={order.customer?.phone || 'Not supplied'} />
                    <Info label="City" value={order.customer?.city || 'Not supplied'} />
                    <Info label="Address" value={order.customer?.address || 'Not supplied'} />
                    <Info label="Courier" value={order.courier || 'Pending assignment'} />
                  </div>
                </Card>
              </div>

              <div className="mt-8">
                <h4 className="font-display text-2xl font-bold">Items in this order</h4>
                <div className="mt-4 grid gap-3">
                  {order.items.map((item) => {
                    const product = products.find((p) => p.id === item.productId) || { images: [item.image], name: item.name };
                    return <div key={`${item.productId}-${item.name}`} className="grid gap-3 rounded-2xl border border-[rgba(201,169,110,.12)] bg-surface-2 p-3 sm:grid-cols-[80px_1fr_auto] sm:items-center"><ProductImage product={product} className="h-20" /><div><p className="font-bold text-white">{item.name}</p><p className="text-sm text-[#8A7A98]">Qty {item.qty} · {money(item.price, settings.currency)} each</p></div><p className="font-bold text-gold">{money(item.qty * item.price, settings.currency)}</p></div>;
                  })}
                </div>
              </div>
            </Card>
          ) : searched ? (
            <div className="mt-6"><EmptyState title="Order not found" action={<Button variant="outline" onClick={() => { loadDemoOrders(); setOrderId('GH-1001'); }}>Try demo order GH-1001</Button>}>Check the order ID and try again. Newly created checkout orders will also appear here.</EmptyState></div>
          ) : null}
        </div>
      </section>
    </>
  );
}
function Info({ label, value }) { return <div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#8A7A98]">{label}</p><p className="mt-1 text-white">{value}</p></div>; }
