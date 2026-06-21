import { useMemo, useState } from 'react';
import { Badge, Button, Card, Field, SelectField, StatCard } from '../../components/Common';
import { useStore } from '../../context/StoreContext';
import { downloadFile, money, safeNumber, toCSV, uid } from '../../utils/helpers';
import { Action, AdminShell, ConfirmButton, DetailGrid, MiniInput, Modal, SectionTitle, Timeline, Toolbar } from './_AdminShared.jsx';

const statuses = ['processing', 'packed', 'shipped', 'delivered', 'cancelled'];
const paymentStatuses = ['unpaid', 'pending', 'paid', 'failed', 'refunded'];
const orderSteps = [
  { key: 'processing', label: 'Processing', desc: 'Order received and being reviewed.' },
  { key: 'packed', label: 'Packed', desc: 'Products have been picked and packed.' },
  { key: 'shipped', label: 'Shipped', desc: 'Courier details have been assigned.' },
  { key: 'delivered', label: 'Delivered', desc: 'Customer has received the order.' }
];

function orderMatchesDate(order, from, to) {
  const date = String(order.createdAt || '').slice(0, 10);
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export function OrdersManager({ view, navigate }) {
  const { orders, upsertOrder, deleteOrder, loadDemoOrders, settings } = useStore();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [payment, setPayment] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selected, setSelected] = useState([]);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [invoiceOrderId, setInvoiceOrderId] = useState(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return orders
      .filter((o) => status === 'all' || o.status === status)
      .filter((o) => payment === 'all' || (payment === 'paid' ? o.paid : !o.paid) || o.paymentStatus === payment)
      .filter((o) => orderMatchesDate(o, from, to))
      .filter((o) => `${o.id} ${o.customer?.name} ${o.customer?.email} ${o.customer?.phone} ${o.customer?.city} ${o.paymentMethod} ${o.trackingCode}`.toLowerCase().includes(q));
  }, [orders, status, payment, from, to, query]);

  const activeOrder = orders.find((order) => order.id === activeOrderId);
  const invoiceOrder = orders.find((order) => order.id === invoiceOrderId);
  const filteredRevenue = filtered.reduce((sum, order) => sum + safeNumber(order.total), 0);
  const openOrders = filtered.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length;

  function updateOrder(id, patch) {
    const order = orders.find((item) => item.id === id);
    if (!order) return;
    const next = { ...order, ...patch, updatedAt: new Date().toISOString() };
    if (patch.paymentStatus) next.paid = patch.paymentStatus === 'paid';
    if (patch.paid !== undefined) next.paymentStatus = patch.paid ? 'paid' : 'unpaid';
    upsertOrder(next);
  }

  function addInternalNote(id, note) {
    if (!note.trim()) return;
    const order = orders.find((item) => item.id === id);
    const notesLog = order.notesLog || [];
    updateOrder(id, { notesLog: [{ id: uid('note'), text: note.trim(), date: new Date().toISOString() }, ...notesLog], notes: note.trim() });
  }

  function bulkStatus(nextStatus) {
    selected.forEach((id) => updateOrder(id, { status: nextStatus }));
    setSelected([]);
  }

  function exportCSV() {
    downloadFile('glowoutgh-orders.csv', toCSV(filtered.map((o) => ({
      id: o.id,
      date: o.createdAt,
      status: o.status,
      paymentStatus: o.paymentStatus,
      paid: o.paid,
      total: o.total,
      customer: o.customer?.name,
      email: o.customer?.email,
      phone: o.customer?.phone,
      payment: o.paymentMethod,
      courier: o.courier,
      trackingCode: o.trackingCode
    }))), 'text/csv');
  }

  return (
    <AdminShell view={view} navigate={navigate} title="Orders Manager">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Filtered Orders" value={filtered.length} />
        <StatCard label="Open" value={openOrders} />
        <StatCard label="Delivered" value={filtered.filter((o) => o.status === 'delivered').length} />
        <StatCard label="Revenue" value={money(filteredRevenue, settings.currency)} />
      </div>

      <Toolbar>
        <Field label="Search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Order, customer, phone, tracking..." />
        <SelectField label="Status" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map((s) => <option key={s}>{s}</option>)}</SelectField>
        <SelectField label="Payment" value={payment} onChange={(e) => setPayment(e.target.value)}><option value="all">All payments</option><option value="paid">Paid</option><option value="unpaid">Unpaid</option><option value="pending">Pending</option><option value="failed">Failed</option><option value="refunded">Refunded</option></SelectField>
        <Field label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Field label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <Button variant="outline" onClick={loadDemoOrders}>Load Demo</Button>
        <Button variant="outline" onClick={() => downloadFile('glowoutgh-orders.json', JSON.stringify(filtered, null, 2))}>Export JSON</Button>
        <Button variant="ghost" onClick={exportCSV}>Export CSV</Button>
      </Toolbar>

      {selected.length > 0 && <Card className="mb-6 flex flex-wrap items-center justify-between gap-3 p-4"><p className="font-bold text-white">{selected.length} orders selected</p><div className="flex flex-wrap gap-2"><Action onClick={() => bulkStatus('packed')}>Mark Packed</Action><Action onClick={() => bulkStatus('shipped')}>Mark Shipped</Action><Action onClick={() => bulkStatus('delivered')}>Mark Delivered</Action><ConfirmButton message="Delete selected orders?" onConfirm={() => { selected.forEach(deleteOrder); setSelected([]); }}>Delete Selected</ConfirmButton></div></Card>}

      <Card className="overflow-x-auto p-0">
        <table className="admin-table">
          <thead><tr><th><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={(e) => setSelected(e.target.checked ? filtered.map((o) => o.id) : [])} /></th><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Payment</th><th>Courier</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map((o) => <tr key={o.id}>
            <td><input type="checkbox" checked={selected.includes(o.id)} onChange={(e) => setSelected(e.target.checked ? [...selected, o.id] : selected.filter((x) => x !== o.id))} /></td>
            <td><p className="font-bold text-white">{o.id}</p><p className="text-xs text-[#8A7A98]">{new Date(o.createdAt).toLocaleString()}</p></td>
            <td>{o.customer?.name}<p className="text-xs text-[#8A7A98]">{o.customer?.email}</p><p className="text-xs text-[#8A7A98]">{o.customer?.phone}</p></td>
            <td>{money(o.total, settings.currency)}</td>
            <td><select className="field py-2" value={o.status} onChange={(e) => updateOrder(o.id, { status: e.target.value })}>{statuses.map((s) => <option key={s}>{s}</option>)}</select></td>
            <td><select className="field py-2" value={o.paymentStatus || (o.paid ? 'paid' : 'unpaid')} onChange={(e) => updateOrder(o.id, { paymentStatus: e.target.value })}>{paymentStatuses.map((s) => <option key={s}>{s}</option>)}</select><p className="text-xs text-[#8A7A98]">{o.paymentMethod}</p></td>
            <td><MiniInput placeholder="Courier" value={o.courier || ''} onChange={(e) => updateOrder(o.id, { courier: e.target.value })} /><MiniInput placeholder="Tracking" value={o.trackingCode || ''} onChange={(e) => updateOrder(o.id, { trackingCode: e.target.value })} /></td>
            <td><div className="flex flex-wrap gap-2"><Action onClick={() => setActiveOrderId(o.id)}>Details</Action><Action onClick={() => setInvoiceOrderId(o.id)}>Invoice</Action><Action onClick={() => navigate('tracking', { order: o.id })}>Track</Action><ConfirmButton message="Delete order?" onConfirm={() => deleteOrder(o.id)}>Delete</ConfirmButton></div></td>
          </tr>)}</tbody>
        </table>
      </Card>

      {activeOrder && <OrderDetailModal order={activeOrder} settings={settings} onClose={() => setActiveOrderId(null)} updateOrder={updateOrder} addInternalNote={addInternalNote} />}
      {invoiceOrder && <InvoiceModal order={invoiceOrder} settings={settings} onClose={() => setInvoiceOrderId(null)} />}
    </AdminShell>
  );
}

function OrderDetailModal({ order, settings, onClose, updateOrder, addInternalNote }) {
  const [note, setNote] = useState('');
  return (
    <Modal title={`Order ${order.id}`} onClose={onClose} wide footer={<div className="flex flex-wrap gap-2"><Button onClick={() => { addInternalNote(order.id, note); setNote(''); }}>Save Note</Button><Button variant="outline" onClick={() => window.print()}>Print</Button></div>}>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <DetailGrid items={[
            ['Customer', order.customer?.name], ['Email', order.customer?.email], ['Phone', order.customer?.phone], ['City', order.customer?.city], ['Address', order.customer?.address], ['Payment', `${order.paymentMethod} · ${order.paymentStatus || (order.paid ? 'paid' : 'unpaid')}`]
          ]} />
          <Card className="p-5">
            <SectionTitle title="Order Items" />
            <div className="space-y-3">{order.items.map((item, index) => <div key={`${item.productId}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2 p-3"><div className="flex items-center gap-3"><div className="h-12 w-12 rounded-xl product-image" style={{ backgroundImage: `url(${item.image})` }} /><div><p className="font-bold text-white">{item.name}</p><p className="text-xs text-[#8A7A98]">Qty {item.qty} × {money(item.price, settings.currency)}</p></div></div><strong className="text-gold">{money(item.qty * item.price, settings.currency)}</strong></div>)}</div>
          </Card>
          <Card className="p-5">
            <SectionTitle title="Admin Notes" />
            <textarea className="field" rows="3" placeholder="Add fulfilment note, customer call result or delivery instruction" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="mt-4 space-y-2">{(order.notesLog || []).map((n) => <div key={n.id} className="rounded-xl bg-surface-2 p-3"><p className="text-sm text-white">{n.text}</p><p className="text-xs text-[#8A7A98]">{new Date(n.date).toLocaleString()}</p></div>)}</div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-5">
            <SectionTitle title="Fulfilment" />
            <SelectField label="Order Status" value={order.status} onChange={(e) => updateOrder(order.id, { status: e.target.value })}>{statuses.map((s) => <option key={s}>{s}</option>)}</SelectField>
            <div className="mt-3"><SelectField label="Payment Status" value={order.paymentStatus || (order.paid ? 'paid' : 'unpaid')} onChange={(e) => updateOrder(order.id, { paymentStatus: e.target.value })}>{paymentStatuses.map((s) => <option key={s}>{s}</option>)}</SelectField></div>
            <div className="mt-3"><Field label="Courier" value={order.courier || ''} onChange={(e) => updateOrder(order.id, { courier: e.target.value })} /></div>
            <div className="mt-3"><Field label="Tracking Code" value={order.trackingCode || ''} onChange={(e) => updateOrder(order.id, { trackingCode: e.target.value })} /></div>
          </Card>
          <Card className="p-5"><SectionTitle title="Timeline" /><Timeline steps={orderSteps} current={order.status} /></Card>
          <Card className="p-5"><SectionTitle title="Totals" /><div className="space-y-2 text-sm"><div className="flex justify-between"><span>Subtotal</span><b>{money(order.subtotal, settings.currency)}</b></div><div className="flex justify-between"><span>Discount</span><b>-{money(order.discount, settings.currency)}</b></div><div className="flex justify-between"><span>Delivery</span><b>{money(order.shipping || order.deliveryFee, settings.currency)}</b></div><div className="flex justify-between"><span>Tax</span><b>{money(order.tax, settings.currency)}</b></div><div className="flex justify-between border-t border-gold/10 pt-2 text-lg"><span>Total</span><b className="text-gold">{money(order.total, settings.currency)}</b></div></div></Card>
        </div>
      </div>
    </Modal>
  );
}

function InvoiceModal({ order, settings, onClose }) {
  return (
    <Modal title={`Invoice ${order.id}`} onClose={onClose} wide footer={<Button onClick={() => window.print()}>Print Invoice</Button>}>
      <div className="rounded-3xl bg-white p-8 text-ink">
        <div className="flex flex-wrap justify-between gap-6 border-b pb-6"><div><h2 className="font-display text-3xl font-bold">GLOWOUT GH</h2><p>Perfumes · Skincare · Wigs</p></div><div className="text-right"><p className="text-2xl font-bold">INVOICE</p><p>{order.id}</p><p>{new Date(order.createdAt).toLocaleDateString()}</p></div></div>
        <div className="grid gap-6 py-6 md:grid-cols-2"><div><h3 className="font-bold">Bill To</h3><p>{order.customer?.name}</p><p>{order.customer?.email}</p><p>{order.customer?.phone}</p><p>{order.customer?.address}</p></div><div><h3 className="font-bold">Payment & Delivery</h3><p>{order.paymentMethod} · {order.paymentStatus || (order.paid ? 'paid' : 'unpaid')}</p><p>{order.deliveryMethod}</p><p>{order.courier || 'Courier pending'} {order.trackingCode ? `· ${order.trackingCode}` : ''}</p></div></div>
        <table className="w-full border-collapse text-sm"><thead><tr className="border-b"><th className="py-3 text-left">Item</th><th>Qty</th><th>Price</th><th className="text-right">Total</th></tr></thead><tbody>{order.items.map((item, index) => <tr key={index} className="border-b"><td className="py-3">{item.name}</td><td className="text-center">{item.qty}</td><td className="text-center">{money(item.price, settings.currency)}</td><td className="text-right">{money(item.qty * item.price, settings.currency)}</td></tr>)}</tbody></table>
        <div className="ml-auto mt-6 max-w-sm space-y-2"><div className="flex justify-between"><span>Subtotal</span><b>{money(order.subtotal, settings.currency)}</b></div><div className="flex justify-between"><span>Discount</span><b>-{money(order.discount, settings.currency)}</b></div><div className="flex justify-between"><span>Delivery</span><b>{money(order.shipping || order.deliveryFee, settings.currency)}</b></div><div className="flex justify-between"><span>Tax</span><b>{money(order.tax, settings.currency)}</b></div><div className="flex justify-between border-t pt-3 text-xl"><span>Total</span><b>{money(order.total, settings.currency)}</b></div></div>
      </div>
    </Modal>
  );
}
