import { useMemo, useState } from 'react';
import { Button, Card, Field, SelectField, StatCard } from '../../components/Common';
import { useStore } from '../../context/StoreContext';
import { downloadFile, money, safeNumber, toCSV, todayISO } from '../../utils/helpers';
import { AdminShell, BarList, SectionTitle, Toolbar } from './_AdminShared.jsx';

function inRange(dateValue, from, to) {
  const date = String(dateValue || '').slice(0, 10);
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export function AnalyticsPage({ view, navigate }) {
  const { orders, products, categories, customers, returns, settings } = useStore();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState(todayISO());
  const [metric, setMetric] = useState('revenue');

  const filteredOrders = useMemo(() => orders.filter((order) => inRange(order.createdAt, from, to)), [orders, from, to]);
  const revenue = filteredOrders.reduce((sum, order) => sum + safeNumber(order.total), 0);
  const discounts = filteredOrders.reduce((sum, order) => sum + safeNumber(order.discount), 0);
  const refunds = returns.filter((ret) => inRange(ret.createdAt, from, to)).reduce((sum, ret) => ['approved', 'refunded'].includes(ret.status) ? sum + safeNumber(ret.refundAmount) : sum, 0);
  const aov = filteredOrders.length ? revenue / filteredOrders.length : 0;

  const productSales = useMemo(() => {
    const map = {};
    filteredOrders.forEach((order) => order.items?.forEach((item) => { map[item.name] = (map[item.name] || 0) + (metric === 'quantity' ? safeNumber(item.qty) : safeNumber(item.qty) * safeNumber(item.price)); }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label, value }));
  }, [filteredOrders, metric]);

  const categorySales = useMemo(() => {
    const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
    const map = {};
    filteredOrders.forEach((order) => order.items?.forEach((item) => {
      const product = productMap[item.productId];
      const label = categoryMap[product?.category] || product?.category || 'Unknown';
      map[label] = (map[label] || 0) + safeNumber(item.qty) * safeNumber(item.price);
    }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value }));
  }, [filteredOrders, products, categories]);

  const customerSegments = useMemo(() => [
    { label: 'VIP Customers', value: customers.filter((c) => c.vip).length },
    { label: 'Blocked Customers', value: customers.filter((c) => c.blocked).length },
    { label: 'Repeat Customers', value: customers.filter((c) => safeNumber(c.orders) > 1).length },
    { label: 'High Spend Customers', value: customers.filter((c) => safeNumber(c.spend) >= 1000).length }
  ], [customers]);

  function exportAnalytics() {
    downloadFile('glowoutgh-analytics.csv', toCSV(filteredOrders.map((order) => ({ id: order.id, date: order.createdAt, customer: order.customer?.name, status: order.status, total: order.total, discount: order.discount, tax: order.tax, payment: order.paymentMethod }))), 'text/csv');
  }

  return (
    <AdminShell view={view} navigate={navigate} title="Sales Analytics">
      <Toolbar>
        <Field label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Field label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <SelectField label="Product Metric" value={metric} onChange={(e) => setMetric(e.target.value)}><option value="revenue">Revenue</option><option value="quantity">Quantity</option></SelectField>
        <Button variant="outline" onClick={exportAnalytics}>Export CSV</Button>
      </Toolbar>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><StatCard label="Revenue" value={money(revenue, settings.currency)} /><StatCard label="Orders" value={filteredOrders.length} /><StatCard label="AOV" value={money(aov, settings.currency)} /><StatCard label="Refund Exposure" value={money(refunds, settings.currency)} /></div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4"><StatCard label="Discounts" value={money(discounts, settings.currency)} /><StatCard label="Products" value={products.length} /><StatCard label="Categories" value={categories.length} /><StatCard label="Customers" value={customers.length} /></div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2"><Card className="p-6"><SectionTitle title="Top Products" />{productSales.length ? <BarList items={productSales} currency={metric === 'revenue' ? settings.currency : ''} /> : <p className="text-sm text-[#8A7A98]">No product sales yet.</p>}</Card><Card className="p-6"><SectionTitle title="Category Sales" />{categorySales.length ? <BarList items={categorySales} currency={settings.currency} /> : <p className="text-sm text-[#8A7A98]">No category sales yet.</p>}</Card></div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2"><Card className="p-6"><SectionTitle title="Customer Segments" /><BarList items={customerSegments} /></Card><Card className="p-6"><SectionTitle title="Actionable Insights" /><div className="space-y-3 text-sm text-[#C8BAD0]"><p className="rounded-2xl bg-surface-2 p-4">Low stock products: <b className="text-gold">{products.filter((p) => safeNumber(p.stock) <= safeNumber(settings.lowStockThreshold)).length}</b>. Review Product Manager before new campaigns.</p><p className="rounded-2xl bg-surface-2 p-4">Average order value is <b className="text-gold">{money(aov, settings.currency)}</b>. Use product bundles or featured picks to lift basket size.</p><p className="rounded-2xl bg-surface-2 p-4">Refund exposure is <b className="text-gold">{money(refunds, settings.currency)}</b>. Review Returns Manager for repeated reasons.</p></div></Card></div>
    </AdminShell>
  );
}
