import { useMemo, useState } from 'react';
import { Badge, Button, Card, Field, SelectField, StatCard } from '../../components/Common';
import { useStore } from '../../context/StoreContext';
import { downloadFile, money, safeNumber, toCSV, todayISO, uid } from '../../utils/helpers';
import { Action, AdminShell, ConfirmButton, DetailGrid, Modal, SectionTitle, Toolbar } from './_AdminShared.jsx';

const segmentOptions = ['all', 'vip', 'blocked', 'high-spend', 'repeat', 'new'];

export function CustomersManager({ view, navigate }) {
  const { customers, orders, returns, upsertCustomer, deleteCustomer, settings } = useStore();
  const [query, setQuery] = useState('');
  const [segment, setSegment] = useState('all');
  const [activeId, setActiveId] = useState(null);
  const [draftNote, setDraftNote] = useState('');
  const activeCustomer = customers.find((customer) => customer.id === activeId);

  const customerOrders = (customer) => orders.filter((order) => order.customer?.email?.toLowerCase() === customer.email?.toLowerCase());
  const customerReturns = (customer) => returns.filter((ret) => ret.customer === customer.name || customerOrders(customer).some((order) => order.id === ret.orderId));

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return customers
      .filter((c) => `${c.name} ${c.email} ${c.phone} ${c.city}`.toLowerCase().includes(q))
      .filter((c) => {
        if (segment === 'vip') return c.vip;
        if (segment === 'blocked') return c.blocked;
        if (segment === 'high-spend') return safeNumber(c.spend) >= 1000;
        if (segment === 'repeat') return safeNumber(c.orders) >= 2;
        if (segment === 'new') return safeNumber(c.orders) <= 1;
        return true;
      });
  }, [customers, query, segment]);

  const vipCount = customers.filter((c) => c.vip).length;
  const blockedCount = customers.filter((c) => c.blocked).length;
  const totalSpend = customers.reduce((sum, c) => sum + safeNumber(c.spend), 0);

  function toggleFlag(customer, field) {
    upsertCustomer({ ...customer, [field]: !customer[field] });
  }

  function saveNote(customer, text) {
    if (!text.trim()) return;
    const notes = customer.notes || [];
    upsertCustomer({ ...customer, notes: [{ id: uid('cust-note'), text: text.trim(), createdAt: new Date().toISOString() }, ...notes] });
    setDraftNote('');
  }

  function exportCSV() {
    downloadFile('glowoutgh-customers.csv', toCSV(filtered.map((c) => ({ name: c.name, email: c.email, phone: c.phone, city: c.city, vip: c.vip, blocked: c.blocked, orders: c.orders, spend: c.spend }))), 'text/csv');
  }

  return (
    <AdminShell view={view} navigate={navigate} title="Customers Manager">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Customers" value={customers.length} />
        <StatCard label="VIP" value={vipCount} />
        <StatCard label="Blocked" value={blockedCount} />
        <StatCard label="Customer Spend" value={money(totalSpend, settings.currency)} />
      </div>

      <Toolbar>
        <Field label="Search Customers" value={query} onChange={(e) => setQuery(e.target.value)} />
        <SelectField label="Segment" value={segment} onChange={(e) => setSegment(e.target.value)}>{segmentOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}</SelectField>
        <Button variant="outline" onClick={() => downloadFile('glowoutgh-customers.json', JSON.stringify(filtered, null, 2))}>Export JSON</Button>
        <Button variant="ghost" onClick={exportCSV}>Export CSV</Button>
      </Toolbar>

      <Card className="overflow-x-auto p-0">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Contact</th><th>Orders</th><th>Spend</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map((c) => <tr key={c.id}>
            <td><p className="font-bold text-white">{c.name}</p><p className="text-xs text-[#8A7A98]">{c.city || 'No city'}</p></td>
            <td>{c.email}<p className="text-xs text-[#8A7A98]">{c.phone || 'No phone'}</p></td>
            <td>{safeNumber(c.orders)}</td>
            <td>{money(c.spend, settings.currency)}</td>
            <td><div className="flex flex-wrap gap-2">{c.vip && <Badge status="active">VIP</Badge>}{c.blocked && <Badge status="blocked">Blocked</Badge>}{!c.vip && !c.blocked && <Badge status="active">Normal</Badge>}</div></td>
            <td><div className="flex flex-wrap gap-2"><Action onClick={() => setActiveId(c.id)}>Profile</Action><Action onClick={() => toggleFlag(c, 'vip')}>{c.vip ? 'Remove VIP' : 'Make VIP'}</Action><Action onClick={() => toggleFlag(c, 'blocked')}>{c.blocked ? 'Unblock' : 'Block'}</Action><ConfirmButton message="Delete customer?" onConfirm={() => deleteCustomer(c.id)}>Delete</ConfirmButton></div></td>
          </tr>)}</tbody>
        </table>
      </Card>

      {activeCustomer && <Modal title={`Customer Profile · ${activeCustomer.name}`} onClose={() => setActiveId(null)} wide>
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <DetailGrid items={[
              ['Name', activeCustomer.name], ['Email', activeCustomer.email], ['Phone', activeCustomer.phone], ['City', activeCustomer.city], ['VIP', activeCustomer.vip ? 'Yes' : 'No'], ['Blocked', activeCustomer.blocked ? 'Yes' : 'No']
            ]} />
            <Card className="p-5">
              <SectionTitle title="Order History" />
              {customerOrders(activeCustomer).length ? <div className="space-y-3">{customerOrders(activeCustomer).map((order) => <button key={order.id} onClick={() => navigate('admin.orders', { order: order.id })} className="flex w-full justify-between rounded-2xl bg-surface-2 p-3 text-left"><span><b className="text-white">{order.id}</b><p className="text-xs text-[#8A7A98]">{new Date(order.createdAt).toLocaleDateString()} · {order.status}</p></span><span className="font-bold text-gold">{money(order.total, settings.currency)}</span></button>)}</div> : <p className="text-sm text-[#8A7A98]">No orders yet.</p>}
            </Card>
            <Card className="p-5">
              <SectionTitle title="Return Requests" />
              {customerReturns(activeCustomer).length ? <div className="space-y-3">{customerReturns(activeCustomer).map((ret) => <div key={ret.id} className="rounded-2xl bg-surface-2 p-3"><p className="font-bold text-white">{ret.id} · {ret.orderId}</p><p className="text-sm text-[#8A7A98]">{ret.reason}</p><Badge status={ret.status}>{ret.status}</Badge></div>)}</div> : <p className="text-sm text-[#8A7A98]">No return requests.</p>}
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="p-5"><SectionTitle title="Customer Summary" /><div className="space-y-3 text-sm"><div className="flex justify-between"><span>Orders</span><b>{safeNumber(activeCustomer.orders)}</b></div><div className="flex justify-between"><span>Total spend</span><b>{money(activeCustomer.spend, settings.currency)}</b></div><div className="flex justify-between"><span>Average order</span><b>{money(safeNumber(activeCustomer.orders) ? safeNumber(activeCustomer.spend) / safeNumber(activeCustomer.orders) : 0, settings.currency)}</b></div><div className="flex justify-between"><span>Joined</span><b>{activeCustomer.joinedAt || todayISO()}</b></div></div></Card>
            <Card className="p-5"><SectionTitle title="Admin Notes" /><textarea className="field" rows="3" value={draftNote} onChange={(e) => setDraftNote(e.target.value)} placeholder="Add customer service note" /><Button className="mt-3" onClick={() => saveNote(activeCustomer, draftNote)}>Save Note</Button><div className="mt-4 space-y-2">{(activeCustomer.notes || []).map((note) => <div key={note.id} className="rounded-xl bg-surface-2 p-3"><p className="text-sm text-white">{note.text}</p><p className="text-xs text-[#8A7A98]">{new Date(note.createdAt).toLocaleString()}</p></div>)}</div></Card>
          </div>
        </div>
      </Modal>}
    </AdminShell>
  );
}
