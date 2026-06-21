import { useMemo, useState } from 'react';
import { Badge, Button, Card, Field, SelectField, StatCard } from '../../components/Common';
import { useStore } from '../../context/StoreContext';
import { downloadFile, money, safeNumber, toCSV } from '../../utils/helpers';
import { Action, AdminShell, ConfirmButton, DetailGrid, Modal, SectionTitle, Timeline, Toolbar } from './_AdminShared.jsx';

const returnStatuses = ['requested', 'reviewing', 'approved', 'item-received', 'refunded', 'declined', 'closed'];
const returnSteps = [
  { key: 'requested', label: 'Requested', desc: 'Customer has submitted the return request.' },
  { key: 'reviewing', label: 'Reviewing', desc: 'Admin is checking eligibility and order details.' },
  { key: 'approved', label: 'Approved', desc: 'Return request accepted by admin.' },
  { key: 'item-received', label: 'Item Received', desc: 'Returned item received and checked.' },
  { key: 'refunded', label: 'Refunded', desc: 'Refund or exchange completed.' },
  { key: 'closed', label: 'Closed', desc: 'Return case completed.' }
];

export function ReturnsManager({ view, navigate }) {
  const { returns, upsertReturn, deleteReturn, orders, products, upsertProduct, settings } = useStore();
  const blank = { orderId: '', customer: '', reason: '', status: 'requested', refundAmount: 0, notes: '', action: 'refund', restock: false };
  const [draft, setDraft] = useState(blank);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [activeId, setActiveId] = useState(null);
  const activeReturn = returns.find((ret) => ret.id === activeId);

  const filtered = useMemo(() => returns
    .filter((ret) => status === 'all' || ret.status === status)
    .filter((ret) => `${ret.id} ${ret.orderId} ${ret.customer} ${ret.reason}`.toLowerCase().includes(query.toLowerCase())), [returns, status, query]);

  const stats = {
    total: returns.length,
    open: returns.filter((ret) => ['requested', 'reviewing', 'approved', 'item-received'].includes(ret.status)).length,
    refunded: returns.filter((ret) => ret.status === 'refunded').length,
    refundAmount: returns.filter((ret) => ['approved', 'refunded'].includes(ret.status)).reduce((sum, ret) => sum + safeNumber(ret.refundAmount), 0)
  };

  function save(e) {
    e.preventDefault();
    if (!draft.customer && draft.orderId) {
      const order = orders.find((item) => item.id === draft.orderId);
      upsertReturn({ ...draft, customer: order?.customer?.name || '' });
    } else {
      upsertReturn(draft);
    }
    setDraft(blank);
  }

  function advanceReturn(ret, nextStatus) {
    upsertReturn({ ...ret, status: nextStatus, updatedAt: new Date().toISOString() });
  }

  function restockOrderItems(ret) {
    const order = orders.find((item) => item.id === ret.orderId);
    if (!order) return alert('No linked order found for restock.');
    order.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) upsertProduct({ ...product, stock: safeNumber(product.stock) + safeNumber(item.qty) });
    });
    upsertReturn({ ...ret, restocked: true, notes: `${ret.notes || ''}\nRestocked linked order items.`.trim() });
  }

  function exportCSV() {
    downloadFile('glowoutgh-returns.csv', toCSV(filtered.map((r) => ({ id: r.id, orderId: r.orderId, customer: r.customer, reason: r.reason, status: r.status, refundAmount: r.refundAmount, action: r.action }))), 'text/csv');
  }

  return (
    <AdminShell view={view} navigate={navigate} title="Returns Manager">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Returns" value={stats.total} />
        <StatCard label="Open" value={stats.open} />
        <StatCard label="Refunded" value={stats.refunded} />
        <StatCard label="Refund Exposure" value={money(stats.refundAmount, settings.currency)} />
      </div>

      <Toolbar>
        <Field label="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
        <SelectField label="Status" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All</option>{returnStatuses.map((s) => <option key={s}>{s}</option>)}</SelectField>
        <Button variant="outline" onClick={() => downloadFile('glowoutgh-returns.json', JSON.stringify(filtered, null, 2))}>Export JSON</Button>
        <Button variant="ghost" onClick={exportCSV}>Export CSV</Button>
      </Toolbar>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card className="p-5">
          <h2 className="font-display text-2xl font-bold">{draft.id ? 'Edit Return' : 'Create Return'}</h2>
          <form onSubmit={save} className="mt-5 space-y-4">
            <SelectField label="Linked Order" value={draft.orderId} onChange={(e) => { const order = orders.find((x) => x.id === e.target.value); setDraft({ ...draft, orderId: e.target.value, customer: order?.customer?.name || draft.customer, refundAmount: order?.total || draft.refundAmount }); }}><option value="">Manual return</option>{orders.map((o) => <option key={o.id} value={o.id}>{o.id} · {o.customer?.name}</option>)}</SelectField>
            <Field label="Customer" value={draft.customer} onChange={(e) => setDraft({ ...draft, customer: e.target.value })} />
            <Field label="Reason" value={draft.reason} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} />
            <div className="grid grid-cols-2 gap-3"><Field label="Refund Amount" type="number" value={draft.refundAmount} onChange={(e) => setDraft({ ...draft, refundAmount: safeNumber(e.target.value) })} /><SelectField label="Action" value={draft.action || 'refund'} onChange={(e) => setDraft({ ...draft, action: e.target.value })}><option value="refund">Refund</option><option value="exchange">Exchange</option><option value="store-credit">Store Credit</option><option value="decline">Decline</option></SelectField></div>
            <SelectField label="Status" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>{returnStatuses.map((s) => <option key={s}>{s}</option>)}</SelectField>
            <Field label="Notes" as="textarea" rows="4" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
            <label className="flex gap-2 text-sm text-[#C8BAD0]"><input type="checkbox" checked={!!draft.restock} onChange={(e) => setDraft({ ...draft, restock: e.target.checked })} /> Restock item after approval</label>
            <div className="flex gap-2"><Button type="submit">Save Return</Button><Button type="button" variant="ghost" onClick={() => setDraft(blank)}>Clear</Button></div>
          </form>
        </Card>

        <Card className="overflow-x-auto p-0">
          <table className="admin-table">
            <thead><tr><th>Return</th><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{filtered.map((ret) => <tr key={ret.id}>
              <td><p className="font-bold text-white">{ret.id}</p><p className="text-xs text-[#8A7A98]">{ret.reason}</p></td>
              <td>{ret.orderId || 'Manual'}</td>
              <td>{ret.customer}</td>
              <td>{money(ret.refundAmount, settings.currency)}</td>
              <td><select className="field py-2" value={ret.status} onChange={(e) => advanceReturn(ret, e.target.value)}>{returnStatuses.map((s) => <option key={s}>{s}</option>)}</select></td>
              <td><div className="flex flex-wrap gap-2"><Action onClick={() => setActiveId(ret.id)}>Review</Action><Action onClick={() => setDraft(ret)}>Edit</Action><ConfirmButton message="Delete return request?" onConfirm={() => deleteReturn(ret.id)}>Delete</ConfirmButton></div></td>
            </tr>)}</tbody>
          </table>
        </Card>
      </div>

      {activeReturn && <Modal title={`Return ${activeReturn.id}`} onClose={() => setActiveId(null)} wide>
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <DetailGrid items={[
              ['Order', activeReturn.orderId || 'Manual'], ['Customer', activeReturn.customer], ['Reason', activeReturn.reason], ['Action', activeReturn.action || 'refund'], ['Refund Amount', money(activeReturn.refundAmount, settings.currency)], ['Restocked', activeReturn.restocked ? 'Yes' : 'No']
            ]} />
            <Card className="p-5"><SectionTitle title="Review Notes" /><Field label="Admin Notes" as="textarea" rows="5" value={activeReturn.notes || ''} onChange={(e) => upsertReturn({ ...activeReturn, notes: e.target.value })} /></Card>
          </div>
          <div className="space-y-6">
            <Card className="p-5"><SectionTitle title="Approval Workflow" /><Timeline steps={returnSteps} current={activeReturn.status} /><div className="mt-5 flex flex-wrap gap-2"><Button onClick={() => advanceReturn(activeReturn, 'reviewing')}>Reviewing</Button><Button variant="outline" onClick={() => advanceReturn(activeReturn, 'approved')}>Approve</Button><Button variant="outline" onClick={() => advanceReturn(activeReturn, 'item-received')}>Item Received</Button><Button variant="outline" onClick={() => advanceReturn(activeReturn, 'refunded')}>Refunded</Button><Button variant="danger" onClick={() => advanceReturn(activeReturn, 'declined')}>Decline</Button></div></Card>
            <Card className="p-5"><SectionTitle title="Stock & Finance Actions" /><div className="space-y-3"><Button variant="outline" onClick={() => restockOrderItems(activeReturn)} disabled={activeReturn.restocked}>Restock Linked Items</Button><Button variant="ghost" onClick={() => advanceReturn(activeReturn, 'closed')}>Close Case</Button></div></Card>
          </div>
        </div>
      </Modal>}
    </AdminShell>
  );
}
