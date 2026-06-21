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

export function FinancePage({ view, navigate }) {
  const { orders, returns, settings } = useStore();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState(todayISO());
  const [payment, setPayment] = useState('all');

  const filteredOrders = useMemo(() => orders
    .filter((order) => inRange(order.createdAt, from, to))
    .filter((order) => payment === 'all' || order.paymentMethod === payment || order.paymentStatus === payment), [orders, from, to, payment]);

  const filteredReturns = useMemo(() => returns.filter((ret) => inRange(ret.createdAt, from, to)), [returns, from, to]);

  const summary = useMemo(() => {
    const gross = filteredOrders.reduce((sum, order) => sum + safeNumber(order.subtotal), 0);
    const delivery = filteredOrders.reduce((sum, order) => sum + safeNumber(order.shipping || order.deliveryFee), 0);
    const tax = filteredOrders.reduce((sum, order) => sum + safeNumber(order.tax), 0);
    const discounts = filteredOrders.reduce((sum, order) => sum + safeNumber(order.discount), 0);
    const totalCollected = filteredOrders.reduce((sum, order) => sum + safeNumber(order.total), 0);
    const unpaid = filteredOrders.filter((order) => !order.paid && order.paymentStatus !== 'paid').reduce((sum, order) => sum + safeNumber(order.total), 0);
    const refunds = filteredReturns.filter((ret) => ['approved', 'refunded'].includes(ret.status)).reduce((sum, ret) => sum + safeNumber(ret.refundAmount), 0);
    return { gross, delivery, tax, discounts, totalCollected, unpaid, refunds, net: totalCollected - refunds };
  }, [filteredOrders, filteredReturns]);

  const paymentBreakdown = useMemo(() => {
    const map = {};
    filteredOrders.forEach((order) => { map[order.paymentMethod || 'Unknown'] = (map[order.paymentMethod || 'Unknown'] || 0) + safeNumber(order.total); });
    return Object.entries(map).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }, [filteredOrders]);

  const dailySales = useMemo(() => {
    const map = {};
    filteredOrders.forEach((order) => { const date = String(order.createdAt || '').slice(0, 10); map[date] = (map[date] || 0) + safeNumber(order.total); });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([label, value]) => ({ label, value }));
  }, [filteredOrders]);

  function exportFinanceCSV() {
    downloadFile('glowoutgh-finance-report.csv', toCSV(filteredOrders.map((order) => ({
      orderId: order.id,
      date: order.createdAt,
      customer: order.customer?.name,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal,
      discount: order.discount,
      tax: order.tax,
      delivery: order.shipping || order.deliveryFee,
      total: order.total
    }))), 'text/csv');
  }

  return (
    <AdminShell view={view} navigate={navigate} title="Finance Reports">
      <Toolbar>
        <Field label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Field label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <SelectField label="Payment Filter" value={payment} onChange={(e) => setPayment(e.target.value)}><option value="all">All</option><option value="Mobile Money">Mobile Money</option><option value="Card">Card</option><option value="Bank Transfer">Bank Transfer</option><option value="Cash on Delivery">Cash on Delivery</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="unpaid">Unpaid</option></SelectField>
        <Button variant="outline" onClick={exportFinanceCSV}>Export CSV</Button>
        <Button variant="ghost" onClick={() => downloadFile('glowoutgh-finance-report.json', JSON.stringify({ from, to, payment, summary, orders: filteredOrders, returns: filteredReturns }, null, 2))}>Export JSON</Button>
      </Toolbar>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Gross Sales" value={money(summary.gross, settings.currency)} />
        <StatCard label="Net Revenue" value={money(summary.net, settings.currency)} />
        <StatCard label="Discounts" value={money(summary.discounts, settings.currency)} />
        <StatCard label="Refunds" value={money(summary.refunds, settings.currency)} />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tax" value={money(summary.tax, settings.currency)} />
        <StatCard label="Delivery Fees" value={money(summary.delivery, settings.currency)} />
        <StatCard label="Unpaid Orders" value={money(summary.unpaid, settings.currency)} />
        <StatCard label="Orders in Report" value={filteredOrders.length} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="p-6"><SectionTitle title="Daily Sales" />{dailySales.length ? <BarList items={dailySales} currency={settings.currency} /> : <p className="text-sm text-[#8A7A98]">No sales in selected period.</p>}</Card>
        <Card className="p-6"><SectionTitle title="Payment Method Breakdown" />{paymentBreakdown.length ? <BarList items={paymentBreakdown} currency={settings.currency} /> : <p className="text-sm text-[#8A7A98]">No payment data in selected period.</p>}</Card>
      </div>

      <Card className="mt-6 overflow-x-auto p-0">
        <table className="admin-table"><thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Payment</th><th>Discount</th><th>Tax</th><th>Total</th></tr></thead><tbody>{filteredOrders.map((order) => <tr key={order.id}><td>{order.id}</td><td>{String(order.createdAt).slice(0, 10)}</td><td>{order.customer?.name}</td><td>{order.paymentMethod}<p className="text-xs text-[#8A7A98]">{order.paymentStatus}</p></td><td>{money(order.discount, settings.currency)}</td><td>{money(order.tax, settings.currency)}</td><td>{money(order.total, settings.currency)}</td></tr>)}</tbody></table>
      </Card>
    </AdminShell>
  );
}
