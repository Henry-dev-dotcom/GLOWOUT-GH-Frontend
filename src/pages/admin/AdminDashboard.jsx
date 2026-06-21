import { useMemo } from 'react';
import { Badge, Button, Card, ProductImage, StatCard } from '../../components/Common';
import { useStore } from '../../context/StoreContext';
import { money, safeNumber, todayISO } from '../../utils/helpers';
import { AdminShell, BarList, SectionTitle, Timeline } from './_AdminShared.jsx';

const orderSteps = [
  { key: 'processing', label: 'Processing', desc: 'Payment and order review started.' },
  { key: 'packed', label: 'Packed', desc: 'Items picked, packed and labelled.' },
  { key: 'shipped', label: 'Shipped', desc: 'Courier or delivery rider assigned.' },
  { key: 'delivered', label: 'Delivered', desc: 'Order completed successfully.' }
];

export function AdminDashboard({ view, navigate }) {
  const { products, categories, orders, coupons, returns, customers, analytics, settings, campaigns } = useStore();

  const recentOrders = orders.slice(0, 5);
  const lowStockProducts = products.filter((p) => p.available && safeNumber(p.stock) <= safeNumber(settings.lowStockThreshold)).slice(0, 5);
  const pendingReturns = returns.filter((r) => ['requested', 'reviewing'].includes(r.status)).slice(0, 5);
  const activeCampaigns = campaigns.filter((c) => c.active).length;
  const activeCoupons = coupons.filter((c) => c.active).length;

  const weeklyRevenue = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const iso = date.toISOString().slice(0, 10);
      return { label: date.toLocaleDateString(undefined, { weekday: 'short' }), iso, value: 0 };
    });
    orders.forEach((order) => {
      const day = days.find((item) => item.iso === String(order.createdAt || '').slice(0, 10));
      if (day) day.value += safeNumber(order.total);
    });
    return days;
  }, [orders]);

  const topProducts = useMemo(() => Object.entries(analytics.productSales || {}).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, value]) => ({ label, value })), [analytics.productSales]);

  const shortcuts = [
    ['admin.products','Product Manager','🧴','Add products, update stock and manage images'],
    ['admin.orders','Orders','📦','Open order details, invoices and fulfilment timeline'],
    ['admin.coupons','Coupons','🎟️','Discount rules, usage history and expiry control'],
    ['admin.customers','Customers','👥','Profiles, VIPs, blocks and customer notes'],
    ['admin.returns','Returns','↩️','Approve, decline, refund and restock returns'],
    ['admin.finance','Finance','💰','Filter revenue, discounts, tax and refund reports'],
    ['admin.marketing','Marketing','📣','Schedule campaigns and announcement content'],
    ['admin.team','Team & Access','🔐','Role assignment and permission matrix']
  ];

  return (
    <AdminShell view={view} navigate={navigate} title="Dashboard Overview">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={money(analytics.revenue, settings.currency)} hint={`${money(analytics.netRevenue, settings.currency)} net after refunds`} />
        <StatCard label="Orders" value={orders.length} hint={`${analytics.openOrders} open fulfilment tasks`} />
        <StatCard label="Products" value={products.length} hint={`${analytics.lowStock} low-stock alerts`} />
        <StatCard label="Customers" value={customers.length} hint={`${customers.filter((c) => c.vip).length} VIP customers`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <Card className="p-6">
          <SectionTitle title="Revenue Snapshot">Last 7 days based on stored orders.</SectionTitle>
          <BarList items={weeklyRevenue} currency={settings.currency} />
        </Card>
        <Card className="p-6">
          <SectionTitle title="Store Health">Operational checks for launch readiness.</SectionTitle>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between rounded-2xl bg-surface-2 p-3"><span>Active coupons</span><strong className="text-gold">{activeCoupons}</strong></div>
            <div className="flex justify-between rounded-2xl bg-surface-2 p-3"><span>Visible categories</span><strong className="text-gold">{categories.filter((c) => c.visible).length}</strong></div>
            <div className="flex justify-between rounded-2xl bg-surface-2 p-3"><span>Active campaigns</span><strong className="text-gold">{activeCampaigns}</strong></div>
            <div className="flex justify-between rounded-2xl bg-surface-2 p-3"><span>Pending returns</span><strong className="text-gold">{pendingReturns.length}</strong></div>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="p-6 xl:col-span-2">
          <SectionTitle title="Recent Orders" action={<Button variant="outline" onClick={() => navigate('admin.orders')}>Manage Orders</Button>}>
            Latest orders needing fulfilment attention.
          </SectionTitle>
          {recentOrders.length ? <div className="space-y-3">{recentOrders.map((order) => (
            <button key={order.id} onClick={() => navigate('admin.orders', { order: order.id })} className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(201,169,110,.12)] bg-surface-2 p-4 text-left hover:border-gold/40">
              <div><p className="font-bold text-white">{order.id} · {order.customer?.name}</p><p className="text-xs text-[#8A7A98]">{new Date(order.createdAt).toLocaleString()} · {order.paymentMethod}</p></div>
              <div className="flex items-center gap-3"><Badge status={order.status}>{order.status}</Badge><span className="font-bold text-gold">{money(order.total, settings.currency)}</span></div>
            </button>
          ))}</div> : <p className="text-[#8A7A98]">No orders yet. Load demo orders from Orders Manager or place a checkout order.</p>}
        </Card>

        <Card className="p-6">
          <SectionTitle title="Fulfilment Flow">Default order stages used by the admin.</SectionTitle>
          <Timeline steps={orderSteps} current="shipped" />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="p-6">
          <SectionTitle title="Low Stock Alerts" action={<Button variant="ghost" onClick={() => navigate('admin.products')}>Open</Button>} />
          {lowStockProducts.length ? <div className="space-y-3">{lowStockProducts.map((product) => <div key={product.id} className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3"><ProductImage product={product} className="h-12 w-12" /><div className="min-w-0 flex-1"><p className="truncate font-bold text-white">{product.name}</p><p className="text-xs text-[#8A7A98]">{product.stock} left · {product.sku}</p></div></div>)}</div> : <p className="text-sm text-[#8A7A98]">No low-stock products.</p>}
        </Card>
        <Card className="p-6">
          <SectionTitle title="Top Products">Quantity sold from orders.</SectionTitle>
          {topProducts.length ? <BarList items={topProducts} /> : <p className="text-sm text-[#8A7A98]">No sales data yet.</p>}
        </Card>
        <Card className="p-6">
          <SectionTitle title="Pending Returns" action={<Button variant="ghost" onClick={() => navigate('admin.returns')}>Review</Button>} />
          {pendingReturns.length ? <div className="space-y-3">{pendingReturns.map((ret) => <div key={ret.id} className="rounded-2xl bg-surface-2 p-3"><p className="font-bold text-white">{ret.id} · {ret.customer}</p><p className="text-xs text-[#8A7A98]">{ret.orderId} · {ret.reason}</p><Badge status={ret.status}>{ret.status}</Badge></div>)}</div> : <p className="text-sm text-[#8A7A98]">No pending returns.</p>}
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <SectionTitle title="Admin Shortcuts">All core admin modules are now connected to functional pages.</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{shortcuts.map(([id,title,icon,desc]) => <button key={id} onClick={() => navigate(id)} className="rounded-2xl border border-[rgba(201,169,110,.12)] bg-surface-2 p-5 text-left transition hover:-translate-y-1 hover:border-gold/40"><div className="text-3xl">{icon}</div><h3 className="mt-3 font-display text-xl font-bold">{title}</h3><p className="mt-2 text-sm text-[#8A7A98]">{desc}</p></button>)}</div>
      </Card>
    </AdminShell>
  );
}
